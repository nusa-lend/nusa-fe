import { PonderPosition, PonderPositionEntry } from './positionService';

export interface PortfolioCardData {
  title: string;
  value: string;
  sub?: string;
}

export interface PortfolioSummary {
  lending: {
    totalValue: number;
    averageApy: number;
  };
  borrowing: {
    totalValue: number;
    averageApy: number;
  };
  yieldEarned: number;
  activePositions: number;
}

export const calculatePortfolioSummary = (positions: PonderPosition[]): PortfolioSummary => {
  let totalLendingValue = 0;
  let totalBorrowingValue = 0;
  let totalLendingApy = 0;
  let totalBorrowingApy = 0;
  let lendingCount = 0;
  let borrowingCount = 0;
  let totalYieldEarned = 0;
  let activePositions = 0;

  positions.forEach(position => {
    if (position.entries.length > 0) {
      activePositions++;
    }

    position.entries.forEach((entry: PonderPositionEntry) => {
      if (entry.type === 'supply_liquidity') {
        totalLendingValue += entry.usdValue;
        if (entry.market?.supplyRatePercent) {
          const apy = parseFloat(entry.market.supplyRatePercent.replace('%', ''));
          totalLendingApy += apy;
          lendingCount++;
        }
      } else if (entry.type === 'borrow') {
        totalBorrowingValue += entry.usdValue;
        if (entry.market?.borrowRatePercent) {
          const apy = parseFloat(entry.market.borrowRatePercent.replace('%', ''));
          totalBorrowingApy += apy;
          borrowingCount++;
        }
        if (entry.interestUsd) {
          totalYieldEarned += entry.interestUsd;
        }
      }
    });
  });

  const averageLendingApy = lendingCount > 0 ? totalLendingApy / lendingCount : 0;
  const averageBorrowingApy = borrowingCount > 0 ? totalBorrowingApy / borrowingCount : 0;

  return {
    lending: {
      totalValue: totalLendingValue,
      averageApy: averageLendingApy,
    },
    borrowing: {
      totalValue: totalBorrowingValue,
      averageApy: averageBorrowingApy,
    },
    yieldEarned: totalYieldEarned,
    activePositions,
  };
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else if (value >= 1) {
    return `$${value.toFixed(2)}`;
  } else {
    return `$${value.toFixed(4)}`;
  }
};

export const transformToPortfolioCards = (summary: PortfolioSummary): PortfolioCardData[] => {
  return [
    {
      title: 'Lending',
      value: formatCurrency(summary.lending.totalValue),
      sub: `${summary.lending.averageApy.toFixed(2)}%`,
    },
    {
      title: 'Borrow',
      value: formatCurrency(summary.borrowing.totalValue),
      sub: `${summary.borrowing.averageApy.toFixed(2)}%`,
    },
    {
      title: 'Yield Earned',
      value: formatCurrency(summary.yieldEarned),
    },
    {
      title: 'Active Position',
      value: summary.activePositions.toString(),
    },
  ];
};
