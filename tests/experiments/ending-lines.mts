// The ending, line by line (2026-11-17, Josh's new Beginner ending, scaffolding.md 17b–17d): for each long visit of a
// rewrite-trial run, the character's 8th line (the wind-down), the answers it offered, and the 9th (the close).
// Read for direction, both arms side by side: npx tsx tests/experiments/ending-lines.mts a.json b.json
import { readFileSync } from 'fs';
type T = { setup?: string; line: string; en: string; answerTexts?: string[]; done: boolean; error?: string };
type Visit = { step: number; place: string; kind: string; turns: T[] };
for (const f of process.argv.slice(2)) {
  const vs: Visit[] = JSON.parse(readFileSync(f, 'utf8'));
  console.log(`\n===== ${f}`);
  for (const v of vs.filter((x) => x.kind === 'long')) {
    const t8 = v.turns[7], t9 = v.turns[8];
    console.log(`\n-- step ${v.step} ${v.place} (${v.turns.length} lines, ended ${v.turns.some((t) => t.done)})`);
    console.log(`  8 [${t8?.setup}] ${t8?.en ?? '(none)'}`);
    console.log(`    answers: ${(t8?.answerTexts ?? []).join(' / ')}`);
    console.log(`  9 [${t9?.setup}] ${t9?.en ?? '(none)'}`);
  }
}
