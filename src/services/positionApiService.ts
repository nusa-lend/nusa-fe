export const fetchPositionsFromPonder = async (account: string, chain?: string) => {
  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const ponderUrl = new URL('/positions', ponderBaseUrl);

  ponderUrl.searchParams.set('account', account);
  if (chain) {
    ponderUrl.searchParams.set('chain', chain);
  }

  const response = await fetch(ponderUrl.toString(), {
    cache: 'force-cache',
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch positions: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data: Array<{
      id: string;
      chainId: string;
      collateralUsdRay: string;
      debtUsdRay: string;
      healthFactorRay: string;
      updatedAtTimestamp: string;
      entries?: Array<{
        type: 'supply_collateral' | 'supply_liquidity' | 'borrow';
        tokenId: string;
        marketId: string;
        amount: string;
        usdValueRay: string;
        updatedAtTimestamp?: string;
        updatedAtBlock?: string;
        chainDst?: number | null;
        market?: {
          id: string;
          tokenId: string;
          borrowRateRay: string;
          supplyRateRay: string;
          utilizationRay: string;
          reserveFactorBps: number;
        } | null;
        token?: {
          id: string;
          symbol: string;
          name?: string | null;
          decimals: number;
          collateralFactorBps: number;
          liquidationThresholdBps?: number | null;
        } | null;
        interestUsdRay?: string | null;
        loan?: {
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
          estimatedInterestUsdRay?: string | null;
          durationSeconds?: number | null;
        } | null;
      }>;
      risk?: {
        ltvRay: string;
        maxLtvBps: number;
        maxLiquidationBps: number;
        collateralUsdRay: string;
        debtUsdRay: string;
        healthFactorRay: string;
      } | null;
    }>;
  };

  return payload.data || [];
};
