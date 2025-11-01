# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Self-Bingo** is a blockchain-based bingo game combining Self Protocol identity verification with Celo cryptocurrency integration. The app features a bold, brutalist design inspired by Celo's brand guidelines and mobile gaming patterns from Duolingo/Kahoot.

## Development Commands

### Working Directory
All commands must be run from the \`SelfBingoApp/\` directory:
\`\`\`bash
cd SelfBingoApp
\`\`\`

### Core Development
- \`npm run dev\` - Start Next.js development server (port 3001 by default)
- \`npm run build\` - Production build for Next.js
- \`npm run start\` - Run production server (requires build first)
- \`npm run lint\` - Run ESLint for code quality
- \`npm run check\` - TypeScript type checking without emit (use before commits)

### Local Development with Ngrok
For Self Protocol verification testing:
\`\`\`bash
ngrok http 3001 --domain codalabs.ngrok.io
\`\`\`

## Architecture Overview

### Framework: Next.js 14 with App Router

This project uses **Next.js 14 with App Router**, Tailwind CSS, and shadcn/ui components.

**Stack**:
- Next.js 14.2.23 (App Router)
- React 18.2 (Client Components - \`'use client'\` directive)
- Tailwind CSS 3.4 + shadcn/ui (Radix UI primitives)
- TypeScript 5.6 (strict mode)

**⚠️ Important**: Old Vite/Express artifacts in \`client/\`, \`server/\`, \`shared/\` directories are **deprecated** and excluded from TypeScript compilation. These will be removed. **Ignore these directories completely.**

### Directory Structure

\`\`\`
SelfBingoApp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (main game flow)
│   ├── globals.css        # Tailwind + Celo design tokens
│   ├── _components/       # Page-specific components
│   │   ├── Dashboard.tsx
│   │   ├── GameScreen.tsx
│   │   └── WinnerPage.tsx
│   └── api/               # API routes
│       ├── verify-self/   # Self Protocol verification
│       │   ├── route.ts   # Backend attestation verifier
│       │   └── check/route.ts # Polling endpoint
│       └── generate-questions/route.ts # AI question generation
├── components/            # Shared React components
│   ├── ui/               # shadcn/ui components (47+ Radix primitives)
│   ├── BingoCard.tsx
│   ├── PaymentScreen.tsx
│   ├── ResultScreen.tsx
│   ├── TopBar.tsx
│   ├── StatsGrid.tsx
│   ├── SelfVerificationModal.tsx
│   └── WinnerCelebration.tsx
├── contexts/             # React contexts
│   └── FarcasterContext.tsx # Farcaster authentication + detection
├── providers/            # Context providers
│   └── wagmi-provider.tsx # Wagmi + React Query setup
├── lib/                  # Utility functions
│   ├── contracts.ts     # ABIs, addresses, config
│   ├── utils.ts         # cn() classname merger, etc.
│   └── wagmi.ts         # Wagmi configuration
├── hooks/                # Custom React hooks
│   ├── useBingoGame.ts  # Contract interaction hook
│   └── use-toast.ts     # Toast notifications
├── attached_assets/      # Static assets (images, etc.)
├── public/
│   └── .well-known/
│       └── farcaster.json # Farcaster manifest
├── tailwind.config.ts    # Tailwind configuration
├── components.json       # shadcn/ui configuration
├── next.config.mjs       # Next.js configuration
└── tsconfig.json         # TypeScript configuration
\`\`\`

### Path Aliases
- \`@/*\` → Root \`SelfBingoApp/\` directory
- \`@/components/*\` → \`./components/*\`
- \`@/lib/*\` → \`./lib/*\`
- \`@/hooks/*\` → \`./hooks/*\`
- \`@assets/*\` → \`./attached_assets/*\` (static assets)

## Application Flow

### State Machine
Main game flow managed in [app/page.tsx](SelfBingoApp/app/page.tsx):
\`\`\`
dashboard → payment (inline verification) → game → result/winner
\`\`\`

All state is client-side (\`'use client'\`) using React \`useState\`:

1. **Dashboard**: Shows stats, "Join Game" CTA
2. **Payment**: Inline Self Protocol age verification (18+) + wallet connection
   - QR code display (browser only)
   - Deep link buttons (Farcaster environment)
   - Polling for verification status
   - Payment after verification
3. **Game**: 5×5 bingo grid with Self Protocol cell verification
4. **Result**: No win, continue playing
5. **Winner**: BINGO celebration, on-chain prize distribution

### Current Implementation Status

**Fully Implemented**:
- ✅ Complete UI/UX flow with Self Protocol verification
- ✅ Self Protocol backend verification endpoint (\`/api/verify-self\`)
- ✅ SelfBackendVerifier with age 18+ validation
- ✅ Global verification cache (in-memory Map)
- ✅ Polling mechanism for verification status (\`/api/verify-self/check\`)
- ✅ Farcaster environment detection
- ✅ Conditional QR code display (browser vs Farcaster)
- ✅ useBingoGame hook for contract interactions
- ✅ Smart contract deployment (BingoGameFactory + BingoGame)
- ✅ Native CELO payment integration (0.05 CELO)
- ✅ Game creation flow with proper state synchronization
- ✅ 5×5 Bingo card grid with square states
- ✅ Win detection logic (rows, columns, diagonals)
- ✅ Celo design system applied (colors, typography)
- ✅ shadcn/ui component library integrated

**Mock Data** (TODO - replace with real integrations):
- AI-generated bingo questions (currently hardcoded - need OpenAI integration)
- Participant count, prize pool, active games from backend API

## Self Protocol Integration

### Backend Verification Flow

1. **Frontend**: SelfAppBuilder generates QR code with \`/api/verify-self\` endpoint
2. **User**: Scans QR code with Self Protocol mobile app
3. **Self Protocol**: Sends attestation proof to backend endpoint
4. **Backend** (\`/api/verify-self/route.ts\`):
   - Receives attestation proof
   - Validates using SelfBackendVerifier
   - Checks minimum age (18+)
   - Extracts wallet address from userContextData
   - Stores verification in global cache
   - Returns success response
5. **Frontend**: Polls \`/api/verify-self/check?wallet=0x...\` every 2 seconds
6. **Verification Complete**: Payment button enabled

### Key Files

- [app/api/verify-self/route.ts](SelfBingoApp/app/api/verify-self/route.ts) - Backend attestation verifier
- [app/api/verify-self/check/route.ts](SelfBingoApp/app/api/verify-self/check/route.ts) - Polling endpoint
- [components/PaymentScreen.tsx](SelfBingoApp/components/PaymentScreen.tsx) - Inline verification UI
- [components/SelfVerificationModal.tsx](SelfBingoApp/components/SelfVerificationModal.tsx) - QR modal (legacy)

### Environment Variables

\`\`\`bash
NEXT_PUBLIC_SELF_APP_NAME=Self Bingo
NEXT_PUBLIC_SELF_SCOPE=self-bingo
NEXT_PUBLIC_SELF_ENDPOINT=https://codalabs.ngrok.io/api/verify-self
NEXT_PUBLIC_SELF_USE_MOCK=false
\`\`\`

## Farcaster Mini App Integration

### Environment Detection

Uses \`sdk.context\` with 100ms timeout to detect Farcaster environment:

\`\`\`typescript
const context = await Promise.race([
  sdk.context,
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
])
setIsFarcasterMiniApp(!!context)
\`\`\`

### Adaptive UI

- **Browser**: Shows QR code, "Verify with Self" button + "Copy Link" icon button
- **Farcaster**: Hides QR code, shows only deep link buttons

### Key Files

- [contexts/FarcasterContext.tsx](SelfBingoApp/contexts/FarcasterContext.tsx) - Authentication + detection
- [components/PaymentScreen.tsx](SelfBingoApp/components/PaymentScreen.tsx) - Conditional rendering

## Smart Contract Integration

### Deployed Contracts (Celo Sepolia Testnet)

- **BingoGameFactory (Proxy)**: \`0x024baF02baB39f783D2b86A6fEF9A6492bBC0250\`
- **BingoGameFactory (Implementation)**: \`0x78d2B5377c77A38E4A3Eb193aa417F865be62FC4\`
- **View on Celoscan**: https://sepolia.celoscan.io/address/0x024baF02baB39f783D2b86A6fEF9A6492bBC0250

### Contract Architecture

1. **BingoGameFactory.sol** - Factory pattern for game creation
   - Creates new BingoGame instances for each round
   - Manages treasury address and fee distribution
   - UUPS upgradeable proxy pattern

2. **BingoGame.sol** - Individual game contract
   - Handles player joins with native CELO payments
   - Tracks cell verifications on-chain
   - Calculates winners and distributes prizes
   - 5% treasury fee on prize pool

### Payment Flow

The payment flow has been fixed to properly handle game creation:

1. **handlePayment()** in page.tsx:
   - Calls \`ensureGameExists()\` to create game if needed
   - Receives game address directly (no state dependency)
   - Calls \`joinGame(gameAddress)\` with returned address
   - Avoids race condition from React state updates

2. **ensureGameExists()** in useBingoGame.ts:
   - Returns \`Promise<Address>\` for immediate use
   - Refetches current game from factory
   - Creates new game if none exists
   - Waits and refetches to get new game address
   - Throws error if creation fails

3. **joinGame(gameAddress?)** in useBingoGame.ts:
   - Accepts optional game address parameter
   - Falls back to \`currentGameAddress\` state if not provided
   - Sends CELO payment transaction to game contract

### Integration Files

- [lib/contracts.ts](SelfBingoApp/lib/contracts.ts) - Contract ABIs and addresses
- [hooks/useBingoGame.ts](SelfBingoApp/hooks/useBingoGame.ts) - React hook for contract interactions
- [app/page.tsx](SelfBingoApp/app/page.tsx) - Main game flow and payment handling

## Key Integration TODOs

1. **AI-generated bingo questions**
   - Current: Hardcoded 25 passport/identity questions
   - Need: OpenAI SDK integration for dynamic generation
   - Endpoint exists at \`/api/generate-questions\` but not configured

2. **Backend API for dashboard stats**
   - Current: Mock data (participantCount, prizePool, activeGames, totalWinners)
   - Need: Real-time stats from blockchain or backend database

3. **Win detection validation**
   - Current: Client-side check (rows/columns/diagonals)
   - Need: Server-side validation via smart contract to prevent cheating

## Design System (Strictly Enforced)

See [design_guidelines.md](SelfBingoApp/design_guidelines.md) for complete specifications.

### Critical Design Rules
1. **No rounded corners** - Use square/sharp edges (brutalist aesthetic)
2. **Hard color inversions** - Instant state changes, no smooth transitions
3. **Celo brand colors** - Yellow \`#FCFF52\`, Forest Green \`#4E632A\`, Purple \`#1A0329\`
4. **Typography** - GT Alpina (250) for headlines, Inter (250/750) for UI
5. **Mobile-first** - Minimum tap targets: 56px height, thumb-friendly zones

### CSS Variables (app/globals.css)
All design tokens defined as HSL CSS variables:
- \`--primary\`: Celo Yellow #FCFF52
- \`--secondary\`: Forest Green #4E632A
- \`--destructive\`: Error Red #E70532
- \`--background\`: Lt Tan #FBF6F1
- \`--card\`: Dk Tan #E6E3D5
- \`--foreground\`: Black #000000

### Bingo Square States
\`\`\`typescript
type BingoSquareState = 'default' | 'selected' | 'verifying' | 'verified' | 'failed';
\`\`\`

Color mapping:
- \`default\` → White background
- \`selected\` → Yellow \`#FCFF52\`
- \`verifying\` → Purple \`#1A0329\` with loading
- \`verified\` → Forest Green \`#4E632A\`
- \`failed\` → Error red \`#E70532\`

## Dependencies

### UI Framework
- \`next\` 14.2.23 - React framework with App Router
- \`react\` 18.2.0 - UI library
- \`tailwindcss\` 3.4.17 - Utility-first CSS
- Full **Radix UI** component library (accordion, dialog, dropdown, etc.)
- \`class-variance-authority\`, \`clsx\`, \`tailwind-merge\` - Component styling
- \`lucide-react\` - Icon system
- \`framer-motion\` - Animations (use sparingly per design guidelines)

### Forms & Validation
- \`react-hook-form\` - Form handling
- \`@hookform/resolvers\` - Form validation
- \`zod\` - Schema validation

### Utilities
- \`date-fns\` - Date manipulation
- \`recharts\` - Data visualization
- \`embla-carousel-react\` - Carousel component
- \`react-day-picker\` - Date picker
- \`cmdk\` - Command menu
- \`vaul\` - Drawer component
- \`input-otp\` - OTP input

### Self Protocol Integration
- \`@selfxyz/qrcode\` - QR code generation and universal link support
- \`@selfxyz/core\` - Backend verification with SelfBackendVerifier

### Blockchain Libraries
- \`wagmi\` v2 - React hooks for Ethereum/Celo
- \`viem\` - Low-level Ethereum operations
- Connected to Celo Sepolia (Chain ID: 11142220)

### Farcaster
- \`@farcaster/miniapp-sdk\` v0.2.1 - Environment detection, context
- \`@farcaster/miniapp-wagmi-connector\` v1.1.0 - Wallet connection

### To Be Added
- OpenAI SDK - AI question generation (dependency may exist but not configured)

## Common Development Patterns

### Adding Next.js Pages
1. Create file in \`app/\` directory (e.g., \`app/about/page.tsx\`)
2. Export default function component
3. Use \`'use client'\` directive if using hooks/state
4. Next.js handles routing automatically

### Adding Components
1. Create in \`components/\` for shared components
2. Create in \`app/_components/\` for page-specific components
3. Follow existing patterns: props interface, TypeScript, Tailwind classes

### Adding shadcn/ui Components
\`\`\`bash
npx shadcn@latest add [component-name]
\`\`\`
Components install to \`components/ui/\` with proper configuration from \`components.json\`.

### Styling Guidelines
1. Use Tailwind utility classes (design tokens in \`globals.css\`)
2. Reference \`design_guidelines.md\` for exact color values
3. Hard-edged components: **no \`rounded-*\` classes**
4. Use CSS variables: \`bg-primary\`, \`text-foreground\`, \`border-card-border\`
5. State changes: Instant color flips, no transitions

### TypeScript Patterns
- Strict mode enabled
- Always define props interfaces
- Use \`type\` for unions, \`interface\` for objects
- Leverage Next.js types: \`Metadata\`, \`Route\`, etc.

## Known Issues

- TypeScript error in \`verify-self/route.ts\` (Property 'userIdentifier' does not exist) - Safe to ignore, does not affect functionality
- Optional dependency warnings (@react-native-async-storage, pino-pretty) - Safe to ignore
- Build warnings during static generation - App works correctly in production

## Migration Notes

**From Vite/Express to Next.js**:
- ✅ All client components migrated to \`components/\` and \`app/\`
- ✅ Page components in \`app/_components/\`
- ✅ Main game flow in \`app/page.tsx\`
- ✅ Global styles in \`app/globals.css\`
- ✅ Tailwind configuration updated
- ✅ package.json cleaned (removed Vite, Express, Wouter, etc.)
- ✅ Self Protocol backend verification implemented
- ✅ Farcaster Mini App support added
- ✅ Payment flow race condition fixed
- ❌ Old \`client/\`, \`server/\`, \`shared/\` directories - **ignore, will be deleted**
- ❌ Database integration not migrated (was Drizzle + Neon PostgreSQL)
