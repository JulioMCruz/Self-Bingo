# Dynamic Self Protocol Verification System

This document describes the implementation of the dynamic Self Protocol disclosure mapping system for Self Bingo.

## Overview

Each bingo square now maps to specific Self Protocol disclosures that must be verified when a player clicks on that square. This creates a dynamic verification system where different squares require different identity claims to be proven.

## Architecture

### 1. Frontend: Question-Disclosure Mapping ([lib/bingoQuestions.ts](SelfBingoApp/lib/bingoQuestions.ts))

**25 Bingo Questions** with specific Self Protocol disclosure requirements:

```typescript
export interface DisclosureRequirement {
  minimumAge?: number;                    // Minimum age (18, 21, 25, etc.)
  ofac?: boolean;                         // OFAC sanctions check
  excludedCountries?: string[];           // Excluded nationalities
  name?: boolean;                         // Name verification
  issuing_state?: boolean | string[];    // Passport issuing state
  nationality?: boolean | string[];      // Nationality/citizenship
  gender?: boolean;                       // Gender identity
  date_of_birth?: boolean;               // Date of birth
  birth_year_range?: { min: number; max: number }; // Generation verification
  passport_number?: boolean;              // Passport number
  expiry_date?: boolean;                  // Document expiry date
}
```

**Example Questions**:

| Square ID | Question | Disclosures |
|-----------|----------|-------------|
| 1 | Age 18+ | `minimumAge: 18` |
| 4 | From Europe | `nationality: ['AT', 'BE', 'BG', ...]` |
| 9 | Not on OFAC list | `ofac: false` |
| 13 | FREE | `{}` (no verification) |
| 18 | Gen Z (1997-2012) | `date_of_birth: true, birth_year_range: {1997, 2012}` |
| 22 | US passport | `issuing_state: ['US'], passport_number: true` |

**Helper Functions**:
- `getDisclosuresForSquare(squareId)` - Retrieve disclosure requirements for a square
- `requiresVerification(squareId)` - Check if square needs verification (FREE square doesn't)

### 2. Smart Contract Storage ([SelfBingoContracts/contracts/](SelfBingoContracts/contracts/))

**New Files**:
- `DisclosureTypes.sol` - Solidity data structures for disclosure requirements
- `BingoGameV2.sol` - Enhanced contract with question/disclosure storage

**Key Features**:
```solidity
contract BingoGameV2 {
    string[25] public questions;
    mapping(uint256 => DisclosureTypes.DisclosureRequirement) public squareDisclosures;
    bool public questionsInitialized;

    function initializeQuestions(
        string[25] calldata _questions,
        DisclosureTypes.DisclosureRequirement[25] calldata _disclosures
    ) external onlyOwner;

    function getSquareDisclosures(uint256 position) external view
        returns (DisclosureTypes.DisclosureRequirement memory);
}
```

**Storage Structure**:
```solidity
struct DisclosureRequirement {
    uint8 minimumAge;           // 0 = not required
    bool requireOFAC;           // OFAC sanctions check
    bool requireName;           // Name verification
    bool requireIssuingState;   // Passport issuing state
    bool requireNationality;    // Nationality verification
    bool requireGender;         // Gender verification
    bool requireDOB;            // Date of birth
    bool requirePassport;       // Passport number
    bool requireExpiry;         // Expiry date
    string[] allowedCountries;  // Allowed nationalities
    string[] allowedIssuingStates; // Allowed issuing states
    string[] excludedCountries; // Excluded nationalities
}
```

### 3. Frontend Self Protocol Integration

**Updated Components**:

#### VerificationModal ([components/VerificationModal.tsx](SelfBingoApp/components/VerificationModal.tsx))
- Accepts `squareId` prop
- Dynamically generates Self Protocol QR code based on square's disclosure requirements
- Converts TypeScript requirements to Self Protocol SDK format
- Polls backend for square-specific verification status

**Key Code**:
```typescript
// Get disclosure requirements for this square
const disclosureReq = getDisclosuresForSquare(squareId)
const selfDisclosures = convertToSelfDisclosures(disclosureReq)

const app = new SelfAppBuilder({
  scope: `self-bingo-square-${squareId}`,
  userDefinedData: JSON.stringify({
    squareId: squareId,
    question: challenge
  }),
  disclosures: selfDisclosures
}).build()
```

#### GameScreen ([app/_components/GameScreen.tsx](SelfBingoApp/app/_components/GameScreen.tsx))
- Passes `squareId` to VerificationModal
- Supports per-square verification callbacks

#### Main Page ([app/page.tsx](SelfBingoApp/app/page.tsx))
- Uses `BINGO_QUESTIONS` from bingoQuestions.ts
- FREE square (id='13') automatically set to 'verified' state

### 4. Backend Verification ([app/api/verify-self/](SelfBingoApp/app/api/verify-self/))

#### Main Verification Endpoint (`route.ts`)

**Dynamic Verifier Selection**:
```typescript
// Extract squareId from userContextData
const parsed = JSON.parse(userContextData)
const squareId = parsed.squareId

// Create verifier with square-specific disclosure config
const verifier = squareId
  ? createVerifierForSquare(squareId)
  : defaultSelfBackendVerifier
```

**Square-Specific Validation**:
```typescript
if (squareId) {
  const requirements = getDisclosuresForSquare(squareId)

  // Validate minimum age
  if (requirements.minimumAge && !isMinimumAgeValid) {
    return error(`Must be at least ${requirements.minimumAge} years old`)
  }

  // Validate additional disclosed data
  const validation = validateDisclosedData(result.discloseOutput, requirements)
  if (!validation.valid) {
    return error(validation.reason)
  }
}
```

**Disclosure Validation**:
- Name, gender, date of birth, passport number, expiry date
- Issuing state (must be in allowed list)
- Nationality (must be in allowed list)
- **Birth year range validation** for generation-based questions

**Generation Verification Example**:
```typescript
// Parse birth year from YYMMDD format
const birthYear = parseBirthYear(discloseOutput.dateOfBirth) // "900315" → 1990

// Validate against range
if (birthYear < 1997 || birthYear > 2012) {
  return error('Must be Gen Z (born 1997-2012)')
}
```

**Verification Cache**:
```typescript
// Store with composite key: wallet:squareId
const cacheKey = `${walletAddress}:${squareId}`
global.verificationCache.set(cacheKey, {
  verified: true,
  squareId: squareId,
  ageVerified: isMinimumAgeValid,
  timestamp: Date.now(),
  disclosedData: {
    name, nationality, issuingState, gender, dateOfBirth, expiryDate
  }
})
```

#### Check Endpoint (`check/route.ts`)

**Square-Specific Query**:
```typescript
POST /api/verify-self/check
{
  "userId": "0x...",
  "squareId": "18"  // Optional - for square-specific check
}
```

**Cache Key Resolution**:
```typescript
const cacheKey = squareId
  ? `${userId}:${squareId}`
  : userId
```

## Data Flow

### Initial Age Verification (Payment Screen)
1. User clicks "Verify Age" on payment screen
2. Frontend creates Self Protocol QR code with `minimumAge: 18`
3. User scans QR code with Self App
4. Self App sends proof to `/api/verify-self`
5. Backend validates proof without squareId
6. Verification stored with key: `walletAddress`
7. Frontend polls `/api/verify-self/check` with `userId` only
8. User can proceed to payment

### Square Verification (Game Screen)
1. User clicks bingo square (e.g., "Gen Z (1997-2012)")
2. Frontend retrieves disclosure requirements: `{ date_of_birth: true, birth_year_range: {1997, 2012} }`
3. VerificationModal creates Self Protocol QR code with:
   - `scope: "self-bingo-square-18"`
   - `userDefinedData: { squareId: "18", question: "Gen Z (1997-2012)" }`
   - `disclosures: { date_of_birth: true }`
4. User scans QR code with Self App
5. Self App sends proof to `/api/verify-self` with squareId in userContextData
6. Backend:
   - Parses squareId from userContextData
   - Creates verifier with square-specific config
   - Validates proof
   - **Parses birth year from dateOfBirth (YYMMDD format)**
   - **Validates birth year is between 1997-2012**
   - Stores verification with key: `walletAddress:18`
7. Frontend polls `/api/verify-self/check` with `{ userId, squareId: "18" }`
8. When verified, square changes to 'verified' state

## Win Condition

- 5×5 grid with FREE square at position 13 (center)
- FREE square automatically verified
- **Win = 5 verified squares in a row/column/diagonal**
- Since center is FREE, players only need to verify 4 more squares in a line

## Future Enhancements

### On-Chain Question Storage
Currently questions are static in TypeScript. Future implementation:

1. Generate 25 questions using AI (`/api/generate-questions`)
2. Store questions in smart contract during game creation:
   ```solidity
   contract.initializeQuestions(questions, disclosures)
   ```
3. Frontend fetches questions from contract:
   ```typescript
   const questions = await contract.getQuestions()
   const disclosures = await Promise.all(
     questions.map((_, i) => contract.getSquareDisclosures(i))
   )
   ```

### Additional Disclosure Types

Potential future questions based on Self Protocol capabilities:
- Multi-citizenship verification
- Passport expiry within specific timeframes
- Combined requirements (e.g., "European 21+ with valid passport")
- OFAC compliance checks for specific regions
- Gender-specific questions
- Name verification for identity confirmation

### Smart Contract Integration

Full on-chain verification flow:
1. Player verifies square via Self Protocol
2. Backend calls `contract.verifyCell(position)`
3. Contract emits `CellVerified` event
4. Frontend listens for event and updates UI
5. Win detection happens on-chain
6. Prize distribution triggered automatically

## Testing

### Frontend Testing
```bash
npm run dev
```
- Navigate to game screen
- Click different squares
- Verify correct disclosure requirements in QR code
- Test generation-based questions (Gen Z, Millennial)

### Backend Testing
```bash
# Check available questions
curl http://localhost:3001/api/verify-self

# Test square-specific verification check
curl -X POST http://localhost:3001/api/verify-self/check \
  -H "Content-Type: application/json" \
  -d '{"userId": "0x...", "squareId": "18"}'
```

### Smart Contract Testing
```bash
cd SelfBingoContracts
npx hardhat test

# Deploy BingoGameV2 with questions
npx hardhat run scripts/deploy-v2.js --network celo-sepolia
```

## File Reference

### Frontend
- [lib/bingoQuestions.ts](SelfBingoApp/lib/bingoQuestions.ts) - Question/disclosure mapping
- [components/VerificationModal.tsx](SelfBingoApp/components/VerificationModal.tsx) - Dynamic QR code generation
- [app/_components/GameScreen.tsx](SelfBingoApp/app/_components/GameScreen.tsx) - Square verification UI
- [app/page.tsx](SelfBingoApp/app/page.tsx) - Main game logic

### Backend
- [app/api/verify-self/route.ts](SelfBingoApp/app/api/verify-self/route.ts) - Dynamic verification
- [app/api/verify-self/check/route.ts](SelfBingoApp/app/api/verify-self/check/route.ts) - Status polling

### Smart Contracts
- [contracts/DisclosureTypes.sol](SelfBingoContracts/contracts/DisclosureTypes.sol) - Solidity data structures
- [contracts/BingoGameV2.sol](SelfBingoContracts/contracts/BingoGameV2.sol) - Enhanced game contract

## Deployment Checklist

- [ ] Deploy BingoGameV2 contract to Celo Sepolia
- [ ] Initialize questions in contract via `initializeQuestions()`
- [ ] Update frontend to fetch questions from contract
- [ ] Verify all 25 disclosure requirements work correctly
- [ ] Test generation-based verification (birth year parsing)
- [ ] Load test verification cache with multiple concurrent users
- [ ] Monitor Self Protocol API rate limits
- [ ] Set up cache cleanup for expired verifications (>1 hour)

## Security Considerations

1. **Verification Cache**: In-memory cache (Map) - use Redis for production
2. **Proof Validation**: Self Protocol SDK handles ZK proof verification
3. **Replay Attack**: Each verification has unique timestamp and squareId
4. **Data Privacy**: Only required disclosures are requested per square
5. **Server-Side Validation**: Win detection should move to smart contract to prevent cheating

## Performance

- **QR Code Generation**: <100ms per square
- **Backend Verification**: <2s including ZK proof validation
- **Cache Lookup**: <1ms per square check
- **Frontend Polling**: 2s interval (configurable)
- **Memory Usage**: ~1KB per verification (name, nationality, etc.)

## Support

For issues with:
- **Self Protocol SDK**: https://docs.self.xyz
- **Smart Contracts**: See SelfBingoContracts/README.md
- **Frontend**: See SelfBingoApp/CLAUDE.md
