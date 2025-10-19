'use client';

import { useState, useRef, useEffect } from 'react';
import TabNavigation from './tabs/TabNavigation';
import SupplyMore from './tabs/active/SupplyMore';
import WithdrawSupply from './tabs/active/WithdrawSupply';
import BorrowMore from './tabs/active/BorrowMore';
import RepayBorrow from './tabs/active/RepayBorrow';

import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';

interface ActivePosition {
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

interface PortfolioBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  position: ActivePosition;
}

export default function PortfolioBottomSheet({ isOpen, onClose, position }: PortfolioBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (position.type === 'lend') {
      return activeTab === 'Supply' ? <SupplyMore /> : <WithdrawSupply />;
    } else {
      return activeTab === 'Borrow' ? <BorrowMore /> : <RepayBorrow />;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

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
            {position.type === 'lend' ? `IDRX on Base` : `bNVDA / IDRX`}
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
    </BottomSheet>
  );
}
