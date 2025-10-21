'use client';

import { useState } from 'react';

interface WithdrawSupplyProps {
  onTransactionComplete?: (data: any) => void;
}

export default function WithdrawSupply({ onTransactionComplete }: WithdrawSupplyProps) {
  const [amount, setAmount] = useState('');
  const [balance] = useState(1000000);

  const handleWithdraw = () => {
    if (amount && parseFloat(amount.replace(/,/g, '')) > 0) {
      const transactionData = {
        type: 'withdraw-supply',
        supplyToken: {
          symbol: 'IDRX',
          logo: '/assets/stablecoins/idrx.png',
          amount: amount,
        },
        supplyNetwork: {
          name: 'Arbitrum',
          logo: '/assets/network/arbitrum.png',
          apy: '12.5%',
        },
        amount: amount,
      };

      onTransactionComplete?.(transactionData);
    }
  };

  const handleMaxClick = () => {
    setAmount(balance.toString());
  };

  const formatBalance = (value: number) => {
    return value.toLocaleString('id-ID');
  };

  const isInsufficientBalance = balance === 0;
  const hasAmount = amount && parseFloat(amount.replace(/,/g, '')) > 0;

  return (
    <div className="w-full space-y-5 pb-4 bg-white">
      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/assets/stablecoins/idrx.png" alt="IDRX" width={24} height={24} className="object-contain" />
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
            <span className="text-gray-900 font-semibold">IDRX</span>
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
          <span className="text-sm text-gray-500">Borrowing: {formatBalance(balance)}</span>
          <button onClick={handleMaxClick} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            MAX
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Estimated Yield Earned (IDRX)</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APY</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-green-600 font-semibold text-[15px]">~12.5%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>My Position</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Duration</span>
            <span className="text-gray-900 font-semibold text-[15px]">3M:11D:8H</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Earned</span>
            <span className="text-gray-900 font-semibold text-[15px]">375,500</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!hasAmount || isInsufficientBalance}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
          hasAmount && !isInsufficientBalance ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' : 'bg-[#a8cfe5] cursor-not-allowed'
        }`}
      >
        {hasAmount ? 'Withdraw Supply' : 'Enter an amount'}
      </button>
    </div>
  );
}
