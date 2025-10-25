"use client"

import { PaymentFormMinimal, type WagmiConfig } from "selfx402-pay-widget"
import { useAccount, useSignTypedData, useChainId, useReadContract, useConfig } from 'wagmi'
import { useMemo } from 'react'

interface PaymentScreenProps {
  entryFee: number;
  onPayment: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function PaymentScreen({ entryFee, onPayment }: PaymentScreenProps) {
  // Wagmi hooks
  const wagmiConfig = useConfig()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { signTypedDataAsync } = useSignTypedData()
  const { refetch: readContract } = useReadContract()

  // Create WagmiConfig object for the widget
  const wagmiConfigProp: WagmiConfig = useMemo(() => ({
    config: wagmiConfig,
    address,
    isConnected,
    chainId,
    signTypedDataAsync,
    readContract: async (args: any) => {
      const result = await readContract(args as any)
      return result.data
    }
  }), [wagmiConfig, address, isConnected, chainId, signTypedDataAsync, readContract])

  // Vendor API URL (will be our backend)
  const vendorUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  // API endpoint to join game (protected by payment)
  const apiEndpoint = "/api/game/join"

  // Payment success handler
  const handlePaymentSuccess = (data: {
    txHash: string
    amount: string
    recipient?: string
    payTo: string
    apiResponse?: any
  }) => {
    console.log("[Self Bingo] Payment successful!", data)
    console.log("[Self Bingo] Transaction Hash:", data.txHash)
    console.log("[Self Bingo] Amount Paid:", data.amount, "USDC")

    // Trigger game start
    onPayment()
  }

  // Payment failure handler
  const handlePaymentFailure = (error: Error) => {
    console.error("[Self Bingo] Payment failed!", error)
    // Could show error toast here
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-3xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-5xl md:text-6xl font-thin tracking-tight">
            Enter the Game
          </h1>
          <p className="text-base uppercase font-black tracking-wide text-muted-foreground">
            Pay {entryFee} USDC to play
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card p-6 md:p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Entry Fee Display */}
          <div className="bg-primary p-8 border-4 border-black text-center mb-8">
            <p className="text-xs font-black uppercase tracking-wider mb-3 opacity-80">ENTRY FEE</p>
            <p className="text-6xl md:text-7xl font-thin mb-2">
              {entryFee}
            </p>
            <p className="text-2xl font-black uppercase tracking-wide mb-3">USDC</p>
            <p className="text-xs uppercase font-bold tracking-wider opacity-70">on Celo Mainnet</p>
          </div>

          {/* Payment Widget */}
          <div className="mb-6">
            <PaymentFormMinimal
              vendorUrl={vendorUrl}
              apiEndpoint={apiEndpoint}
              requestMethod="POST"
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              showDeepLink="both"
              wagmiConfig={wagmiConfigProp}
              buttonText="Pay & Start Playing"
              successCallbackDelay={2000}
            />
          </div>

          {/* Footer Info */}
          <div className="border-t-2 border-black pt-6 mt-6">
            <p className="text-xs text-center uppercase font-bold tracking-wide text-muted-foreground">
              Winners split the prize pool when they complete 5-in-a-row
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Self Protocol × x402 Micropayments
          </p>
        </div>
      </div>
    </div>
  )
}
