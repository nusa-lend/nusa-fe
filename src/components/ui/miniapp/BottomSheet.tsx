'use client';

import { useRef, useEffect, ReactNode, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxHeight?: string;
  height?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  overlayClassName?: string;
  sheetClassName?: string;
  contentClassName?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = '90vh',
  height,
  showHandle = true,
  showCloseButton = true,
  overlayClassName = '',
  sheetClassName = '',
  contentClassName = '',
  contentRef,
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
      duration: 0.15,
      ease: 'power2.out',
    }).to(
      bottomSheet,
      {
        y: 0,
        duration: 0.15,
        ease: 'power2.out',
      },
      '-=0.05'
    );

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
      y: '100%',
      duration: 0.15,
      ease: 'power2.in',
    })
      .to(
        overlay,
        {
          opacity: 0,
          duration: 0.1,
          ease: 'power2.out',
        },
        '-=0.1'
      )
      .call(() => {
        setIsVisible(false);
        setIsClosing(false);
        document.body.style.overflow = 'auto';
      });
  }, [isClosing]);

  useEffect(() => {
    if (!isVisible) return;
    const bottomSheet = bottomSheetRef.current;
    if (!bottomSheet) return;

    const targetHeight = height || maxHeight;
    gsap.to(bottomSheet, {
      height: targetHeight,
      duration: 0.15,
      ease: 'power2.inOut',
    });
  }, [height, maxHeight, isVisible]);

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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] opacity-0 pointer-events-auto ${overlayClassName}`}
        onClick={handleOverlayClick}
      />
      <div
        ref={bottomSheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-[10000] transform translate-y-full rounded-t-3xl flex flex-col overflow-hidden ${sheetClassName}`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="sticky top-0 bg-white z-[30] px-6 rounded-t-3xl">
          {showHandle && (
            <div className="flex justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}

          <div className="flex items-center">
            {title && <h2 className="text-md font-semibold text-gray-900">{title}</h2>}
          </div>

          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-2 right-6 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 z-[50]"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 mt-11 relative z-0 scrollbar-thin">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
