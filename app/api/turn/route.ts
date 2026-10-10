import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runTurn } from '@/lib/turn';
import { CharacterSheet, Turn } from '@/lib/types';


export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { learnerSaid, character, transcript } = body;

    // Basic validation
    if (!character) {
      return NextResponse.json(
        { error: 'Missing required field: character' },
        { status: 400 }
      );
    }

    // For non-first turns, learnerSaid is required
    if (transcript && transcript.length > 0 && !learnerSaid) {
      return NextResponse.json(
        { error: 'learnerSaid is required for non-first turns' },
        { status: 400 }
      );
    }

    const turnOutput = await runTurn({
      character: character as CharacterSheet,
      transcript: (transcript || []) as Turn[],
      learnerSaid,
    });

    // Return the validated output
    return NextResponse.json(turnOutput);
  } catch (error) {
    console.error('Turn API error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid response format from Claude',
          details: error.issues,
        },
        { status: 500 }
      );
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: 'Claude API error',
          details: error.message,
          status: error.status,
        },
        { status: error.status || 500 }
      );
    }

    // Generic error handler
    return NextResponse.json(
      {
        error: 'Failed to process turn',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
