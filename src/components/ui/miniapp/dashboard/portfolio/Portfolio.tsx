'use client';

import { useState } from 'react';
import PortfolioCards from './PortfolioCards';
import TabNavigation from './tabs/TabNavigation';
import ActiveTab from './tabs/active/ActiveTab';
import HistoryTab from './tabs/history/HistoryTab';
import { useUserPortfolio } from '@/hooks/useUserPortfolio';

interface PortfolioProps {
  onPositionClick?: (position: any, isFromHistory?: boolean) => void;
}

export default function Portfolio({ onPositionClick }: PortfolioProps) {
  const [activeTab, setActiveTab] = useState('Active');
  const [activeFilter, setActiveFilter] = useState('All');
  const { portfolioData, isLoading, error } = useUserPortfolio();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveFilter('All');
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const getFilterOptions = () => {
    if (activeTab === 'Active') {
      return ['All', 'Supply', 'Borrow'];
    }
    return ['All', 'Borrow', 'Supply', 'Repay', 'Withdraw'];
  };

  return (
    <div className="w-full px-4">
      <span className="text-md font-semibold">My Portfolio</span>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-white/25 bg-[#f8fafc] p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Error loading portfolio: {error}</p>
        </div>
      ) : (
        <PortfolioCards data={portfolioData} />
      )}

      <TabNavigation
        tabs={['Active', 'History']}
        defaultTab="Active"
        onTabChange={handleTabChange}
        showFilter={true}
        filterLabel={activeFilter}
        onFilterChange={handleFilterChange}
        filterOptions={getFilterOptions()}
      />

      <div className="mt-4">
        {activeTab === 'Active' ? (
          <ActiveTab onPositionClick={position => onPositionClick?.(position, false)} filter={activeFilter} />
        ) : (
          <HistoryTab onTransactionClick={transaction => onPositionClick?.(transaction, true)} filter={activeFilter} />
        )}
      </div>
    </div>
  );
}
