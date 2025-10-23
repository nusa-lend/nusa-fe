import { PonderPosition, PonderPositionEntry } from '@/services/positionService';
import { ALL_TOKENS } from '@/constants/tokenConstants';
import { NETWORKS } from '@/constants/networkConstants';

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
}

const getTokenLogo = (symbol: string): string => {
  const token = ALL_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
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
    position.entries.forEach(entry => {
      if (!entry.token) return;

      const isBorrow = entry.type === 'borrow';
      const isSupply = entry.type === 'supply_collateral' || entry.type === 'supply_liquidity';
      
      if (!isBorrow && !isSupply) return;

      const rate = isBorrow 
        ? entry.market?.borrowRatePercent || '0.00%'
        : entry.market?.supplyRatePercent || '0.00%';

      const apyColor = getApyColor(rate);
      const formattedValue = formatUsdValue(entry.usdValue);

      let token1: string;
      let token2: string;
      let title: string;

      if (isSupply) {
        const tokenLogo = getTokenLogo(entry.token.symbol);
        const networkLogo = getNetworkLogo(position.chainId);
        const networkName = getNetworkName(position.chainId);
        
        token1 = tokenLogo;
        token2 = networkLogo;
        title = `${entry.token.symbol} on ${networkName}`;
      } else {
        const collateralEntry = position.entries.find(e => 
          e.type === 'supply_collateral' && e.token
        );
        
        if (collateralEntry?.token) {
          const collateralLogo = getTokenLogo(collateralEntry.token.symbol);
          const borrowedLogo = getTokenLogo(entry.token.symbol);
          
          token1 = collateralLogo;
          token2 = borrowedLogo;
          title = `${collateralEntry.token.symbol} / ${entry.token.symbol}`;
        } else {
          const tokenLogo = getTokenLogo(entry.token.symbol);
          token1 = tokenLogo;
          token2 = tokenLogo;
          title = `${entry.token.symbol}`;
        }
      }

      const activePosition: ActivePosition = {
        id: `${position.id}-${entry.tokenId}-${entry.type}`,
        token1,
        token2,
        imageSize: 48,
        title,
        subtitle: `${isBorrow ? 'Borrow' : 'Supply'} ${formattedValue}`,
        apy: rate,
        apyColor,
        type: isBorrow ? 'borrow' : 'lend',
        usdValue: entry.usdValue,
        entry,
      };

      activePositions.push(activePosition);
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
