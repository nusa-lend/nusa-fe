export interface Network {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  chainId?: number;
  rpcUrl?: string;
  explorerUrl?: string;
  description?: string;
  isTestnet?: boolean;
}

export interface NetworkStatus {
  network: Network;
  isConnected: boolean;
  blockNumber?: number;
  gasPrice?: string;
}

export interface NetworkConfig {
  network: Network;
  contracts: {
    lendingPool?: string;
    tokenVault?: string;
    oracle?: string;
  };
}
