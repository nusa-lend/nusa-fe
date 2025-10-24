'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import BottomSheet from '@/components/ui/miniapp/BottomSheet';
import NetworkSelector from './NetworkSelector';
import TokenSelection from './TokenSelection';
import type { BorrowingMarket, BorrowingNetworkOption } from '@/types/borrowing';
import type { BorrowingTokenOption } from '@/utils/borrowingUtils';
import BorrowForm from './BorrowForm';
import TransactionResult from './TransactionResult';
import { useAccount, useSwitchChain } from 'wagmi';
import { useTokenBalances } from '@/hooks/useUserBalances';
import { useAllowances } from '@/hooks/useAllowances';
import { useApproveToken } from '@/hooks/useApproveToken';
import { CONTRACTS } from '@/constants/contractsConstants';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import BorrowingPoolAbi from '@/abis/LendingPool.json';
import GetFeeAbi from '@/abis/GetFee.json';
import { parseUnitsString } from '@/utils/borrowingUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import { SUPPORTED_BORROWING_POOLS } from '@/constants/borrowConstants';
import { readContract } from '@wagmi/core';

interface BorrowSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrowComplete: (chain: any, amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => void;
  selectedMarket: BorrowingMarket | null;
  borrowingTokens: BorrowingTokenOption[];
}

export default function BorrowSheet({
  isOpen,
  onClose,
  onBorrowComplete,
  selectedMarket,
  borrowingTokens,
}: BorrowSheetProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'network' | 'form' | 'result'>('select');
  const [selectedNetwork, setSelectedNetwork] = useState<BorrowingNetworkOption | null>(null);
  const [selectedBorrowToken, setSelectedBorrowToken] = useState<BorrowingTokenOption | null>(null);
  const [borrowedAmount, setBorrowedAmount] = useState<string>('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<{ hash?: `0x${string}`; success: boolean } | undefined>();
  const previousChainIdRef = useRef<number | null>(null);
  const sheetHeight = currentStep === 'result' ? '65vh' : '100vh';

  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null!);

  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const queryClient = useQueryClient();
  const { data: balances } = useTokenBalances({ userAddress: address, market: selectedMarket });

  const spenderAddress = CONTRACTS.base.Proxy as `0x${string}`;

  const { data: allowances } = useAllowances({
    userAddress: address,
    spenderAddress,
    market: selectedMarket,
  });

  const collateralNetworkOption = selectedMarket
    ? {
        id: 'base-collateral',
        name: selectedMarket.token.symbol,
        networkLogo: selectedMarket.token.logo,
        interestRate: '0%',
        maxBorrowAmount: 100000,
        chainId: 8453,
        address:
          selectedMarket.networks.find(net => net.chainId === 8453)?.address || selectedMarket.networks[0].address,
        decimals:
          selectedMarket.networks.find(net => net.chainId === 8453)?.decimals || selectedMarket.networks[0].decimals,
      }
    : null;

  const { approveToken, isApproving, resetApproving } = useApproveToken({
    userAddress: address,
    spenderAddress,
    selectedNetwork: collateralNetworkOption,
    selectedMarketId: selectedMarket?.id,
  });

  const handleApprove = async (amount: string) => {
    try {
      await approveToken(amount);
      await queryClient.invalidateQueries({
        queryKey: ['allowances', address, spenderAddress, selectedMarket?.id],
      });
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const switchBackToPreviousNetwork = async () => {
    try {
      if (previousChainIdRef.current) {
        await switchChain({ chainId: previousChainIdRef.current });
      }
    } catch (error) {
      console.error('Failed to switch back to previous network:', error);
    }
  };

  const handleBorrow = async (collateralAmount: string, borrowAmount: string) => {
    try {
      if (!address || !selectedMarket || !selectedNetwork || !selectedBorrowToken) return;

      previousChainIdRef.current = chainId || null;

      if (chainId !== 8453) {
        try {
          await switchChain({ chainId: 8453 });
        } catch (switchError) {
          console.error('Failed to switch to Base chain:', switchError);
          throw new Error('Please switch to Base network to supply collateral');
        }
      }

      const collateralAmt = (collateralAmount || '').replace(/,/g, '');
      const collateralNum = parseFloat(collateralAmt);
      if (!collateralAmt || Number.isNaN(collateralNum) || collateralNum <= 0) return;

      const borrowAmt = (borrowAmount || '').replace(/,/g, '');
      const borrowNum = parseFloat(borrowAmt);
      if (!borrowAmt || Number.isNaN(borrowNum) || borrowNum <= 0) return;

      const tokenPool = SUPPORTED_BORROWING_POOLS[selectedBorrowToken.id as keyof typeof SUPPORTED_BORROWING_POOLS];
      if (!tokenPool) {
        console.error('Token pool not found for:', selectedBorrowToken.id);
        return;
      }

      const tokenNetwork = tokenPool.networks.find(net => net.chainId === selectedNetwork.chainId);
      if (!tokenNetwork) {
        console.error('Token network not found for chainId:', selectedNetwork.chainId);
        return;
      }

      const collateralDecimals = selectedMarket.networks[0].decimals ?? 18;
      const borrowDecimals = tokenNetwork.decimals ?? 6;
      const collateralValue = parseUnitsString(collateralAmt, collateralDecimals);

      let borrowValue: string;
      if (selectedNetwork.chainId === 8453) {
        borrowValue = parseUnitsString(borrowAmt, borrowDecimals);
      } else {
        try {
          const getFeeContract = CONTRACTS.base.GetFee as `0x${string}`;
          const parsedAmount = parseUnitsString(borrowAmt, borrowDecimals);
          
          const feeAmount = await readContract(config, {
            abi: GetFeeAbi as any,
            address: getFeeContract,
            chainId: 8453,
            functionName: 'getFee',
            args: [
              address,
              tokenNetwork.address as `0x${string}`,
              selectedNetwork.chainId || 0,
              parsedAmount,
            ],
          });
          
          const feeResult = (feeAmount as { toString: () => string }).toString();
          
          const originalAmount = BigInt(parsedAmount);
          const feeAmountBigInt = BigInt(feeResult);
          
          if (feeAmountBigInt < originalAmount / BigInt(100)) {
            borrowValue = parsedAmount;
          } else {
            borrowValue = feeResult;
          }
        } catch (error) {
          console.error('Failed to get cross-chain fee:', error);
          throw new Error(`Failed to get cross-chain fee: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const baseProxy = CONTRACTS.base.Proxy as `0x${string}`;
      if (!baseProxy) return;

      setIsBorrowing(true);

      const collateralTokenAddress = selectedMarket.networks.find(net => net.chainId === 8453)?.address;
      if (!collateralTokenAddress) return;

      const supplyHash = await writeContract(config, {
        abi: BorrowingPoolAbi as any,
        address: baseProxy,
        chainId: 8453,
        functionName: 'supplyCollateral',
        args: [address, collateralTokenAddress as `0x${string}`, collateralValue],
      });
      await waitForTransactionReceipt(config, { hash: supplyHash });

      const borrowProxy = (() => {
        if (selectedNetwork.chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
        if (selectedNetwork.chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
        return undefined;
      })();

      if (!borrowProxy) {
        console.error('No proxy contract found for chainId:', selectedNetwork.chainId);
        throw new Error(`No proxy contract found for chainId: ${selectedNetwork.chainId}`);
      }

      if (selectedNetwork.chainId !== chainId) {
        try {
          await switchChain({ chainId: selectedNetwork.chainId! });
        } catch (switchError) {
          console.error('Failed to switch chain:', switchError);
          throw new Error(`Please switch to ${selectedNetwork.name} network to complete the borrow transaction`);
        }
      }

      let borrowHash: `0x${string}`;
      try {
        borrowHash = await writeContract(config, {
          abi: BorrowingPoolAbi as any,
          address: borrowProxy,
          chainId: selectedNetwork.chainId as any,
          functionName: 'borrow',
          args: [address, tokenNetwork.address as `0x${string}`, borrowValue, selectedNetwork.chainId || 0],
        });

        await waitForTransactionReceipt(config, { hash: borrowHash });
      } catch (borrowError) {
        console.error('Borrow failed after supply success, attempting to withdraw collateral:', borrowError);

        if (chainId !== 8453) {
          try {
            await switchChain({ chainId: 8453 });
          } catch (switchError) {
            console.error('Failed to switch back to Base chain:', switchError);
            throw new Error('Borrow failed. Please manually switch to Base network to withdraw your collateral.');
          }
        }

        try {
          const withdrawHash = await writeContract(config, {
            abi: BorrowingPoolAbi as any,
            address: baseProxy,
            chainId: 8453,
            functionName: 'withdrawCollateral',
            args: [address, collateralTokenAddress as `0x${string}`, collateralValue],
          });
          await waitForTransactionReceipt(config, { hash: withdrawHash });
        } catch (withdrawError) {
          console.error('Failed to withdraw collateral after borrow failure:', withdrawError);
          throw new Error(
            'Borrow failed and unable to withdraw collateral. Your collateral has been supplied but you did not receive the borrowed tokens. Please contact support.'
          );
        }

        throw borrowError;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tokenBalances', address, selectedMarket.id] }),
        queryClient.invalidateQueries({ queryKey: ['allowances', address, baseProxy, selectedMarket.id] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances', address] }),
      ]);

      handleBorrowComplete(borrowAmount, { hash: borrowHash, success: true });
      setTimeout(async () => {
        await switchBackToPreviousNetwork();
      }, 2000);
    } catch (e) {
      handleBorrowComplete(borrowAmount, { success: false });
      setTimeout(async () => {
        await switchBackToPreviousNetwork();
      }, 2000);
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleTokenSelect = (token: BorrowingTokenOption) => {
    setSelectedBorrowToken(token);
    setCurrentStep('network');
  };

  const handleNetworkSelect = (network: BorrowingNetworkOption) => {
    setSelectedNetwork(network);
    setCurrentStep('form');
  };

  const handleResultComplete = () => {
    if (selectedNetwork && borrowedAmount && transactionInfo) {
      onBorrowComplete(selectedNetwork, borrowedAmount, transactionInfo);
    }
    setCurrentStep('select');
    setSelectedNetwork(null);
    setSelectedBorrowToken(null);
    setBorrowedAmount('');
    setTransactionInfo(undefined);
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedNetwork(null);
    setSelectedBorrowToken(null);
    setBorrowedAmount('');
    setTransactionInfo(undefined);
    previousChainIdRef.current = null;
    resetApproving();
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'form') setCurrentStep('network');
    else if (currentStep === 'network') setCurrentStep('select');
    else onClose();
  };

  const handleBorrowComplete = (amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => {
    setBorrowedAmount(amount);
    setTransactionInfo(tx);
    setCurrentStep('result');
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentStep]);

  useGSAP(() => {
    if (!selectRef.current || !networkRef.current || !formRef.current || !resultRef.current) return;

    const panels = [selectRef.current, networkRef.current, formRef.current, resultRef.current];
    gsap.set(panels, { xPercent: 100, opacity: 0, visibility: 'hidden' });
    gsap.set(selectRef.current, { xPercent: 0, opacity: 1, visibility: 'visible' });
  }, []);

  useGSAP(() => {
    const refs: Record<typeof currentStep, HTMLElement | null> = {
      select: selectRef.current,
      network: networkRef.current,
      form: formRef.current,
      result: resultRef.current,
    };

    const prevStepRef = (useGSAP as any)._prevStepRef ?? ((useGSAP as any)._prevStepRef = { current: currentStep });
    const prevStep = prevStepRef.current;
    prevStepRef.current = currentStep;

    if (!prevStep || prevStep === currentStep) return;

    const fromRef = refs[prevStep as keyof typeof refs];
    const toRef = refs[currentStep as keyof typeof refs];
    if (!fromRef || !toRef) return;

    const direction =
      (prevStep === 'select' && currentStep === 'network') ||
      (prevStep === 'network' && currentStep === 'form') ||
      (prevStep === 'form' && currentStep === 'result')
        ? 'next'
        : 'back';

    const xOut = direction === 'next' ? -100 : 100;
    const xIn = direction === 'next' ? 100 : -100;

    const tl = gsap.timeline({
      defaults: { duration: 0.35, ease: 'power2.inOut' },
      onStart: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      },
      onComplete: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      },
    });

    tl.to(fromRef, { xPercent: xOut, opacity: 0, visibility: 'hidden' }, 0).fromTo(
      toRef,
      { xPercent: xIn, opacity: 0, visibility: 'hidden' },
      { xPercent: 0, opacity: 1, visibility: 'visible' },
      0
    );
  }, [currentStep]);

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
          {selectedMarket && (
            <TokenSelection
              tokens={borrowingTokens}
              selectedToken={selectedBorrowToken}
              onTokenSelect={handleTokenSelect}
              onBack={handleBack}
            />
          )}
        </div>

        <div
          ref={networkRef}
          className="absolute inset-0 w-full"
          style={{
            zIndex: currentStep === 'network' ? 25 : 1,
            visibility: currentStep === 'network' ? 'visible' : 'hidden',
          }}
        >
          {selectedMarket && selectedBorrowToken && (
            <NetworkSelector
              market={selectedMarket}
              selectedBorrowToken={selectedBorrowToken}
              onNetworkSelect={handleNetworkSelect}
              onBack={handleBack}
            />
          )}
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
            selectedBorrowToken={selectedBorrowToken}
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
            selectedBorrowToken={selectedBorrowToken}
            amount={borrowedAmount}
            transaction={transactionInfo}
            onComplete={handleResultComplete}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
