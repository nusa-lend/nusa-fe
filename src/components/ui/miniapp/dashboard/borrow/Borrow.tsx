'use client';

import { useState } from 'react';
import ItemCard from '../ItemCard';
import type { BorrowingMarket } from '@/types/borrowing';
import { ChevronsLeftRight } from 'lucide-react';
import Tooltip from '../../Tooltip';

interface BorrowProps {
  onItemClick: (market: BorrowingMarket) => void;
  markets: BorrowingMarket[];
  isLoading: boolean;
  error: any;
}

export default function Borrow({ onItemClick, markets, isLoading, error }: BorrowProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleItemClick = (market: BorrowingMarket) => {
    onItemClick(market);
  };

  const filteredMarkets = markets.filter(
    market =>
      market.token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-full px-4">
        <span className="text-md font-semibold">Borrow with your Collateral</span>
        <div className="mt-4 p-4 rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[25.3px]">
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4">
        <span className="text-md font-semibold">Borrow with your Collateral</span>
        <div className="mt-4 p-4 rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[25.3px]">
          <div className="text-center text-red-500 py-8">Failed to load borrowing markets</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-4">
        <span className="text-md font-semibold">Borrow with your Collateral</span>
        <div className="mt-4 p-4 rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[25.3px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5" fill="none" stroke="#b2b2b2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search coin"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-3xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/20 text-gray-700 placeholder-gray-500 placeholder:text-sm"
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <Tooltip
              content="Use your tokens as collateral to borrow stablecoin. Collateral does not earn interest."
              trigger="click"
              position="right"
              className="z-50"
            >
              <div className="flex items-center space-x-1 cursor-pointer">
                <ChevronsLeftRight className="w-5 h-5 text-[#767676] rotate-90 hover:text-[#5a5a5a] transition-colors" />
                <span className="text-[14px] font-normal text-[#767676]">Collateral</span>
                <div className="w-4 h-4 border border-[#767676] rounded-full flex items-center justify-center">
                  <span className="text-xs text-[#767676] font-bold">!</span>
                </div>
              </div>
            </Tooltip>

            <Tooltip
              content="This is estimated Borrow Rate of your position."
              trigger="click"
              position="right"
              className="z-50"
            >
              <div className="flex items-center space-x-1 cursor-pointer">
                <span className="text-[14px] font-normal text-[#767676]">est. APR</span>
                <div className="w-4 h-4 border border-[#767676] rounded-full flex items-center justify-center">
                  <span className="text-xs text-[#767676] font-bold">!</span>
                </div>
              </div>
            </Tooltip>
          </div>

          <div className="space-y-2">
            {filteredMarkets.length > 0 ? (
              filteredMarkets.map(market => (
                <div key={market.id} onClick={() => handleItemClick(market)} className="cursor-pointer">
                  <ItemCard
                    imageSrc={market.token.logo}
                    title={market.token.symbol}
                    subtitle={`Balance 0.00`}
                    apy={market.networks[0]?.interestRate || '0%'}
                    apyColor="#279E73"
                    imageSize={36}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-black font-medium text-md">Token not found</div>
                <div className="text-gray-500 text-[13px]">Suggest a token to be added</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
