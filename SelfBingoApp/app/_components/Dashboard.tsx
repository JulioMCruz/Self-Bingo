"use client"

import { Button } from "@/components/ui/button";
import PrizePoolHero from "@/components/PrizePoolHero";
import StatsGrid from "@/components/StatsGrid";
import selfBingoLogo from "@assets/image_1761342849783.png";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

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
  const [mounted, setMounted] = useState(false);
  const entryFee = process.env.NEXT_PUBLIC_ENTRY_FEE_CELO || '0.05';

  useEffect(() => {
    setMounted(true);
  }, []);

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
                CELO
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
              <span>Pay {entryFee} CELO entry fee to get your bingo card</span>
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
            <li className="flex gap-3">
              <span className="font-black">📝</span>
              <span>
                Smart Contract:{' '}
                <a
                  href={`https://celoscan.io/address/${process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors font-black"
                >
                  {process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS?.slice(0, 6)}...{process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS?.slice(-4)}
                </a>
              </span>
            </li>
          </ol>
        </div>

        <Button
          className="w-full h-14 text-base font-black uppercase border-2 border-black"
          onClick={onJoinGame}
          disabled={!mounted || !isConnected}
          data-testid="button-join-game"
        >
          {!mounted ? 'Loading...' : isConnected ? `Join Game - ${entryFee} CELO` : 'Connect Wallet to Play'}
        </Button>
      </div>
    </div>
  );
}
