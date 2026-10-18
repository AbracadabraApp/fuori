// Level of the character lines in any report, with the scorecard's level judge
// (lib/level.ts): the share of lines a beginner can follow, early and late in the
// conversation (rounds 1-14 used the scratch grade-runs.mjs, which also asked a
// CEFR label; the word-by-word share is the one the scorecard kept).
//   npx tsx --env-file=.env.local tests/experiments/line-level.mts <label>=<report.md> ...   (COUNTRY as needed)
import { readFileSync } from 'node:fs';
import { beginnerKnows } from '@/lib/level';
import { BEGINNER_FOLLOWS } from '@/lib/scorecard';
import { labelled, pct, pool, reportConversations } from './common.mjs';

for (const { label, path } of labelled(process.argv.slice(2))) {
  const lines = reportConversations(readFileSync(path, 'utf8')).flatMap((c) => c.turns.filter((t) => t.who === 'npc').map((t, i) => ({ text: t.text, turn: i })));
  const known = await pool(lines.map((l) => () => beginnerKnows(l.text).catch(() => null)));
  const graded = lines.map((l, i) => ({ ...l, known: known[i] })).filter((g): g is typeof g & { known: number } => g.known !== null);
  const follows = (xs: typeof graded) => (xs.length ? pct(xs.filter((g) => g.known >= BEGINNER_FOLLOWS).length / xs.length) : '–');
  const words = lines.map((l) => l.text.split(/\s+/).length).sort((a, b) => a - b);
  console.log(`${label.padEnd(14)} ${graded.length} lines · words median ${words[words.length >> 1]} · beginner can follow ${follows(graded)} (opening and first 2 replies ${follows(graded.filter((g) => g.turn <= 2))} → from the 5th on ${follows(graded.filter((g) => g.turn >= 4))}) · unjudged ${lines.length - graded.length}`);
}
