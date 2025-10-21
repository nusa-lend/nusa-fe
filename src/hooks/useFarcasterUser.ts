import { useEffect, useState, useCallback } from 'react';

interface FarcasterUser {
  pfpUrl: string;
  username: string;
  displayName: string;
  fid: number;
}

export function useFarcasterUser() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { sdk } = await import('@farcaster/miniapp-sdk');
      const isInMiniApp = await sdk.isInMiniApp();

      if (isInMiniApp) {
        const context = await sdk.context;
        if (context.user) {
          setUser({
            pfpUrl: context.user.pfpUrl || '/placeholder/placeholder_profile.jpg',
            username: context.user.username || 'guest',
            displayName: context.user.displayName || 'Guest Name',
            fid: context.user.fid,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching Farcaster user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const handleWalletChange = () => {
      setTimeout(fetchUserData, 500);
    };

    const handleFocus = () => {
      setTimeout(handleWalletChange, 500);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(handleWalletChange, 500);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'wallet-change' || event.data?.type === 'account-change') {
        setTimeout(handleWalletChange, 500);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchUserData]);

  return {
    user,
    isLoading,
    error,
    hasUser: !!user,
    refreshUser: fetchUserData,
  };
}
