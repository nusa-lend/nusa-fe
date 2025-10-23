'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import LendingDetail from './tabs/history/LendingDetail';
import BorrowDetail from './tabs/history/BorrowDetail';
import { HistoryTransaction } from '@/hooks/useUserLoans';

interface HistoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: HistoryTransaction;
}

export default function HistoryBottomSheet({ isOpen, onClose, transaction }: HistoryBottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;

  const handleClose = () => {
    onClose();
  };

  useGSAP(() => {
    if (isOpen && contentRef.current) {
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
    }
  }, [isOpen]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      height="75vh"
      showHandle={false}
      showCloseButton={true}
      contentRef={contentRef}
    >
      <div className="w-full h-full mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900">
            {transaction.title}
          </h2>
          <TokenNetworkPair tokenLogo={transaction.token1} networkLogo={transaction.token2} size={25} overlap={25} />
        </div>

        <div className="mt-6">{transaction.type === 'lend' ? <LendingDetail loanData={transaction.loanData} /> : <BorrowDetail loanData={transaction.loanData} />}</div>
      </div>
    </BottomSheet>
  );
}
