'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = 'right',
  trigger = 'hover',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return position;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    if (position === 'right' && triggerRect.right + 200 > viewportWidth) {
      newPosition = 'left';
    } else if (position === 'left' && triggerRect.left - 200 < 0) {
      newPosition = 'right';
    }

    if (position === 'bottom' && triggerRect.bottom + 80 > viewportHeight) {
      newPosition = 'top';
    } else if (position === 'top' && triggerRect.top - 80 < 0) {
      newPosition = 'bottom';
    }

    return newPosition;
  };

  React.useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        const newPosition = calculatePosition();
        setActualPosition(newPosition);
      }, 0);
    }
  }, [isVisible, position]);

  const handleClickOutside = (event: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
      setIsVisible(false);
    }
  };

  React.useEffect(() => {
    if (isVisible && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, trigger]);

  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-[#5a5a5a] border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-[#5a5a5a] border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-[#5a5a5a] border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-[#5a5a5a] border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-[#5a5a5a] border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className="bg-[#5a5a5a] text-gray-300 text-xs px-3 py-2 rounded-md w-48 max-w-48 break-words">
              {content}
            </div>
            <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
