/**
 * The Beginner level (docs/beginner-2.md; called "Beginner 2" while it was played beside the old one): the
 * Intermediate prompt as the dialogue, with the scaffolding (content/<country>/prompts/scaffolding.md) and the reply
 * setup picked here each turn from the learner's step. Every Beginner plays it since the cut-over (Josh, 2026-11-12:
 * "the sooner we cut over the clearer this will be"). The old Beginner, its stages and the Old/New switch
 * (`x-fuori-beginner`, which older apps still send and nothing reads) went 2026-11-15, with this Beginner's own
 * parts-format reply (every step is the one-line reply since 2026-11-14); the parts format stays for the welcome and
 * lessons (lib/beginner.ts).
 *
 * The reply ladder (docs/beginner-2.md): eight rungs by how much of the language a reply takes, played in six
 * overlapping steps (`CLUSTERS` in code). The learner's step is the stored one (lib/level-up.ts), or the app's hidden
 * stepper (`x-fuori-cluster`) when Josh sets one. With or without
 * English under the answers is display: the prompt asks for the answers'
 * English either way, and it's left out here.
 */
import { fill, readPromptFile } from '@/lib/prompts/template';
import { language } from '@/content';
import { ENDING_AT, endingTurn } from '@/lib/dialogue/ending';
import { closeNote, windDownNote } from '@/lib/dialogue/rules';
import { SCAFFOLDING_FILE, type Part } from '@/lib/beginner';

export interface Setup {
  id: string;
  /** The block in scaffolding.md the character gets this turn */
  block: string;
  /** Answers kept, at most (code trims extras) */
  maxAnswers: number;
  /** The English under each answer shown */
  english: boolean;
  /** An invited English answer */
  invite?: boolean;
  /** Words filled into the block (the idiom turn: {idiom}, {picture}, {meaning}) */
  vars?: Record<string, string>;
}

/**
 * The reply ladder's rungs, least of the language first (docs/beginner-2.md → The reply ladder).
 * Josh, 2026-11-09: anything read as an answer has its English under it (reading Spanish you don't
 * understand "feels odd and coercive"), and a single answer to read feels weird; so bubbles are two,
 * always with English. (The answer said inside her line, rungs inside-en and inside, removed 2026-11-12: never played.)
 */
export const RUNGS: Setup[] = [
  { id: 'two-en', block: 'Setup: two answers', maxAnswers: 2, english: true },
  { id: 'ask-en', block: 'Setup: two questions to ask', maxAnswers: 2, english: true },
  // A turn that ends on a comment, not a question (D6; Josh, 2026-11-14: "Why always Q? A. Why not just talk - comment
  // or Q."): one answer on its words, one new (D7). Its last line is printed and said by the question's ladder
  { id: 'comment', block: 'Setup: comment', maxAnswers: 2, english: true },
  { id: 'invite-en', block: 'Setup: invite English', maxAnswers: 0, english: false, invite: true },
  { id: 'free', block: 'Setup: no answers', maxAnswers: 0, english: false },
];
const R = (id: string) => RUNGS.find((r) => r.id === id)!;

/**
 * The goodbye offered once, on the learner's 7th turn (Josh, 2026-11-12: closing when the talk is done would be best, a
 * fixed turn "good enough, change 8 to 7"; it was the 8th, or the turn after the intro's last beat, 2026-11-11d). Once,
 * not on every turn from then: Chuy (2026-11-10) played the goodbye setup ten turns in a row over whatever the learner
 * said. Their goodbye, whenever it comes, ends the conversation through the reply's done flag
 */
export const GOODBYE: Setup = { id: 'goodbye', block: 'Setup: goodbye', maxAnswers: 2, english: true };
export const GOODBYE_AFTER = ENDING_AT.beginner.windDown;
/** If the visit carries on past the wind-down, the character closes it itself (lib/dialogue/ending.ts, the same at every
 * level since 2026-11-17). Josué and Isidro had run to 20 and 24 replies ("Don Insidro, I must insist we stop") */
export const CLOSE_AT = ENDING_AT.beginner.close;
export const CLOSE_AT_INTERMEDIATE = ENDING_AT.intermediate.close;
export const CLOSE: Setup = { id: 'close', block: 'Setup: close', maxAnswers: 0, english: false };

/** The idiom turn (D13; lib/idioms.ts): put in by take-turn in place of the drawn setup, with the idiom as vars */
export const IDIOM: Setup = { id: 'idiom', block: 'Setup: idiom', maxAnswers: 2, english: true };

/** The first turn: the place, not the person (Doña Carmen, 2026-11-10: "¿Usted es de aquí?… ¿Es porque veo africano?") */
export const OPENER: Setup = { id: 'opener', block: 'Setup: opener', maxAnswers: 2, english: true };

/**
 * Six clusters: the setups in play, the level text and whether every phrase is glossed move
 * together (Josh: 6–8 clusters; progression is also how much English is spoken)
 */
export const CLUSTERS: Setup[][] = [
  // No invitation to ask ("Is there anything you'd like to know…?"): Josh, 2026-11-10, after Renata and Doña Carmen
  // asked it again and again: "you can just remove the ask question". Questions to ask stay, as bubbles only
  // Cluster 1 (2026-11-11c): two answers and questions to ask, never the same three times running (Josh: "the answers
  // are fine but no variation. It's like Dora the Explorer"). An open question with no answers was tried the same night
  // and pulled (Josh: "difficult for this level"). Notice (point at something in sight, 2026-11-12d) left the draw
  // 2026-11-16b: it sent the character to the next sight whatever was being said (Josh: "do you like the kiosk")
  [R('two-en'), R('ask-en'), R('comment')],
  [R('two-en'), R('ask-en'), R('comment')],
  [R('two-en'), R('ask-en'), R('comment'), R('free')],
  // Steps 4-6 (docs/dialogue-plan.md D10; Josh, 2026-11-14: build the direction, "don't gate on play today"): one
  // screen, one support taken away a step. Step 4: answers as at step 3, mostly the language, the question's English
  // heard, not printed. Step 5: English only when asked (Level 3). Step 6: no answers, their own words, the question in
  // the language only. The answers keep their English at every step (Josh, 2026-11-09: reading Spanish you don't
  // understand "feels odd and coercive"). Were [ask-en, free], [two-en, free], [free] on the parts format
  [R('two-en'), R('ask-en'), R('comment'), R('free')],
  [R('two-en'), R('ask-en'), R('comment'), R('free')],
  [R('free')],
];
export const CLUSTER_1 = CLUSTERS[0];

/** The app's hidden cluster picker: header `x-fuori-cluster: 1`–`6`; cluster 1 otherwise */
export function clusterFrom(headers: Headers): Setup[] {
  return clusterHeaderFrom(headers) ?? CLUSTER_1;
}

/** The cluster header alone, or undefined: then the learner's stored step decides (lib/level-up.ts → storedCluster) */
export function clusterHeaderFrom(headers: Headers): Setup[] | undefined {
  const n = Number(headers.get('x-fuori-cluster'));
  return Number.isInteger(n) && n >= 1 && n <= CLUSTERS.length ? CLUSTERS[n - 1] : undefined;
}

/** A stable number from a string (FNV-1a), so a conversation replays with the same setups */
export function seedOf(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * This turn's setup: a new pick every turn, seeded by the conversation and the
 * turn's number; the opening (no conversation yet) by learner, place and day,
 * so the next day's opener differs (Josh, 2026-11-09)
 */
/** Invitations to be curious (questions to ask, an invitation to ask): rarer than answers, never twice running (Renata, 2026-11-10) */
const INVITES = new Set(['ask-en', 'invite-en']);
/** How often each setup comes up in its cluster: two answers three times as often as either invitation */
const WEIGHT: Record<string, number> = { 'two-en': 3, 'ask-en': 1, comment: 2, 'invite-en': 1, free: 2 };

/** The seeded pick by weight, before the rules about the turn before; `not`: a setup left out of the draw */
function weighted(cluster: Setup[], key: string, not?: string): Setup {
  const pool = cluster.filter((s) => s.id !== not);
  const from = pool.length ? pool : cluster;
  const total = from.reduce((n, s) => n + (WEIGHT[s.id] ?? 1), 0);
  let x = seedOf(key) % total;
  for (const s of from) if ((x -= WEIGHT[s.id] ?? 1) < 0) return s;
  return from[0];
}

export function pickSetup(p: { conversationId?: string | null; turn: number; learnerId?: string | null; characterId: string; now?: Date; /** what the learner just said: after their own question, no invitation (the character follows it up) */ learnerSaid?: string }, cluster: Setup[] = CLUSTER_1): Setup {
  const ending = endingTurn(p.turn, true);
  if (ending) return ending === 'close' ? CLOSE : GOODBYE;
  // The opener is two answers to read when the cluster has them (Arturo, 2026-11-09: an invited-English opener set a pattern the character copied all visit)
  if (p.turn === 0 && cluster.some((s) => s.id === 'two-en')) return OPENER;
  // A step with no answers to offer (step 6) opens on its own turn: the opener gives two answers. Without this the
  // draw had no turn 0 and the visit failed to open (2026-11-15, Josh at step 6 on the hidden stepper: every place 500)
  if (p.turn === 0) return cluster[0];
  const day = (p.now ?? new Date()).toISOString().slice(0, 10);
  const key = (turn: number) => (p.conversationId ? `${p.conversationId}|${turn}` : `${p.learnerId ?? ''}|${p.characterId}|${day}|${turn}`);
  // Never the same setup three times running (2026-11-11c, Josh: "no variation"): after two of a kind the draw leaves
  // it out. The turns before are worked out by the same rules (this one and the invitation rule below), so the chain
  // holds over a visit; what the learner said on an earlier turn isn't known here, so that rule applies to this turn only
  const chain = new Map<number, Setup | null>();
  const at = (turn: number): Setup | null => {
    if (turn < 1) return null;
    const hit = chain.get(turn);
    if (hit !== undefined) return hit;
    const p1 = at(turn - 1);
    const p2 = at(turn - 2);
    let w = weighted(cluster, key(turn), cluster.length > 1 && p1 && p2 && p1.id === p2.id ? p1.id : undefined);
    // Renata (2026-11-10): the same invitation every other turn; an invitation never follows an invitation
    if (INVITES.has(w.id) && p1 && INVITES.has(p1.id)) w = cluster.find((s) => !INVITES.has(s.id)) ?? w;
    chain.set(turn, w);
    return w;
  };
  const pick = at(p.turn)!;
  // Nor the learner's own question (punctuation, any language): the character follows it up instead
  if (INVITES.has(pick.id) && /[?¿]/.test(p.learnerSaid ?? '')) return cluster.find((s) => !INVITES.has(s.id)) ?? pick;
  return pick;
}

/** The level text per cluster (scaffolding.md "Level: 1–3", from Beginner 1's stages S1–S3): clusters 1–2 S1, 3–4 S2, 5–6 S3 */
/** Every step shares one level text (2026-11-15): the character writes every sentence in both languages and the
 *  step's setting says how each is said (lib/dialogue/pieces.ts → SETTINGS) */
export const LEVEL_OF_CLUSTER = ['Level: sentences', 'Level: sentences', 'Level: sentences', 'Level: sentences', 'Level: sentences', 'Level: sentences'];

/** The cluster's level text, in the system prompt after the shared rules */
export function levelText(cluster: Setup[] = CLUSTER_1): string {
  return fill(readPromptFile(SCAFFOLDING_FILE).block(LEVEL_OF_CLUSTER[Math.max(0, CLUSTERS.indexOf(cluster))]), { language: language.name }).trim();
}

/** This turn's setup line, said next to the learner's latest message (lib/beginner.ts → turnNote) */
export function setupLine(setup: Setup): string {
  const f = readPromptFile(SCAFFOLDING_FILE);
  // Every turn's note gives way when they're leaving (2026-11-13): in the system prompt alone, the note next to their
  // message won ("Before you go, look at the church's front door…" after "I must see the dentist")
  // The ending's words are dialogue.md's, the same at every level (lib/dialogue/ending.ts); Beginner adds what its
  // answers are on the wind-down (scaffolding.md → Setup: goodbye)
  if (setup.id === CLOSE.id) return fill(closeNote(), { language: language.name }).trim();
  if (setup.id === GOODBYE.id) return fill(`${windDownNote()} ${f.block(setup.block)}`, { language: language.name }).trim();
  const leaving = setup.id === OPENER.id ? '' : ' ' + f.block('Setup: if they are leaving');
  return fill(f.block(setup.block) + leaving, { language: language.name, ...(setup.vars ?? {}) }).trim();
}

/** Both together (scripts and looks); the game puts them in different places */
export function setupText(setup: Setup, cluster: Setup[] = CLUSTER_1): string {
  const f = readPromptFile(SCAFFOLDING_FILE);
  const level = LEVEL_OF_CLUSTER[Math.max(0, CLUSTERS.indexOf(cluster))];
  return [fill(f.block(level), { language: language.name }).trim(), setupLine(setup)].join('\n');
}

/** On the one-line reply, the question's English is said after it, added by code when the character left it out: Josh's
 *  ladder (2026-11-12; dialogue-model.md): said at steps 1–5, not at step 6 */
export const QUESTION_ECHO_FRAME = [true, true, true, true, true, false];
/** The question's English printed under it: steps 1–3 only (the same ladder); steps 4–5 hear it, step 6 neither */
export const QUESTION_PRINTED = [true, true, true, false, false, false];


/**
 * The question's English after it, on the one-line reply (cluster 1, 2026-11-10s): when the line ends on a question
 * and her English does too, the English question is said right after hers (Josh: "Final Question always gets English
 * echo"), unless she already put it there (in brackets, or as a second question). Punctuation only, so any language
 */
export function withQuestionEnglish(line: string, en: string): string {
  const last = (s: string) => s.trim().split(/(?<=[.!?…]["'»”’)]*)\s+/).filter(Boolean).at(-1) ?? '';
  const q = last(line);
  const qEn = last(en).replace(/^\(|\)$/g, '');
  if (!/\?["'»”’)]*$/.test(q) || !/\?$/.test(qEn)) return line;
  // Already there: her last two sentences are both questions (she wrote the English herself), or the question is in brackets
  const tail = line.trim().split(/(?<=[.!?…]["'»”’)]*)\s+/).filter(Boolean).slice(-2);
  if (tail.length === 2 && /\?["'»”’)]*$/.test(tail[0])) return line;
  if (/\(.*\?\)$/.test(q)) return line;
  return `${line.trim()} ${qEn}`;
}

/**
 * Cluster 1's brief on the Intermediate reply (2026-11-10s): the Level 1 frame, then the answer rules and the one-line
 * reply format with answers (scaffolding.md "Reply: line and answers", 2026-11-11a), so the two answers to say back
 * come with the line. The setup line goes on the newest message (runTurn's note), where it did in the parts format
 */
export function cluster1Brief(): string {
  return frameBrief(CLUSTER_1);
}

/** The brief for a step on the one-line reply (every step since 2026-11-14) */
export function frameBrief(cluster: Setup[]): string {
  const f = readPromptFile(SCAFFOLDING_FILE);
  return [levelText(cluster), f.block('System prompt › Answers'), f.block('Reply: line and answers')]
    .map((b) => fill(b, { language: language.name }).trim())
    .join('\n\n');
}

/**
 * The one-line reply with its answers as the app's parts: the line with the question's English after it
 * (withQuestionEnglish), and each answer as an answer part, at most the setup's count, blank ones dropped. The parts
 * carry only answers, so the app shows her line as the subtitle and the answers as bubbles on the learner's turn
 */
export function lineWithAnswers(r: { line: string; en: string; done?: boolean; hard?: boolean; answers?: { text: string; en: string }[] }, setup: Setup, cluster: Setup[] = CLUSTER_1): { line: string; en: string; done?: boolean; hard?: boolean; parts: Part[]; question?: { text: string; en: string } } {
  const answers = (r.answers ?? [])
    .map((a) => ({ kind: 'answer' as const, text: a.text.trim(), en: a.en.trim(), gloss: '' }))
    .filter((a) => a.text)
    .slice(0, setup.maxAnswers);
  const at = Math.max(0, CLUSTERS.indexOf(cluster));
  // A comment turn's last line stands where the question would (D7: printed and said by the same ladder)
  const found = setup.id === 'comment' ? lastLineOf(r.line, r.en) : questionOf(r.line, r.en);
  const printed = found && !QUESTION_PRINTED[at] ? { ...found, en: '' } : found;
  const question = printed && setup.id === IDIOM.id ? withIdiomFirst(printed, setup.vars?.idiom) : printed;
  const echo = QUESTION_ECHO_FRAME[at] ?? false;
  const said = echo ? (setup.id === 'comment' ? withLastEnglish(r.line, found) : withQuestionEnglish(r.line, r.en)) : r.line;
  return { line: said, en: r.en, ...(r.done !== undefined ? { done: r.done } : {}), ...(r.hard ? { hard: true } : {}), parts: answers, ...(question ? { question } : {}) };
}

/**
 * The question that ends a one-line reply, with its English: the only thing the app prints of a Beginner turn
 * (Josh, 2026-11-11: "The English parts of the turn don't need to be printed at all. Only the Spanish question and
 * translation"). The line's last sentence once any English echo is set aside, when it's a question; its English is the
 * last question in the English. Nothing when the turn doesn't end on a question (the app then prints nothing).
 *
 * Only the last two sentences are looked at, and an English one is set aside. An echo is a sentence of the line that's also in the English (or shares most of its words with one of it) (any language: the English is the translation, so
 * the question in the language never is): "¿Le gustan los túneles? Do you like the tunnels?" ends on the English, and
 * "¿Quiere entrar? (Do you want to go in?)" on the English in brackets. Before 2026-11-12 the last sentence was taken
 * as it came, so the bubble printed the English as the question, or an empty question (Josh's Mexico play: Raymundo,
 * Don Isidro).
 */
/**
 * The idiom turn's printed question opens with the saying (Josh, 2026-11-14: "Cada loco con su tema, ¿Qué cree que
 * quiere decir? What do you think it means?"): one sentence, so still only the question is printed. The store's
 * optional words in brackets ("(bastan)") are left out; nothing added when her question already has it
 */
export function withIdiomFirst(q: { text: string; en: string }, idiom: string | undefined): { text: string; en: string } {
  const saying = (idiom ?? '').replace(/\s*\([^)]*\)/g, '').trim();
  if (!saying) return q;
  const bare = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (bare(q.text).includes(bare(saying))) return q;
  // After the comma the question goes on in lower case ("…su tema, ¿qué cree…"), its opening mark kept
  const rest = q.text.replace(/^([^\p{L}]*)(\p{L})/u, (_m, mark: string, first: string) => mark + first.toLowerCase());
  return { ...q, text: `${saying.charAt(0).toUpperCase()}${saying.slice(1)}, ${rest}` };
}

/**
 * A comment turn's last line (D6, D7): the last sentence in the language, with the last sentence of her English, so
 * it's printed and said by the question's ladder as a question is. An English echo after it is set aside, as
 * questionOf does (B36: since the steps became settings, steps 1–5 echo the turn's last sentence, so the line always
 * ended in English and every comment turn printed nothing). Undefined when the line ends in English with nothing in
 * the language before it
 */
export function lastLineOf(line: string, en: string): { text: string; en: string } | undefined {
  const sentences = (s: string) => s.trim().split(/(?<=[.!?…]["'»”’)]*)\s+/).filter(Boolean);
  const bare = (s: string) => s.toLowerCase().replace(/[()"'«»“”‘’¿¡]/g, '').replace(/\s+/g, ' ').trim();
  const wordsOf = (x: string) => new Set(bare(x).split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  const shared = (a: Set<string>, b: Set<string>) => { const both = [...a].filter((w) => b.has(w)).length; return both / (a.size + b.size - both || 1); };
  const enSentences = sentences(en);
  const isEnglish = (x: string) => bare(en).includes(bare(x)) || enSentences.some((e) => shared(wordsOf(x), wordsOf(e)) >= 0.5);
  // Only the turn's last two sentences: the comment and, after it, its English echo
  const [end, before] = sentences(line).slice(-2).reverse();
  const last = end && isEnglish(end) && before && !isEnglish(before) ? before : end;
  const lastEn = enSentences.at(-1)?.replace(/^\(|\)$/g, '').trim();
  if (!last || !lastEn) return undefined;
  // Step 1 joins a piece and its English into one sentence ("Yo llevo veinte años aquí, I've driven here for twenty
  // years."; lib/dialogue/pieces.ts): the English tail comes off, and what's left is the comment
  const tail = bare(lastEn).replace(/[.!?…]+$/, '');
  const whole = bare(last).replace(/[.!?…]+$/, '');
  if (tail && whole.endsWith(tail) && whole.length > tail.length) {
    const cut = last.trim().slice(0, last.trim().length - lastEn.replace(/[.!?…]+$/, '').length - 1).replace(/[\s,;:–—-]+$/, '').trim();
    const text = /[.!?…]$/.test(cut) ? cut : `${cut}.`;
    return isEnglish(cut) ? undefined : { text, en: lastEn };
  }
  if (isEnglish(last)) return undefined;
  return { text: last.trim(), en: lastEn };
}

/** The comment's English said after it (steps 1–5), unless she already said it */
export function withLastEnglish(line: string, last: { text: string; en: string } | undefined): string {
  const bare = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!last?.en || bare(line).endsWith(bare(last.en))) return line;
  return `${line.trim()} ${last.en}`;
}

export function questionOf(line: string, en: string): { text: string; en: string } | undefined {
  const sentences = (s: string) => s.trim().split(/(?<=[.!?…]["'»”’)]*)\s+/).filter(Boolean);
  const bare = (s: string) => s.toLowerCase().replace(/[()"'«»“”‘’¿¡]/g, '').replace(/\s+/g, ' ').trim();
  const english = bare(en);
  const isQuestion = (s: string) => /\?["'»”’)]*$/.test(s);
  // English: the sentence is in the translation, or it shares most of its words with one of the translation's
  // sentences, counted against the words of both (an English sentence with a word of the language swapped in, "Hmm,
  // maybe you want a boleada?" against "…a shoe shine?": 5 of 8, Don Chucho, 2026-11-12). Counted against both, so a
  // question in the language built from names the translation keeps stays the question ("¿Le sirvo carne en su jugo
  // o pozole?" against "Shall I serve you carne en su jugo or pozole?": 5 of 13), which a count of the sentence's own
  // words alone set aside (a review note Josh passed on, 2026-11-12)
  const wordsOf = (x: string) => new Set(bare(x).split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  const shared = (a: Set<string>, b: Set<string>) => {
    const both = [...a].filter((w) => b.has(w)).length;
    return both / (a.size + b.size - both || 1);
  };
  const englishSentences = sentences(en).map(wordsOf);
  const isEnglish = (x: string) => english.includes(bare(x)) || englishSentences.some((e) => shared(wordsOf(x), e) >= 0.5);
  // Only the turn's last two sentences: the question and, after it, its English (an echo, or in brackets)
  const q = sentences(line).slice(-2).reverse().find((s) => !isEnglish(s));
  const qEn = sentences(en).reverse().find(isQuestion)?.replace(/^\(|\)$/g, '').trim();
  if (!q || !isQuestion(q) || !qEn) return undefined;
  return { text: q.trim(), en: qEn };
}

/** What is recorded of one turn: the setup and cluster it played and the shape asked for. `fixes` and `claudeParts` were the parts format's shaping (gone 2026-11-15); `fixes` stays, empty, for the records that read it */
export interface TurnSteps {
  /** Beginner 2: the reply setup played (two answers, questions to ask, opener, goodbye) */
  setup?: string;
  /** Beginner 2: the cluster */
  cluster?: number;
  fixes: string[];
  claudeParts?: Part[];
  /** The shape code asked for this turn (lib/shapes.ts); absent on a turn written by habit */
  shape?: string;
}

/** What to record of a turn's shaping (TurnSteps): Claude's parts only when the code changed them */
export function turnSteps(raw: Part[], setup: Setup, cluster: Setup[], fixes: string[]): TurnSteps {
  return { setup: setup.id, cluster: Math.max(1, CLUSTERS.indexOf(cluster) + 1), fixes, ...(fixes.length ? { claudeParts: raw } : {}) };
}

/** The version recorded with each turn: "beginner-2-<version>+C<cluster>", no stage tag, so the path doesn't count it; the scorecard and records group by it */
export function beginner2Version(cluster: Setup[]): string {
  return `beginner-2-${readPromptFile(SCAFFOLDING_FILE).version}/${readPromptFile('character.md').version}+C${Math.max(1, CLUSTERS.indexOf(cluster) + 1)}`;
}
