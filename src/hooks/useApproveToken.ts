import { useState } from 'react';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { useQueryClient } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import Erc20Abi from '@/abis/Erc20.json';
import { parseUnitsString } from '@/utils/lendingUtils';
import type { LendingNetworkOption } from '@/types/lending';
import type { BorrowingNetworkOption } from '@/types/borrowing';

interface UseApproveTokenArgs {
  userAddress?: `0x${string}`;
  spenderAddress?: `0x${string}`;
  selectedNetwork: LendingNetworkOption | BorrowingNetworkOption | null;
  selectedMarketId?: string;
}

export function useApproveToken({
  userAddress,
  spenderAddress,
  selectedNetwork,
  selectedMarketId,
}: UseApproveTokenArgs) {
  const [isApproving, setIsApproving] = useState(false);
  const queryClient = useQueryClient();

  const resetApproving = () => {
    setIsApproving(false);
  };

  const approveToken = async (amount: string) => {
    try {
      if (!userAddress || !selectedNetwork || !spenderAddress) {
        throw new Error('Missing required parameters for approval');
      }

      const amt = (amount || '').replace(/,/g, '');
      const num = parseFloat(amt);
      if (!amt || Number.isNaN(num) || num <= 0) {
        throw new Error('Invalid amount for approval');
      }

      const decimals = selectedNetwork.decimals ?? 6;
      const value = parseUnitsString(amt, decimals);

      setIsApproving(true);

      const hash = await writeContract(config, {
        abi: Erc20Abi as any,
        address: selectedNetwork.address as `0x${string}`,
        chainId: selectedNetwork.chainId as any,
        functionName: 'approve',
        args: [spenderAddress, value],
      });

      await waitForTransactionReceipt(config, { hash });

      if (selectedMarketId) {
        await queryClient.invalidateQueries({
          queryKey: ['allowances', userAddress, spenderAddress, selectedMarketId],
        });
      }

      return { hash, success: true };
    } catch (error) {
      console.error('Approve failed:', error);
      throw error;
    } finally {
      setIsApproving(false);
    }
  };

  return {
    approveToken,
    isApproving,
    resetApproving,
  };
}
