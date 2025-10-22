import { createConfig, http } from 'wagmi';
import { APP_NAME } from '@/constants/appConstants';
import { arbitrum, optimism, bsc, mainnet } from 'wagmi/chains';
import { base as _base } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { rainbowWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

const base = Object.assign({
  logoUrl: '/assets/network/base.png',
  publicRpcUrl: "https://base-mainnet.g.alchemy.com/v2/ykdyr03ZsbnYbsmPUib1gRhHrtDENnrA"
}, _base);

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
    [base.id]: http(base.publicRpcUrl),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [miniAppConnector(), ...connectors],
});
