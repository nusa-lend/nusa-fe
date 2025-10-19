import TabItem from '../TabItem';

interface HistoryTransaction {
  id: string;
  token1: string;
  token2: string;
  imageSize: number;
  title: string;
  subtitle: string;
  apy: string;
  apyColor: string;
  type: 'lend' | 'borrow';
}

interface HistoryTabProps {
  onTransactionClick?: (transaction: HistoryTransaction) => void;
}

export default function HistoryTab({ onTransactionClick }: HistoryTabProps) {
  const historyData: HistoryTransaction[] = [
    {
      id: '1',
      token1: '/assets/rwa/bNVDA.png',
      token2: '/assets/stablecoins/idrx.png',
      imageSize: 48,
      title: 'USDE/USDC',
      subtitle: 'Borrow $1200.00',
      apy: '+12.5%',
      apyColor: '#279E73',
      type: 'borrow',
    },
    {
      id: '2',
      token1: '/assets/rwa/bCOIN.png',
      token2: '/assets/stablecoins/idrx.png',
      imageSize: 48,
      title: 'EURC/USDC',
      subtitle: 'Base',
      apy: '-8.2%',
      apyColor: '#bc5564',
      type: 'lend',
    },
  ];

  const handleTransactionClick = (transaction: HistoryTransaction) => {
    onTransactionClick?.(transaction);
  };

  return (
    <div className="space-y-2">
      {historyData.map((transaction, index) => (
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
