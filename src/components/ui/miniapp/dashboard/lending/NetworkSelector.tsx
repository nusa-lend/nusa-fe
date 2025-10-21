'use client';

import { useAccount } from 'wagmi';
import { Wallet } from 'lucide-react';
import { useTokenBalances } from '@/hooks/useUserBalances';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';

interface NetworkSelectorProps {
  market: LendingMarket;
  onNetworkSelect: (network: LendingNetworkOption) => void;
}

export default function NetworkSelector({ market, onNetworkSelect }: NetworkSelectorProps) {
  const { address } = useAccount();
  const { data: balances } = useTokenBalances({ userAddress: address, market });

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
        {market.networks.map(network => (
          <button
            key={network.id}
            onClick={() => handleNetworkSelect(network)}
            className="w-full p-3 bg-[#F8FAFC] rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <TokenNetworkPair tokenLogo={market.tokenLogo} networkLogo={network.networkLogo} size={30} overlap={25} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    <div className="text-gray-900">{market.tokenSymbol}</div>
                    <div className="text-gray-500 text-sm">on {network.name}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">{network.apy || market.defaultApy}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
