'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface TabNavigationProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  showFilter?: boolean;
  filterLabel?: string;
  fullWidth?: boolean;
  onFilterChange?: (filter: string) => void;
}

export default function TabNavigation({
  tabs,
  defaultTab,
  onTabChange,
  showFilter = true,
  filterLabel = 'All',
  fullWidth = false,
  onFilterChange,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const activeIndex = tabs.indexOf(activeTab);
    const activeButton = tabRefs.current[activeIndex];
    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab, tabs]);

  const filterOptions = ['All', 'Borrow', 'Lending'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
    onFilterChange?.(filter);
  };

  // Close dropdown when clicking outside
  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <div className="mt-2 relative">
      <div className="flex items-center justify-between">
        <div className={`flex ${fullWidth ? 'w-full' : 'space-x-6'} relative`}>
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={el => {
                tabRefs.current[index] = el;
              }}
              onClick={() => handleTabClick(tab)}
              className={`${fullWidth ? 'flex-1 py-3' : 'pb-2'} text-sm font-medium transition-colors ${
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

        {showFilter && !fullWidth && (
          <div className="relative" ref={filterRef}>
            <button onClick={handleFilterClick} className="flex items-center space-x-1 px-2 py-1">
              <span className="text-sm text-gray-500">{selectedFilter}</span>
              <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-sm z-50"
                >
                  {filterOptions.map((option, index) => (
                    <div key={option}>
                      <button
                        onClick={() => handleFilterSelect(option)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className={selectedFilter === option ? 'text-gray-800 font-medium' : 'text-gray-600'}>
                          {option}
                        </span>
                        {selectedFilter === option && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                            <Check className="w-4 h-4 text-[#279E73]" />
                          </motion.div>
                        )}
                      </button>
                      {index < filterOptions.length - 1 && <div className="mx-3 border-b border-gray-100"></div>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
    </div>
  );
}
