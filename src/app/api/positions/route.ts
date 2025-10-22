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

type PonderPositionAsset = {
  tokenId: string;
  amount: string;
  usdValueRay: string;
  updatedAtTimestamp?: string;
  updatedAtBlock?: string;
  chainDst?: string | null;
};

const mapAssets = (assets?: PonderPositionAsset[]) => {
  if (!assets?.length) return [];

  return assets.map((asset) => ({
    tokenId: asset.tokenId,
    amount: asset.amount,
    usdValue: toUsd(asset.usdValueRay),
    usdValueRay: asset.usdValueRay,
    updatedAtTimestamp: asset.updatedAtTimestamp ? Number(asset.updatedAtTimestamp) : null,
    updatedAtBlock: asset.updatedAtBlock ? Number(asset.updatedAtBlock) : null,
    chainDst: asset.chainDst ?? null,
  }));
};

export async function GET(request: Request) {
  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  if (!account) {
    return NextResponse.json({ error: 'Missing account' }, { status: 400 });
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
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Indexer responded with status ${response.status}` },
      { status: 502 },
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
      collaterals?: PonderPositionAsset[];
      debts?: PonderPositionAsset[];
    }>;
  };

  const data =
    payload.data?.map((position) => ({
      id: position.id,
      chainId: position.chainId,
      collateralUsd: toUsd(position.collateralUsdRay),
      debtUsd: toUsd(position.debtUsdRay),
      healthFactor: toRatioOrUsd(position.healthFactorRay),
      updatedAtTimestamp: Number(position.updatedAtTimestamp),
      collaterals: mapAssets(position.collaterals),
      debts: mapAssets(position.debts),
    })) ?? [];

  return NextResponse.json({ data });
}
