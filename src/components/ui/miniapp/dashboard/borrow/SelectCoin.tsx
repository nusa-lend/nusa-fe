'use client';

import Image from 'next/image';
import TokenWithFlag from '../../TokenWithFlag';

interface StablecoinOption {
  id: string;
  name: string;
  lltv: string;
  apr: string;
  icon: string;
  flag: string;
}

interface SelectCoinProps {
  onSelect: (stablecoin: StablecoinOption) => void;
}

const stablecoinOptions: StablecoinOption[] = [
  {
    id: 'idrx',
    name: 'IDRX',
    lltv: '80%',
    apr: '0.03%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
  {
    id: 'xidr',
    name: 'XIDR',
    lltv: '80%',
    apr: '0.07%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
  {
    id: 'usdc',
    name: 'USDC',
    lltv: '80%',
    apr: '0.033%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
  {
    id: 'usde',
    name: 'USDe',
    lltv: '80%',
    apr: '0.033%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
  {
    id: 'xsgd',
    name: 'XSGD',
    lltv: '80%',
    apr: '0.033%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
  {
    id: 'eurc',
    name: 'EURC',
    lltv: '80%',
    apr: '0.033%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
  {
    id: 'jeur',
    name: 'jEUR',
    lltv: '80%',
    apr: '0.033%',
    icon: '/assets/stablecoins/eurc.png',
    flag: '/assets/flags/flag-id.png',
  },
];

export default function SelectCoin({ onSelect }: SelectCoinProps) {
  const handleStablecoinSelect = (stablecoin: StablecoinOption) => {
    onSelect(stablecoin);
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
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src="/placeholder/placeholder_selectcoin.png"
                alt="Collateral Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900">bNVDA</div>
              <div
                className="text-sm text-gray-400\
              "
              >
                Balance 0.00
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
          {stablecoinOptions.map(stablecoin => (
            <button
              key={stablecoin.id}
              onClick={() => handleStablecoinSelect(stablecoin)}
              className="w-full p-4 bg-[#F8FAFC] rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <TokenWithFlag
                  tokenLogo={stablecoin.icon}
                  flag={stablecoin.flag}
                  size={36}
                  flagSize={14}
                  tokenAlt={`${stablecoin.name} logo`}
                  flagAlt="Flag"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{stablecoin.name}</div>
                  <div className="text-sm text-gray-400">LLTV: {stablecoin.lltv}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">{stablecoin.apr}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
