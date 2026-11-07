// V2, rewritten with Josh (docs/prompt-testing.md → the queue): moments vs
// conversations, the problem side. Can a character falling out of role, seen in
// a real conversation, also be seen and recreated in a moment?
//   Part 1: Claude and Grok each read whole real conversations and mark every
//   out-of-role reply; every mark is then checked by both with only the moment
//   (the reply and the line before it). Still seen?
//   Part 2: the marks both judges made, each rebuilt as a moment (the
//   conversation before it, the learner's line, the stage; no memory) and
//   replayed 5x with today's prompt; both judges check each replay. Out of role
//   again in at least 2 of 5?
// JUDGMENT (rule 7b): every line is read. Stops starting new calls after STOP_MIN minutes.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/v2-role.mts 1 tests/experiments/out/admin.json [conversations]
//   (IDS=c8287331,811b6fb9 reads only those conversations, for a known complaint older than the latest ones)
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/v2-role.mts 2 tests/experiments/out/admin.json [runs]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { replay, type Moment } from './moments.mjs';
import { ask, askGrok, pool } from './common.mjs';

type Part = { kind: string; text: string };
type Row = { id: string; character_id: string; place_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: string; text: string; en?: string; parts?: Part[] }[] };
type Verdict = { broken: boolean; quote: string; reason: string };
type Marks = { marks: { turn: number; quote: string; reason: string }[] };

const [part, input, nArg] = process.argv.slice(2);
const STOP_MIN = Number(process.env.STOP_MIN ?? 5);
const started = Date.now();
const late = () => (Date.now() - started) / 60000 > STOP_MIN;
const all = JSON.parse(readFileSync(input, 'utf8')) as Row[];
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const day = new Date().toISOString().slice(0, 10);
const file1 = join(dir, `v2-role-part1-${pack.id}${process.env.IDS ? '-chosen' : ''}-${day}`);
const file2 = join(dir, `v2-role-part2-${pack.id}${process.env.IDS ? '-chosen' : ''}-${day}`);

const shown = (t: { text: string; parts?: Part[] }) => {
  const answers = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
  return answers.length ? `${t.text}  [say back: ${answers.join(' | ')}]` : t.text;
};
const levelOf = (v: string) => (v.startsWith('beginner') ? 'beginner' : 'intermediate') as Moment['level'];

/** Who she is and where, from the city file: what her job and place can and can't give */
function who(x: Row) {
  const city = cities.find((c) => c.id === x.city_id)!;
  const place = city.places.find((p) => p.id === x.place_id)!;
  const c = characterForVisit(x.city_id, x.place_id)!;
  const here = (city.characters as { placeId?: string; here?: string }[]).find((k) => k.placeId === place.id)?.here ?? '';
  return { name: c.name, text: `${c.name}, ${c.role}, at ${place.name} (${place.kind}${place.neighbourhood ? `, ${place.neighbourhood}` : ''}), ${city.name}. What the game tells her about herself: "${here}"` };
}

const ROLE = `Out of role means she offers, sells, takes an order for, or does something her job and her place can't give (a taxi driver taking a food order, a student on the steps offering food as if she sold it, a parent in a park inventing an errand or an outing for the learner), or acts as a different person or job. Not out of role: talking about her own life, her town, its food or places; recommending somewhere else; sharing what she's eating or doing; asking the learner about themselves.`;
const MARKS_SCHEMA = { type: 'object', additionalProperties: false, required: ['marks'], properties: { marks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'quote', 'reason'], properties: { turn: { type: 'integer' }, quote: { type: 'string' }, reason: { type: 'string' } } } } } };
const VERDICT_SCHEMA = { type: 'object', additionalProperties: false, required: ['broken', 'quote', 'reason'], properties: { broken: { type: 'boolean' }, quote: { type: 'string' }, reason: { type: 'string' } } };
const both = async <T,>(content: string, schema: object) => {
  const [claude, grok] = await Promise.all([ask(content, { schema, max: 2000 }).then((s) => JSON.parse(s) as T), askGrok<T>(content, schema)]);
  return { claude, grok };
};

/** The moment check: only the line before and the reply */
function momentPrompt(x: Row, before: string, reply: string) {
  const w = who(x);
  return `A turn in a ${pack.language.name} learning game, where a learner talks with ${w.text}

The learner's line before it (speech-to-text, may be misheard):
${before || '(this is her opening line)'}

${w.name}'s reply ([say back: …] is shown on screen for the learner to say):
${reply}

${ROLE}

Is this reply out of role? Answer broken: true only if clearly yes; quote the words; reason in one sentence. Reply as JSON: {"broken": boolean, "quote": string, "reason": string}.`;
}

if (part === '1') {
  const n = Number(nArg ?? 15);
  const here = new Set(cities.map((c) => c.id));
  const rows = all
    .filter((x) => !process.env.IDS || process.env.IDS.split(',').some((id) => x.id.startsWith(id)))
    .filter((x) => here.has(x.city_id) && !/^(lesson|onboarding|magda)/.test(x.prompt_version))
    .filter((x) => x.turns.filter((t) => t.who === 'learner').length >= 3)
    .filter((x) => characterForVisit(x.city_id, x.place_id)?.id === x.character_id)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .slice(0, n);
  const res = await pool(rows.map((x) => async () => {
    if (late()) return null;
    const w = who(x);
    const lines = x.turns.map((t, i) => `[${i}] ${t.who === 'learner' ? 'Learner' : w.name}: ${t.who === 'learner' ? t.text : shown(t)}`).join('\n');
    const m = await both<Marks>(`A real conversation from a ${pack.language.name} learning game. The learner talks with ${w.text} The learner's lines are speech-to-text and may be misheard.

${lines}

${ROLE}

Mark every one of ${w.name}'s replies that is clearly out of role, or none. For each: turn (its [number]), quote (the words), reason (one sentence). Reply as JSON: {"marks": [{"turn": number, "quote": string, "reason": string}]}.`, MARKS_SCHEMA);
    const valid = (k: Marks) => k.marks.filter((a) => x.turns[a.turn] && x.turns[a.turn].who !== 'learner');
    const turns = [...new Set([...valid(m.claude), ...valid(m.grok)].map((a) => a.turn))].sort((a, b) => a - b);
    const marks = await Promise.all(turns.map(async (turn) => {
      const prev = x.turns[turn - 1];
      const check = await both<Verdict>(momentPrompt(x, prev?.who === 'learner' ? prev.text : '', shown(x.turns[turn])), VERDICT_SCHEMA);
      return { turn, line: shown(x.turns[turn]), byClaude: valid(m.claude).find((a) => a.turn === turn) ?? null, byGrok: valid(m.grok).find((a) => a.turn === turn) ?? null, moment: check };
    }));
    return { conversation: x.id, character: w.name, version: x.prompt_version, marks };
  }), 4);
  const done = res.filter((r): r is NonNullable<typeof r> => !!r);
  const marks = done.flatMap((r) => r.marks.map((k) => ({ ...k, conversation: r.conversation, character: r.character, version: r.version })));
  const agreed = marks.filter((k) => k.byClaude && k.byGrok);
  const seen = (k: typeof marks[number]) => k.moment.claude.broken && k.moment.grok.broken;
  const summary = [
    `${pack.id} · ${done.length} of ${rows.length} conversations read · marked out of role: Claude ${marks.filter((k) => k.byClaude).length}, Grok ${marks.filter((k) => k.byGrok).length}, both ${agreed.length}`,
    `seen again with only the moment (both judges): ${agreed.filter(seen).length} of the ${agreed.length} both marked · ${marks.filter((k) => !(k.byClaude && k.byGrok)).filter(seen).length} of the ${marks.length - agreed.length} only one marked`,
    `minutes: ${((Date.now() - started) / 60000).toFixed(1)}${late() ? ` (stopped at ${STOP_MIN})` : ''}`,
  ];
  writeFileSync(`${file1}.json`, JSON.stringify(done, null, 1));
  writeFileSync(`${file1}.md`, [`# V2 role, part 1, ${pack.id}: out of role in whole conversations, then in the moment`, '', ...summary.map((l) => `- ${l}`), '', `**Out of role:** ${ROLE}`, '',
    ...marks.map((k) => `## ${k.character} (${k.version}, ${k.conversation.slice(0, 8)}, turn ${k.turn}) · marked by ${[k.byClaude && 'Claude', k.byGrok && 'Grok'].filter(Boolean).join(' and ')} · in the moment: Claude ${k.moment.claude.broken ? 'yes' : 'no'}, Grok ${k.moment.grok.broken ? 'yes' : 'no'}\n\n> ${k.line}\n\n${k.byClaude ? `- Claude (conversation): ${k.byClaude.reason}\n` : ''}${k.byGrok ? `- Grok (conversation): ${k.byGrok.reason}\n` : ''}- Claude (moment): ${k.moment.claude.reason}\n- Grok (moment): ${k.moment.grok.reason}\n`),
  ].join('\n'));
  console.log(summary.join('\n') + `\n→ ${file1.replace(process.cwd() + '/', '')}.md`);
}

if (part === '2') {
  const runs = Number(nArg ?? 5);
  const p1 = JSON.parse(readFileSync(`${file1}.json`, 'utf8')) as { conversation: string; marks: { turn: number; byClaude: unknown; byGrok: unknown }[] }[];
  const targets = p1.flatMap((r) => r.marks.filter((k) => k.byClaude && k.byGrok).map((k) => ({ x: all.find((y) => y.id === r.conversation)!, turn: k.turn })));
  const res = await pool(targets.map(({ x, turn }) => async () => {
    if (late()) return null;
    const prior = x.turns.slice(0, turn);
    const said = prior.at(-1)?.who === 'learner' ? prior.at(-1)!.text : undefined;
    const transcript = (said ? prior.slice(0, -1) : prior).map((t) => ({ who: (t.who === 'learner' ? 'learner' : 'npc') as 'npc' | 'learner', text: t.text, ...(t.en ? { en: t.en } : {}) }));
    const stage = x.prompt_version.match(/\+(S\d)/)?.[1] as Moment['stage'];
    const moment: Moment = { id: `v2-role-${x.id.slice(0, 8)}-${turn}`, country: pack.id, kind: 'town', level: levelOf(x.prompt_version), ...(levelOf(x.prompt_version) === 'beginner' ? { stage: stage ?? 'S2' } : {}), cityId: x.city_id, placeId: x.place_id, transcript, ...(said ? { said } : {}), watch: 'out of role', from: { who: 'V2 role', date: day, quote: '' } };
    const replays = await Promise.all(Array.from({ length: runs }, async () => {
      if (late()) return null;
      const r = await replay(moment) as { line: string; parts?: Part[] };
      const line = shown({ text: r.line, parts: r.parts });
      return { line, ...(await both<Verdict>(momentPrompt(x, said ?? '', line), VERDICT_SCHEMA)) };
    }));
    return { conversation: x.id, character: who(x).name, version: x.prompt_version, turn, original: shown(x.turns[turn]), replays: replays.filter((r): r is NonNullable<typeof r> => !!r) };
  }), 3);
  const done = res.filter((r): r is NonNullable<typeof r> => !!r);
  const again = (r: typeof done[number]) => r.replays.filter((p) => p.claude.broken && p.grok.broken).length;
  const summary = [
    `${pack.id} · ${done.length} of ${targets.length} marked moments replayed ${runs}x · out of role again in ≥2 (both judges): ${done.filter((r) => again(r) >= 2).length} of ${done.length}`,
    done.map((r) => `${r.character} turn ${r.turn}: ${again(r)}/${r.replays.length}`).join(' · '),
    `minutes: ${((Date.now() - started) / 60000).toFixed(1)}${late() ? ` (stopped at ${STOP_MIN})` : ''}`,
  ];
  writeFileSync(`${file2}.json`, JSON.stringify(done, null, 1));
  writeFileSync(`${file2}.md`, [`# V2 role, part 2, ${pack.id}: the marked moments replayed`, '', ...summary.map((l) => `- ${l}`), '',
    ...done.flatMap((r) => [`## ${r.character} (${r.version}, ${r.conversation.slice(0, 8)}, turn ${r.turn}) · ${again(r)}/${r.replays.length}`, '', `- original: ${r.original}`, ...r.replays.map((p) => `- ${p.claude.broken && p.grok.broken ? '✗' : p.claude.broken || p.grok.broken ? '½' : '✓'} ${p.line}\n  _Claude ${p.claude.broken ? 'yes' : 'no'}: ${p.claude.reason} · Grok ${p.grok.broken ? 'yes' : 'no'}: ${p.grok.reason}_`), '']),
  ].join('\n'));
  console.log(summary.join('\n') + `\n→ ${file2.replace(process.cwd() + '/', '')}.md`);
}
