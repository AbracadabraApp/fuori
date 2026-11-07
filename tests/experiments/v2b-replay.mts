// V2b part 2: do the problems flagged in part 1 come back when the turn is
// replayed as a moment? Takes the flags read as real (conversation:turn:item),
// rebuilds each turn as a moment from the admin export (the conversation
// before it, the learner's line, the stage from the prompt version; no
// memory), replays it with today's prompts and asks the same item question.
// Base rate: the character's last unflagged turn in the same conversation,
// replayed the same way with the same question.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/v2b-replay.mts tests/experiments/out/admin.json 56386f4b:8:1 ac9bddd0:6:9 [runs]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { replay, type Moment } from './moments.mjs';
import { ask, pool } from './common.mjs';
import { QUESTIONS } from './v2-questions.mjs';

type Row = { id: string; character_id: string; place_id: string; city_id: string; prompt_version: string; turns: { who: string; text: string; en?: string; parts?: { kind: string; text: string }[] }[] };

const args = process.argv.slice(2);
const input = args[0];
const flags = args.slice(1).filter((a) => a.includes(':')).map((a) => { const [id, turn, item] = a.split(':'); return { id, turn: Number(turn), item: Number(item) }; });
const runs = Number(args.slice(1).find((a) => !a.includes(':')) ?? 5);
const all = JSON.parse(readFileSync(input, 'utf8')) as Row[];

const shown = (t: { text: string; parts?: { kind: string; text: string }[] }) => {
  const answers = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
  return answers.length ? `${t.text}  [say back: ${answers.join(' | ')}]` : t.text;
};
const levelOf = (v: string) => (v.startsWith('beginner') ? 'beginner' : 'intermediate') as Moment['level'];
const SCHEMA = { type: 'object', additionalProperties: false, required: ['broken', 'quote', 'reason'], properties: { broken: { type: 'boolean' }, quote: { type: 'string' }, reason: { type: 'string' } } };

/** The same check as part 1 */
async function check(x: Row, name: string, role: string, turn: number, item: number, reply: string) {
  const before = x.turns.slice(0, turn).map((u) => `${u.who === 'learner' ? 'Learner' : name}: ${u.who === 'learner' ? u.text : shown(u)}`).join('\n');
  const out = await ask(`A turn in a ${pack.language.name} learning conversation. The learner is a ${levelOf(x.prompt_version)}, speaking with ${name}, ${role}, in ${x.city_id}; the learner's lines are speech-to-text and may be misheard. Glosses in lowercase English after a phrase, and [say back: …], are shown on screen to help the learner.

The conversation before it:
${before || '(this is the opening line)'}

${name}'s reply:
${reply}

${QUESTIONS[item]} Answer broken: true only if clearly yes. If yes, quote the words; reason in one sentence.`, { schema: SCHEMA, max: 600 });
  return JSON.parse(out) as { broken: boolean; quote: string; reason: string };
}

async function replayTurn(x: Row, turn: number, item: number) {
  const c = characterForVisit(x.city_id, x.place_id)!;
  const prior = x.turns.slice(0, turn);
  const said = prior.at(-1)?.who === 'learner' ? prior.at(-1)!.text : undefined;
  const transcript = (said ? prior.slice(0, -1) : prior).map((t) => ({ who: (t.who === 'learner' ? 'learner' : 'npc') as 'npc' | 'learner', text: t.text, ...(t.en ? { en: t.en } : {}) }));
  const stage = x.prompt_version.match(/\+(S\d)/)?.[1] as Moment['stage'];
  const moment: Moment = { id: `v2b-${x.id.slice(0, 8)}-${turn}`, country: pack.id, kind: 'town', level: levelOf(x.prompt_version), ...(stage ? { stage } : {}), cityId: x.city_id, placeId: x.place_id, transcript, ...(said ? { said } : {}), watch: QUESTIONS[item], from: { who: 'V2b', date: '2026-11-07', quote: '' } };
  const replays = await Promise.all(Array.from({ length: runs }, async () => {
    const r = await replay(moment) as { line: string; parts?: { kind: string; text: string }[] };
    const line = shown({ text: r.line, parts: r.parts });
    return { line, ...(await check(x, c.name, c.role, turn, item, line)) };
  }));
  return { conversation: x.id, character: c.name, version: x.prompt_version, turn, item, original: shown(x.turns[turn]), replays };
}

const jobs = flags.flatMap((f) => {
  const x = all.find((r) => r.id.startsWith(f.id))!;
  const base = x.turns.map((_, i) => i).filter((i) => i > 0 && x.turns[i].who !== 'learner' && !flags.some((g) => x.id.startsWith(g.id) && g.turn === i)).at(-1);
  return [
    async () => ({ kind: 'flagged' as 'flagged' | 'base', ...(await replayTurn(x, f.turn, f.item)) }),
    ...(base === undefined ? [] : [async () => ({ kind: 'base' as 'flagged' | 'base', ...(await replayTurn(x, base, f.item)) })]),
  ];
});
const res = await pool(jobs, 4);
const came = (r: { replays: { broken: boolean }[] }) => r.replays.filter((p) => p.broken).length;
const summary = res.map((r) => `${r.kind} ${r.character} ${r.conversation.slice(0, 8)} turn ${r.turn} item ${r.item}: ${came(r)}/${r.replays.length}`);
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `v2b-replay-${pack.id}-${new Date().toISOString().slice(0, 10)}`);
writeFileSync(`${file}.json`, JSON.stringify(res, null, 1));
writeFileSync(`${file}.md`, [`# V2b part 2, ${pack.id}: flagged turns replayed ${runs}x`, '', ...summary.map((l) => `- ${l}`), '',
  ...res.flatMap((r) => [`## ${r.kind}: ${r.character} (${r.version}, ${r.conversation.slice(0, 8)}, turn ${r.turn}) · item ${r.item} · ${came(r)}/${r.replays.length}`, '', `**Question:** ${QUESTIONS[r.item]}`, '', `- original: ${r.original}`, ...r.replays.map((p) => `- ${p.broken ? '✗' : '✓'} ${p.line}\n  _${p.broken ? `"${p.quote}" ` : ''}${p.reason}_`), '']),
].join('\n'));
console.log(summary.join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
