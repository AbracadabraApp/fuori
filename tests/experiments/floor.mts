// C2 (docs/prompt-trials.md → C2): the floor prompt against the frozen one:
// does she stay in role? "Frozen" is the Beginner prompt as the game sends it
// (beginner.md, dialogue.md's every-conversation rules, the stage text);
// "floor" is only what the game can't work without: the game's own
// who-and-where line and the reply format (setPromptOverride, in memory,
// nothing on disk; no stage text). Judged by Claude and Grok together
// (docs/prompt-testing.md rule 5d); a reply counts when both say yes. Every
// reply, both verdicts and the guards are saved; STEP=report puts both
// countries in one report.
//   COUNTRY=it STEP=pilot npx tsx --env-file=.env.local tests/experiments/floor.mts
//   STEP=run, once per country (COUNTRY=it, COUNTRY=es-mx); then STEP=report
import { writeFileSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { setPromptOverride } from '@/lib/prompts/template';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES } from '@/lib/path';
import { ask, askGrok, pool, startTest } from './common.mjs';
import { loadMoments, replay, asTurns, type Moment } from './moments.mjs';
import { FLOOR, noRules } from './floor-prompt.mjs';

startTest('C2 (2026-11-07)');

const STEP = process.env.STEP ?? 'pilot';
const MOMENTS = ['it-giorgia-opening-return', 'it-giorgia-pizza-offer', 'it-carla-likes-siena', 'mx-beto-hungry'];
const PILOT = ['it-giorgia-opening-return', 'mx-beto-hungry'];
const RUNS = STEP === 'pilot' ? 2 : 10;
const NAMES: Record<string, string> = { 'it-giorgia-opening-return': 'Giorgia, her first line', 'it-giorgia-pizza-offer': 'Giorgia, later', 'it-carla-likes-siena': 'Carla, in the park', 'mx-beto-hungry': 'Beto, hungry' };
const DIR = join(process.cwd(), 'tests', 'experiments', 'results');

const SCHEMA = { type: 'object', properties: { offers: { type: 'boolean' }, reason: { type: 'string' } }, required: ['offers', 'reason'], additionalProperties: false };
type Verdict = { offers: boolean; reason: string };
type Part = { kind: string; text: string };
type Result = {
  moment: string; label: 'frozen' | 'floor'; run: number; reply: string; ms: number; parsed: boolean; claude?: Verdict; grok?: Verdict; counts: boolean; disagree: boolean;
  guards: { words: number; langShare: number; answers: number; closingWords: number; questions: number };
};

function question(m: Moment, reply: string): string {
  const who = characterForVisit(m.cityId!, m.placeId!)!;
  const before = m.transcript.slice(-2).map((t) => `${t.who === 'npc' ? who.name : 'Learner'}: ${t.text}`);
  return [
    `${who.name} is ${who.role}. A newcomer learning ${pack.language.name} is talking with them.`,
    '',
    ...(before.length || m.said ? ['Earlier:', ...before, ...(m.said ? [`Learner: ${m.said}`] : []), ''] : ['This is the first thing they say.', '']),
    `${who.name}'s reply, in parts ([english] said in English, [word] and [question] said in ${pack.language.name}, [answer] shown to the learner as something they could say back, not said by ${who.name}):`, reply, '',
    `Question: in this reply, does ${who.name} themselves give, offer or share food or drink now, or take an order for it, when their role (${who.role}) doesn't provide food or drink? Offering a piece of their own food counts. Suggesting they go somewhere together another day, pointing the learner to a stand, shop or restaurant, recommending one, or talking about food does not count.`,
    'Answer offers true or false, with a one-sentence reason.',
  ].join('\n');
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** The floor's turn: the moment as the game would play it, with no stage text */
async function floorTurn(m: Moment, now = new Date()) {
  const character = characterForVisit(m.cityId!, m.placeId!)!;
  const memory = m.memory ? { visits: m.memory.visits, lastVisit: new Date(now.getTime() - m.memory.daysAgo * 86_400_000).toISOString(), notes: m.memory.notes } : undefined;
  return runBeginnerTurn({ character, transcript: asTurns(m), learnerSaid: m.said, memory: memory as never, now, maxAnswers: STAGES[m.stage ?? 'S2'].answers, withDone: true });
}

async function one(m: Moment, label: Result['label'], run: number): Promise<Result> {
  const t0 = Date.now();
  let r: { line: string; parts: Part[] } | null = null;
  try {
    r = (label === 'floor' ? await floorTurn(m) : await replay(m)) as unknown as { line: string; parts: Part[] };
  } catch (e) {
    // The format guard: a reply that doesn't parse is counted, not hidden
    return { moment: m.id, label, run, reply: `(no reply: ${(e as Error).message})`, ms: Date.now() - t0, parsed: false, counts: false, disagree: false, guards: { words: 0, langShare: 0, answers: 0, closingWords: 0, questions: 0 } };
  }
  const ms = Date.now() - t0;
  const parts = r.parts ?? [];
  const reply = parts.map((p) => `[${p.kind}] ${p.text}`).join('\n');
  const q = question(m, reply);
  const [claude, grok] = await Promise.all([
    ask(q, { schema: SCHEMA, max: 600 }).then((s) => JSON.parse(s) as Verdict),
    askGrok<Verdict>(q, SCHEMA),
  ]);
  const langWords = parts.filter((p) => p.kind === 'word' || p.kind === 'question').reduce((a, p) => a + words(p.text), 0);
  const enWords = parts.filter((p) => p.kind === 'english').reduce((a, p) => a + words(p.text), 0);
  const qs = parts.filter((p) => p.kind === 'question');
  return {
    moment: m.id, label, run, reply, ms, parsed: true, claude, grok,
    counts: claude.offers && grok.offers, disagree: claude.offers !== grok.offers,
    guards: { words: words(r.line), langShare: langWords / Math.max(1, langWords + enWords), answers: parts.filter((p) => p.kind === 'answer').length, closingWords: qs.length ? words(qs[qs.length - 1].text) : 0, questions: qs.length },
  };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const offers = (rs: Result[]) => rs.filter((r) => r.counts).length;

function report(results: Result[], title: string): string {
  const frozen = results.filter((r) => r.label === 'frozen');
  const floor = results.filter((r) => r.label === 'floor');
  const ids = MOMENTS.filter((id) => results.some((r) => r.moment === id));
  const cell = (rs: Result[], only?: string) => { const xs = rs.filter((r) => !only || r.moment === only); return xs.length ? `${offers(xs)}/${xs.length}` : '–'; };
  const g = (rs: Result[], k: keyof Result['guards']) => mean(rs.filter((r) => r.parsed).map((r) => r.guards[k]));
  const fmt = (rs: Result[]) => `${rs.filter((r) => r.parsed).length}/${rs.length} parse, ${rs.filter((r) => r.parsed && r.guards.questions === 1).length} with one question`;
  return [
    `# ${title}`, '',
    '| | Frozen prompt (today) | Floor |', '|---|---|---|',
    `| Offers or takes an order | ${cell(frozen)} | ${cell(floor)} |`,
    ...ids.map((id) => `| ${NAMES[id] ?? id} | ${cell(frozen, id)} | ${cell(floor, id)} |`),
    `| Judges disagreed | ${frozen.filter((r) => r.disagree).length} | ${floor.filter((r) => r.disagree).length} |`, '',
    '**Guards**', '', '| | Frozen prompt (today) | Floor |', '|---|---|---|',
    `| Reply format | ${fmt(frozen)} | ${fmt(floor)} |`,
    `| Words per turn | ${g(frozen, 'words').toFixed(1)} | ${g(floor, 'words').toFixed(1)} |`,
    `| Share in the language | ${Math.round(100 * g(frozen, 'langShare'))}% | ${Math.round(100 * g(floor, 'langShare'))}% |`,
    `| Answers offered | ${g(frozen, 'answers').toFixed(1)} | ${g(floor, 'answers').toFixed(1)} |`,
    `| Words in the closing question | ${g(frozen, 'closingWords').toFixed(1)} | ${g(floor, 'closingWords').toFixed(1)} |`,
    `| Reply time | ${(mean(frozen.map((r) => r.ms)) / 1000).toFixed(1)} s | ${(mean(floor.map((r) => r.ms)) / 1000).toFixed(1)} s |`, '',
    '## Every reply', '',
    ...results.map((r) => [`### ${r.label} · ${NAMES[r.moment] ?? r.moment} · run ${r.run + 1}${r.counts ? ' · OFFERS' : ''}${r.disagree ? ' · JUDGES DISAGREE' : ''}`, '', '```', r.reply, '```', ...(r.claude && r.grok ? [`- Claude ${r.claude.offers ? 'yes' : 'no'}: ${r.claude.reason}`, `- Grok ${r.grok.offers ? 'yes' : 'no'}: ${r.grok.reason}`] : []), ''].join('\n')),
  ].join('\n');
}

const stamp = () => new Date().toISOString().slice(0, 16).replace(':', '');
mkdirSync(DIR, { recursive: true });

if (STEP === 'report') {
  const files = readdirSync(DIR).filter((f) => /^c2-.+-run-.+\.json$/.test(f)).sort();
  const newest = new Map<string, string>();
  for (const f of files) newest.set(f.replace(/-\d{4}-\d{2}-\d{2}T\d{4}\.json$/, ''), f);
  const results = [...newest.values()].flatMap((f) => (JSON.parse(readFileSync(join(DIR, f), 'utf8')) as { results: Result[] }).results);
  const file = join(DIR, `c2-report-${stamp()}.md`);
  writeFileSync(file, report(results, 'C2: the floor prompt against the frozen one: does she stay in role?') + `\n\nFrom: ${[...newest.values()].join(', ')}\n`);
  console.log(`→ ${file.replace(process.cwd() + '/', '')}`);
  process.exit(0);
}

const moments = loadMoments().filter((m) => (STEP === 'pilot' ? PILOT : MOMENTS).includes(m.id));
if (!moments.length) { console.log(`${pack.id}: no C2 moments here`); process.exit(0); }

const results: Result[] = [];
// The frozen prompt first, with nothing overridden
results.push(...await pool(moments.flatMap((m) => Array.from({ length: RUNS }, (_, run) => () => one(m, 'frozen', run))), 6));
// Then the floor; stop early if it reaches 6 slips in its first half (the card's stop rule)
setPromptOverride('beginner.md', () => FLOOR);
setPromptOverride('dialogue.md', noRules);
const half = Math.ceil(RUNS / 2);
for (const runs of STEP === 'pilot' ? [[0, RUNS]] : [[0, half], [half, RUNS]]) {
  results.push(...await pool(moments.flatMap((m) => Array.from({ length: runs[1] - runs[0] }, (_, k) => () => one(m, 'floor', runs[0] + k))), 6));
  if (STEP !== 'pilot' && offers(results.filter((r) => r.label === 'floor')) >= 6) { console.log('Stopped: the floor reached 6 slips in its first half'); break; }
}
setPromptOverride('beginner.md', null);
setPromptOverride('dialogue.md', null);

const file = join(DIR, `c2-${pack.id}-${STEP}-${stamp()}`);
writeFileSync(`${file}.json`, JSON.stringify({ results }, null, 1));
writeFileSync(`${file}.md`, report(results, `C2 ${STEP}, ${pack.id}`));
const fr = results.filter((r) => r.label === 'frozen'), fl = results.filter((r) => r.label === 'floor');
console.log(`${STEP} ${pack.id}: frozen ${offers(fr)}/${fr.length}, floor ${offers(fl)}/${fl.length} offer · parse ${fl.filter((r) => r.parsed).length}/${fl.length} · ${results.filter((r) => r.disagree).length} disagreements\n→ ${file.replace(process.cwd() + '/', '')}.md`);
