import { getTokenById } from '@/constants/tokenConstants';
import { BorrowingMarket, BorrowingNetworkOption, SupportedBorrowingPoolsMap } from '@/types/borrowing';
import { fetchBorrowingMarketsFromPositionsAPI } from '@/services/borrowingMarketService';
import { SUPPORTED_BORROWING_POOLS } from '@/constants/borrowConstants';

export interface BorrowingTokenOption {
  id: string;
  name: string;
  lltv: string;
  apr: string;
  icon: string;
  flag: string;
}

export const formatBorrowingMarkets = async (
  pools: SupportedBorrowingPoolsMap,
  account?: string
): Promise<BorrowingMarket[]> => {
  const markets: BorrowingMarket[] = [];

  let positionsMarkets: any[] = [];

  if (account) {
    try {
      positionsMarkets = await fetchBorrowingMarketsFromPositionsAPI(account);
    } catch (error) {
      console.warn('Failed to fetch borrowing markets from positions:', error);
    }
  }

  for (const [poolId, poolData] of Object.entries(pools)) {
    const token = getTokenById(poolId);

    const networks: BorrowingNetworkOption[] = [];

    for (const network of poolData.networks) {
      let interestRate: string;

      const positionMarket = positionsMarkets.find(m => m.symbol.toLowerCase() === poolData.name.toLowerCase());

      if (positionMarket) {
        interestRate = positionMarket.borrowRatePercent;
      } else {
        const fallbackRate = (Math.random() * 2 + 1).toFixed(2);
        interestRate = `${fallbackRate}%`;
      }

      networks.push({
        id: network.id,
        name: network.name,
        networkLogo: network.logo,
        interestRate,
        maxBorrowAmount: 1000000,
        chainId: network.chainId,
        address: network.address,
        decimals: network.decimals,
      } as BorrowingNetworkOption & { chainId: number; address: string; decimals: number });
    }

    const market: BorrowingMarket = {
      id: poolId,
      token: {
        id: poolId,
        symbol: poolData.name,
        name: poolData.name,
        logo: poolData.logo,
        logoCountry: poolData.logoCountry,
        category: token?.category || 'stablecoin',
      },
      maxLtv: 80,
      liquidationThreshold: 85,
      networks,
    };

    markets.push(market);
  }

  return markets;
};

export const parseUnitsString = (value: string, decimals: number): string => {
  const clean = (value || '').replace(/,/g, '').trim();
  if (!clean) return '0';
  const neg = clean.startsWith('-');
  const s = neg ? clean.slice(1) : clean;
  const parts = s.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').slice(0, decimals).padEnd(decimals, '0');
  const digits = whole + frac;
  let acc = BigInt(0);
  for (let i = 0; i < digits.length; i++) {
    const code = digits.charCodeAt(i) - 48;
    acc = acc * BigInt(10) + BigInt(code < 0 ? 0 : code);
  }
  return (neg ? -acc : acc).toString();
};

export async function formatBorrowingTokens(
  excludeTokenId?: string,
  account?: string
): Promise<BorrowingTokenOption[]> {
  const pools = SUPPORTED_BORROWING_POOLS as unknown as SupportedBorrowingPoolsMap;

  let positionsMarkets: any[] = [];

  if (account) {
    try {
      positionsMarkets = await fetchBorrowingMarketsFromPositionsAPI(account);
    } catch (error) {
      console.warn('Failed to fetch borrowing markets from positions:', error);
    }
  }

  return Object.values(pools)
    .filter(pool => !excludeTokenId || pool.id !== excludeTokenId)
    .map(pool => {
      const positionMarket = positionsMarkets.find(m => m.symbol.toLowerCase() === pool.name.toLowerCase());

      let apr: string;
      let lltv: string;

      if (positionMarket) {
        apr = positionMarket.borrowRatePercent;
        const lltvValue = positionMarket.liquidationThresholdPercent || '80%';
        lltv = lltvValue.replace('.00%', '%');
      } else {
        let fallbackApy: number;

        if (pool.name.toLowerCase().includes('usd') || pool.name.toLowerCase().includes('usdc')) {
          fallbackApy = Math.random() * 1 + 0.5;
        } else if (pool.name.toLowerCase().includes('eur') || pool.name.toLowerCase().includes('sgd')) {
          fallbackApy = Math.random() * 1.5 + 0.8;
        } else {
          fallbackApy = Math.random() * 2 + 1;
        }

        apr = `${fallbackApy.toFixed(2)}%`;
        lltv = '80%';
      }

      return {
        id: pool.id,
        name: pool.name,
        lltv,
        apr,
        icon: pool.logo,
        flag: pool.logoCountry || '/assets/flags/flag-us.png',
      };
    });
}
