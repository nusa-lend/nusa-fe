import TabItem from '../TabItem';
import { useUserLoans, HistoryTransaction } from '@/hooks/useUserLoans';

interface HistoryTabProps {
  onTransactionClick?: (transaction: HistoryTransaction) => void;
  filter?: string;
}

export default function HistoryTab({ onTransactionClick, filter = 'All' }: HistoryTabProps) {
  const { historyData, isLoading, error } = useUserLoans();

  const handleTransactionClick = (transaction: HistoryTransaction) => {
    onTransactionClick?.(transaction);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error loading history: {error}</p>
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No loan history found</p>
      </div>
    );
  }

  const filteredTransactions = historyData.filter(transaction => {
    if (filter === 'All') {
      return true;
    }

    const action = transaction.loanData?.action;

    switch (filter) {
      case 'Borrow':
        return action === 'borrow';
      case 'Supply':
        return action === 'supply';
      case 'Repay':
        return action === 'repay';
      case 'Withdraw':
        return action === 'withdraw';
      default:
        return true;
    }
  });

  if (filteredTransactions.length === 0) {
    const filterMessage = filter === 'All' ? 'No loan history found' : `No ${filter.toLowerCase()} transactions found`;

    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600 text-sm">{filterMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredTransactions.map((transaction, index) => (
        <div key={transaction.id} onClick={() => handleTransactionClick(transaction)} className="cursor-pointer">
          <TabItem
            token1={transaction.token1}
            token2={transaction.token2}
            imageSize={transaction.imageSize}
            title={transaction.title}
            subtitle={transaction.subtitle}
            apy={transaction.apy}
            apyColor={transaction.apyColor}
          />
        </div>
      ))}
    </div>
  );
}
