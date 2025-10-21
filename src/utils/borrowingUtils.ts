import { getTokenById } from '@/constants/tokenConstants';
import { getNetworkById } from '@/constants/networkConstants';
import { BorrowingMarket, BorrowingNetworkOption, SupportedBorrowingPoolsMap } from '@/types/borrowing';
import { ApiBorrowingMarket } from '@/services/borrowingMarketService';

export const transformBorrowingMarkets = (apiData: ApiBorrowingMarket[] | ApiBorrowingMarket): BorrowingMarket[] => {
  const transform = (data: ApiBorrowingMarket): BorrowingMarket => {
    const token = getTokenById(data.tokenId);

    return {
      id: data.id,
      token: {
        id: data.tokenId,
        symbol: data.tokenSymbol,
        name: data.tokenName,
        logo: token?.logo || '/assets/placeholder/placeholder_selectcoin.png',
        category: token?.category || 'rwa',
      },
      maxLtv: data.maxLtv,
      liquidationThreshold: data.liquidationThreshold,
      networks: data.networks.map(network => {
        const networkData = getNetworkById(network.networkId);
        return {
          id: network.networkId,
          name: networkData?.name || network.networkId,
          networkLogo: networkData?.logo || '/assets/placeholder/placeholder_selectchain.png',
          interestRate: network.interestRate,
          maxBorrowAmount: network.maxBorrowAmount,
        } as BorrowingNetworkOption;
      }),
    };
  };

  if (Array.isArray(apiData)) {
    return apiData.map(transform);
  } else {
    return [transform(apiData)];
  }
};

export const formatBorrowingMarkets = async (pools: SupportedBorrowingPoolsMap): Promise<BorrowingMarket[]> => {
  const markets: BorrowingMarket[] = [];
  
  for (const [poolId, poolData] of Object.entries(pools)) {
    const token = getTokenById(poolId);
    
    const market: BorrowingMarket = {
      id: poolId,
      token: {
        id: poolId,
        symbol: poolData.name,
        name: poolData.name,
        logo: poolData.logo,
        category: token?.category || 'stablecoin',
      },
      maxLtv: 80,
      liquidationThreshold: 85,
      networks: poolData.networks.map(network => {
        return {
          id: network.id,
          name: network.name,
          networkLogo: network.logo,
          interestRate: '5.0',
          maxBorrowAmount: 1000000,
          chainId: network.chainId,
          address: network.address,
          decimals: network.decimals,
        } as BorrowingNetworkOption & { chainId: number; address: string; decimals: number };
      }),
    };
    
    markets.push(market);
  }
  
  return markets;
};

export const parseUnitsString = (value: string, decimals: number): string => {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '0';
  const multiplier = Math.pow(10, decimals);
  return Math.floor(num * multiplier).toString();
};
