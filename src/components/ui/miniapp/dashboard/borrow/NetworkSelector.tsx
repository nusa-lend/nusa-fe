'use client';

import TokenPair from '@/components/ui/miniapp/TokenPair';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
import type { BorrowingTokenOption } from '@/utils/borrowingUtils';
import { SUPPORTED_BORROWING_POOLS } from '@/constants/borrowConstants';

interface NetworkSelectorProps {
  market: BorrowingMarket;
  selectedBorrowToken: BorrowingTokenOption;
  onNetworkSelect: (network: BorrowingNetworkOption) => void;
  onBack: () => void;
}

export default function NetworkSelector({
  market,
  selectedBorrowToken,
  onNetworkSelect,
  onBack,
}: NetworkSelectorProps) {
  const handleNetworkSelect = (network: BorrowingNetworkOption) => {
    onNetworkSelect(network);
  };

  const tokenPool = SUPPORTED_BORROWING_POOLS[selectedBorrowToken.id as keyof typeof SUPPORTED_BORROWING_POOLS];
  const availableNetworks = tokenPool?.networks || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-md font-semibold ml-2">Select Network for {selectedBorrowToken.name}</p>
      </div>

      <div className="space-y-3">
        {availableNetworks.map(network => {
          const isDisabled = !network.isActive;
          
          return (
            <button
              key={network.chainId}
              onClick={() =>
                !isDisabled &&
                handleNetworkSelect({
                  id: `${selectedBorrowToken.id}-${network.chainId}`,
                  name: network.name,
                  networkLogo: network.logo,
                  interestRate: '0%',
                  maxBorrowAmount: 100000,
                  chainId: network.chainId,
                  address: network.address,
                  decimals: network.decimals,
                })
              }
              disabled={isDisabled}
              className={`w-full p-3 rounded-xl transition-colors duration-200 flex items-center justify-between ${
                isDisabled
                  ? 'bg-gray-100 cursor-not-allowed opacity-50'
                  : 'bg-[#F8FAFC] hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <TokenPair 
                    tokenLogo={selectedBorrowToken.icon} 
                    networkLogo={network.logo} 
                    size={30} 
                    overlap={25}
                    className={isDisabled ? 'opacity-50' : ''}
                  />
                  <div className="text-left">
                    <div className="font-medium">
                      <div className={isDisabled ? 'text-gray-400' : 'text-gray-900'}>
                        {selectedBorrowToken.name}
                      </div>
                      <div className={`text-sm ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                        on {network.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isDisabled && (
                <div className="text-xs text-gray-400">Coming Soon</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
