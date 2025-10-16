'use client';

import Image from 'next/image';

interface ChainOption {
  id: string;
  name: string;
  displayName: string;
  apy: string;
  icon: string;
}

interface SelectChainProps {
  onSelect: (chain: ChainOption) => void;
}

const chainOptions: ChainOption[] = [
  {
    id: 'eth',
    name: 'ETH',
    displayName: 'IDRX on ETH',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'arb',
    name: 'ARB',
    displayName: 'IDRX on ARB',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'base',
    name: 'BASE',
    displayName: 'IDRX on BASE',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'bnb',
    name: 'BNB',
    displayName: 'IDRX on BNB',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'op',
    name: 'OP',
    displayName: 'IDRX on OP',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'matic',
    name: 'MATIC',
    displayName: 'IDRX on MATIC',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'avax',
    name: 'AVAX',
    displayName: 'IDRX on AVAX',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  },
  {
    id: 'ftm',
    name: 'FTM',
    displayName: 'IDRX on FTM',
    apy: '7.91%',
    icon: '/placeholder/placeholder_selectchain.png'
  }
];

export default function SelectChain({ onSelect }: SelectChainProps) {
  const handleChainSelect = (chain: ChainOption) => {
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
        {chainOptions.map((chain) => (
          <button
            key={chain.id}
            onClick={() => handleChainSelect(chain)}
            className="w-full p-2 bg-[#F8FAFC] rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <Image
                  src={chain.icon}
                  alt={chain.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  <div className="text-gray-900">IDRX</div>
                  <div className="text-gray-500 text-sm">on {chain.name}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">{chain.apy}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
