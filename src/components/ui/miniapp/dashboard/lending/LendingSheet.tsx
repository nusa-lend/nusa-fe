'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import NetworkSelector from './NetworkSelector';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';
import LendingForm from './LendingForm';
import TransactionResult from './TransactionResult';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/hooks/useUserBalances';
import { useAllowances } from '@/hooks/useAllowances';
import { useApproveToken } from '@/hooks/useApproveToken';
import { CONTRACTS } from '@/constants/contractsConstants';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import LendingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/utils/lendingUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';

interface LendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLendingComplete: (chain: any, amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => void;
  selectedMarket: LendingMarket | null;
}

export default function LendingSheet({ isOpen, onClose, onLendingComplete, selectedMarket }: LendingModalProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'form' | 'result'>('select');
  const [selectedNetwork, setSelectedNetwork] = useState<LendingNetworkOption | null>(null);
  const [lentAmount, setLentAmount] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSupplying, setIsSupplying] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<{ hash?: `0x${string}`; success: boolean } | undefined>();
  const sheetHeight = currentStep === 'result' ? '65vh' : '100vh';

  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null!);

  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: balances } = useTokenBalances({ userAddress: address, market: selectedMarket });

  const spenderAddress = (() => {
    if (!selectedNetwork?.chainId) return undefined;
    if (selectedNetwork.chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
    if (selectedNetwork.chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
    return undefined;
  })();

  const { data: allowances } = useAllowances({
    userAddress: address,
    spenderAddress,
    market: selectedMarket,
  });

  const { approveToken, isApproving, resetApproving } = useApproveToken({
    userAddress: address,
    spenderAddress,
    selectedNetwork,
    selectedMarketId: selectedMarket?.id,
  });

  const handleApprove = async (amount: string) => {
    try {
      await approveToken(amount);
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const handleSupply = async (amount: string) => {
    try {
      if (!address || !selectedMarket || !selectedNetwork) return;
      const amt = (amount || '').replace(/,/g, '');
      const num = parseFloat(amt);
      if (!amt || Number.isNaN(num) || num <= 0) return;
      const decimals = selectedNetwork.decimals ?? 6;
      const value = parseUnitsString(amt, decimals);
      const proxy = (() => {
        if (selectedNetwork.chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
        if (selectedNetwork.chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
        return undefined;
      })();
      if (!proxy) return;
      setIsSupplying(true);
      const hash = await writeContract(config, {
        abi: LendingPoolAbi as any,
        address: proxy,
        chainId: selectedNetwork.chainId as any,
        functionName: 'supplyLiquidity',
        args: [address, selectedNetwork.address as `0x${string}`, value],
      });
      await waitForTransactionReceipt(config, { hash });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tokenBalances', address, selectedMarket.id] }),
        queryClient.invalidateQueries({ queryKey: ['allowances', address, proxy, selectedMarket.id] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances', address] }),
      ]);

      handleLendingComplete(amount, { hash, success: true });
    } catch (e) {
      handleLendingComplete(amount, { success: false });
    } finally {
      setIsSupplying(false);
    }
  };

  const handleNetworkSelect = (network: LendingNetworkOption) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedNetwork(network);
  };

  const handleResultComplete = () => {
    if (selectedNetwork && lentAmount && transactionInfo) {
      onLendingComplete(selectedNetwork, lentAmount, transactionInfo);
    }
    setCurrentStep('select');
    setSelectedNetwork(null);
    setLentAmount('');
    setTransactionInfo(undefined);
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedNetwork(null);
    setLentAmount('');
    setTransactionInfo(undefined);
    resetApproving();
    onClose();
  };

  const handleBack = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentStep('select');
    setSelectedNetwork(null);
    resetApproving();
  };

  const handleLendingComplete = (amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => {
    setLentAmount(amount);
    setTransactionInfo(tx);

    if (isAnimating) return;
    setIsAnimating(true);
  };

  useGSAP(() => {
    if (selectedNetwork && isAnimating && currentStep === 'select' && selectRef.current && formRef.current) {
      const tl = gsap.timeline({
        defaults: { duration: 0.3, ease: 'power2.inOut' },
        onComplete: () => {
          setCurrentStep('form');
          setIsAnimating(false);

          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        },
      });

      tl.to(selectRef.current, { xPercent: -100, opacity: 0 }, 0).fromTo(
        formRef.current,
        { xPercent: 100, opacity: 0 },
        { xPercent: 0, opacity: 1 },
        0
      );
    }
  }, [selectedNetwork, isAnimating, currentStep]);

  useGSAP(() => {
    if (isAnimating && currentStep === 'select' && !selectedNetwork && formRef.current && selectRef.current) {
      const tl = gsap.timeline({
        defaults: { duration: 0.3, ease: 'power2.inOut' },
        onComplete: () => {
          setIsAnimating(false);

          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        },
      });

      tl.to(formRef.current, { xPercent: 100, opacity: 0 }, 0).fromTo(
        selectRef.current,
        { xPercent: -100, opacity: 0 },
        { xPercent: 0, opacity: 1 },
        0
      );
    }
  }, [isAnimating, currentStep, selectedNetwork]);

  useGSAP(() => {
    if (
      isAnimating &&
      currentStep === 'form' &&
      lentAmount &&
      transactionInfo &&
      formRef.current &&
      resultRef.current
    ) {
      const tl = gsap.timeline({
        defaults: { duration: 0.3, ease: 'power2.inOut' },
        onComplete: () => {
          setCurrentStep('result');
          setIsAnimating(false);

          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        },
      });

      tl.to(formRef.current, { xPercent: -100, opacity: 0 }, 0).fromTo(
        resultRef.current,
        { xPercent: 100, opacity: 0, visibility: 'hidden' },
        { xPercent: 0, opacity: 1, visibility: 'visible' },
        0
      );
    }
  }, [isAnimating, currentStep, lentAmount, transactionInfo]);

  useGSAP(() => {
    if (isOpen && selectRef.current && formRef.current && resultRef.current) {
      gsap.set(selectRef.current, { xPercent: 0, opacity: 1 });
      gsap.set(formRef.current, { xPercent: 100, opacity: 0 });
      gsap.set(resultRef.current, {
        xPercent: 100,
        opacity: 0,
        visibility: 'hidden',
      });
      setCurrentStep('select');
      setSelectedNetwork(null);
      setLentAmount('');
      setTransactionInfo(undefined);
      setIsAnimating(false);
      resetApproving(); // Reset approving state when opening modal
    }
  }, [isOpen]);

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
          {selectedMarket && <NetworkSelector market={selectedMarket} onNetworkSelect={handleNetworkSelect} />}
        </div>

        <div
          ref={formRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'form' ? 20 : 1,
            visibility: currentStep === 'form' ? 'visible' : 'hidden',
          }}
        >
          <LendingForm
            selectedMarket={selectedMarket}
            selectedNetwork={selectedNetwork}
            onBack={handleBack}
            onApprove={handleApprove}
            onSupply={handleSupply}
            isApproving={isApproving}
            isSupplying={isSupplying}
            balances={balances}
            allowances={allowances}
            spenderAddress={spenderAddress}
          />
        </div>

        <div
          ref={resultRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'result' ? 40 : 1,
            visibility: currentStep === 'result' ? 'visible' : 'hidden',
          }}
        >
          <TransactionResult
            selectedMarket={selectedMarket}
            selectedNetwork={selectedNetwork}
            amount={lentAmount}
            transaction={transactionInfo}
            onComplete={handleResultComplete}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
