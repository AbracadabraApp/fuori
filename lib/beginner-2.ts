/**
 * The Beginner level (docs/beginner-2.md; called "Beginner 2" while it was played beside the old one): the
 * Intermediate prompt as the dialogue, with the scaffolding (content/<country>/prompts/scaffolding.md) and the reply
 * setup picked here each turn from the learner's step. Every Beginner plays it since the cut-over (Josh, 2026-11-12:
 * "the sooner we cut over the clearer this will be"); the old Beginner (lib/beginner.ts with its stages) plays only
 * when the app sends `x-fuori-beginner: 1` (Settings → touch and hold Version → Beginner: Old), for a week of
 * comparison before it goes.
 *
 * The reply ladder (docs/beginner-2.md): eight rungs by how much of the language a reply takes, played in six
 * overlapping steps (`CLUSTERS` in code). The learner's step is the stored one (lib/level-up.ts), or the app's hidden
 * stepper (`x-fuori-cluster`) when Josh sets one. With or without
 * English under the answers is display: the prompt asks for the answers'
 * English either way, and it's left out here.
 */
import { fill, readPromptFile } from '@/lib/prompts/template';
import { language } from '@/content';
import { glossEchoes, type Part } from '@/lib/beginner';

export { SCAFFOLDING_FILE as BEGINNER_2_FILE } from '@/lib/beginner';
import { SCAFFOLDING_FILE } from '@/lib/beginner';

/** Which Beginner plays: the new one (2) unless the app asks for the old one with `x-fuori-beginner: 1` (the cut-over, 2026-11-12) */
export function beginnerVersionFrom(headers: Headers): 1 | 2 {
  return headers.get('x-fuori-beginner')?.trim() === '1' ? 1 : 2;
}

export interface Setup {
  id: string;
  /** The block in scaffolding.md the character gets this turn */
  block: string;
  /** Answers kept, at most (code trims extras) */
  maxAnswers: number;
  /** The English under each answer shown */
  english: boolean;
  /** An invited English answer: the code adds the invitation and the question's English (invited) */
  invite?: boolean;
}

/**
 * The reply ladder's rungs, least of the language first (docs/beginner-2.md → The reply ladder).
 * Josh, 2026-11-09: anything read as an answer has its English under it (reading Spanish you don't
 * understand "feels odd and coercive"), and a single answer to read feels weird; so bubbles are two,
 * always with English. (The answer said inside her line, rungs inside-en and inside, removed 2026-11-12: never played.)
 */
export const RUNGS: Setup[] = [
  { id: 'two-en', block: 'Setup: two answers', maxAnswers: 2, english: true },
  // Something they can see right now, two answers (2026-11-12d; Josh's bids: a different kind of question, not only "this or that?")
  { id: 'notice', block: 'Setup: notice', maxAnswers: 2, english: true },
  { id: 'ask-en', block: 'Setup: two questions to ask', maxAnswers: 2, english: true },
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
export const GOODBYE_AFTER = 7;

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
  // and pulled (Josh: "difficult for this level")
  [R('two-en'), R('notice'), R('ask-en')],
  [R('two-en'), R('notice'), R('ask-en')],
  [R('two-en'), R('notice'), R('ask-en'), R('free')],
  [R('ask-en'), R('free')],
  [R('two-en'), R('free')],
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
function seedOf(s: string): number {
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
const WEIGHT: Record<string, number> = { 'two-en': 3, notice: 1, 'ask-en': 1, 'invite-en': 1, free: 2 };

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
  if (p.turn === GOODBYE_AFTER) return GOODBYE;
  // The opener is two answers to read when the cluster has them (Arturo, 2026-11-09: an invited-English opener set a pattern the character copied all visit)
  if (p.turn === 0 && cluster.some((s) => s.id === 'two-en')) return OPENER;
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
    // Notice never twice running (2026-11-12, a replay of Raymundo's visit: the same arches and "¿Los ve?" on two turns in a row)
    if (w.id === 'notice' && p1?.id === 'notice') w = cluster.find((s) => s.id === 'two-en') ?? w;
    chain.set(turn, w);
    return w;
  };
  const pick = at(p.turn)!;
  // Nor the learner's own question (punctuation, any language): the character follows it up instead
  if (INVITES.has(pick.id) && /[?¿]/.test(p.learnerSaid ?? '')) return cluster.find((s) => !INVITES.has(s.id)) ?? pick;
  return pick;
}

/** The level text per cluster (scaffolding.md "Level: 1–3", from Beginner 1's stages S1–S3): clusters 1–2 S1, 3–4 S2, 5–6 S3 */
export const LEVEL_OF_CLUSTER = ['Level: 1', 'Level: 1b', 'Level: 2', 'Level: 2', 'Level: 3', 'Level: 3'];

/** The cluster's level text, in the system prompt after the shared rules */
export function levelText(cluster: Setup[] = CLUSTER_1): string {
  return fill(readPromptFile(SCAFFOLDING_FILE).block(LEVEL_OF_CLUSTER[Math.max(0, CLUSTERS.indexOf(cluster))]), { language: language.name }).trim();
}

/** This turn's setup line, said next to the learner's latest message (lib/beginner.ts → turnNote) */
export function setupLine(setup: Setup): string {
  return fill(readPromptFile(SCAFFOLDING_FILE).block(setup.block), { language: language.name }).trim();
}

/** Both together (scripts and looks); the game puts them in different places */
export function setupText(setup: Setup, cluster: Setup[] = CLUSTER_1): string {
  const f = readPromptFile(SCAFFOLDING_FILE);
  const level = LEVEL_OF_CLUSTER[Math.max(0, CLUSTERS.indexOf(cluster))];
  return [f.block(level), f.block(setup.block)].map((b) => fill(b, { language: language.name }).trim()).join('\n');
}

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
/** On the one-line reply (steps 1–3), the question's English is said after it, added by code when the character left it out (Josh, 2026-11-12: printed and spoken at steps 1–3, the question's English ladder; scaffolding.md 12c) */
export const QUESTION_ECHO_FRAME = [true, true, true];

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
 * The spoken line for the English frame (Level 1, 2026-11-10q): the pieces in order, as lineFromParts, but a piece
 * with no closing punctuation gets a comma when the next piece carries the sentence on (starts lowercase: "picadas on"
 * + "el comal" + "and they're hot") and a full stop only before a new sentence. lineFromParts puts a full stop after
 * every piece, which was right when every part was a sentence (connection test, 2026-11-10: "picadas on. el comal. and")
 */
export function flowingLine(parts: Part[]): { line: string; en: string } {
  const spoken = withoutSaidInEnglish(parts).filter((p) => p.kind !== 'answer');
  const answered = parts.some((p) => p.kind === 'answer' && p.text.trim());
  // Each piece with whether it is a gloss: a gloss is set off by commas ("el comal, the griddle,"); a phrase inside an
  // English sentence is joined with plain spaces ("a batch of tejuino here"), not commas (run 2026-11-10: "a fresh batch of, tejuino, here")
  const pieces = spoken.flatMap((p) => [{ text: p.text.trim(), gloss: false }, { text: p.kind === 'question' && answered ? '' : p.gloss?.trim() ?? '', gloss: true }]).filter((x) => x.text);
  const closed = (s: string) => /[.!?…:;,]["'»”’)]*$/.test(s);
  const continues = (s: string) => /^[\p{Ll}]/u.test(s);
  const line = pieces
    .map((piece, i) => {
      const next = pieces[i + 1];
      if (closed(piece.text)) return piece.text;
      if (!next || !continues(next.text)) return `${piece.text}.`;
      return piece.gloss || next.gloss ? `${piece.text},` : piece.text;
    })
    .join(' ');
  const en = spoken.map((p) => (p.kind === 'english' ? p.text : p.en).trim()).filter(Boolean);
  return { line, en: en.join(' ') };
}

/**
 * A word part whose text the character already said inside an English part (the frame invites "my polish, la grasa"
 * as English text, then "la grasa" again as a word part: run 2026-11-10, "el comal… el comal.") is dropped from what's
 * spoken; it stays on screen as the turn's bubble. By text, so any language
 */
export function withoutSaidInEnglish(parts: Part[]): Part[] {
  // Not the question's echo (the English part right after the question, added by questionEcho): it names the same
  // things as her phrases ("Do you want to try a tejuino?"), which dropped "tejuino" from speech (run 2026-11-10)
  const english = parts.filter((p, i) => p.kind === 'english' && parts[i - 1]?.kind !== 'question').map((p) => p.text.toLowerCase()).join(' ');
  return parts.filter((p) => !(p.kind === 'word' && p.text.trim() && english.includes(p.text.trim().replace(/[.!?…]+$/, '').toLowerCase())));
}

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

/** The brief for a cluster on the one-line reply (clusters 1–3, 2026-11-11d: steps 1 to 3 of the ladder are the frame with less English each step) */
export function frameBrief(cluster: Setup[]): string {
  const f = readPromptFile(SCAFFOLDING_FILE);
  return [levelText(cluster), f.block('System prompt › Answers'), f.block('Reply: line and answers')]
    .map((b) => fill(b, { language: language.name }).trim())
    .join('\n\n');
}

/** Clusters that play on the one-line reply (the frame) rather than the parts format */
export const FRAME_CLUSTERS = 3;
export const onFrame = (cluster: Setup[]): boolean => Math.max(0, CLUSTERS.indexOf(cluster)) < FRAME_CLUSTERS;

/**
 * The one-line reply with its answers as the app's parts: the line with the question's English after it
 * (withQuestionEnglish), and each answer as an answer part, at most the setup's count, blank ones dropped. The parts
 * carry only answers, so the app shows her line as the subtitle and the answers as bubbles on the learner's turn
 */
export function lineWithAnswers(r: { line: string; en: string; done?: boolean; answers?: { text: string; en: string }[] }, setup: Setup, cluster: Setup[] = CLUSTER_1): { line: string; en: string; done?: boolean; parts: Part[]; question?: { text: string; en: string } } {
  const answers = (r.answers ?? [])
    .map((a) => ({ kind: 'answer' as const, text: a.text.trim(), en: a.en.trim(), gloss: '' }))
    .filter((a) => a.text)
    .slice(0, setup.maxAnswers);
  const question = questionOf(r.line, r.en);
  const echo = QUESTION_ECHO_FRAME[Math.max(0, CLUSTERS.indexOf(cluster))] ?? false;
  return { line: echo ? withQuestionEnglish(r.line, r.en) : r.line, en: r.en, ...(r.done !== undefined ? { done: r.done } : {}), parts: answers, ...(question ? { question } : {}) };
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

/** What the code did to one turn's parts: the setup and cluster it played, the shaping steps that changed something, and Claude's parts when one did */
export interface TurnSteps {
  /** Beginner 2: the reply setup played (two answers, questions to ask, opener, goodbye) */
  setup?: string;
  /** Beginner 2: the cluster */
  cluster?: number;
  fixes: string[];
  claudeParts?: Part[];
  /** The shape code asked for this turn (lib/shapes.ts), or the intro (lib/intro.ts); absent on a turn written by habit */
  shape?: string;
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

/** What to record of a turn's shaping (TurnSteps): Claude's parts only when the code changed them */
export function turnSteps(raw: Part[], setup: Setup, cluster: Setup[], fixes: string[]): TurnSteps {
  return { setup: setup.id, cluster: Math.max(1, CLUSTERS.indexOf(cluster) + 1), fixes, ...(fixes.length ? { claudeParts: raw } : {}) };
}

/** The version recorded with each turn: "beginner-2-<version>+C<cluster>", no stage tag, so the path doesn't count it; the scorecard and records group by it */
export function beginner2Version(cluster: Setup[]): string {
  return `beginner-2-${readPromptFile(SCAFFOLDING_FILE).version}/${readPromptFile('character.md').version}+C${Math.max(1, CLUSTERS.indexOf(cluster) + 1)}`;
}
