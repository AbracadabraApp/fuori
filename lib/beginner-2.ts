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
import type { Part } from '@/lib/beginner';

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
}

/** The reply ladder's rungs, least of the language first (docs/beginner-2.md → The reply ladder) */
export const RUNGS: Setup[] = [
  { id: 'one-en', block: 'Setup: one answer', maxAnswers: 1, english: true },
  { id: 'two-en', block: 'Setup: two answers', maxAnswers: 2, english: true },
  { id: 'one', block: 'Setup: one answer', maxAnswers: 1, english: false },
  { id: 'inside-en', block: 'Setup: one answer', maxAnswers: 1, english: true, inside: true },
  { id: 'two', block: 'Setup: two answers', maxAnswers: 2, english: false },
  { id: 'inside', block: 'Setup: one answer', maxAnswers: 1, english: false, inside: true },
  { id: 'invite-en', block: 'Setup: invite English', maxAnswers: 0, english: false },
  { id: 'free', block: 'Setup: no answers', maxAnswers: 0, english: false },
];

/**
 * Six clusters, each step dropping the lowest rung and adding the next (Josh: 6–8 clusters).
 * Cluster 1 is the two rungs with English under the answers: the language-only answer came up
 * on Josh's second turn and lost him (Hugo, 2026-11-09), so it starts in cluster 2
 */
export const CLUSTERS: Setup[][] = [RUNGS.slice(0, 2), ...Array.from({ length: RUNGS.length - 3 }, (_, i) => RUNGS.slice(i + 1, i + 4))];
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
export function pickSetup(p: { conversationId?: string | null; turn: number; learnerId?: string | null; characterId: string; now?: Date }, cluster: Setup[] = CLUSTER_1): Setup {
  const day = (p.now ?? new Date()).toISOString().slice(0, 10);
  const key = p.conversationId ? `${p.conversationId}|${p.turn}` : `${p.learnerId ?? ''}|${p.characterId}|${day}`;
  return cluster[seedOf(key) % cluster.length];
}

/** The level text per cluster (scaffolding.md "Level: 1–3", from Beginner 1's stages S1–S3): clusters 1–2 S1, 3–4 S2, 5–6 S3 */
export const LEVEL_OF_CLUSTER = ['Level: 1', 'Level: 1', 'Level: 2', 'Level: 2', 'Level: 3', 'Level: 3'];

/** What the character gets each turn after the shared rules: the cluster's level, then this turn's setup (a misspelt block fails loudly) */
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

/** Display: English on every turn; the answers' English left out on a language-only rung; an inside rung's answer said by her */
export function shownParts(raw: Part[], setup: Setup): Part[] {
  const parts = withEnglish(raw);
  if (setup.inside) return insideSpeech(parts, setup);
  return setup.english ? parts : parts.map((x) => (x.kind === 'answer' ? { ...x, en: '' } : x));
}

/** The version recorded with each turn: "beginner-2-<version>+C<cluster>", no stage tag, so the path doesn't count it; the scorecard and records group by it */
export function beginner2Version(cluster: Setup[]): string {
  return `beginner-2-${readPromptFile(SCAFFOLDING_FILE).version}/${readPromptFile('character.md').version}+C${Math.max(1, CLUSTERS.indexOf(cluster) + 1)}`;
}
