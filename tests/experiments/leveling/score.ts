// Scoring, by judges that never see which design made a conversation
// (05-designs.md → How the prototypes compare them):
// - followable: the level.md judge (lib/level.ts's prompt) says which listener
//   knows each word of the line's part in the language; the line is followable
//   at the learner's step when 90%+ of its words are known by that step's
//   listener (lib/scorecard.ts's BEGINNER_FOLLOWS; lib/level.ts uses
//   listener 1–2 for "a beginner", the ladder sets it per stage)
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
import type { ConversationRun, LearnerRun } from './simulate';

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
  alive: number | null;
}

async function knownShare(brain: Brain, meters: Meters, line: string, listener: number): Promise<number | null> {
  if (!line.trim()) return null;
  try {
    const r = await brain.call({ kind: 'level', messages: [{ role: 'user', content: buildLevelPrompt(line) }], schema: wordsJsonSchema, meta: { line } }, meters);
    const { words } = JSON.parse(r.text) as { words: { n: number }[] };
    return words.length ? words.filter((w) => w.n <= listener).length / words.length : null;
  } catch {
    return null;
  }
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
  const [shares, a] = await Promise.all([
    Promise.all(npcAt.map((i) => { const t = c.turns[i]; return t.who === 'npc' ? knownShare(brain, meters, t.npc.languageText, c.listener) : null; })),
    alive(brain, meters, c),
  ]);
  const followable = shares.map((s) => (s === null ? null : s >= BEGINNER_FOLLOWS));
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
  return { lines, alive: a };
}

export async function scoreRun(brain: Brain, run: LearnerRun, meters: Meters): Promise<ConversationScore[]> {
  return pool(run.conversations.map((c) => () => scoreConversation(brain, meters, c)), 4);
}
