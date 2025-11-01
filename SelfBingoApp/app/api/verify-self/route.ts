import { NextRequest, NextResponse } from 'next/server'
import { SelfBackendVerifier, DefaultConfigStore, AllIds } from '@selfxyz/core'
import { getDisclosuresForSquare, requiresVerification, type DisclosureRequirement } from '@/lib/bingoQuestions'
import { storeVerificationOnChain } from '@/lib/contract'

// Note: For square-specific verification, we use dynamic config based on squareId
// This is a fallback verifier for initial age verification (payment screen)
const defaultSelfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || 'self-bingo', // scope string
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`, // verification endpoint
  process.env.NEXT_PUBLIC_SELF_USE_MOCK === 'true', // mockPassport (false for mainnet)
  AllIds, // allowed attestation IDs
  new DefaultConfigStore({
    minimumAge: 18, // Minimum age for payment screen
    excludedCountries: [],
    ofac: false
  }),
  'hex' // user identifier type (ethereum address)
)

/**
 * Create a Self Backend Verifier with dynamic disclosure config
 */
function createVerifierForSquare(squareId: string): SelfBackendVerifier {
  console.log(`🔐 Creating verifier for square ${squareId}`)

  const disclosures = getDisclosuresForSquare(squareId)
  console.log(`📋 Retrieved disclosure requirements for square ${squareId}:`, disclosures)

  // Convert TypeScript disclosure to Self Protocol config format
  // IMPORTANT: minimumAge must always be 18 to match the initial verification circuit
  // Self Protocol validates that the config matches the circuit config from the proof
  const config = {
    minimumAge: disclosures.minimumAge || 18, // Always 18 minimum, matching initial verification
    excludedCountries: (disclosures.excludedCountries || []) as any[], // Type assertion for Country3LetterCode[]
    ofac: disclosures.ofac ?? false,
    // Additional fields can be validated in the response
  }

  console.log(`🔧 Verifier config for square ${squareId}:`, config)
  console.log(`🎯 Scope:`, `${process.env.NEXT_PUBLIC_SELF_SCOPE || 'self-bingo'}-square-${squareId}`)
  console.log(`🌐 Endpoint:`, `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`)
  console.log(`🔨 Mock mode:`, process.env.NEXT_PUBLIC_SELF_USE_MOCK === 'true')

  return new SelfBackendVerifier(
    `${process.env.NEXT_PUBLIC_SELF_SCOPE || 'self-bingo'}-square-${squareId}`,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`,
    process.env.NEXT_PUBLIC_SELF_USE_MOCK === 'true',
    AllIds,
    new DefaultConfigStore(config),
    'hex'
  )
}

/**
 * Parse birth year from Self Protocol date of birth string (YYMMDD format)
 */
function parseBirthYear(dateOfBirth: string): number | null {
  if (!dateOfBirth || dateOfBirth.length < 6) return null

  // Date of birth is in YYMMDD format (e.g., "900315" for March 15, 1990)
  const yearStr = dateOfBirth.substring(0, 2)
  const year = parseInt(yearStr, 10)

  // Determine century: if year > current year's last 2 digits, assume 1900s, else 2000s
  const currentYear = new Date().getFullYear()
  const currentYearLast2 = currentYear % 100

  const fullYear = year > currentYearLast2 ? 1900 + year : 2000 + year

  return fullYear
}

/**
 * Validate disclosed data against square requirements
 */
function validateDisclosedData(
  discloseOutput: any,
  requirements: DisclosureRequirement
): { valid: boolean; reason?: string } {
  // Check name if required
  if (requirements.name && !discloseOutput.name) {
    return { valid: false, reason: 'Name verification required but not provided' }
  }

  // Check gender if required
  if (requirements.gender && !discloseOutput.gender) {
    return { valid: false, reason: 'Gender verification required but not provided' }
  }

  // Check date of birth if required
  if (requirements.date_of_birth && !discloseOutput.dateOfBirth) {
    return { valid: false, reason: 'Date of birth verification required but not provided' }
  }

  // Check birth year range for generation verification
  if (requirements.birth_year_range) {
    const birthYear = parseBirthYear(discloseOutput.dateOfBirth)

    if (!birthYear) {
      return { valid: false, reason: 'Could not parse birth year from date of birth' }
    }

    const { min, max } = requirements.birth_year_range
    if (birthYear < min || birthYear > max) {
      return {
        valid: false,
        reason: `Birth year must be between ${min} and ${max} (your birth year: ${birthYear})`
      }
    }

    console.log(`✅ Birth year ${birthYear} is within range ${min}-${max}`)
  }

  // Check passport number if required
  if (requirements.passport_number && !discloseOutput.idNumber) {
    return { valid: false, reason: 'Passport number verification required but not provided' }
  }

  // Check expiry date if required
  if (requirements.expiry_date && !discloseOutput.expiryDate) {
    return { valid: false, reason: 'Passport expiry date verification required but not provided' }
  }

  // Check issuing state if specific states required
  if (Array.isArray(requirements.issuing_state) && requirements.issuing_state.length > 0) {
    const issuingState = discloseOutput.issuingState
    if (!issuingState || !requirements.issuing_state.includes(issuingState)) {
      return {
        valid: false,
        reason: `Passport must be issued by one of: ${requirements.issuing_state.join(', ')}`
      }
    }
  }

  // Check nationality if specific countries required
  if (Array.isArray(requirements.nationality) && requirements.nationality.length > 0) {
    const nationality = discloseOutput.nationality
    if (!nationality || !requirements.nationality.includes(nationality)) {
      return {
        valid: false,
        reason: `Must be a citizen of one of: ${requirements.nationality.join(', ')}`
      }
    }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  console.log('\n========================================')
  console.log('🚀 /api/verify-self POST endpoint hit!')
  console.log('📍 Request URL:', request.url)
  console.log('🔗 Origin:', request.headers.get('origin'))
  console.log('🔗 Referer:', request.headers.get('referer'))
  console.log('🌐 User-Agent:', request.headers.get('user-agent'))
  console.log('⏰ Timestamp:', new Date().toISOString())
  console.log('📋 All headers:', Object.fromEntries(request.headers.entries()))
  console.log('========================================\n')

  try {
    const body = await request.json()
    console.log('📦 Request body keys:', Object.keys(body))

    const { attestationId, proof, publicSignals, userContextData } = body

    console.log('Self verification request received:', {
      attestationId,
      hasProof: !!proof,
      hasPublicSignals: !!publicSignals,
      userContextData
    })

    // Extract squareId from userContextData to determine which verifier to use
    let squareId: string | null = null
    try {
      const decoded = Buffer.from(userContextData, 'hex').toString('utf8')
      const jsonMatch = decoded.match(/\{.*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        squareId = parsed.squareId || null
        console.log('📝 Parsed userDefinedData:', parsed)
        console.log('🎯 Square ID:', squareId)
      }
    } catch (err) {
      console.log('⚠️ Could not parse squareId from userContextData, using default verifier')
    }

    // Select verifier based on whether this is square-specific verification
    const verifier = squareId
      ? createVerifierForSquare(squareId)
      : defaultSelfBackendVerifier

    console.log(`🔍 Using ${squareId ? `square-specific verifier (${squareId})` : 'default verifier'}`)

    // Verify the attestation
    const result = await verifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    )

    console.log('Self verification result:', {
      isValid: result.isValidDetails.isValid,
      isMinimumAgeValid: result.isValidDetails.isMinimumAgeValid,
      hasDiscloseOutput: !!result.discloseOutput
    })

    // Log the full discloseOutput to debug
    console.log('🔍 Full discloseOutput:', JSON.stringify(result.discloseOutput, null, 2))

    // Check verification details
    const { isValid, isMinimumAgeValid } = result.isValidDetails

    if (!isValid) {
      return NextResponse.json({
        status: 'error',
        result: false,
        reason: 'Verification failed - Invalid proof or signature'
      }, { status: 200 })
    }

    // If this is square-specific verification, validate additional disclosure requirements
    if (squareId) {
      const requirements = getDisclosuresForSquare(squareId)
      console.log(`🔐 Validating square ${squareId} requirements:`, requirements)

      // Check minimum age if required
      if (requirements.minimumAge && !isMinimumAgeValid) {
        return NextResponse.json({
          status: 'error',
          result: false,
          reason: `Must be at least ${requirements.minimumAge} years old`
        }, { status: 200 })
      }

      // Validate additional disclosed data
      const validation = validateDisclosedData(result.discloseOutput, requirements)
      if (!validation.valid) {
        console.log(`❌ Square ${squareId} validation failed:`, validation.reason)

        // Store failed verification in cache
        try {
          global.verificationCache = global.verificationCache || new Map()
          const decoded = Buffer.from(userContextData, 'hex').toString('utf8')
          const match = decoded.match(/0x[a-fA-F0-9]{40}/)
          if (match) {
            const walletAddr = match[0].toLowerCase()
            const key = `${walletAddr}:${squareId}`
            global.verificationCache.set(key, {
              verified: false,
              reason: validation.reason,
              timestamp: Date.now()
            })
            console.log(`💾 Stored failed verification for key: ${key}`)
          }
        } catch (err) {
          console.error('Failed to store failed verification:', err)
        }

        return NextResponse.json({
          status: 'error',
          result: false,
          reason: validation.reason
        }, { status: 200 })
      }

      console.log(`✅ Square ${squareId} validation passed!`)
    } else {
      // Default verification (payment screen) requires minimum age
      if (!isMinimumAgeValid) {
        return NextResponse.json({
          status: 'error',
          result: false,
          reason: 'Verification failed - User does not meet minimum age requirement (18+)'
        }, { status: 200 })
      }
    }

    // Extract user identifier (if available in disclosure output)
    const userIdentifier = (result.discloseOutput as any)?.userIdentifier

    console.log('👤 Extracted userIdentifier:', userIdentifier)
    console.log('🔍 Full discloseOutput keys:', result.discloseOutput ? Object.keys(result.discloseOutput) : 'null')

    // Extract wallet address from userContextData (hex encoded)
    let walletAddress: string | null = null
    try {
      // The userContextData contains the wallet address
      // It's hex-encoded, starts with userId
      const decoded = Buffer.from(userContextData, 'hex').toString('utf8')
      console.log('🔓 Decoded userContextData:', decoded)

      // Try to parse JSON from decoded data
      const jsonMatch = decoded.match(/\{.*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('📝 Parsed user data:', parsed)
      }

      // Extract address from publicSignals or userContextData hex
      // The address is in the userContextData as hex (after the attestation ID)
      const hexData = userContextData.slice(64) // Skip first 32 bytes (attestationId)
      const addressHex = '0x' + hexData.slice(24, 64) // Extract 20-byte address
      walletAddress = addressHex.toLowerCase()
      console.log('💼 Extracted wallet address:', walletAddress)
    } catch (err) {
      console.error('Failed to extract wallet address:', err)
    }

    // Store verification result for polling endpoint using wallet address
    if (walletAddress) {
      global.verificationCache = global.verificationCache || new Map()

      if (squareId) {
        // Square-specific verification - store with composite key
        const cacheKey = `${walletAddress}:${squareId}`
        global.verificationCache.set(cacheKey, {
          verified: true,
          squareId: squareId,
          ageVerified: isMinimumAgeValid,
          timestamp: Date.now(),
          disclosedData: {
            name: result.discloseOutput?.name,
            nationality: result.discloseOutput?.nationality,
            issuingState: result.discloseOutput?.issuingState,
            gender: result.discloseOutput?.gender,
            dateOfBirth: result.discloseOutput?.dateOfBirth,
            expiryDate: result.discloseOutput?.expiryDate
          }
        })
        console.log(`✅ Stored square verification for wallet:${walletAddress}, square:${squareId}`)

        // Store verification on-chain (V3)
        const gameAddress = process.env.NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS
        if (gameAddress) {
          console.log(`🔗 Storing V3 verification on-chain for game ${gameAddress}...`)
          const squareNumber = parseInt(squareId)
          const onChainResult = await storeVerificationOnChain(gameAddress, walletAddress, squareNumber)

          if (onChainResult.success) {
            console.log(`✅ V3 on-chain storage successful! TX: ${onChainResult.txHash}`)
          } else {
            console.error(`❌ V3 on-chain storage failed: ${onChainResult.error}`)
          }
        } else {
          console.warn('⚠️  NEXT_PUBLIC_CURRENT_GAME_V3_ADDRESS not set, skipping on-chain storage')
        }
      } else {
        // Initial age verification (payment screen)
        global.verificationCache.set(walletAddress, {
          verified: true,
          ageVerified: isMinimumAgeValid,
          timestamp: Date.now()
        })
        console.log('✅ Stored age verification for wallet:', walletAddress)
      }

      console.log('🔞 Age verified (18+):', isMinimumAgeValid)
      console.log('🗂️ Cache size:', global.verificationCache.size)
      console.log('🗂️ Cache keys:', Array.from(global.verificationCache.keys()))
    } else {
      console.log('❌ Could not store - missing walletAddress')
      console.log('   walletAddress:', walletAddress)
    }

    // Return successful verification with disclosed data
    return NextResponse.json({
      status: 'success',
      result: true,
      data: {
        ageVerified: isMinimumAgeValid,
        userIdentifier: userIdentifier,
        // Include other disclosed fields if needed
        name: result.discloseOutput?.name,
        nationality: result.discloseOutput?.nationality
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Self verification error:', error)

    return NextResponse.json({
      status: 'error',
      result: false,
      reason: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 200 })
  }
}

// Handle GET requests (for health check)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Self Protocol verification endpoint is active',
    scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'self-bingo',
    minimumAge: 18
  })
}
