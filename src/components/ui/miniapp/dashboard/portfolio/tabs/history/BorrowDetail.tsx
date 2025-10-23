'use client';

import { formatCurrency, formatDuration, formatTimestamp, getCollateralTokenSymbolFromLoan, getCollateralTokenFromPosition } from '@/services/loanService';
import { LoanData } from '@/services/loanService';
import { useState, useEffect } from 'react';

interface BorrowDetailProps {
  loanData?: LoanData;
}

export default function BorrowDetail({ loanData }: BorrowDetailProps) {
  const [borrowedTokenSymbol, setBorrowedTokenSymbol] = useState<string>('CNGN');

  useEffect(() => {
    if (loanData?.positionId) {
      getCollateralTokenFromPosition(loanData.positionId).then(setBorrowedTokenSymbol);
    }
  }, [loanData?.positionId]);

  if (!loanData) {
    return (
      <div className="w-full pb-4 bg-white">
        <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Borrow Rate</h3>
          <p className="text-gray-500 text-sm">No loan data available</p>
        </div>
      </div>
    );
  }

  const collateralTokenSymbol = getCollateralTokenSymbolFromLoan(loanData);
  const duration = loanData.durationSeconds > 0 ? formatDuration(loanData.durationSeconds) : 'Active';
  const startDate = formatTimestamp(loanData.startTimestamp);
  const endDate = loanData.endTimestamp ? formatTimestamp(loanData.endTimestamp) : 'Ongoing';
  return (
    <div className="w-full pb-4 bg-white">
      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Borrow Rate</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APR</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-red-600 font-semibold text-[15px]">{loanData.borrowAprPercent}%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Collateral</span>
            <span className="text-black font-semibold text-[15px]">{collateralTokenSymbol} {formatCurrency(loanData.collateralUsd)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Borrowing</span>
            <span className="text-black font-semibold text-[15px]">{borrowedTokenSymbol} {formatCurrency(loanData.borrowUsd)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Duration</span>
            <span className="text-black font-semibold text-[15px]">{duration}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Interest</span>
            <span className="text-black font-semibold text-[15px]">{formatCurrency(loanData.estimatedInterestUsd)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Start Date</span>
            <span className="text-black font-semibold text-[15px]">{startDate}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>End Date</span>
            <span className="text-black font-semibold text-[15px]">{endDate}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Status</span>
            <span className={`font-semibold text-[15px] ${loanData.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}>
              {loanData.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {loanData.status === 'open' && (
        <button
          onClick={() => {}}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${'bg-[#56A2CC] hover:bg-[#56A2CC]/80'}`}
        >
          Borrow More
        </button>
      )}
    </div>
  );
}
