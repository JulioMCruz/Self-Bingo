import { NextRequest, NextResponse } from 'next/server';
import { loadPlayerVerifications, loadAllClaimedCells } from '@/lib/contract';

/**
 * Load verified squares from the smart contract (V3)
 * POST /api/verify-self/load
 * Body: { userId: string (wallet address) } - optional, if provided loads only that player's cells
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;

    const gameAddress = process.env.NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS;

    if (!gameAddress) {
      console.warn('⚠️  NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS not set');
      return NextResponse.json({
        verifiedSquares: [],
        claimedCells: {}
      });
    }

    console.log(`📖 Loading V3 claimed cells from contract ${gameAddress}`);

    // Load ALL claimed cells (V3: shows arrays of verifiers per cell)
    const claimedCells = await loadAllClaimedCells(gameAddress);

    // If userId provided, also load that player's specific cells
    let playerCells: number[] = [];
    if (userId) {
      console.log(`📖 Loading player ${userId} verified squares`);
      playerCells = await loadPlayerVerifications(gameAddress, userId);
      console.log(`✅ Player has ${playerCells.length} verified squares:`, playerCells);
    }

    const totalCells = Object.keys(claimedCells).length;
    const totalVerifications = Object.values(claimedCells).reduce((sum, verifiers) => sum + verifiers.length, 0);
    console.log(`✅ V3: Loaded ${totalCells} cells with ${totalVerifications} total verifications`);

    return NextResponse.json({
      verifiedSquares: playerCells,        // Player's own verified cells
      claimedCells: claimedCells,         // V3: All cells with arrays of verifier addresses
      totalClaimed: totalCells,
      totalVerifications: totalVerifications
    });
  } catch (error: any) {
    console.error('❌ Error loading V3 verifications from contract:', error);
    return NextResponse.json({
      error: error.message || 'Failed to load verifications',
      verifiedSquares: [],
      claimedCells: {}
    }, { status: 500 });
  }
}
