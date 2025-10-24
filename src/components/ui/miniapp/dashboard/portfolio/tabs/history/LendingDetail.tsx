'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { LoanData } from '@/services/loanService';
import { formatCurrency, formatTimestamp, getTokenSymbolFromId } from '@/services/loanService';
import { getNetworkById, NETWORKS } from '@/constants/networkConstants';

interface LendingDetailProps {
  loanData?: LoanData;
}

export default function LendingDetail({ loanData }: LendingDetailProps) {
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
        {getButtonText()}
      </button>
    </div>
  );
}
