'use client';

import { Wallet } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useUserPositionForToken } from '@/hooks/useUserPositions';
import { useAccount } from 'wagmi';
import { getBalance } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAllowances } from '@/hooks/useAllowances';
import { useApproveToken } from '@/hooks/useApproveToken';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { CONTRACTS } from '@/constants/contractsConstants';
import LendingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/utils/lendingUtils';
import { ActivePosition } from '@/utils/positionMapping';
import { getTokenBySymbol } from '@/utils/positionMapping';
import { NETWORKS } from '@/constants/networkConstants';

interface SupplyMoreProps {
  position: ActivePosition;
  onTransactionComplete?: (data: any) => void;
}

export default function SupplyMore({ position, onTransactionComplete }: SupplyMoreProps) {
  const [amount, setAmount] = useState('');
  const [isSupplying, setIsSupplying] = useState(false);
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const tokenInfo = useMemo(() => {
    const [chainId, tokenAddress] = position.entry.tokenId.split(':');
    const token = getTokenBySymbol(position.entry.token?.symbol || '');
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

  const { data: userBalance, isLoading: isBalanceLoading } = useQuery({
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

  const apyString = position.entry.market?.supplyRatePercent || '0.00%';
  const apyValue = parseFloat(apyString.replace('%', ''));

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

  const { approveToken, isApproving } = useApproveToken({
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

  const { formattedAmount: currentPositionAmount } = useUserPositionForToken(
    tokenInfo.address,
    tokenInfo.chainId,
    undefined,
    tokenInfo.decimals
  );

  const yieldCalculations = useMemo(() => {
    const currentPosition = parseFloat(currentPositionAmount || '0');
    const inputAmount = parseFloat(amount.replace(/,/g, '') || '0');
    
    if (isNaN(apyValue) || apyValue === 0) {
      return {
        currentMonthlyYield: 0,
        currentYearlyYield: 0,
        additionalMonthlyYield: 0,
        additionalYearlyYield: 0,
        totalMonthlyYield: 0,
        totalYearlyYield: 0,
      };
    }

    const currentMonthlyYield = (currentPosition * apyValue) / 100 / 12;
    const currentYearlyYield = (currentPosition * apyValue) / 100;
    const additionalMonthlyYield = (inputAmount * apyValue) / 100 / 12;
    const additionalYearlyYield = (inputAmount * apyValue) / 100;
    const totalMonthlyYield = currentMonthlyYield + additionalMonthlyYield;
    const totalYearlyYield = currentYearlyYield + additionalYearlyYield;

    return {
      currentMonthlyYield,
      currentYearlyYield,
      additionalMonthlyYield,
      additionalYearlyYield,
      totalMonthlyYield,
      totalYearlyYield,
    };
  }, [currentPositionAmount, amount, apyValue]);

  const hasAllowance = allowances && allowances[`network-${tokenInfo.chainId}`] 
    ? parseFloat(allowances[`network-${tokenInfo.chainId}`].formatted || '0') >= parseFloat(amount.replace(/,/g, '') || '0')
    : false;

  const handleApprove = async () => {
    try {
      await approveToken(amount);
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  const handleSupply = async () => {
    try {
      if (!address || !amount || parseFloat(amount.replace(/,/g, '')) <= 0) return;
      
      const amt = amount.replace(/,/g, '');
      const num = parseFloat(amt);
      if (Number.isNaN(num) || num <= 0) return;
      
      const decimals = tokenInfo.decimals;
      const value = parseUnitsString(amt, decimals);
      const proxy = spenderAddress;
      
      if (!proxy) return;
      
      setIsSupplying(true);
      
      const hash = await writeContract(config, {
        abi: LendingPoolAbi as any,
        address: proxy,
        chainId: tokenInfo.chainId as any,
        functionName: 'supplyLiquidity',
        args: [address, tokenInfo.address as `0x${string}`, value],
      });
      
      await waitForTransactionReceipt(config, { hash });
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tokenBalance', address, tokenInfo.address, tokenInfo.chainId] }),
        queryClient.invalidateQueries({ queryKey: ['allowances', address, proxy, market.id] }),
        queryClient.invalidateQueries({ queryKey: ['aggregatedBalances', address] }),
        queryClient.invalidateQueries({ queryKey: ['userPositions', address] }),
      ]);

      const transactionData = {
        type: 'supply-more',
        supplyToken: {
          symbol: tokenInfo.symbol,
          logo: tokenInfo.logo,
          amount: amount,
        },
        supplyNetwork: {
          name: tokenInfo.network,
          logo: tokenInfo.networkLogo,
          apy: apyString,
        },
        amount: amount,
        position: position,
        transaction: { hash, success: true },
      };

      onTransactionComplete?.(transactionData);
    } catch (error) {
      console.error('Supply failed:', error);
      const transactionData = {
        type: 'supply-more',
        supplyToken: {
          symbol: tokenInfo.symbol,
          logo: tokenInfo.logo,
          amount: amount,
        },
        supplyNetwork: {
          name: tokenInfo.network,
          logo: tokenInfo.networkLogo,
          apy: apyString,
        },
        amount: amount,
        position: position,
        transaction: { success: false },
      };
      onTransactionComplete?.(transactionData);
    } finally {
      setIsSupplying(false);
    }
  };

  const handleMaxClick = () => {
    const bal = parseFloat(userBalance || '0');
    if (Number.isNaN(bal) || bal <= 0) {
      setAmount('0');
      return;
    }
    const dustFactor = 0.999;
    const maxUsable = bal * dustFactor;
    const formattedAmount = parseFloat(maxUsable.toFixed(Math.min(6, tokenInfo.decimals))).toString();
    setAmount(formattedAmount);
  };

  const formatBalance = (value: string) => {
    const num = parseFloat(value || '0');
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString('id-ID');
  };

  const isInsufficientBalance = parseFloat(userBalance || '0') === 0;
  const hasAmount = amount && parseFloat(amount.replace(/,/g, '')) > 0;
  const inputAmount = parseFloat(amount.replace(/,/g, '') || '0');
  const userBalanceNum = parseFloat(userBalance || '0');
  const isAmountExceedingBalance = hasAmount && inputAmount > userBalanceNum;

  if (isBalanceLoading) {
    return (
      <div className="w-full space-y-5 pb-4 bg-white">
        <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3 animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-4 bg-white">
      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img 
                src={tokenInfo.logo} 
                alt={tokenInfo.symbol} 
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
          <div className="flex items-center gap-1">
            <span className="text-gray-400 font-thin text-sm">{tokenInfo.symbol}</span>
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
        {isAmountExceedingBalance && (
          <div className="mt-2 text-sm text-red-600">
            Insufficient balance
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Estimated Yield Earned ({tokenInfo.symbol})
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APY</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-green-600 font-semibold text-[15px]">
              ~{apyString}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Current Position</span>
            <span className="text-gray-900 font-semibold text-[15px]">
              {formatBalance(currentPositionAmount || '0')}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Additional Amount</span>
            <span className="text-gray-900 font-semibold text-[15px]">
              {formatBalance(amount || '0')}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Additional Monthly Yield</span>
            <span className="text-gray-900 font-semibold text-[15px]">
              {formatBalance(yieldCalculations.additionalMonthlyYield.toFixed(2))}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Monthly Yield</span>
            <span className="text-green-600 font-semibold text-[15px]">
              {formatBalance(yieldCalculations.totalMonthlyYield.toFixed(2))}
            </span>
          </div>
        </div>
      </div>

      {hasAllowance ? (
        <button
          onClick={handleSupply}
          disabled={!hasAmount || isInsufficientBalance || isAmountExceedingBalance || isSupplying}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasAmount && !isInsufficientBalance && !isAmountExceedingBalance && !isSupplying
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' 
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isSupplying 
            ? 'Supplying...' 
            : isInsufficientBalance 
            ? 'Insufficient balance' 
            : isAmountExceedingBalance 
            ? 'Amount exceeds balance'
            : hasAmount 
            ? `Supply More` 
            : 'Enter an amount'
          }
        </button>
      ) : (
        <button
          onClick={handleApprove}
          disabled={!hasAmount || isApproving || isAmountExceedingBalance || !spenderAddress}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
            hasAmount && !isApproving && !isAmountExceedingBalance && !!spenderAddress
              ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80' 
              : 'bg-[#a8cfe5] cursor-not-allowed'
          }`}
        >
          {isApproving 
            ? 'Approving...' 
            : isAmountExceedingBalance 
            ? 'Amount exceeds balance'
            : hasAmount 
            ? 'Approve' 
            : 'Enter an amount'
          }
        </button>
      )}
    </div>
  );
}
