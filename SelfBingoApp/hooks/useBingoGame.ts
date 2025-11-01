"use client";

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { Address } from 'viem';
import {
  FACTORY_ADDRESS,
  BINGO_FACTORY_ABI,
  BINGO_GAME_ABI,
  ENTRY_FEE_WEI,
  ENTRY_FEE_CELO,
  GAME_CONFIG
} from '@/lib/contracts';

export function useBingoGame() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Use hardcoded V3 game address instead of Factory (Factory returns old game)
  const V3_GAME_ADDRESS = (process.env.NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS || '') as Address;
  const [currentGameAddress, setCurrentGameAddress] = useState<Address | null>(V3_GAME_ADDRESS);

  // Read current game from factory (DISABLED - using env variable instead)
  const { data: factoryGameAddress, refetch: refetchCurrentGame } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: BINGO_FACTORY_ABI,
    functionName: 'getCurrentGame',
    query: {
      enabled: false, // Disabled - Factory returns old game (0x363d...)
      retry: false,
    }
  });

  // Read game stats
  const { data: gameStats, refetch: refetchGameStats } = useReadContract({
    address: currentGameAddress as Address,
    abi: BINGO_GAME_ABI,
    functionName: 'getGameStats',
    query: {
      enabled: !!currentGameAddress && currentGameAddress !== '0x0000000000000000000000000000000000000000',
    }
  });

  // Read if player has joined
  const { data: hasPlayerJoined, refetch: refetchHasJoined } = useReadContract({
    address: currentGameAddress as Address,
    abi: BINGO_GAME_ABI,
    functionName: 'hasJoined',
    args: address ? [address] : undefined,
    query: {
      enabled: !!currentGameAddress && !!address,
    }
  });

  // Write functions
  const { writeContractAsync: writeCreateGame, isPending: isCreatingTx } = useWriteContract();
  const { writeContractAsync: writeJoinGame, isPending: isJoiningTx } = useWriteContract();

  // Use V3 game address from environment variable
  useEffect(() => {
    if (V3_GAME_ADDRESS && V3_GAME_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      console.log('🎮 Using V3 game from env:', V3_GAME_ADDRESS);
      setCurrentGameAddress(V3_GAME_ADDRESS);
    }
  }, [V3_GAME_ADDRESS]);

  /**
   * Create a new game if none exists
   */
  const createGame = async () => {
    if (!FACTORY_ADDRESS) {
      console.error('❌ Factory address not configured');
      throw new Error('Factory contract address not configured');
    }
    if (!publicClient) {
      console.error('❌ Public client not available');
      throw new Error('Public client not available');
    }

    try {
      console.log('🎮 Creating new game...');
      console.log('📍 Factory address:', FACTORY_ADDRESS);
      console.log('💰 Entry fee:', ENTRY_FEE_CELO, 'CELO (', ENTRY_FEE_WEI.toString(), 'wei)');
      console.log('👥 Min players:', GAME_CONFIG.minPlayers);
      console.log('👥 Max players:', GAME_CONFIG.maxPlayers);
      console.log('🪙 Using native CELO:', GAME_CONFIG.isNativeToken);

      // writeContractAsync waits for user confirmation and returns hash
      const hash = await writeCreateGame({
        address: FACTORY_ADDRESS,
        abi: BINGO_FACTORY_ABI,
        functionName: 'createGame',
        args: [
          GAME_CONFIG.usdcToken as Address,
          ENTRY_FEE_WEI,
          GAME_CONFIG.verificationFee, // V3: verification fee per cell
          BigInt(GAME_CONFIG.minPlayers),
          BigInt(GAME_CONFIG.maxPlayers),
          GAME_CONFIG.isNativeToken
        ]
      });

      console.log('📝 Transaction submitted:', hash);
      console.log('🔗 Explorer:', `https://celoscan.io/tx/${hash}`);
      console.log('⏳ Waiting for blockchain confirmation...');

      // Wait for transaction to be mined (Celo mainnet is fast)
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
        timeout: 60_000, // 60 second timeout for Celo mainnet
        pollingInterval: 1_000, // Poll every 1 second
      });

      console.log('📦 Receipt received:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        transactionHash: receipt.transactionHash
      });

      if (receipt.status === 'reverted') {
        console.error('❌ Transaction reverted! Receipt:', receipt);
        throw new Error('Transaction reverted on blockchain');
      }

      console.log('✅ Transaction confirmed:', receipt.status);
      console.log('🔄 Fetching new game address...');

      // Wait a bit longer for Celo state to update
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: newGame } = await refetchCurrentGame();
      console.log('🎯 New game address:', newGame);

      if (!newGame || newGame === '0x0000000000000000000000000000000000000000') {
        console.warn('⚠️ Game address not updated yet, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const { data: retryGame } = await refetchCurrentGame();
        console.log('🔄 Retry - New game address:', retryGame);
        return retryGame;
      }

      return newGame;
    } catch (error: any) {
      console.error('❌ Error creating game:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        data: error?.data,
        shortMessage: error?.shortMessage,
        metaMessages: error?.metaMessages
      });
      throw error;
    }
  };

  /**
   * Join the current game by paying entry fee
   * @param gameAddress - Optional game address to join (uses currentGameAddress if not provided)
   */
  const joinGame = async (gameAddress?: Address) => {
    const targetGame = gameAddress || currentGameAddress;

    console.log('💰 Join game called with:', { gameAddress, currentGameAddress, targetGame });

    if (!targetGame) {
      console.error('❌ No active game to join');
      throw new Error('No active game to join');
    }

    if (!address) {
      console.error('❌ Wallet not connected');
      throw new Error('Wallet not connected');
    }

    if (!publicClient) {
      console.error('❌ Public client not available');
      throw new Error('Public client not available');
    }

    try {
      console.log('💰 Joining game:', targetGame);
      console.log('👤 Player address:', address);
      console.log('💵 Entry fee:', ENTRY_FEE_CELO, 'CELO (', ENTRY_FEE_WEI.toString(), 'wei)');

      // writeContractAsync waits for user confirmation and returns hash
      const hash = await writeJoinGame({
        address: targetGame,
        abi: BINGO_GAME_ABI,
        functionName: 'joinGame',
        value: ENTRY_FEE_WEI, // Send CELO with transaction
      });

      console.log('📝 Join transaction submitted:', hash);
      console.log('🔗 Explorer:', `https://celoscan.io/tx/${hash}`);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction to be mined (Celo mainnet is fast)
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
        timeout: 60_000, // 60 second timeout for Celo mainnet
        pollingInterval: 1_000, // Poll every 1 second
      });

      console.log('📦 Join receipt received:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        transactionHash: receipt.transactionHash
      });

      if (receipt.status === 'reverted') {
        console.error('❌ Join transaction reverted! Receipt:', receipt);
        throw new Error('Transaction reverted - you may have already joined or game is full');
      }

      console.log('✅ Successfully joined game!', receipt.status);

      // Refetch game stats with retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refetchGameStats();

      console.log('🎮 Ready to play!');
    } catch (error: any) {
      console.error('❌ Error joining game:', error);
      console.error('❌ Join error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        data: error?.data,
        shortMessage: error?.shortMessage,
        metaMessages: error?.metaMessages
      });
      throw error;
    }
  };

  /**
   * Check if game needs to be created or if one exists
   * Returns the game address after ensuring it exists
   */
  const ensureGameExists = async (): Promise<Address> => {
    console.log('🔍 Checking for existing game...');
    console.log('📍 Factory address:', FACTORY_ADDRESS);

    const { data: currentGame } = await refetchCurrentGame();
    console.log('📍 Current game address:', currentGame);
    console.log('📍 Is zero address?', currentGame === '0x0000000000000000000000000000000000000000');

    if (!currentGame || currentGame === '0x0000000000000000000000000000000000000000') {
      console.log('🆕 No active game found, creating new game...');

      // No active game, create one
      const newGameAddress = await createGame();

      console.log('🎯 createGame returned:', newGameAddress);
      console.log('🎯 Is valid address?', newGameAddress && newGameAddress !== '0x0000000000000000000000000000000000000000');

      if (!newGameAddress || newGameAddress === '0x0000000000000000000000000000000000000000') {
        console.error('❌ Failed to create game - invalid address returned:', newGameAddress);
        throw new Error('Failed to create game - no address returned');
      }

      console.log('✅ Game created successfully:', newGameAddress);
      return newGameAddress as Address;
    }

    console.log('✅ Using existing game:', currentGame);
    return currentGame as Address;
  };

  return {
    // State
    currentGameAddress,
    gameStats: gameStats ? {
      status: gameStats[0],
      playerCount: Number(gameStats[1]),
      prizePool: gameStats[2],
      createdAt: Number(gameStats[3]),
      startedAt: Number(gameStats[4]),
      completedAt: Number(gameStats[5]),
      prizesDistributed: gameStats[6]
    } : null,
    hasPlayerJoined: hasPlayerJoined as boolean,

    // Loading states
    isCreatingGame: isCreatingTx,
    isJoiningGame: isJoiningTx,

    // Actions
    createGame,
    joinGame,
    ensureGameExists,
    refetchGameStats,
    refetchCurrentGame,
    refetchHasJoined,

    // Constants
    entryFee: ENTRY_FEE_CELO,
  };
}
