import React from 'react';
import ReactQueryProvider from './ReactQueryProvider';
import RainbowKitProviders from './RainbowKitProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <RainbowKitProviders>
        {children}
      </RainbowKitProviders>
    </ReactQueryProvider>
  );
}
