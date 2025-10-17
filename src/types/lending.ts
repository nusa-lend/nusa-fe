import { Token } from './token';
import { Network } from './network';

export interface LendingNetworkOption {
  id: string;
  name: string;
  networkLogo: string;
  apy: string;
}

export interface LendingMarket {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenLogo: string;
  defaultApy: string;
  networks: LendingNetworkOption[];
}

export interface LendingPosition {
  market: LendingMarket;
  network: LendingNetworkOption;
  amount: number;
  apy: string;
  earned: number;
  timestamp: number;
}

export interface LendingTransaction {
  id: string;
  type: 'supply' | 'withdraw';
  market: LendingMarket;
  network: LendingNetworkOption;
  amount: number;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface LendingStats {
  totalSupplied: number;
  totalEarned: number;
  averageApy: number;
  activePositions: number;
}
