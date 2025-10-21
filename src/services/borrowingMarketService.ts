type ApiBorrowingMarketNetwork = {
  networkId: string;
  interestRate: string;
};

export type ApiBorrowingMarket = {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  defaultInterestRate: string;
  networks: ApiBorrowingMarketNetwork[];
};

type ApiBorrowingMarketsResponse = {
  data: ApiBorrowingMarket[];
};

export const fetchBorrowingMarkets = async (chain?: string): Promise<ApiBorrowingMarket[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = new URL('/api/borrowing-markets', baseUrl);
    
    if (chain) {
      url.searchParams.set('chain', chain);
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch borrowing markets: ${response.status}`);
    }

    const result: ApiBorrowingMarketsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching borrowing markets:', error);
    throw error;
  }
};

export const getMarketInterestRateByTokenAndNetwork = (
  markets: ApiBorrowingMarket[],
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
  return network?.interestRate || market.defaultInterestRate || '0.00%';
};
