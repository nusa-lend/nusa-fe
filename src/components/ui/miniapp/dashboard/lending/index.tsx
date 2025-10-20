'use client';

import { useState, useEffect } from 'react';
import Lending from './Lending';
import LendingForm from './LendingBottomSheet';
import type { LendingMarket, SupportedLendingPoolsMap, GetAprFn, FetchUserBalanceFn } from '@/types/lending';
import { SUPPORTED_LENDING_POOLS } from '@/constants/lendingConstants';
import { formatLendingMarkets } from '@/lib/utils/lendingUtils';

export default function LendingContainer() {
  const [markets, setMarkets] = useState<LendingMarket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLendingFormOpen, setIsLendingFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LendingMarket | null>(null);
  const [error, setError] = useState<any>(null);

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

  const getApr: GetAprFn = async (tokenId, networkId) => {
    const seed = (tokenId.charCodeAt(0) + networkId.charCodeAt(0)) % 5;
    const base = 4.5 + seed;
    return `${base.toFixed(2)}%`;
  };

  const fetchUserBalance: FetchUserBalanceFn = async (tokenId, networkId, _userAddress) => {
    const seed = (tokenId.length * 13 + networkId.length * 7) % 2000;
    const amount = seed / 37;
    return amount.toFixed(2);
  };

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const pools = SUPPORTED_LENDING_POOLS as unknown as SupportedLendingPoolsMap;
        const result = await formatLendingMarkets(pools, getApr, fetchUserBalance);
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
