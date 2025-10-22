export function formatBalance(balance: string | undefined | null): string {
  if (!balance || balance === '0') return '0';

  const num = parseFloat(balance);
  if (Number.isNaN(num) || num === 0) return '0';

  try {
    return num.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
  } catch (error) {
    const parts = num.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] ? ',' + parts[1].substring(0, 2) : '';
    return integerPart + decimalPart;
  }
}
