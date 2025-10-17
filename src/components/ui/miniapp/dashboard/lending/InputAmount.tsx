'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenNetworkPair from '../../TokenNetworkPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';

interface InputAmountProps {
  selectedMarket: LendingMarket | null;
  selectedChain: LendingNetworkOption | null;
  onBack: () => void;
  onLend: (amount: string) => void;
}

export default function InputAmount({ selectedMarket, selectedChain, onBack, onLend }: InputAmountProps) {
  const [amount, setAmount] = useState('');
  const [balance] = useState(1000000);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(true);

  const handleLend = () => {
    if (amount && parseFloat(amount.replace(/,/g, '')) > 0) {
      onLend(amount);
    }
  };

  const handleMaxClick = () => {
    setAmount(balance.toString());
  };

  const formatBalance = (value: number) => {
    return value.toLocaleString('id-ID');
  };

  const toggleDisclaimer = () => {
    setIsDisclaimerExpanded(!isDisclaimerExpanded);
  };

  const isInsufficientBalance = balance === 0;
  const hasAmount = amount && parseFloat(amount.replace(/,/g, '')) > 0;

  if (!selectedChain || !selectedMarket) return <></>;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-4 bg-white">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-full flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900">
            Lend {selectedMarket.tokenSymbol} on {selectedChain.name}
          </h2>
          <TokenNetworkPair
            tokenLogo={selectedMarket.tokenLogo}
            networkLogo={selectedChain.networkLogo}
            size={30}
            overlap={25}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={selectedMarket.tokenLogo}
                alt={selectedMarket.tokenSymbol}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              className="bg-transparent text-gray-900 font-semibold placeholder-gray-400 focus:outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-semibold">{selectedMarket.tokenSymbol}</span>
            <button className="p-1 hover:bg-gray-200 rounded transition">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-500">Balance: {formatBalance(balance)}</span>
          <button onClick={handleMaxClick} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            MAX
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 -mt-2">Minimum deposit: 100,000 {selectedMarket.tokenSymbol}</div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Estimated Yield Earned ({selectedMarket.tokenSymbol})
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>My Position</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APY</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-green-600 font-semibold text-[15px]">
              ~{selectedChain.apy || selectedMarket.defaultApy}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Monthly</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Yearly</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 leading-relaxed border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gray-400 text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-700">Disclaimer</p>
              <AnimatePresence initial={false}>
                {isDisclaimerExpanded && (
                  <motion.div
                    key="disclaimer-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden mt-1"
                  >
                    <p>
                      Earning involves risk. Past performance is not indicative of future results. The principal amount
                      and returns are not guaranteed.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <button onClick={toggleDisclaimer} className="p-1 rounded transition">
            <motion.svg
              animate={{ rotate: isDisclaimerExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </motion.svg>
          </button>
        </div>
      </div>

      <button
        onClick={handleLend}
        disabled={!hasAmount || isInsufficientBalance}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
          hasAmount && !isInsufficientBalance ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' : 'bg-[#a8cfe5] cursor-not-allowed'
        }`}
      >
        {hasAmount ? 'Supply Now' : 'Enter an amount'}
      </button>
    </div>
  );
}
