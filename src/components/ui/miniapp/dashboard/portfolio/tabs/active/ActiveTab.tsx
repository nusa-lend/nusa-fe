import TabItem from '../TabItem';

interface ActivePosition {
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

interface ActiveTabProps {
  onPositionClick?: (position: ActivePosition) => void;
}

export default function ActiveTab({ onPositionClick }: ActiveTabProps) {
  // Sample active position data - replace with real data later
  const activePositions: ActivePosition[] = [
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
      subtitle: 'Lend $500.00',
      apy: '-8.2%',
      apyColor: '#bc5564',
      type: 'lend',
    },
  ];

  const handleCardClick = (position: ActivePosition) => {
    onPositionClick?.(position);
  };

  return (
    <div className="space-y-2">
      {activePositions.map((position, index) => (
        <div key={position.id} onClick={() => handleCardClick(position)} className="cursor-pointer">
          <TabItem
            token1={position.token1}
            token2={position.token2}
            imageSize={position.imageSize}
            title={position.title}
            subtitle={position.subtitle}
            apy={position.apy}
            apyColor={position.apyColor}
          />
        </div>
      ))}
    </div>
  );
}
