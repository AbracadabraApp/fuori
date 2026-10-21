// Does the character get the learner's gender right? (2026-10-21: Dario said
// "benvenuto", "sei tornato", "un uomo che sa quello che vuole" to Teresa on
// the web.) Short conversations with simulated women and men, first meeting
// and returning, with the learner's gender unknown (today) and known
// (character.md {person}). A judge lists every word the character used for the
// learner that shows a gender, in any language, and which gender it shows.
// The simulated learners never show their own gender in what they say, so the
// character has nothing to go on but the prompt.
//   npx tsx --env-file=.env.local tests/experiments/learner-address.mts [characters=8] [replies=5]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import type { CharacterSheet, Gender, Turn } from '@/lib/types';
import { OUT, ask, pool, pct } from './common.mjs';

const [nArg, repliesArg] = process.argv.slice(2);
const N = Number(nArg) || 8;
const REPLIES = Number(repliesArg) || 5;
const L = language.name;

// Characters spread over the cities, one per city first
const all = cities.flatMap((city) => city.places.map((place) => ({ city, place, c: characterForPlace(city, place) })).filter((x) => x.c)) as { city: (typeof cities)[number]; place: (typeof cities)[number]['places'][number]; c: CharacterSheet }[];
const picked: typeof all = [];
for (let round = 0; picked.length < N && round < 50; round++) for (const city of cities) {
  const x = all.filter((a) => a.city.id === city.id)[round];
  if (x && picked.length < N) picked.push(x);
}

type Arm = { gender: Gender; known: boolean; returning: boolean };
const arms: Arm[] = (['f', 'm'] as Gender[]).flatMap((gender) => [false, true].flatMap((known) => [false, true].map((returning) => ({ gender, known, returning }))));
const armName = (a: Arm) => `${a.gender === 'f' ? 'woman' : 'man'}, ${a.known ? 'known' : 'unknown'}, ${a.returning ? 'returning' : 'first visit'}`;

const learnerSchema = { type: 'object', additionalProperties: false, required: ['say'], properties: { say: { type: 'string' } } };
const judgeSchema = {
  type: 'object', additionalProperties: false, required: ['words'],
  properties: { words: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['line', 'word', 'shows'], properties: {
    line: { type: 'integer', description: 'number of the character line' },
    word: { type: 'string', description: 'the word or short phrase, as said' },
    shows: { type: 'string', enum: ['woman', 'man'] },
  } } } },
};

async function converse(c: CharacterSheet, place: string, a: Arm): Promise<Turn[]> {
  const memory = a.returning ? { visits: 2, lastVisit: new Date(Date.now() - 2 * 86_400_000), notes: ['Has come to live here for a while and is learning the language.', 'Came by twice this week.'] } : undefined;
  const addressedAs = a.known ? a.gender : undefined;
  const transcript: Turn[] = [];
  const opening = await runTurn({ character: c, transcript, memory, addressedAs });
  transcript.push({ who: 'npc', transcript: opening.line, translation: opening.en });
  const system = `You are role-playing a ${L} learner in a test: an American ${a.gender === 'f' ? 'woman' : 'man'} in their fifties who has come to live here for a while, an A1-A2 learner, at ${place} talking to ${c.name} (${c.role}).${a.returning ? ' You have been here twice before.' : ''} Short replies, the way a real learner talks: say how you are, what you'd like, where you've been, how you find the city. Never use a word that shows your own gender (no gendered adjectives or participles about yourself, no name); the test is whether ${c.name} gets it right without help.`;
  for (let k = 0; k < REPLIES; k++) {
    const show = transcript.map((t) => `${t.who === 'npc' ? c.name : 'You'}: ${t.transcript}`).join('\n');
    const say = (JSON.parse(await ask(`Conversation so far:\n${show}\n\nWhat do you say next? Reply with JSON: say.`, { system, schema: learnerSchema })) as { say: string }).say;
    const reply = await runTurn({ character: c, transcript, learnerSaid: say, memory, addressedAs });
    transcript.push({ who: 'learner', transcript: say });
    transcript.push({ who: 'npc', transcript: reply.line, translation: reply.en });
  }
  return transcript;
}

async function judge(c: CharacterSheet, t: Turn[]) {
  const lines = t.filter((x) => x.who === 'npc').map((x, i) => `${i + 1}. ${x.transcript}`).join('\n');
  const r = JSON.parse(await ask(`These are the lines ${c.name} said to a ${L} learner in a conversation.\n\n${lines}\n\nList every word or short phrase in them that refers to the learner (the person ${c.name} is talking to) and shows whether that person is a woman or a man: adjectives, participles, nouns or forms of address, greetings that agree with the person. Not words about anyone else, and not words that are the same for both. Empty if there are none. Reply with JSON: words.`, { schema: judgeSchema }));
  return r.words as { line: number; word: string; shows: 'woman' | 'man' }[];
}

const jobs = picked.flatMap(({ c, place }) => arms.map((a) => async () => {
  const t = await converse(c, place.name, a);
  const words = await judge(c, t);
  const truth = a.gender === 'f' ? 'woman' : 'man';
  return { c, a, t, words, right: words.filter((w) => w.shows === truth).length, wrong: words.filter((w) => w.shows !== truth).length };
}));
const results = await pool(jobs, 6);

const rows = arms.map((a) => {
  const rs = results.filter((r) => r.a === a);
  const right = rs.reduce((s, r) => s + r.right, 0), wrong = rs.reduce((s, r) => s + r.wrong, 0);
  const anyWrong = rs.filter((r) => r.wrong > 0).length;
  return `| ${armName(a)} | ${rs.length} | ${right + wrong} | ${right + wrong ? pct(right / (right + wrong)) : '—'} | ${anyWrong} of ${rs.length} |`;
});
const report = [
  `# Learner address (${pack.id})`, '',
  `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · prompt ${promptVersion()} · ${picked.length} characters × ${arms.length} arms · ${REPLIES} learner replies each. The simulated learner never shows their own gender.`, '',
  '| Arm | Conversations | Gendered words for the learner | Right | Conversations with a wrong one |', '|---|---|---|---|---|',
  ...rows, '',
  '## Wrong words', '',
  ...results.filter((r) => r.wrong).flatMap((r) => [`- **${r.c.name}** (${r.c.role}), ${armName(r.a)}: ${r.words.filter((w) => w.shows !== (r.a.gender === 'f' ? 'woman' : 'man')).map((w) => `"${w.word}"`).join(', ')}`]), '',
  '## Conversations', '',
  ...results.flatMap((r) => [`### ${r.c.name}, ${r.c.role} · ${armName(r.a)} · ${r.right} right, ${r.wrong} wrong`, '', '```', ...r.t.map((x) => `${x.who === 'npc' ? r.c.name : 'Learner'}: ${x.transcript}`), '```', '']),
].join('\n');
const out = join(OUT, `learner-address-${pack.id}.md`);
writeFileSync(out, report);
console.log(report.split('## Wrong words')[0]);
console.log(`→ ${out}`);
