'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import SelectCoin from './SelectCoin';
import InputAmount from './InputAmount';
import BorrowNotif from './BorrowNotif';

interface BorrowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrow: (stablecoin: any, amount: string) => void;
}

export default function BorrowForm({ isOpen, onClose, onBorrow }: BorrowFormProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'input' | 'notification'>('select');
  const [selectedStablecoin, setSelectedStablecoin] = useState<any>(null);
  const [borrowedAmount, setBorrowedAmount] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetHeight = '100vh';

  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null!);

  const handleStablecoinSelect = (stablecoin: any) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedStablecoin(stablecoin);

    const tl = gsap.timeline({
      defaults: { duration: 0.3, ease: 'power2.inOut' },
      onComplete: () => {
        setCurrentStep('input');
        setIsAnimating(false);

        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      },
    });

    tl.to(selectRef.current, { xPercent: -100, opacity: 0 }, 0).fromTo(
      inputRef.current,
      { xPercent: 100, opacity: 0 },
      { xPercent: 0, opacity: 1 },
      0
    );
  };

  const handleBack = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      defaults: { duration: 0.3, ease: 'power2.inOut' },
      onComplete: () => {
        setCurrentStep('select');
        setSelectedStablecoin(null);
        setIsAnimating(false);
      },
    });

    tl.to(inputRef.current, { xPercent: 100, opacity: 0 }, 0)
      .fromTo(selectRef.current, { xPercent: -100, opacity: 0 }, { xPercent: 0, opacity: 1 }, 0)
      .set(notificationRef.current, { xPercent: 100, opacity: 0, visibility: 'hidden' }, 0);
  };

  useEffect(() => {
    if (isOpen) {
      gsap.set(selectRef.current, { xPercent: 0, opacity: 1 });
      gsap.set(inputRef.current, { xPercent: 100, opacity: 0 });
      gsap.set(notificationRef.current, {
        xPercent: 100,
        opacity: 0,
        visibility: 'hidden',
      });
      setCurrentStep('select');
      setSelectedStablecoin(null);
      setBorrowedAmount('');
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleBorrow = (amount: string) => {
    setBorrowedAmount(amount);

    if (isAnimating) return;
    setIsAnimating(true);
    // onBorrow(selectedStablecoin, amount);

    setTimeout(() => {
      const tl = gsap.timeline({
        defaults: { duration: 0.3, ease: 'power2.inOut' },
        onComplete: () => {
          setCurrentStep('notification');
          setIsAnimating(false);

          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        },
      });

      tl.to(inputRef.current, { xPercent: -100, opacity: 0 }, 0).fromTo(
        notificationRef.current,
        { xPercent: 100, opacity: 0, visibility: 'hidden' },
        { xPercent: 0, opacity: 1, visibility: 'visible' },
        0
      );
    }, 100);
  };

  const handleNotificationDone = () => {
    setCurrentStep('select');
    setSelectedStablecoin(null);
    setBorrowedAmount('');
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedStablecoin(null);
    setBorrowedAmount('');
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      height={sheetHeight}
      showHandle={false}
      showCloseButton={true}
      contentRef={contentRef}
    >
      <div ref={wrapperRef} className="relative w-full h-full">
        <div
          ref={selectRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'select' ? 30 : 1,
            visibility: currentStep === 'select' ? 'visible' : 'hidden',
          }}
        >
          <SelectCoin onSelect={handleStablecoinSelect} />
        </div>

        <div
          ref={inputRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'input' ? 20 : 1,
            visibility: currentStep === 'input' ? 'visible' : 'hidden',
          }}
        >
          <InputAmount selectedStablecoin={selectedStablecoin} onBack={handleBack} onBorrow={handleBorrow} />
        </div>

        <div
          ref={notificationRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'notification' ? 40 : 1,
            visibility: currentStep === 'notification' ? 'visible' : 'hidden',
          }}
        >
          <BorrowNotif
            selectedStablecoin={selectedStablecoin}
            amount={borrowedAmount}
            onDone={handleNotificationDone}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
