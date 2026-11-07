// Test A1 (docs/prompt-testing.md → queue): does each part of the Beginner
// prompt do something? Leave-one-out: the stored Beginner moments with every
// part, then with one named part switched off (lib/prompts/template.ts →
// setPartsOff), for each part in turn. Every reply is saved, with what code
// can count; the judges (F1) score the items afterwards from the saved file.
// Parts that can't be left out (who she is, the learner, the reply format)
// stay in every run. PAIRS adds overlapping parts switched off together.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/ablate.mts [runs] [part name …]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { readPromptFile, setPartsOff } from '@/lib/prompts/template';
import { loadMoments, replay, type Moment } from './moments.mts';

const KEEP = new Set(['Who: you', 'Who: the learner', 'How you talk', 'Reply: parts format']);
// Overlaps the inventory notes, switched off together as well as alone
const PAIRS: string[][] = [
  ['Answers: as a local says them', 'Answers: one idea'],
  ['English: brief', 'English: help when asked'],
  ['Language: phrases', 'Language: easy'],
];

const [runsArg, ...only] = process.argv.slice(2);
const runs = Number(runsArg ?? 5);
const all = readPromptFile('beginner.md').parts('System prompt').map((p) => p.name);
const singles = (only.length ? only : all.filter((n) => !KEEP.has(n))).map((n) => [n]);
const variants: string[][] = [[], ...singles, ...(only.length ? [] : PAIRS)];
const moments = loadMoments().filter((m) => m.level === 'beginner' && m.kind !== 'lesson');

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
type Row = { off: string[]; moment: string; run: number; line: string; parts: { kind: string; text: string }[]; counts: Record<string, number> };
const rows: Row[] = [];

for (const off of variants) {
  setPartsOff('beginner.md', off);
  for (const m of moments as Moment[]) {
    const replies = await Promise.all(Array.from({ length: runs }, () => replay(m)));
    replies.forEach((r, run) => {
      const parts = (r.parts ?? []).map((p) => ({ kind: p.kind, text: p.text }));
      const english = parts.filter((p) => p.kind === 'english').map((p) => p.text).join(' ');
      const lang = parts.filter((p) => p.kind !== 'english' && p.kind !== 'answer').map((p) => p.text).join(' ');
      rows.push({
        off, moment: m.id, run, line: r.line, parts,
        counts: {
          words: words(r.line),
          englishWords: words(english),
          languageShare: words(english) + words(lang) ? Math.round((100 * words(lang)) / (words(english) + words(lang))) : 0,
          questions: parts.filter((p) => p.kind === 'question').length,
          answers: parts.filter((p) => p.kind === 'answer').length,
        },
      });
    });
  }
}
setPartsOff('beginner.md', []);

const out = join('tests', 'experiments', 'out');
mkdirSync(out, { recursive: true });
const file = join(out, `ablate-${pack.id}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.json`);
writeFileSync(file, JSON.stringify({ promptVersion: readPromptFile('beginner.md').version, runs, moments: moments.map((m) => m.id), rows }, null, 1));

// Code counts per variant, against all parts in (the first variant)
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
for (const off of variants) {
  const r = rows.filter((x) => x.off.join('|') === off.join('|'));
  const c = (k: string) => mean(r.map((x) => x.counts[k])).toFixed(1);
  console.log(`${off.length ? `without ${off.join(' + ')}` : 'all parts'}: words ${c('words')}, English words ${c('englishWords')}, language ${c('languageShare')}%, questions ${c('questions')}, answers ${c('answers')}`);
}
console.log(`Saved ${rows.length} replies: ${file}. Judge them per item (F1) before reading anything into the counts.`);
