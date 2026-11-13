// Runs of the language with no English beside them, in Beginner lines (Josh, 2026-11-13: "I bigger issue is the
// runs of spanish without English support"). Reads a file of character lines, one per line; a judge lists each run
// of the language that the learner gets no English for (before or after it, in the same line), leaving out the
// closing question when its English follows. A check, not a card.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/unsupported-runs.mts <lines.txt>
import { readFileSync } from 'node:fs';
import { language } from '@/content';
import { ask } from './common.mjs';

const lines = readFileSync(process.argv[2], 'utf8').split('\n').filter((l) => l.trim());
const schema = { type: 'object', additionalProperties: false, required: ['runs'], properties: { runs: { type: 'array', items: { type: 'string' } } } };
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const found: number[] = [];
const runs: string[] = [];
await Promise.all(lines.map(async (line, i) => {
  const r = JSON.parse(await ask(`A character speaks this line to someone who knows no ${language.name}:\n${line}\n\nCopy out, exactly as written, every run of ${language.name} that the line never gives in English (no English saying the same thing right before or after it). Leave out greetings and set phrases anyone knows (sí, gracias, por favor, hola), names, and runs whose English is given. Return [] if there are none.`, { schema, max: 2000 })) as { runs: string[] };
  const long = r.runs.filter((x) => words(x) >= 3);
  found[i] = long.length;
  runs.push(...long);
}));
const withRun = found.filter((n) => n > 0).length;
console.log(`${lines.length} lines · ${withRun} (${Math.round((100 * withRun) / lines.length)}%) have a run of 3+ words of ${language.name} with no English · ${runs.length} such runs`);
for (const x of runs.slice(0, 12)) console.log(`  · ${x}`);
