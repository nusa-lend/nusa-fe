'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputAmountProps {
  selectedStablecoin?: {
    id: string;
    name: string;
    lltv: string;
    apr: string;
    icon: string;
    flag: string;
  } | null;
  onBack: () => void;
  onBorrow: (amount: string) => void;
}

export default function InputAmount({ selectedStablecoin, onBack, onBorrow }: InputAmountProps) {
  const [amount, setAmount] = useState('');
  const [collateralBalance] = useState(1000000);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(true);

  const handleBorrow = () => {
    if (amount && parseFloat(amount.replace(/,/g, '')) > 0) {
      onBorrow(amount);
    }
  };

  const handleMaxClick = () => {
    // Calculate max borrowable amount based on collateral and LLTV
    const maxBorrowable = (collateralBalance * parseFloat(selectedStablecoin?.lltv?.replace('%', '') || '0')) / 100;
    setAmount(maxBorrowable.toString());
  };

  const formatBalance = (value: number) => {
    return value.toLocaleString('id-ID');
  };

  const toggleDisclaimer = () => {
    setIsDisclaimerExpanded(!isDisclaimerExpanded);
  };

  const isInsufficientCollateral = collateralBalance === 0;
  const hasAmount = amount && parseFloat(amount.replace(/,/g, '')) > 0;

  if (!selectedStablecoin) return <></>;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-4 bg-white">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-full flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900">Borrow {selectedStablecoin.name}</h2>
          <div className="rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {selectedStablecoin.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {selectedStablecoin.name.charAt(0)}
              </div>
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
            <span className="text-gray-900 font-semibold">{selectedStablecoin.name}</span>
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
          <span className="text-sm text-gray-500">Collateral: {formatBalance(collateralBalance)} bNVDA</span>
          <button onClick={handleMaxClick} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            MAX
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 -mt-2">LLTV: {selectedStablecoin.lltv}</div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Borrowing Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Collateral Value</span>
            <span className="text-gray-900 font-semibold text-[15px]">{formatBalance(collateralBalance)} bNVDA</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APR</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-red-600 font-semibold text-[15px]">~{selectedStablecoin.apr}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Max Borrowable</span>
            <span className="text-gray-900 font-semibold text-[15px]">
              {formatBalance((collateralBalance * parseFloat(selectedStablecoin.lltv.replace('%', ''))) / 100)}{' '}
              {selectedStablecoin.name}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Health Factor</span>
            <span className="text-green-600 font-semibold text-[15px]">1.25</span>
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
                      Borrowing involves risk. Your collateral may be liquidated if the value drops below the
                      liquidation threshold. Please ensure you understand the risks before proceeding.
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
        onClick={handleBorrow}
        disabled={!hasAmount || isInsufficientCollateral}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
          hasAmount && !isInsufficientCollateral
            ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
            : 'bg-[#a8cfe5] cursor-not-allowed'
        }`}
      >
        {hasAmount ? 'Borrow Now' : 'Enter an amount'}
      </button>
    </div>
  );
}
