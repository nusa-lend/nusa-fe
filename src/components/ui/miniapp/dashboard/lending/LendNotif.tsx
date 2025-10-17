'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TokenNetworkPair from '../../TokenNetworkPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';

interface LendNotifProps {
  selectedMarket: LendingMarket | null;
  selectedChain: LendingNetworkOption | null;
  amount?: string;
  onDone: () => void;
}

export default function LendNotif({ selectedMarket, selectedChain, amount, onDone }: LendNotifProps) {
  const [isVisible, setIsVisible] = useState(true);

  const transactionData = {
    date: '2025-01-13 15:00',
    txHash: '09a6...df6i',
    amount: amount || '10,000,000',
    apy: selectedChain?.apy || selectedMarket?.defaultApy || '7.91%',
  };

  const handleDone = () => {
    setIsVisible(false);
    onDone();
  };

  if (!selectedChain || !selectedMarket) return <></>;

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
              Lend {selectedMarket.tokenSymbol} on {selectedChain.name}
            </h2>
            <TokenNetworkPair
              tokenLogo={selectedMarket.tokenLogo}
              networkLogo={selectedChain.networkLogo}
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
            {selectedMarket.tokenSymbol} {transactionData.amount}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">APY</span>
            <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">i</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-green-600">~{transactionData.apy}</span>
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
