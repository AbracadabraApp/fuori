/**
 * The intro: how a visit opens (Josh's design, 2026-11-11; docs/dialogue-structure-reference.md § 0).
 * The character opens in the language with the thing the place is known for, six to eight sentences each
 * with its English (the app shows them as subtitles on the portrait), ending on the first question; then the
 * chat as it is. Its own prompt (content/<country>/prompts/intro.md), built from character.md's "Who: you",
 * "Who: the learner" and "Relationship" blocks, without the turn rules or dialogue.md (Josh: the intro wants
 * something more prescriptive about content, not character.md's idiosyncrasies). Beginner 2 also gets two
 * answers to say back, as answer parts. The voice starts on the first sentence (IntroWatcher), as other turns.
 */
import { z } from 'zod';
import { fixMojibake } from '@/lib/mojibake';
import { anthropic, TURN_MODEL, noThinkingFor, replyText, finalWithDeadline } from '@/lib/claude';
import { fill, readPromptFile } from '@/lib/prompts/template';
import { loadTemplate, personLine, relationshipLine, type RememberedLearner } from '@/lib/prompts/build-turn-prompt';
import { language } from '@/content';
import { withToday } from '@/lib/today';
import { cityIdFor } from '@/lib/weather';
import type { CharacterSheet, Gender, TurnOutput } from '@/lib/types';
import type { Laps } from '@/lib/timing';
import type { Part } from '@/lib/beginner';

export const INTRO_FILE = 'intro.md';

const sentenceSchema = { additionalProperties: false, type: 'object', properties: { text: { type: 'string' }, en: { type: 'string' } }, required: ['text', 'en'] };
const introJsonSchema = (answers: boolean) => ({
  additionalProperties: false,
  type: 'object',
  properties: {
    sentences: { type: 'array', description: 'What the character says, one sentence per item, the question last', items: sentenceSchema },
    beats: { type: 'array', description: 'The three or four things set out, each named in a few words of the language, in order', items: { type: 'string' } },
    ...(answers ? { answers: { type: 'array', description: 'Two short answers to the question, in the language with their English', items: sentenceSchema } } : {}),
  },
  required: answers ? ['sentences', 'beats', 'answers'] : ['sentences', 'beats'],
});
const IntroSchema = z.object({
  sentences: z.array(z.object({ text: z.string(), en: z.string() })).min(1),
  beats: z.array(z.string()).optional(),
  answers: z.array(z.object({ text: z.string(), en: z.string() })).optional(),
});

export interface IntroParams {
  character: CharacterSheet;
  memory?: RememberedLearner;
  addressedAs?: Gender;
  now?: Date;
  /** Beginner 2: two answers to say back with the question */
  answers: boolean;
}

/** The intro's prompt: who the character is, who's in front of them and what they remember, then the brief and the format */
export function buildIntroPrompt(p: IntroParams): { system: string; messages: { role: 'user' | 'assistant'; content: string }[] } {
  const { character } = p;
  const now = p.now ?? new Date();
  const ch = readPromptFile('character.md');
  const intro = readPromptFile(INTRO_FILE);
  const blocks = [
    ch.block('System prompt › Who: you'),
    ch.block('System prompt › Who: the learner'),
    ch.block('System prompt › Relationship'),
    intro.block('Brief'),
    intro.block(p.answers ? 'Reply: sentences and answers' : 'Reply: sentences'),
  ];
  const system = fill(blocks.map((b) => b.trim()).join('\n\n'), {
    name: character.name,
    age: String(character.age),
    role: character.role,
    city: character.city,
    language: language.name,
    country: language.card.country,
    setting: withToday(character.appearance?.setting ?? '', now, cityIdFor(character), character.id),
    person: personLine(p.addressedAs),
    learning: '',
    relationship: relationshipLine(loadTemplate(), p.memory, now),
    formality: language.formality[character.speech.formality],
  }).replace(/\n{3,}/g, '\n\n').trim();
  return { system, messages: [{ role: 'user', content: ch.block('First turn').trim() }] };
}

/** The intro's lines joined: what the voice says, and its English */
export function introLine(sentences: { text: string; en: string }[]): { line: string; en: string } {
  return { line: sentences.map((s) => s.text.trim()).filter(Boolean).join(' '), en: sentences.map((s) => s.en.trim()).filter(Boolean).join(' ') };
}

/** One intro: the sentences, the line and English made of them, and the answers as answer parts (Beginner 2) */
export async function runIntro(p: IntroParams & { laps?: Laps; onText?: (snapshot: string) => void; canRetry?: () => boolean }): Promise<TurnOutput> {
  const prompt = buildIntroPrompt(p);
  const started = performance.now();
  const response = await finalWithDeadline(() => {
    const stream = anthropic.messages.stream({
      model: TURN_MODEL,
      max_tokens: 1500,
      temperature: 1.0,
      ...noThinkingFor(TURN_MODEL),
      system: prompt.system,
      messages: prompt.messages,
      output_config: { format: { type: 'json_schema', schema: introJsonSchema(p.answers) } },
    } as Parameters<typeof anthropic.messages.stream>[0]);
    if (p.laps) stream.once('text', () => p.laps!.mark('claudeFirstToken', performance.now() - started));
    if (p.onText) stream.on('text', (_delta, snapshot) => p.onText!(fixMojibake(snapshot)));
    return stream;
  }, undefined, undefined, { canRetry: p.canRetry });
  if (p.laps) {
    p.laps.facts.model = response.model;
    p.laps.facts.inputTokens = response.usage.input_tokens;
    p.laps.facts.outputTokens = response.usage.output_tokens;
  }
  if (response.stop_reason === 'max_tokens') throw new Error(`Intro hit max_tokens (${response.usage.output_tokens} tokens)`);
  const parsed = IntroSchema.parse(JSON.parse(replyText(response)));
  const sentences = parsed.sentences.map((s) => ({ text: s.text.trim(), en: s.en.trim() })).filter((s) => s.text);
  if (!sentences.length) throw new Error('Intro came back with no sentences');
  const answers: Part[] = (parsed.answers ?? [])
    .map((a) => ({ kind: 'answer' as const, text: a.text.trim(), en: a.en.trim(), gloss: '' }))
    .filter((a) => a.text)
    .slice(0, 2);
  const beats = (parsed.beats ?? []).map((b) => b.trim()).filter(Boolean).slice(0, 5);
  return { ...introLine(sentences), intro: sentences, done: false, ...(beats.length ? { beats } : {}), ...(p.answers ? { parts: answers } : {}) };
}

/** The intro prompt's version, for the turn's record */
export function introVersion(): string {
  return readPromptFile(INTRO_FILE).version;
}

/**
 * Watches a streamed intro and calls onFirst with the first sentence as soon as it's complete and a second
 * has started, so the voice starts while the rest is written (as PartsWatcher for parts). What it passes is
 * exactly how the line starts (the sentence and a space), so the app can say the rest after it.
 */
export class IntroWatcher {
  private sent = false;
  constructor(private onFirst: (first: string, sentence: { text: string; en: string }) => void) {}

  feed(snapshot: string): void {
    if (this.sent) return;
    const m = /"sentences"\s*:\s*\[\s*\{\s*"text"\s*:\s*("(?:[^"\\]|\\.)*")\s*,\s*"en"\s*:\s*("(?:[^"\\]|\\.)*")\s*\}\s*,\s*\{/.exec(snapshot);
    if (!m) return;
    let first: string;
    let en: string;
    try {
      first = fixMojibake((JSON.parse(m[1]) as string).trim());
      en = fixMojibake((JSON.parse(m[2]) as string).trim());
    } catch {
      return;
    }
    if (!first) return;
    this.sent = true;
    this.onFirst(first + ' ', { text: first, en });
  }
}
