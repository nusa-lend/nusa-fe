import { NextResponse } from 'next/server';
import { NETWORKS } from '@/constants/networkConstants';

type PonderMarket = {
  id: string;
  chainId: string;
  tokenId: string;
  supplyRateRay: string;
  token: {
    symbol: string;
    name: string | null;
  } | null;
};

type PonderResponse = {
  data: PonderMarket[];
};

type ApiLendingMarketNetwork = {
  networkId: string;
  apy: string;
};

type ApiLendingMarket = {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  defaultApy: string;
  networks: ApiLendingMarketNetwork[];
};

const RAY = 10n ** 27n;

const rayToPercentString = (value: string) => {
  let ray: bigint;
  try {
    ray = BigInt(value);
  } catch {
    return '0.00%';
  }

  const hundredthPercents = ray * 10000n / RAY;
  const integerPart = hundredthPercents / 100n;
  const fractionalPart = Number(hundredthPercents % 100n);

  return `${integerPart.toString()}.${fractionalPart.toString().padStart(2, '0')}%`;
};

const getNetworkId = (chainId: string) => {
  const numeric = Number(chainId);
  const network = NETWORKS.find(net => net.chainId === numeric);
  if (network) return network.id;
  return chainId;
};

const mapMarkets = (markets: PonderMarket[]): ApiLendingMarket[] => {
  return markets.map(market => {
    const tokenSymbol = market.token?.symbol ?? 'UNKNOWN';
    const tokenName = market.token?.name ?? tokenSymbol;
    const networkId = getNetworkId(market.chainId);
    const apy = rayToPercentString(market.supplyRateRay);

    return {
      id: market.id,
      tokenSymbol,
      tokenName,
      tokenId: tokenSymbol.toLowerCase(),
      defaultApy: apy,
      networks: [
        {
          networkId,
          apy,
        },
      ],
    };
  });
};

export async function GET(request: Request) {
  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get('chain');

  const ponderUrl = new URL('/markets', ponderBaseUrl);
  if (chain) {
    ponderUrl.searchParams.set('chain', chain);
  }

  let ponderResponse: Response;
  try {
    ponderResponse = await fetch(ponderUrl.toString(), { cache: 'no-store' });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to reach indexer: ${(error as Error).message}` },
      { status: 502 },
    );
  }

  if (!ponderResponse.ok) {
    return NextResponse.json(
      { error: `Indexer responded with status ${ponderResponse.status}` },
      { status: 502 },
    );
  }

  const payload = (await ponderResponse.json()) as PonderResponse;
  const data = mapMarkets(payload.data ?? []);

  return NextResponse.json({ data });
}
