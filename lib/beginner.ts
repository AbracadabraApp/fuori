/**
 * Beginner level dialogue (docs/beginner-scaffolding.md → Beginner level
 * dialogue; Josh, 2026-10-25: N5, "build a version you can play"). For a
 * Beginner the character answers in parts: brief spoken English to set the
 * scene and explain, and in the language the words that matter, one
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
import { doneField } from '@/lib/prompts/turn-output-schema';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { z } from 'zod';
import { anthropic, TURN_MODEL, replyText, finalWithDeadline } from '@/lib/claude';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { loadTemplate, relationshipLine, personLine, type RememberedLearner } from '@/lib/prompts/build-turn-prompt';
import { cities, language } from '@/content';
import type { CharacterSheet, Gender, Turn } from '@/lib/types';
import type { Laps } from '@/lib/timing';
import { withDialogueRules, heardNote } from '@/lib/dialogue/rules';
import { readHeard } from '@/lib/dialogue/heard';
import { withToday } from '@/lib/today';
import { fixMojibake } from '@/lib/mojibake';

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

/** The welcome's turns (lib/welcome.ts): the parts, then whether this is its last turn (after the parts, so streaming the parts is unchanged) */
export const partsWithDoneJsonSchema = {
  ...partsJsonSchema,
  required: ['parts', 'done'],
  properties: { ...partsJsonSchema.properties, done: doneField },
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
  // Each piece ends on a sentence break, so the voice pauses between them
  // (Josh, 2026-11-05: "repetitive with no pauses"; a gloss like "first, the
  // cashier" ran straight into the next phrase). Punctuation, so any language
  // Her question's English isn't said when answers are shown: their English,
  // under each answer, already says what she asked (Josh, 2026-11-05:
  // "cafe, coffee, cafe"). With no answers on screen it's said, as before
  const answered = parts.some((p) => p.kind === 'answer' && p.text.trim());
  const said = spoken.flatMap((p) => [p.text.trim(), p.kind === 'question' && answered ? '' : p.gloss?.trim() ?? '']).filter(Boolean).map(sentence);
  const en = spoken.map((p) => (p.kind === 'english' ? p.text : p.en).trim()).filter(Boolean);
  return { line: said.join(' '), en: en.join(' ') };
}

/** A piece of speech ending on a sentence break: a full stop added when it has none */
export const sentence = (piece: string): string => (/[.!?…:;]["'»”’)]*$/.test(piece) ? piece : `${piece}.`);

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
  // the answers go with, and drop the others. A phrase that ends in a question
  // mark is a question too ("Da bere, acqua o birra? … Che cosa vuole da bere?",
  // Giorgia, 2026-10-27): punctuation, so any language
  const asks = parts.map((p) => p.kind === 'question' || (p.kind === 'word' && /\?["'»”’)]*$/.test(p.text.trim())));
  const lastQuestion = asks.lastIndexOf(true);
  return parts
    .filter((_, i) => !asks[i] || i === lastQuestion)
    .map((p) => (p.kind === 'word' && /\?["'»”’)]*$/.test(p.text.trim()) ? { ...p, kind: 'question' as PartKind } : p))
    .map((p) => {
      const glossed = (p.kind === 'word' || p.kind === 'question') && p.gloss?.trim();
      // Spoken English belongs in text; a turn that's all English (the welcome's
      // closing, 2026-11-03) sometimes came with it in en and text empty, and
      // the turn was dropped as having no parts
      const text = decodeEscapes((p.kind === 'english' && !p.text.trim() ? p.en : p.text).trim());
      const gloss = glossed ? withoutNames(decodeEscapes(p.gloss!), text) : '';
      return { ...p, text, en: decodeEscapes(p.en.trim()), gloss: glossEchoes(gloss, text) ? '' : gloss };
    })
    .filter((p) => p.text)
    .map(withoutRepeats(new Set()))
    .filter((p) => p.text);
}

/**
 * A gloss that mostly repeats its own phrase adds nothing heard: "Benvenuto o
 * benvenuta?" glossed "Benvenuto or benvenuta?" was said twice in a row (Josh,
 * 2026-11-04, the welcome; Mexico's "¿Bienvenido o bienvenida?" the same).
 * Half or more of the gloss's words already in the phrase: not said. By
 * comparing words, so any language; a real translation shares none.
 */
export function glossEchoes(gloss: string, text: string): boolean {
  const words = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\p{M}]/gu, '').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const g = words(gloss);
  if (!g.length) return false;
  const t = new Set(words(text));
  return g.filter((w) => t.has(w)).length / g.length >= 0.5;
}

/** Sentences of a part, split after . ! ? or … (any language) */
const sentences = (s: string) => s.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);
const sameWords = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\p{M}\p{P}\p{S}]/gu, '').replace(/\s+/g, ' ').trim();

/**
 * She says each sentence once a turn (Josh, 2026-11-02: "Often characters
 * repeat words": "Buongiorno! Benvenuto!" then "Buongiorno! Come sta oggi?").
 * A word or question sentence already said earlier in the turn is dropped,
 * with its English when the English has the same number of sentences. And an
 * answer's English that only repeats it ("Benvenuto." under "Benvenuto.") is
 * dropped, so the bubble shows it once. By comparing text, so any language.
 */
function withoutRepeats(said: Set<string>) {
  return (p: Part): Part => {
    if (p.kind === 'answer') return sameWords(p.en) === sameWords(p.text) ? { ...p, en: '' } : p;
    if (p.kind !== 'word' && p.kind !== 'question') return p;
    const s = sentences(p.text);
    const keep = s.map((x) => !said.has(sameWords(x)) && !!sameWords(x));
    s.forEach((x) => said.add(sameWords(x)));
    if (keep.every(Boolean)) return p;
    const en = sentences(p.en);
    return { ...p, text: s.filter((_, i) => keep[i]).join(' '), en: en.length === s.length ? en.filter((_, i) => keep[i]).join(' ') : p.en };
  };
}

/** Beginner 2's scaffolding file (lib/beginner-2.ts) */
export const SCAFFOLDING_FILE = 'scaffolding.md';

/** The Intermediate prompt without its one-line reply format ("Respond with JSON: { line, en }"): Beginner 2 replies in parts */
export function dialogueWithoutFormat(system: string): string {
  return system.replace(/Respond with JSON:\s*\{[^}]*\}\s*/, '').replace(/\n{3,}/g, '\n\n').trim();
}

export function buildBeginnerPrompt(p: {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
  memory?: RememberedLearner;
  addressedAs?: Gender;
  now?: Date;
  /** The path's stage (lib/path.ts → stageText): leveling.md blocks added after the system prompt */
  stageText?: string;
  /** The prompt file; beginner.md unless given. scaffolding.md is Beginner 2's: the dialogue is then the Intermediate prompt itself, this file's system block after it (docs/beginner-2.md) */
  promptFile?: string;
}): { system: string; messages: { role: 'user' | 'assistant'; content: string }[] } {
  const { character } = p;
  const city = cities.find((c) => c.places.some((pl) => pl.id === character.placeId));
  const place = city?.places.find((pl) => pl.id === character.placeId);
  const t = loadTemplate();
  const about = [
    [`${character.age} years old.`, `${character.personality.traits.join(', ')}.`, character.speech.description].filter(Boolean).join(' '),
    personLine(p.addressedAs),
    relationshipLine(t, p.memory, p.now ?? new Date()),
  ].filter(Boolean).join(' ');
  const base = fill(readPromptFile(p.promptFile ?? 'beginner.md').block('System prompt'), {
    name: character.name,
    role: character.role,
    // The place with its kind and neighbourhood, and why they're there (lib/characters/for-place.ts)
    setting: withToday((character.appearance?.setting ?? place?.name ?? '').replace(/([^.!?])$/, '$1.'), p.now ?? new Date(), city?.id, character.id),
    city: city?.name ?? character.city,
    character: about,
    language: language.name,
    country: language.card.country,
    formality: `the polite form ("${language.formality.formal}") unless you already use the familiar one ("${language.formality.informal}")`,
  });
  // The rules every conversation follows, then the stage's or the kind's brief (docs/dialogue-model.md).
  // Beginner 2: the dialogue is the Intermediate prompt as built for Intermediate (character.md with
  // dialogue.md, the here line, the memory notes), minus its one-line reply format; the scaffolding after it
  const ruled = p.promptFile === SCAFFOLDING_FILE
    ? `${dialogueWithoutFormat(buildTurnPrompt({ character, transcript: [], memory: p.memory, addressedAs: p.addressedAs, now: p.now }).system)}\n\n${base}`
    : withDialogueRules(base);
  const system = p.stageText ? `${ruled}\n\n${p.stageText}` : ruled;
  // The conversation so far as plain lines; two in a row from one side become one message
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  const push = (role: 'user' | 'assistant', content: string) => {
    const last = messages[messages.length - 1];
    if (last?.role === role) last.content += `\n${content}`;
    else messages.push({ role, content });
  };
  push('user', '(The person has just come in.)');
  for (const turn of p.transcript) push(turn.who === 'npc' ? 'assistant' : 'user', turn.transcript);
  if (p.learnerSaid) {
    // Whether they said back one of the answers she offered, worked out here, not by her (lib/dialogue/heard.ts)
    const lastNpc = [...p.transcript].reverse().find((t) => t.who === 'npc');
    const heard = readHeard(p.learnerSaid, lastNpc?.offered ?? []);
    push('user', heard ? `${p.learnerSaid}\n${heardNote(heard)}` : p.learnerSaid);
  }
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
export async function runBeginnerTurn(p: Parameters<typeof buildBeginnerPrompt>[0] & { laps?: Laps; onText?: (snapshot: string) => void; canRetry?: () => boolean; /** The stage's answers to say back, at most (lib/path.ts) */ maxAnswers?: number; /** The reply also says whether this is its last turn (the welcome; an ordinary conversation, on their goodbye) */ withDone?: boolean }): Promise<{ line: string; en: string; parts: Part[]; done?: boolean }> {
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
    output_config: { format: { type: 'json_schema', schema: p.withDone ? partsWithDoneJsonSchema : partsJsonSchema } },
  } as Parameters<typeof anthropic.messages.stream>[0]);
  if (p.laps) stream.once('text', () => p.laps!.mark('claudeFirstToken', performance.now() - started));
  if (p.onText) stream.on('text', (_delta, snapshot) => p.onText!(fixMojibake(snapshot)));
  return stream;
  }, undefined, undefined, { canRetry: p.canRetry });
  if (response.stop_reason === 'max_tokens') throw new Error(`Beginner turn hit max_tokens (${response.usage.output_tokens} tokens)`);
  const json = JSON.parse(replyText(response));
  let answers = 0;
  const parts = tidyParts(PartsSchema.parse(json).parts).filter((x) => x.kind !== 'answer' || p.maxAnswers === undefined || ++answers <= p.maxAnswers);
  if (!parts.length) throw new Error('Beginner turn came back with no parts');
  return { ...lineFromParts(parts), parts, ...(p.withDone ? { done: json.done === true } : {}) };
}
