import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserPositions } from '../services/positionService';
import { calculatePortfolioSummary, transformToPortfolioCards, PortfolioCardData } from '../services/portfolioService';

export const useUserPortfolio = () => {
  const { address } = useAccount();
  const [portfolioData, setPortfolioData] = useState<PortfolioCardData[]>([
    { title: 'Lending', value: '$0.00', sub: '0%' },
    { title: 'Borrow', value: '$0.00', sub: '0%' },
    { title: 'Yield Earned', value: '$0.00' },
    { title: 'Active Position', value: '0' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!address) {
        setPortfolioData([
          { title: 'Lending', value: '$0.00', sub: '0%' },
          { title: 'Borrow', value: '$0.00', sub: '0%' },
          { title: 'Yield Earned', value: '$0.00' },
          { title: 'Active Position', value: '0' },
        ]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const positions = await fetchUserPositions(address);
        const summary = calculatePortfolioSummary(positions);
        const cards = transformToPortfolioCards(summary);
        setPortfolioData(cards);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [address]);

  return {
    portfolioData,
    isLoading,
    error,
  };
};
