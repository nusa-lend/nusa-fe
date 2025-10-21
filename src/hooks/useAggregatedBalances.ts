import { useQuery } from '@tanstack/react-query';
import { getBalance } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { useAccount } from 'wagmi';
import type { LendingMarket } from '@/types/lending';
import type { BorrowingMarket } from '@/types/borrowing';

export function useAggregatedBalances(markets: LendingMarket[] | BorrowingMarket[]) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['aggregatedBalances', address, markets.map(m => m.id).join(',')],
    enabled: Boolean(address && markets.length > 0),
    queryFn: async () => {
      if (!address || markets.length === 0) return {} as Record<string, string>;

      const results: Record<string, string> = {};

      await Promise.all(
        markets.map(async (market) => {
          try {
            let totalBalance = 0;
            
            await Promise.all(
              market.networks.map(async (network) => {
                try {
                  const balance = await getBalance(config, {
                    address,
                    chainId: network.chainId as any,
                    token: network.address && network.address !== '' ? (network.address as `0x${string}`) : undefined,
                    unit: 'ether',
                  });
                  totalBalance += parseFloat(balance.formatted);
                } catch {
                }
              })
            );

            results[market.id] = totalBalance.toString();
          } catch {
            results[market.id] = '0';
          }
        })
      );

      return results;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
