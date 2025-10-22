'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
import Tooltip from '@/components/ui/miniapp/Tooltip';
import { hasSufficientAllowance } from '@/hooks/useAllowances';
import { useUserBorrowingPosition } from '@/hooks/useUserPositions';
import { Wallet } from 'lucide-react';
import { formatBalance } from '@/utils/formatBalance';

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

  const {
    maxLtv: apiMaxLtv,
    liquidationLtv: apiLiquidationLtv,
    isLoading: isPositionLoading,
  } = useUserBorrowingPosition();

  const selectedBalanceStr = balances
    ? Object.values(balances as Record<string, string>)
        .reduce((total: number, balance: string) => {
          return total + parseFloat(balance || '0');
        }, 0)
        .toString()
    : '0';
  const isInsufficientBalance = parseFloat(selectedBalanceStr || '0') === 0;
  const collateralNetworkId = selectedMarket?.networks[0]?.id;
  const hasAllowance = collateralNetworkId
    ? hasSufficientAllowance(allowances, collateralNetworkId, collateralAmount || '0')
    : false;
  const hasCollateralAmount = collateralAmount && parseFloat(collateralAmount.replace(/,/g, '')) > 0;
  const hasBorrowAmount = borrowAmount && parseFloat(borrowAmount.replace(/,/g, '')) > 0;

  const inputCollateralAmount = parseFloat(collateralAmount.replace(/,/g, '') || '0');
  const userBalance = parseFloat(selectedBalanceStr || '0');
  const isCollateralAmountExceedingBalance = hasCollateralAmount && inputCollateralAmount > userBalance;
  const collateralValue = parseFloat(collateralAmount.replace(/,/g, '') || '0');
  const maxBorrowAmount = (collateralValue * (selectedMarket?.maxLtv || 80)) / 100;
  const currentLtv =
    collateralValue > 0 ? (parseFloat(borrowAmount.replace(/,/g, '') || '0') / collateralValue) * 100 : 0;
  const apiLiquidationValue = parseFloat(apiLiquidationLtv.replace('%', ''));
  const liquidationLtv = !isNaN(apiLiquidationValue) ? apiLiquidationValue : selectedMarket?.maxLtv || 80;

  const marginCallLtv = liquidationLtv * 0.8;

  const interestCalculations = useMemo(() => {
    if (!selectedNetwork?.interestRate) {
      return { daily: '0', monthly: '0' };
    }

    const aprValue = parseFloat(selectedNetwork.interestRate.replace('%', ''));
    const borrowAmountValue = parseFloat(borrowAmount.replace(/,/g, '') || '0');

    if (isNaN(aprValue) || borrowAmountValue === 0) {
      return { daily: '0', monthly: '0' };
    }

    const dailyInterest = (borrowAmountValue * aprValue) / 100 / 365;
    const monthlyInterest = (borrowAmountValue * aprValue) / 100 / 12;

    return {
      daily: dailyInterest.toFixed(2),
      monthly: monthlyInterest.toFixed(2),
    };
  }, [selectedNetwork?.interestRate, borrowAmount]);

  const handlePercentageClick = (percentage: number) => {
    if (!hasCollateralAmount) return;
    const amount = (maxBorrowAmount * percentage) / 100;
    const formattedAmount = parseFloat(amount.toFixed(6)).toString();
    setBorrowAmount(formattedAmount);
  };

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
    const formattedAmount = parseFloat(maxUsable.toFixed(Math.min(6, decimals))).toString();
    setCollateralAmount(formattedAmount);
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
      <div
        className={`rounded-xl border p-3 ${
          isCollateralAmountExceedingBalance ? 'border-[#bc5564] bg-[#f8fafc]' : 'border-gray-200 bg-[#f8fafc]'
        }`}
      >
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
          <div className="flex items-center gap-1">
            <span className="text-gray-400 font-thin text-sm">USD</span>
            <button className="p-1 hover:bg-gray-200 rounded transition">
              <img src="/assets/icons/arrow_swap.png" alt="Swap Arrow" className="w-4 h-4 object-contain" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Wallet className="w-4 h-4" />
            {formatBalance(selectedBalanceStr)}
          </span>
          <button onClick={handleMaxCollateralClick} className="text-sm text-gray-900">
            MAX
          </button>
        </div>
      </div>

      {isCollateralAmountExceedingBalance && (
        <div className="text-[#bc5564] text-sm">Insufficient balance, deposit to continue</div>
      )}

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
              placeholder={hasCollateralAmount ? 'Amount' : 'Enter collateral first'}
              disabled={!hasCollateralAmount}
              className={`bg-transparent font-semibold placeholder-gray-400 focus:outline-none flex-1 ${
                hasCollateralAmount ? 'text-gray-900' : 'text-gray-400 cursor-not-allowed'
              }`}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 font-thin text-sm">USD</span>
            <button className="p-1 hover:bg-gray-200 rounded transition">
              <img src="/assets/icons/arrow_swap.png" alt="Swap Arrow" className="w-4 h-4 object-contain" />
            </button>
          </div>
        </div>

        {hasCollateralAmount && (
          <div className="mt-3 flex gap-2">
            {[25, 50, 75, 100].map(percentage => (
              <button
                key={percentage}
                onClick={() => handlePercentageClick(percentage)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {percentage}%
              </button>
            ))}
          </div>
        )}

        {hasCollateralAmount && (
          <div className="mt-2 text-xs text-gray-500">
            Max borrow: {formatBalance(maxBorrowAmount.toString())} {selectedNetwork.name}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Risk Level</h3>
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
              <span
                className={
                  currentLtv > liquidationLtv
                    ? 'text-red-600'
                    : currentLtv > marginCallLtv
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }
              >
                {currentLtv.toFixed(1)}%
              </span>{' '}
              / {apiMaxLtv || selectedMarket.maxLtv}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Margin Call LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">{marginCallLtv.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Liquidation LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">{liquidationLtv.toFixed(1)}%</span>
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
            <span className="text-green-600 font-semibold text-[15px]">~{selectedNetwork.interestRate}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Daily</span>
            <span className="text-green-600 font-semibold text-[15px]">
              {isPositionLoading ? '...' : interestCalculations.daily}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Monthly</span>
            <span className="text-green-600 font-semibold text-[15px]">
              {isPositionLoading ? '...' : interestCalculations.monthly}
            </span>
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
                      Borrowing involves risk. Your collateral may be liquidated if the value drops below the required
                      threshold. Past performance is not indicative of future results.
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
          disabled={
            !hasCollateralAmount ||
            !hasBorrowAmount ||
            isInsufficientBalance ||
            isCollateralAmountExceedingBalance ||
            isBorrowing
          }
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasCollateralAmount &&
            hasBorrowAmount &&
            !isInsufficientBalance &&
            !isCollateralAmountExceedingBalance &&
            !isBorrowing
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isBorrowing ? 'Borrowing…' : hasCollateralAmount && hasBorrowAmount ? 'Borrow Now' : 'Enter amounts'}
        </button>
      ) : (
        <button
          onClick={handleApprove}
          disabled={!hasCollateralAmount || isApproving || isCollateralAmountExceedingBalance || !spenderAddress}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasCollateralAmount && !isApproving && !isCollateralAmountExceedingBalance && !!spenderAddress
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
