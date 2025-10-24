# Nusa - Local Stablecoin Lending Hub

<div align="center">

![Nusa Logo](public/assets/logos/logo-dark.png)

**An innovative decentralized lending protocol designed to earn or borrow local stablecoin against world assets with competitive rates directly on Farcaster.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-purple?style=for-the-badge)](https://farcaster.xyz/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.18.0-orange?style=for-the-badge)](https://wagmi.sh/)

</div>

## 🚀 Overview

Nusa is a cutting-edge **Farcaster Mini App** that revolutionizes decentralized finance by focusing on **local stablecoin lending and borrowing**. Built for the Farcaster ecosystem, it provides users with seamless access to competitive lending rates and borrowing opportunities using Real World Assets (RWA) as collateral.

### ✨ Key Features

- 🏦 **Local Stablecoin Lending**: Earn competitive yields on local stablecoins (CADC, CNGN, KRWT, TRYB, MXNE, XSGD, ZARP, IDRX, EURC)
- 💎 **RWA Collateral Borrowing**: Borrow against Real World Assets like stocks, bonds, and commodities
- 🌐 **Cross-Chain Support**: Seamlessly operate across Base and Arbitrum networks
- 📱 **Farcaster Integration**: Native Mini App experience within the Farcaster ecosystem
- 🎨 **Modern UI/UX**: Beautiful, responsive interface with smooth animations
- 🔒 **Secure & Decentralized**: Built on proven DeFi protocols with smart contract security

## 🏗️ Architecture

### Tech Stack

| Category          | Technology     | Version         | Purpose                         |
| ----------------- | -------------- | --------------- | ------------------------------- | ---- |
| **Framework**     | Next.js        | 15.5.4          | React framework with App Router |
| **Language**      | TypeScript     | 5.0             | Type-safe JavaScript            |
| **Styling**       | Tailwind CSS   | 4.0             | Utility-first CSS framework     |
| **Blockchain**    | Wagmi + Viem   | 2.18.0 / 2.38.0 | Ethereum interaction library    |
| **Wallet**        | RainbowKit     | 2.2.8           | Wallet connection UI            |
| **Data Fetching** | TanStack Query | 5.90.2          | Server state management         |
| **Animations**    | Framer Motion  | 12.23.24        | Animation library               | GSAP |
| **Farcaster**     | Miniapp SDK    | 0.2.0           | Farcaster integration           |

### Supported Networks

- 🌐 **Base** (Chain ID: 8453) - Coinbase Layer 2
- ⚡ **Arbitrum** (Chain ID: 42161) - Ethereum Layer 2
- 🔗 **Ethereum** (Chain ID: 1) - Mainnet
- 🟡 **BNB Chain** (Chain ID: 56) - Binance Smart Chain
- 🟠 **Optimism** (Chain ID: 10) - Optimistic Rollup

### Supported Assets

#### 💰 Local Stablecoins

- **CADC** - Canadian Dollar Coin
- **CNGN** - Chinese Yuan
- **KRWT** - Korean Won
- **TRYB** - Turkish Lira
- **MXNE** - Mexican Peso
- **XSGD** - Singapore Dollar
- **ZARP** - South African Rand
- **IDRX** - Indonesian Rupiah
- **EURC** - Euro Coin

#### 🏢 Real World Assets (RWA)

- **bCOIN** - Bitcoin RWA Token
- **bCSPX** - S&P 500 RWA Token
- **bTSLA** - Tesla RWA Token
- **bGOOGL** - Google RWA Token
- **bNVDA** - NVIDIA RWA Token
- **bMSFT** - Microsoft RWA Token
- **bGME** - GameStop RWA Token
- **bIB01** - iShares Bond RWA Token
- **bIBTA** - iShares Treasury RWA Token
- **bHIGH** - High Yield RWA Token
- **bZPR1** - ZPR1 RWA Token

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/nusa-fe.git
   cd nusa-fe
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Configure the following variables in `.env.local`:

   ```env
   NEXT_PUBLIC_URL=your-app-url
   NEXT_PUBLIC_PROJECT_ID=your-walletconnect-project-id
   NEXT_PUBLIC_ACCOUNT_ASSOCIATION_HEADER=your-farcaster-header
   NEXT_PUBLIC_ACCOUNT_ASSOCIATION_PAYLOAD=your-farcaster-payload
   NEXT_PUBLIC_ACCOUNT_ASSOCIATION_SIGNATURE=your-farcaster-signature
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Users

1. **Connect Wallet**: Connect your wallet through the Farcaster Mini App interface
2. **Lend Assets**: Supply local stablecoins to earn competitive yields
3. **Borrow Assets**: Use RWA tokens as collateral to borrow local stablecoins
4. **Manage Portfolio**: Track your positions, health factors, and transaction history
5. **Cross-Chain Operations**: Seamlessly switch between Base and Arbitrum networks

### For Developers

The codebase is organized into clear modules:

```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/miniapp/       # Mini app specific components
│   └── providers/        # Context providers
├── constants/            # Application constants
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── services/            # API and blockchain services
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server

# Code Quality
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Code Structure

- **Components**: Modular, reusable UI components with TypeScript
- **Hooks**: Custom hooks for blockchain interactions and state management
- **Services**: Clean separation of API calls and blockchain interactions
- **Types**: Comprehensive TypeScript definitions for type safety
- **Utils**: Helper functions for formatting, calculations, and data processing

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Color Palette**: Professional blue and teal theme with semantic colors
- **Typography**: SF UI Text font family for modern, clean appearance
- **Animations**: Smooth transitions using Framer Motion and GSAP
- **Responsive Design**: Mobile-first approach optimized for Farcaster Mini Apps
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation

## 🔒 Security

- **Smart Contract Audits**: All contracts are audited for security
- **Wallet Integration**: Secure wallet connections through RainbowKit
- **Transaction Safety**: Comprehensive error handling and user confirmations
- **Data Privacy**: No sensitive user data stored on servers

### Manual Deployment

```bash
npm run build
npm run start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live App**: [Launch Nusa Mini App](https://farcaster.xyz/miniapps/CwB--wdey8nn/nusa)
- **Telegram**: [Nusa Telegram](https://t.me/NusaFinanceIndonesia/)
- **Twitter**: [@nusa_finance](https://x.com/nusa_finance)
- **Discord**: [Join our community](https://discord.ggZDJXXzhN8c)
