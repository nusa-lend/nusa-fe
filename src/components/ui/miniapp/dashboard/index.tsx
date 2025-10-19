'use client';

import { useState } from 'react';
import Header from '../Header';
import BottomTabs from './BottomTabs';
import BottomSheet from '../BottomSheet';
import { LogOut } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import Lending from './lending/Lending';
import Borrow from './borrow/Borrow';
import Portfolio from './portfolio/Portfolio';
import LendingForm from './lending/LendingForm';
import BorrowForm from './borrow/BorrowForm';
import type { LendingMarket } from '@/types/lending';
import type { BorrowingMarket } from '@/types/borrowing';

export default function DashboardPage() {
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lending' | 'borrow' | 'portfolio'>('lending');
  const [isLendingFormOpen, setIsLendingFormOpen] = useState(false);
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LendingMarket | null>(null);
  const [selectedBorrowingItem, setSelectedBorrowingItem] = useState<BorrowingMarket | null>(null);
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await disconnect();
      setIsProfileSheetOpen(false);
      setTimeout(() => {
        router.push('/miniapp/connect');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setIsProfileSheetOpen(false);
      router.push('/miniapp/connect');
    }
  };

  const handleTabChange = (tab: 'lending' | 'borrow' | 'portfolio') => {
    setActiveTab(tab);
  };

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

  const handleBorrowClick = (market: BorrowingMarket) => {
    setSelectedBorrowingItem(market);
    setIsBorrowFormOpen(true);
  };

  const handleBorrow = (stablecoin: any, amount: string) => {
    console.log('Borrowing:', stablecoin, amount);
    setIsBorrowFormOpen(false);
    setSelectedBorrowingItem(null);
  };

  const handleCloseBorrowForm = () => {
    setIsBorrowFormOpen(false);
    setSelectedBorrowingItem(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lending':
        return <Lending onItemClick={handleLendClick} />;
      case 'borrow':
        return <Borrow onItemClick={handleBorrowClick} />;
      case 'portfolio':
        return <Portfolio />;
      default:
        return <Lending onItemClick={handleLendClick} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      <div
        className="absolute inset-0 bg-no-repeat bg-[position:center_-75px] bg-[length:100%_auto] z-0"
        style={{
          backgroundImage: `url('/assets/backgrounds/bg_dashboard.png')`,
        }}
      />

      <div className="relative z-10">
        <Header onProfileClick={() => setIsProfileSheetOpen(true)} />
      </div>

      <div className="flex-1 relative z-50 pb-20">{renderTabContent()}</div>

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

      <LendingForm
        isOpen={isLendingFormOpen}
        onClose={handleCloseLendingForm}
        onLend={handleLend}
        selectedMarket={selectedItem}
      />

      <BorrowForm 
        isOpen={isBorrowFormOpen} 
        onClose={handleCloseBorrowForm} 
        onBorrow={handleBorrow}
        selectedMarket={selectedBorrowingItem}
      />
    </div>
  );
}
