// One country's run of the leveling prototype (run.mts starts one per
// country, since the country pack is chosen when @/content is first loaded).
// Writes everything as JSON for run.mts's report.
//   COUNTRY=it npx tsx tests/experiments/leveling/main.mts --design=A --out=<file.json> [--dry] …
import { writeFileSync } from 'node:fs';
import { pack, language } from '@/content';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { readPromptFile } from '@/lib/prompts/template';
import { pool } from '../common.mjs';
import { dryBrain, emptyMeters, liveBrain } from './brain';
import { ALL_DESIGNS, DESIGNS, type Design } from './controllers';
import { persona, PERSONAS } from './learners';
import { scoreRun } from './score';
import { runLearner } from './simulate';

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const DRY = process.argv.includes('--dry');
const NO_SCORE = process.argv.includes('--no-score');
const designArg = (flag('design') ?? 'all').toUpperCase();
const designs: Design[] = designArg === 'ALL' ? ALL_DESIGNS : (designArg.split(',') as Design[]);
for (const d of designs) if (!DESIGNS.includes(d)) throw new Error(`Unknown design ${d} (A, B, C or all)`);
const learnerArg = flag('learners') ?? 'all';
const learners = learnerArg === 'all' ? PERSONAS : learnerArg.split(',').map(persona);
const CONVERSATIONS = Number(flag('conversations') ?? 15);
const TURNS = Number(flag('turns') ?? 6);
const PARALLEL = Number(flag('parallel') ?? 4);
const OUT = flag('out');
if (!OUT) throw new Error('--out=<file.json> is required (run.mts passes it)');

if (!DRY && !process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set: run with --env-file=.env.local, or add --dry for the stub.');
  process.exit(1);
}
const brain = DRY ? dryBrain : liveBrain;
const log = (s: string) => console.log(`[${pack.id}] ${s}`);

const jobs = designs.flatMap((design) => learners.map((p) => async () => {
  const run = await runLearner(brain, design, p, CONVERSATIONS, TURNS, log);
  const scoring = emptyMeters();
  const scores = NO_SCORE ? [] : await scoreRun(brain, run, scoring);
  return { ...run, scores, scoringMeters: scoring };
}));
const runs = await pool(jobs, PARALLEL);

const v = (f: string) => { try { return readPromptFile(f).version; } catch { return '?'; } };
writeFileSync(OUT, JSON.stringify({
  country: pack.id,
  language: language.name,
  dry: DRY,
  at: new Date().toISOString(),
  models: brain.models,
  versions: { character: promptVersion(), beginner: v('beginner.md'), levels: v('levels.md'), leveling: v('leveling.md'), level: v('level.md'), quality: v('quality.md') },
  conversations: CONVERSATIONS,
  turns: TURNS,
  runs,
}, null, 1));
log(`done: ${runs.length} learner runs → ${OUT.replace(process.cwd() + '/', '')}`);
