import { Token } from '@/types/token';

export const STABLECOINS: Token[] = [
  {
    id: 'idrx',
    symbol: 'IDRX',
    name: 'IDRX',
    logo: '/assets/stablecoins/idrx.png',
    category: 'stablecoin',
    description: 'Indonesian Rupiah Stablecoin',
  },
  {
    id: 'usde',
    symbol: 'USDE',
    name: 'USDE',
    logo: '/assets/stablecoins/usde.png',
    category: 'stablecoin',
    description: 'USD Coin',
  },
  {
    id: 'eurc',
    symbol: 'EURC',
    name: 'Euro Coin',
    logo: '/assets/stablecoins/eurc.png',
    category: 'stablecoin',
    description: 'Euro Coin',
  },
  {
    id: 'jeur',
    symbol: 'JEUR',
    name: 'Jarvis Euro',
    logo: '/assets/stablecoins/jeur.png',
    category: 'stablecoin',
    description: 'Jarvis Euro',
  },
  {
    id: 'cadc',
    symbol: 'CADC',
    name: 'Canadian Dollar Coin',
    logo: '/assets/stablecoins/cadc.png',
    category: 'stablecoin',
    description: 'Canadian Dollar Coin',
  },
  {
    id: 'brz',
    symbol: 'BRZ',
    name: 'Brazilian Real',
    logo: '/assets/stablecoins/brz.png',
    category: 'stablecoin',
    description: 'Brazilian Real',
  },
  {
    id: 'xsgd',
    symbol: 'XSGD',
    name: 'Singapore Dollar',
    logo: '/assets/stablecoins/xsgd.png',
    category: 'stablecoin',
    description: 'Singapore Dollar',
  },
  {
    id: 'xidr',
    symbol: 'XIDR',
    name: 'Indonesian Rupiah',
    logo: '/assets/stablecoins/xidr.png',
    category: 'stablecoin',
    description: 'Indonesian Rupiah',
  },
  {
    id: 'tryb',
    symbol: 'TRYB',
    name: 'Turkish Lira',
    logo: '/assets/stablecoins/tryb.png',
    category: 'stablecoin',
    description: 'Turkish Lira',
  },
  {
    id: 'mxne',
    symbol: 'MXNE',
    name: 'Mexican Peso',
    logo: '/assets/stablecoins/mxne.png',
    category: 'stablecoin',
    description: 'Mexican Peso',
  },
  {
    id: 'krwt',
    symbol: 'KRWT',
    name: 'Korean Won',
    logo: '/assets/stablecoins/krwt.png',
    category: 'stablecoin',
    description: 'Korean Won',
  },
  {
    id: 'cngn',
    symbol: 'CNGN',
    name: 'Chinese Yuan',
    logo: '/assets/stablecoins/cngn.png',
    category: 'stablecoin',
    description: 'Chinese Yuan',
  },
  {
    id: 'zarp',
    symbol: 'ZARP',
    name: 'South African Rand',
    logo: '/assets/stablecoins/zarp.png',
    category: 'stablecoin',
    description: 'South African Rand',
  },
];

export const RWA_TOKENS: Token[] = [
  {
    id: 'bcoin',
    symbol: 'bCOIN',
    name: 'bCOIN',
    logo: '/assets/rwa/bCOIN.png',
    category: 'rwa',
    description: 'Bitcoin RWA Token',
  },
  {
    id: 'bcspx',
    symbol: 'bCSPX',
    name: 'bCSPX',
    logo: '/assets/rwa/bCSPX.png',
    category: 'rwa',
    description: 'S&P 500 RWA Token',
  },
  {
    id: 'bgme',
    symbol: 'bGME',
    name: 'bGME',
    logo: '/assets/rwa/bGME.png',
    category: 'rwa',
    description: 'GameStop RWA Token',
  },
  {
    id: 'bgoogl',
    symbol: 'bGOOGL',
    name: 'bGOOGL',
    logo: '/assets/rwa/bGOOGL.png',
    category: 'rwa',
    description: 'Google RWA Token',
  },
  {
    id: 'bhigh',
    symbol: 'bHIGH',
    name: 'bHIGH',
    logo: '/assets/rwa/bHIGH.png',
    category: 'rwa',
    description: 'High Yield RWA Token',
  },
  {
    id: 'bib01',
    symbol: 'bIB01',
    name: 'bIB01',
    logo: '/assets/rwa/bIB01.png',
    category: 'rwa',
    description: 'iShares Bond RWA Token',
  },
  {
    id: 'bibta',
    symbol: 'bIBTA',
    name: 'bIBTA',
    logo: '/assets/rwa/bIBTA.png',
    category: 'rwa',
    description: 'iShares Treasury RWA Token',
  },
  {
    id: 'bmsft',
    symbol: 'bMSFT',
    name: 'bMSFT',
    logo: '/assets/rwa/bMSFT.png',
    category: 'rwa',
    description: 'Microsoft RWA Token',
  },
  {
    id: 'bnvda',
    symbol: 'bNVDA',
    name: 'bNVDA',
    logo: '/assets/rwa/bNVDA.png',
    category: 'rwa',
    description: 'NVIDIA RWA Token',
  },
  {
    id: 'btsla',
    symbol: 'bTSLA',
    name: 'bTSLA',
    logo: '/assets/rwa/bTSLA.png',
    category: 'rwa',
    description: 'Tesla RWA Token',
  },
  {
    id: 'bzpr1',
    symbol: 'bZPR1',
    name: 'bZPR1',
    logo: '/assets/rwa/bZPR1.png',
    category: 'rwa',
    description: 'ZPR1 RWA Token',
  },
];

export const ALL_TOKENS = [...STABLECOINS, ...RWA_TOKENS];

export const getTokenById = (id: string): Token | undefined => {
  return ALL_TOKENS.find(token => token.id === id);
};

export const getTokensByCategory = (category: 'stablecoin' | 'rwa'): Token[] => {
  return ALL_TOKENS.filter(token => token.category === category);
};

export const getStablecoins = () => STABLECOINS;
export const getRwaTokens = () => RWA_TOKENS;
