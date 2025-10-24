'use client';

import { Wallet } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useUserPositionForToken } from '@/hooks/useUserPositions';
import { useAccount } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { CONTRACTS } from '@/constants/contractsConstants';
import LendingPoolAbi from '@/abis/LendingPool.json';
import { parseUnitsString } from '@/utils/lendingUtils';
import { useQueryClient } from '@tanstack/react-query';
import { ActivePosition } from '@/utils/positionMapping';
import { getTokenBySymbol } from '@/utils/positionMapping';
import { NETWORKS } from '@/constants/networkConstants';

interface WithdrawSupplyProps {
  position: ActivePosition;
  onTransactionComplete?: (data: any) => void;
}

export default function WithdrawSupply({ position, onTransactionComplete }: WithdrawSupplyProps) {
  const [amount, setAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
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

  const { formattedAmount: currentPositionAmount } = useUserPositionForToken(
    tokenInfo.address,
    tokenInfo.chainId,
    undefined,
    tokenInfo.decimals
  );

  const apyString = position.entry.market?.supplyRatePercent || '0.00%';

  const handleWithdraw = async () => {
    try {
      if (!address || !amount || parseFloat(amount.replace(/,/g, '')) <= 0) return;

      const amt = amount.replace(/,/g, '');
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

      setIsWithdrawing(true);

      const hash = await writeContract(config, {
        abi: LendingPoolAbi as any,
        address: proxy,
        chainId: tokenInfo.chainId as any,
        functionName: 'withdrawLiquidity',
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
        type: 'withdraw-supply',
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
      console.error('Withdraw failed:', error);
      const transactionData = {
        type: 'withdraw-supply',
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
      setIsWithdrawing(false);
    }
  };

  const handleMaxClick = () => {
    const positionAmount = parseFloat(currentPositionAmount || '0');
    if (Number.isNaN(positionAmount) || positionAmount <= 0) {
      setAmount('0');
      return;
    }
    const dustFactor = 0.999;
    const maxUsable = positionAmount * dustFactor;
    const formattedAmount = parseFloat(maxUsable.toFixed(Math.min(6, tokenInfo.decimals))).toString();
    setAmount(formattedAmount);
  };

  const formatBalance = (value: string) => {
    const num = parseFloat(value || '0');
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString('id-ID');
  };

  const isInsufficientBalance = parseFloat(currentPositionAmount || '0') === 0;
  const hasAmount = amount && parseFloat(amount.replace(/,/g, '')) > 0;
  const inputAmount = parseFloat(amount.replace(/,/g, '') || '0');
  const positionAmount = parseFloat(currentPositionAmount || '0');
  const isAmountExceedingPosition = hasAmount && inputAmount > positionAmount;

  return (
    <div className="w-full space-y-5 pb-4 bg-white">
      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img src={tokenInfo.logo} alt={tokenInfo.symbol} width={24} height={24} className="object-contain" />
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
            {/* <button className="p-1 hover:bg-gray-200 rounded transition">
              <img src="/assets/icons/arrow_swap.png" alt="Swap Arrow" className="w-4 h-4 object-contain" />
            </button> */}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Wallet className="w-4 h-4" />
            {formatBalance(currentPositionAmount || '0')}
          </span>
          <button onClick={handleMaxClick} className="text-sm text-gray-900">
            MAX
          </button>
        </div>
        {isAmountExceedingPosition && <div className="mt-2 text-sm text-red-600">Amount exceeds position</div>}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Position Information ({tokenInfo.symbol})</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APY</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-green-600 font-semibold text-[15px]">~{apyString}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Current Position</span>
            <span className="text-gray-900 font-semibold text-[15px]">
              {formatBalance(currentPositionAmount || '0')}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Withdraw Amount</span>
            <span className="text-gray-900 font-semibold text-[15px]">{formatBalance(amount || '0')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Remaining Position</span>
            <span className="text-gray-900 font-semibold text-[15px]">
              {formatBalance((positionAmount - inputAmount).toFixed(2))}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!hasAmount || isInsufficientBalance || isAmountExceedingPosition || isWithdrawing}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition ${
          hasAmount && !isInsufficientBalance && !isAmountExceedingPosition && !isWithdrawing
            ? 'bg-[#56A2CC] hover:bg-[#56A2CC]/80'
            : 'bg-[#a8cfe5] cursor-not-allowed'
        }`}
      >
        {isWithdrawing
          ? 'Withdrawing...'
          : isInsufficientBalance
            ? 'No position to withdraw'
            : isAmountExceedingPosition
              ? 'Amount exceeds position'
              : hasAmount
                ? `Withdraw ${tokenInfo.symbol}`
                : 'Enter an amount'}
      </button>
    </div>
  );
}
