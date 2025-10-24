import { toUsd, rayToPercentString, bpsToPercent } from '@/utils/calculationUtils';

export const mapEntries = (entries?: any[]) => {
  if (!entries?.length) return [];

  return entries.map(entry => {
    const usdValue = toUsd(entry.usdValueRay);
    const interestUsd = entry.interestUsdRay ? toUsd(entry.interestUsdRay) : null;

    const market = entry.market
      ? {
          id: entry.market.id,
          tokenId: entry.market.tokenId,
          borrowRateRay: entry.market.borrowRateRay,
          borrowRatePercent: rayToPercentString(entry.market.borrowRateRay),
          supplyRateRay: entry.market.supplyRateRay,
          supplyRatePercent: rayToPercentString(entry.market.supplyRateRay),
          utilizationRay: entry.market.utilizationRay,
          utilizationPercent: rayToPercentString(entry.market.utilizationRay),
          reserveFactorBps: entry.market.reserveFactorBps,
        }
      : null;

    const token = entry.token
      ? {
          id: entry.token.id,
          symbol: entry.token.symbol,
          name: entry.token.name ?? entry.token.symbol,
          decimals: entry.token.decimals,
          collateralFactorBps: entry.token.collateralFactorBps,
          collateralFactorPercent: bpsToPercent(entry.token.collateralFactorBps),
          liquidationThresholdBps: entry.token.liquidationThresholdBps ?? null,
          liquidationThresholdPercent: bpsToPercent(entry.token.liquidationThresholdBps ?? null),
        }
      : null;

    const loan = entry.loan
      ? {
          ...entry.loan,
          durationSeconds: entry.loan.durationSeconds ?? null,
          estimatedInterestUsd: entry.loan.estimatedInterestUsdRay ? toUsd(entry.loan.estimatedInterestUsdRay) : null,
        }
      : null;

    return {
      type: entry.type,
      tokenId: entry.tokenId,
      marketId: entry.marketId,
      amount: entry.amount,
      usdValue,
      usdValueRay: entry.usdValueRay,
      updatedAtTimestamp: entry.updatedAtTimestamp ? Number(entry.updatedAtTimestamp) : null,
      updatedAtBlock: entry.updatedAtBlock ? Number(entry.updatedAtBlock) : null,
      chainDst: entry.chainDst ?? null,
      interestUsd,
      interestUsdRay: entry.interestUsdRay ?? null,
      market,
      token,
      loan,
    };
  });
};

export const mapRisk = (risk?: any) => {
  if (!risk) return null;
  const ltv = toUsd(risk.ltvRay);
  return {
    ltv,
    ltvRay: risk.ltvRay,
    ltvPercent: `${(ltv * 100).toFixed(2)}%`,
    maxLtvBps: risk.maxLtvBps,
    maxLtvPercent: bpsToPercent(risk.maxLtvBps),
    maxLiquidationBps: risk.maxLiquidationBps,
    maxLiquidationPercent: bpsToPercent(risk.maxLiquidationBps),
    collateralUsd: toUsd(risk.collateralUsdRay),
    debtUsd: toUsd(risk.debtUsdRay),
    healthFactor: toUsd(risk.healthFactorRay),
    healthFactorRay: risk.healthFactorRay,
  };
};

export const processPositionsData = (rawPositions: any[]) => {
  return rawPositions.map(position => ({
    id: position.id,
    chainId: position.chainId,
    collateralUsd: toUsd(position.collateralUsdRay),
    debtUsd: toUsd(position.debtUsdRay),
    healthFactor: toUsd(position.healthFactorRay),
    updatedAtTimestamp: Number(position.updatedAtTimestamp),
    entries: mapEntries(position.entries),
    risk: mapRisk(position.risk),
  }));
};
