'use client';

import TokenPair from '@/components/ui/miniapp/TokenPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';

interface NetworkSelectorProps {
  market: LendingMarket;
  onNetworkSelect: (network: LendingNetworkOption) => void;
}

export default function NetworkSelector({ market, onNetworkSelect }: NetworkSelectorProps) {
  const handleNetworkSelect = (network: LendingNetworkOption) => {
    onNetworkSelect(network);
  };

  return (
    <div className="space-y-4">
      <p className="text-md font-semibold">Select Chain</p>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400">Multichain Support</span>
          <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs font-bold">!</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400">est. APY</span>
          <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs font-bold">!</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {market.networks.map(network => {
          const isDisabled = !network.isActive;
          
          return (
            <button
              key={network.id}
              onClick={() => !isDisabled && handleNetworkSelect(network)}
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
                    tokenLogo={market.tokenLogo} 
                    networkLogo={network.networkLogo} 
                    size={30} 
                    overlap={25}
                    className={isDisabled ? 'opacity-50' : ''}
                  />
                  <div className="text-left">
                    <div className="font-medium">
                      <div className={isDisabled ? 'text-gray-400' : 'text-gray-900'}>
                        {market.tokenSymbol}
                      </div>
                      <div className={`text-sm ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                        on {network.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-green-600'}`}>
                  {network.apy || market.defaultApy}
                </div>
                {isDisabled && (
                  <div className="text-xs text-gray-400 mt-1">Coming Soon</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
