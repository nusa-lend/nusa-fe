import { getTokenById } from '../constants/tokenConstants';
import { NETWORKS } from '../constants/networkConstants';
import { SUPPORTED_LENDING_POOLS } from '../constants/lendingConstants';
import { SUPPORTED_BORROWING_POOLS, SUPPORTED_COLLATERAL } from '../constants/borrowConstants';

export interface LoanData {
  id: string;
  positionId: string;
  chainId: string;
  borrowTokenId: string;
  borrowAmount: string;
  borrowUsd: number;
  borrowAprPercent: string;
  borrowApyPercent: string;
  collateralUsd: number | null;
  debtUsd: number | null;
  startTimestamp: number;
  endTimestamp: number | null;
  startBlock: number;
  endBlock: number | null;
  startTxHash: string;
  endTxHash: string | null;
  status: string;
  durationSeconds: number;
  estimatedInterestUsd: number;
  historyType?: 'supply' | 'borrow';
  entryType?: 'liquidity' | 'collateral' | null;
  action?: 'supply' | 'withdraw' | 'repay' | 'borrow' | null;
  usdValue?: number;
  usdValueRay?: string;
}

export interface ApiLoansResponse {
  data: LoanData[];
}

export const fetchUserLoans = async (account: string, chain?: string): Promise<LoanData[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const url = new URL('/api/history', baseUrl);

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

export const getCollateralTokenFromPosition = async (account: string): Promise<string> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const url = new URL('/api/positions', baseUrl);
    url.searchParams.set('account', account);

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
      if (collateralEntry?.token?.symbol) {
        return collateralEntry.token.symbol;
      }
      
      if (collateralEntry?.tokenId) {
        const symbol = getTokenSymbolFromId(collateralEntry.tokenId);
        if (symbol !== 'TOKEN') {
          return symbol;
        }
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

export const getTokenSymbolFromAddress = (address: string, chainId: string): string => {
  const normalizedAddress = address.toLowerCase();
  const chainIdNum = parseInt(chainId);
  
  for (const [tokenId, tokenData] of Object.entries(SUPPORTED_LENDING_POOLS)) {
    for (const network of tokenData.networks) {
      if (network.chainId === chainIdNum && network.address.toLowerCase() === normalizedAddress) {
        return tokenData.name;
      }
    }
  }
  
  for (const [tokenId, tokenData] of Object.entries(SUPPORTED_BORROWING_POOLS)) {
    for (const network of tokenData.networks) {
      if (network.chainId === chainIdNum && network.address.toLowerCase() === normalizedAddress) {
        return tokenData.name;
      }
    }
  }
  
  for (const [tokenId, tokenData] of Object.entries(SUPPORTED_COLLATERAL)) {
    for (const network of tokenData.networks) {
      if (network.chainId === chainIdNum && network.address.toLowerCase() === normalizedAddress) {
        return tokenData.name;
      }
    }
  }
  
  return 'TOKEN';
};

export const getTokenSymbolFromId = (tokenId: string): string => {
  const [chainId, address] = tokenId.split(':');

  if (!chainId || !address) {
    return 'TOKEN';
  }

  return getTokenSymbolFromAddress(address, chainId);
};

export const getCollateralTokenSymbolFromLoan = (loan: LoanData): string => {
  return getTokenSymbolFromId(loan.borrowTokenId);
};

export const getTokenAssetPath = (symbol: string): string => {
  const lowerSymbol = symbol.toLowerCase();
  
  const token = getTokenById(lowerSymbol);
  if (token) {
    return token.logo;
  }

  const lendingToken = Object.values(SUPPORTED_LENDING_POOLS).find(t => t.name.toLowerCase() === lowerSymbol);
  if (lendingToken) {
    return lendingToken.logo;
  }

  const borrowingToken = Object.values(SUPPORTED_BORROWING_POOLS).find(t => t.name.toLowerCase() === lowerSymbol);
  if (borrowingToken) {
    return borrowingToken.logo;
  }

  const collateralToken = Object.values(SUPPORTED_COLLATERAL).find(t => t.name.toLowerCase() === lowerSymbol);
  if (collateralToken) {
    return collateralToken.logo;
  }

  return `/assets/stablecoins/${lowerSymbol}.png`;
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

export const createSupplyTransaction = (loan: LoanData): {
  token1: string;
  token2: string;
  title: string;
  type: 'lend';
} => {
  const tokenSymbol = getTokenSymbolFromId(loan.borrowTokenId);
  const networkName = getNetworkNameFromChainId(loan.chainId);
  const network = NETWORKS.find(n => n.name === networkName);
  const networkLogo = network?.logo || `/assets/network/${networkName.toLowerCase()}.png`;
  
  return {
    token1: getTokenAssetPath(tokenSymbol),
    token2: networkLogo,
    title: `${tokenSymbol} on ${networkName}`,
    type: 'lend' as const,
  };
};

export const createWithdrawTransaction = (loan: LoanData): {
  token1: string;
  token2: string;
  title: string;
  type: 'lend';
} => {
  const tokenSymbol = getTokenSymbolFromId(loan.borrowTokenId);
  const networkName = getNetworkNameFromChainId(loan.chainId);
  const network = NETWORKS.find(n => n.name === networkName);
  const networkLogo = network?.logo || `/assets/network/${networkName.toLowerCase()}.png`;
  
  return {
    token1: getTokenAssetPath(tokenSymbol),
    token2: networkLogo,
    title: `${tokenSymbol} on ${networkName}`,
    type: 'lend' as const,
  };
};

export const getTransactionType = (loan: LoanData): 'lend' | 'borrow' => {
  if (loan.historyType === 'borrow') {
    return 'borrow';
  }
  return 'lend';
};

export const getTransactionTitle = (loan: LoanData): string => {
  const tokenSymbol = getTokenSymbolFromId(loan.borrowTokenId);
  
  if (loan.historyType === 'borrow') {
    if (loan.action === 'borrow') {
      return `${tokenSymbol} Borrow`;
    } else if (loan.action === 'repay') {
      return `${tokenSymbol} Repay`;
    }
    return `${tokenSymbol} Borrow`;
  }
  
  if (loan.action === 'withdraw') {
    const entryType = loan.entryType === 'liquidity' ? 'Liquidity' : 'Collateral';
    return `${tokenSymbol} ${entryType} Withdraw`;
  }
  
  if (loan.action === 'supply') {
    const entryType = loan.entryType === 'liquidity' ? 'Liquidity' : 'Collateral';
    return `${tokenSymbol} ${entryType} Supply`;
  }
  
  return `${tokenSymbol} Supply`;
};

export const getTransactionSubtitle = (loan: LoanData): string => {
  const usdValue = loan.usdValue ?? loan.borrowUsd;
  const formattedValue = formatCurrency(Math.abs(usdValue));
  
  if (loan.historyType === 'borrow') {
    if (loan.action === 'borrow') {
      return `Borrow ${formattedValue}`;
    } else if (loan.action === 'repay') {
      return `Repay ${formattedValue}`;
    }
    return `Borrow ${formattedValue}`;
  }
  
  if (loan.action === 'withdraw') {
    return `Withdraw ${formattedValue}`;
  }
  
  if (loan.action === 'supply') {
    return `Supply ${formattedValue}`;
  }
  
  return `Supply ${formattedValue}`;
};
