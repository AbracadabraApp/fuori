// C1 (docs/prompt-trials.md → C1): do the examples inside beginner.md make
// characters who don't sell take food orders? "With examples" is beginner.md as
// today (run twice, to see chance); "without" is the same text with every
// example taken out (setPromptOverride, in memory, nothing on disk). Replies to
// the stored moments, judged by Claude and Grok together (docs/prompt-testing.md
// rule 5d); a reply counts when both say yes. Every reply, both verdicts and
// the guards are saved; STEP=report puts both countries in one report.
//   COUNTRY=it STEP=pilot npx tsx --env-file=.env.local tests/experiments/examples-out.mts
//   STEP=A (today's, twice) then STEP=B (examples out), once per country (COUNTRY=it, COUNTRY=es-mx)
//   STEP=report
import { writeFileSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { setPromptOverride } from '@/lib/prompts/template';
import { ask, askGrok, pool, startTest } from './common.mjs';
import { loadMoments, replay, type Moment } from './moments.mjs';

startTest('C1 (2026-11-07)');

const STEP = process.env.STEP ?? 'pilot';
const COUNTED = ['mx-beto-hungry', 'it-giorgia-pizza-offer', 'it-carla-likes-siena'];
const APART = ['mx-beto-torta']; // its earlier turns already hold the offer: reported, not counted
const RUNS = STEP === 'pilot' ? 2 : 10;
const RUNS_APART = 5;
const NAMES: Record<string, string> = { 'mx-beto-hungry': 'Beto, hungry', 'it-giorgia-pizza-offer': 'Giorgia, on the steps', 'it-carla-likes-siena': 'Carla, in the park', 'mx-beto-torta': 'Beto, torta (not counted)' };
const DIR = join(process.cwd(), 'tests', 'experiments', 'results');

/** Without examples: every parenthesis holding a quoted example, and the one unquoted example list, out of the rules (not the changelog) */
export function withoutExamples(md: string): { md: string; removed: string[] } {
  const at = md.indexOf('\n## Changelog');
  const [body, rest] = at < 0 ? [md, ''] : [md.slice(0, at), md.slice(at)];
  const removed: string[] = [];
  let out = '';
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '(') {
      let depth = 0, j = i;
      for (; j < body.length; j++) {
        if (body[j] === '(') depth++;
        else if (body[j] === ')' && --depth === 0) break;
        else if (body[j] === '\n') { j = -1; break; }
      }
      if (j > i) {
        const inner = body.slice(i, j + 1);
        if (/["“]/.test(inner) || inner === '(not the recipe, the kinds of bread)') {
          removed.push(inner);
          out = out.replace(/ $/, '');
          i = j;
          continue;
        }
      }
    }
    out += body[i];
  }
  return { md: out + rest, removed };
}

const SCHEMA = { type: 'object', properties: { offers: { type: 'boolean' }, reason: { type: 'string' } }, required: ['offers', 'reason'], additionalProperties: false };
type Verdict = { offers: boolean; reason: string };
type Part = { kind: string; text: string };
type Result = {
  moment: string; label: string; run: number; reply: string; ms: number; claude: Verdict; grok: Verdict; counts: boolean; disagree: boolean;
  guards: { words: number; langShare: number; answers: number; closingWords: number };
};

function question(m: Moment, reply: string): string {
  const who = characterForVisit(m.cityId!, m.placeId!)!;
  const before = m.transcript.slice(-2).map((t) => `${t.who === 'npc' ? who.name : 'Learner'}: ${t.text}`).join('\n');
  return [
    `${who.name} is ${who.role}. A newcomer learning ${pack.language.name} is talking with them.`,
    '',
    'Earlier:', before, `Learner: ${m.said ?? ''}`, '', `${who.name}'s reply, in parts ([english] said in English, [word] and [question] said in ${pack.language.name}, [answer] shown to the learner as something they could say back, not said by ${who.name}):`, reply, '',
    `Question: in this reply, does ${who.name} themselves offer the learner food or drink, share their own, invite the learner to have something with them, or take an order for it, when their role (${who.role}) doesn't provide food or drink? Pointing the learner to a stand, shop or restaurant, recommending one, or talking about food does not count.`,
    'Answer offers true or false, with a one-sentence reason.',
  ].join('\n');
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

async function one(m: Moment, label: string, run: number): Promise<Result> {
  const t0 = Date.now();
  const r = await replay(m) as unknown as { line: string; parts: Part[] };
  const ms = Date.now() - t0;
  const parts = r.parts ?? [];
  const reply = parts.map((p) => `[${p.kind}] ${p.text}`).join('\n');
  const q = question(m, reply);
  const [claude, grok] = await Promise.all([
    ask(q, { schema: SCHEMA, max: 600 }).then((s) => JSON.parse(s) as Verdict),
    askGrok<Verdict>(q, SCHEMA),
  ]);
  const lang = parts.filter((p) => p.kind === 'word' || p.kind === 'question');
  const langWords = lang.reduce((a, p) => a + words(p.text), 0);
  const enWords = parts.filter((p) => p.kind === 'english').reduce((a, p) => a + words(p.text), 0);
  const closing = [...parts].reverse().find((p) => p.kind === 'question');
  return {
    moment: m.id, label, run, reply, ms, claude, grok,
    counts: claude.offers && grok.offers, disagree: claude.offers !== grok.offers,
    guards: { words: words(r.line), langShare: langWords / Math.max(1, langWords + enWords), answers: parts.filter((p) => p.kind === 'answer').length, closingWords: closing ? words(closing.text) : 0 },
  };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const offers = (rs: Result[]) => rs.filter((r) => r.counts).length;
const half = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

/** The report: with examples (today's two runs averaged) against without, by moment; chance from today's two runs; guards; every reply */
function report(results: Result[], removed: string[], title: string): string {
  const today = results.filter((r) => r.label === 'A1' || r.label === 'A2' || r.label === 'A');
  const without = results.filter((r) => r.label === 'B');
  const runsOfToday = new Set(today.map((r) => r.label)).size || 1;
  const cell = (rs: Result[], ids: string[], runs: number) => {
    const xs = rs.filter((r) => ids.includes(r.moment));
    return xs.length ? `${half(offers(xs) / runs)}/${xs.length / runs}` : '–';
  };
  const ids = [...COUNTED, ...APART].filter((id) => results.some((r) => r.moment === id));
  const counted = ids.filter((id) => COUNTED.includes(id));
  const g = (rs: Result[], k: keyof Result['guards']) => mean(rs.map((r) => r.guards[k]));
  const a1 = today.filter((r) => r.label === 'A1' && counted.includes(r.moment));
  const a2 = today.filter((r) => r.label === 'A2' && counted.includes(r.moment));
  return [
    `# ${title}`, '',
    '| | With examples (today) | Without examples |', '|---|---|---|',
    `| Offers or takes an order | ${cell(today, counted, runsOfToday)} | ${cell(without, counted, 1)} |`,
    ...ids.map((id) => `| ${NAMES[id] ?? id} | ${cell(today, [id], runsOfToday)} | ${cell(without, [id], 1)} |`),
    `| Judges disagreed | ${half(today.filter((r) => r.disagree).length / runsOfToday)} | ${without.filter((r) => r.disagree).length} |`, '',
    a1.length && a2.length ? `**Chance alone:** today's prompt, run twice, gave ${offers(a1)} and ${offers(a2)} of ${a1.length}.` : '', '',
    '**Guards**', '', '| | With examples (today) | Without examples |', '|---|---|---|',
    `| Words per turn | ${g(today, 'words').toFixed(1)} | ${g(without, 'words').toFixed(1)} |`,
    `| Share in the language | ${Math.round(100 * g(today, 'langShare'))}% | ${Math.round(100 * g(without, 'langShare'))}% |`,
    `| Answers offered | ${g(today, 'answers').toFixed(1)} | ${g(without, 'answers').toFixed(1)} |`,
    `| Words in the closing question | ${g(today, 'closingWords').toFixed(1)} | ${g(without, 'closingWords').toFixed(1)} |`,
    `| Reply time | ${(mean(today.map((r) => r.ms)) / 1000).toFixed(1)} s | ${(mean(without.map((r) => r.ms)) / 1000).toFixed(1)} s |`, '',
    ...(removed.length ? ['## Taken out without examples', '', ...removed.map((x) => `- ${x}`), ''] : []),
    '## Every reply', '',
    ...results.map((r) => [`### ${r.label === 'B' ? 'without' : `with (${r.label})`} · ${NAMES[r.moment] ?? r.moment} · run ${r.run + 1}${r.counts ? ' · OFFERS' : ''}${r.disagree ? ' · JUDGES DISAGREE' : ''}`, '', '```', r.reply, '```', `- Claude ${r.claude.offers ? 'yes' : 'no'}: ${r.claude.reason}`, `- Grok ${r.grok.offers ? 'yes' : 'no'}: ${r.grok.reason}`, ''].join('\n')),
  ].join('\n');
}

const stamp = () => new Date().toISOString().slice(0, 16).replace(':', '');
mkdirSync(DIR, { recursive: true });

if (STEP === 'report') {
  // The newest A and B run of each country
  const files = readdirSync(DIR).filter((f) => /^c1-.+-(A|B)-.+\.json$/.test(f)).sort();
  const newest = new Map<string, string>();
  for (const f of files) newest.set(f.replace(/-\d{4}-\d{2}-\d{2}T\d{4}\.json$/, ''), f);
  const all = [...newest.values()].map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')) as { removed: string[]; results: Result[] });
  const file = join(DIR, `c1-report-${stamp()}.md`);
  writeFileSync(file, report(all.flatMap((x) => x.results), all.flatMap((x) => x.removed), 'C1: do the examples in beginner.md make characters who don\'t sell take orders?') + `\n\nFrom: ${[...newest.values()].join(', ')}\n`);
  console.log(`→ ${file.replace(process.cwd() + '/', '')}`);
  process.exit(0);
}

const moments = loadMoments().filter((m) => (STEP === 'pilot' ? m.id === 'it-giorgia-pizza-offer' : [...COUNTED, ...APART].includes(m.id)));
if (!moments.length) { console.log(`${pack.id}: no C1 moments here`); process.exit(0); }

const plan: { version: 'A' | 'B'; label: string }[] =
  STEP === 'pilot' ? [{ version: 'A', label: 'A' }, { version: 'B', label: 'B' }]
  : STEP === 'A' ? [{ version: 'A', label: 'A1' }, { version: 'A', label: 'A2' }]
  : [{ version: 'B', label: 'B' }];

let removed: string[] = [];
const results: Result[] = [];
for (const { version, label } of plan) {
  setPromptOverride('beginner.md', version === 'B' ? (md) => { const x = withoutExamples(md); removed = x.removed; return x.md; } : null);
  const jobs = moments.flatMap((m) => Array.from({ length: APART.includes(m.id) ? RUNS_APART : RUNS }, (_, run) => () => one(m, label, run)));
  results.push(...await pool(jobs, 6));
}
setPromptOverride('beginner.md', null);

const file = join(DIR, `c1-${pack.id}-${STEP}-${stamp()}`);
writeFileSync(`${file}.json`, JSON.stringify({ removed, results }, null, 1));
writeFileSync(`${file}.md`, report(results, removed, `C1 ${STEP}, ${pack.id}`));
console.log(`${STEP} ${pack.id}: today ${offers(results.filter((r) => r.label !== 'B' && !APART.includes(r.moment)))}, without ${offers(results.filter((r) => r.label === 'B' && !APART.includes(r.moment)))} offers · ${results.filter((r) => r.disagree).length} disagreements\n→ ${file.replace(process.cwd() + '/', '')}.md`);
