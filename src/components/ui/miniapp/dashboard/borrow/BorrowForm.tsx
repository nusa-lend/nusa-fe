'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
import Tooltip from '@/components/ui/miniapp/Tooltip';
import { hasSufficientAllowance } from '@/hooks/useAllowances';
import { Wallet } from 'lucide-react';

interface BorrowFormProps {
  selectedMarket: BorrowingMarket | null;
  selectedNetwork: BorrowingNetworkOption | null;
  onBack: () => void;
  onBorrow: (collateralAmount: string, borrowAmount: string) => Promise<void>;
  onApprove: (amount: string) => Promise<void>;
  isBorrowing: boolean;
  isApproving: boolean;
  balances: any;
  allowances: any;
  spenderAddress: `0x${string}` | undefined;
}

export default function BorrowForm({
  selectedMarket,
  selectedNetwork,
  onBack,
  onBorrow,
  onApprove,
  isBorrowing,
  isApproving,
  balances,
  allowances,
  spenderAddress,
}: BorrowFormProps) {
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(true);

  const selectedBalanceStr = selectedNetwork ? (balances && (balances as any)[selectedNetwork.id]) || '0' : '0';
  const isInsufficientBalance = parseFloat(selectedBalanceStr || '0') === 0;
  const hasAllowance = selectedNetwork ? hasSufficientAllowance(allowances, selectedNetwork.id, collateralAmount || '0') : false;
  const hasCollateralAmount = collateralAmount && parseFloat(collateralAmount.replace(/,/g, '')) > 0;
  const hasBorrowAmount = borrowAmount && parseFloat(borrowAmount.replace(/,/g, '')) > 0;

  const handleBorrow = async () => {
    await onBorrow(collateralAmount, borrowAmount);
  };

  const handleApprove = async () => {
    await onApprove(collateralAmount);
  };

  const handleMaxCollateralClick = () => {
    const bal = parseFloat(selectedBalanceStr || '0');
    if (Number.isNaN(bal) || bal <= 0) {
      setCollateralAmount('0');
      return;
    }
    const dustFactor = 0.999;
    const decimals = selectedNetwork?.decimals ?? 6;
    const maxUsable = bal * dustFactor;
    setCollateralAmount(maxUsable.toFixed(Math.min(6, decimals)));
  };

  const formatBalance = (value: string) => {
    const num = parseFloat(value || '0');
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString('id-ID');
  };

  const toggleDisclaimer = () => {
    setIsDisclaimerExpanded(!isDisclaimerExpanded);
  };

  if (!selectedNetwork || !selectedMarket) return <></>;

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
            Borrow {selectedNetwork.name} using {selectedMarket.token.symbol}
          </h2>
          <TokenNetworkPair
            tokenLogo={selectedMarket.token.logo}
            networkLogo={selectedNetwork.networkLogo}
            size={30}
            overlap={25}
          />
        </div>
      </div>

      {/* Collateral Input */}
      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="text-sm text-gray-600 mb-3">Collateral {selectedMarket.token.symbol}</div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={selectedMarket.token.logo}
                alt={selectedMarket.token.symbol}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <input
              type="text"
              value={collateralAmount}
              onChange={e => setCollateralAmount(e.target.value)}
              placeholder="Amount"
              className="bg-transparent text-gray-900 font-semibold placeholder-gray-400 focus:outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-semibold">{selectedMarket.token.symbol}</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Wallet className="w-4 h-4" />
            {formatBalance(selectedBalanceStr)}
          </span>
          <button onClick={handleMaxCollateralClick} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            MAX
          </button>
        </div>
      </div>

      {/* Borrow Input */}
      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="text-sm text-gray-600 mb-3">Borrow {selectedNetwork.name}</div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={selectedNetwork.networkLogo}
                alt={selectedNetwork.name}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <input
              type="text"
              value={borrowAmount}
              onChange={e => setBorrowAmount(e.target.value)}
              placeholder="Amount"
              className="bg-transparent text-gray-900 font-semibold placeholder-gray-400 focus:outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-semibold">{selectedNetwork.name}</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-500">Available: 0</span>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            MAX
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Risk Level
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>LTV / LLTV</span>
              <Tooltip
                content="If your Loan-to-value ratio (LTV) reaches 80% (Limit-LTV), your loan will be liquidated"
                trigger="click"
                position="right"
                className="z-50"
              >
                <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">i</span>
                </div>
              </Tooltip>
            </div>
            <span className="text-gray-900 font-semibold text-[15px]">
              <span className="text-green-600">0%</span> / {selectedMarket.maxLtv}%
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Margin Call LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Liquidation LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3 mt-4">Borrow Rate</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APR</span>
              <Tooltip
                content="This is Net Borrow Rate of your position"
                trigger="click"
                position="right"
                className="z-50"
              >
                <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">i</span>
                </div>
              </Tooltip>
            </div>
            <span className="text-green-600 font-semibold text-[15px]">
              ~{selectedNetwork.interestRate}%
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Daily</span>
            <span className="text-green-600 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Monthly</span>
            <span className="text-green-600 font-semibold text-[15px]">0</span>
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
                      Borrowing involves risk. Your collateral may be liquidated if the value drops below the required threshold.
                      Past performance is not indicative of future results.
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

      {hasAllowance ? (
        <button
          onClick={handleBorrow}
          disabled={!hasCollateralAmount || !hasBorrowAmount || isInsufficientBalance || isBorrowing}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasCollateralAmount && hasBorrowAmount && !isInsufficientBalance && !isBorrowing
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isBorrowing ? 'Borrowing…' : hasCollateralAmount && hasBorrowAmount ? 'Borrow Now' : 'Enter amounts'}
        </button>
      ) : (
        <button
          onClick={handleApprove}
          disabled={!hasCollateralAmount || isApproving || !spenderAddress}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasCollateralAmount && !isApproving && !!spenderAddress
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isApproving ? 'Approving…' : hasCollateralAmount ? 'Approve Collateral' : 'Enter collateral amount'}
        </button>
      )}
    </div>
  );
}
