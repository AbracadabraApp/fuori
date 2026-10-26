/**
 * Beginner level dialogue (docs/beginner-scaffolding.md → Beginner level
 * dialogue; Josh, 2026-10-25: N5, "build a version you can play"). For a
 * Beginner the character answers in parts: brief spoken English to set the
 * scene and explain, and in the language the words worth keeping, one
 * question, and whole-sentence answers to say back. The app speaks the whole
 * turn in the character's voice and shows the parts in the language as
 * bubbles; the English is heard, not shown.
 *
 * Prompt: content/<country>/prompts/beginner.md (trial versions in
 * docs/prompt-trials.md). Replaces the character prompt for Beginners only;
 * Magda keeps hers. `line` (everything she says, in order: the answers to
 * say back aren't in it) and `en` are derived from the parts, so saving,
 * memory, Learn and the voice work as for any turn.
 */
import { z } from 'zod';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { loadTemplate, relationshipLine, personLine, type RememberedLearner } from '@/lib/prompts/build-turn-prompt';
import { cities, language } from '@/content';
import type { CharacterSheet, Gender, Turn } from '@/lib/types';
import type { Laps } from '@/lib/timing';

export const PART_KINDS = ['english', 'word', 'question', 'answer'] as const;
export type PartKind = (typeof PART_KINDS)[number];
export interface Part {
  kind: PartKind;
  text: string;
  /** English for a part in the language; empty for an english part */
  en: string;
}

const PartsSchema = z.object({
  parts: z.array(z.object({ kind: z.enum(PART_KINDS), text: z.string(), en: z.string() })).min(1),
});

export const partsJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['parts'],
  properties: {
    parts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'text', 'en'],
        properties: { kind: { type: 'string', enum: [...PART_KINDS] }, text: { type: 'string' }, en: { type: 'string' } },
      },
    },
  },
};

export function beginnerPromptVersion(): string {
  return `beginner-${readPromptFile('beginner.md').version}`;
}

/**
 * What she says, in order (what the voice says and the transcript keeps), and
 * its English. The answers aren't in it: they're for the learner to say, shown
 * on their turn, not read out first (Josh, 2026-10-25)
 */
export function lineFromParts(parts: Part[]): { line: string; en: string } {
  const spoken = parts.filter((p) => p.kind !== 'answer');
  const said = spoken.map((p) => p.text.trim()).filter(Boolean);
  const en = spoken.map((p) => (p.kind === 'english' ? p.text : p.en).trim()).filter(Boolean);
  return { line: said.join(' '), en: en.join(' ') };
}

/** Empty parts dropped, so the app never shows an empty bubble */
export function tidyParts(parts: Part[]): Part[] {
  return parts.map((p) => ({ ...p, text: p.text.trim(), en: p.en.trim() })).filter((p) => p.text);
}

export function buildBeginnerPrompt(p: {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
  memory?: RememberedLearner;
  addressedAs?: Gender;
  now?: Date;
}): { system: string; messages: { role: 'user' | 'assistant'; content: string }[] } {
  const { character } = p;
  const city = cities.find((c) => c.places.some((pl) => pl.id === character.placeId));
  const place = city?.places.find((pl) => pl.id === character.placeId);
  const t = loadTemplate();
  const about = [
    `${character.age} years old. ${character.personality.traits.join(', ')}. ${character.speech.description}`,
    personLine(p.addressedAs),
    relationshipLine(t, p.memory, p.now ?? new Date()),
  ].filter(Boolean).join(' ');
  const system = fill(readPromptFile('beginner.md').block('System prompt'), {
    name: character.name,
    role: character.role,
    place: place?.name ?? character.appearance?.setting ?? '',
    neighbourhood: (place as { neighbourhood?: string } | undefined)?.neighbourhood ?? '',
    city: city?.name ?? character.city,
    character: about,
    language: language.name,
    formality: `the polite form ("${language.formality.formal}") unless you already use the familiar one ("${language.formality.informal}")`,
  });
  // The conversation so far as plain lines; two in a row from one side become one message
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  const push = (role: 'user' | 'assistant', content: string) => {
    const last = messages[messages.length - 1];
    if (last?.role === role) last.content += `\n${content}`;
    else messages.push({ role, content });
  };
  push('user', '(The person has just come in.)');
  for (const turn of p.transcript) push(turn.who === 'npc' ? 'assistant' : 'user', turn.transcript);
  if (p.learnerSaid) push('user', p.learnerSaid);
  return { system, messages };
}

/** One Beginner turn: the parts, and the line and English derived from them */
export async function runBeginnerTurn(p: Parameters<typeof buildBeginnerPrompt>[0] & { laps?: Laps }): Promise<{ line: string; en: string; parts: Part[] }> {
  const prompt = buildBeginnerPrompt(p);
  const started = performance.now();
  const stream = anthropic.messages.stream({
    model: TURN_MODEL,
    max_tokens: 1500,
    temperature: 1.0,
    // No thinking before the reply, as the character call
    thinking: { type: 'between_tools' },
    system: prompt.system,
    messages: prompt.messages,
    output_config: { format: { type: 'json_schema', schema: partsJsonSchema } },
  } as Parameters<typeof anthropic.messages.stream>[0]);
  if (p.laps) stream.once('text', () => p.laps!.mark('claudeFirstToken', performance.now() - started));
  const response = await stream.finalMessage();
  if (response.stop_reason === 'max_tokens') throw new Error(`Beginner turn hit max_tokens (${response.usage.output_tokens} tokens)`);
  const parts = tidyParts(PartsSchema.parse(JSON.parse(replyText(response))).parts);
  if (!parts.length) throw new Error('Beginner turn came back with no parts');
  return { ...lineFromParts(parts), parts };
}
