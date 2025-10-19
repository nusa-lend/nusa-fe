import { useQuery } from '@tanstack/react-query';
import { fetchBorrowingMarkets } from '@/services/borrowingMarketService';
import { BorrowingMarket } from '@/types/borrowing';

export const useBorrowingMarkets = () => {
  return useQuery({
    queryKey: ['borrowingMarkets'],
    queryFn: fetchBorrowingMarkets,
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
      const markets = await fetchBorrowingMarkets();
      return markets.filter(market => market.networks.some(network => network.id === networkId));
    },
    enabled: !!networkId,
    staleTime: 5 * 60 * 1000,
  });
};
