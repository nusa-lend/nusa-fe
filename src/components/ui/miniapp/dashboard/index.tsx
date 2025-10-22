'use client';

import { useState } from 'react';
import Header from '../Header';
import BottomTabs from './BottomTabs';
import BottomSheet from '../BottomSheet';
import { LogOut } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

import LendingContainer from './lending';
import BorrowContainer from './borrow';
import PortfolioContainer from './portfolio';

export default function DashboardPage() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lending' | 'borrow' | 'portfolio'>('lending');

  const handleLogout = async () => {
    try {
      disconnect();
      setIsProfileSheetOpen(false);
      router.push('/miniapp/connect');
    } catch (error) {
      setIsProfileSheetOpen(false);
      router.push('/miniapp/connect');
    }
  };

  const handleTabChange = (tab: 'lending' | 'borrow' | 'portfolio') => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lending':
        return <LendingContainer />;
      case 'borrow':
        return <BorrowContainer />;
      case 'portfolio':
        return <PortfolioContainer />;
      default:
        return <LendingContainer />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      <div className="relative z-10">
        <Header onProfileClick={() => setIsProfileSheetOpen(true)} />
      </div>

      <div className="flex-1 relative pb-20 scrollbar-thin overflow-y-auto">{renderTabContent()}</div>

      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <BottomSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        height="150px"
        showHandle={false}
        showCloseButton={true}
        sheetClassName="rounded-t-3xl"
        contentClassName="px-0 py-0"
      >
        <div className="px-6 py-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
