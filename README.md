# NIMBUS - DropPilot Airdrop Automation

NIMBUS (DropPilot) is a "set it and forget it" dashboard that automatically farms crypto airdrops for you. You set the rules, and a smart robot (your Agent) goes out and performs the tasks—like bridging, swapping, and staking—to make your wallet eligible for future rewards.

## Features

- **Agent Wallet Creation**: Create separate PKP wallets for automated airdrop farming
- **Rules Engine**: Set "if-this-then-that" rules for automatic airdrop participation
- **24/7 Automation**: Lit Protocol-powered agents that work around the clock
- **Multi-Chain Support**: Farm airdrops across Ethereum, Polygon, Arbitrum, and more
- **Smart Monitoring**: Real-time tracking of airdrop opportunities and agent activity
- **Gas Optimization**: Intelligent transaction batching and fee management

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Wallet**: RainbowKit, Wagmi, MetaMask
- **Automation**: Lit Protocol (PKP + Lit Actions)
- **Blockchain**: Ethereum, Polygon, Arbitrum, Optimism, BSC
- **Components**: shadcn/ui, Radix UI
- **Data**: Airdrop APIs, Real-time monitoring

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Add your WalletConnect Project ID from https://cloud.walletconnect.com/

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── lib/              # Utilities
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Key Pages

- `/` - Homepage
- `/dashboard` - Agent Dashboard
- `/agent/create` - Create Agent Wallet
- `/rules` - Rules Engine
- `/activity` - Agent Activity Feed

## License

MIT
