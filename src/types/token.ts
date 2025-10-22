export type TokenCategory = 'stablecoin' | 'rwa' | 'coin';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  logoCountry?: string;
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
