// State-machine review, 2026-11-15 (Josh: "yes"): the learner's level had five writers in four files, and four skipped
// starting the level-up count over. Now a level changes after onboarding only through setLevel (lib/onboarding.ts),
// which restarts the count; onboarding's own finish and reset are the other two. And a "yes" to the level up moves
// only when an offer is due, so a double tap can't move twice.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx|mjs)$/.test(f)) files.push(p); } };
walk('lib'); walk('app');
const writers = files.filter((f) => /SET level\s*=/.test(readFileSync(f, 'utf8')));
check(writers.length === 1 && writers[0] === join('lib', 'onboarding.ts'), `only lib/onboarding.ts writes learners.level (found: ${writers.join(', ')})`);
const onb = readFileSync('lib/onboarding.ts', 'utf8');
check(/export async function setLevel[\s\S]*?step_since = now\(\), level_up_asked_at = NULL/.test(onb), 'setLevel starts the level-up count over');
const lu = readFileSync('lib/level-up.ts', 'utf8');
check(/answer === 'yes'[\s\S]*?offerDue\(\{ level, step: s\.step, counted: await countedConversations\(learnerId, countFrom\(s\)\) \}\)/.test(lu), 'a yes moves only when an offer is due');
if (problems.length) { console.error(`check-level-writers: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log('OK: one writer of the level after onboarding, the count restarts on every change, and a yes moves only when due');
