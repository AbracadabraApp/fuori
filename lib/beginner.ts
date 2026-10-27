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
import { anthropic, TURN_MODEL, replyText, finalWithDeadline } from '@/lib/claude';
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
  /** English for a part in the language (shown on a tap); empty for an english part */
  en: string;
  /**
   * Word or question: the English she says right after it so they follow:
   * short and natural, not word for word, empty when it's obvious (Josh,
   * 2026-10-25: "the English helper echo doesn't need to be a full
   * translation word for word - unnatural"). Names left out.
   */
  gloss?: string;
}

const PartsSchema = z.object({
  parts: z.array(z.object({ kind: z.enum(PART_KINDS), text: z.string(), en: z.string(), gloss: z.string() })).min(1),
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
        required: ['kind', 'text', 'en', 'gloss'],
        properties: { kind: { type: 'string', enum: [...PART_KINDS] }, text: { type: 'string' }, en: { type: 'string' }, gloss: { type: 'string' } },
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
  // A word or phrase is followed by its English, said not shown, so the
  // learner follows without reading (Josh, 2026-10-25: "Sono una studentessa
  // d'arte" in a bubble, then "an art student" heard). The prompt asked for
  // it and the model left it out, so it's added here, from the part's English
  // The question too: in the language first, then its English (Josh,
  // 2026-10-25: "ti piace la musica italiana? do you like italian music?")
  const said = spoken.flatMap((p) => [p.text.trim(), p.gloss?.trim() ?? '']).filter(Boolean);
  const en = spoken.map((p) => (p.kind === 'english' ? p.text : p.en).trim()).filter(Boolean);
  return { line: said.join(' '), en: en.join(' ') };
}

/**
 * The English said after a phrase, without the names it addresses: the name
 * is said once, in the language ("Piacere, Joshua!" then "Nice to meet
 * you!", not "Nice to meet you, Joshua!": Josh, 2026-10-25, "repeating the
 * name in English and Italian sounds mechanical"). A name is a capitalised
 * word set off by a comma in both the phrase and its English.
 */
export function withoutNames(en: string, text: string): string {
  let out = en.trim();
  const names = [...text.matchAll(/(?:^|,\s*)([A-ZÀ-Ý][\p{L}'-]+)(?=\s*[,!?.]|$)|([A-ZÀ-Ý][\p{L}'-]+)(?=\s*,)/gu)].map((m) => m[1] ?? m[2]);
  for (const name of new Set(names)) {
    const n = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`,\\s*${n}(?=\\s*[!?.,]|$)`, 'u'), '');
    const start = new RegExp(`^${n},\\s*`, 'u');
    if (start.test(out)) {
      out = out.replace(start, '');
      out = out.charAt(0).toUpperCase() + out.slice(1);
    }
  }
  return out;
}

/**
 * Unicode escapes the model sometimes leaves in its text, decoded: "\\u00bfPaga"
 * → "¿Paga", "d\\u00eda" → "día" (Josh's screenshots, Doña Rosa, 2026-10-26)
 */
export function decodeEscapes(t: string): string {
  return t.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Empty parts dropped, so the app never shows an empty bubble. The gloss is
 * kept only on words and questions, without the names said in the phrase
 */
export function tidyParts(parts: Part[]): Part[] {
  // One question a turn (goal 7): when the model asks two ("Prende un caffè?
  // Vuole un caffè o un cappuccino?", Sofia, 2026-10-25), keep the last, which
  // the answers go with, and drop the others
  const lastQuestion = parts.map((p) => p.kind).lastIndexOf('question');
  return parts
    .filter((p, i) => p.kind !== 'question' || i === lastQuestion)
    .map((p) => {
      const glossed = (p.kind === 'word' || p.kind === 'question') && p.gloss?.trim();
      const text = decodeEscapes(p.text.trim());
      return { ...p, text, en: decodeEscapes(p.en.trim()), gloss: glossed ? withoutNames(decodeEscapes(p.gloss!), text) : '' };
    })
    .filter((p) => p.text);
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

/**
 * Watches a streamed parts reply and calls onFirst with the start of what
 * she'll say, as soon as the first parts are complete (enough words, or two
 * parts), so the voice can start while the rest is written (2026-10-26:
 * Beginner turns waited for the whole reply, about 4 s to her first word
 * against 1.9 s for other turns). What it passes is exactly how the line
 * will start (lineFromParts of those parts), so the app can say the rest after.
 */
export class PartsWatcher {
  private sent = false;
  constructor(private onFirst: (first: string, parts: Part[]) => void, private minWords = 5) {}

  feed(snapshot: string): void {
    if (this.sent) return;
    const complete: Part[] = [];
    const re = /\{\s*"kind"\s*:\s*"(\w+)"\s*,\s*"text"\s*:\s*("(?:[^"\\]|\\.)*")\s*,\s*"en"\s*:\s*("(?:[^"\\]|\\.)*")\s*,\s*"gloss"\s*:\s*("(?:[^"\\]|\\.)*")\s*\}/g;
    for (let m = re.exec(snapshot); m; m = re.exec(snapshot)) {
      try {
        complete.push({ kind: m[1] as PartKind, text: JSON.parse(m[2]), en: JSON.parse(m[3]), gloss: JSON.parse(m[4]) });
      } catch {
        return;
      }
    }
    // Only what she says, up to the first question (a later question could replace it)
    const lead: Part[] = [];
    for (const part of complete) {
      if (part.kind === 'answer' || part.kind === 'question') break;
      lead.push(part);
    }
    if (!lead.length) return;
    const first = lineFromParts(tidyParts(lead)).line;
    const words = first.split(/\s+/).filter(Boolean).length;
    // A last complete part might be followed by more of the same: wait until the next one has started
    const moreComing = complete.length > lead.length || /\}\s*,\s*\{/.test(snapshot.slice(snapshot.lastIndexOf('}')));
    if (!moreComing || (words < this.minWords && lead.length < 2)) return;
    this.sent = true;
    this.onFirst(first + ' ', tidyParts(lead));
  }
}

/** One Beginner turn: the parts, and the line and English derived from them */
export async function runBeginnerTurn(p: Parameters<typeof buildBeginnerPrompt>[0] & { laps?: Laps; onText?: (snapshot: string) => void }): Promise<{ line: string; en: string; parts: Part[] }> {
  const prompt = buildBeginnerPrompt(p);
  const started = performance.now();
  // A deadline and one retry (lib/claude.ts): a stalled reply hung Doña Rosa
  const response = await finalWithDeadline(() => {
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
  if (p.onText) stream.on('text', (_delta, snapshot) => p.onText!(snapshot));
  return stream;
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Beginner turn hit max_tokens (${response.usage.output_tokens} tokens)`);
  const parts = tidyParts(PartsSchema.parse(JSON.parse(replyText(response))).parts);
  if (!parts.length) throw new Error('Beginner turn came back with no parts');
  return { ...lineFromParts(parts), parts };
}
