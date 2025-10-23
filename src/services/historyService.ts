import { 
  toUsd, 
  formatPercent, 
  computeDurationSeconds, 
  computeInterestUsd 
} from '@/utils/calculationUtils';

export type HistoryLoanData = {
  id: string;
  positionId: string;
  chainId: string;
  borrowTokenId: string;
  borrowAmount: string;
  borrowUsd: number;
  borrowAprPercent: string;
  borrowApyPercent: string;
  collateralUsd: number;
  debtUsd: number;
  startTimestamp: number;
  endTimestamp: number | null;
  startBlock: number;
  endBlock: number | null;
  startTxHash: string;
  endTxHash: string | null;
  status: string;
  durationSeconds: number;
  estimatedInterestUsd: number;
  historyType: 'borrow';
  entryType: 'loan';
  action: string;
  usdValue: number;
  usdValueRay: string;
};

export type HistorySupplyData = {
  id: string;
  positionId: string;
  chainId: string;
  borrowTokenId: string;
  borrowAmount: string;
  borrowUsd: number;
  borrowAprPercent: string;
  borrowApyPercent: string;
  collateralUsd: number | null;
  debtUsd: number | null;
  startTimestamp: number;
  endTimestamp: number | null;
  startBlock: number;
  endBlock: number | null;
  startTxHash: string;
  endTxHash: string | null;
  status: string;
  durationSeconds: number;
  estimatedInterestUsd: number;
  historyType: 'supply';
  entryType: string;
  action: string;
  usdValue: number;
  usdValueRay: string;
};

export type HistoryData = HistoryLoanData | HistorySupplyData;

export const processLoanData = (loanItems: any[]): HistoryLoanData[] => {
  return loanItems.map((loan) => {
    const durationSeconds = computeDurationSeconds(loan.startTimestamp, loan.endTimestamp);
    const interestUsd = computeInterestUsd(loan);
    const usdValue = toUsd(loan.borrowUsdRay);
    const borrowAprPercent = formatPercent(loan.borrowAprRay);
    const borrowApyPercent = formatPercent(loan.borrowApyRay);
    const collateralUsd = toUsd(loan.collateralUsdRay);
    const debtUsd = toUsd(loan.debtUsdRay);
    const action = loan.status === 'closed' ? 'repay' : 'borrow';
    
    return {
      id: loan.id,
      positionId: loan.positionId,
      chainId: loan.chainId,
      borrowTokenId: loan.borrowTokenId,
      borrowAmount: loan.borrowAmount,
      borrowUsd: usdValue,
      borrowAprPercent,
      borrowApyPercent,
      collateralUsd,
      debtUsd,
      startTimestamp: Number(loan.startTimestamp),
      endTimestamp: loan.endTimestamp ? Number(loan.endTimestamp) : null,
      startBlock: Number(loan.startBlock),
      endBlock: loan.endBlock ? Number(loan.endBlock) : null,
      startTxHash: loan.startTxHash,
      endTxHash: loan.endTxHash ?? null,
      status: loan.status,
      durationSeconds,
      estimatedInterestUsd: interestUsd,
      historyType: 'borrow' as const,
      entryType: 'loan' as const,
      action,
      usdValue,
      usdValueRay: loan.borrowUsdRay,
    };
  });
};

export const processSupplyData = (supplyItems: any[], marketRates?: Map<string, { supplyRateRay: string; borrowRateRay: string }>): HistorySupplyData[] => {
  return supplyItems.map((event) => {
    const timestamp = Number(event.blockTimestamp);
    const usdValue = toUsd(event.usdValueRay);
    const entryType = typeof event.entryType === 'string' ? event.entryType.toLowerCase() : '';
    const rawAction = typeof event.action === 'string' ? event.action.toLowerCase() : '';
    const normalizedAction = rawAction === 'withdraw' ? 'withdraw' : 'supply';
    
    // Get market rates if available
    const market = marketRates?.get(event.marketId);
    const isLiquidity = entryType === 'liquidity';
    const aprPercent = market
      ? isLiquidity
        ? formatPercent(market.supplyRateRay)
        : formatPercent(market.borrowRateRay)
      : '0.00';
    const apyPercent = aprPercent;
    
    return {
      id: event.id,
      positionId: event.positionId,
      chainId: event.chainId,
      borrowTokenId: event.tokenId,
      borrowAmount: event.amount,
      borrowUsd: usdValue,
      borrowAprPercent: aprPercent,
      borrowApyPercent: apyPercent,
      collateralUsd: null as number | null,
      debtUsd: null as number | null,
      startTimestamp: timestamp,
      endTimestamp: null as number | null,
      startBlock: Number(event.blockNumber),
      endBlock: null as number | null,
      startTxHash: event.txHash,
      endTxHash: null as string | null,
      status: event.action,
      durationSeconds: 0,
      estimatedInterestUsd: 0,
      historyType: 'supply' as const,
      entryType: event.entryType,
      action: normalizedAction,
      usdValue,
      usdValueRay: event.usdValueRay,
    };
  });
};

export const processHistoryData = (
  loanItems: any[], 
  supplyItems: any[], 
  marketRates?: Map<string, { supplyRateRay: string; borrowRateRay: string }>
): HistoryData[] => {
  const loans = processLoanData(loanItems);
  const supplies = processSupplyData(supplyItems, marketRates);

  return [...loans, ...supplies].sort(
    (a, b) => (b.startTimestamp ?? 0) - (a.startTimestamp ?? 0)
  );
};
