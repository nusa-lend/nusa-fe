import { Token } from './token';

export interface BorrowingMarket {
  id: string;
  token: Token;
  networks: BorrowingNetworkOption[];
  maxLtv: number;
  liquidationThreshold: number;
}

export interface BorrowingNetworkOption {
  id: string;
  name: string;
  networkLogo: string;
  interestRate: string;
  maxBorrowAmount: number;
  chainId?: number;
  address?: string;
  decimals?: number;
}

export interface BorrowingPosition {
  market: BorrowingMarket;
  network: BorrowingNetworkOption;
  borrowedAmount: number;
  collateralAmount: number;
  healthFactor: number;
  interestRate: string;
  timestamp: number;
}

export interface BorrowingTransaction {
  id: string;
  type: 'borrow' | 'repay' | 'liquidate';
  market: BorrowingMarket;
  network: BorrowingNetworkOption;
  amount: number;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface SupportedBorrowingPoolsMap {
  [key: string]: {
    id: string;
    name: string;
    logo: string;
    logoCountry: string;
    networks: Array<{
      id: string;
      name: string;
      logo: string;
      chainId: number;
      address: string;
      decimals: number;
      isActive: boolean;
    }>;
  };
}
