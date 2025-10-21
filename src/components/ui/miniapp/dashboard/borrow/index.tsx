'use client';

import BorrowSheet from './BorrowSheet';
import { useState, useEffect } from 'react';
import BorrowMarketList from './BorrowMarketList';
import { formatBorrowingMarkets } from '@/utils/borrowingUtils';
import { SUPPORTED_BORROWING_POOLS } from '@/constants/borrowConstants';
import type { BorrowingMarket, SupportedBorrowingPoolsMap } from '@/types/borrowing';

export default function BorrowContainer() {
  const [markets, setMarkets] = useState<BorrowingMarket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<BorrowingMarket | null>(null);
  const [error, setError] = useState<any>(null);
  
  const handleMarketSelect = (market: BorrowingMarket) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  const handleBorrowComplete = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const pools = SUPPORTED_BORROWING_POOLS as unknown as SupportedBorrowingPoolsMap;
        const result = await formatBorrowingMarkets(pools);
        if (!isCancelled) {
          setMarkets(result);
          setError(null);
        }
      } catch (e) {
        if (!isCancelled) setError(e);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <>
      <BorrowMarketList onMarketSelect={handleMarketSelect} markets={markets} isLoading={isLoading} error={error} />

      <BorrowSheet
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBorrowComplete={handleBorrowComplete}
        selectedMarket={selectedMarket}
      />
    </>
  );
}
