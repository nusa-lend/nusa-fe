'use client';

import { useState } from 'react';
import PortfolioCards from './PortfolioCards';
import TabNavigation from './TabNavigation';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('Active');

  const portfolioData = [
    { title: 'Lending', value: '$0.00', sub: '0% APY' },
    { title: 'Borrow', value: '$0.00', sub: '0% APY' },
    { title: 'Yield Earned', value: '$0.00' },
    { title: 'Active Position', value: '0' },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Handle tab change logic here
    console.log('Active tab:', tab);
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
      />
      
      <div className="mt-8 flex flex-col justify-center items-center text-center" style={{ height: '150px' }}>
        <div className="text-sm font-bold text-gray-800 mb-2">
          You don't have any positions.
        </div>
        <div className="text-xs text-gray-500">
          Start by earning or borrowing.
        </div>
      </div>
    </div>
  );
}
