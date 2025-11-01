import { Address, parseUnits } from 'viem';

// Contract ABIs (V3 - Multi-player support)
export const BINGO_FACTORY_ABI = [
  {
    inputs: [
      { name: '_usdcToken', type: 'address' },
      { name: '_entryFee', type: 'uint256' },
      { name: '_verificationFee', type: 'uint256' },
      { name: '_minPlayers', type: 'uint256' },
      { name: '_maxPlayers', type: 'uint256' },
      { name: '_isNativeToken', type: 'bool' }
    ],
    name: 'createGame',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentGame',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'currentRound',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const BINGO_GAME_ABI = [
  {
    inputs: [],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getGameStats',
    outputs: [
      { name: '_status', type: 'uint8' },
      { name: '_playerCount', type: 'uint256' },
      { name: '_prizePool', type: 'uint256' },
      { name: '_createdAt', type: 'uint256' },
      { name: '_startedAt', type: 'uint256' },
      { name: '_completedAt', type: 'uint256' },
      { name: '_prizesDistributed', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getPlayers',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'hasJoined',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'prizePool',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Contract addresses from environment (V3)
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_V3_ADDRESS || '') as Address;

// Game configuration - Using native CELO (V3)
export const ENTRY_FEE_CELO = parseFloat(process.env.NEXT_PUBLIC_ENTRY_FEE_CELO || '0.001');
export const ENTRY_FEE_WEI = parseUnits(ENTRY_FEE_CELO.toString(), 18); // CELO has 18 decimals

export const VERIFICATION_FEE_CELO = 0.0001; // 0.0001 CELO per cell verification
export const VERIFICATION_FEE_WEI = parseUnits(VERIFICATION_FEE_CELO.toString(), 18);

export const GAME_CONFIG = {
  minPlayers: parseInt(process.env.NEXT_PUBLIC_MIN_PLAYERS || '2'),
  maxPlayers: parseInt(process.env.NEXT_PUBLIC_MAX_PLAYERS || '1000'), // V3: Up to 1000 players
  isNativeToken: true, // Use native CELO
  usdcToken: '0x0000000000000000000000000000000000000000', // Zero address for native token
  verificationFee: VERIFICATION_FEE_WEI, // V3: Fee per cell verification
};
