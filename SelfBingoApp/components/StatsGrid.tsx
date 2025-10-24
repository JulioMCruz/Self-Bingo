interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div 
      className={`p-6 border-2 border-black ${highlight ? 'bg-[#F29E5F]' : 'bg-card'}`}
      data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <p className="text-xs font-black uppercase tracking-wide mb-2" data-testid="text-stat-label">
        {label}
      </p>
      <p className="text-3xl font-thin tracking-tight" data-testid="text-stat-value">
        {value}
      </p>
    </div>
  );
}

interface StatsGridProps {
  activeGames: number;
  totalWinners: number;
  roundNumber: number;
}

export default function StatsGrid({ activeGames, totalWinners, roundNumber }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="ACTIVE GAMES" value={activeGames} />
      <StatCard label="TOTAL WINNERS" value={totalWinners} highlight />
      <StatCard label="ROUND" value={`#${roundNumber}`} />
      <StatCard label="ENTRY FEE" value="1 USDC" />
    </div>
  );
}
