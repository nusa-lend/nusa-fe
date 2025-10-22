import { NextResponse } from 'next/server';

const RAY = 10n ** 27n;

const rayToNumber = (ray: bigint) => Number(ray) / Number(RAY);

const toRatioOrUsd = (valueRay: string) => {
  try {
    return rayToNumber(BigInt(valueRay));
  } catch {
    return 0;
  }
};

const toUsd = toRatioOrUsd;

const rayToPercentString = (value: string) => {
  try {
    const ray = BigInt(value);
    const hundredthPercents = (ray * 10000n) / RAY;
    const integerPart = hundredthPercents / 100n;
    const fractionalPart = Number(hundredthPercents % 100n);
    return `${integerPart.toString()}.${fractionalPart.toString().padStart(2, '0')}%`;
  } catch {
    return '0.00%';
  }
};

const bpsToPercent = (bps?: number | null) => {
  if (typeof bps !== 'number') return null;
  return `${(bps / 100).toFixed(2)}%`;
};

type PonderToken = {
  id: string;
  symbol: string;
  name?: string | null;
  decimals: number;
  collateralFactorBps: number;
  liquidationThresholdBps?: number | null;
};

type PonderMarket = {
  id: string;
  tokenId: string;
  borrowRateRay: string;
  supplyRateRay: string;
  utilizationRay: string;
  reserveFactorBps: number;
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
  estimatedInterestUsdRay?: string | null;
  durationSeconds?: number | null;
};

type PonderPositionEntry = {
  type: 'supply_collateral' | 'supply_liquidity' | 'borrow';
  tokenId: string;
  marketId: string;
  amount: string;
  usdValueRay: string;
  updatedAtTimestamp?: string;
  updatedAtBlock?: string;
  chainDst?: number | null;
  market?: PonderMarket | null;
  token?: PonderToken | null;
  interestUsdRay?: string | null;
  loan?: PonderLoan | null;
};

type PonderRisk = {
  ltvRay: string;
  maxLtvBps: number;
  maxLiquidationBps: number;
  collateralUsdRay: string;
  debtUsdRay: string;
  healthFactorRay: string;
};

const mapEntries = (entries?: PonderPositionEntry[]) => {
  if (!entries?.length) return [];

  return entries.map(entry => ({
    type: entry.type,
    tokenId: entry.tokenId,
    marketId: entry.marketId,
    amount: entry.amount,
    usdValue: toUsd(entry.usdValueRay),
    usdValueRay: entry.usdValueRay,
    updatedAtTimestamp: entry.updatedAtTimestamp ? Number(entry.updatedAtTimestamp) : null,
    updatedAtBlock: entry.updatedAtBlock ? Number(entry.updatedAtBlock) : null,
    chainDst: entry.chainDst ?? null,
    interestUsd: entry.interestUsdRay ? toUsd(entry.interestUsdRay) : null,
    interestUsdRay: entry.interestUsdRay ?? null,
    market: entry.market
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
      : null,
    token: entry.token
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
      : null,
    loan: entry.loan
      ? {
          ...entry.loan,
          durationSeconds: entry.loan.durationSeconds ?? null,
          estimatedInterestUsd: entry.loan.estimatedInterestUsdRay ? toUsd(entry.loan.estimatedInterestUsdRay) : null,
        }
      : null,
  }));
};

const mapRisk = (risk?: PonderRisk | null) => {
  if (!risk) return null;
  const ltv = toRatioOrUsd(risk.ltvRay);
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
    healthFactor: toRatioOrUsd(risk.healthFactorRay),
    healthFactorRay: risk.healthFactorRay,
  };
};

export async function GET(request: Request) {
  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  if (!account) {
    return NextResponse.json(
      { error: 'Missing account' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
  const chain = searchParams.get('chain');

  const ponderUrl = new URL('/positions', ponderBaseUrl);
  ponderUrl.searchParams.set('account', account);
  if (chain) ponderUrl.searchParams.set('chain', chain);

  let response: Response;
  try {
    response = await fetch(ponderUrl.toString(), { cache: 'no-store' });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to reach indexer: ${(error as Error).message}` },
      {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Indexer responded with status ${response.status}` },
      {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const payload = (await response.json()) as {
    data: Array<{
      id: string;
      chainId: string;
      collateralUsdRay: string;
      debtUsdRay: string;
      healthFactorRay: string;
      updatedAtTimestamp: string;
      entries?: PonderPositionEntry[];
      risk?: PonderRisk | null;
    }>;
  };

  const data =
    payload.data?.map(position => ({
      id: position.id,
      chainId: position.chainId,
      collateralUsd: toUsd(position.collateralUsdRay),
      debtUsd: toUsd(position.debtUsdRay),
      healthFactor: toRatioOrUsd(position.healthFactorRay),
      updatedAtTimestamp: Number(position.updatedAtTimestamp),
      entries: mapEntries(position.entries),
      risk: mapRisk(position.risk),
    })) ?? [];

  return NextResponse.json(
    { data },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    }
  );
}
