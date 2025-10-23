import { NextResponse } from 'next/server';
import { NETWORKS } from '@/constants/networkConstants';

const RAY = 10n ** 27n;
const SECONDS_IN_YEAR = 31_536_000n;

const rayToNumber = (ray: bigint) => Number(ray) / Number(RAY);

const toLowerHex = (value: string) => {
  try {
    return value.startsWith('0x') ? value.toLowerCase() : value;
  } catch {
    return value;
  }
};

const normalizeChainId = (value?: string | null) => {
  if (!value) return undefined;
  if (/^\d+$/.test(value)) return value;
  const network = NETWORKS.find(net => net.id === value);
  if (network?.chainId !== undefined) {
    return String(network.chainId);
  }
  return value;
};

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
  try {
    const startSec = BigInt(start);
    const endSec = end ? BigInt(end) : startSec;
    const diff = endSec > startSec ? endSec - startSec : 0n;
    return Number(diff);
  } catch {
    return 0;
  }
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
    const start = BigInt(loan.startTimestamp);
    const end = loan.endTimestamp ? BigInt(loan.endTimestamp) : start;
    const duration = end > start ? end - start : 0n;
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
    return new NextResponse(JSON.stringify({ error: 'Missing account' }), {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
  const chain = searchParams.get('chain');

  const graphUrl = new URL('/graphql', ponderBaseUrl);
  const query = `
    query PositionLoans($where: positionLoansFilter, $limit: Int) {
      positionLoanss(
        where: $where
        orderBy: "startTimestamp"
        orderDirection: "desc"
        limit: $limit
      ) {
        items {
          id
          positionId
          chainId
          account
          borrowTokenId
          borrowAmount
          borrowUsdRay
          borrowAprRay
          borrowApyRay
          collateralUsdRay
          debtUsdRay
          startTimestamp
          endTimestamp
          startBlock
          endBlock
          startTxHash
          endTxHash
          status
          repaidAmount
          repaidUsdRay
          updatedAt
        }
      }
    }
  `;

  const where: Record<string, string> = {
    account: toLowerHex(account),
  };

  const normalizedChain = normalizeChainId(chain);
  if (normalizedChain) {
    where.chainId = normalizedChain;
  }

  const body = JSON.stringify({
    query,
    variables: {
      where,
      limit: 100,
    },
  });

  let response: Response;
  try {
    response = await fetch(graphUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: `Failed to reach indexer: ${(error as Error).message}` }), {
      status: 502,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  if (!response.ok) {
    return new NextResponse(JSON.stringify({ error: `Indexer responded with status ${response.status}` }), {
      status: 502,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  const payload = (await response.json()) as {
    data?: {
      positionLoanss?: {
        items: Array<{
          id: string;
          positionId: string;
          chainId: string;
          account: string;
          borrowTokenId: string;
          borrowAmount: string;
          borrowUsdRay: string;
          borrowAprRay: string;
          borrowApyRay: string;
          collateralUsdRay: string;
          debtUsdRay: string;
          startTimestamp: string;
          endTimestamp?: string | null;
          startBlock: string;
          endBlock?: string | null;
          startTxHash: string;
          endTxHash?: string | null;
          status: string;
          repaidAmount: string;
          repaidUsdRay: string;
          updatedAt: string;
        }>;
      };
    };
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    const message =
      payload.errors
        .map(err => err?.message)
        .filter(Boolean)
        .join('; ') || 'Unknown GraphQL error';
    return new NextResponse(JSON.stringify({ error: `Indexer GraphQL error: ${message}` }), {
      status: 502,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  const items = payload.data?.positionLoanss?.items ?? [];

  const data =
    items.map(loan => {
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

  return new NextResponse(JSON.stringify({ data }), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
