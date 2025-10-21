import { useQuery } from '@tanstack/react-query';
import { fetchBorrowingMarkets } from '@/services/borrowingMarketService';
import { BorrowingMarket } from '@/types/borrowing';
import { transformBorrowingMarkets } from '@/utils/borrowingUtils';

export const useBorrowingMarkets = () => {
  return useQuery<BorrowingMarket[]>({
    queryKey: ['borrowingMarkets'],
    queryFn: async () => {
      const apiMarkets = await fetchBorrowingMarkets();
      return transformBorrowingMarkets(apiMarkets);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useBorrowingMarketsByNetwork = (networkId: string) => {
  return useQuery<BorrowingMarket[]>({
    queryKey: ['borrowingMarkets', 'network', networkId],
    queryFn: async () => {
      const apiMarkets = await fetchBorrowingMarkets();
      const transformedMarkets = transformBorrowingMarkets(apiMarkets);
      return transformedMarkets.filter(market => market.networks.some(network => network.id === networkId));
    },
    enabled: !!networkId,
    staleTime: 5 * 60 * 1000,
  });
};
