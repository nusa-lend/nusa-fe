import { useQuery } from '@tanstack/react-query';
import { fetchLendingMarkets } from '@/services/lendingService';
import { LendingMarket } from '@/types/lending';

export const useLendingMarkets = () => {
  return useQuery({
    queryKey: ['lendingMarkets'],
    queryFn: fetchLendingMarkets,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useLendingMarketsByNetwork = (networkId: string) => {
  return useQuery<LendingMarket[]>({
    queryKey: ['lendingMarkets', 'network', networkId],
    queryFn: async () => {
      const markets = await fetchLendingMarkets();
      return markets.filter(market => market.networks.some(network => network.id === networkId));
    },
    enabled: !!networkId,
    staleTime: 5 * 60 * 1000,
  });
};
