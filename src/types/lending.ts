export type LendingNetworkOption = {
  id: string;
  name: string;
  networkLogo: string;
  apy: string;
  chainId?: number;
  address?: string;
  decimals?: number;
  isActive?: boolean;
  userBalance?: string;
};

export type LendingMarket = {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenLogo: string;
  logoCountry?: string;
  defaultApy: string;
  networks: LendingNetworkOption[];
  userBalance?: string;
};

export type SupportedLendingNetworkConfig = {
  id: string;
  name: string;
  logo: string;
  chainId?: number;
  address?: string;
  decimals?: number;
  isActive?: boolean;
};

export type SupportedLendingPoolConfig = {
  id: string;
  name: string;
  logo: string;
  logoCountry?: string;
  networks: SupportedLendingNetworkConfig[];
};

export type SupportedLendingPoolsMap = Record<string, SupportedLendingPoolConfig>;
