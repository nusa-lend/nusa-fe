'use client';

import BorrowSheet from './BorrowSheet';
import { useState, useEffect } from 'react';
import BorrowMarketList from './BorrowMarketList';
import { formatBorrowingMarkets, formatBorrowingTokens } from '@/utils/borrowingUtils';
import { SUPPORTED_COLLATERAL } from '@/constants/borrowConstants';
import type { BorrowingMarket, SupportedBorrowingPoolsMap } from '@/types/borrowing';
import type { BorrowingTokenOption } from '@/utils/borrowingUtils';
import { useAccount } from 'wagmi';

export default function BorrowContainer() {
  const { address } = useAccount();
  const [markets, setMarkets] = useState<BorrowingMarket[]>([]);
  const [borrowingTokens, setBorrowingTokens] = useState<BorrowingTokenOption[]>([]);
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
        const collateralPools = SUPPORTED_COLLATERAL as unknown as SupportedBorrowingPoolsMap;
        const result = await formatBorrowingMarkets(collateralPools, address);
        const tokens = await formatBorrowingTokens(undefined, address);
        if (!isCancelled) {
          setMarkets(result);
          setBorrowingTokens(tokens);
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
  }, [address]);

  return (
    <>
      <BorrowMarketList onMarketSelect={handleMarketSelect} markets={markets} isLoading={isLoading} error={error} />

      <BorrowSheet
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBorrowComplete={handleBorrowComplete}
        selectedMarket={selectedMarket}
        borrowingTokens={borrowingTokens}
      />
    </>
  );
}
