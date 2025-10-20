import { NextResponse } from 'next/server';

const RAY = 10n ** 27n;
const SECONDS_IN_YEAR = 31_536_000n;

const rayToNumber = (ray: bigint) => Number(ray) / Number(RAY);

const formatPercent = (ray: string) => {
  try {
    const percent = rayToNumber(BigInt(ray)) * 100;
    return percent.toFixed(2);
  } catch {
    return '0.00';
  }
};

const toUsd = (valueRay: string) => {
  try {
    return rayToNumber(BigInt(valueRay));
  } catch {
    return 0;
  }
};

const computeDurationSeconds = (start: string, end?: string | null) => {
  const startSec = Number(start);
  const endSec = end ? Number(end) : startSec;
  return Math.max(endSec - startSec, 0);
};

const computeInterestUsd = (loan: {
  borrowUsdRay: string;
  borrowAprRay: string;
  startTimestamp: string;
  endTimestamp?: string | null;
}) => {
  try {
    const principal = BigInt(loan.borrowUsdRay);
    const apr = BigInt(loan.borrowAprRay);
    const duration = BigInt(Math.max(Number(loan.endTimestamp ?? loan.startTimestamp) - Number(loan.startTimestamp), 0));
    const interestRay = (principal * apr * duration) / (RAY * SECONDS_IN_YEAR);
    return rayToNumber(interestRay);
  } catch {
    return 0;
  }
};

export async function GET(request: Request) {
  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  if (!account) {
    return NextResponse.json({ error: 'Missing account' }, { status: 400 });
  }
  const chain = searchParams.get('chain');

  const ponderUrl = new URL('/position_loans', ponderBaseUrl);
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
      positionId: string;
      chainId: string;
      borrowTokenId: string;
      borrowAmount: string;
      borrowUsdRay: string;
      borrowAprRay: string;
      borrowApyRay: string;
      collateralUsdRay: string;
      debtUsdRay: string;
      startTimestamp: string;
      endTimestamp?: string | null;
      status: string;
      startBlock: string;
      endBlock?: string | null;
      startTxHash: string;
      endTxHash?: string | null;
    }>;
  };

  const data =
    payload.data?.map((loan) => {
      const durationSeconds = computeDurationSeconds(loan.startTimestamp, loan.endTimestamp);
      const interestUsd = computeInterestUsd(loan);
      return {
        id: loan.id,
        positionId: loan.positionId,
        chainId: loan.chainId,
        borrowTokenId: loan.borrowTokenId,
        borrowAmount: loan.borrowAmount,
        borrowUsd: toUsd(loan.borrowUsdRay),
        borrowAprPercent: formatPercent(loan.borrowAprRay),
        borrowApyPercent: formatPercent(loan.borrowApyRay),
        collateralUsd: toUsd(loan.collateralUsdRay),
        debtUsd: toUsd(loan.debtUsdRay),
        startTimestamp: Number(loan.startTimestamp),
        endTimestamp: loan.endTimestamp ? Number(loan.endTimestamp) : null,
        startBlock: Number(loan.startBlock),
        endBlock: loan.endBlock ? Number(loan.endBlock) : null,
        startTxHash: loan.startTxHash,
        endTxHash: loan.endTxHash ?? null,
        status: loan.status,
        durationSeconds,
        estimatedInterestUsd: interestUsd,
      };
    }) ?? [];

  return NextResponse.json({ data });
}
