import { http, createConfig } from 'wagmi'
import { celo, celoAlfajores, base, baseSepolia, mainnet } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { walletConnect, injected } from 'wagmi/connectors'
import type { Chain } from 'viem'

// Celo Sepolia testnet configuration
export const celoSepolia = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://alfajores-forno.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'Celoscan', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
} as const satisfies Chain

// Get chain configuration from environment variables
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "42220")

// Select the appropriate chain based on the chain ID
const targetChain = TARGET_CHAIN_ID === 42220 ? celo
  : TARGET_CHAIN_ID === 11142220 ? celoSepolia
  : celoAlfajores

// Create transports object with proper typing for all chains
// Include Base chains since Farcaster wallets often connect to Base by default
// Include mainnet for ENS resolution
const transports = {
  [celo.id]: http(),
  [celoAlfajores.id]: http(),
  [celoSepolia.id]: http(),
  [base.id]: http(),
  [baseSepolia.id]: http(),
  [mainnet.id]: http(),
} as const

// WalletConnect project ID is required for WalletConnect v2
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined - WalletConnect will not work')
}

// Configure chain-specific settings
const chainConfig = {
  [celo.id]: {
    ...celo,
    rpcUrls: {
      ...celo.rpcUrls,
      default: { http: [process.env.NEXT_PUBLIC_RPC_URL_CELO_MAINNET || 'https://forno.celo.org'] },
    }
  },
  [celoAlfajores.id]: {
    ...celoAlfajores,
    rpcUrls: {
      ...celoAlfajores.rpcUrls,
      default: { http: ['https://alfajores-forno.celo-testnet.org'] },
    }
  },
  [celoSepolia.id]: celoSepolia
}

// Use the chain config for the target chain
const configuredChain = chainConfig[targetChain.id] || celoSepolia

// Include all chains to allow switching from Farcaster's default Base network to Celo
// Include mainnet for ENS resolution
export const config = createConfig({
  chains: [configuredChain, base, baseSepolia, mainnet],
  transports,
  connectors: projectId ? [
    farcasterMiniApp(),
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Self Bingo',
        description: 'Blockchain-based bingo game with Self Protocol verification',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        icons: [process.env.NEXT_PUBLIC_ICON_URL || ''],
      },
    }),
  ] : [
    farcasterMiniApp(),
    injected(),
  ]
})
