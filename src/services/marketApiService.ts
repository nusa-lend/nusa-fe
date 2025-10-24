import { NETWORKS } from '@/constants/networkConstants';

export type PonderMarket = {
  id: string;
  chainId: string;
  tokenId: string;
  supplyRateRay: string;
  token: {
    symbol: string;
    name: string | null;
  } | null;
};

export type PonderResponse = {
  data: PonderMarket[];
};

const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';

export const fetchMarketsFromPonder = async (chain?: string): Promise<PonderMarket[]> => {
  const ponderUrl = new URL('/markets', ponderBaseUrl);
  if (chain) {
    ponderUrl.searchParams.set('chain', chain);
  }

  const response = await fetch(ponderUrl.toString(), {
    cache: 'force-cache',
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch markets from indexer: ${response.status}`);
  }

  const payload: PonderResponse = await response.json();
  return payload.data || [];
};
