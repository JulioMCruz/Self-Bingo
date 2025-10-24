import { Button } from "@/components/ui/button";
import { XCircle, Target } from "lucide-react";

interface ResultScreenProps {
  hasWon: boolean;
  verifiedCount: number;
  onContinuePlaying: () => void;
}

export default function ResultScreen({ hasWon, verifiedCount, onContinuePlaying }: ResultScreenProps) {
  if (hasWon) {
    return null; // Winner screen is handled separately
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 border-4 border-black space-y-6 text-center" data-testid="container-result">
          <XCircle className="w-20 h-20 mx-auto text-destructive" />
          
          <div className="space-y-2">
            <h2 className="text-4xl font-thin tracking-tight" data-testid="text-result-title">
              No Bingo Yet
            </h2>
            <p className="text-sm uppercase font-black tracking-wide">
              Keep verifying to win
            </p>
          </div>

          <div className="bg-primary p-6 border-2 border-black">
            <p className="text-xs font-black uppercase mb-2">YOUR PROGRESS</p>
            <div className="flex items-center justify-center gap-2">
              <Target className="w-6 h-6" />
              <p className="text-3xl font-thin" data-testid="text-result-progress">
                {verifiedCount} / 25
              </p>
            </div>
            <p className="text-xs mt-2 uppercase font-bold">
              Squares verified
            </p>
          </div>

          <div className="bg-[#1A0329] text-white p-4 border-2 border-black">
            <p className="text-xs font-black uppercase mb-2">NEED TO WIN</p>
            <p className="text-sm">
              Complete 5-in-a-row (horizontal, vertical, or diagonal)
            </p>
          </div>

          <Button 
            className="w-full h-14 text-base font-black uppercase border-2 border-black"
            variant="secondary"
            onClick={onContinuePlaying}
            data-testid="button-continue-playing"
          >
            Continue Playing
          </Button>
        </div>
      </div>
    </div>
  );
}
