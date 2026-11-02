// Do the dials turn? (docs/research/leveling/07-model.md → How we know it
// works, 1.) The model's conversation difficulty is the sum of its settings;
// this measures what each setting does on its own. Every dial is one change
// from stage 1 (Talk: stage 1, echo all, two answers), played with the same
// characters and the same learner, and scored the same way: the share of a
// conversation's words in the language known to the stage-1 listener, with
// and without the English echo, words in the language per line, liveliness,
// seconds per line. No ladder, no simulated learner climbing.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/leveling/dials.mts [--people=10] [--turns=3] [--dials=baseline,talk2,…]
// Writes results/<date>-dials-<country>.md and .json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pack, language } from '@/content';
import type { Turn } from '@/lib/types';
import { pool } from '../common.mjs';
import { emptyMeters, liveBrain, type Meters } from './brain';
import { recordOf } from './record';
import { STAGES, type Stage, type Supports } from './ladder';
import { scoreConversation } from './score';
import { cast, characterTurn, learnerTurn, type ConversationRun } from './simulate';
import { seeded } from './learners';

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const PEOPLE = Number(flag('people') ?? 10);
const TURNS = Number(flag('turns') ?? 3);
/** The learner: A1, answering in their own words every turn, honest about what they follow (asks for help when lost) */
const ABILITY = 0.2;

const s1 = STAGES['1'];
const base: Supports = s1.supports;
interface Dial { id: string; what: string; stage: Stage; supports: Supports; supportBack?: boolean }
const DIALS: Dial[] = [
  { id: 'baseline', what: 'Stage 1: talk 1, echo all, two answers', stage: s1, supports: base },
  { id: 'talk2', what: 'Talk: stage 2 (supports as stage 1)', stage: { ...s1, talk: 'Talk: stage 2' }, supports: base },
  { id: 'talk3', what: 'Talk: stage 3 (supports as stage 1)', stage: { ...s1, talk: 'Talk: stage 3' }, supports: base },
  { id: 'supportBack', what: 'Talk: stage 1 + support back', stage: s1, supports: base, supportBack: true },
  { id: 'echoNew', what: 'Echo: new words only', stage: s1, supports: { ...base, echo: 'new' } },
  { id: 'echoOff', what: 'Echo: off', stage: s1, supports: { ...base, echo: 'off' } },
  { id: 'answers1', what: 'Answers: one', stage: s1, supports: { ...base, answers: 1 } },
  { id: 'frame', what: 'Answers: a frame', stage: s1, supports: { ...base, answers: 'frame' } },
  // The Language dial (leveling.md 2026-11-02c): how much of the turn is in the language and how hard
  ...[1, 2, 3, 4].map((n) => ({ id: `lang${n}`, what: `Language: ${n} (echo all)`, stage: { ...s1, extra: [`Language: ${n}`] }, supports: base })),
  ...[3, 4].map((n) => ({ id: `lang${n}new`, what: `Language: ${n}, echo for new words only`, stage: { ...s1, extra: [`Language: ${n}`] }, supports: { ...base, echo: 'new' as const } })),
  { id: 'B1', what: 'Intermediate (character.md + B1), for reference', stage: STAGES.B1, supports: STAGES.B1.supports },
];
const only = flag('dials')?.split(',');
const dials = only ? DIALS.filter((d) => only.includes(d.id)) : DIALS;

const people = cast();
const rng = seeded('dials', pack.id);
const chosen = Array.from({ length: PEOPLE }, () => people[Math.floor(rng() * people.length)]);

interface Row { dial: string; person: string; known: number | null; knownBare: number | null; alive: number | null; words: number; /** Every word said, English included (echo too) */ allWords: number; lines: number; ms: number; learnerWords: number; lost: number; error?: string; transcript: string }

async function play(d: Dial, k: number, meters: Meters): Promise<Row> {
  const { character, city } = chosen[k];
  const who = { name: character.name, role: character.role, city, age: character.age };
  const turns: ConversationRun['turns'] = [];
  const transcript: Turn[] = [];
  const ctx = { brain: liveBrain, meters, design: 'A' as const, stage: d.stage, supports: d.supports, supportBack: !!d.supportBack, character, turn: 0 };
  try {
    let npc = await characterTurn(ctx, transcript);
    turns.push({ who: 'npc', npc });
    transcript.push({ who: 'npc', transcript: npc.line, translation: npc.en });
    for (let t = 0; t < TURNS; t++) {
      const lt = await learnerTurn(liveBrain, meters, 'own', ABILITY, d.stage.demand, who, turns, npc.answers, 0);
      turns.push({ who: 'learner', learner: lt, intent: 'own' });
      if (lt.lang === 'none') continue;
      npc = await characterTurn({ ...ctx, turn: t + 1 }, transcript, lt.said);
      transcript.push({ who: 'learner', transcript: lt.said }, { who: 'npc', transcript: npc.line, translation: npc.en });
      turns.push({ who: 'npc', npc });
    }
  } catch (e) {
    return { dial: d.id, person: character.name, known: null, knownBare: null, alive: null, words: 0, allWords: 0, lines: 0, ms: 0, learnerWords: 0, lost: 0, error: e instanceof Error ? e.message : String(e), transcript: '' };
  }
  const record = recordOf(turns.flatMap((t) => (t.who === 'learner' ? [t.learner] : [])));
  // Scored at the stage-1 listener for every dial, so the numbers compare
  const run = { i: k, step: 1, stage: d.stage.id, path: d.stage.path, listener: 1, supports: d.supports, supportBack: !!d.supportBack, character: who, turns, record, decision: {} } as unknown as ConversationRun;
  const score = await scoreConversation(liveBrain, meters, run);
  const npcs = turns.flatMap((t) => (t.who === 'npc' ? [t.npc] : []));
  return {
    dial: d.id, person: character.name, known: score.known, knownBare: score.knownBare, alive: score.alive,
    words: npcs.reduce((n, x) => n + x.languageText.split(/\s+/).filter(Boolean).length, 0), lines: npcs.length,
    allWords: npcs.reduce((n, x) => n + x.line.split(/\s+/).filter(Boolean).length, 0),
    ms: npcs.reduce((n, x) => n + x.ms, 0), learnerWords: record.wordsTarget, lost: record.lost,
    transcript: turns.map((t) => (t.who === 'npc' ? `${character.name}: ${t.npc.line}` : `Learner${t.learner.help ? ' [help]' : ''}: ${t.learner.said || '(silent)'}`)).join('\n'),
  };
}

const meters = emptyMeters();
const rows = await pool(dials.flatMap((d) => chosen.map((_, k) => () => play(d, k, meters).then((r) => { process.stdout.write('.'); return r; }))), 8);

const mean = (xs: (number | null)[]) => { const ys = xs.filter((x): x is number => typeof x === 'number'); return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : NaN; };
const pct = (x: number) => (Number.isNaN(x) ? '–' : `${Math.round(100 * x)}%`);
const f1 = (x: number) => (Number.isNaN(x) ? '–' : x.toFixed(1));
const cost = Object.values(meters).reduce((a, m) => a + (m.inTokens * 3 + m.outTokens * 15) / 1e6, 0);
const calls = Object.values(meters).reduce((a, m) => a + m.calls, 0);

const table = [
  '| Dial | What changes | Words known, with echo | Without echo | Words in the language per line | Share of the line in the language | Learner words in the language | Learner lost (turns) | Alive | s/line | Errors |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...dials.map((d) => {
    const rs = rows.filter((r) => r.dial === d.id && !r.error);
    const lines = rs.reduce((n, r) => n + r.lines, 0);
    return `| ${d.id} | ${d.what} | ${pct(mean(rs.map((r) => r.known)))} | ${pct(mean(rs.map((r) => r.knownBare)))} | ${f1(lines ? rs.reduce((n, r) => n + r.words, 0) / lines : NaN)} | ${pct(rs.reduce((n, r) => n + r.words, 0) / rs.reduce((n, r) => n + r.allWords, 0))} | ${f1(mean(rs.map((r) => r.learnerWords)))} | ${f1(mean(rs.map((r) => r.lost)))} | ${f1(mean(rs.map((r) => r.alive)))} | ${f1(lines ? rs.reduce((n, r) => n + r.ms, 0) / lines / 1000 : NaN)} | ${rows.filter((r) => r.dial === d.id && r.error).length} |`;
  }),
];
const report = [
  `# Do the dials turn? (${language.name})`,
  '',
  `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${PEOPLE} people × ${dials.length} dials, an opening and ${TURNS} replies each, the same people for every dial · learner: A1, own words every turn, asks for help when lost · ${calls} calls, about $${cost.toFixed(2)} at $3/$15 per million tokens. Model: docs/research/leveling/07-model.md.`,
  '',
  ...table,
  '',
  '_Words known: the level.md judge, share of the conversation\'s words in the language known to the stage-1 listener ("arrived a few weeks ago"); with echo, a word said with its English counts as known. A dial turns when it moves these against the baseline by more than the spread between people._',
  '',
  '## Per person',
  '',
  '| Dial | Person | With echo | Without | Alive |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.dial} | ${r.person} | ${r.known === null ? '–' : pct(r.known)} | ${r.knownBare === null ? '–' : pct(r.knownBare)} | ${r.alive ?? '–'} |`),
  '',
  '## One conversation per dial (the first person)',
  '',
  ...dials.flatMap((d) => { const r = rows.find((x) => x.dial === d.id && !x.error); return r ? [`### ${d.id}`, '', '```', r.transcript, '```', ''] : []; }),
].join('\n');

const dir = join(process.cwd(), 'tests', 'experiments', 'leveling', 'results');
mkdirSync(dir, { recursive: true });
const name = `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}-dials-${pack.id}`;
writeFileSync(join(dir, `${name}.md`), report);
writeFileSync(join(dir, `${name}.json`), JSON.stringify(rows, null, 1));
console.log(`\n${table.join('\n')}\n\nReport: tests/experiments/leveling/results/${name}.md · ${calls} calls, about $${cost.toFixed(2)}`);
