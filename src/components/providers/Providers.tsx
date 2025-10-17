import React from 'react';
import ReactQueryProvider from './ReactQueryProvider';
import RainbowKitProviders from './RainbowKitProvider';
import FarcasterMiniAppProvider from './FarcasterMiniAppProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <RainbowKitProviders>
        <FarcasterMiniAppProvider>{children}</FarcasterMiniAppProvider>
      </RainbowKitProviders>
    </ReactQueryProvider>
  );
}
