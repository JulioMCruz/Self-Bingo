interface PrizePoolHeroProps {
  prizePool: number;
}

export default function PrizePoolHero({ prizePool }: PrizePoolHeroProps) {
  return (
    <div className="bg-primary p-8 border-2 border-black" data-testid="container-prize-pool">
      <p className="text-xs font-black uppercase tracking-wide mb-2" data-testid="text-prize-label">
        CURRENT PRIZE POOL
      </p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-5xl md:text-6xl font-thin tracking-tight" data-testid="text-prize-amount">
          {prizePool.toFixed(2)}
        </h2>
        <span className="text-2xl font-black" data-testid="text-prize-currency">
          USDC
        </span>
      </div>
    </div>
  );
}
