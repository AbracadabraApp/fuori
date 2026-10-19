// Teaching in character, today (round 22; Josh, 2026-10-19: "teach in
// character at all levels: sometimes vocabulary, sometimes gender or number,
// sometimes conjugation, sometimes dialect"). A judge reads each real
// conversation and lists the character's teaching moments by kind, and the
// chances missed: a real learner error or gap the next line didn't pick up.
// With PROMPTS=a.md,b.md it also replays each missed chance: the character's
// next line is made again from the real conversation, once per prompt file,
// and judged: did it pick the error up, does it sound like a lesson, words.
//   npx tsx --env-file=.env.local tests/experiments/teach-moments.mts tests/experiments/out/admin.json   (COUNTRY as needed)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { findCharacter } from '@/lib/remember';
import { runTurn } from '@/lib/turn';
import type { Turn } from '@/lib/types';
import { OUT, ask, mean, pct, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; turns: { who: string; text: string }[] };
const [input] = process.argv.slice(2);
const here = new Set(cities.map((c) => c.id));
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[]).filter((r) => here.has(r.city_id) && r.character_id !== 'magda' && r.turns.filter((t) => t.who === 'learner').length >= 2 && findCharacter(r.city_id, r.character_id));

const KINDS = ['vocabulary', 'gender or number', 'conjugation', 'dialect or local', 'other'] as const;
const schema = { type: 'object', additionalProperties: false, required: ['moments', 'missed'], properties: {
  moments: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'kind', 'how', 'lesson', 'note'], properties: {
    turn: { type: 'integer' }, kind: { type: 'string', enum: [...KINDS] }, how: { type: 'string', enum: ['recast', 'explained in the language', 'explained in English'] }, lesson: { type: 'boolean' }, note: { type: 'string' } } } },
  missed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'kind', 'note'], properties: {
    turn: { type: 'integer' }, kind: { type: 'string', enum: [...KINDS] }, note: { type: 'string' } } } },
} };
const prompt = (r: Row, name: string, role: string) => `A ${language.name} conversation game: a learner talks by voice (through speech-to-text, so ignore spelling and recognition noise) with ${name} (${role}), who should help them learn the way a real person in that role helps a newcomer, never like a teacher with a lesson.

${r.turns.map((t, i) => `${i + 1}. ${t.who === 'learner' ? 'Learner' : name}: ${t.text}`).join('\n')}

- moments: each ${name} line that teaches something small: a word (vocabulary), gender or number, a verb form (conjugation), a regional or local word or way of saying it (dialect or local), or other. turn; kind; how: "recast" (says the right form back without explaining), "explained in the language", or "explained in English"; lesson: true if it sounds like a teacher rather than a ${role}; note: one short line.
- missed: each learner line with a real error or gap (a wrong form, a missing or wrong word) that the next ${name} line didn't pick up in any way. turn (the learner's); kind; note.
Reply with JSON.`;

type M = { conv: string; turn: number; kind: string; how: string; lesson: boolean; note: string };
type X = { conv: string; turn: number; kind: string; note: string };
const out = await pool(rows.map((r) => async () => {
  const c = findCharacter(r.city_id, r.character_id)!;
  const j = JSON.parse(await ask(prompt(r, c.name, c.role), { schema })) as { moments: Omit<M, 'conv'>[]; missed: Omit<X, 'conv'>[] };
  return { r, name: c.name, moments: j.moments.map((m) => ({ conv: r.id, ...m })), missed: j.missed.map((m) => ({ conv: r.id, ...m })) };
}), 6);
const moments = out.flatMap((o) => o.moments), missed = out.flatMap((o) => o.missed);
const npcLines = rows.reduce((n, r) => n + r.turns.filter((t) => t.who !== 'learner').length, 0);
const lines = [`# Teaching moments, ${pack.id} (round 22)`, '', `${rows.length} real conversations, ${npcLines} character lines. Missed: a learner error or gap the next line didn't pick up.`, '',
  '| Kind | Teaching moments | Recast | In the language | In English | Sounds like a lesson | Missed chances | Caught |', '|---|---|---|---|---|---|---|---|',
  ...[...KINDS, 'all'].map((k) => { const m = k === 'all' ? moments : moments.filter((x) => x.kind === k); const x = k === 'all' ? missed : missed.filter((y) => y.kind === k);
    const n = (h: string) => m.filter((y) => y.how === h).length;
    return `| ${k} | ${m.length} | ${n('recast')} | ${n('explained in the language')} | ${n('explained in English')} | ${m.filter((y) => y.lesson).length} | ${x.length} | ${m.length + x.length ? pct(m.length / (m.length + x.length)) : '—'} |`; }),
  '', `One teaching moment every ${(npcLines / Math.max(1, moments.length)).toFixed(1)} character lines.`, ''];
const ARMS = process.env.PROMPTS?.split(',') ?? [];
const pickSchema = { type: 'object', additionalProperties: false, required: ['picked', 'lesson', 'note'], properties: { picked: { type: 'boolean' }, lesson: { type: 'boolean' }, note: { type: 'string' } } };
type Re = { arm: string; kind: string; picked: boolean; lesson: boolean; words: number; line: string; note: string; name: string; said: string };
const re: Re[] = [];
for (const arm of ARMS) {
  process.env.CHARACTER_PROMPT = arm;
  re.push(...await pool(out.flatMap((o) => o.missed.filter((m) => o.r.turns[m.turn - 1]?.who === 'learner').map((m) => async (): Promise<Re> => {
    const c = findCharacter(o.r.city_id, o.r.character_id)!;
    const before: Turn[] = o.r.turns.slice(0, m.turn - 1).map((t) => ({ who: t.who === 'learner' ? 'learner' : 'npc', transcript: t.text }));
    const said = o.r.turns[m.turn - 1].text;
    const reply = await runTurn({ character: c, transcript: before, learnerSaid: said });
    const j = JSON.parse(await ask(`A ${language.name} conversation game, by voice (speech-to-text: ignore spelling and recognition noise). ${c.name} is a ${c.role} who should help a newcomer learn the way a real ${c.role} would, never like a teacher.\n\n${before.slice(-3).map((t) => `${t.who === 'learner' ? 'Learner' : c.name}: ${t.transcript}`).join('\n')}\nLearner: ${said}\n${c.name}: ${reply.line}\n\nThe learner's line has this ${m.kind} problem: ${m.note}\n- picked: ${c.name}'s line picks it up in any way (says it back the right way, offers the word, or explains)\n- lesson: it sounds like a teacher, not a ${c.role}\n- note: one short line\nReply with JSON.`, { schema: pickSchema })) as { picked: boolean; lesson: boolean; note: string };
    return { arm, kind: m.kind, words: reply.line.split(/\s+/).filter(Boolean).length, line: reply.line, name: c.name, said, ...j };
  })), 6));
}
delete process.env.CHARACTER_PROMPT;
if (ARMS.length) lines.push('## Missed chances, replayed with each prompt', '', '| Prompt | Picked up (all) | Conjugation | Vocabulary | Gender or number | Sounds like a lesson | Words per line |', '|---|---|---|---|---|---|---|',
  ...ARMS.map((arm) => { const xs = re.filter((x) => x.arm === arm); const p = (ys: Re[]) => ys.length ? `${pct(ys.filter((y) => y.picked).length / ys.length)} (${ys.length})` : '—';
    return `| ${arm} | ${p(xs)} | ${p(xs.filter((x) => x.kind === 'conjugation'))} | ${p(xs.filter((x) => x.kind === 'vocabulary'))} | ${p(xs.filter((x) => x.kind === 'gender or number'))} | ${xs.filter((x) => x.lesson).length} | ${mean(xs.map((x) => x.words)).toFixed(1)} |`; }), '');
console.log(lines.join('\n'));
writeFileSync(join(OUT, `teach-moments-${pack.id}.json`), JSON.stringify(out.map((o) => ({ id: o.r.id, name: o.name, moments: o.moments, missed: o.missed })), null, 2));
writeFileSync(join(OUT, `teach-moments-${pack.id}.md`), [...lines, ...out.flatMap((o) => [`**${o.name}**`, ...o.moments.map((m) => `- turn ${m.turn} ${m.kind}, ${m.how}${m.lesson ? ', LESSON' : ''}: ${m.note}`), ...o.missed.map((m) => `- missed at ${m.turn} ${m.kind}: ${m.note}`), '']), ...re.map((x) => `- [${x.arm}] ${x.name}, ${x.kind}, ${x.picked ? 'picked' : 'missed'}${x.lesson ? ', LESSON' : ''}: "${x.said}" -> ${x.line}`)].join('\n'));
console.log(`→ tests/experiments/out/teach-moments-${pack.id}.md`);
