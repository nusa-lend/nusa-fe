import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getConnectors, connect } from '@wagmi/core';
import { config } from '@/lib/wagmi';

export function useMiniAppAutoConnect() {
  const { address, status } = useAccount();

  useEffect(() => {
    const tryAutoConnect = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const isMiniApp = await sdk.isInMiniApp();
        if (!isMiniApp) return;

        if (status === 'disconnected' || !address) {
          const connectors = getConnectors(config);
          const farcasterConnector = connectors.find(
            c => c.name.toLowerCase().includes('farcaster') || c.id.toLowerCase().includes('farcaster')
          );
          if (farcasterConnector) {
            await connect(config, { connector: farcasterConnector });
          }
        }
      } catch {
        // ignore
      }
    };

    tryAutoConnect();
  }, [address, status]);
}
