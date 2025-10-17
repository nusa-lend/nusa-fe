import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useHybridDetection() {
  const [urlBasedMiniApp, setUrlBasedMiniApp] = useState<boolean | null>(null);
  const [sdkBasedMiniApp, setSdkBasedMiniApp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();

  let searchParams: URLSearchParams | null = null;
  try {
    searchParams = useSearchParams();
  } catch (error) {
    console.warn('useSearchParams not available during SSR:', error);
  }

  useEffect(() => {
    const detectMiniApp = async () => {
      try {
        const isMiniAppPath = pathname?.startsWith('/miniapp');
        const isMiniAppQuery = searchParams?.get('miniApp') === 'true';
        const urlBased = isMiniAppPath || isMiniAppQuery;

        setUrlBasedMiniApp(urlBased);

        try {
          const { sdk } = await import('@farcaster/miniapp-sdk');
          const actuallyInMiniApp = await sdk.isInMiniApp();
          setSdkBasedMiniApp(actuallyInMiniApp);
        } catch (sdkError) {
          console.error('Error checking Mini App environment:', sdkError);
          setError(sdkError instanceof Error ? sdkError.message : 'Unknown error');
          setSdkBasedMiniApp(false);
        }
      } catch (err) {
        console.error('Error in hybrid detection:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUrlBasedMiniApp(false);
        setSdkBasedMiniApp(false);
      } finally {
        setIsLoading(false);
      }
    };

    detectMiniApp();
  }, [pathname, searchParams]);

  return {
    isMiniApp: urlBasedMiniApp,
    isLoading,
    isWebApp: !isLoading && !urlBasedMiniApp,

    actuallyInMiniApp: sdkBasedMiniApp,
    isVerifiedMiniApp: !isLoading && urlBasedMiniApp && sdkBasedMiniApp === true,

    error,
    isReady: !isLoading && urlBasedMiniApp !== null,
    isNotMiniApp: !isLoading && urlBasedMiniApp === false,
  };
}
