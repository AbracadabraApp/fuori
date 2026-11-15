import { language } from '@/content';

/**
 * The mix in a fixed shape (docs/mix.md; Josh, 2026-11-13: "I bigger issue is the runs of spanish without English
 * support"). At Beginner step 1 the character writes each piece of the language in braces with its English after a
 * bar, `{pase, pase | come in}`, and this puts the spoken line together: the piece, then its English. Prompt wording
 * alone left a run with no English in 41% of replayed turns; the shape, 15% (2026-11-13). Works in any language: it
 * reads only braces and bars.
 *
 * `partial`: the line is still being written (the voice starts on its first sentence), so an open brace and what
 * follows it are held back until the brace closes. On a whole line a stray brace is dropped instead.
 */
export function assemblePieces(text: string, partial = false): string {
  let t = text;
  const open = t.lastIndexOf('{');
  if (open > t.lastIndexOf('}')) t = partial ? t.slice(0, open) : t.slice(0, open) + t.slice(open + 1);
  t = t.replace(/\{([^{}]*)\}/g, (_m, inner: string) => {
    const bar = inner.indexOf('|');
    const piece = (bar < 0 ? inner : inner.slice(0, bar)).trim();
    const en = (bar < 0 ? '' : inner.slice(bar + 1)).trim();
    // No English, or English that only repeats the piece (a name, a dish): the piece alone
    if (!en || fold(en) === fold(piece)) return piece;
    return /[.!?…]["'»”’)]*$/.test(piece) ? `${piece} ${en}` : `${piece}, ${en}`;
  });
  return partial ? t : t.replace(/[{}]/g, '');
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();

/**
 * The steps as settings (docs/mix.md → the steps as settings in code; Josh, 2026-11-15: "all that in order").
 * At Beginner steps 1 to 3 the character writes every sentence in the language with its English, in braces, the
 * phrase most worth catching marked with asterisks in both: `{Y lo envuelvo *en hoja de maíz*. | And I wrap it
 * *in corn husk*.}`. It no longer decides how much of the language to use: code says each sentence one of four
 * ways, by the step's setting. Before this each step had its own paragraph of level text, written on its own;
 * measured on the live servers they didn't run in order (step 3 had less of the language than step 2).
 */
/** `gloss` is the mix the other way round: the sentence in the language, its marked phrase followed by the English ("Y lo envuelvo en hoja de maíz, in corn husk.") */
export type Way = 'english' | 'mix' | 'gloss' | 'echo' | 'bare';

/** How a step says its sentences: the share said each way, and how a question or the turn's last sentence is said */
export interface Setting {
  ways: Partial<Record<Way, number>>;
  last: Way;
}

/**
 * Step 1: mostly English with a phrase of the language mixed into its sentences; step 2: every sentence echoed;
 * step 3: half the sentences echoed, the others mixed the other way round (the sentence in the language, its marked
 * phrase glossed). The question or last sentence is echoed at all three. Josh, 2026-11-15: "mixed is good the ear.
 * echo is easy to follow"; "echo is easier than mixed+echo"; "there should be mixed in 1-3"; "swap 2 & 3"; and of
 * step 3, which then had less of the language than step 2, "you couuld increase the mix". Past that the only way to more
 * of the language is to take the English off sentences: step 4 says half of them bare, step 5 all but the question
 * and the last sentence, step 6 everything (and offers no answers: lib/beginner-2.ts).
 */
const SHARED: Setting[] = [
  { ways: { mix: 0.7, english: 0.3 }, last: 'echo' },
  { ways: { echo: 1 }, last: 'echo' },
  { ways: { echo: 0.5, gloss: 0.5 }, last: 'echo' },
  { ways: { echo: 0.5, bare: 0.5 }, last: 'echo' },
  { ways: { bare: 1 }, last: 'echo' },
  { ways: { bare: 1 }, last: 'bare' },
];

/**
 * Each step's setting for this country: the shared ones, and where a country's own differs (content/<country>/
 * language.ts → stepSettings, by step number). The mix is tuned by country when its measured ladder calls for it
 * (Josh, 2026-11-15: "italy 4 could mix more - mix is your dial"; "i said italy").
 */
export const SETTINGS: (Setting | undefined)[] = SHARED.map((shared, i) => (language.stepSettings as Partial<Record<number, Setting>>)[i + 1] ?? shared);


/** A number from 0 to 1 out of a string, the same every time (the turn's seed) */
export function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

/** The way sentence `index` is said: spread evenly over the turn (not drawn one by one, so a turn holds its share) */
export function wayOf(setting: Setting, seed: number, index: number): Way {
  const u = (seed + (index + 1) * 0.6180339887) % 1;
  let sum = 0;
  const order: Way[] = ['echo', 'mix', 'gloss', 'bare', 'english'];
  for (const way of order) {
    sum += setting.ways[way] ?? 0;
    if (u < sum) return way;
  }
  return order.find((w) => (setting.ways[w] ?? 0) > 0) ?? 'echo';
}

const unmarked = (s: string) => s.replace(/\*/g, '');
const marks = (s: string) => [...s.matchAll(/\*([^*]+)\*/g)].map((m) => m[1].trim());
const endsSentence = (s: string) => /[.!?…]["'»”’)]*$/.test(s);
/** The English says nothing the phrase doesn't: the same words, or all but one of them (an article) */
function repeats(piece: string, en: string): boolean {
  const [a, b] = [fold(piece).split(' '), fold(en).split(' ')];
  const extra = b.filter((w) => !a.includes(w)).length;
  return fold(piece) === fold(en) || (b.length >= 2 && extra <= 1);
}
/** A capital that was only there to open a sentence ("A happy song" → "a happy song"); English's "I" keeps its own */
const lowerFirst = (s: string) => (/^\p{Lu}(\p{Ll}|\s)/u.test(s) && !/^I\s/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

/** One sentence said one way; a sentence whose English only repeats it (a name, a dish) is said once */
export function saySentence(piece: string, en: string, way: Way): string {
  const [p, e] = [unmarked(piece).trim(), unmarked(en).trim()];
  if (!e || fold(e) === fold(p)) return p;
  if (way === 'bare') return p;
  if (way === 'english') return e;
  if (way === 'mix') {
    const [inPiece, inEn] = [marks(piece), marks(en)];
    // The English sentence with the marked phrase in the language, then its English: "I wrap it en hoja de maíz, in corn husk."
    if (inPiece.length === 1 && inEn.length === 1 && inPiece[0] && inEn[0]) {
      // English that only repeats the phrase (a name, with or without its article: "el Jardín de la Unión, the Jardín
      // de la Unión", docs/bugs.md B29) is left out; at the start of the sentence its capital goes to the phrase
      const atStart = /^\s*\*/.test(en);
      const gloss = atStart ? lowerFirst(inEn[0]) : inEn[0];
      const both = repeats(inPiece[0], inEn[0]) ? inPiece[0] : `${inPiece[0]}, ${gloss}`;
      return unmarked(en.replace(/\*([^*]+)\*/, both)).trim();
    }
    // No phrase marked: the echo keeps the language and its support
  }
  if (way === 'gloss') {
    const [inPiece, inEn] = [marks(piece), marks(en)];
    if (inPiece.length === 1 && inEn.length === 1 && inPiece[0] && inEn[0]) {
      const both = repeats(inPiece[0], inEn[0]) ? inPiece[0] : `${inPiece[0]}, ${lowerFirst(inEn[0])}`;
      // The English goes before the phrase's own closing punctuation: "…en hoja de maíz, in corn husk."
      return unmarked(piece.replace(/\*([^*]+)\*/, both)).trim();
    }
  }
  return endsSentence(p) ? `${p} ${e}` : `${p}, ${lowerFirst(e)}`;
}

/**
 * The line as it's said at a step's setting. Each braced sentence is said the way its place in the turn gives
 * (wayOf); a question, and on the whole line the last sentence, is said the step's `last` way (the question is what
 * they answer, and a comment turn's last line stands where it would). `partial`: the line is still being written,
 * so an open brace is held back and the last sentence isn't known yet; the first sentence is never taken as the
 * last, so the voice that starts on it early and the whole line agree. Text outside braces is said as written.
 */
export function saySentences(text: string, setting: Setting, seed: number, partial = false): string {
  let t = text;
  const open = t.lastIndexOf('{');
  if (open > t.lastIndexOf('}')) t = partial ? t.slice(0, open) : t.slice(0, open) + t.slice(open + 1);
  const total = (t.match(/\{[^{}]*\}/g) ?? []).length;
  let index = -1;
  t = t.replace(/\{([^{}]*)\}/g, (_m, inner: string) => {
    index++;
    const bar = inner.indexOf('|');
    const piece = (bar < 0 ? inner : inner.slice(0, bar)).trim();
    const en = (bar < 0 ? '' : inner.slice(bar + 1)).trim();
    const isLast = !partial && index > 0 && index === total - 1;
    const way = /\?["'»”’)]*$/.test(unmarked(piece)) || isLast ? setting.last : wayOf(setting, seed, index);
    return saySentence(piece, en, way);
  });
  return (partial ? t : t.replace(/[{}]/g, '')).replace(/\*/g, '');
}

/** The English of a line written in braced sentences: each sentence's English, and what's outside the braces as written */
export function englishOf(text: string): string {
  return text.replace(/\{([^{}]*)\}/g, (_m, inner: string) => {
    const bar = inner.indexOf('|');
    return unmarked(bar < 0 ? inner : inner.slice(bar + 1)).trim();
  }).replace(/[{}*]/g, '').trim();
}
