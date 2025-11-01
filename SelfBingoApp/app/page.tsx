'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Dashboard from './_components/Dashboard';
import PaymentScreen from '@/components/PaymentScreen';
import GameScreen from './_components/GameScreen';
import WinnerPage from './_components/WinnerPage';
import ResultScreen from '@/components/ResultScreen';
import SelfVerificationModal from '@/components/SelfVerificationModal';
import { type BingoSquareState } from '@/components/BingoCard';
import { useBingoGame } from '@/hooks/useBingoGame';
import { useAccount } from 'wagmi';
import { BINGO_QUESTIONS } from '@/lib/bingoQuestions';

type AppState = 'dashboard' | 'verification' | 'payment' | 'game' | 'result' | 'winner';

export default function Home() {
  const { isConnected, address } = useAccount();
  const {
    gameStats,
    hasPlayerJoined,
    entryFee,
    joinGame,
    ensureGameExists,
    isJoiningGame,
    isCreatingGame,
    refetchGameStats
  } = useBingoGame();

  const [appState, setAppState] = useState<AppState>('dashboard');
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // Mock data - will be replaced with real API data
  const [activeGames] = useState(1);
  const [totalWinners] = useState(0);

  // Bingo questions with Self Protocol disclosure mapping
  // TODO: Fetch from smart contract per game round
  // For now using static questions from bingoQuestions.ts, will be moved to contract storage
  const [squares, setSquares] = useState<Array<{ id: string; question: string; state: BingoSquareState; verifierCount?: number }>>(
    BINGO_QUESTIONS.map(q => ({
      id: q.id,
      question: q.question,
      state: (q.id === '13' ? 'verified' : 'default') as BingoSquareState,  // FREE square is pre-verified
      verifierCount: 0  // V3: Track number of verifiers
    }))
  );

  /**
   * NEW FLOW:
   * 1. Dashboard → User clicks "Join Game"
   * 2. Payment screen with Self Protocol verification button
   * 3. User verifies age (18+) on payment screen
   * 4. After verification → Payment button enabled
   * 5. Payment creates game contract if needed + pays entry fee
   * 6. Show bingo game
   */

  // Auto-redirect based on player join status
  useEffect(() => {
    if (!isConnected || !address) {
      // Not connected - stay on dashboard
      if (appState === 'game') {
        setAppState('dashboard');
      }
      return;
    }

    // Wallet connected - check if player has joined
    if (hasPlayerJoined === true) {
      // Player already joined - they can play
      console.log('✅ Player already joined, allowing game access');
    } else if (hasPlayerJoined === false) {
      // Player NOT joined - redirect to payment
      if (appState === 'game') {
        console.log('⚠️ Player not joined yet, redirecting to payment');
        setAppState('payment');
      }
    }
  }, [isConnected, address, hasPlayerJoined, appState]);

  const handleJoinGame = async () => {
    console.log('🎮 Join game clicked');

    if (!isConnected || !address) {
      console.log('⚠️ Wallet not connected');
      return;
    }

    // Go directly to payment screen
    setAppState('payment');
  };

  const handleStartVerification = async () => {
    console.log('🔐 Self Protocol verification detected by polling...');
    // Verification is already handled inline in PaymentScreen
    // Just update the state to enable payment
    setIsAgeVerified(true);
  };

  const handleStartPlaying = () => {
    console.log('🎮 Starting game (player already joined)...');
    setAppState('game');
  };

  const handleVerificationSuccess = (verificationData?: any) => {
    console.log('✅ Age verification successful:', verificationData);
    setIsAgeVerified(true);
    setVerificationModalOpen(false);
  };

  const handlePayment = async () => {
    console.log('💳 Payment initiated...');
    console.log('💳 Current state:', appState);
    console.log('💳 Wallet connected:', !!address);
    console.log('💳 Wallet address:', address);

    try {
      // Use V3 game address from environment
      const v3GameAddress = process.env.NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS;
      console.log('🎮 V3 Game address from env:', v3GameAddress);

      if (!v3GameAddress) {
        throw new Error('V3 game address not configured. Please set NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS');
      }

      // Join V3 game with CELO payment
      console.log('💰 Joining V3 game with payment...');
      console.log('⏳ Please confirm the transaction in your wallet...');
      await joinGame(v3GameAddress as `0x${string}`);

      console.log('✅ Payment successful, starting game...');
      await refetchGameStats();

      // Move to game screen
      console.log('🎮 Transitioning to game state...');
      setAppState('game');
      console.log('🎮 State set to:', 'game');
    } catch (error: any) {
      console.error('❌ Payment failed:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);

      // User-friendly error messages
      let errorMessage = 'Payment failed. Please try again.';
      if (error?.message?.includes('user rejected') || error?.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else if (error?.message?.includes('insufficient')) {
        errorMessage = 'Insufficient funds. Please add CELO to your wallet.';
      } else if (error?.message?.includes('reverted')) {
        errorMessage = 'Transaction reverted. Please check contract and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error('❌ User-friendly error:', errorMessage);
      alert(errorMessage);
    }
  };

  // Load verified squares from backend on game screen load
  const loadVerifiedSquares = async () => {
    if (!address) {
      console.log('⚠️ No wallet address, skipping verification check');
      return;
    }

    console.log('🔄 Loading verified squares from contract for user:', address);

    try {
      // Load verified squares from smart contract
      const response = await fetch('/api/verify-self/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: address })
      });

      const data = await response.json();
      const verifiedSquares = data.verifiedSquares || [];  // Player's own cells
      const claimedCells = data.claimedCells || {};         // V3: All cells with arrays of verifiers
      const totalVerifications = data.totalVerifications || 0;

      console.log(`✅ V3: Loaded ${verifiedSquares.length} verified squares for player:`, verifiedSquares);
      console.log(`✅ V3: Loaded ${Object.keys(claimedCells).length} cells with ${totalVerifications} total verifications`);

      // Update square states based on V3 on-chain data
      setSquares(prev => prev.map(sq => {
        const squareNumber = parseInt(sq.id);
        const cellVerifiers = claimedCells[squareNumber]; // Array of verifier addresses
        const verifierCount = cellVerifiers ? cellVerifiers.length : 0;

        // If this player verified this cell
        if (verifiedSquares.includes(squareNumber)) {
          console.log(`✅ Square ${sq.id} verified by current player`);
          return {
            ...sq,
            state: 'verified' as BingoSquareState,
            verifierCount  // Show total count including this player
          };
        }

        // V3: Cell can be verified by multiple players
        // Show verifier count even if current player hasn't verified
        if (verifierCount > 0) {
          console.log(`📊 Square ${sq.id} has ${verifierCount} verifiers`);
          return {
            ...sq,
            verifierCount  // Show how many others have verified
          };
        }

        return { ...sq, verifierCount: 0 };
      }));
    } catch (error) {
      console.error('❌ Failed to load verified squares from contract:', error);
    }
  };

  // Load verified squares when entering game state
  useEffect(() => {
    if (appState === 'game' && address) {
      console.log('🔄 Game state entered, loading verified squares...');
      loadVerifiedSquares();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, address]);

  const handleSquareClick = (id: string) => {
    // GameScreen handles the modal, this is just a passthrough
    // State changes happen via handleUpdateSquareState callback
    console.log(`🎯 Square ${id} clicked from page.tsx`);
  };

  const handleUpdateSquareState = (id: string, state: BingoSquareState) => {
    console.log(`🔄 Updating square ${id} to state: ${state}`);
    setSquares(prev => prev.map(sq =>
      sq.id === id ? { ...sq, state } : sq
    ));
  };

  const checkForBingo = (): boolean => {
    // todo: move to backend for server-side validation
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
      console.log('🎉 Winner detected!');
      setAppState('winner');
    } else {
      console.log('❌ No win yet, keep playing!');
      setAppState('result');
    }
  };

  const handleContinuePlaying = () => {
    setAppState('game');
  };

  const verifiedCount = squares.filter(sq => sq.state === 'verified').length;

  // Get participant count and prize pool from game stats
  const participantCount = gameStats?.playerCount || 0;
  const prizePool = gameStats?.prizePool ? Number(gameStats.prizePool) / 1e18 : 0; // Convert from Wei
  const roundNumber = 1; // Could get from factory contract

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
          entryFee={entryFee}
          walletConnected={isConnected}
          onConnectWallet={() => {}} // Wallet connection handled by Wagmi
          onPayment={handlePayment}
          isProcessing={isJoiningGame || isCreatingGame}
          isAgeVerified={isAgeVerified}
          onStartVerification={handleStartVerification}
          hasPlayerJoined={hasPlayerJoined}
          onStartPlaying={handleStartPlaying}
        />
      )}

      {appState === 'game' && (
        <GameScreen
          squares={squares}
          onSquareClick={handleSquareClick}
          onCheckWin={handleCheckWin}
          prizePool={prizePool}
          onUpdateSquareState={handleUpdateSquareState}
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
          winnersCount={5} // From smart contract
          newGameStartsIn={45}
        />
      )}

      {/* Self Protocol Age Verification Modal */}
      <SelfVerificationModal
        open={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
