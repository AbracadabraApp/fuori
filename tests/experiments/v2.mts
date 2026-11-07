// V2 (docs/prompt-testing.md → the queue): can a problem seen in a real
// conversation be isolated as a moment? A judge reads each real conversation
// against the eight items and marks at most two turns that break one. Each
// item has one fixed yes/no question, written before the run (QUESTIONS); a
// mark is kept only if its question says yes on the original turn. Each kept
// turn becomes a moment (the conversation before it, the learner's line, the
// stage from the prompt version; no memory, which the export doesn't hold), is
// replayed 5 times with today's prompts, and the question is asked of every
// replay. A base rate: up to 5 unmarked turns, replayed the same way with the
// question of a kept mark from the same conversation. Reported by prompt version
// (today's or older) and visit (first, or return: memory missing). Test
// designer review, 2026-11-07. Stops starting new work after STOP_MIN minutes.
//   curl -H "x-admin-key: $ADMIN_KEY" "https://fuori-production.up.railway.app/api/admin/conversations?limit=500&since=2026-10-25T00:00Z" > tests/experiments/out/admin.json
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/v2.mts tests/experiments/out/admin.json 6 [runs]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { beginnerPromptVersion } from '@/lib/beginner';
import { readPromptFile } from '@/lib/prompts/template';
import { characterForVisit } from '@/lib/characters/for-visit';
import { replay, type Moment } from './moments.mjs';
import { ask, pool } from './common.mjs';

type Row = { id: string; learner_id: string; character_id: string; place_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: string; text: string; en?: string; parts?: { kind: string; text: string }[] }[] };
type Mark = { turn: number; item: number; quote: string; reason: string };

/** One question per item, fixed before the run; "yes" means the problem is there */
const QUESTIONS: Record<number, string> = {
  1: 'Would a learner at this level be unable to follow the parts of this reply in the language (words or grammar well beyond them)?',
  2: 'Does the reply state something false or invented about the place, the town, its food or the country?',
  3: 'Is the reply generic, with nothing of her place, town or country, at a turn where a local would naturally have said something of it?',
  4: 'Does she step out of her role or her job: offering or doing what her job or her place can\'t give, or talking like a language teacher?',
  5: 'Did the learner need help or ask for it (in English or the language), and the reply fails to give it?',
  6: 'Does the reply lecture, point out a mistake like a teacher, or offer answers to say back that a learner couldn\'t use (too long, two ideas, not what a local would say)?',
  8: 'Is the reply too long or too dense for a learner at this level to follow in one hearing?',
};
const STOP_MIN = Number(process.env.STOP_MIN ?? 8);
const started = Date.now();
const late = () => (Date.now() - started) / 60000 > STOP_MIN;
const today = new Set([beginnerPromptVersion(), readPromptFile('character.md').version]);
const isToday = (v: string) => today.has(v.split('+')[0]);
const words = (s: string) => s.replace(/\[say back:[^\]]*\]/, '').split(/\s+/).filter(Boolean).length;

const ITEMS = `1. At their level: the learner can follow her.
2. Accurate: nothing invented (no false facts about the place, town, food or country).
3. Local and tipico: her place, her town, her country, as a local tells it.
4. In character: she stays in her role and her job (doesn't offer what her job can't give).
5. Responds to English: she helps when the learner needs it or asks.
6. Teaches in role: recasts mistakes, offers usable answers, no lectures.
7. Remembers: no retelling; uses what she knows about them.
8. Brief: turns the learner can follow.`;

const [input, perCountryArg, runsArg] = process.argv.slice(2);
const perCountry = Number(perCountryArg ?? 5);
const runs = Number(runsArg ?? 5);
const since = process.env.SINCE ?? '2026-11-01';

/** What the character said, with the answers she offered to say back (shown, not spoken) */
const shown = (t: Row['turns'][number]) => {
  const answers = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
  return answers.length ? `${t.text}  [say back: ${answers.join(' | ')}]` : t.text;
};
const levelOf = (v: string) => (v.startsWith('beginner') ? 'beginner' : 'intermediate') as Moment['level'];

const all = JSON.parse(readFileSync(input, 'utf8')) as Row[];
const isReturn = (x: Row) => all.some((y) => y.learner_id === x.learner_id && y.character_id === x.character_id && y.started_at < x.started_at);
const rows = all
  .filter((x) => x.started_at >= since && !/^(lesson|onboarding|magda)/.test(x.prompt_version))
  .filter((x) => x.turns.filter((t) => t.who === 'learner').length >= 3)
  .filter((x) => characterForVisit(x.city_id, x.place_id)?.id === x.character_id)
  .sort((a, b) => b.started_at.localeCompare(a.started_at))
  .slice(0, perCountry);

const MARK_SCHEMA = { type: 'object', additionalProperties: false, required: ['marks'], properties: { marks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'item', 'quote', 'reason'], properties: { turn: { type: 'integer' }, item: { type: 'integer' }, quote: { type: 'string' }, reason: { type: 'string' } } } } } };
const CHECK_SCHEMA = { type: 'object', additionalProperties: false, required: ['broken', 'reason'], properties: { broken: { type: 'boolean' }, reason: { type: 'string' } } };

async function mark(x: Row, name: string, role: string): Promise<Mark[]> {
  const lines = x.turns.map((t, i) => `[${i}] ${t.who === 'learner' ? 'Learner' : name}: ${t.who === 'learner' ? t.text : shown(t)}`).join('\n');
  const out = await ask(`A real conversation from a ${pack.language.name} learning game. The learner is a ${levelOf(x.prompt_version)} speaking with ${name}, ${role}, in ${x.city_id}. The learner's lines are speech-to-text and may be misheard. Glosses in lowercase English after a phrase, and [say back: …], are shown on screen to help the learner.

What the character must do in every turn:
${ITEMS}

${lines}

Mark the character's turns that clearly break one of these items, at most the two clearest, or none if none clearly does. Leave out item 7 (the earlier visits aren't shown). For each: turn (its [number], one of ${name}'s), item (1-8), quote (the words that break it), reason (one sentence).`, { schema: MARK_SCHEMA, max: 2000 });
  return (JSON.parse(out).marks as Mark[]).filter((m) => x.turns[m.turn]?.who !== 'learner' && m.item !== 7).slice(0, 2);
}

async function check(item: number, level: string, before: string, reply: string) {
  const out = await ask(`A turn in a language-learning conversation; the learner is a ${level}. Glosses in lowercase English and [say back: …] are shown on screen.

The conversation before it:
${before || '(this is the opening line)'}

The character's reply:
${reply}

${QUESTIONS[item]} Answer broken: true if yes (the problem is there), with a one-sentence reason.`, { schema: CHECK_SCHEMA, max: 500 });
  return JSON.parse(out) as { broken: boolean; reason: string };
}

function momentAt(x: Row, turn: number, name: string, watch: string, quote: string) {
  const prior = x.turns.slice(0, turn);
  const said = prior.at(-1)?.who === 'learner' ? prior.at(-1)!.text : undefined;
  const transcript = (said ? prior.slice(0, -1) : prior).map((t) => ({ who: (t.who === 'learner' ? 'learner' : 'npc') as 'npc' | 'learner', text: t.text, ...(t.en ? { en: t.en } : {}) }));
  const stage = x.prompt_version.match(/\+(S\d)/)?.[1] as Moment['stage'];
  const moment: Moment = { id: `v2-${x.id.slice(0, 8)}-${turn}`, country: pack.id, kind: 'town', level: levelOf(x.prompt_version), ...(stage ? { stage } : {}), cityId: x.city_id, placeId: x.place_id, transcript, ...(said ? { said } : {}), watch, from: { who: 'V2 judge', date: '2026-11-07', quote } };
  const before = prior.map((t) => `${t.who === 'learner' ? 'Learner' : name}: ${t.who === 'learner' ? t.text : shown(t)}`).join('\n');
  return { moment, before };
}

async function replayChecked(x: Row, turn: number, item: number, name: string, watch: string, quote: string) {
  const { moment, before } = momentAt(x, turn, name, watch, quote);
  return Promise.all(Array.from({ length: runs }, async () => {
    if (late()) return null;
    const r = await replay(moment) as { line: string; parts?: { kind: string; text: string }[] };
    const answers = (r.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
    const line = answers.length ? `${r.line}  [say back: ${answers.join(' | ')}]` : r.line;
    return { line, words: words(r.line), ...(await check(item, moment.level, before, line)) };
  })).then((rs) => rs.filter((r): r is NonNullable<typeof r> => !!r));
}

const dropped: { conversation: string; turn: number; item: number; quote: string; reason: string; why: string }[] = [];
const results = await pool(rows.map((x) => async () => {
  if (late()) return [];
  const c = characterForVisit(x.city_id, x.place_id)!;
  const visit = isReturn(x) ? 'return (memory missing)' : 'first';
  const marks = await mark(x, c.name, c.role);
  const kept = await Promise.all(marks.map(async (m) => {
    const { before, moment } = momentAt(x, m.turn, c.name, m.reason, m.quote);
    const original = await check(m.item, moment.level, before, shown(x.turns[m.turn]));
    if (!original.broken) { dropped.push({ conversation: x.id, ...m, why: original.reason }); return null; }
    const replays = await replayChecked(x, m.turn, m.item, c.name, m.reason, m.quote);
    return { kind: 'marked' as const, conversation: x.id, character: c.name, version: x.prompt_version, today: isToday(x.prompt_version), visit, ...m, original: { line: shown(x.turns[m.turn]), words: words(x.turns[m.turn].text), ...original }, replays, moment };
  }));
  return kept.filter((k): k is NonNullable<typeof k> => !!k).map((k) => ({ ...k, conversationRow: x, name: c.name }));
}), 4);

const flat = results.flat();
// The base rate: an unmarked turn of the character's from the same conversation, the same question
const baseJobs = flat.slice(0, 5).map((r) => async () => {
  const x = r.conversationRow;
  const marked = new Set(flat.filter((f) => f.conversation === x.id).map((f) => f.turn));
  const turn = x.turns.map((t, i) => i).filter((i) => i > 0 && x.turns[i].who !== 'learner' && !marked.has(i)).at(-1);
  if (turn === undefined || late()) return null;
  return { kind: 'base' as const, conversation: x.id, character: r.name, version: x.prompt_version, turn, item: r.item, original: { line: shown(x.turns[turn]) }, replays: await replayChecked(x, turn, r.item, r.name, 'base rate', '') };
});
const base = (await pool(baseJobs, 4)).filter((b): b is NonNullable<typeof b> => !!b);

const out = flat.map(({ conversationRow, name, ...r }) => r);
const came = (r: { replays: { broken: boolean }[] }) => r.replays.filter((p) => p.broken).length;
const back = out.filter((r) => came(r) >= 2);
const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const group = (label: string, rs: typeof out) => `${label}: ${rs.filter((r) => came(r) >= 2).length} of ${rs.length} came back`;
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `v2-${pack.id}-${new Date().toISOString().slice(0, 10)}`);
writeFileSync(`${file}.json`, JSON.stringify({ questions: QUESTIONS, today: [...today], marked: out, dropped, base }, null, 1));
const byItem = [1, 2, 3, 4, 5, 6, 8].map((i) => `item ${i}: ${out.filter((r) => r.item === i).length} kept, ${back.filter((r) => r.item === i).length} came back`).join(' · ');
const summary = [
  `${pack.id} · ${rows.length} conversations · ${out.length + dropped.length} marked, ${out.length} kept (its question said yes on the original), ${back.length} came back in ≥2 of ${runs}`,
  [group("today's prompt", out.filter((r) => r.today)), group('older prompt', out.filter((r) => !r.today)), group('first visit', out.filter((r) => r.visit === 'first')), group('return visit', out.filter((r) => r.visit !== 'first'))].join(' · '),
  `base rate (unmarked turns, same question): ${base.map((b) => `${came(b)}/${b.replays.length}`).join(', ') || 'none'}`,
  byItem,
  `words per turn: originals ${mean(out.map((r) => r.original.words)).toFixed(1)}, replays ${mean(out.flatMap((r) => r.replays.map((p) => p.words))).toFixed(1)}`,
  `minutes: ${((Date.now() - started) / 60000).toFixed(1)}${late() ? ` (stopped at ${STOP_MIN})` : ''}`,
];
writeFileSync(`${file}.md`, [
  `# V2, ${pack.id}`, '', ...summary.map((l) => `- ${l}`), '', '## Questions (fixed before the run)', '', ...Object.entries(QUESTIONS).map(([k, q]) => `- ${k}: ${q}`), '',
  ...out.flatMap((r) => [
    `## ${r.character} (${r.version}${r.today ? ', today' : ''}, ${r.visit}, ${r.conversation.slice(0, 8)}, turn ${r.turn}) · item ${r.item} · came back ${came(r)}/${r.replays.length}`, '',
    `**Marked:** "${r.quote}". ${r.reason}`, '',
    `- original ✗ (${r.original.words} words): ${r.original.line}`,
    ...r.replays.map((p) => `- ${p.broken ? '✗' : '✓'} (${p.words}) ${p.line}\n  _${p.reason}_`), '',
  ]),
  '## Base rate', '',
  ...base.flatMap((b) => [`### ${b.character} turn ${b.turn} · item ${b.item} · ${came(b)}/${b.replays.length}`, '', `- original: ${b.original.line}`, ...b.replays.map((p) => `- ${p.broken ? '✗' : '✓'} ${p.line}\n  _${p.reason}_`), '']),
  '## Marks dropped (their question said no on the original)', '',
  ...dropped.map((d) => `- ${d.conversation.slice(0, 8)} turn ${d.turn}, item ${d.item}: "${d.quote}". ${d.reason} — _${d.why}_`),
].join('\n'));
console.log(summary.join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
