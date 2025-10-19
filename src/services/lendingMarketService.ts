import { LendingMarket } from '@/types/lending';
import { transformLendingMarkets } from '@/lib/utils/lendingUtils';

export interface ApiLendingMarket {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  defaultApy: string;
  networks: ApiLendingNetwork[];
}

export interface ApiLendingNetwork {
  networkId: string;
  apy: string;
}

// Mock
export const getLendingMarketsFromAPI = async (): Promise<ApiLendingMarket[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    {
      id: 'idrx',
      tokenSymbol: 'IDRX',
      tokenName: 'IDRX',
      tokenId: 'idrx',
      defaultApy: '7.91%',
      networks: [
        { networkId: 'arbitrum', apy: '7.91%' },
        { networkId: 'base', apy: '7.70%' },
        { networkId: 'sui', apy: '7.50%' },
        { networkId: 'hyperliquid', apy: '7.20%' },
      ],
    },
    {
      id: 'usde',
      tokenSymbol: 'USDE',
      tokenName: 'USDE',
      tokenId: 'usde',
      defaultApy: '6.45%',
      networks: [
        { networkId: 'arbitrum', apy: '6.40%' },
        { networkId: 'base', apy: '6.10%' },
      ],
    },
    {
      id: 'eurc',
      tokenSymbol: 'EURC',
      tokenName: 'Euro Coin',
      tokenId: 'eurc',
      defaultApy: '5.82%',
      networks: [
        { networkId: 'arbitrum', apy: '5.70%' },
        { networkId: 'base', apy: '5.50%' },
      ],
    },
  ];
};

export const fetchLendingMarkets = async (): Promise<LendingMarket[]> => {
  try {
    const apiData = await getLendingMarketsFromAPI();
    return transformLendingMarkets(apiData);
  } catch (error) {
    console.error('Failed to fetch lending markets:', error);
    return [];
  }
};
