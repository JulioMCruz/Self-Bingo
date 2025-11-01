import { NextRequest, NextResponse } from 'next/server'

// Global verification cache type definition
declare global {
  var verificationCache: Map<string, {
    verified: boolean
    squareId?: string
    ageVerified?: boolean
    timestamp: number
    reason?: string
    disclosedData?: {
      name?: string
      nationality?: string
      issuingState?: string
      gender?: string
      dateOfBirth?: string
      expiryDate?: string
    }
  }> | undefined
}

export async function POST(request: NextRequest) {
  try {
    const { userId, squareId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        verified: false,
        error: 'userId is required'
      }, { status: 400 })
    }

    // Initialize cache if not exists
    global.verificationCache = global.verificationCache || new Map()

    // Normalize wallet address to lowercase
    const normalizedUserId = userId.toLowerCase()

    // Build cache key - include squareId if checking square-specific verification
    const cacheKey = squareId ? `${normalizedUserId}:${squareId}` : normalizedUserId

    console.log(`🔍 Checking verification for key: ${cacheKey}`)
    console.log(`🔍 Looking for squareId: ${squareId || 'none (age verification)'}`)

    // Check if verification exists
    const verification = global.verificationCache.get(cacheKey)

    if (verification) {
      // Clean up old entries (older than 1 hour)
      const oneHourAgo = Date.now() - 3600000
      if (verification.timestamp < oneHourAgo) {
        global.verificationCache.delete(cacheKey)
        console.log(`⏰ Verification expired for ${cacheKey}`)
        return NextResponse.json({ verified: false })
      }

      // IMPORTANT: If checking for square verification, only return true if squareId matches
      if (squareId && verification.squareId !== squareId) {
        console.log(`⚠️ Verification found but squareId mismatch: expected ${squareId}, got ${verification.squareId}`)
        return NextResponse.json({ verified: false })
      }

      console.log(`✅ Verification found for ${cacheKey}:`, {
        verified: verification.verified,
        squareId: verification.squareId,
        ageVerified: verification.ageVerified,
        failed: !verification.verified,
        reason: verification.reason
      })

      // Return verification status (including failures)
      return NextResponse.json({
        verified: verification.verified,
        squareId: verification.squareId,
        ageVerified: verification.ageVerified,
        failed: !verification.verified,
        reason: verification.reason,
        disclosedData: verification.disclosedData
      })
    }

    // No verification found
    console.log(`❌ No verification found for ${cacheKey}`)
    return NextResponse.json({ verified: false })

  } catch (error) {
    console.error('Error checking verification:', error)
    return NextResponse.json({
      verified: false,
      error: 'Failed to check verification status'
    }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Verification check endpoint is active',
    cacheSize: global.verificationCache?.size || 0
  })
}
