/**
 * M1 Conversation Prompt Builder - Radically Simple
 *
 * Builds a minimal prompt for natural conversation.
 * No rigid rules, no word counting, no explicit scaffolding.
 * Just: character info + "match their level" + natural help.
 *
 * Based on docs/M1-CONVERSATION-MODEL.md
 */

import type { CharacterSheet, Turn } from '../types';

interface BuildTurnPromptParams {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
}

interface TurnPrompt {
  system: string;
  user: string;
}

/**
 * Builds the complete prompt for a conversation turn
 */
export function buildTurnPrompt(params: BuildTurnPromptParams): TurnPrompt {
  const { character, transcript, learnerSaid } = params;

  const isFirstTurn = transcript.length === 0;

  // Build simple system prompt
  const system = buildSystemPrompt(character);

  // Build user message with transcript
  const user = buildUserMessage(transcript, learnerSaid, isFirstTurn);

  return {
    system,
    user,
  };
}

/**
 * Simple character-based system prompt
 */
function buildSystemPrompt(character: CharacterSheet): string {
  const { name, age, role, city, personality, speech } = character;

  const formality = speech.formality === 'Lei' ? 'Lei (formal)' : 'tu (informal)';
  const traits = personality.traits.join(', ');

  let prompt = `You are ${name}, a ${age}-year-old ${role} in ${city}.

You are ${traits}. You use ${formality}.

This person is learning Italian. Match their level - if they use simple Italian, keep it simple. If they use more sophisticated Italian, follow their lead.

When they say "ripeti", repeat what you just said.
When they struggle, simplify naturally.
Stay in character. Speak Italian.`;

  // Add English ability if specified
  if (character.englishAbility) {
    if (character.englishAbility === 'fluent') {
      prompt += `\n\nYou speak fluent English. If they ask for help in English, you can briefly explain in English, but guide them back to Italian immediately.`;
    } else if (character.englishAbility === 'basic') {
      prompt += `\n\nYou speak basic English - just enough for simple phrases. If they're really stuck, you can try simple English words, but Italian is easier for you.`;
    } else if (character.englishAbility === 'none') {
      prompt += `\n\nYou don't speak English. If they ask for English help, respond in simple Italian - maybe slower, with gestures, but you can't help in English.`;
    }
  }

  prompt += `\n\nRespond with JSON:
{ "it": "your reply in Italian", "en": "English translation" }`;

  return prompt;
}

/**
 * User message with transcript and current turn
 */
function buildUserMessage(
  transcript: Turn[],
  learnerSaid: string | undefined,
  isFirstTurn: boolean
): string {
  if (isFirstTurn) {
    return 'Start the conversation. Greet them naturally for your character.';
  }

  let content = '';

  // Show previous conversation if there is any
  if (transcript.length > 0) {
    content += 'Previous conversation:\n\n';
    transcript.forEach((turn) => {
      if (turn.who === 'npc') {
        content += `You: ${turn.transcript}\n`;
      } else {
        content += `Them: ${turn.transcript}\n`;
      }
    });
    content += '\n';
  }

  // Current turn
  content += `They just said: "${learnerSaid}"\n\n`;
  content += 'Respond naturally as your character would.';

  return content;
}
