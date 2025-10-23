'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import TabNavigation from './tabs/TabNavigation';
import SupplyMore from './tabs/active/SupplyMore';
import WithdrawSupply from './tabs/active/WithdrawSupply';
import BorrowMore from './tabs/active/BorrowMore';
import RepayBorrow from './tabs/active/RepayBorrow';
import TransactionNotif from './tabs/active/TransactionNotif';

import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';
import { ActivePosition } from '@/utils/positionMapping';

interface ActiveBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  position: ActivePosition;
}

export default function ActiveBottomSheet({ isOpen, onClose, position }: ActiveBottomSheetProps) {
  const getTabsAndDefault = () => {
    if (position.type === 'lend') {
      return {
        tabs: ['Supply', 'Withdraw'],
        defaultTab: 'Supply',
      };
    } else {
      return {
        tabs: ['Borrow', 'Repay'],
        defaultTab: 'Borrow',
      };
    }
  };

  const { tabs, defaultTab } = getTabsAndDefault();
  
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [currentStep, setCurrentStep] = useState<'form' | 'notification'>('form');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;
  const formRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleTransactionComplete = (data: any) => {
    setTransactionData(data);
    setIsAnimating(true);
  };

  const handleNotificationDone = () => {
    setCurrentStep('form');
    setTransactionData(null);
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('form');
    setActiveTab(defaultTab);
    setTransactionData(null);
    setIsAnimating(false);
    onClose();
  };

  const renderTabContent = () => {
    if (position.type === 'lend') {
      return activeTab === 'Supply' ? (
        <SupplyMore 
          position={position}
          onTransactionComplete={handleTransactionComplete} 
        />
      ) : (
        <WithdrawSupply 
          position={position}
          onTransactionComplete={handleTransactionComplete} 
        />
      );
    } else {
      return activeTab === 'Borrow' ? (
        <BorrowMore 
          position={position}
          onTransactionComplete={handleTransactionComplete} 
        />
      ) : (
        <RepayBorrow 
          position={position}
          onTransactionComplete={handleTransactionComplete} 
        />
      );
    }
  };

  useGSAP(() => {
    if (isOpen && formRef.current && notificationRef.current) {
      gsap.set(formRef.current, { xPercent: 0, opacity: 1 });
      gsap.set(notificationRef.current, {
        xPercent: 100,
        opacity: 0,
        visibility: 'hidden',
      });
      setActiveTab(defaultTab);
      setCurrentStep('form');
      setTransactionData(null);
      setIsAnimating(false);
    }
  }, [isOpen, defaultTab]);

  useGSAP(() => {
    if (isAnimating && currentStep === 'form' && transactionData && formRef.current && notificationRef.current) {
      const tl = gsap.timeline({
        defaults: { duration: 0.3, ease: 'power2.inOut' },
        onComplete: () => {
          setCurrentStep('notification');
          setIsAnimating(false);

          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        },
      });

      tl.to(formRef.current, { xPercent: -100, opacity: 0 }, 0).fromTo(
        notificationRef.current,
        { xPercent: 100, opacity: 0, visibility: 'hidden' },
        { xPercent: 0, opacity: 1, visibility: 'visible' },
        0
      );
    }
  }, [isAnimating, currentStep, transactionData]);

  const sheetHeight = currentStep === 'notification' ? '70vh' : '100vh';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      height={sheetHeight}
      showHandle={false}
      showCloseButton={true}
      contentRef={contentRef}
    >
      <div className="relative w-full h-full">
        <div
          ref={formRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'form' ? 30 : 1,
            visibility: currentStep === 'form' ? 'visible' : 'hidden',
          }}
        >
          <div className="w-full h-full mt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold text-gray-900">
                {position.title}
              </h2>
              <TokenNetworkPair tokenLogo={position.token1} networkLogo={position.token2} size={25} overlap={25} />
            </div>

            <TabNavigation
              tabs={tabs}
              defaultTab={defaultTab}
              onTabChange={handleTabChange}
              fullWidth={true}
              showFilter={false}
            />

            <div className="mt-6">{renderTabContent()}</div>
          </div>
        </div>

        <div
          ref={notificationRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'notification' ? 40 : 1,
            visibility: currentStep === 'notification' ? 'visible' : 'hidden',
          }}
        >
          {transactionData && (
            <TransactionNotif
              type={transactionData.type}
              collateralToken={transactionData.collateralToken}
              borrowToken={transactionData.borrowToken}
              borrowNetwork={transactionData.borrowNetwork}
              supplyToken={transactionData.supplyToken}
              supplyNetwork={transactionData.supplyNetwork}
              amount={transactionData.amount}
              transaction={transactionData.transaction}
              onDone={handleNotificationDone}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
