import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Self Bingo Game Join Endpoint
 *
 * This endpoint handles x402 payment verification for joining a bingo game.
 * It verifies the payment signature and settles the transaction on-chain.
 */

interface PaymentEnvelope {
  network: string;
  authorization: {
    from: string;
    to: string;
    value: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
  };
  signature: string;
}

interface SettlementResponse {
  success: boolean;
  transaction?: string;
  blockNumber?: number;
  explorer?: string;
  payer?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Game Join] Processing payment for game entry...');

    // Get payment configuration from environment
    const payTo = process.env.NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS as `0x${string}`;
    const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || 'http://localhost:3005';
    const network = process.env.NEXT_PUBLIC_NETWORK || 'celo';
    const entryFeeUsd = process.env.NEXT_PUBLIC_ENTRY_FEE_USD || '0.01';

    // Validate configuration
    if (!payTo) {
      return NextResponse.json(
        { error: 'Server configuration error', message: 'Payment wallet not configured' },
        { status: 500 }
      );
    }

    // Get payment header
    const paymentHeader = request.headers.get('x-payment');

    if (!paymentHeader) {
      return NextResponse.json(
        {
          error: 'Payment Required',
          message: 'Missing X-Payment header',
          details: {
            price: entryFeeUsd,
            network,
            payTo,
          },
        },
        { status: 402 }
      );
    }

    // Parse payment envelope
    let envelope: PaymentEnvelope;
    try {
      envelope = JSON.parse(paymentHeader);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid Payment',
          message: 'X-Payment header must be valid JSON',
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 }
      );
    }

    // Validate payment envelope structure
    if (!envelope.network || !envelope.authorization || !envelope.signature) {
      return NextResponse.json(
        {
          error: 'Invalid Payment',
          message: 'Payment envelope missing required fields (network, authorization, signature)',
        },
        { status: 400 }
      );
    }

    // Verify network matches
    if (envelope.network !== network) {
      return NextResponse.json(
        {
          error: 'Invalid Payment',
          message: `Network mismatch. Expected ${network}, got ${envelope.network}`,
        },
        { status: 400 }
      );
    }

    // Verify payment is to the correct address
    if (envelope.authorization.to.toLowerCase() !== payTo.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Invalid Payment',
          message: `Payment must be sent to ${payTo}`,
        },
        { status: 400 }
      );
    }

    // Verify payment amount matches entry fee
    const expectedAmount = (parseFloat(entryFeeUsd) * 1_000_000).toString(); // Convert USD to USDC smallest unit (6 decimals)
    if (envelope.authorization.value !== expectedAmount) {
      return NextResponse.json(
        {
          error: 'Invalid Payment',
          message: `Incorrect payment amount. Expected ${expectedAmount} (${entryFeeUsd} USDC), got ${envelope.authorization.value}`,
        },
        { status: 400 }
      );
    }

    console.log('[Game Join] Payment envelope validated, verifying with facilitator...');

    // Prepare payload for facilitator
    const celoPayload = {
      authorization: envelope.authorization,
      signature: envelope.signature,
      network: envelope.network,
    };

    // Verify payment with facilitator
    try {
      const verificationResponse = await axios.post(
        `${facilitatorUrl}/verify-celo`,
        celoPayload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!verificationResponse.data || !verificationResponse.data.valid) {
        console.error('[Game Join] Payment verification failed:', verificationResponse.data);
        return NextResponse.json(
          {
            error: 'Payment Verification Failed',
            message: verificationResponse.data?.error || 'Invalid payment signature',
            details: verificationResponse.data,
          },
          { status: 402 }
        );
      }

      console.log('[Game Join] Payment verified successfully');
      console.log(`   From: ${envelope.authorization.from}`);
      console.log(`   Amount: ${envelope.authorization.value} (${entryFeeUsd} USDC)`);

      // Settle the payment (execute on-chain transfer)
      console.log('[Game Join] Settling payment on-chain...');

      const settlementResponse = await axios.post<SettlementResponse>(
        `${facilitatorUrl}/settle-celo`,
        celoPayload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000, // 30 second timeout for blockchain transaction
        }
      );

      if (!settlementResponse.data || !settlementResponse.data.success) {
        console.error('[Game Join] Payment settlement failed:', settlementResponse.data);
        return NextResponse.json(
          {
            error: 'Payment Settlement Failed',
            message: settlementResponse.data?.error || 'Failed to execute payment on-chain',
            details: settlementResponse.data,
          },
          { status: 402 }
        );
      }

      console.log('[Game Join] Payment settled successfully!');
      console.log(`   Transaction: ${settlementResponse.data.transaction}`);
      console.log(`   Block: ${settlementResponse.data.blockNumber}`);

      // TODO: Create game session in database
      // TODO: Add player to active game
      // TODO: Generate bingo card for player

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Payment verified and settled. Welcome to Self Bingo!',
        game: {
          entryFee: entryFeeUsd,
          network,
          player: envelope.authorization.from,
        },
        payment: {
          transaction: settlementResponse.data.transaction,
          blockNumber: settlementResponse.data.blockNumber,
          explorer: settlementResponse.data.explorer,
          amount: entryFeeUsd,
        },
      });
    } catch (facilitatorError) {
      console.error('[Game Join] Facilitator error:', facilitatorError);

      if (axios.isAxiosError(facilitatorError)) {
        if (facilitatorError.code === 'ECONNREFUSED') {
          return NextResponse.json(
            {
              error: 'Service Unavailable',
              message: 'Payment facilitator is not available. Please try again later.',
              facilitator: facilitatorUrl,
            },
            { status: 503 }
          );
        }

        if (facilitatorError.response) {
          return NextResponse.json(
            {
              error: 'Payment Verification Error',
              message: facilitatorError.response.data?.error || 'Failed to verify payment',
              details: facilitatorError.response.data,
            },
            { status: facilitatorError.response.status }
          );
        }
      }

      throw facilitatorError;
    }
  } catch (error) {
    console.error('[Game Join] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to process game join request',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
