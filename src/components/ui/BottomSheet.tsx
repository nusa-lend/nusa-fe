"use client";

import { useRef, useEffect, ReactNode, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxHeight?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  overlayClassName?: string;
  sheetClassName?: string;
  contentClassName?: string;
}

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = "90vh",
  showHandle = true,
  showCloseButton = true,
  overlayClassName = "",
  sheetClassName = "",
  contentClassName = "",
}: BottomSheetProps) => {
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && isVisible && !isClosing) {
      setIsClosing(true);
    }
  }, [isOpen, isVisible, isClosing]);

  useGSAP(() => {
    if (!isVisible || isClosing) return;

    const bottomSheet = bottomSheetRef.current;
    const overlay = overlayRef.current;

    if (!bottomSheet || !overlay) return;

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline();
    
    tl.to(overlay, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    })
    .to(bottomSheet, {
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.1");

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible, isClosing]);

  useGSAP(() => {
    if (!isClosing) return;

    const bottomSheet = bottomSheetRef.current;
    const overlay = overlayRef.current;

    if (!bottomSheet || !overlay) return;

    const tl = gsap.timeline();
    
    tl.to(bottomSheet, {
      y: "100%",
      duration: 0.3,
      ease: "power2.in"
    })
    .to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out"
    }, "-=0.2")
    .call(() => {
      setIsVisible(false);
      setIsClosing(false);
      document.body.style.overflow = 'auto';
    });
  }, [isClosing]);

  const handleClose = () => {
    if (isClosing) return;
    onClose();
  };

  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isClosing) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, isClosing]);

  if (!isVisible) return null;

  return (
    <>
      
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] opacity-0 pointer-events-none ${overlayClassName}`}
        onClick={handleOverlayClick}
      />
      <div
        ref={bottomSheetRef}
        className={`fixed top-0 left-0 right-0 bg-white shadow-2xl z-[70] transform translate-y-full ${sheetClassName}`}
        style={{ 
          height: maxHeight,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        
        <div className="relative px-6 pt-4 pb-2">
          {showHandle && (
            <div className="flex justify-center">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}
          
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-6 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        
        {title && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        
        <div className={`px-6 py-6 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
