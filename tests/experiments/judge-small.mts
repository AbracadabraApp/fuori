// A small first test of an automated judge (Josh, 2026-11-07: "testing has to
// be automated", "use grok as judge", "build better judges", "small test first").
// One item, at their level (docs/prompt-testing.md item 1), on lines whose right
// answer is known without anyone marking them: real Beginner replies from the
// admin export (taken as fine), a copy of each with only its question made too
// hard on purpose (a planted fault; PLANT=subtle makes it one step too hard, the default since the first run's were too obvious), and the two real too-hard questions V2b
// found. Claude and Grok judge each line with the level's design and the place
// given; scored against the known answers. Test scripts only: the game never
// calls Grok.
//   npx tsx --env-file=.env.local tests/experiments/judge-small.mts tests/experiments/out/admin.json [originals]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { ask, pool } from './common.mjs';

const GROK_MODEL = process.env.GROK_MODEL ?? 'grok-4.7';
type Part = { kind: string; text: string };
type Row = { id: string; character_id: string; place_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: string; text: string; parts?: Part[] }[] };

const [input, nArg] = process.argv.slice(2);
const n = Number(nArg ?? 7);
const all = JSON.parse(readFileSync(input, 'utf8')) as Row[];
const v2b = new Set(['it', 'es-mx'].flatMap((c) => (JSON.parse(readFileSync(`tests/experiments/results/v2b-flag-${c}-2026-11-07.json`, 'utf8')).rows as string[])));

const LEVEL = 'Her turns to a Beginner are designed this way: a sentence or two of spoken English to set the scene or explain (by design, not a problem), then in the language a word or short phrase or two, one question, and short answers the learner can say back. A Beginner knows greetings, numbers, the present tense of common verbs and everyday words for food, places and people.';
const QUESTION = 'Look only at the parts in the language. Do they use words or grammar well beyond a Beginner (past or future tenses, the subjunctive, idioms, long or stacked clauses) that nothing in the same turn makes followable (her English, the answers to say back)?';
const SCHEMA = { type: 'object', additionalProperties: false, required: ['broken', 'quote', 'reason'], properties: { broken: { type: 'boolean' }, quote: { type: 'string' }, reason: { type: 'string' } } };

function setting(x: Row) {
  const city = cities.find((c) => c.id === x.city_id)!;
  const place = city.places.find((p) => p.id === x.place_id)!;
  const c = characterForVisit(x.city_id, x.place_id)!;
  return { name: c.name, text: `${c.name}, ${c.role}, at ${place.name} (${place.kind}${place.neighbourhood ? `, ${place.neighbourhood}` : ''}), ${city.name}, ${city.region}.` };
}
const asParts = (parts: Part[]) => parts.map((p) => `[${p.kind}] ${p.text}`).join('\n');

function prompt(x: Row, turn: number, parts: Part[]) {
  const s = setting(x);
  const before = x.turns.slice(0, turn).map((u) => `${u.who === 'learner' ? 'Learner' : s.name}: ${u.text}`).join('\n');
  return `A turn in a ${pack.language.name} learning conversation. ${s.text} The learner is a Beginner; their lines are speech-to-text and may be misheard.

${LEVEL}

The conversation before it:
${before || '(this is the opening line)'}

${s.name}'s reply, in its parts (english is spoken to the learner; word and question are in ${pack.language.name}; answer is shown on screen for the learner to say back):
${asParts(parts)}

${QUESTION} Answer broken: true only if clearly yes. If yes, quote the words; reason in one sentence. Reply as JSON: {"broken": boolean, "quote": string, "reason": string}.`;
}

async function grok(content: string) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
      body: JSON.stringify({ model: GROK_MODEL, messages: [{ role: 'user', content }], response_format: { type: 'json_schema', json_schema: { name: 'verdict', schema: SCHEMA, strict: true } } }),
    });
    if (r.ok) return JSON.parse((await r.json()).choices[0].message.content) as { broken: boolean; quote: string; reason: string };
    if (attempt >= 3 || (r.status !== 429 && r.status < 500)) throw new Error(`grok ${r.status}: ${await r.text()}`);
    await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
  }
}
const claude = async (content: string) => JSON.parse(await ask(content, { schema: SCHEMA, max: 600 })) as { broken: boolean; quote: string; reason: string };

// Originals: the latest Beginner town conversations outside V2b's, one turn each with a question, from this country
const here = new Set(cities.map((c) => c.id));
const picked = all
  .filter((x) => here.has(x.city_id) && !v2b.has(x.id) && x.prompt_version.startsWith('beginner') && characterForVisit(x.city_id, x.place_id)?.id === x.character_id)
  .sort((a, b) => b.started_at.localeCompare(a.started_at))
  .map((x) => ({ x, turn: x.turns.findIndex((t, i) => i > 0 && t.who !== 'learner' && t.parts?.some((p) => p.kind === 'question')) }))
  .filter((p) => p.turn > 0)
  .slice(0, n);

// The planted fault: the same reply with only its question made too hard for a Beginner
async function plant(parts: Part[]): Promise<Part[]> {
  const q = parts.find((p) => p.kind === 'question')!;
  const harder = await ask(`Rewrite this ${pack.language.name} question one step beyond a Beginner, the way real replies slip: change only one thing (the verb to a past or near-future tense, or one less common word), keep it as short as it is, about the same thing and natural for a local. Reply with the question only.\n\n${q.text}`, { max: 1000 });
  return parts.map((p) => (p === q ? { ...p, text: harder } : p));
}

type Line = { label: string; conversation: string; turn: number; known: boolean; parts: Part[]; x: Row };
const lines: Line[] = [];
for (const p of picked) {
  const parts = p.x.turns[p.turn].parts!;
  lines.push({ label: 'original', conversation: p.x.id, turn: p.turn, known: false, parts, x: p.x });
  lines.push({ label: 'planted', conversation: p.x.id, turn: p.turn, known: true, parts: await plant(parts), x: p.x });
}
// The real ones V2b found, when this country holds them
for (const [id, turn] of [['56386f4b', 8], ['858fc586', 26]] as const) {
  const x = all.find((r) => r.id.startsWith(id) && here.has(r.city_id));
  if (x?.turns[turn]?.parts) lines.push({ label: 'real (V2b)', conversation: x.id, turn, known: true, parts: x.turns[turn].parts!, x });
}

const judged = await pool(lines.map((l) => async () => {
  const content = prompt(l.x, l.turn, l.parts);
  const [c, g] = await Promise.all([claude(content), grok(content)]);
  return { ...l, claude: c, grok: g };
}), 6);

const right = (v: { broken: boolean }, l: Line) => v.broken === l.known;
const score = (pick: (j: typeof judged[number]) => boolean | null) => {
  const decided = judged.filter((j) => pick(j) !== null);
  return `${decided.filter((j) => pick(j) === j.known).length}/${decided.length}`;
};
const summary = [
  `${pack.id} · ${judged.length} lines (${judged.filter((j) => j.known).length} with the problem) · Grok ${GROK_MODEL}`,
  `right: Claude ${score((j) => j.claude.broken)} · Grok ${score((j) => j.grok.broken)} · when they agree ${score((j) => (j.claude.broken === j.grok.broken ? j.claude.broken : null))} · they disagree on ${judged.filter((j) => j.claude.broken !== j.grok.broken).length}`,
  `by kind: ${['original', 'planted', 'real (V2b)'].map((k) => { const js = judged.filter((j) => j.label === k); return js.length ? `${k} Claude ${js.filter((j) => right(j.claude, j)).length}/${js.length}, Grok ${js.filter((j) => right(j.grok, j)).length}/${js.length}` : ''; }).filter(Boolean).join(' · ')}`,
];
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `judge-small-${pack.id}-${new Date().toISOString().slice(0, 10)}`);
writeFileSync(`${file}.json`, JSON.stringify(judged.map(({ x, ...j }) => j), null, 1));
writeFileSync(`${file}.md`, [`# Judge, small test: at their level (item 1), ${pack.id}`, '', ...summary.map((l) => `- ${l}`), '', `**Question:** ${QUESTION}`, '',
  ...judged.flatMap((j) => [`## ${j.label}${j.known ? ' (has the problem)' : ' (taken as fine)'}: ${j.conversation.slice(0, 8)} turn ${j.turn} · Claude ${right(j.claude, j) ? '✓' : '✗'} · Grok ${right(j.grok, j) ? '✓' : '✗'}`, '', '```', asParts(j.parts), '```', `- Claude ${j.claude.broken ? 'yes' : 'no'}: ${j.claude.reason}`, `- Grok ${j.grok.broken ? 'yes' : 'no'}: ${j.grok.reason}`, '']),
].join('\n'));
console.log(summary.join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
