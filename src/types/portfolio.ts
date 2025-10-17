import { Token } from './token';
import { LendingPosition } from './lending';
import { BorrowingPosition } from './borrowing';

export interface PortfolioSummary {
  totalValue: number;
  totalSupplied: number;
  totalBorrowed: number;
  netWorth: number;
  totalEarned: number;
  totalInterestPaid: number;
}

export interface PortfolioPosition {
  id: string;
  type: 'lending' | 'borrowing';
  token: Token;
  amount: number;
  value: number;
  apy?: string;
  interestRate?: string;
  timestamp: number;
}

export interface PortfolioHistory {
  date: string;
  totalValue: number;
  netWorth: number;
  supplied: number;
  borrowed: number;
}

export interface PortfolioStats {
  totalPositions: number;
  activeLendingPositions: number;
  activeBorrowingPositions: number;
  averageLendingApy: number;
  averageBorrowingRate: number;
  healthScore: number; // 0-100
}
