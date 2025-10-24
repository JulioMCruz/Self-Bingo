"use client"

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useEnsName } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ChevronDown, SwitchCamera } from "lucide-react"
import { cn } from "@/lib/utils"
import { truncateEthAddress } from "@/lib/utils"
import { useFarcaster } from "@/contexts/FarcasterContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { celo, celoAlfajores } from 'wagmi/chains'
import { mainnet } from 'wagmi/chains'

export function ConnectMenu() {
  const [mounted, setMounted] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get target chain from env - CELO NETWORK
  const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "42220")
  const targetChain = TARGET_CHAIN_ID === 42220 ? celo : celoAlfajores
  const NETWORK_NAME = targetChain.name

  useEffect(() => {
    setMounted(true)
  }, [])

  // Call all hooks unconditionally (Rules of Hooks requirement)
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isAuthenticated, user } = useFarcaster()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()
  const { data: ensName } = useEnsName({
    address: address,
    chainId: mainnet.id
  })

  // Auto-connect in Farcaster environment
  useEffect(() => {
    const autoConnect = async () => {
      if (mounted && isAuthenticated && !isConnected) {
        console.log('🔗 Auto-connecting Farcaster wallet...')
        try {
          const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp')
          if (farcasterConnector) {
            await connect({ connector: farcasterConnector })
            console.log('✅ Auto-connected successfully')
          }
        } catch (error) {
          console.error('❌ Auto-connect failed:', error)
          // Clear any stale connections
          setError(null)
        }
      }
    }
    autoConnect()
  }, [mounted, isAuthenticated, isConnected, connectors, connect])

  // Clear stale WalletConnect sessions on mount
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // Clear any orphaned WalletConnect sessions
      try {
        localStorage.removeItem('wc@2:client:0.3//session')
        localStorage.removeItem('wc@2:core:0.3//messages')
        localStorage.removeItem('wc@2:core:0.3//subscription')
      } catch (e) {
        // Ignore errors when clearing storage
      }
    }
  }, [mounted, isAuthenticated])

  // Check if we're on the wrong network and auto-switch if needed
  useEffect(() => {
    if (isConnected) {
      const wrongNetwork = chainId !== TARGET_CHAIN_ID
      setIsWrongNetwork(wrongNetwork)

      if (wrongNetwork) {
        // Auto-switch to Celo on connection
        const autoSwitch = async () => {
          try {
            setError(`Switching to ${NETWORK_NAME}...`)
            await switchChain({ chainId: TARGET_CHAIN_ID })
            setError(null)
          } catch (switchError) {
            console.error('Failed to auto-switch network:', switchError)
            setError(`Please switch to ${NETWORK_NAME}`)
          }
        }
        autoSwitch()
      } else {
        setError(null)
      }
    } else {
      setIsWrongNetwork(false)
      setError(null)
    }
  }, [chainId, isConnected, TARGET_CHAIN_ID, NETWORK_NAME, switchChain])

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      setError(null)
      await switchChain({ chainId: TARGET_CHAIN_ID })
    } catch (error) {
      console.error('Failed to switch network:', error)
      setError(`Failed to switch to ${NETWORK_NAME}. Please try manually.`)
    }
  }

  // Don't render anything on the server
  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="bg-secondary/10 border-black hover:bg-secondary/20"
        disabled
      >
        <Wallet className="h-4 w-4" />
      </Button>
    )
  }

  if (isConnected) {
    // In Farcaster, show simple button without dropdown
    if (isAuthenticated && !isWrongNetwork) {
      return (
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="outline"
            className="bg-secondary border-2 border-black text-black min-w-[160px] font-black"
            disabled
          >
            <Wallet className="mr-2 h-4 w-4" />
            {user?.username ? `@${user.username}` : 'Connected'}
          </Button>
        </div>
      )
    }

    // In web or when network is wrong, show dropdown
    return (
      <div className="flex flex-col items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isWrongNetwork ? "destructive" : "outline"}
              className={cn(
                isWrongNetwork ? "animate-pulse" : "bg-secondary border-2 border-black hover-elevate",
                "min-w-[160px] justify-between font-black"
              )}
            >
              <div className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                {isWrongNetwork ? (
                  <>Wrong Network</>
                ) : ensName ? (
                  ensName
                ) : (
                  address ? truncateEthAddress(address) : 'Connected'
                )}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] border-2 border-black">
            {isWrongNetwork && (
              <DropdownMenuItem
                className="cursor-pointer font-black"
                onClick={handleSwitchNetwork}
                disabled={isSwitchPending}
              >
                <SwitchCamera className={cn("mr-2 h-4 w-4", isSwitchPending && "animate-spin")} />
                {isSwitchPending ? 'Switching...' : `Switch to ${NETWORK_NAME}`}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer font-black"
              onClick={() => disconnect()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {error && (
          <p className="text-sm text-destructive font-bold animate-pulse">
            {error}
          </p>
        )}
      </div>
    )
  }

  const handleConnect = async () => {
    try {
      setError(null)

      if (isAuthenticated) {
        // In Farcaster environment, use farcasterMiniApp connector
        const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp')
        if (!farcasterConnector) throw new Error('Farcaster connector not found')
        await connect({ connector: farcasterConnector })
      } else {
        // In web environment, try injected or WalletConnect
        const injectedConnector = connectors.find(c => c.id === 'injected')
        const walletConnectConnector = connectors.find(c => c.id === 'walletConnect')

        if (injectedConnector && typeof window !== 'undefined' && (window as any).ethereum) {
          await connect({ connector: injectedConnector })
        } else if (walletConnectConnector) {
          await connect({ connector: walletConnectConnector })
        } else {
          throw new Error('No suitable wallet connector found')
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setError('Failed to connect wallet. Please try again.')
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleConnect}
        className={cn(
          "bg-[#1A0329] hover-elevate active-elevate-2 border-2 border-black",
          "text-white font-black",
          "flex items-center gap-2"
        )}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      {error && (
        <p className="text-sm text-destructive font-bold animate-pulse">
          {error}
        </p>
      )}
    </div>
  )
}
