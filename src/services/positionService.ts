type PonderMarket = {
  id: string;
  tokenId: string;
  borrowRateRay: string;
  borrowRatePercent: string;
  supplyRateRay: string;
  supplyRatePercent: string;
  utilizationRay: string;
  utilizationPercent: string;
  reserveFactorBps: number;
};

type PonderToken = {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  liquidationThresholdBps: number | null;
  liquidationThresholdPercent: string | null;
};

type PonderLoan = {
  id: string;
  startTimestamp: string;
  startBlock: string;
  startTxHash: string;
  borrowAmount: string;
  borrowUsdRay: string;
  borrowAprRay: string;
  borrowApyRay: string;
  repaidAmount: string;
  repaidUsdRay: string;
  status: string;
  estimatedInterestUsdRay: string;
  durationSeconds: number | null;
  estimatedInterestUsd: number;
};

export type PonderPositionEntry = {
  type: 'supply_collateral' | 'supply_liquidity' | 'borrow';
  tokenId: string;
  marketId: string;
  amount: string;
  usdValue: number;
  usdValueRay: string;
  updatedAtTimestamp: number | null;
  updatedAtBlock: number | null;
  chainDst: number | null;
  interestUsd: number | null;
  interestUsdRay: string | null;
  market: PonderMarket | null;
  token: PonderToken | null;
  loan: PonderLoan | null;
};

type PonderRisk = {
  ltv: number;
  ltvRay: string;
  ltvPercent: string;
  collateralUsd: number;
  debtUsd: number;
  healthFactor: number;
  healthFactorRay: string;
};

export type PonderPosition = {
  id: string;
  chainId: string;
  collateralUsd: number;
  debtUsd: number;
  healthFactor: number;
  updatedAtTimestamp: number;
  entries: PonderPositionEntry[];
  risk: PonderRisk | null;
};

type ApiPositionsResponse = {
  data: PonderPosition[];
};

export const fetchUserPositions = async (account: string, chain?: string): Promise<PonderPosition[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const url = new URL('/api/positions', baseUrl);

    url.searchParams.set('account', account);
    if (chain) {
      url.searchParams.set('chain', chain);
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch positions: ${response.status}`);
    }

    const result: ApiPositionsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    throw error;
  }
};

export const extractSupplyLiquidityPositions = (positions: PonderPosition[]): PonderPositionEntry[] => {
  const supplyLiquidityEntries: PonderPositionEntry[] = [];

  positions.forEach(position => {
    position.entries.forEach(entry => {
      if (entry.type === 'supply_liquidity') {
        supplyLiquidityEntries.push(entry);
      }
    });
  });

  return supplyLiquidityEntries;
};

export const findUserPositionForToken = (
  positions: PonderPosition[],
  tokenAddress: string,
  chainId: number
): PonderPositionEntry | null => {
  const supplyLiquidityEntries = extractSupplyLiquidityPositions(positions);

  const foundEntry = supplyLiquidityEntries.find(entry => {
    const [entryChainId, entryAddress] = entry.tokenId.split(':');
    const matches = entryChainId === chainId.toString() && entryAddress.toLowerCase() === tokenAddress.toLowerCase();

    return matches;
  });

  return foundEntry || null;
};

export const formatPositionAmount = (amount: string, decimals: number): string => {
  try {
    const amountBigInt = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const wholePart = amountBigInt / divisor;
    const fractionalPart = amountBigInt % divisor;

    if (fractionalPart === 0n) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    if (trimmedFractional === '') {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedFractional}`;
  } catch (error) {
    return '0';
  }
};
