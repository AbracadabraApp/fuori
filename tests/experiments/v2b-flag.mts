// V2b part 1 (docs/prompt-trials.md → V2): how often does each problem show
// in real play? Every character turn of the same conversations as V2 is asked
// each item's fixed yes/no question, one call per question (narrow judges, F1);
// no free-form marker, no replays. Part 2 replays the flagged turns once these
// flags have been read. Item 9 (grammar) is a proposed item (prompt-testing.md,
// proposal 23). Stops starting new checks after STOP_MIN minutes.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/v2b-flag.mts tests/experiments/out/admin.json 6
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { ask, pool } from './common.mjs';

type Row = { id: string; learner_id: string; character_id: string; place_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: string; text: string; parts?: { kind: string; text: string }[] }[] };

/** V2's questions, unchanged, and the proposed item 9; "yes" means the problem is there */
export const QUESTIONS: Record<number, string> = {
  1: 'Would a learner at this level be unable to follow the parts of this reply in the language (words or grammar well beyond them)?',
  2: 'Does the reply state something false or invented about the place, the town, its food or the country?',
  3: 'Is the reply generic, with nothing of her place, town or country, at a turn where a local would naturally have said something of it?',
  4: 'Does she step out of her role or her job: offering or doing what her job or her place can\'t give, or talking like a language teacher?',
  5: 'Did the learner need help or ask for it (in English or the language), and the reply fails to give it?',
  6: 'Does the reply lecture, point out a mistake like a teacher, or offer answers to say back that a learner couldn\'t use (too long, two ideas, not what a local would say)?',
  8: 'Is the reply too long or too dense for a learner at this level to follow in one hearing?',
  9: 'Does the reply contain a grammar mistake in the language (agreement, articles, verb forms, prepositions) that a native speaker would notice? English glosses and [say back: …] count too, if they are in the language.',
};
const ITEMS = Object.keys(QUESTIONS).map(Number);

const [input, perCountryArg] = process.argv.slice(2);
const perCountry = Number(perCountryArg ?? 5);
const since = process.env.SINCE ?? '2026-11-01';
const STOP_MIN = Number(process.env.STOP_MIN ?? 5);
const started = Date.now();
const late = () => (Date.now() - started) / 60000 > STOP_MIN;

const shown = (t: Row['turns'][number]) => {
  const answers = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
  return answers.length ? `${t.text}  [say back: ${answers.join(' | ')}]` : t.text;
};
const levelOf = (v: string) => (v.startsWith('beginner') ? 'beginner' : 'intermediate');

// The same selection as V2
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[])
  .filter((x) => x.started_at >= since && !/^(lesson|onboarding|magda)/.test(x.prompt_version))
  .filter((x) => x.turns.filter((t) => t.who === 'learner').length >= 3)
  .filter((x) => characterForVisit(x.city_id, x.place_id)?.id === x.character_id)
  .sort((a, b) => b.started_at.localeCompare(a.started_at))
  .slice(0, perCountry);

const SCHEMA = { type: 'object', additionalProperties: false, required: ['broken', 'quote', 'reason'], properties: { broken: { type: 'boolean' }, quote: { type: 'string' }, reason: { type: 'string' } } };

const jobs = rows.flatMap((x) => {
  const c = characterForVisit(x.city_id, x.place_id)!;
  return x.turns.flatMap((t, turn) => t.who === 'learner' ? [] : ITEMS.map((item) => async () => {
    if (late()) return null;
    const before = x.turns.slice(0, turn).map((u) => `${u.who === 'learner' ? 'Learner' : c.name}: ${u.who === 'learner' ? u.text : shown(u)}`).join('\n');
    const out = await ask(`A turn in a ${pack.language.name} learning conversation. The learner is a ${levelOf(x.prompt_version)}, speaking with ${c.name}, ${c.role}, in ${x.city_id}; the learner's lines are speech-to-text and may be misheard. Glosses in lowercase English after a phrase, and [say back: …], are shown on screen to help the learner.

The conversation before it:
${before || '(this is the opening line)'}

${c.name}'s reply:
${shown(t)}

${QUESTIONS[item]} Answer broken: true only if clearly yes. If yes, quote the words; reason in one sentence.`, { schema: SCHEMA, max: 600 });
    return { conversation: x.id, character: c.name, version: x.prompt_version, turn, item, line: shown(t), ...(JSON.parse(out) as { broken: boolean; quote: string; reason: string }) };
  }));
});
const res = (await pool(jobs, 8)).filter((r): r is NonNullable<typeof r> => !!r);

const turns = new Set(res.map((r) => `${r.conversation}:${r.turn}`)).size;
const flagged = res.filter((r) => r.broken);
const minutes = (Date.now() - started) / 60000;
const byItem = ITEMS.map((i) => `item ${i}: ${flagged.filter((r) => r.item === i).length}/${res.filter((r) => r.item === i).length}`).join(' · ');
const summary = [
  `${pack.id} · ${rows.length} conversations · ${turns} character turns · ${res.length} of ${jobs.length} checks done · ${flagged.length} flagged · ${new Set(flagged.map((r) => `${r.conversation}:${r.turn}`)).size} turns with a flag`,
  byItem,
  `minutes: ${minutes.toFixed(1)}${late() ? ` (stopped at ${STOP_MIN})` : ''}`,
];
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `v2b-flag-${pack.id}-${new Date().toISOString().slice(0, 10)}`);
writeFileSync(`${file}.json`, JSON.stringify({ questions: QUESTIONS, rows: rows.map((x) => x.id), checks: res }, null, 1));
writeFileSync(`${file}.md`, [
  `# V2b part 1, ${pack.id}: flags`, '', ...summary.map((l) => `- ${l}`), '', '## Questions', '', ...ITEMS.map((i) => `- ${i}: ${QUESTIONS[i]}`), '',
  ...ITEMS.flatMap((i) => [`## Item ${i}: ${flagged.filter((r) => r.item === i).length} flagged`, '', ...flagged.filter((r) => r.item === i).map((r) => `- **${r.character}** (${r.version}, ${r.conversation.slice(0, 8)}, turn ${r.turn}): "${r.quote}". ${r.reason}\n  > ${r.line}`), '']),
].join('\n'));
console.log(summary.join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
