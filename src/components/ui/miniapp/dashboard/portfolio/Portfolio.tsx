'use client';

import { useState } from 'react';
import PortfolioCards from './PortfolioCards';
import TabNavigation from './tabs/TabNavigation';
import ActiveTab from './tabs/active/ActiveTab';
import HistoryTab from './tabs/history/HistoryTab';

interface PortfolioProps {
  onPositionClick?: (position: any, isFromHistory?: boolean) => void;
}

export default function Portfolio({ onPositionClick }: PortfolioProps) {
  const [activeTab, setActiveTab] = useState('Active');
  const [activeFilter, setActiveFilter] = useState('All');

  const portfolioData = [
    { title: 'Lending', value: '$0.00', sub: '0%' },
    { title: 'Borrow', value: '$0.00', sub: '0%' },
    { title: 'Yield Earned', value: '$0.00' },
    { title: 'Active Position', value: '0' },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="w-full px-4">
      <span className="text-md font-semibold">My Portfolio</span>

      <PortfolioCards data={portfolioData} />

      <TabNavigation
        tabs={['Active', 'History']}
        defaultTab="Active"
        onTabChange={handleTabChange}
        showFilter={true}
        filterLabel="All"
        onFilterChange={handleFilterChange}
      />

      <div className="mt-4">
        {activeTab === 'Active' ? (
          <ActiveTab onPositionClick={position => onPositionClick?.(position, false)} />
        ) : (
          <HistoryTab onTransactionClick={transaction => onPositionClick?.(transaction, true)} />
        )}
      </div>
    </div>
  );
}
