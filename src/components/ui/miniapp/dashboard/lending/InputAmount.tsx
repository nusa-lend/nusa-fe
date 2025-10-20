'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenNetworkPair from '../../TokenNetworkPair';
import type { LendingMarket, LendingNetworkOption } from '@/types/lending';
import Tooltip from '@/components/ui/miniapp/Tooltip';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/hooks/useUserBalances';
import { useAllowances, hasSufficientAllowance } from '@/hooks/useAllowances';
import { LENDING_CONTRACTS } from '@/constants/lendingConstants';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import Erc20Abi from '@/abis/Erc20.json';
import LendingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/lib/utils/lendingUtils';
import { useQueryClient } from '@tanstack/react-query';

interface InputAmountProps {
  selectedMarket: LendingMarket | null;
  selectedChain: LendingNetworkOption | null;
  onBack: () => void;
  onLend: (amount: string, tx?: { hash?: `0x${string}`; success: boolean }) => void;
}

export default function InputAmount({ selectedMarket, selectedChain, onBack, onLend }: InputAmountProps) {
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(true);
  const [isSupplying, setIsSupplying] = useState(false);
  const queryClient = useQueryClient();

  const { address } = useAccount();
  const { data: balances } = useTokenBalances({ userAddress: address, market: selectedMarket });
  const selectedBalanceStr = selectedChain ? (balances && (balances as any)[selectedChain.id]) || '0' : '0';

  const spenderAddress = (() => {
    if (!selectedChain?.chainId) return undefined;
    if (selectedChain.chainId === 8453) return LENDING_CONTRACTS.base.Proxy as `0x${string}`;
    if (selectedChain.chainId === 42161) return LENDING_CONTRACTS.arbitrum.Proxy as `0x${string}`;
    return undefined;
  })();
  const { data: allowances, refetch: refetchAllowances } = useAllowances({
    userAddress: address,
    spenderAddress,
    market: selectedMarket,
  });

  const handleSupply = async () => {
    try {
      if (!address || !selectedMarket || !selectedChain) return;
      const amt = (amount || '').replace(/,/g, '');
      const num = parseFloat(amt);
      if (!amt || Number.isNaN(num) || num <= 0) return;
      const decimals = selectedChain.decimals ?? 6;
      const value = parseUnitsString(amt, decimals);
      const proxy = (() => {
        if (selectedChain.chainId === 8453) return LENDING_CONTRACTS.base.Proxy as `0x${string}`;
        if (selectedChain.chainId === 42161) return LENDING_CONTRACTS.arbitrum.Proxy as `0x${string}`;
        return undefined;
      })();
      if (!proxy) return;
      setIsSupplying(true);
      const hash = await writeContract(config, {
        abi: LendingPoolAbi as any,
        address: proxy,
        chainId: selectedChain.chainId as any,
        functionName: 'supplyLiquidity',
        args: [address, selectedChain.address as `0x${string}`, value],
      });
      await waitForTransactionReceipt(config, { hash });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tokenBalances', address, selectedMarket.id] }),
        queryClient.invalidateQueries({ queryKey: ['allowances', address, proxy, selectedMarket.id] }),
      ]);
      onLend(amount, { hash, success: true });
    } catch (e) {
      onLend(amount, { success: false });
    } finally {
      setIsSupplying(false);
    }
  };

  const handleMaxClick = () => {
    const bal = parseFloat(selectedBalanceStr || '0');
    if (Number.isNaN(bal) || bal <= 0) {
      setAmount('0');
      return;
    }
    const dustFactor = 0.999;
    const decimals = selectedChain?.decimals ?? 6;
    const maxUsable = bal * dustFactor;
    setAmount(maxUsable.toFixed(Math.min(6, decimals)));
  };

  const formatBalance = (value: string) => {
    const num = parseFloat(value || '0');
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString('id-ID');
  };

  const toggleDisclaimer = () => {
    setIsDisclaimerExpanded(!isDisclaimerExpanded);
  };

  const isInsufficientBalance = parseFloat(selectedBalanceStr || '0') === 0;
  const hasAllowance = selectedChain ? hasSufficientAllowance(allowances, selectedChain.id, amount || '0') : false;
  
  const handleApprove = async () => {
    try {
      if (!address || !selectedMarket || !selectedChain || !spenderAddress) return;
      const amt = (amount || '').replace(/,/g, '');
      const num = parseFloat(amt);
      if (!amt || Number.isNaN(num) || num <= 0) return;
      const decimals = selectedChain.decimals ?? 6;
      const value = parseUnitsString(amt, decimals);
      setIsApproving(true);
      const hash = await writeContract(config, {
        abi: Erc20Abi as any,
        address: selectedChain.address as `0x${string}`,
        chainId: selectedChain.chainId as any,
        functionName: 'approve',
        args: [spenderAddress, value],
      });
      await waitForTransactionReceipt(config, { hash });
      await queryClient.invalidateQueries({ queryKey: ['allowances', address, spenderAddress, selectedMarket.id] });
      await new Promise(resolve => setTimeout(resolve, 100));
      await refetchAllowances();
    } catch (e) {
    } finally {
      setIsApproving(false);
    }
  };

  const hasAmount = amount && parseFloat(amount.replace(/,/g, '')) > 0;

  if (!selectedChain || !selectedMarket) return <></>;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-4 bg-white">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-full flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900">
            Lend {selectedMarket.tokenSymbol} on {selectedChain.name}
          </h2>
          <TokenNetworkPair
            tokenLogo={selectedMarket.tokenLogo}
            networkLogo={selectedChain.networkLogo}
            size={30}
            overlap={25}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={selectedMarket.tokenLogo}
                alt={selectedMarket.tokenSymbol}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              className="bg-transparent text-gray-900 font-semibold placeholder-gray-400 focus:outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-semibold">{selectedMarket.tokenSymbol}</span>
            <button className="p-1 hover:bg-gray-200 rounded transition">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-500">Balance: {formatBalance(selectedBalanceStr)}</span>
          <button onClick={handleMaxClick} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            MAX
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 -mt-2">Minimum deposit: 100,000 {selectedMarket.tokenSymbol}</div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Estimated Yield Earned ({selectedMarket.tokenSymbol})
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>My Position</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APY</span>
              <Tooltip
                content="This is Net Yield Rate of your position"
                trigger="click"
                position="right"
                className="z-50"
              >
                <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">i</span>
                </div>
              </Tooltip>
            </div>
            <span className="text-green-600 font-semibold text-[15px]">
              ~{selectedChain.apy || selectedMarket.defaultApy}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Monthly</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Yearly</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 leading-relaxed border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gray-400 text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-700">Disclaimer</p>
              <AnimatePresence initial={false}>
                {isDisclaimerExpanded && (
                  <motion.div
                    key="disclaimer-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden mt-1"
                  >
                    <p>
                      Earning involves risk. Past performance is not indicative of future results. The principal amount
                      and returns are not guaranteed.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <button onClick={toggleDisclaimer} className="p-1 rounded transition">
            <motion.svg
              animate={{ rotate: isDisclaimerExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </motion.svg>
          </button>
        </div>
      </div>

      {hasAllowance ? (
        <button
          onClick={handleSupply}
          disabled={!hasAmount || isInsufficientBalance || isSupplying}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasAmount && !isInsufficientBalance && !isSupplying
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isSupplying ? 'Supplying…' : hasAmount ? 'Supply Now' : 'Enter an amount'}
        </button>
      ) : (
        <button
          onClick={handleApprove}
          disabled={!hasAmount || isApproving || !spenderAddress}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasAmount && !isApproving && !!spenderAddress
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isApproving ? 'Approving…' : hasAmount ? 'Approve' : 'Enter an amount'}
        </button>
      )}
    </div>
  );
}
