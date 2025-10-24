import { useQuery } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { CONTRACTS } from '@/constants/contractsConstants';
import LendingPoolAbi from '@/abis/LendingPool.json';

export const useBorrowPoolData = (tokenAddress: string, chainId: number) => {
  return useQuery({
    queryKey: ['borrowPoolData', tokenAddress, chainId],
    enabled: Boolean(tokenAddress),
    queryFn: async () => {
      try {
        const proxy = (() => {
          if (chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
          if (chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
          return undefined;
        })();

        if (!proxy) return { totalBorrowAssets: '0', totalBorrowShares: '0' };

        const [totalBorrowAssets, totalBorrowShares] = await Promise.all([
          readContract(config, {
            abi: LendingPoolAbi as any,
            address: proxy,
            chainId: chainId as any,
            functionName: 'totalBorrowAssets',
            args: [tokenAddress as `0x${string}`],
          }),
          readContract(config, {
            abi: LendingPoolAbi as any,
            address: proxy,
            chainId: chainId as any,
            functionName: 'totalBorrowShares',
            args: [tokenAddress as `0x${string}`],
          }),
        ]);

        return {
          totalBorrowAssets: totalBorrowAssets?.toString() || '0',
          totalBorrowShares: totalBorrowShares?.toString() || '0',
        };
      } catch (error) {
        console.error('Error fetching borrow pool data:', error);
        return { totalBorrowAssets: '0', totalBorrowShares: '0' };
      }
    },
    staleTime: 30000,
    gcTime: 300000,
  });
};
