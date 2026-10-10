import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL } from '@/lib/claude';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { CharacterSheet, Scene, Turn, Relationship, Level } from '@/lib/types';


// Zod schema for Claude's structured output
const TurnOutputSchema = z.object({
  understood: z.string().describe('The Italian the character understood the learner to mean'),
  it: z.string().describe("The character's reply in Italian"),
  en: z.string().describe('English translation of the reply'),
  correction: z
    .object({
      said: z.string().describe('What the learner said incorrectly'),
      better: z.string().describe('The correct way to say it'),
      why: z.string().max(100).describe('Brief explanation (under 100 chars)'),
    })
    .nullable()
    .describe('Correction if there was a real error worth noting'),
  words: z
    .array(
      z.object({
        it: z.string().describe('Italian word'),
        en: z.string().describe('English translation'),
      })
    )
    .max(2)
    .describe('New vocabulary words introduced (max 2)'),
  steps_done: z.array(z.number()).describe('Goal step indices completed in this turn'),
  hint: z
    .string()
    .nullable()
    .describe('Suggested phrase the learner could say next (only when confused or stuck)'),
  confused: z
    .boolean()
    .describe('True only if you genuinely cannot understand what they meant'),
  mood: z
    .enum(['warm', 'amused', 'busy', 'curious'])
    .describe('Your emotional tone in this reply'),
  scene_over: z
    .boolean()
    .describe('True if this is a natural ending point for the conversation'),
  memory_notes: z
    .array(z.string())
    .describe('Facts about the learner worth remembering for future conversations'),
});

type TurnOutputType = z.infer<typeof TurnOutputSchema>;


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
    const { learnerSaid, character, scene, transcript, level, relationship } = body;

    // Basic validation
    if (!character || !scene || !level) {
      return NextResponse.json(
        { error: 'Missing required fields: character, scene, level' },
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

    // Build the prompt using the prompt builder
    const prompt = buildTurnPrompt({
      character: character as CharacterSheet,
      scene: scene as Scene,
      transcript: (transcript || []) as Turn[],
      level: level as Level,
      relationship: relationship as Relationship | undefined,
      learnerSaid,
    });

    // Call Claude with structured output
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      temperature: 1.0,
      system: prompt.system,
      messages: [
        {
          role: 'user',
          content: prompt.user,
        },
      ],
      // Enable structured output with our JSON schema
      output_config: {
        format: {
          type: 'json_schema',
          schema: turnOutputJsonSchema,
        },
      },
    });

    // Extract the content
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    let parsedOutput: unknown;
    try {
      parsedOutput = JSON.parse(content.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', content.text);
      throw new Error('Claude returned invalid JSON');
    }

    // Validate with Zod schema
    // The API schema can't express length limits, so enforce them here
    const raw = parsedOutput as Record<string, unknown>;
    if (Array.isArray(raw.words)) raw.words = raw.words.slice(0, 2);
    const corr = raw.correction as { why?: unknown } | null | undefined;
    if (corr && typeof corr.why === 'string') corr.why = corr.why.slice(0, 100);

    const turnOutput = TurnOutputSchema.parse(raw);

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
