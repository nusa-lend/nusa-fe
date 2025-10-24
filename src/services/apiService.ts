import { toLowerHex } from '@/utils/calculationUtils';
import { NETWORKS } from '@/constants/networkConstants';

export const normalizeChainId = (value?: string | null) => {
  if (!value) return undefined;
  if (/^\d+$/.test(value)) return value;
  const network = NETWORKS.find(net => net.id === value);
  if (network?.chainId !== undefined) {
    return String(network.chainId);
  }
  return value;
};

export const parseLimit = (value?: string | null) => {
  if (!value) return 100;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 100;
  return Math.min(parsed, 500);
};

export const buildHistoryQuery = () => `
  query PositionHistory(
    $loanWhere: positionLoansFilter,
    $supplyWhere: positionSupplyEventsFilter,
    $limit: Int
  ) {
    positionLoanss(
      where: $loanWhere
      orderBy: "startTimestamp"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        id
        positionId
        chainId
        account
        borrowTokenId
        borrowAmount
        borrowUsdRay
        borrowAprRay
        borrowApyRay
        collateralUsdRay
        debtUsdRay
        startTimestamp
        endTimestamp
        startBlock
        endBlock
        startTxHash
        endTxHash
        status
        repaidAmount
        repaidUsdRay
        updatedAt
      }
    }
    positionSupplyEventss(
      where: $supplyWhere
      orderBy: "blockTimestamp"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        id
        positionId
        chainId
        account
        marketId
        tokenId
        entryType
        action
        amount
        usdValueRay
        blockNumber
        blockTimestamp
        txHash
        logIndex
        createdAt
      }
    }
  }
`;

export const fetchMarketRates = async (marketIds: string[]) => {
  if (marketIds.length === 0) return new Map();

  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const graphUrl = new URL('/graphql', ponderBaseUrl);

  const marketsQuery = `
    query Markets($ids: [String!], $limit: Int) {
      marketss(where: { id_in: $ids }, limit: $limit) {
        items {
          id
          supplyRateRay
          borrowRateRay
        }
      }
    }
  `;

  const marketsBody = JSON.stringify({
    query: marketsQuery,
    variables: {
      ids: marketIds,
      limit: marketIds.length,
    },
  });

  try {
    const marketsResponse = await fetch(graphUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: marketsBody,
      cache: 'no-store',
    });

    if (!marketsResponse.ok) {
      console.warn(`Failed to fetch market rates: ${marketsResponse.status}`);
      return new Map();
    }

    const marketsPayload = (await marketsResponse.json()) as {
      data?: {
        marketss?: {
          items: Array<{
            id: string;
            supplyRateRay: string;
            borrowRateRay: string;
          }>;
        };
      };
    };

    const marketRates = new Map();
    const items = marketsPayload.data?.marketss?.items ?? [];
    for (const market of items) {
      marketRates.set(market.id, {
        supplyRateRay: market.supplyRateRay,
        borrowRateRay: market.borrowRateRay,
      });
    }
    return marketRates;
  } catch (error) {
    console.warn('Failed to fetch market rates for history payload', error);
    return new Map();
  }
};

export const fetchHistoryData = async (account: string, chain?: string, limit?: number) => {
  const ponderBaseUrl = process.env.PONDER_API_URL ?? 'http://localhost:42069';
  const graphUrl = new URL('/graphql', ponderBaseUrl);

  const loanWhere: Record<string, string> = {
    account: toLowerHex(account),
  };
  const supplyWhere: Record<string, string> = {
    account: toLowerHex(account),
  };

  const normalizedChain = normalizeChainId(chain);
  if (normalizedChain) {
    loanWhere.chainId = normalizedChain;
    supplyWhere.chainId = normalizedChain;
  }

  const queryLimit = limit || parseLimit();
  const query = buildHistoryQuery();

  const body = JSON.stringify({
    query,
    variables: {
      loanWhere,
      supplyWhere,
      limit: queryLimit,
    },
  });

  let response: Response;
  try {
    response = await fetch(graphUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    });
  } catch (error) {
    throw new Error(`Failed to reach indexer: ${(error as Error).message}`);
  }

  if (!response.ok) {
    throw new Error(`Indexer responded with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: {
      positionLoanss?: {
        items: any[];
      };
      positionSupplyEventss?: {
        items: any[];
      };
    };
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    const message =
      payload.errors
        .map(err => err?.message)
        .filter(Boolean)
        .join('; ') || 'Unknown GraphQL error';
    throw new Error(`Indexer GraphQL error: ${message}`);
  }

  const loanItems = payload.data?.positionLoanss?.items ?? [];
  const supplyItems = payload.data?.positionSupplyEventss?.items ?? [];

  // Fetch market rates for supply events
  const marketIds = Array.from(new Set(supplyItems.map(event => event.marketId))).filter(
    id => typeof id === 'string' && id.length > 0
  );
  const marketRates = await fetchMarketRates(marketIds);

  return {
    loanItems,
    supplyItems,
    marketRates,
  };
};
