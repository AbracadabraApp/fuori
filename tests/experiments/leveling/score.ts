// Scoring, by judges that never see which design made a conversation
// (05-designs.md → How the prototypes compare them):
// - followable: the level.md judge (lib/level.ts's prompt) says which listener
//   knows each word of the line's part in the language; the line is followable
//   at the learner's step when 90%+ of its words are known by that step's
//   listener (lib/scorecard.ts's BEGINNER_FOLLOWS; lib/level.ts uses
//   listener 1–2 for "a beginner", the ladder sets it per stage)
//   A word the line says with its English echo counts as known: the line
//   gives it (2026-11-02: the first run scored lines like "Vuole un cono o
//   una coppetta? a cone or a cup?" unfollowable for the one new word they
//   teach)
// - whole conversation: the same, over all of a conversation's words in the
//   language at once, since in 4–6-word lines one new word swings a line
//   from pass to fail; reported beside the per-line number
// - with help: followable, or every phrase had its English echo said after
//   it, or the learner asked for help and the character's next line was
//   followable (the repair worked)
// - alive: the quality judge (lib/quality.ts, quality.md), the score real
//   play gets
import { buildLevelPrompt } from '@/lib/level';
import { BEGINNER_FOLLOWS } from '@/lib/scorecard';
import { buildQualityPrompt } from '@/lib/quality';
import { qualityOutputJsonSchema } from '@/lib/prompts/quality-output-schema';
import { pool } from '../common.mjs';
import type { Brain, Meters } from './brain';
import type { ConversationRun, LearnerRun, NpcLine } from './simulate';

// The same shape lib/level.ts asks for (not exported there)
const wordsJsonSchema = {
  type: 'object', additionalProperties: false, required: ['words'],
  properties: { words: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['w', 'n'], properties: { w: { type: 'string' }, n: { type: 'integer', description: '1-4' } } } } },
};

export interface LineScore {
  /** null: no words in the language to judge (all English) or the judge failed */
  followable: boolean | null;
  withHelp: boolean | null;
}
export interface ConversationScore {
  lines: LineScore[];
  /** Share of all the conversation's words in the language known at the step (echoed words known); null if none were judged */
  known: number | null;
  /** The same without counting the echo: what the language alone asks of the listener (the gap to `known` is what the echo gives) */
  knownBare: number | null;
  alive: number | null;
}

const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]/gu, '');

/** The words a set of phrases gives with their English, normalised */
export const echoedWords = (phrases: string[]) => new Set(phrases.flatMap((p) => p.split(/[\s'’]+/).map(norm).filter(Boolean)));

/** Words judged in a line: how many, and how many known at the step (by the listener, or given with their English) */
async function judgeLine(brain: Brain, meters: Meters, line: string, listener: number, echoed: Set<string>): Promise<{ total: number; known: number; bare: number } | null> {
  if (!line.trim()) return null;
  try {
    const r = await brain.call({ kind: 'level', messages: [{ role: 'user', content: buildLevelPrompt(line) }], schema: wordsJsonSchema, meta: { line } }, meters);
    const { words } = JSON.parse(r.text) as { words: { w: string; n: number }[] };
    if (!words.length) return null;
    return {
      total: words.length,
      known: words.filter((w) => w.n <= listener || w.w.split(/[\s'’]+/).map(norm).every((x) => !x || echoed.has(x))).length,
      bare: words.filter((w) => w.n <= listener).length,
    };
  } catch {
    return null;
  }
}

/**
 * The phrases said with their English. New runs store them; for a run saved
 * before they were (2026-11-02-19-51), a phrase counts as echoed when the
 * spoken line has something between it and the next phrase (the echo follows
 * the phrase directly in lib/beginner.ts's line)
 */
export function glossedOf(n: NpcLine): string[] {
  if (n.glossed) return n.glossed;
  const out: string[] = [];
  let at = 0;
  n.bubbles.forEach((b, i) => {
    const start = n.line.indexOf(b, at);
    if (start < 0) return;
    const end = start + b.length;
    const nextAt = i + 1 < n.bubbles.length ? n.line.indexOf(n.bubbles[i + 1], end) : n.line.length;
    if (n.line.slice(end, nextAt < 0 ? n.line.length : nextAt).trim()) out.push(b);
    at = end;
  });
  return out;
}

async function alive(brain: Brain, meters: Meters, c: ConversationRun): Promise<number | null> {
  const turns = c.turns.filter((t) => t.who === 'npc' || t.learner.said).map((t) => (t.who === 'npc' ? { who: 'npc' as const, text: t.npc.line } : { who: 'learner' as const, text: t.learner.said }));
  const p = buildQualityPrompt(c.character, turns, { beginner: c.path === 'beginner' });
  try {
    const r = await brain.call({ kind: 'quality', system: p.system, messages: [{ role: 'user', content: p.user }], schema: qualityOutputJsonSchema }, meters);
    const a = (JSON.parse(r.text) as { alive?: number }).alive;
    return typeof a === 'number' ? a : null;
  } catch {
    return null;
  }
}

export async function scoreConversation(brain: Brain, meters: Meters, c: ConversationRun): Promise<ConversationScore> {
  const npcAt = c.turns.map((t, i) => (t.who === 'npc' ? i : -1)).filter((i) => i >= 0);
  const [judged, a] = await Promise.all([
    Promise.all(npcAt.map((i) => { const t = c.turns[i]; return t.who === 'npc' ? judgeLine(brain, meters, t.npc.languageText, c.listener, echoedWords(glossedOf(t.npc))) : null; })),
    alive(brain, meters, c),
  ]);
  const followable = judged.map((j) => (j === null ? null : j.known / j.total >= BEGINNER_FOLLOWS));
  const lines = npcAt.map((at, k): LineScore => {
    const f = followable[k];
    if (f === null) return { followable: null, withHelp: null };
    const t = c.turns[at];
    const echoed = t.who === 'npc' && t.npc.echoed;
    // The learner's next turn asked for help, and the line after it was followable
    const next = c.turns[at + 1];
    const repaired = next?.who === 'learner' && next.learner.help && followable[k + 1] === true;
    return { followable: f, withHelp: f || echoed || repaired };
  });
  const total = judged.reduce((n, j) => n + (j?.total ?? 0), 0);
  const known = total ? judged.reduce((n, j) => n + (j?.known ?? 0), 0) / total : null;
  const knownBare = total ? judged.reduce((n, j) => n + (j?.bare ?? 0), 0) / total : null;
  return { lines, known, knownBare, alive: a };
}

export async function scoreRun(brain: Brain, run: LearnerRun, meters: Meters): Promise<ConversationScore[]> {
  return pool(run.conversations.map((c) => () => scoreConversation(brain, meters, c)), 4);
}
