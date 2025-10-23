import { ALL_TOKENS, getTokenById } from '../constants/tokenConstants';
import { NETWORKS, getNetworkById } from '../constants/networkConstants';

export interface LoanData {
  id: string;
  positionId: string;
  chainId: string;
  borrowTokenId: string;
  borrowAmount: string;
  borrowUsd: number;
  borrowAprPercent: string;
  borrowApyPercent: string;
  collateralUsd: number;
  debtUsd: number;
  startTimestamp: number;
  endTimestamp: number | null;
  startBlock: number;
  endBlock: number | null;
  startTxHash: string;
  endTxHash: string | null;
  status: string;
  durationSeconds: number;
  estimatedInterestUsd: number;
}

export interface ApiLoansResponse {
  data: LoanData[];
}

export const fetchUserLoans = async (account: string, chain?: string): Promise<LoanData[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const url = new URL('/api/loans', baseUrl);

    url.searchParams.set('account', account);
    if (chain) {
      url.searchParams.set('chain', chain);
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch loans: ${response.status}`);
    }

    const result: ApiLoansResponse = await response.json();
    return result.data || [];
  } catch (error) {
    throw error;
  }
};

export const getCollateralTokenFromPosition = async (positionId: string): Promise<string> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const url = new URL('/api/positions', baseUrl);
    url.searchParams.set('positionId', positionId);

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      return 'CNGN';
    }

    const result = await response.json();
    const position = result.data?.[0];
    
    if (position?.entries) {
      const collateralEntry = position.entries.find((entry: any) => entry.type === 'supply_collateral');
      if (collateralEntry?.tokenId) {
        return getTokenSymbolFromId(collateralEntry.tokenId);
      }
    }
    
    return 'CNGN';
  } catch (error) {
    return 'CNGN';
  }
};

export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else if (value >= 1) {
    return `$${value.toFixed(2)}`;
  } else {
    return `$${value.toFixed(4)}`;
  }
};

export const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}D:${hours}H:${minutes}M`;
  } else if (hours > 0) {
    return `${hours}H:${minutes}M`;
  } else {
    return `${minutes}M`;
  }
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getTokenSymbolFromId = (tokenId: string): string => {
  const [, address] = tokenId.split(':');
  
  const token = ALL_TOKENS.find(t => 
    t.id === address.toLowerCase() || 
    t.symbol.toLowerCase() === address.toLowerCase()
  );
  
  return token?.symbol || 'TOKEN';
};

export const getCollateralTokenSymbolFromLoan = (loan: LoanData): string => {
  return getTokenSymbolFromId(loan.borrowTokenId);
};

export const getTokenAssetPath = (symbol: string): string => {
  const token = getTokenById(symbol.toLowerCase());
  
  if (!token) {
    return `/assets/stablecoins/${symbol.toLowerCase()}.png`;
  }
  
  return token.logo;
};

export const getNetworkNameFromChainId = (chainId: string): string => {
  const network = NETWORKS.find(n => n.chainId?.toString() === chainId);
  return network?.name || 'Unknown';
};

export const createBorrowTransaction = (loan: LoanData, borrowedTokenSymbol: string): {
  token1: string;
  token2: string;
  title: string;
  type: 'borrow';
} => {
  const collateralTokenSymbol = getCollateralTokenSymbolFromLoan(loan);
  
  return {
    token1: getTokenAssetPath(collateralTokenSymbol),
    token2: getTokenAssetPath(borrowedTokenSymbol),
    title: `${collateralTokenSymbol} / ${borrowedTokenSymbol}`,
    type: 'borrow' as const,
  };
};

export const createLendTransaction = (tokenSymbol: string, networkName: string): {
  token1: string;
  token2: string;
  title: string;
  type: 'lend';
} => {
  const network = NETWORKS.find(n => n.name === networkName);
  const networkLogo = network?.logo || `/assets/network/${networkName.toLowerCase()}.png`;
  
  return {
    token1: getTokenAssetPath(tokenSymbol),
    token2: networkLogo,
    title: `${tokenSymbol} on ${networkName}`,
    type: 'lend' as const,
  };
};
