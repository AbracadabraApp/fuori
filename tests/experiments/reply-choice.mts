// The choose stage's replies (lib/replies.ts writeChoice, replies.md → Choose
// prompt): one reply that fits, one correct but out of place. For the first
// three character lines of each committed synthetic conversation (where the
// stages fall), a second model judges each pair. Choice round 1, 2026-10-22.
//   npx tsx --env-file=.env.local tests/experiments/reply-choice.mts   (COUNTRY=es-mx for Mexico)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { language, cities, pack } from '@/content';
import { writeChoice, repliesPromptVersion } from '@/lib/replies';
import { characterForPlace } from '@/lib/characters/for-place';
import type { Turn } from '@/lib/types';
import { ask, pct, pool } from './common.mjs';

const CHECKS = ['fitsSensible', 'misfitWrongHere', 'misfitCorrect', 'misfitNotSilly', 'needsUnderstanding', 'beginner', 'englishRight'] as const;
const schema = { type: 'object', additionalProperties: false, required: [...CHECKS, 'note'], properties: { ...Object.fromEntries(CHECKS.map((k) => [k, { type: 'boolean' }])), note: { type: 'string' } } };
const judgePrompt = (name: string, history: string, a: { line: string; en: string }, b: { line: string; en: string }, fits: number) => `In a ${language.name} conversation game, a person just starting to learn ${language.name} is talking with ${name}. The conversation so far:\n\n${history}\n\nThe game shows two replies; the person must choose the one that fits and say it.\n1. ${a.line} (${a.en})\n2. ${b.line} (${b.en})\nThe game says reply ${fits + 1} fits.\n\nJudge the pair:\n- fitsSensible: reply ${fits + 1} is something a person would really say next, answering what ${name} last said\n- misfitWrongHere: reply ${2 - fits} clearly doesn't fit here, to anyone who understood ${name}\n- misfitCorrect: reply ${2 - fits} is still correct, natural ${language.name}\n- misfitNotSilly: reply ${2 - fits} is something a person could sensibly say in another moment; not rude, absurd or a joke\n- needsUnderstanding: someone who didn't understand ${name}'s line couldn't pick the right one from the replies' shape alone (similar length, frame and tone)\n- beginner: someone a few weeks into ${language.name} could read both\n- englishRight: each English line is a faithful translation\n- note: the biggest problem in one sentence, or "none"\nReply with JSON.`;

type Row = { character_id: string; place_id: string; city_id: string; turns: { who: 'npc' | 'learner'; text: string }[] };
const rows = JSON.parse(readFileSync(join('tests', 'conversations', 'synthetic-set', `${pack.id}.json`), 'utf8')) as Row[];
const items = rows.flatMap((r) => {
  const city = cities.find((c) => c.id === r.city_id);
  const place = city?.places.find((p) => p.id === r.place_id);
  const character = city && place ? characterForPlace(city, place) : null;
  if (!character) return [];
  // The first three character lines: where tap, read and choose fall
  return r.turns.flatMap((t, i) => (t.who === 'npc' ? [i] : [])).slice(0, 3).map((i) => ({ character, transcript: r.turns.slice(0, i + 1).map((x): Turn => ({ who: x.who, transcript: x.text })) }));
});

console.log(`replies.md ${repliesPromptVersion()} · ${pack.id} · ${items.length} lines`);
const res = await pool(items.map((it) => async () => {
  const t0 = performance.now();
  const r = await writeChoice(it.character, it.transcript).catch((e) => { console.error(String(e)); return null; });
  const ms = performance.now() - t0;
  if (!r || r.fits === undefined) return null;
  const history = it.transcript.map((x) => `${x.who === 'npc' ? it.character.name : 'Person'}: ${x.transcript}`).join('\n');
  const j = JSON.parse(await ask(judgePrompt(it.character.name, history, r.replies[0], r.replies[1], r.fits), { schema })) as Record<(typeof CHECKS)[number], boolean> & { note: string };
  return { ms, r, j, last: it.transcript[it.transcript.length - 1].transcript };
}));
const ok = res.filter((x): x is NonNullable<typeof x> => !!x);
const p = (f: (x: (typeof ok)[number]) => boolean) => pct(ok.filter(f).length / ok.length);
const ms = ok.map((x) => x.ms).sort((a, b) => a - b);
console.log(`${ok.length}/${items.length} pairs · all checks ${p((x) => CHECKS.every((k) => x.j[k]))} · ${CHECKS.map((k) => `${k} ${p((x) => x.j[k])}`).join(' · ')} · fits first ${p((x) => x.r.fits === 0)} · median ${(ms[ms.length >> 1] / 1000).toFixed(1)} s`);
for (const x of ok.filter((x) => !CHECKS.every((k) => x.j[k])).slice(0, 8)) {
  console.log(`- "${x.last.slice(0, 70)}" → fits: ${x.r.replies[x.r.fits!].line} / misfit: ${x.r.replies[1 - x.r.fits!].line} · ${x.j.note}`);
}
for (const x of ok.slice(0, 6)) console.log(`  sample: "${x.last.slice(0, 60)}" → ✓ ${x.r.replies[x.r.fits!].line} · ✗ ${x.r.replies[1 - x.r.fits!].line}`);
