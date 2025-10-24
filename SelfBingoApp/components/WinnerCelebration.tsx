import { Trophy } from "lucide-react";

interface WinnerCelebrationProps {
  prizeAmount: number;
  winnersCount: number;
  newGameStartsIn: number;
}

export default function WinnerCelebration({ prizeAmount, winnersCount, newGameStartsIn }: WinnerCelebrationProps) {
  const amountPerWinner = (prizeAmount / winnersCount).toFixed(2);
  
  return (
    <div className="bg-[#F2A9E7] p-8 border-4 border-black min-h-screen flex flex-col items-center justify-center text-center" data-testid="container-winner">
      <Trophy className="w-24 h-24 mb-4" />
      <h1 className="text-7xl font-thin tracking-tight mb-4" data-testid="text-winner-title">
        BINGO!
      </h1>
      <div className="space-y-4 mb-8">
        <p className="text-xl font-black uppercase" data-testid="text-winner-message">
          You completed 5-in-a-row!
        </p>
        <div className="bg-white p-6 border-2 border-black">
          <p className="text-xs font-black uppercase mb-2">YOUR PRIZE</p>
          <p className="text-5xl font-thin" data-testid="text-winner-prize">
            {amountPerWinner} <span className="text-2xl font-black">USDC</span>
          </p>
          <p className="text-xs mt-2 uppercase font-bold" data-testid="text-winner-split">
            Split with {winnersCount} {winnersCount === 1 ? 'winner' : 'winners'}
          </p>
        </div>
      </div>
      <div className="bg-black text-primary p-4 border-2 border-black">
        <p className="text-xs font-black uppercase mb-2">NEW GAME STARTS IN</p>
        <p className="text-4xl font-thin" data-testid="text-countdown">
          {newGameStartsIn}s
        </p>
      </div>
    </div>
  );
}
