import { Token } from './token';
import { Network } from './network';

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
