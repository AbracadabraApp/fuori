/**
 * Beginner 2 (docs/beginner-2.md): the Intermediate prompt as the dialogue, with the
 * scaffolding (content/<country>/prompts/scaffolding.md) and the reply setup picked here each turn from the learner's
 * cluster of the reply ladder. Played only when the app sends
 * `x-fuori-beginner: 2` (Settings → touch and hold Version → Beginner), so
 * Josh can play it against Beginner 1, which stays as it is (Josh, 2026-11-09).
 *
 * The reply ladder (docs/beginner-2.md): eight rungs by how much of the
 * language a reply takes, played in six overlapping clusters of three. The
 * learner's cluster comes from the app's hidden picker for now
 * (`x-fuori-cluster`); the offers to move up aren't built yet. With or without
 * English under the answers is display: the prompt asks for the answers'
 * English either way, and it's left out here.
 */
import { fill, readPromptFile } from '@/lib/prompts/template';
import { language } from '@/content';
import { glossEchoes, type Part } from '@/lib/beginner';

export { SCAFFOLDING_FILE as BEGINNER_2_FILE } from '@/lib/beginner';
import { SCAFFOLDING_FILE } from '@/lib/beginner';

/** The app's switch: header `x-fuori-beginner: 2` */
export function beginnerVersionFrom(headers: Headers): 1 | 2 {
  return headers.get('x-fuori-beginner')?.trim() === '2' ? 2 : 1;
}

export interface Setup {
  id: string;
  /** The block in scaffolding.md the character gets this turn */
  block: string;
  /** Answers kept, at most (code trims extras) */
  maxAnswers: number;
  /** The English under each answer shown (on an inside rung: heard after it) */
  english: boolean;
  /** The answer said inside her line by the code, not shown as a bubble (insideSpeech) */
  inside?: boolean;
  /** An invited English answer: the code adds the invitation and the question's English (invited) */
  invite?: boolean;
}

/**
 * The reply ladder's rungs, least of the language first (docs/beginner-2.md → The reply ladder).
 * Josh, 2026-11-09: anything read as an answer has its English under it (reading Spanish you don't
 * understand "feels odd and coercive"), and a single answer to read feels weird; so bubbles are two,
 * always with English. An answer the character sets up in speech may be in the language only.
 */
export const RUNGS: Setup[] = [
  { id: 'two-en', block: 'Setup: two answers', maxAnswers: 2, english: true },
  { id: 'inside-en', block: 'Setup: one answer', maxAnswers: 1, english: true, inside: true },
  { id: 'ask-en', block: 'Setup: two questions to ask', maxAnswers: 2, english: true },
  { id: 'invite-en', block: 'Setup: invite English', maxAnswers: 0, english: false, invite: true },
  { id: 'inside', block: 'Setup: one answer', maxAnswers: 1, english: false, inside: true },
  { id: 'free', block: 'Setup: no answers', maxAnswers: 0, english: false },
];
const R = (id: string) => RUNGS.find((r) => r.id === id)!;

/** The goodbye offered, from the learner's 8th turn (docs/beginner-2.md: "offered after about 8 turns or when they say it") */
export const GOODBYE: Setup = { id: 'goodbye', block: 'Setup: goodbye', maxAnswers: 2, english: true };
export const GOODBYE_AFTER = 8;

/** The first turn: the place, not the person (Doña Carmen, 2026-11-10: "¿Usted es de aquí?… ¿Es porque veo africano?") */
export const OPENER: Setup = { id: 'opener', block: 'Setup: opener', maxAnswers: 2, english: true };

/**
 * Six clusters: the setups in play, the level text and whether every phrase is glossed move
 * together (Josh: 6–8 clusters; progression is also how much English is spoken)
 */
export const CLUSTERS: Setup[][] = [
  // No invitation to ask ("Is there anything you'd like to know…?"): Josh, 2026-11-10, after Renata and Doña Carmen
  // asked it again and again: "you can just remove the ask question". Questions to ask stay, as bubbles only
  [R('two-en'), R('ask-en')],
  [R('two-en'), R('ask-en')],
  [R('two-en'), R('ask-en'), R('free')],
  [R('ask-en'), R('free')],
  [R('two-en'), R('free')],
  [R('free')],
];
// The answer set up inside the character's line (rungs inside-en and inside) is out of every cluster until it
// has a screen design (Josh, 2026-11-09: "I can't tell what the dialogue is that goes with 'You could answer me
// with: …'": the lead is heard, not shown, and the answer sits unmarked inside the character's bubble)
/** Whole-phrase glossing per cluster: cluster 1 only, pattern B (Josh, 2026-11-09: "b for s1": each sentence in the language, then its English) */
export const GLOSS_ALL = [true, false, false, false, false, false];
export const CLUSTER_1 = CLUSTERS[0];

/** The app's hidden cluster picker: header `x-fuori-cluster: 1`–`6`; cluster 1 otherwise */
export function clusterFrom(headers: Headers): Setup[] {
  const n = Number(headers.get('x-fuori-cluster'));
  return Number.isInteger(n) && n >= 1 && n <= CLUSTERS.length ? CLUSTERS[n - 1] : CLUSTER_1;
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
const WEIGHT: Record<string, number> = { 'two-en': 3, 'ask-en': 1, 'invite-en': 1, inside: 1, 'inside-en': 1, free: 2 };

/** The seeded pick by weight, before the rules about the turn before */
function weighted(cluster: Setup[], key: string): Setup {
  const total = cluster.reduce((n, s) => n + (WEIGHT[s.id] ?? 1), 0);
  let x = seedOf(key) % total;
  for (const s of cluster) if ((x -= WEIGHT[s.id] ?? 1) < 0) return s;
  return cluster[0];
}

export function pickSetup(p: { conversationId?: string | null; turn: number; learnerId?: string | null; characterId: string; now?: Date; /** what the learner just said: after their own question, no invitation (the character follows it up) */ learnerSaid?: string }, cluster: Setup[] = CLUSTER_1): Setup {
  if (p.turn >= GOODBYE_AFTER) return GOODBYE;
  // The opener is two answers to read when the cluster has them (Arturo, 2026-11-09: an invited-English opener set a pattern the character copied all visit)
  if (p.turn === 0 && cluster.some((s) => s.id === 'two-en')) return OPENER;
  const day = (p.now ?? new Date()).toISOString().slice(0, 10);
  const key = (turn: number) => (p.conversationId ? `${p.conversationId}|${turn}` : `${p.learnerId ?? ''}|${p.characterId}|${day}|${turn}`);
  const pick = weighted(cluster, key(p.turn));
  if (!INVITES.has(pick.id)) return pick;
  // Renata (2026-11-10): the same invitation every other turn, and none of the learner's questions followed up.
  // An invitation never follows an invitation, nor the learner's own question (punctuation, any language)
  const before = p.turn > 1 ? weighted(cluster, key(p.turn - 1)) : null;
  const askedSomething = /[?¿]/.test(p.learnerSaid ?? '');
  if ((before && INVITES.has(before.id)) || askedSomething) return cluster.find((s) => !INVITES.has(s.id)) ?? pick;
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
 * The answer said inside her line (rungs 4 and 6): her one answer becomes her
 * own words, after the "Line: answer inside" block ("You could answer me
 * with:"), its English heard after it on rung 4. Done in code: asked of the
 * prompt it held 3 of 15 times (card B2-S) and dropped the English (2026-11-09)
 */
export function insideSpeech(parts: Part[], setup: Setup): Part[] {
  const answer = parts.find((x) => x.kind === 'answer' && x.text.trim());
  const rest = parts.filter((x) => x.kind !== 'answer');
  if (!answer) return rest;
  const lead = readPromptFile(SCAFFOLDING_FILE).block('Line: answer inside').trim();
  return [...rest, { kind: 'english', text: lead, en: '', gloss: '' }, { kind: 'word', text: answer.text, en: answer.en, gloss: setup.english ? answer.en : '' }];
}

/**
 * Every phrase glossed (clusters 1–2): each phrase in the language with no gloss gets its English,
 * spoken after it, unless the turn's own English already says it or the English only repeats the
 * phrase (a name, a cognate). Claude's response to Josh's observation (2026-11-09: in that session
 * "I could not tell what the character was saying until I got answers with subtitles"; the character
 * would have had to gloss the whole paragraph to make sense), not something Josh asked for.
 */
export function glossAll(parts: Part[]): Part[] {
  const english = parts.filter((x) => x.kind === 'english').map((x) => x.text).join(' ');
  return parts.map((x) => {
    // A gloss shorter than the full English (a clipped one: "Vengo al Zócalo cada tarde. every afternoon") is replaced too
    const clipped = !!x.gloss?.trim() && x.gloss.trim().split(/\s+/).length < x.en.trim().split(/\s+/).length;
    if ((x.kind !== 'word' && x.kind !== 'question') || (x.gloss?.trim() && !clipped) || !x.en.trim()) return x;
    if (glossEchoes(x.en, x.text) || (english && glossEchoes(x.en, english))) return x;
    return { ...x, gloss: x.en };
  });
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
  const already = /ask me (anything|in english|in spanish|in italian)|in (english|spanish|italian) or/.test(english);
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

/** Display: every phrase glossed in clusters 1–2; English on every turn; an inside rung's answer said by the character */
export function shownParts(raw: Part[], setup: Setup, cluster: Setup[] = CLUSTER_1): Part[] {
  const parts = withoutAnnouncing(withEnglish(GLOSS_ALL[Math.max(0, CLUSTERS.indexOf(cluster))] ? glossAll(raw) : raw));
  const at = Math.max(0, CLUSTERS.indexOf(cluster));
  if (setup.inside) return insideSpeech(parts, setup);
  if (setup.invite) return invited(QUESTION_ECHO[at] ? questionEcho(fullerGlosses(parts)) : parts);
  // Questions to ask, and none came (the character asked its own, deep in a visit): treated as an invited
  // English answer, so the learner always has a way to answer (2026-11-09, a twelve-turn look: 4 of 5)
  if (setup.id === 'ask-en' && !parts.some((x) => x.kind === 'answer' && x.text.trim())) return invited(QUESTION_ECHO[at] ? questionEcho(fullerGlosses(parts)) : parts);
  if (QUESTION_ECHO[at]) return questionEcho(fullerGlosses(parts));
  return setup.english ? parts : parts.map((x) => (x.kind === 'answer' ? { ...x, en: '' } : x));
}

/** The version recorded with each turn: "beginner-2-<version>+C<cluster>", no stage tag, so the path doesn't count it; the scorecard and records group by it */
export function beginner2Version(cluster: Setup[]): string {
  return `beginner-2-${readPromptFile(SCAFFOLDING_FILE).version}/${readPromptFile('character.md').version}+C${Math.max(1, CLUSTERS.indexOf(cluster) + 1)}`;
}
