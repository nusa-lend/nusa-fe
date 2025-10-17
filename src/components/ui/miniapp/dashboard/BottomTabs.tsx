'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

type TabType = 'lending' | 'borrow' | 'portfolio';

interface BottomTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slidingBgRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { id: 'lending' as TabType, label: 'Lending' },
    { id: 'borrow' as TabType, label: 'Borrow' },
    { id: 'portfolio' as TabType, label: 'Portfolio' },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab === tabId) return;

    onTabChange(tabId);

    const activeIndex = tabs.findIndex(tab => tab.id === tabId);
    const activeButton = tabRefs.current[activeIndex];
    const container = containerRef.current;
    const slidingBg = slidingBgRef.current;

    if (!activeButton || !container || !slidingBg) return;

    const buttonRect = activeButton.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const containerPadding = 16;
    const relativeLeft = buttonRect.left - containerRect.left - containerPadding;
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const relativeTop = buttonRect.top - containerRect.top - 8;

    gsap.to(slidingBg, {
      x: relativeLeft - 8,
      y: relativeTop,
      width: buttonWidth + 14,
      height: buttonHeight,
      duration: 0.3,
      ease: 'power2.out',
    });

    tabs.forEach((tab, index) => {
      const button = tabRefs.current[index];
      if (!button) return;

      const isActive = tab.id === tabId;

      gsap.to(button, {
        color: isActive ? '#FFFFFF' : '#407A99',
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  };

  useGSAP(() => {
    if (!slidingBgRef.current || !tabRefs.current[0]) return;

    const firstButton = tabRefs.current[0];
    const container = containerRef.current;

    if (!firstButton || !container) return;

    const buttonRect = firstButton.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const containerPadding = 16;
    const relativeLeft = buttonRect.left - containerRect.left - containerPadding;
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const relativeTop = buttonRect.top - containerRect.top - 8;

    gsap.set(slidingBgRef.current, {
      x: relativeLeft,
      y: relativeTop,
      width: buttonWidth,
      height: buttonHeight,
    });
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-60">
      <div ref={containerRef} className="bg-gray-100 rounded-4xl px-4 py-2 flex items-center justify-between relative">
        <div ref={slidingBgRef} className="absolute bg-primary rounded-4xl z-0" />

        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => {
              tabRefs.current[index] = el;
            }}
            onClick={() => handleTabClick(tab.id)}
            className={`px-6 py-3 rounded-4xl font-semibold relative z-10 ${
              activeTab === tab.id ? 'text-white' : 'text-[#407A99]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
