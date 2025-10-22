'use client';

import LendingSheet from './LendingSheet';
import { useState, useEffect } from 'react';
import LendingMarketList from './LendingMarketList';
import { formatLendingMarkets } from '@/utils/lendingUtils';
import { SUPPORTED_LENDING_POOLS } from '@/constants/lendingConstants';
import type { LendingMarket, SupportedLendingPoolsMap } from '@/types/lending';

export default function LendingContainer() {
  const [markets, setMarkets] = useState<LendingMarket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<LendingMarket | null>(null);
  const [error, setError] = useState<any>(null);

  const handleMarketSelect = (market: LendingMarket) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  const handleLendingComplete = () => {
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
        const pools = SUPPORTED_LENDING_POOLS as unknown as SupportedLendingPoolsMap;
        const result = await formatLendingMarkets(pools);
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
      <LendingMarketList onMarketSelect={handleMarketSelect} markets={markets} isLoading={isLoading} error={error} />

      <LendingSheet
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLendingComplete={handleLendingComplete}
        selectedMarket={selectedMarket}
      />
    </>
  );
}
