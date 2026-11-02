// Re-scores a saved run with the current scoring (score.ts) and record
// (record.ts), without new character or learner calls: only the level and
// quality judges run again. For checking a change to the measure on
// conversations already paid for (first use: the 2026-11-02-19-51 run, after a
// word said with its English started counting as known).
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/leveling/rescore.mts <run>-<country>.json
// Writes <run>-rescored-<country>.json and <run>-rescored.md beside it. The
// ladder moves stay as they were played; only the measures change.
import { readFileSync, writeFileSync } from 'node:fs';
import { pack } from '@/content';
import { pool } from '../common.mjs';
import { emptyMeters, liveBrain } from './brain';
import { recordOf } from './record';
import { buildReport, consoleSummary, type CountryResult } from './report';
import { scoreRun } from './score';

const file = process.argv[2];
if (!file) throw new Error('usage: rescore.mts <run>-<country>.json');
const saved = JSON.parse(readFileSync(file, 'utf8')) as CountryResult;
if (saved.country !== pack.id) throw new Error(`${file} is ${saved.country}; run with COUNTRY=${saved.country}`);

const runs = await pool(saved.runs.map((run) => async () => {
  // The record again, so words spoken are counted (help asks without a kind count as whole-line)
  const conversations = run.conversations.map((c) => ({ ...c, record: recordOf(c.turns.flatMap((t) => (t.who === 'learner' ? [t.learner] : []))) }));
  const scoringMeters = emptyMeters();
  const scores = await scoreRun(liveBrain, { ...run, conversations }, scoringMeters);
  return { ...run, conversations, scores, scoringMeters };
}), 4);

const out: CountryResult = { ...saved, runs };
const base = file.replace(new RegExp(`-${saved.country}\\.json$`), '');
writeFileSync(`${base}-rescored-${saved.country}.json`, JSON.stringify(out, null, 1));
writeFileSync(`${base}-rescored.md`, buildReport(`${[...new Set(runs.map((r) => r.design))].join('/')} (re-scored)`, [out]));
console.log(`${consoleSummary([out])}\n\nReport: ${base.replace(process.cwd() + '/', '')}-rescored.md`);
