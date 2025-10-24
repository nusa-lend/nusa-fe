'use client';

import TokenWithFlag from '../../TokenWithFlag';
import type { BorrowingTokenOption } from '@/utils/borrowingUtils';

interface TokenSelectionProps {
  tokens: BorrowingTokenOption[];
  selectedToken: BorrowingTokenOption | null;
  onTokenSelect: (token: BorrowingTokenOption) => void;
  onBack: () => void;
}

export default function TokenSelection({ tokens, selectedToken, onTokenSelect, onBack }: TokenSelectionProps) {
  const handleTokenSelect = (token: BorrowingTokenOption) => {
    onTokenSelect(token);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-md font-semibold ml-2">Select a Local Stablecoin to Borrow</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">Local Stablecoin</span>
            <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">i</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">est. APR</span>
            <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">i</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tokens.map(token => (
            <button
              key={token.id}
              onClick={() => handleTokenSelect(token)}
              className="w-full p-4 bg-[#F8FAFC] rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <TokenWithFlag
                  tokenLogo={token.icon}
                  flag={token.flag}
                  size={36}
                  flagSize={14}
                  tokenAlt={`${token.name} logo`}
                  flagAlt="Flag"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{token.name}</div>
                  <div className="text-sm text-gray-400">LLTV: {token.lltv}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">{token.apr}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
