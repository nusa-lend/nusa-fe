'use client';

import { useState } from 'react';
import Borrow from './Borrow';
import BorrowForm from './BorrowBottomSheet';
import type { BorrowingMarket } from '@/types/borrowing';

interface BorrowContainerProps {
  markets: BorrowingMarket[];
  isLoading: boolean;
  error: any;
}

export default function BorrowContainer({ markets, isLoading, error }: BorrowContainerProps) {
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [selectedBorrowingItem, setSelectedBorrowingItem] = useState<BorrowingMarket | null>(null);

  const handleBorrowClick = (market: BorrowingMarket) => {
    setSelectedBorrowingItem(market);
    setIsBorrowFormOpen(true);
  };

  const handleBorrow = (stablecoin: any, amount: string) => {
    setIsBorrowFormOpen(false);
    setSelectedBorrowingItem(null);
  };

  const handleCloseBorrowForm = () => {
    setIsBorrowFormOpen(false);
    setSelectedBorrowingItem(null);
  };

  return (
    <>
      <Borrow onItemClick={handleBorrowClick} markets={markets} isLoading={isLoading} error={error} />

      <BorrowForm
        isOpen={isBorrowFormOpen}
        onClose={handleCloseBorrowForm}
        onBorrow={handleBorrow}
        selectedMarket={selectedBorrowingItem}
      />
    </>
  );
}
