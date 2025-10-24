import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { CONTRACTS } from '@/constants/contractsConstants';
import LendingPoolAbi from '@/abis/LendingPool.json';

export const useUserBorrowShares = (tokenAddress: string, chainId: number) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['userBorrowShares', address, tokenAddress, chainId],
    enabled: Boolean(address && tokenAddress),
    queryFn: async () => {
      if (!address) return '0';

      try {
        const proxy = (() => {
          if (chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
          if (chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
          return undefined;
        })();

        if (!proxy) return '0';

        const shares = await readContract(config, {
          abi: LendingPoolAbi as any,
          address: proxy,
          chainId: chainId as any,
          functionName: 'userBorrowShares',
          args: [address, BigInt(chainId), tokenAddress as `0x${string}`],
        });

        return shares?.toString() || '0';
      } catch (error) {
        console.error('Error fetching user borrow shares:', error);
        return '0';
      }
    },
    staleTime: 30000,
    gcTime: 300000,
  });
};
