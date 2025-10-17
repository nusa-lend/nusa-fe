import { createConfig, http } from 'wagmi';
import { APP_NAME } from '@/constants/app';
import { base } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { rainbowWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  {
    appName: APP_NAME,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  }
);

export const config = createConfig({
  chains: [base],
  ssr: false,
  transports: {
    [base.id]: http(),
  },
  connectors: [miniAppConnector(), ...connectors],
});
