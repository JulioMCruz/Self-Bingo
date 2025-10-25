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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card p-8 border-4 border-black space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-thin tracking-tight">
              Enter the Game
            </h2>
            <p className="text-sm uppercase font-black tracking-wide">
              Pay {entryFee} USDC to play
            </p>
          </div>

          <div className="bg-primary p-6 border-2 border-black text-center">
            <p className="text-xs font-black uppercase mb-2">ENTRY FEE</p>
            <p className="text-5xl font-thin">
              {entryFee} <span className="text-2xl font-black">USDC</span>
            </p>
            <p className="text-xs mt-2 uppercase font-bold">on Celo Mainnet</p>
          </div>

          {/* Selfx402 Payment Widget */}
          <div className="space-y-4">
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

          <p className="text-xs text-center uppercase font-bold">
            Winners split the prize pool when they complete 5-in-a-row
          </p>
        </div>
      </div>
    </div>
  )
}
