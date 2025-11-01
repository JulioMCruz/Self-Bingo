"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";

interface SelfVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (verificationData?: any) => void;
  endpoint?: string;
}

export default function SelfVerificationModal({
  open,
  onClose,
  onSuccess,
  endpoint = process.env.NEXT_PUBLIC_SELF_ENDPOINT || ""
}: SelfVerificationModalProps) {
  const { address } = useAccount();
  const [linkCopied, setLinkCopied] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize Self Protocol app with age verification
  useEffect(() => {
    if (!address || !open) return;

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
          // Age verification requirement
          minimumAge: 18,
          ofac: false,
          excludedCountries: [],
          // Optional disclosures - set to false to not request
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
      setVerificationStatus("error");
      setErrorMessage("Failed to initialize verification. Please try again.");
    }
  }, [address, open, endpoint]);

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, "_blank");
  };

  const handleSuccessfulVerification = (data?: any) => {
    console.log("✅ Self Protocol verification successful:", data);
    setVerificationStatus("success");

    // Wait 2 seconds to show success message, then call parent onSuccess
    setTimeout(() => {
      onSuccess(data);
      handleClose();
    }, 2000);
  };

  const handleVerificationError = (error: any) => {
    console.error("❌ Self Protocol verification failed:", error);
    setVerificationStatus("error");
    setErrorMessage(error?.message || "Verification failed. Please try again.");
  };

  const handleClose = () => {
    // Reset state when closing
    setVerificationStatus("idle");
    setErrorMessage("");
    setLinkCopied(false);
    onClose();
  };

  if (!address) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-4 border-black bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-thin tracking-tight">
            Verify Your Age
          </DialogTitle>
          <DialogDescription className="text-sm uppercase font-black tracking-wide">
            Must be 18+ to play Self Bingo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {verificationStatus === "success" ? (
            <div className="bg-secondary/10 p-6 border-2 border-secondary text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-secondary" />
              <p className="font-black uppercase text-secondary">Verified!</p>
              <p className="text-sm">You are 18+ and can play Self Bingo</p>
            </div>
          ) : verificationStatus === "error" ? (
            <div className="bg-destructive/10 p-6 border-2 border-destructive text-center space-y-2">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <p className="font-black uppercase text-destructive">Verification Failed</p>
              <p className="text-sm">{errorMessage}</p>
              <Button
                variant="outline"
                className="mt-2 border-2 border-black"
                onClick={() => setVerificationStatus("idle")}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-center p-4 bg-white border-2 border-black">
                {selfApp ? (
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    onSuccess={handleSuccessfulVerification}
                    onError={handleVerificationError}
                  />
                ) : (
                  <div className="w-[256px] h-[256px] bg-card animate-pulse flex items-center justify-center">
                    <p className="text-xs uppercase font-black">Loading QR Code...</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase font-black text-center">
                  Scan with Self Protocol App
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!universalLink}
                    className="border-2 border-black text-xs uppercase font-black"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openSelfApp}
                    disabled={!universalLink}
                    className="border-2 border-black text-xs uppercase font-black"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open App
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 p-3 border-2 border-black text-xs">
                <p className="font-black uppercase mb-1">Don&apos;t have the Self app?</p>
                <p>Download it from <a href="https://self.xyz/download" target="_blank" rel="noopener noreferrer" className="underline">self.xyz/download</a></p>
              </div>

              <div className="bg-card p-2 border-2 border-black">
                <p className="text-xs font-black uppercase mb-1">Your Address</p>
                <p className="text-xs font-mono break-all">{address}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
