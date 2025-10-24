import { useState } from 'react';
import BingoCard, { type BingoSquareState } from '@/components/BingoCard';
import VerificationModal from '@/components/VerificationModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy } from 'lucide-react';

interface GameScreenProps {
  squares: Array<{ id: string; question: string; state: BingoSquareState }>;
  onSquareClick: (id: string) => void;
  onCheckWin: () => void;
  prizePool: number;
}

export default function GameScreen({ squares, onSquareClick, onCheckWin, prizePool }: GameScreenProps) {
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState('');

  const handleSquareClick = (id: string) => {
    const square = squares.find(sq => sq.id === id);
    if (square && square.state === 'selected') {
      setCurrentChallenge(square.question);
      setVerificationOpen(true);
    }
    onSquareClick(id);
  };

  const verifiedCount = squares.filter(sq => sq.state === 'verified').length;

  return (
    <div className="min-h-screen pb-8">
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary p-4 border-2 border-black" data-testid="container-prize-pool">
            <div className="flex flex-col items-center justify-center h-full">
              <Trophy className="w-8 h-8 mb-2" />
              <p className="text-xs font-black uppercase">PRIZE POOL</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-thin" data-testid="text-game-prize-pool">
                  {prizePool.toFixed(2)}
                </p>
                <span className="text-sm font-black">USDC</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 border-2 border-black" data-testid="container-progress">
            <div className="flex flex-col items-center justify-center h-full">
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <p className="text-xs font-black uppercase">YOUR PROGRESS</p>
              <p className="text-2xl font-thin" data-testid="text-verified-count">
                {verifiedCount} / 25
              </p>
            </div>
          </div>
        </div>

        <BingoCard squares={squares} onSquareClick={handleSquareClick} />

        <div className="bg-card p-4 border-2 border-black">
          <p className="text-xs font-black uppercase mb-2">Instructions</p>
          <ol className="text-sm space-y-2">
            <li>1. Tap a square to select it (yellow)</li>
            <li>2. Tap again to verify with Self Protocol</li>
            <li>3. Complete verification to mark it green</li>
            <li>4. Get 5-in-a-row to win!</li>
          </ol>
        </div>

        <Button 
          className="w-full h-14 text-base font-black uppercase border-2 border-black"
          variant="secondary"
          onClick={onCheckWin}
          data-testid="button-check-win"
        >
          Check for Win
        </Button>
      </div>

      <VerificationModal 
        open={verificationOpen}
        onClose={() => setVerificationOpen(false)}
        challenge={currentChallenge}
      />
    </div>
  );
}
