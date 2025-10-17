export type TokenCategory = 'stablecoin' | 'rwa';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  category: TokenCategory;
  description?: string;
}

export interface TokenBalance {
  token: Token;
  balance: number;
  formattedBalance: string;
}

export interface TokenPrice {
  token: Token;
  price: number;
  priceChange24h: number;
  marketCap?: number;
}
