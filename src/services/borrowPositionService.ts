import { fetchUserPositions, PonderPosition } from './positionService';

type BorrowingMarketData = {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  borrowRatePercent: string;
  supplyRatePercent: string;
  collateralFactorPercent: string;
  liquidationThresholdPercent: string | null;
  utilizationPercent: string;
};

type BorrowingPositionData = {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  borrowRatePercent: string;
  supplyRatePercent: string;
  collateralFactorPercent: string;
  liquidationThresholdPercent: string | null;
  utilizationPercent: string;
  amount: string;
  usdValue: number;
  interestUsd: number | null;
  loan?: {
    borrowAmount: string;
    borrowUsdRay: string;
    borrowAprRay: string;
    borrowApyRay: string;
    repaidAmount: string;
    status: string;
    estimatedInterestUsd: number;
    durationSeconds: number | null;
  } | null;
};

export const fetchBorrowingMarketsFromPositions = async (
  account: string,
  chain?: string,
  positions?: PonderPosition[] // Allow passing existing positions to avoid redundant API calls
): Promise<BorrowingMarketData[]> => {
  try {
    const positionsData = positions || await fetchUserPositions(account, chain);
    const markets = new Map<string, BorrowingMarketData>();

    positionsData.forEach(position => {
      position.entries.forEach(entry => {
        if (entry.type === 'supply_collateral' && entry.market && entry.token) {
          const key = `${entry.tokenId}`;

          if (!markets.has(key)) {
            markets.set(key, {
              tokenId: entry.tokenId,
              symbol: entry.token.symbol,
              name: entry.token.name,
              decimals: entry.token.decimals,
              borrowRatePercent: entry.market.borrowRatePercent,
              supplyRatePercent: entry.market.supplyRatePercent,
              collateralFactorPercent: entry.token.collateralFactorPercent,
              liquidationThresholdPercent: entry.token.liquidationThresholdPercent,
              utilizationPercent: entry.market.utilizationPercent,
            });
          }
        }
      });
    });

    return Array.from(markets.values());
  } catch (error) {
    console.error('Error fetching borrowing markets from positions:', error);
    return [];
  }
};

export const fetchBorrowingPositionsFromPositions = async (
  account: string,
  chain?: string,
  positions?: PonderPosition[] // Allow passing existing positions to avoid redundant API calls
): Promise<BorrowingPositionData[]> => {
  try {
    const positionsData = positions || await fetchUserPositions(account, chain);
    const borrowingPositions: BorrowingPositionData[] = [];

    positionsData.forEach(position => {
      position.entries.forEach(entry => {
        if (entry.type === 'borrow' && entry.market && entry.token) {
          borrowingPositions.push({
            tokenId: entry.tokenId,
            symbol: entry.token.symbol,
            name: entry.token.name,
            decimals: entry.token.decimals,
            borrowRatePercent: entry.market.borrowRatePercent,
            supplyRatePercent: entry.market.supplyRatePercent,
            collateralFactorPercent: entry.token.collateralFactorPercent,
            liquidationThresholdPercent: entry.token.liquidationThresholdPercent,
            utilizationPercent: entry.market.utilizationPercent,
            amount: entry.amount,
            usdValue: entry.usdValue,
            interestUsd: entry.interestUsd,
            loan: entry.loan
              ? {
                  borrowAmount: entry.loan.borrowAmount,
                  borrowUsdRay: entry.loan.borrowUsdRay,
                  borrowAprRay: entry.loan.borrowAprRay,
                  borrowApyRay: entry.loan.borrowApyRay,
                  repaidAmount: entry.loan.repaidAmount,
                  status: entry.loan.status,
                  estimatedInterestUsd: entry.loan.estimatedInterestUsd,
                  durationSeconds: entry.loan.durationSeconds,
                }
              : null,
          });
        }
      });
    });

    return borrowingPositions;
  } catch (error) {
    console.error('Error fetching borrowing positions from positions:', error);
    return [];
  }
};

export const getBorrowingMarketByToken = (
  markets: BorrowingMarketData[],
  tokenSymbol: string
): BorrowingMarketData | null => {
  return markets.find(market => market.symbol.toLowerCase() === tokenSymbol.toLowerCase()) || null;
};

export const getBorrowingPositionByToken = (
  positions: BorrowingPositionData[],
  tokenSymbol: string
): BorrowingPositionData | null => {
  return positions.find(position => position.symbol.toLowerCase() === tokenSymbol.toLowerCase()) || null;
};
