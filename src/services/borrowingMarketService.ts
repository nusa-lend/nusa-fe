import { BorrowingMarket } from '@/types/borrowing';
import { transformBorrowingMarkets } from '@/lib/utils/borrowingUtils';

export interface ApiBorrowingMarket {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  maxLtv: number;
  liquidationThreshold: number;
  networks: ApiBorrowingNetwork[];
}

export interface ApiBorrowingNetwork {
  networkId: string;
  interestRate: string;
  maxBorrowAmount: number;
}

// Mock data for borrowing markets
export const getBorrowingMarketsFromAPI = async (): Promise<ApiBorrowingMarket[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    {
      id: 'bcoin',
      tokenSymbol: 'bCOIN',
      tokenName: 'bCOIN',
      tokenId: 'bcoin',
      maxLtv: 0.75,
      liquidationThreshold: 0.8,
      networks: [
        { networkId: 'arbitrum', interestRate: '7.91%', maxBorrowAmount: 100000 },
        { networkId: 'base', interestRate: '7.70%', maxBorrowAmount: 100000 },
        { networkId: 'sui', interestRate: '7.50%', maxBorrowAmount: 100000 },
        { networkId: 'hyperliquid', interestRate: '7.20%', maxBorrowAmount: 100000 },
      ],
    },
    {
      id: 'bcspx',
      tokenSymbol: 'bCSPX',
      tokenName: 'bCSPX',
      tokenId: 'bcspx',
      maxLtv: 0.8,
      liquidationThreshold: 0.85,
      networks: [
        { networkId: 'arbitrum', interestRate: '6.45%', maxBorrowAmount: 50000 },
        { networkId: 'base', interestRate: '6.10%', maxBorrowAmount: 50000 },
      ],
    },
    {
      id: 'bnvda',
      tokenSymbol: 'bNVDA',
      tokenName: 'bNVDA',
      tokenId: 'bnvda',
      maxLtv: 0.7,
      liquidationThreshold: 0.75,
      networks: [
        { networkId: 'arbitrum', interestRate: '5.82%', maxBorrowAmount: 75000 },
        { networkId: 'base', interestRate: '5.50%', maxBorrowAmount: 75000 },
      ],
    },
    {
      id: 'bgme',
      tokenSymbol: 'bGME',
      tokenName: 'bGME',
      tokenId: 'bgme',
      maxLtv: 0.65,
      liquidationThreshold: 0.7,
      networks: [
        { networkId: 'arbitrum', interestRate: '8.15%', maxBorrowAmount: 25000 },
        { networkId: 'base', interestRate: '7.90%', maxBorrowAmount: 25000 },
      ],
    },
    {
      id: 'bgoogl',
      tokenSymbol: 'bGOOGL',
      tokenName: 'bGOOGL',
      tokenId: 'bgoogl',
      maxLtv: 0.8,
      liquidationThreshold: 0.85,
      networks: [
        { networkId: 'arbitrum', interestRate: '6.78%', maxBorrowAmount: 60000 },
        { networkId: 'base', interestRate: '6.50%', maxBorrowAmount: 60000 },
      ],
    },
    {
      id: 'bhigh',
      tokenSymbol: 'bHIGH',
      tokenName: 'bHIGH',
      tokenId: 'bhigh',
      maxLtv: 0.7,
      liquidationThreshold: 0.75,
      networks: [
        { networkId: 'arbitrum', interestRate: '7.23%', maxBorrowAmount: 40000 },
        { networkId: 'base', interestRate: '7.00%', maxBorrowAmount: 40000 },
      ],
    },
    {
      id: 'bib01',
      tokenSymbol: 'bIB01',
      tokenName: 'bIB01',
      tokenId: 'bib01',
      maxLtv: 0.9,
      liquidationThreshold: 0.95,
      networks: [
        { networkId: 'arbitrum', interestRate: '5.45%', maxBorrowAmount: 200000 },
        { networkId: 'base', interestRate: '5.20%', maxBorrowAmount: 200000 },
      ],
    },
    {
      id: 'bibta',
      tokenSymbol: 'bIBTA',
      tokenName: 'bIBTA',
      tokenId: 'bibta',
      maxLtv: 0.9,
      liquidationThreshold: 0.95,
      networks: [
        { networkId: 'arbitrum', interestRate: '4.92%', maxBorrowAmount: 150000 },
        { networkId: 'base', interestRate: '4.70%', maxBorrowAmount: 150000 },
      ],
    },
    {
      id: 'bmsft',
      tokenSymbol: 'bMSFT',
      tokenName: 'bMSFT',
      tokenId: 'bmsft',
      maxLtv: 0.8,
      liquidationThreshold: 0.85,
      networks: [
        { networkId: 'arbitrum', interestRate: '6.34%', maxBorrowAmount: 80000 },
        { networkId: 'base', interestRate: '6.10%', maxBorrowAmount: 80000 },
      ],
    },
    {
      id: 'btsla',
      tokenSymbol: 'bTSLA',
      tokenName: 'bTSLA',
      tokenId: 'btsla',
      maxLtv: 0.6,
      liquidationThreshold: 0.65,
      networks: [
        { networkId: 'arbitrum', interestRate: '9.12%', maxBorrowAmount: 30000 },
        { networkId: 'base', interestRate: '8.80%', maxBorrowAmount: 30000 },
      ],
    },
    {
      id: 'bzpr1',
      tokenSymbol: 'bZPR1',
      tokenName: 'bZPR1',
      tokenId: 'bzpr1',
      maxLtv: 0.85,
      liquidationThreshold: 0.9,
      networks: [
        { networkId: 'arbitrum', interestRate: '5.67%', maxBorrowAmount: 120000 },
        { networkId: 'base', interestRate: '5.40%', maxBorrowAmount: 120000 },
      ],
    },
  ];
};

export const fetchBorrowingMarkets = async (): Promise<BorrowingMarket[]> => {
  try {
    const apiData = await getBorrowingMarketsFromAPI();
    return transformBorrowingMarkets(apiData);
  } catch (error) {
    console.error('Failed to fetch borrowing markets:', error);
    return [];
  }
};
