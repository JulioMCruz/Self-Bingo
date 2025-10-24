import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface PaymentScreenProps {
  entryFee: number;
  onPayment: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function PaymentScreen({ entryFee, onPayment, walletConnected, onConnectWallet }: PaymentScreenProps) {
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
              {entryFee} <span className="text-2xl font-black">USDC</span>
            </p>
            <p className="text-xs mt-2 uppercase font-bold">on Celo Mainnet</p>
          </div>

          {walletConnected ? (
            <>
              <div className="bg-secondary/10 p-4 border-2 border-black">
                <p className="text-xs font-black uppercase mb-2">WALLET CONNECTED</p>
                <p className="text-sm font-mono truncate" data-testid="text-wallet-address">
                  0x742d...4a9f
                </p>
              </div>
              <Button 
                className="w-full h-14 text-base font-black uppercase border-2 border-black"
                onClick={onPayment}
                data-testid="button-pay-entry"
              >
                Pay & Start Playing
              </Button>
            </>
          ) : (
            <Button 
              className="w-full h-14 text-base font-black uppercase border-2 border-black"
              onClick={onConnectWallet}
              data-testid="button-connect-wallet"
            >
              <Wallet className="mr-2 w-5 h-5" />
              Connect Wallet
            </Button>
          )}

          <p className="text-xs text-center uppercase font-bold" data-testid="text-payment-note">
            Winners split the prize pool when they complete 5-in-a-row
          </p>
        </div>
      </div>
    </div>
  );
}
