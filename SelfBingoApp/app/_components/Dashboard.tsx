"use client"

import { Button } from "@/components/ui/button";
import PrizePoolHero from "@/components/PrizePoolHero";
import StatsGrid from "@/components/StatsGrid";
import selfBingoLogo from "@assets/image_1761342849783.png";
import { useAccount } from "wagmi";

interface DashboardProps {
  prizePool: number;
  participantCount: number;
  activeGames: number;
  totalWinners: number;
  roundNumber: number;
  onJoinGame: () => void;
}

export default function Dashboard({ 
  prizePool, 
  participantCount, 
  activeGames, 
  totalWinners, 
  roundNumber,
  onJoinGame 
}: DashboardProps) {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen pb-8">
      <div className="space-y-6 p-4">
        <div className="bg-primary p-6 border-2 border-black flex items-center gap-6" data-testid="container-prize-pool">
          <img
            src={selfBingoLogo.src}
            alt="Self Bingo"
            className="w-24 h-auto md:w-32"
            data-testid="img-self-bingo-logo"
          />
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wide mb-2" data-testid="text-prize-label">
              CURRENT PRIZE POOL
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl md:text-6xl font-thin tracking-tight" data-testid="text-prize-amount">
                {prizePool.toFixed(2)}
              </h2>
              <span className="text-xl md:text-2xl font-black" data-testid="text-prize-currency">
                USDC
              </span>
            </div>
          </div>
        </div>
        
        <StatsGrid 
          activeGames={activeGames}
          totalWinners={totalWinners}
          roundNumber={roundNumber}
        />

        <div className="bg-card p-6 border-2 border-black space-y-4" data-testid="container-how-to-play">
          <h3 className="text-2xl font-thin tracking-tight">How It Works</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-black">1.</span>
              <span>Pay 0.01 USDC entry fee to get your bingo card</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black">2.</span>
              <span>Click squares to verify your identity with Self Protocol</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black">3.</span>
              <span>Complete 5-in-a-row (horizontal, vertical, or diagonal)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black">4.</span>
              <span>Winners split the prize pool equally</span>
            </li>
          </ol>
        </div>

        <Button
          className="w-full h-14 text-base font-black uppercase border-2 border-black"
          onClick={onJoinGame}
          disabled={!isConnected}
          data-testid="button-join-game"
        >
          {isConnected ? 'Join Game - 0.01 USDC' : 'Connect Wallet to Play'}
        </Button>
      </div>
    </div>
  );
}
