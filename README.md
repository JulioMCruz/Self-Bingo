# Self Bingo

A decentralized bingo game powered by Self Protocol verification on Celo blockchain. Play in your browser or as a Farcaster mini app.

## 🎮 Features

- **Self Protocol Integration**: Verify your identity using Self Protocol's decentralized verification
- **Blockchain-Powered**: Built on Celo mainnet with USDC payments (0.01 USDC entry fee)
- **Farcaster Native**: Works seamlessly as a Farcaster mini app with auto-wallet connection
- **Multi-Platform**: Play in any browser or inside Farcaster
- **Real-time Gameplay**: Live bingo card generation and verification

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**:
  - Wagmi v2 for wallet connections
  - Viem for blockchain interactions
  - Celo mainnet (Chain ID: 42220)
  - USDC token (0xcebA9300f2b948710d2653dD7B07f33A8B32118C)
- **Farcaster**:
  - @farcaster/miniapp-sdk v0.2.1
  - @farcaster/miniapp-wagmi-connector v1.1.0
- **State Management**: @tanstack/react-query
- **Wallet Support**:
  - Farcaster mini app connector (auto-connect)
  - Injected wallets (MetaMask, etc.)
  - WalletConnect v2

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Celo-compatible wallet (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Self-Bingo.git
cd Self-Bingo/SelfBingoApp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_IMAGE_URL=http://localhost:3000/self-bingo-preview.png
NEXT_PUBLIC_SPLASH_IMAGE_URL=http://localhost:3000/self-bingo-splash.png

# Blockchain Configuration (Celo Mainnet)
NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_USDC_ENTRY_FEE=0.01
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0xcebA9300f2b948710d2653dD7B07f33A8B32118C

# Self Protocol API
NEXT_PUBLIC_SELF_API_URL=https://api.selfprotocol.com

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: OpenAI for future features
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" in the top-right corner
   - In Farcaster mini app: Auto-connects your Farcaster wallet
   - In browser: Choose your preferred wallet provider

2. **Join Game**: Click "Join Game - 0.01 USDC" to enter
   - Requires 0.01 USDC on Celo mainnet
   - Wallet automatically switches to Celo network if needed

3. **Get Your Card**: Receive a randomly generated bingo card

4. **Play**: Mark off numbers as they're called

5. **Win**: First to complete a line wins the prize pool!

## 📁 Project Structure

```
SelfBingoApp/
├── app/                          # Next.js App Router
│   ├── _components/              # Page-specific components
│   │   ├── Dashboard.tsx         # Main game dashboard
│   │   └── TopBar.tsx           # Top navigation bar
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home page
├── components/                   # Shared UI components
│   ├── ui/                      # shadcn/ui components
│   ├── BingoCard.tsx            # Bingo card display
│   ├── ConnectMenu.tsx          # Wallet connection UI
│   └── SdkInitializer.tsx       # Farcaster SDK init
├── contexts/                     # React contexts
│   └── FarcasterContext.tsx     # Farcaster user state
├── hooks/                        # Custom React hooks
│   └── use-toast.ts             # Toast notifications
├── lib/                          # Utility functions
│   ├── utils.ts                 # Helper functions
│   └── wagmi.ts                 # Wagmi configuration
├── providers/                    # Provider wrappers
│   └── wagmi-provider.tsx       # Wagmi + React Query
└── public/
    └── .well-known/
        └── farcaster.json       # Farcaster manifest
```

## 🔧 Configuration Files

### Farcaster Mini App Manifest

The app includes a Farcaster manifest at `public/.well-known/farcaster.json`:

```json
{
  "frame": {
    "name": "Self Bingo",
    "version": "1",
    "iconUrl": "https://www.selfbingo.xyz/self-bingo-icon.png",
    "homeUrl": "https://www.selfbingo.xyz",
    "imageUrl": "https://www.selfbingo.xyz/self-bingo-preview.png",
    "buttonTitle": "Play Self Bingo",
    "splashImageUrl": "https://www.selfbingo.xyz/self-bingo-splash.png",
    "splashBackgroundColor": "#FCFF52"
  }
}
```

### Wagmi Configuration

Supports multiple chains for development and production:
- **Primary**: Celo Mainnet (42220)
- **Development**: Celo Alfajores Testnet
- **Additional**: Base, Base Sepolia, Ethereum Mainnet

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important**: The app uses standard Next.js output mode (not standalone) for Vercel compatibility.

### Production URL

Live at: [https://www.selfbingo.xyz](https://www.selfbingo.xyz)

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check` - TypeScript type checking

### Key Features

**Farcaster Detection**: Automatically detects if running as Farcaster mini app or browser app

**Auto-Wallet Connection**: In Farcaster environment, automatically connects user's wallet

**Network Switching**: Automatically switches to Celo mainnet if user is on wrong network

**Responsive Design**: Works on mobile and desktop

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Your site URL | Yes |
| `NEXT_PUBLIC_CHAIN_ID` | Celo chain ID (42220) | Yes |
| `NEXT_PUBLIC_USDC_ENTRY_FEE` | Entry fee in USDC | Yes |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | USDC contract on Celo | Yes |
| `NEXT_PUBLIC_SELF_API_URL` | Self Protocol API endpoint | Yes |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Yes |
| `OPENAI_API_KEY` | OpenAI API key (optional) | No |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live App**: [www.selfbingo.xyz](https://www.selfbingo.xyz)
- **Self Protocol**: [selfprotocol.com](https://selfprotocol.com)
- **Celo**: [celo.org](https://celo.org)
- **Farcaster**: [farcaster.xyz](https://farcaster.xyz)

## 🐛 Known Issues

- Build warnings during static generation (app works perfectly in production)
- Farcaster account association requires manual configuration

## 📞 Support

For issues and questions, please open an issue on GitHub.
