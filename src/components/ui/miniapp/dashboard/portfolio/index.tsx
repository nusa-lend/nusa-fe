'use client';

import { useState } from 'react';
import Portfolio from './Portfolio';
import ActiveBottomSheet from './ActiveBottomSheet';
import HistoryBottomSheet from './HistoryBottomSheet';
import { ActivePosition } from '@/utils/positionMapping';

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

type PortfolioItem = ActivePosition | HistoryTransaction;

export default function PortfolioContainer() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isHistoryItem, setIsHistoryItem] = useState(false);

  const handleItemClick = (item: PortfolioItem, isFromHistory = false) => {
    setSelectedItem(item);
    setIsBottomSheetOpen(true);
    setIsHistoryItem(isFromHistory);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      setIsHistoryItem(false);
    }, 250);
  };

  return (
    <>
      <Portfolio onPositionClick={handleItemClick} />

      {selectedItem && (
        <>
          {isHistoryItem ? (
            <HistoryBottomSheet
              isOpen={isBottomSheetOpen}
              onClose={handleCloseBottomSheet}
              transaction={selectedItem as HistoryTransaction}
            />
          ) : (
            <ActiveBottomSheet
              isOpen={isBottomSheetOpen}
              onClose={handleCloseBottomSheet}
              position={selectedItem as ActivePosition}
            />
          )}
        </>
      )}
    </>
  );
}
