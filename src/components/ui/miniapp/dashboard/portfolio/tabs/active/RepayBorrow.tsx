'use client';

import Tooltip from '@/components/ui/miniapp/Tooltip';
import { formatBalance } from '@/utils/formatBalance';
import { Wallet } from 'lucide-react';
import { useState } from 'react';

interface RepayBorrowProps {
  onTransactionComplete?: (data: any) => void;
}

export default function RepayBorrow({ onTransactionComplete }: RepayBorrowProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [balance] = useState(1000000);
  const minBorrow = 100000;

  const isInsufficientBalance = balance === 0;
  const hasAmount = borrowAmount && parseFloat(borrowAmount.replace(/,/g, '')) > 0;

  const handleRepay = () => {
    if (borrowAmount && parseFloat(borrowAmount.replace(/,/g, '')) >= minBorrow) {
      const transactionData = {
        type: 'repay-borrow',
        collateralToken: {
          symbol: 'bNVDA',
          logo: '/assets/rwa/bNVDA.png',
          amount: '100',
        },
        borrowToken: {
          symbol: 'IDRX',
          logo: '/assets/stablecoins/idrx.png',
          amount: borrowAmount,
        },
        borrowNetwork: {
          name: 'Arbitrum',
          logo: '/assets/network/arbitrum.png',
          apr: '0.03%',
        },
        amount: borrowAmount,
      };

      onTransactionComplete?.(transactionData);
    }
  };

  const handleMaxClick = () => {
    setAmount(balance.toString());
  };

  return (
    <div className="w-full pb-4 bg-white">
      <div className="flex flex-col items-center gap-2">
        <div className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
          <div className="text-sm text-gray-600 mb-3">Repay IDRX</div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src="/assets/stablecoins/idrx.png" alt="IDRX" width={24} height={24} className="object-contain" />
              </div>
              <input
                type="text"
                value={borrowAmount}
                onChange={e => setBorrowAmount(e.target.value)}
                placeholder="Amount"
                className="bg-transparent text-gray-900 font-semibold placeholder-gray-300 focus:outline-none flex-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-thin text-sm">USD</span>
              <button className="p-1 hover:bg-gray-200 rounded transition">
                <img
                  src="/assets/icons/arrow_swap.png"
                  alt="Swap Arrow"
                  className="w-4 h-4 object-contain"
                />
              </button>
          </div>
          </div>

          <div className="mt-5 flex items-center gap-1">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Wallet className="w-4 h-4" />
              {formatBalance(balance.toString())}
            </span>
            <button onClick={handleMaxClick} className="text-sm text-gray-900">
              MAX
            </button>
        </div> 
        </div>
        <div className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
          <div className="text-sm text-gray-600 mb-3">Withdraw bNVDA</div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src="/assets/rwa/bNVDA.png" alt="bNVDA" width={24} height={24} className="object-contain" />
              </div>
              <input
                type="text"
                value={borrowAmount}
                onChange={e => setBorrowAmount(e.target.value)}
                placeholder="Amount"
                className="bg-transparent text-gray-900 font-semibold placeholder-gray-300 focus:outline-none flex-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-thin text-sm">USD</span>
              <button className="p-1 hover:bg-gray-200 rounded transition">
                <img
                  src="/assets/icons/arrow_swap.png"
                  alt="Swap Arrow"
                  className="w-4 h-4 object-contain"
                />
              </button>
          </div>
          </div>
          <div className="mt-5 flex items-center gap-1">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Wallet className="w-4 h-4" />
              {formatBalance(balance.toString())}
            </span>
            <button onClick={handleMaxClick} className="text-sm text-gray-900">
              MAX
            </button>
        </div> 
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
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
              <span className="text-green-600">0%</span> / 80%
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
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Borrow Rate</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APR</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-red-600 font-semibold text-[15px]">~0.03%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Collateral</span>
            <span className="text-black font-semibold text-[15px]">bNVDA 100</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Borrowing</span>
            <span className="text-black font-semibold text-[15px]">IDRX 16,500,000</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Duration</span>
            <span className="text-black font-semibold text-[15px]">3M:11D:8H</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Interest</span>
            <span className="text-black font-semibold text-[15px]">IDRX 3,500</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleRepay}
        disabled={!hasAmount || isInsufficientBalance}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${
          hasAmount && !isInsufficientBalance ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' : 'bg-[#a8cfe5] cursor-not-allowed'
        }`}
      >
        {hasAmount ? 'Repay Borrow' : 'Enter an amount'}
      </button>
    </div>
  );
}
