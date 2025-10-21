import { getBalance } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { useQuery } from '@tanstack/react-query';
import type { LendingMarket } from '@/types/lending';
import type { BorrowingMarket } from '@/types/borrowing';

type UseTokenBalancesArgs = {
  userAddress?: `0x${string}`;
  market: LendingMarket | BorrowingMarket | null;
};

export function useTokenBalances({ userAddress, market }: UseTokenBalancesArgs) {
  return useQuery({
    queryKey: ['tokenBalances', userAddress, market?.id],
    enabled: Boolean(userAddress && market),
    queryFn: async () => {
      if (!userAddress || !market) return {} as Record<string, string>;

      const results: Record<string, string> = {};

      await Promise.all(
        market.networks.map(async nw => {
          try {
            const res = await getBalance(config, {
              address: userAddress,
              chainId: nw.chainId as any,
              token: nw.address && nw.address !== '' ? (nw.address as `0x${string}`) : undefined,
              unit: 'ether',
            });
            results[nw.id] = res.formatted;
          } catch {
            results[nw.id] = '0';
          }
        })
      );

      return results;
    },
  });
}
