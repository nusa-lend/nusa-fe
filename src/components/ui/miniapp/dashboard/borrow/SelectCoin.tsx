'use client';

import Image from 'next/image';
import TokenWithFlag from '../../TokenWithFlag';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
import { Wallet } from 'lucide-react';
import { formatBalance } from '@/utils/formatBalance';
import type { BorrowingTokenOption } from '@/utils/borrowingUtils';
import { SUPPORTED_BORROWING_POOLS } from '@/constants/borrowConstants';

interface SelectCoinProps {
  market: BorrowingMarket;
  onSelect: (network: BorrowingNetworkOption) => void;
  balance?: string;
  borrowingTokens: BorrowingTokenOption[];
  selectedMarketId?: string;
}

export default function SelectCoin({ market, onSelect, balance, borrowingTokens, selectedMarketId }: SelectCoinProps) {

  const handleStablecoinSelect = (stablecoin: any) => {
    const stablecoinPool = SUPPORTED_BORROWING_POOLS[stablecoin.id as keyof typeof SUPPORTED_BORROWING_POOLS];
    if (!stablecoinPool) {
      console.error('Stablecoin pool not found:', stablecoin.id);
      return;
    }
    
    const selectedNetwork = stablecoinPool.networks[0];
    
    const networkOption: BorrowingNetworkOption = {
      id: selectedNetwork.id,
      name: stablecoin.name,
      networkLogo: stablecoin.icon,
      interestRate: stablecoin.apr,
      maxBorrowAmount: 100000,
      chainId: selectedNetwork.chainId,
      address: selectedNetwork.address,
      decimals: selectedNetwork.decimals,
    };
    onSelect(networkOption);
  };

  return (
    <div className="space-y-6">
      <p className="text-md font-semibold">Select a Local Stablecoin to Borrow</p>

      <div className="space-y-3">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500">Collateral</span>
          <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs font-bold">i</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={market.token.logo}
                alt={market.token.symbol}
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{market.token.symbol}</div>
              <div className="text-sm text-gray-400 flex items-center space-x-1">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span>{formatBalance(balance)}</span>
              </div>
            </div>
          </div>
        </div>
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
          {borrowingTokens
            .filter(token => !selectedMarketId || token.id !== selectedMarketId)
            .map(localStablecoin => (
            <button
              key={localStablecoin.id}
              onClick={() => handleStablecoinSelect(localStablecoin)}
              className="w-full p-4 bg-[#F8FAFC] rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <TokenWithFlag
                  tokenLogo={localStablecoin.icon}
                  flag={localStablecoin.flag}
                  size={36}
                  flagSize={14}
                  tokenAlt={`${localStablecoin.name} logo`}
                  flagAlt="Flag"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{localStablecoin.name}</div>
                  <div className="text-sm text-gray-400">LLTV: {localStablecoin.lltv}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">{localStablecoin.apr}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
