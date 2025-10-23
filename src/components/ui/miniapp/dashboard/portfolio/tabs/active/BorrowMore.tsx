'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { CONTRACTS } from '@/constants/contractsConstants';
import LendingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/utils/lendingUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useUserPositionForToken } from '@/hooks/useUserPositions';
import { ActivePosition } from '@/utils/positionMapping';
import { ALL_TOKENS } from '@/constants/tokenConstants';
import { NETWORKS } from '@/constants/networkConstants';
import Tooltip from '@/components/ui/miniapp/Tooltip';
import { formatBalance } from '@/utils/formatBalance';
import { Wallet } from 'lucide-react';

interface BorrowMoreProps {
  position: ActivePosition;
  onTransactionComplete?: (data: any) => void;
}

export default function BorrowMore({ position, onTransactionComplete }: BorrowMoreProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const collateralTokenInfo = useMemo(() => {
    const collateralEntries = position.position.entries.filter((e: any) => 
      (e.type === 'supply_collateral' || e.type === 'supply_liquidity') && e.token
    );
    
    const collateralEntry = collateralEntries.find((e: any) => {
      const token = ALL_TOKENS.find(t => t.logo === position.token1);
      return token && e.token.symbol === token.symbol;
    });
        
    if (collateralEntry) {
      const [chainId, tokenAddress] = collateralEntry.tokenId.split(':');
      const token = ALL_TOKENS.find(t => t.logo === position.token1);
      const network = NETWORKS.find(n => n.chainId?.toString() === chainId);
      
      const result = {
        symbol: token?.symbol || 'Unknown',
        logo: position.token1,
        address: tokenAddress,
        chainId: parseInt(chainId),
        decimals: collateralEntry.token?.decimals || 6,
        network: network?.name || 'Unknown',
        networkLogo: network?.logo || '/assets/placeholder/placeholder_selectchain.png',
      };
      
      return result;
    }
    
    const token = ALL_TOKENS.find(t => t.logo === position.token1);
    const fallback = {
      symbol: token?.symbol || 'Unknown',
      logo: position.token1,
      address: '',
      chainId: 0,
      decimals: 6,
      network: 'Unknown',
      networkLogo: '/assets/placeholder/placeholder_selectchain.png',
    };
    
    return fallback;
  }, [position.token1, position.position]);

  const borrowedTokenInfo = useMemo(() => {
    const [chainId, tokenAddress] = position.entry.tokenId.split(':');
    const network = NETWORKS.find(n => n.chainId?.toString() === chainId);
    
    const result = {
      symbol: position.entry.token?.symbol || 'Unknown',
      logo: position.token2,
      address: tokenAddress,
      chainId: parseInt(chainId),
      decimals: position.entry.token?.decimals || 6,
      network: network?.name || 'Unknown',
      networkLogo: network?.logo || '/assets/placeholder/placeholder_selectchain.png',
    };
    
    return result;
  }, [position.entry, position.token2]);

  const { formattedAmount: currentPositionAmount } = useUserPositionForToken(
    collateralTokenInfo.address,
    collateralTokenInfo.chainId,
    undefined,
    collateralTokenInfo.decimals
  );

  const apyString = position.entry.market?.supplyRatePercent || '0.00%';

  const collateralValue = parseFloat(currentPositionAmount || '0');
  const maxBorrowAmount = (collateralValue * 80) / 100;
  const inputAmount = parseFloat(borrowAmount.replace(/,/g, '') || '0');
  const currentLtv = collateralValue > 0 ? (inputAmount / collateralValue) * 100 : 0;

  const hasAmount = borrowAmount && parseFloat(borrowAmount.replace(/,/g, '')) > 0;
  const isLtvExceedingLimit = currentLtv > 80;
  const isAmountExceedingMaxBorrow = hasAmount && inputAmount > maxBorrowAmount;

  const handleBorrow = async () => {
    try {
      if (!address || !borrowAmount || parseFloat(borrowAmount.replace(/,/g, '')) <= 0) return;
      
      const amt = borrowAmount.replace(/,/g, '');
      const num = parseFloat(amt);
      if (Number.isNaN(num) || num <= 0) return;
      
      const decimals = borrowedTokenInfo.decimals;
      const value = parseUnitsString(amt, decimals);
      
      const proxy = (() => {
        if (borrowedTokenInfo.chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
        if (borrowedTokenInfo.chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
        return undefined;
      })();
      
      if (!proxy) return;
      
      setIsBorrowing(true);
      
      const hash = await writeContract(config, {
        abi: LendingPoolAbi as any,
        address: proxy,
        chainId: borrowedTokenInfo.chainId as any,
        functionName: 'borrow',
        args: [address, borrowedTokenInfo.address as `0x${string}`, value, borrowedTokenInfo.chainId || 0],
      });
      
      await waitForTransactionReceipt(config, { hash });
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userPositions', address] }),
        queryClient.invalidateQueries({ queryKey: ['userPositions'] }),
        queryClient.invalidateQueries({ queryKey: ['tokenBalance', address, borrowedTokenInfo.address, borrowedTokenInfo.chainId] }),
        queryClient.invalidateQueries({ queryKey: ['tokenBalance', address] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances', address] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances'] }),
        queryClient.invalidateQueries({ queryKey: ['userPositionForToken', borrowedTokenInfo.address, borrowedTokenInfo.chainId] }),
        queryClient.invalidateQueries({ queryKey: ['userPositionForToken'] }),
      ]);

      const transactionData = {
        type: 'borrow-more',
        collateralToken: {
          symbol: collateralTokenInfo.symbol,
          logo: collateralTokenInfo.logo,
          amount: currentPositionAmount || '0',
        },
        borrowToken: {
          symbol: borrowedTokenInfo.symbol,
          logo: borrowedTokenInfo.logo,
          amount: borrowAmount,
        },
        borrowNetwork: {
          name: borrowedTokenInfo.network,
          logo: borrowedTokenInfo.networkLogo,
          apr: apyString,
        },
        amount: borrowAmount,
        transaction: { hash, success: true }
      };

      onTransactionComplete?.(transactionData);
    } catch (error) {
      console.error('Borrow more failed:', error);
      const transactionData = {
        type: 'borrow-more',
        collateralToken: {
          symbol: collateralTokenInfo.symbol,
          logo: collateralTokenInfo.logo,
          amount: currentPositionAmount || '0',
        },
        borrowToken: {
          symbol: borrowedTokenInfo.symbol,
          logo: borrowedTokenInfo.logo,
          amount: borrowAmount,
        },
        borrowNetwork: {
          name: borrowedTokenInfo.network,
          logo: borrowedTokenInfo.networkLogo,
          apr: apyString,
        },
        amount: borrowAmount,
        transaction: { success: false }
      };
      onTransactionComplete?.(transactionData);
    } finally {
      setIsBorrowing(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const amount = (maxBorrowAmount * percentage) / 100;
    const formattedAmount = parseFloat(amount.toFixed(6)).toString();
    setBorrowAmount(formattedAmount);
  };

  return (
    <div className="w-full pb-4 bg-white">
      <div className="flex flex-col items-center gap-2">
        <div className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
          <div className="text-sm text-gray-600 mb-3">Collateral {collateralTokenInfo.symbol}</div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src={collateralTokenInfo.logo} alt={collateralTokenInfo.symbol} width={24} height={24} className="object-contain" />
              </div>
              <input
                type="text"
                value={currentPositionAmount || '0'}
                readOnly
                className="bg-transparent text-gray-500 font-semibold placeholder-gray-300 focus:outline-none flex-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-thin text-sm">USD</span>
              <button className="p-1 hover:bg-gray-200 rounded transition">
                <img src="/assets/icons/arrow_swap.png" alt="Swap Arrow" className="w-4 h-4 object-contain" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Wallet className="w-4 h-4" />
              {formatBalance(currentPositionAmount || '0')}
            </span>
          </div>
        </div>
        <div className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
          <div className="text-sm text-gray-600 mb-3">Borrow More {borrowedTokenInfo.symbol}</div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src={borrowedTokenInfo.logo} alt={borrowedTokenInfo.symbol} width={24} height={24} className="object-contain" />
              </div>
              <input
                type="text"
                value={borrowAmount}
                onChange={e => setBorrowAmount(e.target.value)}
                placeholder="Amount"
                className="bg-transparent font-semibold placeholder-gray-400 focus:outline-none flex-1 text-gray-900"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-thin text-sm">USD</span>
              <button className="p-1 hover:bg-gray-200 rounded transition">
                <img src="/assets/icons/arrow_swap.png" alt="Swap Arrow" className="w-4 h-4 object-contain" />
              </button>
            </div>
          </div>

          {collateralValue > 0 && (
            <div className="mt-3 flex gap-2">
              {[25, 50, 75, 100].map(percentage => (
                <button
                  key={percentage}
                  onClick={() => handlePercentageClick(percentage)}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {percentage}%
                </button>
              ))}
            </div>
          )}

          {collateralValue > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Max additional borrow: {formatBalance(maxBorrowAmount.toString())} {borrowedTokenInfo.symbol}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Risk Level</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>LTV / LLTV</span>
              <Tooltip
                content="If your Loan-to-value ratio (LTV) reaches 80% (Limit-LTV), your loan will be liquidated"
                trigger="click"
                position="right"
                className="z-50"
              >
                <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">i</span>
                </div>
              </Tooltip>
            </div>
            <span className="text-gray-900 font-semibold text-[15px]">
              <span className={
                currentLtv > 80
                  ? 'text-red-600'
                  : currentLtv > 64
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }>
                {currentLtv.toFixed(1)}%
              </span> / 80%
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Margin Call LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">64.0%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Liquidation LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">80.0%</span>
          </div>
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Borrow Rate</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APR</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-red-600 font-semibold text-[15px]">~{apyString}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Collateral</span>
            <span className="text-black font-semibold text-[15px]">{collateralTokenInfo.symbol} {formatBalance(currentPositionAmount || '0')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Borrowing</span>
            <span className="text-black font-semibold text-[15px]">{borrowedTokenInfo.symbol} {formatBalance(borrowAmount || '0')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Network</span>
            <span className="text-black font-semibold text-[15px]">{borrowedTokenInfo.network}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Current Position</span>
            <span className="text-black font-semibold text-[15px]">{formatBalance(currentPositionAmount || '0')} {collateralTokenInfo.symbol}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleBorrow}
        disabled={!hasAmount || isLtvExceedingLimit || isAmountExceedingMaxBorrow || isBorrowing || false}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${
          hasAmount && !isLtvExceedingLimit && !isAmountExceedingMaxBorrow && !isBorrowing ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' : 'bg-[#a8cfe5] cursor-not-allowed'
        }`}
      >
        {isBorrowing
          ? 'Borrowing...'
          : isAmountExceedingMaxBorrow
          ? 'Amount exceeds max borrow'
          : isLtvExceedingLimit
          ? 'LTV exceeds limit'
          : hasAmount 
          ? `Borrow More` 
          : 'Enter an amount'
        }
      </button>
    </div>
  );
}
