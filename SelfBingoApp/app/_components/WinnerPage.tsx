import { Trophy, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WinnerPageProps {
  prizeAmount: number;
  winnersCount: number;
  newGameStartsIn: number;
  onPlayAgain?: () => void;
}

export default function WinnerPage({ 
  prizeAmount, 
  winnersCount, 
  newGameStartsIn,
  onPlayAgain 
}: WinnerPageProps) {
  const amountPerWinner = (prizeAmount / winnersCount).toFixed(2);
  
  return (
    <div className="bg-primary min-h-screen flex flex-col items-center justify-center p-4" data-testid="container-winner">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-black text-primary p-8 border-4 border-black text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Sparkles className="w-12 h-12" />
            <Trophy className="w-16 h-16" />
            <Sparkles className="w-12 h-12" />
          </div>
          
          <h1 className="text-7xl font-thin tracking-tight mb-4" data-testid="text-winner-title">
            BINGO!
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-6 h-6" />
            <p className="text-xl font-black uppercase" data-testid="text-winner-message">
              YOU WON!
            </p>
            <Crown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white text-black p-6 border-4 border-black text-center">
          <p className="text-xs font-black uppercase mb-3">YOUR PRIZE</p>
          <div className="flex items-baseline justify-center gap-2 mb-3">
            <p className="text-6xl font-thin" data-testid="text-winner-prize">
              {amountPerWinner}
            </p>
            <span className="text-2xl font-black">USDC</span>
          </div>
          <p className="text-xs uppercase font-bold" data-testid="text-winner-split">
            Split with {winnersCount} {winnersCount === 1 ? 'winner' : 'winners'}
          </p>
        </div>

        <div className="bg-card p-6 border-2 border-black text-center">
          <p className="text-xs font-black uppercase mb-2">ACHIEVEMENT</p>
          <p className="text-sm">
            You completed 5-in-a-row verification!
          </p>
        </div>

        <div className="bg-[#1A0329] text-white p-6 border-2 border-black text-center">
          <p className="text-xs font-black uppercase mb-3">NEW GAME STARTS IN</p>
          <p className="text-5xl font-thin mb-4" data-testid="text-countdown">
            {newGameStartsIn}s
          </p>
          <p className="text-xs">Get ready for the next round!</p>
        </div>

        {onPlayAgain && (
          <Button 
            className="w-full h-14 text-base font-black uppercase border-2 border-black"
            variant="secondary"
            onClick={onPlayAgain}
            data-testid="button-play-again"
          >
            Play Again
          </Button>
        )}
      </div>
    </div>
  );
}
