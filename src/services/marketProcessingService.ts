import { rayToPercentString } from '@/utils/calculationUtils';
import { NETWORKS } from '@/constants/networkConstants';
import { PonderMarket } from './marketApiService';

export type ApiLendingMarketNetwork = {
  networkId: string;
  apy: string;
};

export type ApiLendingMarket = {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  defaultApy: string;
  networks: ApiLendingMarketNetwork[];
};

const getNetworkId = (chainId: string) => {
  const numeric = Number(chainId);
  const network = NETWORKS.find(net => net.chainId === numeric);
  if (network) return network.id;
  return chainId;
};

export const processMarketsData = (markets: PonderMarket[]): ApiLendingMarket[] => {
  return markets.map(market => {
    const tokenSymbol = market.token?.symbol ?? 'UNKNOWN';
    const tokenName = market.token?.name ?? tokenSymbol;
    const networkId = getNetworkId(market.chainId);
    const apy = rayToPercentString(market.supplyRateRay);

    return {
      id: market.id,
      tokenSymbol,
      tokenName,
      tokenId: tokenSymbol.toLowerCase(),
      defaultApy: apy,
      networks: [
        {
          networkId,
          apy,
        },
      ],
    };
  });
};
