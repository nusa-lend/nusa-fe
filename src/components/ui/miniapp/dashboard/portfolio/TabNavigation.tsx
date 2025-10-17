'use client';

import { useState, useRef, useLayoutEffect } from 'react';

interface TabNavigationProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  showFilter?: boolean;
  filterLabel?: string;
}

export default function TabNavigation({
  tabs,
  defaultTab,
  onTabChange,
  showFilter = true,
  filterLabel = 'All',
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const activeIndex = tabs.indexOf(activeTab);
    const activeButton = tabRefs.current[activeIndex];
    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab, tabs]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="mt-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex space-x-6 relative">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={el => {
                tabRefs.current[index] = el;
              }}
              onClick={() => handleTabClick(tab)}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === tab ? 'text-gray-800 font-bold' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}

          <div
            className="absolute bottom-0 h-0.5 bg-[#279E73] transition-all duration-300"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          ></div>
        </div>

        {showFilter && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">{filterLabel}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
    </div>
  );
}
