'use client';

import { useState } from 'react';
import Borrow from './Borrow';
import BorrowForm from './BorrowBottomSheet';
import { useBorrowingMarkets } from '@/hooks/useBorrowMarkets';
import type { BorrowingMarket } from '@/types/borrowing';

export default function BorrowContainer() {
  const { data: markets = [], isLoading, error } = useBorrowingMarkets();
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
