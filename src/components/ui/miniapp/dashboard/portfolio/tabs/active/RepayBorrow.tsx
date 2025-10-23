'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { getBalance } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { CONTRACTS } from '@/constants/contractsConstants';
import LendingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/utils/lendingUtils';
import { useUserPositionForToken } from '@/hooks/useUserPositions';
import { useAllowances } from '@/hooks/useAllowances';
import { useApproveToken } from '@/hooks/useApproveToken';
import { ActivePosition } from '@/utils/positionMapping';
import { ALL_TOKENS } from '@/constants/tokenConstants';
import { NETWORKS } from '@/constants/networkConstants';
import Tooltip from '@/components/ui/miniapp/Tooltip';
import { formatBalance } from '@/utils/formatBalance';
import { Wallet } from 'lucide-react';

interface RepayBorrowProps {
  position: ActivePosition;
  onTransactionComplete?: (data: any) => void;
}

export default function RepayBorrow({ position, onTransactionComplete }: RepayBorrowProps) {
  const [repayAmount, setRepayAmount] = useState('');
  const [isRepaying, setIsRepaying] = useState(false);
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const tokenInfo = useMemo(() => {
    const [chainId, tokenAddress] = position.entry.tokenId.split(':');
    const token = ALL_TOKENS.find(t => t.symbol === position.entry.token?.symbol);
    const network = NETWORKS.find(n => n.chainId?.toString() === chainId);
    
    return {
      symbol: position.entry.token?.symbol || 'Unknown',
      logo: token?.logo || '/assets/placeholder/placeholder_selectcoin.png',
      address: tokenAddress,
      chainId: parseInt(chainId),
      decimals: position.entry.token?.decimals || 6,
      network: network?.name || 'Unknown',
      networkLogo: network?.logo || '/assets/placeholder/placeholder_selectchain.png',
    };
  }, [position.entry]);

  const apyString = position.entry.market?.supplyRatePercent || '0.00%';

  const market = useMemo(() => ({
    id: `market-${tokenInfo.symbol}-${tokenInfo.chainId}`,
    tokenSymbol: tokenInfo.symbol,
    tokenName: tokenInfo.symbol,
    tokenLogo: tokenInfo.logo,
    defaultApy: apyString,
    networks: [{
      id: `network-${tokenInfo.chainId}`,
      name: tokenInfo.network,
      networkLogo: tokenInfo.networkLogo,
      apy: apyString,
      chainId: tokenInfo.chainId,
      address: tokenInfo.address,
      decimals: tokenInfo.decimals,
      isActive: true,
    }]
  }), [tokenInfo, apyString]);

  const spenderAddress = (() => {
    if (tokenInfo.chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
    if (tokenInfo.chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
    return undefined;
  })();

  const { data: allowances } = useAllowances({
    userAddress: address,
    spenderAddress,
    market: market,
  });

  const { approveToken, isApproving: isApprovingToken } = useApproveToken({
    userAddress: address,
    spenderAddress,
    selectedNetwork: {
      id: `network-${tokenInfo.chainId}`,
      name: tokenInfo.network,
      networkLogo: tokenInfo.networkLogo,
      apy: apyString,
      chainId: tokenInfo.chainId,
      address: tokenInfo.address,
      decimals: tokenInfo.decimals,
      isActive: true,
    },
    selectedMarketId: market.id,
  });

  const { data: userBalance } = useQuery({
    queryKey: ['tokenBalance', address, tokenInfo.address, tokenInfo.chainId],
    enabled: Boolean(address && tokenInfo.address),
    queryFn: async () => {
      if (!address) return '0';
      
      try {
        const balance = await getBalance(config, {
          address,
          chainId: tokenInfo.chainId as any,
          token: tokenInfo.address as `0x${string}`,
          unit: 'ether',
        });
        return balance.formatted;
      } catch (error) {
        console.error('Error fetching balance:', error);
        return '0';
      }
    },
  });

  const { formattedAmount: currentBorrowedAmount } = useUserPositionForToken(
    tokenInfo.address,
    tokenInfo.chainId,
    undefined,
    tokenInfo.decimals
  );

  const isInsufficientBalance = parseFloat(userBalance || '0') === 0;
  const hasAmount = repayAmount && parseFloat(repayAmount.replace(/,/g, '')) > 0;
  const inputAmount = parseFloat(repayAmount.replace(/,/g, '') || '0');
  const balanceAmount = parseFloat(userBalance || '0');
  const borrowedAmount = parseFloat(currentBorrowedAmount || '0');
  const isAmountExceedingBalance = hasAmount && inputAmount > balanceAmount;
  const isAmountExceedingBorrowed = hasAmount && inputAmount > borrowedAmount;

  const hasAllowance = allowances && allowances[`network-${tokenInfo.chainId}`] 
    ? parseFloat(allowances[`network-${tokenInfo.chainId}`].formatted || '0') >= parseFloat(repayAmount.replace(/,/g, '') || '0')
    : false;

  const handleRepay = async () => {
    try {
      if (!address || !repayAmount || parseFloat(repayAmount.replace(/,/g, '')) <= 0) return;
      
      const amt = repayAmount.replace(/,/g, '');
      const num = parseFloat(amt);
      if (Number.isNaN(num) || num <= 0) return;
      
      const decimals = tokenInfo.decimals;
      const value = parseUnitsString(amt, decimals);
      
      const proxy = (() => {
        if (tokenInfo.chainId === 8453) return CONTRACTS.base.Proxy as `0x${string}`;
        if (tokenInfo.chainId === 42161) return CONTRACTS.arbitrum.Proxy as `0x${string}`;
        return undefined;
      })();
      
      if (!proxy) return;
      
      const hasAllowance = allowances && allowances[`network-${tokenInfo.chainId}`] 
        ? parseFloat(allowances[`network-${tokenInfo.chainId}`].formatted || '0') >= parseFloat(amt)
        : false;
      
      if (!hasAllowance) {
        await approveToken(amt);
        return;
      }
      
      setIsRepaying(true);
      
      const hash = await writeContract(config, {
        abi: LendingPoolAbi as any,
        address: proxy,
        chainId: tokenInfo.chainId as any,
        functionName: 'repay',
        args: [address, tokenInfo.address as `0x${string}`, value],
      });
      
      await waitForTransactionReceipt(config, { hash });
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userPositions', address] }),
        queryClient.invalidateQueries({ queryKey: ['userPositions'] }),
        queryClient.invalidateQueries({ queryKey: ['tokenBalance', address, tokenInfo.address, tokenInfo.chainId] }),
        queryClient.invalidateQueries({ queryKey: ['tokenBalance', address] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances', address] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances'] }),
        queryClient.invalidateQueries({ queryKey: ['userPositionForToken', tokenInfo.address, tokenInfo.chainId] }),
        queryClient.invalidateQueries({ queryKey: ['userPositionForToken'] }),
      ]);

      const transactionData = {
        type: 'repay-borrow',
        collateralToken: {
          symbol: tokenInfo.symbol,
          logo: tokenInfo.logo,
          amount: currentBorrowedAmount || '0',
        },
        borrowToken: {
          symbol: tokenInfo.symbol,
          logo: tokenInfo.logo,
          amount: repayAmount,
        },
        borrowNetwork: {
          name: tokenInfo.network,
          logo: tokenInfo.networkLogo,
          apr: apyString,
        },
        amount: repayAmount,
        transaction: { hash, success: true }
      };

      onTransactionComplete?.(transactionData);
    } catch (error) {
      console.error('Repay failed:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        data: (error as any)?.data,
      });
      const transactionData = {
        type: 'repay-borrow',
        collateralToken: {
          symbol: tokenInfo.symbol,
          logo: tokenInfo.logo,
          amount: currentBorrowedAmount || '0',
        },
        borrowToken: {
          symbol: tokenInfo.symbol,
          logo: tokenInfo.logo,
          amount: repayAmount,
        },
        borrowNetwork: {
          name: tokenInfo.network,
          logo: tokenInfo.networkLogo,
          apr: apyString,
        },
        amount: repayAmount,
        transaction: { success: false }
      };
      onTransactionComplete?.(transactionData);
    } finally {
      setIsRepaying(false);
    }
  };

  const handleMaxClick = () => {
    const maxRepay = Math.min(balanceAmount, borrowedAmount);
    setRepayAmount(maxRepay.toString());
  };

  return (
    <div className="w-full pb-4 bg-white">
      <div className="flex flex-col items-center gap-2">
        <div className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
          <div className="text-sm text-gray-600 mb-3">Repay {tokenInfo.symbol}</div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src={tokenInfo.logo} alt={tokenInfo.symbol} width={24} height={24} className="object-contain" />
              </div>
              <input
                type="text"
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                placeholder="Amount to repay"
                className="bg-transparent text-gray-900 font-semibold placeholder-gray-300 focus:outline-none flex-1"
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
              {formatBalance(userBalance || '0')}
            </span>
            <button onClick={handleMaxClick} className="text-sm text-gray-900">
              MAX
            </button>
          </div>

        </div>
      </div>
          <div className="mt-2 text-xs text-gray-500">
            Borrowed: {formatBalance(currentBorrowedAmount || '0')} {tokenInfo.symbol}
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
              <span className="text-green-600">0%</span> / 80%
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Margin Call LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Liquidation LTV</span>
            <span className="text-gray-900 font-semibold text-[15px]">0</span>
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
            <span>Network</span>
            <span className="text-black font-semibold text-[15px]">{tokenInfo.network}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Borrowed</span>
            <span className="text-black font-semibold text-[15px]">{formatBalance(currentBorrowedAmount || '0')} {tokenInfo.symbol}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Repaying</span>
            <span className="text-black font-semibold text-[15px]">{formatBalance(repayAmount || '0')} {tokenInfo.symbol}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Available Balance</span>
            <span className="text-black font-semibold text-[15px]">{formatBalance(userBalance || '0')} {tokenInfo.symbol}</span>
          </div>
        </div>
      </div>

      {hasAllowance ? (
        <button
          onClick={handleRepay}
          disabled={!hasAmount || isInsufficientBalance || isAmountExceedingBalance || isAmountExceedingBorrowed || isRepaying || false}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${
            hasAmount && !isInsufficientBalance && !isAmountExceedingBalance && !isAmountExceedingBorrowed && !isRepaying ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isRepaying
            ? 'Repaying...'
            : isAmountExceedingBorrowed
            ? 'Amount exceeds borrowed'
            : isAmountExceedingBalance 
            ? 'Amount exceeds balance' 
            : isInsufficientBalance 
            ? 'No balance to repay' 
            : hasAmount 
            ? `Repay ${tokenInfo.symbol}` 
            : 'Enter an amount'
          }
        </button>
      ) : (
        <button
          onClick={handleRepay}
          disabled={!hasAmount || isApprovingToken || isInsufficientBalance || isAmountExceedingBalance || isAmountExceedingBorrowed || false}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${
            hasAmount && !isApprovingToken && !isInsufficientBalance && !isAmountExceedingBalance && !isAmountExceedingBorrowed ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isApprovingToken
            ? 'Approving...'
            : isAmountExceedingBorrowed
            ? 'Amount exceeds borrowed'
            : isAmountExceedingBalance 
            ? 'Amount exceeds balance' 
            : isInsufficientBalance 
            ? 'No balance to repay' 
            : hasAmount 
            ? `Approve ${tokenInfo.symbol}` 
            : 'Enter an amount'
          }
        </button>
      )}
    </div>
  );
}
