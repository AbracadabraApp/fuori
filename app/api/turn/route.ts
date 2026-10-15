import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runTurn } from '@/lib/turn';
import { promptVersion, historyModeFromEnv } from '@/lib/prompts/build-turn-prompt';
import { parseTurnRequest } from '@/lib/turn-request';
import { logServerError } from '@/lib/server-log';
import { getOrCreateLearnerId } from '@/lib/learner';
import { recordTurn, recordingEnabled } from '@/lib/recording';
import { loadCharacterMemory, loadMemoryAtStart, type CharacterMemory } from '@/lib/memory';
import { tutor } from '@/content';
import { buildTutorPrompt, repliesSoFar } from '@/lib/prompts/build-tutor-prompt';


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
    // Ids in, character worked out here; sizes capped (lib/turn-request.ts)
    const parsed = parseTurnRequest(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { learnerSaid, character, transcript, conversationId, cityId } = parsed;

    // Who's talking, and what this character remembers about them (fills the
    // prompt's {relationship} line). Never blocks the reply: without it the
    // character just hasn't met them.
    let learnerId: string | null = null;
    let memory: CharacterMemory | undefined;
    if (recordingEnabled()) {
      try {
        learnerId = await getOrCreateLearnerId();
        // Mid-conversation: what they remembered when it started
        memory =
          (conversationId ? await loadMemoryAtStart(conversationId, learnerId) : null) ??
          (await loadCharacterMemory(learnerId, character.id));
      } catch (err) {
        logServerError(request, 'memory load', err);
      }
    }

    // Magda teaches with her own prompt: her memory is the study file, and she
    // gets one fact for pacing, how many replies the learner has made this lesson
    const isTutor = character.id === tutor.id;
    const tutorPrompt = isTutor
      ? buildTutorPrompt({ character, memory, replies: repliesSoFar(transcript, learnerSaid) })
      : undefined;

    const turnOutput = await runTurn({
      character,
      transcript: transcript,
      learnerSaid,
      memory,
      system: tutorPrompt?.system,
      firstTurn: tutorPrompt?.firstTurn,
    });

    // One line per turn so any reply can be traced to the prompt version that produced it
    const version = tutorPrompt ? `magda-${tutorPrompt.version}` : promptVersion();
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'turn',
        id: request.headers.get('x-fuori-id') ?? undefined,
        character: character.id,
        turn: transcript.length === 0 ? 'opening' : 'reply',
        promptVersion: version,
        history: historyModeFromEnv(),
      })
    );

    // Save the exchange so conversations can be reviewed later. Never blocks the
    // reply: recording problems are logged and the conversation carries on.
    let savedId: string | null = null;
    if (learnerId) {
      try {
        savedId = await recordTurn({
          learnerId,
          conversationId: conversationId ?? null,
          character,
          cityId,
          promptVersion: version,
          learnerSaid: transcript.length ? learnerSaid : undefined,
          reply: turnOutput,
          memory,
        });
      } catch (err) {
        logServerError(request, 'recording', err);
      }
    }

    // Return the validated output; the prompt version and conversation id travel in headers
    const headers: Record<string, string> = { 'x-prompt-version': version };
    if (savedId) headers['x-conversation-id'] = savedId;
    // Read by scripts/smoke-live.ts; invisible to learners
    if (memory) headers['x-memory'] = `${memory.visits} visits, ${memory.notes.length} notes`;
    if (tutorPrompt) headers['x-study-file'] = `${memory?.notes.length ?? 0} lines, ${memory?.visits ?? 0} lessons`;
    return NextResponse.json(turnOutput, { headers });
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
