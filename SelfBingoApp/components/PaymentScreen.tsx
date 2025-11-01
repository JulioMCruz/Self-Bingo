"use client";

import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { sdk } from "@farcaster/miniapp-sdk";

interface PaymentScreenProps {
  entryFee: number;
  onPayment: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
  isProcessing?: boolean;
  isAgeVerified?: boolean;
  onStartVerification?: () => void;
  hasPlayerJoined?: boolean;
  onStartPlaying?: () => void;
}

export default function PaymentScreen({
  entryFee,
  onPayment,
  walletConnected,
  onConnectWallet,
  isProcessing = false,
  isAgeVerified = false,
  onStartVerification,
  hasPlayerJoined = false,
  onStartPlaying
}: PaymentScreenProps) {
  const { address } = useAccount();
  const [showVerification, setShowVerification] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);

  const endpoint = process.env.NEXT_PUBLIC_SELF_ENDPOINT || "";

  // Check if running in Farcaster Mini App
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const context = await Promise.race([
          sdk.context,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
        ])
        setIsFarcasterMiniApp(!!context)
      } catch {
        setIsFarcasterMiniApp(false)
      }
    }
    checkEnvironment()
  }, []);

  // Initialize Self Protocol app when verification is shown
  useEffect(() => {
    if (!address || !showVerification) return;

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Bingo",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-bingo",
        endpoint: endpoint,
        logoBase64: process.env.NEXT_PUBLIC_ICON_URL || "",
        userId: address,
        endpointType: endpoint.startsWith("http") ? "https" : "staging_celo",
        userIdType: "hex",
        userDefinedData: JSON.stringify({ timestamp: Date.now(), action: "age_verification" }),
        disclosures: {
          minimumAge: 18,
          ofac: false,
          excludedCountries: [],
          name: false,
          nationality: false,
          gender: false,
          date_of_birth: false,
          passport_number: false,
          expiry_date: false,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [address, showVerification, endpoint]);

  // Poll for verification status
  useEffect(() => {
    if (!address || !showVerification || isAgeVerified) return;

    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/verify-self/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: address })
        });

        const data = await response.json();
        console.log('📊 Verification poll result:', data);

        if (data.verified && data.ageVerified) {
          console.log('✅ Age verification detected!');
          clearInterval(pollInterval);
          setIsPolling(false);
          if (onStartVerification) {
            onStartVerification();
          }
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [address, showVerification, isAgeVerified, onStartVerification]);

  const handleSuccessfulVerification = (data?: any) => {
    console.log("✅ Self Protocol verification successful:", data);
    if (onStartVerification) {
      onStartVerification();
    }
  };

  const copyToClipboard = () => {
    if (!universalLink) return;
    navigator.clipboard.writeText(universalLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 border-4 border-black space-y-6" data-testid="container-payment">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-thin tracking-tight" data-testid="text-payment-title">
              Enter the Game
            </h2>
            <p className="text-sm uppercase font-black tracking-wide" data-testid="text-payment-description">
              Pay entry fee to play
            </p>
          </div>

          <div className="bg-primary p-6 border-2 border-black text-center">
            <p className="text-xs font-black uppercase mb-2">ENTRY FEE</p>
            <p className="text-5xl font-thin" data-testid="text-entry-fee">
              {entryFee} <span className="text-2xl font-black">CELO</span>
            </p>
            <p className="text-xs mt-2 uppercase font-bold">on Celo Sepolia Testnet</p>
          </div>

          {!walletConnected ? (
            <Button
              className="w-full h-14 text-base font-black uppercase border-2 border-black"
              onClick={onConnectWallet}
              data-testid="button-connect-wallet"
            >
              <Wallet className="mr-2 w-5 h-5" />
              Connect Wallet
            </Button>
          ) : (
            <>
              {/* Step 1: Age Verification */}
              <div className={`p-4 border-2 border-black ${isAgeVerified ? 'bg-secondary/20' : 'bg-card'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase mb-1">STEP 1: AGE VERIFICATION</p>
                    <p className="text-xs">Verify you are 18+ with Self Protocol</p>
                  </div>
                  {isAgeVerified && <CheckCircle2 className="w-6 h-6 text-secondary" />}
                </div>
              </div>

              {!isAgeVerified ? (
                <>
                  {!showVerification ? (
                    <Button
                      className="w-full h-14 text-base font-black uppercase border-2 border-black"
                      onClick={() => setShowVerification(true)}
                      data-testid="button-verify-age"
                    >
                      <ShieldCheck className="mr-2 w-5 h-5" />
                      Verify Age (18+)
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {/* QR Code - Only show in browser, not in Farcaster Mini App */}
                      {!isFarcasterMiniApp && (
                        <div className="flex justify-center p-4 bg-white border-2 border-black">
                          {selfApp ? (
                            <SelfQRcodeWrapper
                              selfApp={selfApp}
                              onSuccess={handleSuccessfulVerification}
                              onError={(error) => console.error("Verification error:", error)}
                            />
                          ) : (
                            <div className="w-[256px] h-[256px] bg-card animate-pulse flex items-center justify-center">
                              <p className="text-xs uppercase font-black">Loading QR Code...</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={openSelfApp}
                          disabled={!universalLink}
                          className="flex-1 h-12 border-2 border-black text-sm uppercase font-black"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify with Self
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          disabled={!universalLink}
                          className="border-2 border-black px-3"
                          title={linkCopied ? "Copied!" : "Copy Link"}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="bg-muted/30 p-3 border-2 border-black text-xs">
                        <p className="font-black uppercase mb-1">Instructions</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {isFarcasterMiniApp ? (
                            <>
                              <li>Click &quot;Verify with Self&quot; to open Self app</li>
                              <li>Or use &quot;Copy Link&quot; and open in browser</li>
                              <li>Complete age verification (18+)</li>
                            </>
                          ) : (
                            <>
                              <li>Scan QR code with Self Protocol app</li>
                              <li>Or click &quot;Verify with Self&quot; button</li>
                              <li>Complete age verification (18+)</li>
                            </>
                          )}
                        </ol>
                        {isPolling && (
                          <p className="mt-2 text-xs font-bold text-center animate-pulse">
                            Waiting for verification...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {!hasPlayerJoined ? (
                    <>
                      {/* Step 2: Payment */}
                      <div className="p-4 border-2 border-black bg-card">
                        <p className="text-xs font-black uppercase mb-1">STEP 2: PAYMENT</p>
                        <p className="text-xs">Pay entry fee to join the game</p>
                      </div>

                      <Button
                        className="w-full h-14 text-base font-black uppercase border-2 border-black"
                        onClick={onPayment}
                        disabled={isProcessing}
                        data-testid="button-pay-entry"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-pulse">⏳</span>
                            Processing Transaction...
                          </span>
                        ) : (
                          'Pay & Start Playing'
                        )}
                      </Button>

                      {isProcessing && (
                        <div className="p-4 border-2 border-black bg-muted/30 text-xs">
                          <p className="font-black uppercase mb-2">Transaction in Progress</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Confirm transaction in your wallet</li>
                            <li>Wait for blockchain confirmation (usually under 30 seconds)</li>
                            <li>Don&apos;t close this window or refresh the page</li>
                          </ol>
                          <p className="mt-2 text-center font-bold animate-pulse">
                            Processing on Celo mainnet...
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Already joined message */}
                      <div className="p-6 border-2 border-black bg-secondary/20 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-secondary" />
                        <p className="text-xs font-black uppercase mb-2">ALREADY JOINED</p>
                        <p className="text-xs">You&apos;re already a player in this game!</p>
                      </div>

                      <Button
                        className="w-full h-14 text-base font-black uppercase border-2 border-black bg-secondary hover:bg-secondary/90"
                        onClick={onStartPlaying}
                        data-testid="button-start-playing"
                      >
                        Start Playing
                      </Button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          <p className="text-xs text-center uppercase font-bold" data-testid="text-payment-note">
            Winners split the prize pool when they complete 5-in-a-row
          </p>
        </div>
      </div>
    </div>
  );
}
