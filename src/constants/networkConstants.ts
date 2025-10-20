import { Network } from '@/types/network';

export const NETWORKS: Network[] = [
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    displayName: 'Arbitrum One',
    logo: '/assets/network/arbitrum.png',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    description: 'Layer 2 scaling solution for Ethereum',
    isTestnet: false,
  },
  {
    id: 'base',
    name: 'Base',
    displayName: 'Base Mainnet',
    logo: '/assets/network/base.png',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    description: 'Coinbase Layer 2 network',
    isTestnet: false,
  },
  {
    id: 'sui',
    name: 'Sui',
    displayName: 'Sui Network',
    logo: '/assets/network/sui.png',
    chainId: undefined, // Sui uses different addressing
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
    description: 'High-performance blockchain platform',
    isTestnet: false,
  },
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    displayName: 'Hyperliquid',
    logo: '/assets/network/hyperliquid.png',
    chainId: undefined, // Custom chain
    rpcUrl: 'https://api.hyperliquid.xyz/info',
    explorerUrl: 'https://app.hyperliquid.xyz',
    description: 'Decentralized derivatives exchange',
    isTestnet: false,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    displayName: 'Ethereum Mainnet',
    logo: '/assets/network/ethereum.png',
    chainId: 1,
    rpcUrl: 'https://mainnet.ethereum.org',
    explorerUrl: 'https://etherscan.io',
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    displayName: 'BNB Chain Mainnet',
    logo: '/assets/network/bsc.png',
    chainId: 56,
    rpcUrl: 'https://mainnet.bsc.org',
    explorerUrl: 'https://bscscan.com',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    displayName: 'Optimism Mainnet',
    logo: '/assets/network/optimism.png',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
];

export const getNetworkById = (id: string): Network | undefined => {
  return NETWORKS.find(network => network.id === id);
};

export const getNetworksByChainId = (chainId: number): Network[] => {
  return NETWORKS.filter(network => network.chainId === chainId);
};

export const getMainnetNetworks = (): Network[] => {
  return NETWORKS.filter(network => !network.isTestnet);
};

export const getTestnetNetworks = (): Network[] => {
  return NETWORKS.filter(network => network.isTestnet);
};

export const NETWORK_CATEGORIES = {
  LAYER_2: ['arbitrum', 'base'],
  ALTERNATIVE: ['sui', 'hyperliquid'],
} as const;
