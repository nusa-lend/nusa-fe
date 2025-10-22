export const fetchBorrowingMarketsFromPositionsAPI = async (account: string, chain?: string) => {
  try {
    const { fetchBorrowingMarketsFromPositions } = await import('./borrowPositionService');
    return await fetchBorrowingMarketsFromPositions(account, chain);
  } catch (error) {
    console.error('Error fetching borrowing markets from positions:', error);
    return [];
  }
};
