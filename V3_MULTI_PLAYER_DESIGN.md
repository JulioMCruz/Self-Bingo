# BingoGameV3 - Multi-Player Design

## 🎯 Problem with V2
- **Maximum 25 players** (one cell per player)
- Game becomes unplayable once all cells are claimed
- Not scalable for thousands of users

## ✨ V3 Solution: Multiple Verifiers Per Cell

### Key Changes

**1. Multiple Players Can Verify Same Cell**
```solidity
// OLD V2: Only one owner per cell
mapping(uint256 => address) public cellOwner;

// NEW V3: Multiple verifiers per cell
mapping(uint256 => address[]) public cellVerifiers;
```

**2. Verification Fee System**
- Entry fee: 0.001 CELO (one time, to join game)
- Verification fee: 0.0001 CELO (each cell verification)
- Both fees go into prize pool

**3. Prevent Duplicate Verifications**
```solidity
mapping(uint256 => mapping(address => bool)) public hasVerifiedCell;
// Prevents same player from verifying same cell twice
```

## 💰 Prize Distribution

### Example Scenario

**Game Setup:**
- Entry fee: 0.001 CELO
- Verification fee: 0.0001 CELO
- 100 players joined
- Entry pool: 100 × 0.001 = 0.1 CELO

**Cell Verifications (example):**
- Cell 0: 10 verifications = 0.001 CELO fees
- Cell 1: 15 verifications = 0.0015 CELO fees
- Cell 2: 8 verifications = 0.0008 CELO fees
- Cell 3: 12 verifications = 0.0012 CELO fees
- Cell 4: 20 verifications = 0.002 CELO fees
- Total verification fees: 0.0065 CELO

**Total Prize Pool:**
- Entry fees: 0.1 CELO
- Verification fees: 0.0065 CELO
- **Total: 0.1065 CELO**

**Winning Line (Row 1: cells 0-4):**
- Cell 0: Player1, Player2, Player3... (10 players)
- Cell 1: Player5, Player6, Player7... (15 players)
- Cell 2: Player8, Player9, Player10... (8 players)
- Cell 3: Player11, Player12, Player13... (12 players)
- Cell 4: Player14, Player15, Player16... (20 players)

**Unique Winners:**
- Some players may have verified multiple cells in the winning line
- Smart contract collects unique addresses only
- Example: 45 unique winners (65 total verifications - 20 duplicates)

**Prize Distribution:**
- Total pool: 0.1065 CELO
- Treasury fee (5%): 0.0053 CELO
- Winners' share (95%): 0.1012 CELO
- Prize per winner: 0.1012 / 45 = **0.00225 CELO each**

## 🎮 Game Flow

### 1. Join Game
```
Player pays 0.001 CELO entry fee → Added to players array
```

### 2. Verify Cells (Unlimited)
```
Player clicks cell → Self Protocol verification → Success
Player pays 0.0001 CELO verification fee
Backend calls verifyCellForPlayer(player, cellId)
Player added to cellVerifiers[cellId] array
```

### 3. Win Condition
```
When any row/column/diagonal is fully verified:
- Collect all unique verifiers from those 5 cells
- Split prize pool equally among unique winners
- Game status → Completed
```

## 📊 Scalability Comparison

| Metric | V2 (Single Owner) | V3 (Multi-Verifier) |
|--------|------------------|---------------------|
| Max Players | 25 | **Unlimited** |
| Cells per Player | 1+ (but limited by total cells) | **Unlimited** |
| Game Completion | Needs 25 unique players | Needs any combination filling a line |
| Entry Fee | 0.001 CELO | 0.001 CELO |
| Verification Fee | None | **0.0001 CELO** per cell |
| Prize Pool | Entry fees only | **Entry + Verification fees** |

## 🔥 Why This Works

### Economic Incentives
1. **Early Players**: Lower verification fees (fewer competitors per cell)
2. **Strategic Players**: Target less-verified cells for higher win chance
3. **All Players**: Can verify multiple cells to increase winning odds

### Game Theory
- **First-mover advantage**: Early verifications are cheaper (less competition)
- **Strategic positioning**: Players choose cells based on existing verifications
- **Risk/Reward balance**: More verifications = higher cost but higher reward

## 🛠️ Technical Implementation

### Smart Contract Functions

**New Functions:**
```solidity
function getCellVerifiers(uint256 position) external view returns (address[] memory)
function getCellVerifierCount(uint256 position) external view returns (uint256)
```

**Modified Functions:**
```solidity
function verifyCellForPlayer(address player, uint256 position) external payable
// Now requires msg.value == verificationFee
// Adds player to cellVerifiers array instead of setting single owner
```

**Prize Distribution:**
```solidity
function checkLine(...) internal returns (bool)
// Collects unique addresses from all cells in winning line
// Removes duplicates (players who verified multiple cells in line)
```

### Frontend Changes

**Display Cell State:**
- Show number of verifiers per cell
- Highlight cells you've already verified
- Show which cells are close to forming a line

**Example UI:**
```
Cell 5: "From Latin America"
Verifiers: 12 players
Status: ✅ You verified this
Fee: 0.0001 CELO
```

## 🚀 Migration Path

### Option 1: Deploy New V3 Contract
- Keep V2 running for current game
- Deploy V3 for next round
- Users join new game with V3 mechanics

### Option 2: Upgrade via UUPS Proxy
- Upgrade existing proxy to V3 implementation
- Initialize new storage variables
- Current game completes under V2 rules
- Next game uses V3 rules

## 📈 Revenue Model

### Example with 1000 Players

**Entry Fees:**
- 1000 players × 0.001 CELO = **1 CELO**

**Verification Fees:**
- Average 3 cells per player = 3000 verifications
- 3000 × 0.0001 CELO = **0.3 CELO**

**Total Prize Pool:**
- 1.3 CELO

**Treasury (5%):**
- 0.065 CELO per game

**Winners (95%):**
- 1.235 CELO split among winners
- If 50 unique winners: **0.0247 CELO each** (~25x verification fee)

## 🎯 Recommended Settings

```solidity
entryFee: 0.001 CELO (1,000,000,000,000,000 wei)
verificationFee: 0.0001 CELO (100,000,000,000,000 wei)
minPlayers: 5 (enough for one line minimum)
maxPlayers: 1000 (or unlimited)
```

## 🔐 Security Considerations

**Prevent Duplicate Verifications:**
```solidity
require(!hasVerifiedCell[position][player], "Already verified");
```

**Fee Validation:**
```solidity
require(msg.value == verificationFee, "Incorrect fee");
```

**Verification Authorization:**
```solidity
modifier onlyVerifier() {
    require(msg.sender == verifier || msg.sender == owner());
    _;
}
```

## 📝 Next Steps

1. ✅ Create BingoGameV3.sol contract
2. ⬜ Test contract locally
3. ⬜ Deploy to Celo testnet
4. ⬜ Update frontend to show multiple verifiers
5. ⬜ Update backend to handle verification fees
6. ⬜ Deploy to Celo mainnet
7. ⬜ Migrate users to V3 game

---

**Status**: Design Complete, Ready for Testing
**Created**: 2025-10-27
**Contract**: `BingoGameV3.sol`
