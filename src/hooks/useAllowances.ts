import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { useQuery } from '@tanstack/react-query';
import type { LendingMarket } from '@/types/lending';
import { formatUnitsString } from '@/lib/utils/lendingUtils';
import Erc20Abi from '@/abis/Erc20.json';

type UseAllowancesArgs = {
  userAddress?: `0x${string}`;
  spenderAddress?: `0x${string}`;
  market: LendingMarket | null;
};

export type AllowancePerNetwork = Record<string, { formatted: string; value: string; decimals: number }>;

export function useAllowances({ userAddress, spenderAddress, market }: UseAllowancesArgs) {
  return useQuery({
    queryKey: ['allowances', userAddress, spenderAddress, market?.id],
    enabled: Boolean(userAddress && spenderAddress && market),
    queryFn: async () => {
      if (!userAddress || !spenderAddress || !market) return {} as AllowancePerNetwork;

      const results: AllowancePerNetwork = {};

      await Promise.all(
        market.networks.map(async nw => {
          try {
            const rawValue = (await readContract(config, {
              abi: Erc20Abi as any,
              address: nw.address as `0x${string}`,
              chainId: nw.chainId as any,
              functionName: 'allowance',
              args: [userAddress, spenderAddress],
            })) as unknown as { toString: () => string };

            const decimals = nw.decimals ?? 18;
            const valueStr = rawValue?.toString() ?? '0';
            const formatted = formatUnitsString(valueStr, decimals);
            results[nw.id] = { formatted, value: valueStr, decimals };
          } catch {
            results[nw.id] = { formatted: '0', value: '0', decimals: nw.decimals ?? 18 };
          }
        })
      );

      return results;
    },
  });
}

export function hasSufficientAllowance(
  allowances: AllowancePerNetwork | undefined,
  networkId: string,
  requiredAmount: string
): boolean {
  if (!allowances) return false;
  const entry = allowances[networkId];
  if (!entry) return false;
  const current = parseFloat(entry.formatted || '0');
  const required = parseFloat(requiredAmount || '0');
  return current >= required && required > 0;
}
