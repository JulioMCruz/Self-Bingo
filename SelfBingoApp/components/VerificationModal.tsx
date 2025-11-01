"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { sdk } from "@farcaster/miniapp-sdk";
import { getDisclosuresForSquare, type DisclosureRequirement } from "@/lib/bingoQuestions";

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  challenge: string;
  squareId: string;
  onVerificationSuccess?: () => void;
  onVerificationFailed?: (reason?: string) => void;
}

/**
 * Convert TypeScript disclosure requirement to Self Protocol SDK format
 * IMPORTANT: minimumAge must always be 18 to match the initial payment verification
 * Self Protocol validates that all proofs from the same user have matching circuit configs
 *
 * IMPORTANT: Pass country arrays directly to Self SDK instead of converting to boolean
 * The SDK needs the actual country list to configure proof requirements properly
 */
function convertToSelfDisclosures(req: DisclosureRequirement): any {
  console.log('🔄 Converting disclosure requirements:', JSON.stringify(req, null, 2));

  const converted: any = {
    minimumAge: req.minimumAge || 18, // Always 18 minimum to match initial verification
    ofac: req.ofac ?? false,
    excludedCountries: (req.excludedCountries || []), // Type assertion for Country3LetterCode[]
    name: req.name ?? false,
    // Pass country arrays directly to Self SDK instead of converting to boolean
    issuing_state: Array.isArray(req.issuing_state) ? req.issuing_state : (req.issuing_state ?? false),
    nationality: Array.isArray(req.nationality) ? req.nationality : (req.nationality ?? false),
    gender: req.gender ?? false,
    date_of_birth: req.date_of_birth ?? false,
    passport_number: req.passport_number ?? false,
    expiry_date: req.expiry_date ?? false,
  };

  console.log('✅ Converted to Self SDK format:', JSON.stringify(converted, null, 2));
  return converted;
}

export default function VerificationModal({
  open,
  onClose,
  challenge,
  squareId,
  onVerificationSuccess,
  onVerificationFailed
}: VerificationModalProps) {
  const { address } = useAccount();
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
        ]);
        setIsFarcasterMiniApp(!!context);
      } catch {
        setIsFarcasterMiniApp(false);
      }
    };
    checkEnvironment();
  }, []);

  // Initialize Self Protocol app with dynamic disclosures
  useEffect(() => {
    if (!address || !open || !squareId) return;

    try {
      // Get disclosure requirements for this square
      const disclosureReq = getDisclosuresForSquare(squareId);
      const selfDisclosures = convertToSelfDisclosures(disclosureReq);

      console.log(`🔐 Setting up Self verification for square ${squareId}`);
      console.log(`📋 Original disclosure requirements:`, disclosureReq);
      console.log(`📋 Converted Self disclosures:`, selfDisclosures);
      console.log(`👤 User address:`, address);
      console.log(`🎯 Scope:`, `${process.env.NEXT_PUBLIC_SELF_SCOPE || "self-bingo"}-square-${squareId}`);
      console.log(`🌐 Endpoint:`, endpoint);
      console.log(`🔧 Endpoint type:`, endpoint.startsWith("http") ? "https" : "staging_celo");

      const userDefinedData = {
        timestamp: Date.now(),
        action: "square_verification",
        squareId: squareId,
        question: challenge
      };
      console.log(`📝 User defined data:`, userDefinedData);

      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Bingo",
        scope: `${process.env.NEXT_PUBLIC_SELF_SCOPE || "self-bingo"}-square-${squareId}`,
        endpoint: endpoint,
        logoBase64: process.env.NEXT_PUBLIC_ICON_URL || "",
        userId: address,
        endpointType: endpoint.startsWith("http") ? "https" : "staging_celo",
        userIdType: "hex",
        userDefinedData: JSON.stringify(userDefinedData),
        disclosures: selfDisclosures
      }).build();

      const link = getUniversalLink(app);
      console.log(`✅ Self app created successfully for square ${squareId}`);
      console.log(`🔗 Universal link generated:`, link);
      console.log(`📱 QR code will encode:`, link);

      setSelfApp(app);
      setUniversalLink(link);
    } catch (error) {
      console.error("Failed to initialize Self app for square:", error);
    }
  }, [address, open, squareId, challenge, endpoint]);

  // Poll for verification status
  useEffect(() => {
    if (!address || !open || !squareId) return;

    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/verify-self/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: address,
            squareId: squareId
          })
        });

        const data = await response.json();
        console.log(`📊 Verification poll for square ${squareId}:`, data);

        // Check for successful verification
        if (data.verified) {
          console.log(`✅ Square ${squareId} verified!`);
          clearInterval(pollInterval);
          setIsPolling(false);
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
          onClose();
        }
        // Check for failed verification
        else if (data.failed) {
          console.log(`❌ Square ${squareId} verification failed:`, data.reason);
          clearInterval(pollInterval);
          setIsPolling(false);
          if (onVerificationFailed) {
            onVerificationFailed(data.reason);
          }
          onClose();
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [address, open, squareId, onVerificationSuccess, onVerificationFailed, onClose]);

  const handleSuccessfulVerification = (data?: any) => {
    console.log(`✅ Self Protocol verification successful for square ${squareId}:`, data);
    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
    onClose();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A0329] border-4 border-primary max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-black uppercase text-center" data-testid="text-modal-title">
            VERIFY WITH SELF
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-white text-center text-sm" data-testid="text-modal-challenge">
            Challenge: <span className="font-bold">{challenge}</span>
          </p>

          {/* QR Code - Only show in browser, not in Farcaster Mini App */}
          {!isFarcasterMiniApp && (
            <div className="bg-white p-4 flex items-center justify-center border-2 border-primary" data-testid="container-qr-code">
              {selfApp ? (
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={handleSuccessfulVerification}
                  onError={(error) => console.error("Verification error:", error)}
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-card animate-pulse flex items-center justify-center">
                  <p className="text-xs uppercase font-black text-center">Loading...</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={openSelfApp}
              disabled={!universalLink}
              className="flex-1 h-12 border-2 border-primary text-sm uppercase font-black bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Verify Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!universalLink}
              className="border-2 border-primary px-3 bg-white hover:bg-gray-100"
              title={linkCopied ? "Copied!" : "Copy Link"}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {isPolling && (
            <p className="text-white text-xs font-bold text-center animate-pulse">
              Waiting for verification...
            </p>
          )}

          <p className="text-white text-xs text-center uppercase font-black tracking-wide" data-testid="text-modal-instruction">
            {isFarcasterMiniApp
              ? "Click 'Verify Now' or copy link to verify in browser"
              : "Scan QR code with Self app or click 'Verify Now'"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
