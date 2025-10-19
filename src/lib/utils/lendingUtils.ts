import { getTokenById } from '@/constants/token';
import { getNetworkById } from '@/constants/network';
import { LendingMarket, LendingNetworkOption } from '@/types/lending';
import { ApiLendingMarket } from '@/services/lendingMarketService';

export const transformLendingMarkets = (apiData: ApiLendingMarket[] | ApiLendingMarket): LendingMarket[] => {
  const transform = (data: ApiLendingMarket): LendingMarket => {
    const token = getTokenById(data.tokenId);

    return {
      id: data.id,
      tokenSymbol: data.tokenSymbol,
      tokenName: data.tokenName,
      tokenLogo: token?.logo || '/assets/placeholder/placeholder_selectcoin.png',
      defaultApy: data.defaultApy,
      networks: data.networks.map(network => {
        const networkData = getNetworkById(network.networkId);
        return {
          id: network.networkId,
          name: networkData?.name || network.networkId,
          networkLogo: networkData?.logo || '/assets/placeholder/placeholder_selectchain.png',
          apy: network.apy,
        } as LendingNetworkOption;
      }),
    };
  };

  if (Array.isArray(apiData)) {
    return apiData.map(transform);
  } else {
    return [transform(apiData)];
  }
};
