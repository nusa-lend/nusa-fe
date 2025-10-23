import TabItem from '../TabItem';
import { useUserPositions } from '@/hooks/useUserPositions';
import { mapPositionEntriesToActivePositions, ActivePosition } from '@/utils/positionMapping';

interface ActiveTabProps {
  onPositionClick?: (position: ActivePosition) => void;
  filter?: string;
}

export default function ActiveTab({ onPositionClick, filter = 'All' }: ActiveTabProps) {
  const { data: positions, isLoading, error } = useUserPositions();

  const handleCardClick = (position: ActivePosition) => {
    onPositionClick?.(position);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/25 bg-[#f8fafc] p-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex flex-col justify-center space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error loading positions: {error.message}</p>
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600 text-sm">No active positions found</p>
      </div>
    );
  }

  const activePositions = mapPositionEntriesToActivePositions(positions, filter);

  if (activePositions.length === 0) {
    const filterMessage = filter === 'All' 
      ? 'No active positions found' 
      : `No ${filter.toLowerCase()} positions found`;
    
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600 text-sm">{filterMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activePositions.map((position) => (
        <div key={position.id} onClick={() => handleCardClick(position)} className="cursor-pointer">
          <TabItem
            token1={position.type === 'borrow' ? position.token2 : position.token1}
            token2={position.type === 'borrow' ? position.token1 : position.token2}
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
