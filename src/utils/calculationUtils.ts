const RAY = 10n ** 27n;
const SECONDS_IN_YEAR = 31_536_000n;

const calculationCache = new Map<string, number>();

export const rayToNumber = (ray: bigint) => Number(ray) / Number(RAY);

export const toLowerHex = (value: string) => {
  try {
    return value.startsWith('0x') ? value.toLowerCase() : value;
  } catch {
    return value;
  }
};

export const formatPercent = (ray: string) => {
  try {
    if (calculationCache.has(`percent_${ray}`)) {
      return calculationCache.get(`percent_${ray}`)!.toFixed(2);
    }

    const percent = rayToNumber(BigInt(ray)) * 100;
    calculationCache.set(`percent_${ray}`, percent);
    return percent.toFixed(2);
  } catch {
    return '0.00';
  }
};

export const toUsd = (valueRay: string) => {
  try {
    if (calculationCache.has(`usd_${valueRay}`)) {
      return calculationCache.get(`usd_${valueRay}`)!;
    }

    const result = rayToNumber(BigInt(valueRay));
    calculationCache.set(`usd_${valueRay}`, result);
    return result;
  } catch {
    return 0;
  }
};

export const computeDurationSeconds = (start: string, end?: string | null) => {
  try {
    const startSec = BigInt(start);
    const endSec = end ? BigInt(end) : startSec;
    const diff = endSec > startSec ? endSec - startSec : 0n;
    return Number(diff);
  } catch {
    return 0;
  }
};

export const computeInterestUsd = (loan: {
  borrowUsdRay: string;
  borrowAprRay: string;
  startTimestamp: string;
  endTimestamp?: string | null;
}) => {
  try {
    const cacheKey = `interest_${loan.borrowUsdRay}_${loan.borrowAprRay}_${loan.startTimestamp}_${loan.endTimestamp || 'null'}`;

    if (calculationCache.has(cacheKey)) {
      return calculationCache.get(cacheKey)!;
    }

    const principal = BigInt(loan.borrowUsdRay);
    const apr = BigInt(loan.borrowAprRay);
    const start = BigInt(loan.startTimestamp);
    const end = loan.endTimestamp ? BigInt(loan.endTimestamp) : start;
    const duration = end > start ? end - start : 0n;
    const interestRay = (principal * apr * duration) / (RAY * SECONDS_IN_YEAR);
    const result = rayToNumber(interestRay);

    calculationCache.set(cacheKey, result);
    return result;
  } catch {
    return 0;
  }
};

export const rayToPercentString = (value: string) => {
  try {
    if (calculationCache.has(`percent_${value}`)) {
      return calculationCache.get(`percent_${value}`)!.toString() + '%';
    }

    const ray = BigInt(value);
    const hundredthPercents = (ray * 10000n) / RAY;
    const integerPart = hundredthPercents / 100n;
    const fractionalPart = Number(hundredthPercents % 100n);
    const result = `${integerPart.toString()}.${fractionalPart.toString().padStart(2, '0')}%`;

    calculationCache.set(`percent_${value}`, parseFloat(result));
    return result;
  } catch {
    return '0.00%';
  }
};

export const bpsToPercent = (bps?: number | null) => {
  if (typeof bps !== 'number') return null;
  return `${(bps / 100).toFixed(2)}%`;
};

export const clearCalculationCache = () => {
  calculationCache.clear();
};
