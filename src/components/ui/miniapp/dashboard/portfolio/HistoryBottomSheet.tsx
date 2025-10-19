'use client';

import { useRef } from 'react';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import LendingDetail from './tabs/history/LendingDetail';
import BorrowDetail from './tabs/history/BorrowDetail';

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

interface HistoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: HistoryTransaction;
}

export default function HistoryBottomSheet({ isOpen, onClose, transaction }: HistoryBottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title=""
      height="100vh"
      showHandle={false}
      showCloseButton={true}
      contentRef={contentRef}
    >
      <div className="w-full h-full mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900">
            {transaction.type === 'lend' ? `IDRX on Base` : `bNVDA / IDRX`}
          </h2>
          <TokenNetworkPair tokenLogo={transaction.token1} networkLogo={transaction.token2} size={25} overlap={25} />
        </div>

        <div className="mt-6">{transaction.type === 'lend' ? <LendingDetail /> : <BorrowDetail />}</div>
      </div>
    </BottomSheet>
  );
}
