"use client";

import { useState } from "react";
import Header from "../Header";
import BottomTabs from "./BottomTabs";
import BottomSheet from "../../BottomSheet";
import { LogOut } from "lucide-react";
import { useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import Lending from "./lending/Lending";
import Borrow from "./borrow/Borrow";
import Portfolio from "./portfolio/Portfolio";
import LendingForm from "./lending/LendingForm";

export default function DashboardPage() {
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lending" | "borrow" | "portfolio">("lending");
  const [isLendingFormOpen, setIsLendingFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await disconnect();
      setIsProfileSheetOpen(false);
      setTimeout(() => {
        router.push("/miniapp/connect");
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      setIsProfileSheetOpen(false);
      router.push("/miniapp/connect");
    }
  };

  const handleTabChange = (tab: "lending" | "borrow" | "portfolio") => {
    setActiveTab(tab);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsLendingFormOpen(true);
  };

  const handleLend = (chain: any, amount: string) => {
    console.log('Lending amount:', amount, 'on chain:', chain, 'for item:', selectedItem);
    setIsLendingFormOpen(false);
    setSelectedItem(null);
  };

  const handleCloseLendingForm = () => {
    setIsLendingFormOpen(false);
    setSelectedItem(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "lending":
        return <Lending onItemClick={handleItemClick} />;
      case "borrow":
        return <Borrow />;
      case "portfolio":
        return <Portfolio />;
      default:
        return <Lending onItemClick={handleItemClick} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-no-repeat bg-[position:center_-75px] bg-[length:100%_auto] z-0"
        style={{
          backgroundImage: `url('/background/bg_dashboard.png')`,
        }}
      />
      
      <div className="relative z-10">
        <Header onProfileClick={() => setIsProfileSheetOpen(true)} />
      </div>
      
      <div className="flex-1 relative z-50 pb-20">
        {renderTabContent()}
      </div>
      
      <BottomTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

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
      />
    </div>
  );
}
