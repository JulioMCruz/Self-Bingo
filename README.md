# Self Bingo

A decentralized bingo game powered by Self Protocol verification on Celo blockchain. Play in your browser or as a Farcaster mini app.

## 🎮 Features

- **Self Protocol Integration**: Age verification (18+) using Self Protocol's zero-knowledge proofs with backend verification
- **Blockchain-Powered**: Built on Celo Sepolia testnet with native CELO payments (0.05 CELO entry fee)
- **Smart Contract**: Upgradeable game contracts with factory pattern for multiple rounds
- **Farcaster Native**: Works seamlessly as a Farcaster mini app with auto-wallet connection and environment detection
- **Multi-Platform**: Play in any browser or inside Farcaster with adaptive UI
- **Real-time Gameplay**: Live bingo card generation and Self Protocol verification with polling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**:
  - Wagmi v2 for wallet connections
  - Viem for blockchain interactions
  - Celo Sepolia testnet (Chain ID: 11142220)
  - Native CELO payments (0.05 CELO entry fee)
  - Upgradeable smart contracts (UUPS proxy pattern)
- **Smart Contracts** (Solidity 0.8.22):
  - BingoGameFactory: 0x024baF02baB39f783D2b86A6fEF9A6492bBC0250
  - Deployed on Celo Sepolia testnet
  - [View on Celoscan](https://sepolia.celoscan.io/address/0x024baF02baB39f783D2b86A6fEF9A6492bBC0250)
- **Self Protocol**:
  - @selfxyz/qrcode for QR code generation
  - @selfxyz/core for backend verification
  - Age verification (18+) with zero-knowledge proofs
  - Backend verification endpoint with caching
- **Farcaster**:
  - @farcaster/miniapp-sdk v0.2.1
  - @farcaster/miniapp-wagmi-connector v1.1.0
  - Environment detection and adaptive UI
- **State Management**: @tanstack/react-query
- **Wallet Support**:
  - Farcaster mini app connector (auto-connect)
  - Injected wallets (MetaMask, etc.)
  - WalletConnect v2

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Celo-compatible wallet (MetaMask recommended)
- Self Protocol mobile app (for age verification)
- Ngrok account (for local Self Protocol testing)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/Self-Bingo.git
cd Self-Bingo/SelfBingoApp
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your configuration:
\`\`\`bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_IMAGE_URL=http://localhost:3001/self-bingo-preview.png
NEXT_PUBLIC_SPLASH_IMAGE_URL=http://localhost:3001/self-bingo-splash.png

# Blockchain Configuration (Celo Sepolia Testnet)
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_RPC_URL=https://celo-sepolia-rpc.publicnode.com
NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=0x024baF02baB39f783D2b86A6fEF9A6492bBC0250
NEXT_PUBLIC_ENTRY_FEE_CELO=0.05
NEXT_PUBLIC_MIN_PLAYERS=2
NEXT_PUBLIC_MAX_PLAYERS=100

# Self Protocol Configuration
NEXT_PUBLIC_SELF_APP_NAME=Self Bingo
NEXT_PUBLIC_SELF_SCOPE=self-bingo
NEXT_PUBLIC_SELF_ENDPOINT=https://codalabs.ngrok.io/api/verify-self
NEXT_PUBLIC_SELF_USE_MOCK=false

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: OpenAI for AI-generated questions
OPENAI_API_KEY=your_openai_api_key
\`\`\`

4. Start ngrok tunnel (for Self Protocol verification):
\`\`\`bash
ngrok http 3001 --domain codalabs.ngrok.io
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" in the top-right corner
   - In Farcaster mini app: Auto-connects your Farcaster wallet
   - In browser: Choose your preferred wallet provider

2. **Age Verification**: Complete Self Protocol age verification (18+)
   - **In Browser**: Scan QR code with Self mobile app
   - **In Farcaster**: Click "Verify with Self" or copy deep link
   - Zero-knowledge proof ensures privacy
   - Verification stored in session cache
   - Polling mechanism automatically detects completion

3. **Join Game**: Click "Pay & Start Playing" after verification
   - Requires 0.05 CELO on Celo Sepolia testnet
   - Automatically creates game contract if none exists
   - Joins game with CELO payment transaction
   - Wallet automatically switches to Celo Sepolia if needed

4. **Get Your Card**: Receive a randomly generated 5×5 bingo card

5. **Verify Cells**: Use Self Protocol to verify bingo square answers
   - Each verification is recorded on-chain
   - Track your progress in real-time

6. **Win**: First to complete a row, column, or diagonal wins the prize pool!

## ✅ Recent Updates

### Self Protocol Integration (Completed)
- ✅ QR code verification with @selfxyz/qrcode
- ✅ Backend verification endpoint at \`/api/verify-self\`
- ✅ Age verification (18+) with zero-knowledge proofs
- ✅ Global verification cache for session persistence
- ✅ Inline verification flow on payment screen
- ✅ Polling mechanism for verification status updates

### Farcaster Mini App Support (Completed)
- ✅ Environment detection (browser vs Farcaster)
- ✅ Conditional QR code display (browser only)
- ✅ Deep link buttons for Farcaster environment
- ✅ Auto-wallet connection in Farcaster
- ✅ Copy link functionality with toast notifications

### Payment Flow Fixes (Completed)
- ✅ Fixed race condition in game creation
- ✅ \`ensureGameExists()\` now returns game address directly
- ✅ Proper state synchronization before payment
- ✅ Enhanced error handling and logging

### Ngrok Development Setup
For local Self Protocol testing, ngrok is configured:
\`\`\`bash
ngrok http 3001 --domain codalabs.ngrok.io
\`\`\`

Environment variable:
\`\`\`bash
NEXT_PUBLIC_SELF_ENDPOINT=https://codalabs.ngrok.io/api/verify-self
\`\`\`

## 🐛 Known Issues

- Build warnings during static generation (app works perfectly in production)
- TypeScript error in verify-self route (userIdentifier property) - does not affect functionality
- Optional dependency warnings (@react-native-async-storage, pino-pretty) - safe to ignore

## 🔗 Links

- **Live App**: [www.selfbingo.xyz](https://www.selfbingo.xyz)
- **Self Protocol**: [selfprotocol.com](https://selfprotocol.com)
- **Celo**: [celo.org](https://celo.org)
- **Farcaster**: [farcaster.xyz](https://farcaster.xyz)

## 📞 Support

For issues and questions, please open an issue on GitHub.
