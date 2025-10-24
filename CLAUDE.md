# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Self-Bingo** is a blockchain-based bingo game combining Self Protocol identity verification with Celo cryptocurrency integration. The app features a bold, brutalist design inspired by Celo's brand guidelines and mobile gaming patterns from Duolingo/Kahoot.

## Development Commands

### Working Directory
All commands must be run from the `SelfBingoApp/` directory:
```bash
cd SelfBingoApp
```

### Core Development
- `npm run dev` - Start Next.js development server (port 3000 by default)
- `npm run build` - Production build for Next.js
- `npm run start` - Run production server (requires build first)
- `npm run lint` - Run ESLint for code quality
- `npm run check` - TypeScript type checking without emit (use before commits)

## Architecture Overview

### Framework: Next.js 14 with App Router

This project uses **Next.js 14 with App Router**, Tailwind CSS, and shadcn/ui components.

**Stack**:
- Next.js 14.2.23 (App Router)
- React 18.2 (Client Components - `'use client'` directive)
- Tailwind CSS 3.4 + shadcn/ui (Radix UI primitives)
- TypeScript 5.6 (strict mode)

**⚠️ Important**: Old Vite/Express artifacts in `client/`, `server/`, `shared/` directories are **deprecated** and excluded from TypeScript compilation. These will be removed. **Ignore these directories completely.**

### Directory Structure

```
SelfBingoApp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (main game flow)
│   ├── globals.css        # Tailwind + Celo design tokens
│   ├── _components/       # Page-specific components
│   │   ├── Dashboard.tsx
│   │   ├── GameScreen.tsx
│   │   └── WinnerPage.tsx
│   └── api/               # API routes (currently unused)
├── components/            # Shared React components
│   ├── ui/               # shadcn/ui components (47+ Radix primitives)
│   ├── BingoCard.tsx
│   ├── PaymentScreen.tsx
│   ├── ResultScreen.tsx
│   ├── TopBar.tsx
│   ├── StatsGrid.tsx
│   ├── VerificationModal.tsx
│   └── WinnerCelebration.tsx
├── lib/                  # Utility functions
│   └── utils.ts         # cn() classname merger, etc.
├── hooks/                # Custom React hooks
├── attached_assets/      # Static assets (images, etc.)
├── tailwind.config.ts    # Tailwind configuration
├── components.json       # shadcn/ui configuration
├── next.config.mjs       # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

### Path Aliases
- `@/*` → Root `SelfBingoApp/` directory
- `@/components/*` → `./components/*`
- `@/lib/*` → `./lib/*`
- `@/hooks/*` → `./hooks/*`
- `@assets/*` → `./attached_assets/*` (static assets)

## Application Flow

### State Machine
Main game flow managed in [app/page.tsx](SelfBingoApp/app/page.tsx):
```
dashboard → payment → game → result/winner
```

All state is client-side (`'use client'`) using React `useState`:

1. **Dashboard**: Shows stats, "Join Game" CTA
2. **Payment**: Wallet connection + 1 CELO entry fee (mocked)
3. **Game**: 5×5 bingo grid with Self Protocol verification (simulated)
4. **Result**: No win, continue playing
5. **Winner**: BINGO celebration, prize distribution

### Current Implementation Status

**Implemented**:
- ✅ Complete UI/UX flow with state machine
- ✅ 5×5 Bingo card grid with square states
- ✅ Win detection logic (rows, columns, diagonals)
- ✅ Celo design system applied (colors, typography)
- ✅ shadcn/ui component library integrated

**Mock Data** (TODO - replace with real integrations):
- Participant count, prize pool, active games, winners
- AI-generated bingo questions (currently hardcoded)
- Self Protocol verification (setTimeout simulation)
- Celo wallet connection and payments

## Design System (Strictly Enforced)

See [design_guidelines.md](SelfBingoApp/design_guidelines.md) for complete specifications.

### Critical Design Rules
1. **No rounded corners** - Use square/sharp edges (brutalist aesthetic)
2. **Hard color inversions** - Instant state changes, no smooth transitions
3. **Celo brand colors** - Yellow `#FCFF52`, Forest Green `#4E632A`, Purple `#1A0329`
4. **Typography** - GT Alpina (250) for headlines, Inter (250/750) for UI
5. **Mobile-first** - Minimum tap targets: 56px height, thumb-friendly zones

### CSS Variables (app/globals.css)
All design tokens defined as HSL CSS variables:
- `--primary`: Celo Yellow #FCFF52
- `--secondary`: Forest Green #4E632A
- `--destructive`: Error Red #E70532
- `--background`: Lt Tan #FBF6F1
- `--card`: Dk Tan #E6E3D5
- `--foreground`: Black #000000

### Bingo Square States
```typescript
type BingoSquareState = 'default' | 'selected' | 'verifying' | 'verified' | 'failed';
```

Color mapping:
- `default` → White background
- `selected` → Yellow `#FCFF52`
- `verifying` → Purple `#1A0329` with loading
- `verified` → Forest Green `#4E632A`
- `failed` → Error red `#E70532`

## Key Integration TODOs

These TODO comments in [app/page.tsx](SelfBingoApp/app/page.tsx) indicate critical missing integrations:

1. **Replace mock data with real API** (lines 16-21)
   - Backend API routes needed for participantCount, prizePool, activeGames, totalWinners, roundNumber

2. **AI-generated bingo questions** (line 23)
   - Current: Hardcoded 25 passport/identity questions
   - Need: Dynamic generation (OpenAI SDK not yet configured)

3. **Real Self Protocol verification** (lines 67-84)
   - Current: setTimeout simulation
   - Need: Self Protocol SDK integration, QR code modal, verify response

4. **Win detection** (lines 86-114)
   - Current: Client-side check (rows/columns/diagonals)
   - Need: Server-side validation to prevent cheating

5. **Celo blockchain integration**
   - Wallet connection SDK
   - Entry fee payment (1 CELO)
   - Prize pool smart contract
   - Winner prize distribution

## Dependencies

### UI Framework
- `next` 14.2.23 - React framework with App Router
- `react` 18.2.0 - UI library
- `tailwindcss` 3.4.17 - Utility-first CSS
- Full **Radix UI** component library (accordion, dialog, dropdown, etc.)
- `class-variance-authority`, `clsx`, `tailwind-merge` - Component styling
- `lucide-react` - Icon system
- `framer-motion` - Animations (use sparingly per design guidelines)

### Forms & Validation
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation

### Utilities
- `date-fns` - Date manipulation
- `recharts` - Data visualization
- `embla-carousel-react` - Carousel component
- `react-day-picker` - Date picker
- `cmdk` - Command menu
- `vaul` - Drawer component
- `input-otp` - OTP input

### To Be Added
- Celo SDK - Blockchain integration
- Self Protocol SDK - Identity verification
- OpenAI SDK - AI question generation (dependency exists but not configured)

## Common Development Patterns

### Adding Next.js Pages
1. Create file in `app/` directory (e.g., `app/about/page.tsx`)
2. Export default function component
3. Use `'use client'` directive if using hooks/state
4. Next.js handles routing automatically

### Adding Components
1. Create in `components/` for shared components
2. Create in `app/_components/` for page-specific components
3. Follow existing patterns: props interface, TypeScript, Tailwind classes

### Adding shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```
Components install to `components/ui/` with proper configuration from `components.json`.

### Styling Guidelines
1. Use Tailwind utility classes (design tokens in `globals.css`)
2. Reference `design_guidelines.md` for exact color values
3. Hard-edged components: **no `rounded-*` classes**
4. Use CSS variables: `bg-primary`, `text-foreground`, `border-card-border`
5. State changes: Instant color flips, no transitions

### TypeScript Patterns
- Strict mode enabled
- Always define props interfaces
- Use `type` for unions, `interface` for objects
- Leverage Next.js types: `Metadata`, `Route`, etc.

## Deployment

### Replit Configuration
Current `.replit` file configured for old Vite/Express setup. **Needs update**:

```toml
[deployment]
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 3000
externalPort = 80
```

### Environment Variables
No `.env` file currently. May need:
- `NEXT_PUBLIC_CELO_RPC_URL` - Celo network RPC
- `NEXT_PUBLIC_SELF_PROTOCOL_API_KEY` - Self Protocol API
- `OPENAI_API_KEY` - AI question generation (server-side only)

## Migration Notes

**From Vite/Express to Next.js**:
- ✅ All client components migrated to `components/` and `app/`
- ✅ Page components in `app/_components/`
- ✅ Main game flow in `app/page.tsx`
- ✅ Global styles in `app/globals.css`
- ✅ Tailwind configuration updated
- ✅ package.json cleaned (removed Vite, Express, Wouter, etc.)
- ❌ Old `client/`, `server/`, `shared/` directories - **ignore, will be deleted**
- ❌ API routes not yet implemented (use Next.js API routes in `app/api/`)
- ❌ Database integration not migrated (was Drizzle + Neon PostgreSQL)
