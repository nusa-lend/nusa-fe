'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';

interface TransactionNotifProps {
  type: 'borrow-more' | 'supply-more' | 'repay-borrow' | 'withdraw-supply';
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
  amount?: string;
  transaction?: { hash?: `0x${string}`; success: boolean };
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
  transaction,
  onDone,
}: TransactionNotifProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const transactionData = {
    date: new Date().toLocaleString(),
    txHash: transaction?.hash ? `${transaction.hash.slice(0, 6)}...${transaction.hash.slice(-4)}` : '-',
    fullTxHash: transaction?.hash || '',
    amount: amount || '0',
    success: transaction?.success ?? false,
  };

  const handleDone = () => {
    setIsVisible(false);
    onDone();
  };

  const handleCopyHash = async () => {
    if (transactionData.fullTxHash) {
      try {
        await navigator.clipboard.writeText(transactionData.fullTxHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy transaction hash:', err);
      }
    }
  };

  const getTransactionData = () => {
    if (type === 'borrow-more') {
      return {
        title: `${collateralToken?.symbol || 'Unknown'} / ${borrowToken?.symbol || 'Unknown'}`,
        tokenLogo: collateralToken?.logo || '/assets/placeholder/placeholder_selectcoin.png',
        networkLogo: borrowToken?.logo || '/assets/placeholder/placeholder_selectchain.png',
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
        title: `${collateralToken?.symbol || 'Unknown'} / ${borrowToken?.symbol || 'Unknown'}`,
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
        title: `Withdraw ${supplyToken?.symbol || 'Unknown'} on ${supplyNetwork?.name || 'Unknown'}`,
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
        title: `${supplyToken?.symbol || 'Unknown'} on ${supplyNetwork?.name || 'Unknown'}`,
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
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center bg-white ${transactionData.success ? 'border-teal-200' : 'border-red-200'}`}>
          {transactionData.success ? (
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-md font-semibold text-gray-900">
              {transactionInfo.title}
            </h2>
            <TokenNetworkPair
              tokenLogo={transactionInfo.tokenLogo}
              networkLogo={transactionInfo.networkLogo}
              size={24}
              overlap={25}
            />
          </div>
          <p className={`font-medium text-sm ${transactionData.success ? 'text-gray-700' : 'text-red-600'}`}>
            {transactionData.success ? 'Successful!' : 'Failed'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Date</span>
          <span className="text-sm font-semibold text-gray-900">{transactionData.date}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tx Hash</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{transactionData.txHash}</span>
            {transactionData.fullTxHash && (
              <button
                onClick={handleCopyHash}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy transaction hash"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                )}
              </button>
            )}
          </div>
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
