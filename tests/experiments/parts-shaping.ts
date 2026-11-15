// Beginner 2's parts-format shaping, for experiments only. The game played Beginner 2 in parts until its steps moved
// to the one-line reply (steps 1 to 3 2026-11-11, all six 2026-11-14); the branch was removed from the turn 2026-11-15
// (Josh: switch off "the old Beginner and its Old/New switch … then the stages, paths and parts format") and these
// came out of lib/beginner-2.ts with it. automated-replies.mts still plays whole visits in that format.
import { fill, readPromptFile } from '@/lib/prompts/template';
import { language } from '@/content';
import { glossEchoes, SCAFFOLDING_FILE, type Part } from '@/lib/beginner';
import { CLUSTERS, CLUSTER_1, type Setup } from '@/lib/beginner-2';

/**
 * English on every turn (Josh, 2026-11-09: "almost no character dialogue in english"): a turn
 * with no English part and no gloss gets the English of her question (or of her last phrase)
 * as its gloss, so it's heard after the language. The prompt asks for it; this makes sure
 */
export function withEnglish(parts: Part[]): Part[] {
  const said = parts.filter((x) => x.kind !== 'answer');
  if (said.some((x) => (x.kind === 'english' && x.text.trim()) || ((x.kind === 'word' || x.kind === 'question') && x.gloss?.trim()))) return parts;
  const target = [...said].reverse().find((x) => x.kind === 'question' && x.en.trim()) ?? [...said].reverse().find((x) => x.kind === 'word' && x.en.trim());
  return target ? parts.map((x) => (x === target ? { ...x, gloss: x.en } : x)) : parts;
}

/**
 * An invited English answer, made sure of in code: twice live (Doña Chayo, 2026-11-09) the character asked a
 * plain yes/no question in the language instead. Her question gets its English spoken, and the "Line: invite
 * English" block is said after it, unless the turn already says English answers are fine
 */
export function invited(parts: Part[]): Part[] {
  const lead = fill(readPromptFile(SCAFFOLDING_FILE).block('Line: invite English'), { language: language.name }).trim();
  // Anywhere in what's said: the character sometimes writes the invitation into the question itself (Hugo, 2026-11-09)
  const english = parts.filter((x) => x.kind !== 'answer').map((x) => `${x.text} ${x.gloss ?? ''} ${x.kind === 'question' ? x.en : ''}`).join(' ').toLowerCase();
  // Already invited, in the character's own words ("ask me in English", "you can ask me anything")
  const lang = language.name.toLowerCase();
  const already = new RegExp(`ask me (anything|in english|in ${lang})|in (english|${lang}) or`).test(english);
  const echoed = parts.some((x, i) => x.kind === 'question' && parts[i + 1]?.kind === 'english');
  const out = echoed ? parts : parts.map((x) => (x.kind === 'question' && !x.gloss?.trim() && x.en.trim() ? { ...x, gloss: x.en } : x));
  return already ? out : [...out.filter((x) => x.kind !== 'answer'), { kind: 'english', text: lead, en: '', gloss: '' }];
}

/** Clusters where the question is echoed in English right after it (Level 1) */
export const QUESTION_ECHO = [true, true, false, false, false, false];
/**
 * Level 1: the question in the language, then its English right after (Josh, 2026-11-09: "questions
 * should be spanish then english - near same is fine"). Added as an English piece after the question,
 * not as its gloss: with answers shown a question's gloss isn't spoken (lib/beginner.ts → lineFromParts,
 * mirrored by the app), while an English piece is spoken by both
 */
/**
 * Level 1: a gloss of one word on a phrase of three or more words becomes the phrase's English, so the
 * sentence is understood (Josh, 2026-11-09, Lupita: "Estoy preparando las velas. candles." against
 * the second time's "preparing the candles", which explained what she was doing)
 */
export function fullerGlosses(parts: Part[]): Part[] {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  return parts.map((x) => (x.kind === 'word' && x.gloss?.trim() && words(x.gloss) === 1 && words(x.text) >= 3 && x.en.trim() ? { ...x, gloss: x.en } : x));
}

export function questionEcho(parts: Part[]): Part[] {
  const i = parts.findIndex((x) => x.kind === 'question');
  if (i < 0) return parts;
  const q = parts[i];
  // Its full English (the gloss can hold something else: "you can answer in English")
  const en = q.en.trim() || q.gloss?.trim() || '';
  // English on either side is enough (Josh: "it could go english-spanish or spanish english"): an English question
  // just before it ("What can I get you? ¿Qué le sirvo?") or English just after means no echo, so nothing is said three times
  const before = parts[i - 1];
  const englishBefore = before?.kind === 'english' && /\?["'»”’)]*\s*$/.test(before.text.trim());
  if (!en || glossEchoes(en, q.text) || englishBefore || parts[i + 1]?.kind === 'english') return parts;
  return [...parts.slice(0, i), { ...q, gloss: '' }, { kind: 'english', text: en, en: '', gloss: '' }, ...parts.slice(i + 1)];
}

/**
 * The character announcing the answers ("You could ask me one of these:", "Here are two things you can say:"):
 * a closing English sentence that ends on a colon, just before the bubbles, is dropped; the bubbles speak for
 * themselves (automated runs, 2026-11-10: 36 of 42 announcements on questions-to-ask turns; Josh: "a teacher
 * managing the lesson"). By punctuation, so any language
 */
export function withoutAnnouncing(parts: Part[]): Part[] {
  if (!parts.some((x) => x.kind === 'answer')) return parts;
  return parts
    .map((x) => {
      if (x.kind !== 'english') return x;
      const sentences = x.text.split(/(?<=[.!?:])\s+/);
      const kept = sentences.filter((s) => !/:\s*$/.test(s.trim()));
      return kept.length === sentences.length ? x : { ...x, text: kept.join(' ').trim() };
    })
    .filter((x) => x.kind !== 'english' || x.text);
}

/**
 * Display: English on every turn; the question's English where the cluster echoes it; the invitation where set up.
 * Each step is named, and the names of those that changed the parts are returned, so a turn shows what the code fixed
 */
export function shapeParts(raw: Part[], setup: Setup, cluster: Setup[] = CLUSTER_1): { parts: Part[]; fixes: string[] } {
  const fixes: string[] = [];
  const step = (name: string, f: (x: Part[]) => Part[]) => (x: Part[]) => {
    const y = f(x);
    if (JSON.stringify(y) !== JSON.stringify(x)) fixes.push(name);
    return y;
  };
  const at = Math.max(0, CLUSTERS.indexOf(cluster));
  const echo = (x: Part[]) => (QUESTION_ECHO[at] ? step('questionEcho', questionEcho)(step('fullerGlosses', fullerGlosses)(x)) : x);
  const parts = step('withoutAnnouncing', withoutAnnouncing)(step('withEnglish', withEnglish)(raw));
  const done = (x: Part[]) => ({ parts: x, fixes });
  if (setup.invite) return done(step('invited', invited)(echo(parts)));
  // Questions to ask, and none came (the character asked its own, deep in a visit): treated as an invited
  // English answer, so the learner always has a way to answer (2026-11-09, a twelve-turn look: 4 of 5)
  if (setup.id === 'ask-en' && !parts.some((x) => x.kind === 'answer' && x.text.trim())) return done(step('invited', invited)(echo(parts)));
  if (QUESTION_ECHO[at]) return done(echo(parts));
  return done(setup.english ? parts : step('answersWithoutEnglish', (x) => x.map((y) => (y.kind === 'answer' ? { ...y, en: '' } : y)))(parts));
}

/** The parts as shown and spoken (shapeParts without the record of what changed) */
export function shownParts(raw: Part[], setup: Setup, cluster: Setup[] = CLUSTER_1): Part[] {
  return shapeParts(raw, setup, cluster).parts;
}
