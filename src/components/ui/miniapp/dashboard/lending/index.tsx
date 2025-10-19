'use client';

import { useState } from 'react';
import Lending from './Lending';
import LendingForm from './LendingBottomSheet';
import type { LendingMarket } from '@/types/lending';

interface LendingContainerProps {
  markets: LendingMarket[];
  isLoading: boolean;
  error: any;
}

export default function LendingContainer({ markets, isLoading, error }: LendingContainerProps) {
  const [isLendingFormOpen, setIsLendingFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LendingMarket | null>(null);

  const handleLendClick = (item: LendingMarket) => {
    setSelectedItem(item);
    setIsLendingFormOpen(true);
  };

  const handleLend = (chain: any, amount: string) => {
    setIsLendingFormOpen(false);
    setSelectedItem(null);
  };

  const handleCloseLendingForm = () => {
    setIsLendingFormOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <Lending onItemClick={handleLendClick} markets={markets} isLoading={isLoading} error={error} />

      <LendingForm
        isOpen={isLendingFormOpen}
        onClose={handleCloseLendingForm}
        onLend={handleLend}
        selectedMarket={selectedItem}
      />
    </>
  );
}
