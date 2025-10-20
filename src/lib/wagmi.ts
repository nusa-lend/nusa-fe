import { createConfig, http } from 'wagmi';
import { APP_NAME } from '@/constants/appConstants';
import { base, arbitrum, optimism, bsc, mainnet } from 'wagmi/chains';
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
  chains: [base, arbitrum, optimism, bsc, mainnet],
  ssr: false,
  transports: {
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [miniAppConnector(), ...connectors],
});
