import ItemCard from '../ItemCard';
import { useLendingMarkets } from '@/hooks/useLendingMarkets';
import { LendingMarket } from '@/types/lending';

interface LendingProps {
  onItemClick: (item: LendingMarket) => void;
}

export default function Lending({ onItemClick }: LendingProps) {
  const { data: markets = [], isLoading, error } = useLendingMarkets();
  return (
    <div className="w-full px-4">
      <span className="text-md font-semibold">Lend Local Stable Coin</span>
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
            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-3xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/20 text-gray-700 placeholder-gray-500 placeholder:text-sm"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#767676]">Local Stablecoin</span>
            <div className="w-4 h-4 border border-[#767676] rounded-full flex items-center justify-center">
              <span className="text-xs text-[#767676] font-bold">!</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#767676]">est. APY</span>
            <div className="w-4 h-4 border border-[#767676] rounded-full flex items-center justify-center">
              <span className="text-xs text-[#767676] font-bold">!</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading markets...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">Failed to load markets</div>
          ) : (
            markets.map(market => (
              <div key={market.id} onClick={() => onItemClick(market)} className="cursor-pointer">
                <ItemCard
                  imageSrc={market.tokenLogo}
                  title={market.tokenSymbol}
                  subtitle={market.tokenName}
                  apy={market.defaultApy}
                  imageSize={36}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
