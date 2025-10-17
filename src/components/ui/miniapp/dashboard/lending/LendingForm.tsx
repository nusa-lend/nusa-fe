'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import SelectChain from './SelectChain';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';
import InputAmount from './InputAmount';
import LendNotif from './LendNotif';

interface LendingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLend: (chain: any, amount: string) => void;
  selectedMarket: LendingMarket | null;
}

export default function LendingForm({ isOpen, onClose, onLend, selectedMarket }: LendingFormProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'input' | 'notification'>('select');
  const [selectedChain, setSelectedChain] = useState<LendingNetworkOption | null>(null);

  const [lentAmount, setLentAmount] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetHeight = currentStep === 'notification' ? '75vh' : '96vh';

  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null!);

  const handleChainSelect = (chain: LendingNetworkOption) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedChain(chain);

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
        setSelectedChain(null);
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
      setSelectedChain(null);

      setLentAmount('');
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleLend = (amount: string) => {
    setLentAmount(amount);

    if (isAnimating) return;
    setIsAnimating(true);
    // onLend(selectedChain, amount);

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
    setSelectedChain(null);
    setLentAmount('');
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedChain(null);

    setLentAmount('');
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
          {selectedMarket && <SelectChain market={selectedMarket} onSelect={handleChainSelect} />}
        </div>

        <div
          ref={inputRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'input' ? 20 : 1,
            visibility: currentStep === 'input' ? 'visible' : 'hidden',
          }}
        >
          <InputAmount
            selectedMarket={selectedMarket}
            selectedChain={selectedChain}
            onBack={handleBack}
            onLend={handleLend}
          />
        </div>

        <div
          ref={notificationRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'notification' ? 40 : 1,
            visibility: currentStep === 'notification' ? 'visible' : 'hidden',
          }}
        >
          <LendNotif
            selectedMarket={selectedMarket}
            selectedChain={selectedChain}
            amount={lentAmount}
            onDone={handleNotificationDone}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
