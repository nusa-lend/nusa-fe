'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import SelectCoin from './SelectCoin';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
import BorrowForm from './BorrowForm';
import TransactionResult from './TransactionResult';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/hooks/useUserBalances';
import { useAllowances } from '@/hooks/useAllowances';
import { useApproveToken } from '@/hooks/useApproveToken';
import { BORROWING_CONTRACTS } from '@/constants/borrowConstants';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import BorrowingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/utils/borrowingUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';

interface BorrowSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrowComplete: (chain: any, amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => void;
  selectedMarket: BorrowingMarket | null;
}

export default function BorrowSheet({ isOpen, onClose, onBorrowComplete, selectedMarket }: BorrowSheetProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'form' | 'result'>('select');
  const [selectedNetwork, setSelectedNetwork] = useState<BorrowingNetworkOption | null>(null);
  const [borrowedAmount, setBorrowedAmount] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<{ hash?: `0x${string}`; success: boolean } | undefined>();
  const sheetHeight = currentStep === 'result' ? '75vh' : '100vh';

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
    if (selectedNetwork.chainId === 8453) return BORROWING_CONTRACTS.base.Proxy as `0x${string}`;
    if (selectedNetwork.chainId === 42161) return BORROWING_CONTRACTS.arbitrum.Proxy as `0x${string}`;
    return undefined;
  })();

  const { data: allowances, refetch: refetchAllowances } = useAllowances({
    userAddress: address,
    spenderAddress,
    market: selectedMarket,
  });

  const { approveToken, isApproving, resetApproving } = useApproveToken({
    userAddress: address,
    spenderAddress,
    selectedNetwork: selectedNetwork,
    selectedMarketId: selectedMarket?.id,
  });

  const handleApprove = async (amount: string) => {
    try {
      await approveToken(amount);
      await new Promise(resolve => setTimeout(resolve, 100));
      await refetchAllowances();
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const handleBorrow = async (collateralAmount: string, borrowAmount: string) => {
    try {
      if (!address || !selectedMarket || !selectedNetwork) return;
      
      const collateralAmt = (collateralAmount || '').replace(/,/g, '');
      const collateralNum = parseFloat(collateralAmt);
      if (!collateralAmt || Number.isNaN(collateralNum) || collateralNum <= 0) return;
      
      const borrowAmt = (borrowAmount || '').replace(/,/g, '');
      const borrowNum = parseFloat(borrowAmt);
      if (!borrowAmt || Number.isNaN(borrowNum) || borrowNum <= 0) return;
      
      const decimals = selectedNetwork.decimals ?? 6;
      const collateralValue = parseUnitsString(collateralAmt, decimals);
      const borrowValue = parseUnitsString(borrowAmt, decimals);
      
      const proxy = (() => {
        if (selectedNetwork.chainId === 8453) return BORROWING_CONTRACTS.base.Proxy as `0x${string}`;
        if (selectedNetwork.chainId === 42161) return BORROWING_CONTRACTS.arbitrum.Proxy as `0x${string}`;
        return undefined;
      })();
      if (!proxy) return;
      
      setIsBorrowing(true);
      
      const supplyHash = await writeContract(config, {
        abi: BorrowingPoolAbi as any,
        address: proxy,
        chainId: selectedNetwork.chainId as any,
        functionName: 'supplyCollateral',
        args: [address, selectedMarket.token.id as `0x${string}`, collateralValue],
      });
      await waitForTransactionReceipt(config, { hash: supplyHash });
      
      const borrowHash = await writeContract(config, {
        abi: BorrowingPoolAbi as any,
        address: proxy,
        chainId: selectedNetwork.chainId as any,
        functionName: 'borrow',
        args: [address, selectedNetwork.address as `0x${string}`, borrowValue, selectedNetwork.chainId || 0],
      });
      await waitForTransactionReceipt(config, { hash: borrowHash });
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tokenBalances', address, selectedMarket.id] }),
        queryClient.invalidateQueries({ queryKey: ['allowances', address, proxy, selectedMarket.id] }),
      ]);

      handleBorrowComplete(borrowAmount, { hash: borrowHash, success: true });
    } catch (e) {
      handleBorrowComplete(borrowAmount, { success: false });
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleNetworkSelect = (network: BorrowingNetworkOption) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedNetwork(network);
  };

  const handleResultComplete = () => {
    if (selectedNetwork && borrowedAmount && transactionInfo) {
      onBorrowComplete(selectedNetwork, borrowedAmount, transactionInfo);
    }
    setCurrentStep('select');
    setSelectedNetwork(null);
    setBorrowedAmount('');
    setTransactionInfo(undefined);
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedNetwork(null);
    setBorrowedAmount('');
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

  const handleBorrowComplete = (amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => {
    setBorrowedAmount(amount);
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
    if (isAnimating && currentStep === 'form' && borrowedAmount && transactionInfo && formRef.current && resultRef.current) {
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
  }, [isAnimating, currentStep, borrowedAmount, transactionInfo]);

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
      setBorrowedAmount('');
      setTransactionInfo(undefined);
      setIsAnimating(false);
      resetApproving();
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
          {selectedMarket && <SelectCoin market={selectedMarket} onSelect={handleNetworkSelect} />}
        </div>

        <div
          ref={formRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'form' ? 20 : 1,
            visibility: currentStep === 'form' ? 'visible' : 'hidden',
          }}
        >
          <BorrowForm
            selectedMarket={selectedMarket}
            selectedNetwork={selectedNetwork}
            onBack={handleBack}
            onBorrow={handleBorrow}
            onApprove={handleApprove}
            isBorrowing={isBorrowing}
            isApproving={isApproving}
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
            amount={borrowedAmount}
            transaction={transactionInfo}
            onComplete={handleResultComplete}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
