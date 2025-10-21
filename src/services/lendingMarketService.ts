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

type ApiMarketsResponse = {
  data: ApiLendingMarket[];
};

export const fetchLendingMarkets = async (chain?: string): Promise<ApiLendingMarket[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = new URL('/api/markets', baseUrl);
    
    if (chain) {
      url.searchParams.set('chain', chain);
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.status}`);
    }

    const result: ApiMarketsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching lending markets:', error);
    throw error;
  }
};

export const getMarketApyByTokenAndNetwork = (
  markets: ApiLendingMarket[],
  tokenSymbol: string,
  networkId: string
): string => {
  let market = markets.find(m => 
    m.tokenSymbol.toLowerCase() === tokenSymbol.toLowerCase()
  );
  
  if (!market) {
    market = markets.find(m => 
      m.tokenSymbol.toLowerCase().includes(tokenSymbol.toLowerCase()) ||
      tokenSymbol.toLowerCase().includes(m.tokenSymbol.toLowerCase())
    );
  }
  
  if (!market) return '0.00%';
  
  const network = market.networks.find(n => n.networkId === networkId);
  return network?.apy || market.defaultApy || '0.00%';
};
