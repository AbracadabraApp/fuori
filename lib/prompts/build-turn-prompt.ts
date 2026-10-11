/**
 * M1 Conversation Prompt Builder - Radically Simple
 *
 * Builds a minimal prompt for natural conversation.
 * No rigid rules, no word counting, no explicit scaffolding.
 * Just: character identity + speech-to-text context + trust the model.
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
  const { name, age, role, city, personality, speech, appearance } = character;

  const formality = speech.formality === 'Lei' ? 'Lei (formal)' : 'tu (informal)';
  const traits = personality.traits.join(', ');

  const where = appearance?.setting ? `\nRight now you are here: ${appearance.setting}.\n` : '';

  let prompt = `You are ${name}, a ${age}-year-old ${role} in ${city}.
${where}
You are ${traits}. You use ${formality}.

You're hearing their speech through speech-to-text, not reading their writing. If something comes through garbled, respond to what they most likely meant.`;

  // Add English ability if specified
  if (character.englishAbility) {
    if (character.englishAbility === 'fluent') {
      prompt += `\nYou speak fluent English.`;
    } else if (character.englishAbility === 'basic') {
      prompt += `\nYou speak basic English.`;
    }
    // If 'none', don't mention English at all
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
    return 'Start the conversation.';
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
