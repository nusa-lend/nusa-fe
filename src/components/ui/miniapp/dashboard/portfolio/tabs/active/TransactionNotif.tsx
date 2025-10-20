'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';

interface TransactionNotifProps {
  type: 'borrow-more' | 'supply-more' | 'repay-borrow' | 'withdraw-supply';
  // For borrow more
  collateralToken?: {
    symbol: string;
    logo: string;
    amount: string;
  };
  borrowToken?: {
    symbol: string;
    logo: string;
    amount: string;
  };
  borrowNetwork?: {
    name: string;
    logo: string;
    apr: string;
  };
  // For supply more
  supplyToken?: {
    symbol: string;
    logo: string;
    amount: string;
  };
  supplyNetwork?: {
    name: string;
    logo: string;
    apy: string;
  };
  // Common props
  amount?: string;
  onDone: () => void;
}

export default function TransactionNotif({
  type,
  collateralToken,
  borrowToken,
  borrowNetwork,
  supplyToken,
  supplyNetwork,
  amount,
  onDone,
}: TransactionNotifProps) {
  const [isVisible, setIsVisible] = useState(true);

  const transactionData = {
    date: '2025-01-13 15:00',
    txHash: '09a6...df6i',
    amount: amount || '10,000,000',
  };

  const handleDone = () => {
    setIsVisible(false);
    onDone();
  };

  // Get the appropriate data based on type
  const getTransactionData = () => {
    if (type === 'borrow-more') {
      return {
        title: `Borrow ${borrowToken?.symbol || 'Unknown'}`,
        tokenLogo: borrowToken?.logo || '/assets/placeholder/placeholder_selectcoin.png',
        networkLogo: borrowNetwork?.logo || '/assets/placeholder/placeholder_selectchain.png',
        networkName: borrowNetwork?.name || 'Unknown',
        amount: borrowToken?.amount || amount || '0',
        rate: borrowNetwork?.apr || '0%',
        rateLabel: 'APR',
        rateColor: 'text-red-600',
        collateralAmount: collateralToken?.amount || '0',
        collateralSymbol: collateralToken?.symbol || 'Unknown',
      };
    } else if (type === 'repay-borrow') {
      return {
        title: `Repay ${borrowToken?.symbol || 'Unknown'}`,
        tokenLogo: borrowToken?.logo || '/assets/placeholder/placeholder_selectcoin.png',
        networkLogo: borrowNetwork?.logo || '/assets/placeholder/placeholder_selectchain.png',
        networkName: borrowNetwork?.name || 'Unknown',
        amount: borrowToken?.amount || amount || '0',
        rate: borrowNetwork?.apr || '0%',
        rateLabel: 'APR',
        rateColor: 'text-red-600',
        collateralAmount: collateralToken?.amount || '0',
        collateralSymbol: collateralToken?.symbol || 'Unknown',
      };
    } else if (type === 'withdraw-supply') {
      return {
        title: `Withdraw ${supplyToken?.symbol || 'Unknown'}`,
        tokenLogo: supplyToken?.logo || '/assets/placeholder/placeholder_selectcoin.png',
        networkLogo: supplyNetwork?.logo || '/assets/placeholder/placeholder_selectchain.png',
        networkName: supplyNetwork?.name || 'Unknown',
        amount: supplyToken?.amount || amount || '0',
        rate: supplyNetwork?.apy || '0%',
        rateLabel: 'APY',
        rateColor: 'text-green-600',
        collateralAmount: null,
        collateralSymbol: null,
      };
    } else {
      return {
        title: `Supply ${supplyToken?.symbol || 'Unknown'}`,
        tokenLogo: supplyToken?.logo || '/assets/placeholder/placeholder_selectcoin.png',
        networkLogo: supplyNetwork?.logo || '/assets/placeholder/placeholder_selectchain.png',
        networkName: supplyNetwork?.name || 'Unknown',
        amount: supplyToken?.amount || amount || '0',
        rate: supplyNetwork?.apy || '0%',
        rateLabel: 'APY',
        rateColor: 'text-green-600',
        collateralAmount: null,
        collateralSymbol: null,
      };
    }
  };

  const transactionInfo = getTransactionData();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto space-y-6 pb-4"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-teal-200 flex items-center justify-center bg-white">
          <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-md font-semibold text-gray-900">
              {transactionInfo.title} on {transactionInfo.networkName}
            </h2>
            <TokenNetworkPair
              tokenLogo={transactionInfo.tokenLogo}
              networkLogo={transactionInfo.networkLogo}
              size={24}
              overlap={25}
            />
          </div>
          <p className="text-gray-700 font-medium text-sm">Successful!</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Date</span>
          <span className="text-sm font-semibold text-gray-900">{transactionData.date}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tx Hash</span>
          <span className="text-sm font-semibold text-gray-900">{transactionData.txHash}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="text-sm font-semibold text-gray-900">
            {type === 'borrow-more' || type === 'repay-borrow' ? borrowToken?.symbol : supplyToken?.symbol}{' '}
            {transactionInfo.amount}
          </span>
        </div>

        {(type === 'borrow-more' || type === 'repay-borrow') && transactionInfo.collateralAmount && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Collateral</span>
            <span className="text-sm font-semibold text-gray-900">
              {transactionInfo.collateralSymbol} {transactionInfo.collateralAmount}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">{transactionInfo.rateLabel}</span>
            <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">i</span>
            </div>
          </div>
          <span className={`text-sm font-semibold ${transactionInfo.rateColor}`}>~{transactionInfo.rate}</span>
        </div>
      </div>

      <button
        onClick={handleDone}
        className="w-full py-3.5 rounded-xl font-semibold text-[15px] text-white bg-[#56a2cc] hover:bg-[#4085a6] transition"
      >
        Done
      </button>
    </motion.div>
  );
}
