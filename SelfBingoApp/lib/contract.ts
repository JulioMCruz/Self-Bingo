import { ethers } from 'ethers';

// Contract ABIs
const BINGO_GAME_V3_ABI = [
  'function verifyCellForPlayer(address player, uint256 position) external payable',
  'function getPlayerCells(address player) external view returns (uint256[])',
  'function verifier() external view returns (address)',
  'function hasJoined(address player) external view returns (bool)',
  'function cellVerifiers(uint256 position, uint256 index) external view returns (address)',
  'function hasVerifiedCell(uint256 position, address player) external view returns (bool)',
  'function getCellVerifierCount(uint256 position) external view returns (uint256)',
  'function verificationFee() external view returns (uint256)',
  'function isNativeToken() external view returns (bool)'
];

/**
 * Get Celo provider and signer
 */
export function getProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://forno.celo.org';
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getSigner() {
  const provider = getProvider();
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured in .env');
  }

  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get BingoGameV3 contract instance
 */
export function getBingoGameContract(address: string) {
  const signer = getSigner();
  return new ethers.Contract(address, BINGO_GAME_V3_ABI, signer);
}

/**
 * Store verification on-chain by calling verifyCellForPlayer (V3)
 * V3 supports multiple players verifying the same cell with a verification fee
 */
export async function storeVerificationOnChain(
  gameAddress: string,
  playerAddress: string,
  squareId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log(`📝 Storing V3 verification on-chain:`, {
      game: gameAddress,
      player: playerAddress,
      square: squareId
    });

    const contract = getBingoGameContract(gameAddress);

    // Verify the signer is the authorized verifier
    const authorizedVerifier = await contract.verifier();
    const signer = getSigner();
    const signerAddress = await signer.getAddress();

    console.log(`🔐 Authorized verifier: ${authorizedVerifier}`);
    console.log(`🔐 Current signer: ${signerAddress}`);

    if (signerAddress.toLowerCase() !== authorizedVerifier.toLowerCase()) {
      throw new Error('Signer is not the authorized verifier');
    }

    // Check if player has joined the game
    const hasJoined = await contract.hasJoined(playerAddress);
    if (!hasJoined) {
      throw new Error('Player has not joined the game');
    }

    // V3: Check if player already verified this cell
    const hasVerified = await contract.hasVerifiedCell(squareId, playerAddress);
    if (hasVerified) {
      console.log(`⚠️  Player ${playerAddress} already verified cell ${squareId}`);
      return {
        success: false,
        error: `You already verified this cell`
      };
    }

    // Get verification fee
    const verificationFee = await contract.verificationFee();
    console.log(`💰 Verification fee: ${ethers.formatEther(verificationFee)} CELO`);

    // Call verifyCellForPlayer with verification fee (V3)
    console.log(`📤 Calling verifyCellForPlayer(${playerAddress}, ${squareId}) with fee ${ethers.formatEther(verificationFee)} CELO...`);
    const tx = await contract.verifyCellForPlayer(playerAddress, squareId, {
      value: verificationFee
    });

    console.log(`⏳ Transaction sent: ${tx.hash}, waiting for confirmation...`);
    const receipt = await tx.wait();

    console.log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`);

    return {
      success: true,
      txHash: tx.hash
    };
  } catch (error: any) {
    console.error('❌ Error storing verification on-chain:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Load verified cells for a player from the contract
 */
export async function loadPlayerVerifications(
  gameAddress: string,
  playerAddress: string
): Promise<number[]> {
  try {
    const contract = getBingoGameContract(gameAddress);
    const cells = await contract.getPlayerCells(playerAddress);
    return cells.map((cell: bigint) => Number(cell));
  } catch (error) {
    console.error('Error loading player verifications:', error);
    return [];
  }
}

/**
 * Load ALL claimed cells in the game (for all players)
 * V3: Returns object mapping cell ID to array of verifier addresses
 */
export async function loadAllClaimedCells(
  gameAddress: string
): Promise<Record<number, string[]>> {
  try {
    const contract = getBingoGameContract(gameAddress);
    const claimedCells: Record<number, string[]> = {};

    // Check all 25 cells (0-24)
    for (let i = 0; i < 25; i++) {
      const verifierCount = await contract.getCellVerifierCount(i);
      const count = Number(verifierCount);

      if (count > 0) {
        const verifiers: string[] = [];
        for (let j = 0; j < count; j++) {
          const verifier = await contract.cellVerifiers(i, j);
          verifiers.push(verifier.toLowerCase());
        }
        claimedCells[i] = verifiers;
      }
    }

    const totalCells = Object.keys(claimedCells).length;
    const totalVerifications = Object.values(claimedCells).reduce((sum, verifiers) => sum + verifiers.length, 0);
    console.log(`📊 Loaded ${totalCells} cells with ${totalVerifications} total verifications from V3 contract`);
    return claimedCells;
  } catch (error) {
    console.error('Error loading claimed cells:', error);
    return {};
  }
}
