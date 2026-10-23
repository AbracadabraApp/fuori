// Say it in English (lib/say-it.ts, say-it.md): for character lines from the
// committed synthetic conversations, a set of English requests a learner
// might make (simple, complicated, rambling, "I didn't understand", a
// mixed sentence) become the line to read, judged by a second model. Say-it
// round 1, 2026-10-23.
//   npx tsx --env-file=.env.local tests/experiments/say-it.mts   (COUNTRY=es-mx for Mexico)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { language, cities, pack } from '@/content';
import { writeSayIt, sayItPromptVersion } from '@/lib/say-it';
import { characterForPlace } from '@/lib/characters/for-place';
import type { Turn } from '@/lib/types';
import { ask, pct, pool } from './common.mjs';

const ENGLISH = [
  "I'd like a coffee please",
  'Can I have the same thing as yesterday but a bit smaller, and also do you know if the place around the corner is open on Sundays?',
  "um so I'm, I'm just, I'm looking for something, like for my, for my sister's birthday, she likes, I don't know, nice things",
  "Sorry, I didn't understand",
  'What does that word mean?',
  'Sì, I want un caffè',
  "Thank you, that's all, goodbye",
];
const CHECKS = ['meaning', 'fits', 'level', 'correct', 'oneLanguage', 'englishRight'] as const;
const schema = { type: 'object', additionalProperties: false, required: [...CHECKS, 'note'], properties: { ...Object.fromEntries(CHECKS.map((k) => [k, { type: 'boolean' }])), note: { type: 'string' } } };
const judge = (name: string, history: string, said: string, r: { line: string; en: string }, level: string) => `A person learning ${language.name} (${level} level) is talking with ${name}. Stuck, they said in English what they want to say, and the game gave them a line to read out loud.\n\nConversation so far:\n${history}\n\nThey said in English: ${said}\nLine to read: ${r.line}\nIts English: ${r.en}\n\nJudge:\n- meaning: the line says what they meant (the gist; simplifying is right)\n- fits: it follows ${name}'s last line naturally\n- level: a ${level} learner could read and say it (for a beginner: short, common words)\n- correct: correct, natural ${language.name}\n- oneLanguage: only ${language.name}, no English words\n- englishRight: the English is faithful to the line\n- note: the biggest problem in one sentence, or "none"\nReply with JSON.`;

type Row = { character_id: string; place_id: string; city_id: string; turns: { who: 'npc' | 'learner'; text: string }[] };
const rows = (JSON.parse(readFileSync(join('tests', 'conversations', 'synthetic-set', `${pack.id}.json`), 'utf8')) as Row[]).slice(0, 10);
const items = rows.flatMap((r, ri) => {
  const city = cities.find((c) => c.id === r.city_id);
  const place = city?.places.find((p) => p.id === r.place_id);
  const character = city && place ? characterForPlace(city, place) : null;
  if (!character) return [];
  const npc = r.turns.findIndex((t) => t.who === 'npc');
  const transcript = r.turns.slice(0, npc + 1).map((x): Turn => ({ who: x.who, transcript: x.text }));
  // Each conversation gets a few of the requests, so every request is tried several times
  return ENGLISH.filter((_, i) => (i + ri) % 2 === 0).map((said) => ({ character, transcript, said, level: ri % 3 === 2 ? 'intermediate' : 'beginner' }));
});

console.log(`say-it.md ${sayItPromptVersion()} · ${pack.id} · ${items.length} lines`);
const res = await pool(items.map((it) => async () => {
  const t0 = performance.now();
  const r = await writeSayIt(it.character, it.transcript, it.said, it.level as 'beginner').catch((e) => { console.error(String(e)); return null; });
  const ms = performance.now() - t0;
  if (!r) return null;
  const history = it.transcript.map((x) => `${x.who === 'npc' ? it.character.name : 'Person'}: ${x.transcript}`).join('\n');
  const j = JSON.parse(await ask(judge(it.character.name, history, it.said, r, it.level), { schema })) as Record<(typeof CHECKS)[number], boolean> & { note: string };
  return { ms, r, j, said: it.said, words: r.line.split(/\s+/).length };
}));
const ok = res.filter((x): x is NonNullable<typeof x> => !!x);
const p = (f: (x: (typeof ok)[number]) => boolean) => pct(ok.filter(f).length / ok.length);
const ms = ok.map((x) => x.ms).sort((a, b) => a - b);
const words = ok.map((x) => x.words).sort((a, b) => a - b);
console.log(`${ok.length}/${items.length} · all checks ${p((x) => CHECKS.every((k) => x.j[k]))} · ${CHECKS.map((k) => `${k} ${p((x) => x.j[k])}`).join(' · ')} · median ${(ms[ms.length >> 1] / 1000).toFixed(1)} s · median ${words[words.length >> 1]} words`);
for (const x of ok.filter((x) => !CHECKS.every((k) => x.j[k])).slice(0, 6)) console.log(`- "${x.said.slice(0, 50)}" → ${x.r.line} · ${x.j.note}`);
for (const said of ENGLISH) { const x = ok.find((y) => y.said === said); if (x) console.log(`  "${said.slice(0, 50)}" → ${x.r.line}`); }
