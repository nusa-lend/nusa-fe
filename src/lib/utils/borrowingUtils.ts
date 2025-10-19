import { getTokenById } from '@/constants/token';
import { getNetworkById } from '@/constants/network';
import { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
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
