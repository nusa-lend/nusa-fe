import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserLoans, LoanData, formatCurrency, getCollateralTokenFromPosition, createBorrowTransaction } from '../services/loanService';

export interface HistoryTransaction {
  id: string;
  token1: string;
  token2: string;
  imageSize: number;
  title: string;
  subtitle: string;
  apy: string;
  apyColor: string;
  type: 'lend' | 'borrow';
  loanData?: LoanData;
}

export const useUserLoans = () => {
  const { address } = useAccount();
  const [historyData, setHistoryData] = useState<HistoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoansData = async () => {
      if (!address) {
        setHistoryData([]);
        return;
      }

      setIsLoading(true);
      setError(null);

       try {
         const loans = await fetchUserLoans(address);
         
         const loansWithCollateral = await Promise.all(
           loans.map(async (loan) => {
             const collateralTokenSymbol = await getCollateralTokenFromPosition(loan.positionId);
             return { ...loan, collateralTokenSymbol };
           })
         );
         
         const transformedData: HistoryTransaction[] = loansWithCollateral.map(loan => {
           const borrowTransaction = createBorrowTransaction(loan, loan.collateralTokenSymbol);
           
           return {
             id: loan.id,
             token1: borrowTransaction.token1,
             token2: borrowTransaction.token2,
             imageSize: 48,
             title: borrowTransaction.title,
             subtitle: loan.status === 'open' ? `Borrow ${formatCurrency(loan.borrowUsd)}` : `Repaid ${formatCurrency(loan.borrowUsd)}`,
             apy: `+${loan.borrowApyPercent}%`,
             apyColor: '#279E73',
             type: borrowTransaction.type,
             loanData: loan,
           };
         });

         setHistoryData(transformedData);
      } catch (err) {
        console.error('Error fetching loans data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch loans data');
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoansData();
  }, [address]);

  return {
    historyData,
    isLoading,
    error,
  };
};
