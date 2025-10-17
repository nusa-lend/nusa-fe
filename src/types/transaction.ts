export type TransactionType = 'supply' | 'withdraw' | 'borrow' | 'repay' | 'liquidate' | 'swap' | 'transfer';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  tokenSymbol: string;
  networkName: string;
  txHash: string;
  timestamp: number;
  gasUsed?: number;
  gasPrice?: string;
  blockNumber?: number;
  explorerUrl?: string;
}

export interface TransactionReceipt {
  transaction: Transaction;
  success: boolean;
  errorMessage?: string;
  events?: TransactionEvent[];
}

export interface TransactionEvent {
  name: string;
  data: Record<string, any>;
  blockNumber: number;
  transactionIndex: number;
}
