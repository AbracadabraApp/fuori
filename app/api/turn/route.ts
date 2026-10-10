import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL } from '@/lib/claude';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { CharacterSheet, Turn } from '@/lib/types';


// M1 uses radically simple output - just Italian and English
const TurnOutputSchema = z.object({
  it: z.string().describe("The character's reply in Italian"),
  en: z.string().describe('English translation of the reply'),
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

    // Build the prompt using the prompt builder
    const prompt = buildTurnPrompt({
      character: character as CharacterSheet,
      transcript: (transcript || []) as Turn[],
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
    const turnOutput = TurnOutputSchema.parse(parsedOutput);

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
