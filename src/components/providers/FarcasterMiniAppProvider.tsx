"use client";

import { useEffect } from 'react';
import { useHybridDetection } from '@/hooks/useHybridDetection';

export default function FarcasterMiniAppProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isLoading } = useHybridDetection();

  useEffect(() => {
    if (isLoading) return;

    const initializeMiniApp = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const isMiniApp = await sdk.isInMiniApp();

        if (isMiniApp) {
          await sdk.actions.ready();
          console.log('Mini App ready - splash screen hidden');
        }
      } catch (error) {
        console.error('Error initializing Mini App:', error);
      }
    };

    initializeMiniApp();
  }, [isLoading]);

  return <>{children}</>;
}
