import { PonderPosition, PonderPositionEntry } from '@/services/positionService';
import { ALL_TOKENS } from '@/constants/tokenConstants';
import { NETWORKS } from '@/constants/networkConstants';
import { SUPPORTED_COLLATERAL } from '@/constants/borrowConstants';

export interface ActivePosition {
  id: string;
  token1: string;
  token2: string;
  imageSize: number;
  title: string;
  subtitle: string;
  apy: string;
  apyColor: string;
  type: 'lend' | 'borrow';
  usdValue: number;
  entry: PonderPositionEntry;
  position: PonderPosition;
}

export const getTokenBySymbol = (symbol: string) => {
  let token = ALL_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  
  if (!token) {
    const collateralToken = Object.values(SUPPORTED_COLLATERAL).find(t => 
      t.name.toLowerCase() === symbol.toLowerCase()
    );
    if (collateralToken) {
      token = {
        logo: collateralToken.logo,
        symbol: collateralToken.name,
        name: collateralToken.name,
        id: collateralToken.id,
        category: 'rwa' as const,
        description: collateralToken.name
      };
    }
  }
  
  return token;
};

const getTokenLogo = (symbol: string): string => {
  const token = getTokenBySymbol(symbol);
  return token?.logo || '/assets/placeholder/placeholder_selectcoin.png';
};

const getNetworkLogo = (chainId: string): string => {
  const network = NETWORKS.find(n => n.chainId?.toString() === chainId);
  return network?.logo || '/assets/placeholder/placeholder_selectchain.png';
};

const getNetworkName = (chainId: string): string => {
  const network = NETWORKS.find(n => n.chainId?.toString() === chainId);
  return network?.name || 'Unknown';
};

const getApyColor = (rate: string): string => {
  const rateNum = parseFloat(rate.replace('%', ''));
  if (rateNum > 0) return '#279E73';
  if (rateNum < 0) return '#bc5564';
  return '#6B7280';
};

const formatUsdValue = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

export const mapPositionEntriesToActivePositions = (positions: PonderPosition[], filter: string = 'All'): ActivePosition[] => {
  const activePositions: ActivePosition[] = [];

  positions.forEach(position => {
    const collateralEntries = position.entries.filter(e => 
      (e.type === 'supply_collateral' || e.type === 'supply_liquidity') && e.token
    );

    const borrowEntries = position.entries.filter(e => 
      e.type === 'borrow' && e.token && e.usdValue > 0
    );

    collateralEntries.forEach(entry => {
      if (!entry.token) return;
      
      const tokenLogo = getTokenLogo(entry.token.symbol);
      const networkLogo = getNetworkLogo(position.chainId);
      const networkName = getNetworkName(position.chainId);
      
      const rate = entry.market?.supplyRatePercent || '0.00%';
      const apyColor = getApyColor(rate);
      const formattedValue = formatUsdValue(entry.usdValue);

      const activePosition: ActivePosition = {
        id: `${position.id}-${entry.tokenId}-${entry.type}`,
        token1: tokenLogo,
        token2: networkLogo,
        imageSize: 48,
        title: `${entry.token.symbol} on ${networkName}`,
        subtitle: `Supply ${formattedValue}`,
        apy: rate,
        apyColor,
        type: 'lend',
        usdValue: entry.usdValue,
        entry,
        position,
      };

      activePositions.push(activePosition);
    });

    borrowEntries.forEach(entry => {
      if (!entry.token) return;
      
      const primaryCollateral = collateralEntries.reduce((max, current) => 
        current.usdValue > max.usdValue ? current : max
      );

      if (primaryCollateral && primaryCollateral.token) {
        const collateralLogo = getTokenLogo(primaryCollateral.token.symbol);
        const borrowedLogo = getTokenLogo(entry.token.symbol);
        
        const rate = entry.market?.borrowRatePercent || '0.00%';
        const apyColor = getApyColor(rate);
        const formattedValue = formatUsdValue(entry.usdValue);

        const activePosition: ActivePosition = {
          id: `${position.id}-${entry.tokenId}-${entry.type}`,
          token1: collateralLogo,
          token2: borrowedLogo,
          imageSize: 48,
          title: `${primaryCollateral.token.symbol} / ${entry.token.symbol}`,
          subtitle: `Borrow ${formattedValue}`,
          apy: rate,
          apyColor,
          type: 'borrow',
          usdValue: entry.usdValue,
          entry,
          position,
        };

        activePositions.push(activePosition);
      }
    });
  });

  if (filter === 'All') {
    return activePositions;
  }

  return activePositions.filter(position => {
    switch (filter) {
      case 'Borrow':
        return position.type === 'borrow';
      case 'Supply':
        return position.type === 'lend';
      case 'Repay':
        return position.type === 'borrow';
      case 'Withdraw':
        return position.type === 'lend';
      default:
        return true;
    }
  });
};

export const getTotalCollateralValue = (positions: PonderPosition[]): number => {
  return positions.reduce((total, position) => total + position.collateralUsd, 0);
};

export const getTotalDebtValue = (positions: PonderPosition[]): number => {
  return positions.reduce((total, position) => total + position.debtUsd, 0);
};

export const getHealthFactor = (positions: PonderPosition[]): number => {
  if (positions.length === 0) return 0;
  return positions[0].healthFactor;
};
