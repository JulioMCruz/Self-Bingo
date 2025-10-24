'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import TopBar from '@/components/TopBar';
import Dashboard from './_components/Dashboard';
import PaymentScreen from '@/components/PaymentScreen';
import GameScreen from './_components/GameScreen';
import WinnerPage from './_components/WinnerPage';
import ResultScreen from '@/components/ResultScreen';
import { type BingoSquareState } from '@/components/BingoCard';

type AppState = 'dashboard' | 'payment' | 'game' | 'result' | 'winner';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [walletConnected, setWalletConnected] = useState(false);

  // todo: remove mock functionality - replace with real API data
  const [participantCount] = useState(247);
  const [prizePool] = useState(247);
  const [activeGames] = useState(247);
  const [totalWinners] = useState(18);
  const [roundNumber] = useState(42);

  // todo: remove mock functionality - replace with AI-generated questions
  const [squares, setSquares] = useState([
    { id: '1', question: 'Age 25+', state: 'default' as BingoSquareState },
    { id: '2', question: 'From Europe', state: 'default' as BingoSquareState },
    { id: '3', question: 'Not from USA', state: 'default' as BingoSquareState },
    { id: '4', question: 'Passport valid 6+ months', state: 'default' as BingoSquareState },
    { id: '5', question: 'Born in 1990s', state: 'default' as BingoSquareState },
    { id: '6', question: 'Gender: Male', state: 'default' as BingoSquareState },
    { id: '7', question: 'Issued in home country', state: 'default' as BingoSquareState },
    { id: '8', question: 'Age 18-30', state: 'default' as BingoSquareState },
    { id: '9', question: 'From Asia', state: 'default' as BingoSquareState },
    { id: '10', question: 'Not on OFAC list', state: 'default' as BingoSquareState },
    { id: '11', question: 'Born after 2000', state: 'default' as BingoSquareState },
    { id: '12', question: 'Has valid passport', state: 'default' as BingoSquareState },
    { id: 'free', question: 'FREE', state: 'verified' as BingoSquareState },
    { id: '14', question: 'From Africa', state: 'default' as BingoSquareState },
    { id: '15', question: 'Age 30+', state: 'default' as BingoSquareState },
    { id: '16', question: 'Not from sanctioned country', state: 'default' as BingoSquareState },
    { id: '17', question: 'Gender: Female', state: 'default' as BingoSquareState },
    { id: '18', question: 'From South America', state: 'default' as BingoSquareState },
    { id: '19', question: 'Passport expires 2026+', state: 'default' as BingoSquareState },
    { id: '20', question: 'Born before 1995', state: 'default' as BingoSquareState },
    { id: '21', question: 'From Oceania', state: 'default' as BingoSquareState },
    { id: '22', question: 'Age 21+', state: 'default' as BingoSquareState },
    { id: '23', question: 'From North America', state: 'default' as BingoSquareState },
    { id: '24', question: 'Gender: Other', state: 'default' as BingoSquareState },
    { id: '25', question: 'Born in 2000s', state: 'default' as BingoSquareState },
  ]);

  const handleJoinGame = () => {
    console.log('Join game clicked');
    setAppState('payment');
  };

  const handleConnectWallet = () => {
    console.log('Connecting wallet...');
    setWalletConnected(true);
  };

  const handlePayment = () => {
    console.log('Payment processed');
    setAppState('game');
  };

  const handleSquareClick = (id: string) => {
    setSquares(prev => prev.map(sq => {
      if (sq.id === id) {
        // Cycle through states: default -> selected -> verifying -> verified
        if (sq.state === 'default') return { ...sq, state: 'selected' as BingoSquareState };
        if (sq.state === 'selected') {
          // Simulate verification
          setTimeout(() => {
            setSquares(prev2 => prev2.map(sq2 =>
              sq2.id === id ? { ...sq2, state: 'verified' as BingoSquareState } : sq2
            ));
          }, 2000);
          return { ...sq, state: 'verifying' as BingoSquareState };
        }
      }
      return sq;
    }));
  };

  const checkForBingo = (): boolean => {
    // todo: remove mock functionality - implement real win detection (check rows, cols, diagonals)
    // For now, simple check: if 5+ verified in a row
    const grid = Array(5).fill(null).map(() => Array(5).fill(false));

    squares.forEach((sq, idx) => {
      if (sq.state === 'verified') {
        const row = Math.floor(idx / 5);
        const col = idx % 5;
        grid[row][col] = true;
      }
    });

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (grid[row].every(cell => cell)) return true;
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (grid.every(row => row[col])) return true;
    }

    // Check diagonals
    if (grid.every((row, i) => row[i])) return true;
    if (grid.every((row, i) => row[4 - i])) return true;

    return false;
  };

  const handleCheckWin = () => {
    const hasWon = checkForBingo();
    if (hasWon) {
      console.log('Winner detected!');
      setAppState('winner');
    } else {
      console.log('No win yet, keep playing!');
      setAppState('result');
    }
  };

  const handleContinuePlaying = () => {
    setAppState('game');
  };

  const verifiedCount = squares.filter(sq => sq.state === 'verified').length;

  return (
    <div className="min-h-screen bg-background">
      {appState !== 'winner' && appState !== 'result' && <TopBar participantCount={participantCount} />}

      {appState === 'dashboard' && (
        <Dashboard
          prizePool={prizePool}
          participantCount={participantCount}
          activeGames={activeGames}
          totalWinners={totalWinners}
          roundNumber={roundNumber}
          onJoinGame={handleJoinGame}
        />
      )}

      {appState === 'payment' && (
        <PaymentScreen
          entryFee={1}
          walletConnected={walletConnected}
          onConnectWallet={handleConnectWallet}
          onPayment={handlePayment}
        />
      )}

      {appState === 'game' && (
        <GameScreen
          squares={squares}
          onSquareClick={handleSquareClick}
          onCheckWin={handleCheckWin}
          prizePool={prizePool}
        />
      )}

      {appState === 'result' && (
        <ResultScreen
          hasWon={false}
          verifiedCount={verifiedCount}
          onContinuePlaying={handleContinuePlaying}
        />
      )}

      {appState === 'winner' && (
        <WinnerPage
          prizeAmount={prizePool}
          winnersCount={3}
          newGameStartsIn={45}
        />
      )}
    </div>
  );
}
