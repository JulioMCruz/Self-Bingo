import selfLogo from '@assets/self-logo.png';

export type BingoSquareState = 'default' | 'selected' | 'verifying' | 'verified' | 'failed';

interface BingoSquare {
  id: string;
  question: string;
  state: BingoSquareState;
}

interface BingoCardProps {
  squares: BingoSquare[];
  onSquareClick: (id: string) => void;
}

export default function BingoCard({ squares, onSquareClick }: BingoCardProps) {
  const getSquareClass = (state: BingoSquareState) => {
    switch (state) {
      case 'selected':
        return 'bg-primary text-foreground';
      case 'verifying':
        return 'bg-[#1A0329] text-white animate-pulse';
      case 'verified':
        return 'bg-secondary text-secondary-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-white text-black hover-elevate active-elevate-2';
    }
  };

  return (
    <div className="bg-card p-4 border-2 border-black" data-testid="container-bingo-card">
      <div className="grid grid-cols-5 gap-2">
        {squares.map((square, index) => {
          const isFreeSpace = index === 12;
          return (
            <button
              key={square.id}
              onClick={() => !isFreeSpace && onSquareClick(square.id)}
              disabled={isFreeSpace || square.state === 'verified' || square.state === 'verifying'}
              className={`aspect-square p-2 border-2 border-black flex items-center justify-center text-center text-xs font-medium leading-tight transition-none ${getSquareClass(square.state)} ${isFreeSpace ? 'cursor-default' : 'cursor-pointer'}`}
              data-testid={`button-square-${square.id}`}
            >
              {isFreeSpace ? (
                <img src={selfLogo.src} alt="Self" className="w-full h-full object-contain p-1" />
              ) : (
                square.question
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs font-black uppercase">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary border-2 border-black" />
          <span data-testid="text-legend-verified">VERIFIED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary border-2 border-black" />
          <span data-testid="text-legend-selected">SELECTED</span>
        </div>
      </div>
    </div>
  );
}
