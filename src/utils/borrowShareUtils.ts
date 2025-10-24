import { parseUnits, formatUnits } from 'viem';

export const calculateSharesFromAmount = (
  amount: string,
  decimals: number,
  totalBorrowAssets: string,
  totalBorrowShares: string
): string => {
  try {
    if (totalBorrowShares === '0' || totalBorrowAssets === '0') {
      return '0';
    }

    const amountWei = parseUnits(amount, decimals);
    const totalAssets = BigInt(totalBorrowAssets);
    const totalShares = BigInt(totalBorrowShares);

    const shares = (amountWei * totalShares + totalAssets / BigInt(2)) / totalAssets;

    return shares.toString();
  } catch (error) {
    console.error('Error calculating shares from amount:', error);
    return '0';
  }
};

export const calculateAmountFromShares = (
  shares: string,
  decimals: number,
  totalBorrowAssets: string,
  totalBorrowShares: string
): string => {
  try {
    if (totalBorrowShares === '0' || totalBorrowAssets === '0') {
      return '0';
    }

    const sharesBigInt = BigInt(shares);
    const totalAssets = BigInt(totalBorrowAssets);
    const totalShares = BigInt(totalBorrowShares);

    const amountWei = (sharesBigInt * totalAssets) / totalShares;

    return formatUnits(amountWei, decimals);
  } catch (error) {
    console.error('Error calculating amount from shares:', error);
    return '0';
  }
};

export const calculateMaxRepayAmount = (
  userShares: string,
  decimals: number,
  totalBorrowAssets: string,
  totalBorrowShares: string
): string => {
  return calculateAmountFromShares(userShares, decimals, totalBorrowAssets, totalBorrowShares);
};

export const formatShares = (shares: string): string => {
  try {
    const sharesBigInt = BigInt(shares);

    if (sharesBigInt > BigInt(1000000)) {
      return sharesBigInt.toLocaleString();
    }

    return shares;
  } catch (error) {
    console.error('Error formatting shares:', error);
    return shares;
  }
};
