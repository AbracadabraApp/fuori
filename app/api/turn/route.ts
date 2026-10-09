import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Zod schema for Claude's response
const TurnOutputSchema = z.object({
  understood: z.string(),
  it: z.string(),
  en: z.string(),
  correction: z
    .object({
      said: z.string(),
      better: z.string(),
      why: z.string().max(100),
    })
    .nullable(),
  words: z
    .array(
      z.object({
        it: z.string(),
        en: z.string(),
      })
    )
    .max(2),
  steps_done: z.array(z.number()),
  hint: z.string().nullable(),
  confused: z.boolean(),
  scene_over: z.boolean(),
  memory_notes: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      learnerSaid,
      character,
      conversationHistory = [],
      goal = [],
      showEnglish = true,
      learnerLevel = 'A1',
    } = body;

    // Build conversation history for context
    const conversationContext = conversationHistory
      .map((turn: any) => {
        if (turn.who === 'learner') {
          return `Learner: ${turn.transcript}`;
        } else {
          return `You: ${turn.transcript}`;
        }
      })
      .join('\n');

    const isFirstTurn = conversationHistory.length === 0;

    // Construct the prompt
    const systemPrompt = `You are ${character.name}, a ${character.age}-year-old ${character.role} in ${character.city}.

PERSONALITY:
${character.personality.traits.join(', ')}
You care about: ${character.personality.caresAbout.join(', ')}

SPEECH STYLE:
- Formality: ${character.speech.formality}
- Pace: ${character.speech.pace}
- Description: ${character.speech.description}
${character.speech.regionalisms.length > 0 ? `- Regional touches (use sparingly at A1-A2): ${character.speech.regionalisms.join(', ')}` : ''}

SETTING:
${character.appearance.setting}

YOUR JOB:
1. Stay entirely in Italian (never switch to English unprompted)
2. Speak at the learner's level (${learnerLevel}) - simple present tense, short sentences, clear vocabulary
3. Correct errors naturally by recasting: if they say "voglio un caffè", respond "Ah, *vorrei* un caffè! Certo!" (never say "you should say...")
4. Stay in character - you're not a teacher, you're a real person doing your job
5. Help them feel successful while gently improving their Italian

LEVEL GUIDANCE FOR ${learnerLevel}:
- A1: Present tense only, 3-5 word sentences, very basic vocabulary, slow and patient
- A1+: Can add simple past (passato prossimo), slightly longer sentences
- A2: Present, past, imperfetto for descriptions, normal pace, fuller vocabulary
- Adapt in real-time: if they're struggling, simplify; if they're confident, add a bit more

${goal.length > 0 ? `\nLIGHT GOALS (subtle, don't force): ${goal.join('; ')}` : ''}`;

    const userPrompt = isFirstTurn
      ? `This is the start of the conversation. Greet the learner warmly and naturally, as ${character.name} would in this situation. Keep it simple and welcoming.`
      : `Conversation so far:
${conversationContext}

Learner just said: "${learnerSaid}"

Respond naturally as ${character.name}. If there was an error worth correcting, note it (but correct it naturally in your response, don't lecture). If you genuinely didn't understand, set "confused" to true and ask for clarification.`;

    // Call Claude with structured output
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1024,
      temperature: 1.0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // For M1, manually structure the response since we're not using structured outputs yet
    // In M2, use Claude's output_config with the Zod schema
    const text = content.text;

    // Simple heuristic parsing for M1 - will improve in M2
    const turnOutput = {
      understood: learnerSaid, // Claude reconstructs this; for M1 just echo
      it: text, // Claude's response
      en: '', // Translation if showEnglish is on; for M1 skip or do separately
      correction: null, // Parse from response; for M1 skip
      words: [], // New words; for M1 skip
      steps_done: [], // Track goal completion; for M1 skip
      hint: null,
      confused: false,
      scene_over: false,
      memory_notes: [], // Facts to remember; for M1 skip
    };

    return NextResponse.json(turnOutput);
  } catch (error) {
    console.error('Turn API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process turn',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
