import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseTurnRequest } from '@/lib/turn-request';
import { logServerError } from '@/lib/server-log';
import { getOrCreateLearnerId } from '@/lib/learner';
import { recordingEnabled } from '@/lib/recording';
import { takeTurn } from '@/lib/conversation/take-turn';

/** The web app's turn (cookie identity). The app uses /v1/turn; both run lib/conversation/take-turn.ts. */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Ids in, character worked out here; sizes capped (lib/turn-request.ts)
    const parsed = parseTurnRequest(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    // Who's talking. Never blocks the reply: without it the character just hasn't met them.
    let learnerId: string | null = null;
    if (recordingEnabled()) {
      try {
        learnerId = await getOrCreateLearnerId();
      } catch (err) {
        logServerError(request, 'memory load', err);
      }
    }

    const { reply, promptVersion, conversationId, memory, isTutor } = await takeTurn({
      learnerId,
      character: parsed.character,
      cityId: parsed.cityId,
      transcript: parsed.transcript,
      learnerSaid: parsed.learnerSaid,
      conversationId: parsed.conversationId,
      requestId: request.headers.get('x-fuori-id') ?? undefined,
      onSoftError: (where, err) => logServerError(request, where, err),
    });

    // Return the validated output; the prompt version and conversation id travel in headers
    const headers: Record<string, string> = { 'x-prompt-version': promptVersion };
    if (conversationId) headers['x-conversation-id'] = conversationId;
    // Read by scripts/smoke-live.ts; invisible to learners
    if (memory) headers['x-memory'] = `${memory.visits} visits, ${memory.notes.length} notes`;
    if (isTutor) headers['x-study-file'] = `${memory?.notes.length ?? 0} lines, ${memory?.visits ?? 0} lessons`;
    return NextResponse.json(reply, { headers });
  } catch (error) {
    logServerError(request, 'turn', error);

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
