import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const fetchUserData = async () => {
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
    };

    fetchUserData();
  }, []);

  return {
    user,
    isLoading,
    error,
    hasUser: !!user,
  };
}
