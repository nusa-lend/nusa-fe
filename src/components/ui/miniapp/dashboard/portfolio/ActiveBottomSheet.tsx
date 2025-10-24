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
import TokenPair from '@/components/ui/miniapp/TokenPair';
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
  const contentRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;
  const formRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleTransactionComplete = (data: any) => {
    setTransactionData(data);
    setCurrentStep('notification');
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
    onClose();
  };

  const renderTabContent = () => {
    if (position.type === 'lend') {
      return activeTab === 'Supply' ? (
        <SupplyMore position={position} onTransactionComplete={handleTransactionComplete} />
      ) : (
        <WithdrawSupply position={position} onTransactionComplete={handleTransactionComplete} />
      );
    } else {
      return activeTab === 'Borrow' ? (
        <BorrowMore position={position} onTransactionComplete={handleTransactionComplete} />
      ) : (
        <RepayBorrow position={position} onTransactionComplete={handleTransactionComplete} />
      );
    }
  };

  useGSAP(() => {
    if (!formRef.current || !notificationRef.current) return;

    const panels = [formRef.current, notificationRef.current];
    gsap.set(panels, { xPercent: 100, opacity: 0, visibility: 'hidden' });
    gsap.set(formRef.current, { xPercent: 0, opacity: 1, visibility: 'visible' });
  }, []);

  useGSAP(() => {
    const refs: Record<typeof currentStep, HTMLElement | null> = {
      form: formRef.current,
      notification: notificationRef.current,
    };

    const prevStepRef = (useGSAP as any)._prevStepRef ?? ((useGSAP as any)._prevStepRef = { current: currentStep });
    const prevStep = prevStepRef.current;
    prevStepRef.current = currentStep;

    if (!prevStep || prevStep === currentStep) return;

    const fromRef = refs[prevStep as keyof typeof refs];
    const toRef = refs[currentStep as keyof typeof refs];
    if (!fromRef || !toRef) return;

    const direction = prevStep === 'form' && currentStep === 'notification' ? 'next' : 'back';

    const xOut = direction === 'next' ? -100 : 100;
    const xIn = direction === 'next' ? 100 : -100;

    const tl = gsap.timeline({
      defaults: { duration: 0.35, ease: 'power2.inOut' },
      onStart: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      },
      onComplete: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      },
    });

    tl.to(fromRef, { xPercent: xOut, opacity: 0, visibility: 'hidden' }, 0).fromTo(
      toRef,
      { xPercent: xIn, opacity: 0, visibility: 'hidden' },
      { xPercent: 0, opacity: 1, visibility: 'visible' },
      0
    );
  }, [currentStep]);

  useGSAP(() => {
    if (isOpen && formRef.current && notificationRef.current) {
      gsap.set(formRef.current, { xPercent: 0, opacity: 1, visibility: 'visible' });
      gsap.set(notificationRef.current, {
        xPercent: 100,
        opacity: 0,
        visibility: 'hidden',
      });
      setActiveTab(defaultTab);
      setCurrentStep('form');
      setTransactionData(null);
    }
  }, [isOpen, defaultTab]);

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
              <h2 className="text-md font-semibold text-gray-900">{position.title}</h2>
              <TokenPair tokenLogo={position.token1} networkLogo={position.token2} size={25} overlap={25} />
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
