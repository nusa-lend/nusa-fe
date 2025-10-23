'use client';

import { LoanData } from '@/services/loanService';
import { formatCurrency, formatTimestamp, getTokenSymbolFromId } from '@/services/loanService';

interface LendingDetailProps {
  loanData?: LoanData;
}

export default function LendingDetail({ loanData }: LendingDetailProps) {
  if (!loanData) {
    return (
      <div className="w-full pb-4 bg-white">
        <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Supply Details</h3>
          <p className="text-gray-500 text-sm">No transaction data available</p>
        </div>
      </div>
    );
  }

  const tokenSymbol = getTokenSymbolFromId(loanData.borrowTokenId);
  const usdValue = loanData.usdValue ?? loanData.borrowUsd;
  const isWithdrawTransaction = loanData.action === 'withdraw';
  const isSupplyTransaction = loanData.action === 'supply';
  const isRepayTransaction = loanData.action === 'repay';
  const isBorrowTransaction = loanData.action === 'borrow';
  const startDate = formatTimestamp(loanData.startTimestamp);

  const getTitle = () => {
    if (isRepayTransaction) return 'Repay Details';
    if (isBorrowTransaction) return 'Borrow Details';
    if (isWithdrawTransaction) {
      const entryType = loanData.entryType === 'liquidity' ? 'Liquidity' : 'Collateral';
      return `${entryType} Withdraw Details`;
    }
    if (isSupplyTransaction) {
      const entryType = loanData.entryType === 'liquidity' ? 'Liquidity' : 'Collateral';
      return `${entryType} Supply Details`;
    }
    return `Supply Details (${tokenSymbol})`;
  };

  const getButtonText = () => {
    if (isRepayTransaction) return 'Repay More';
    if (isBorrowTransaction) return 'Borrow More';
    if (isWithdrawTransaction) return 'Withdraw More';
    if (isSupplyTransaction) return 'Supply More';
    return 'Supply More';
  };

  return (
    <div className="w-full pb-4 bg-white">
      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">{getTitle()}</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Amount</span>
            <span className="text-black font-semibold text-[15px]">{formatCurrency(Math.abs(usdValue))}</span>
          </div>
          {loanData.entryType && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Type</span>
              <span className="text-black font-semibold text-[15px]">
                {loanData.entryType === 'liquidity' ? 'Liquidity' : 'Collateral'}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Action</span>
            <span className="text-black font-semibold text-[15px]">
              {loanData.action ? loanData.action.charAt(0).toUpperCase() + loanData.action.slice(1) : 'Supply'}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Date</span>
            <span className="text-black font-semibold text-[15px]">{startDate}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Status</span>
            <span className="text-green-600 font-semibold text-[15px]">COMPLETED</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {}}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${'bg-[#56A2CC] hover:bg-[#56A2CC]/80'}`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
