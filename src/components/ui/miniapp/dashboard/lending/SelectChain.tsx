'use client';

import TokenNetworkPair from '../../TokenNetworkPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/hooks/useUserBalances';

interface SelectChainProps {
  market: LendingMarket;
  onSelect: (network: LendingNetworkOption) => void;
}

export default function SelectChain({ market, onSelect }: SelectChainProps) {
  const { address } = useAccount();
  const { data: balances } = useTokenBalances({ userAddress: address, market });

  const handleChainSelect = (chain: LendingNetworkOption) => {
    onSelect(chain);
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
        {market.networks.map(chain => (
          <button
            key={chain.id}
            onClick={() => handleChainSelect(chain)}
            className="w-full p-3 bg-[#F8FAFC] rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <TokenNetworkPair tokenLogo={market.tokenLogo} networkLogo={chain.networkLogo} size={30} overlap={25} />
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  <div className="text-gray-900">{market.tokenSymbol}</div>
                  <div className="text-gray-500 text-sm">on {chain.name}</div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                <Wallet className="w-4 h-4" />
                <span>{(balances && (balances as any)[chain.id]) || '0'}</span>
              </div>
              <div className="text-sm font-medium text-green-600">{chain.apy || market.defaultApy}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
