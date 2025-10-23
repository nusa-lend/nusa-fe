import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchUserPositions, findUserPositionForToken, formatPositionAmount } from '@/services/positionService';

export const useUserPositions = (chain?: string) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['userPositions', address],
    queryFn: () => fetchUserPositions(address!, undefined),
    enabled: !!address,
    staleTime: 30000,
    gcTime: 300000,
  });
};

export const useUserPositionForToken = (
  tokenAddress: string,
  chainId: number,
  chain?: string,
  decimals: number = 6
) => {
  const { data: positions, isLoading, error } = useUserPositions(chain);
  const position = positions ? findUserPositionForToken(positions, tokenAddress, chainId) : null;
  const formattedAmount = position ? formatPositionAmount(position.amount, decimals) : '0';

  return {
    position,
    isLoading,
    error,
    formattedAmount,
    usdValue: position?.usdValue || 0,
  };
};

export const useUserBorrowingPosition = (chain?: string) => {
  const { data: positions, isLoading, error } = useUserPositions(chain);
  const riskData = positions && positions.length > 0 ? (positions[0] as any).risk : null;

  return {
    riskData,
    isLoading,
    error,
    currentLtv: riskData?.ltvPercent || '0%',
    healthFactor: riskData?.healthFactor || 1,
    collateralUsd: riskData?.collateralUsd || 0,
    debtUsd: riskData?.debtUsd || 0,
  };
};
