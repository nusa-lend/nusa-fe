'use client';

import {
  formatCurrency,
  formatDuration,
  formatTimestamp,
  getCollateralTokenSymbolFromLoan,
  getCollateralTokenFromPosition,
} from '@/services/loanService';
import { LoanData } from '@/services/loanService';
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { getNetworkById, NETWORKS } from '@/constants/networkConstants';

interface BorrowDetailProps {
  loanData?: LoanData;
}

export default function BorrowDetail({ loanData }: BorrowDetailProps) {
  const [borrowedTokenSymbol, setBorrowedTokenSymbol] = useState<string>('CNGN');
  const [copied, setCopied] = useState(false);

  const getTransactionHash = () => {
    return loanData?.startTxHash || loanData?.endTxHash;
  };

  const getNetworkId = () => {
    const chainId = loanData?.chainId;
    if (!chainId) return undefined;

    const numeric = Number(chainId);
    const network = NETWORKS.find(net => net.chainId === numeric);
    return network?.id;
  };

  const handleCopyHash = async () => {
    const txHash = getTransactionHash();
    if (txHash) {
      try {
        await navigator.clipboard.writeText(txHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy transaction hash:', err);
      }
    }
  };

  const handleOpenExplorer = () => {
    const txHash = getTransactionHash();
    const networkId = getNetworkId();
    if (txHash && networkId) {
      const network = getNetworkById(networkId);
      if (network?.explorerUrl) {
        const explorerUrl = `${network.explorerUrl}/tx/${txHash}`;
        window.open(explorerUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

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

  const isSupplyTransaction = loanData.historyType === 'supply';
  const isWithdrawTransaction = loanData.action === 'withdraw';
  const isRepayTransaction = loanData.action === 'repay';
  const isBorrowTransaction = loanData.action === 'borrow';
  const usdValue = loanData.usdValue ?? loanData.borrowUsd;

  if (isSupplyTransaction || isWithdrawTransaction) {
    const entryTypeLabel = loanData.entryType === 'liquidity' ? 'Liquidity' : 'Collateral';
    const actionLabel = loanData.action === 'withdraw' ? 'Withdraw' : 'Supply';

    return (
      <div className="w-full pb-4 bg-white">
        <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            {actionLabel} Details ({entryTypeLabel})
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Amount</span>
              <span className="text-black font-semibold text-[15px]">{formatCurrency(Math.abs(usdValue))}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Type</span>
              <span className="text-black font-semibold text-[15px">{entryTypeLabel}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Action</span>
              <span className="text-black font-semibold text-[15px]">{actionLabel}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Date</span>
              <span className="text-black font-semibold text-[15px]">{startDate}</span>
            </div>
            {getTransactionHash() && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tx Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-black font-semibold text-[15px]">
                    {getTransactionHash()?.slice(0, 6)}...{getTransactionHash()?.slice(-4)}
                  </span>
                  <div className="flex items-center gap-1">
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
                    <button
                      onClick={handleOpenExplorer}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View on block explorer"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            )}
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
          {actionLabel} More
        </button>
      </div>
    );
  }

  if (isRepayTransaction) {
    return (
      <div className="w-full pb-4 bg-white">
        <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Repay Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Repaid Amount</span>
              <span className="text-black font-semibold text-[15px]">{formatCurrency(Math.abs(usdValue))}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Date</span>
              <span className="text-black font-semibold text-[15px]">{startDate}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Status</span>
              <span className="text-green-600 font-semibold text-[15px]">COMPLETED</span>
            </div>
            {getTransactionHash() && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tx Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-black font-semibold text-[15px]">
                    {getTransactionHash()?.slice(0, 6)}...{getTransactionHash()?.slice(-4)}
                  </span>
                  <div className="flex items-center gap-1">
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
                    <button
                      onClick={handleOpenExplorer}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View on block explorer"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {}}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${'bg-[#56A2CC] hover:bg-[#56A2CC]/80'}`}
        >
          Repay More
        </button>
      </div>
    );
  }

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
            <span className="text-black font-semibold text-[15px]">
              {collateralTokenSymbol} {formatCurrency(loanData.collateralUsd || 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Borrowing</span>
            <span className="text-black font-semibold text-[15px]">
              {borrowedTokenSymbol} {formatCurrency(loanData.borrowUsd)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Duration</span>
            <span className="text-black font-semibold text-[15px]">{duration}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Interest</span>
            <span className="text-black font-semibold text-[15px]">
              {formatCurrency(loanData.estimatedInterestUsd)}
            </span>
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
            <span
              className={`font-semibold text-[15px] ${loanData.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}
            >
              {loanData.status.toUpperCase()}
            </span>
          </div>
          {getTransactionHash() && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tx Hash</span>
              <div className="flex items-center gap-2">
                <span className="text-black font-semibold text-[15px]">
                  {getTransactionHash()?.slice(0, 6)}...{getTransactionHash()?.slice(-4)}
                </span>
                <div className="flex items-center gap-1">
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
                  <button
                    onClick={handleOpenExplorer}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="View on block explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
