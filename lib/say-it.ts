/**
 * Say it in English (docs/beginner-scaffolding.md; Josh, 2026-10-23): the
 * learner says in English what they want to say; this writes the one line in
 * the language they read out loud to the character, at their level (the gist,
 * not word for word). Prompt in content/<country>/prompts/say-it.md. Used by
 * POST /v1/say-it. Server-side only.
 */
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText, WAITING } from './claude';
import { readPromptFile, fill } from './prompts/template';
import { language } from '@/content';
import type { Level } from './onboarding';
import type { CharacterSheet, Turn } from './types';

// sendAsSaid: no line to write. What Whisper labelled English is in fact the
// learned language (2026-10-23: Josh's own Italian was labelled English in 4
// of 5 turns), or too short or unclear to tell what they meant ("Okay", "C.").
// The app then sends it to the character as said; line and en are empty.
// When in doubt it goes to the character, who helps in role (CLAUDE.md)
const Line = z.object({ sendAsSaid: z.boolean(), line: z.string(), en: z.string() }).refine((l) => l.sendAsSaid || l.line.trim().length > 0, 'line is required unless sendAsSaid');
export type SayItLine = z.infer<typeof Line>;

const schema = { type: 'object', additionalProperties: false, properties: { sendAsSaid: { type: 'boolean' }, line: { type: 'string' }, en: { type: 'string' } }, required: ['sendAsSaid', 'line', 'en'] };

export function sayItPromptVersion(): string {
  return readPromptFile('say-it.md').version;
}

/** `asLearned`: the same recording heard as the learned language, when there is one */
export function buildSayItPrompt(character: CharacterSheet, transcript: Turn[], english: string, level: Level | null, asLearned?: string): { system: string; user: string } {
  const system = fill(readPromptFile('say-it.md').block('System prompt'), {
    language: language.name,
    name: character.name,
    role: character.role,
    level: level ?? 'beginner',
    formality: `"${language.formality.formal}", unless ${character.name} has been using "${language.formality.informal}"`,
  });
  const so = transcript.map((t) => `${t.who === 'npc' ? character.name : 'Person'}: ${t.transcript}`).join('\n');
  const heard = asLearned?.trim()
    ? `Speech-to-text heard their turn as English: ${english}\nThe same recording heard as ${language.name}: ${asLearned.trim()}`
    : `What they want to say, in English: ${english}`;
  return { system, user: `${so || '(nothing said yet)'}\n\n${heard}` };
}

export async function writeSayIt(character: CharacterSheet, transcript: Turn[], english: string, level: Level | null, asLearned?: string): Promise<SayItLine> {
  const prompt = buildSayItPrompt(character, transcript, english, level, asLearned);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    // No thinking step (2026-10-23: it took 2–4 s on Josh's phone, on top of
    // transcribing; Learn went 9 s → 5 s the same way). As the turn call:
    // between_tools, not disabled
    thinking: { type: 'between_tools' },
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema } },
  }, WAITING);
  if (response.stop_reason === 'max_tokens') throw new Error(`Say it hit max_tokens (${response.usage.output_tokens} tokens)`);
  return Line.parse(JSON.parse(replyText(response)));
}
