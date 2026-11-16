// Card N1 (docs/prompt-trials.md): notice out of the draw and a bid described in the bubble rule, as one package,
// against today's Beginner. Short visits through the turn code; the learner takes the two offered answers in turn.
// Counts in code (the answers' shapes and length) and two yes/no judge questions put to Claude and Grok for every turn.
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/n1-notice-bid.mts   (PILOT=1 for the pilot)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, OPENER, frameBrief, pickSetup, setupLine, type Setup } from '@/lib/beginner-2';
import { assemblePieces, englishOf } from '@/lib/dialogue/pieces';
import type { Turn } from '@/lib/types';
import { OUT, ask, askGrok, pool, startTest } from './common.mjs';

startTest('N1 (2026-11-16)');

const PLACES: Record<string, string[]> = {
  'es-mx': ['mazatlan/plazuela-machado', 'guadalajara/parque-revolucion', 'guadalajara/plaza-de-los-mariachis', 'guadalajara/parroquia-san-pedro-tlaquepaque', 'guadalajara/tejuino-san-juan-de-dios', 'san-cristobal-de-las-casas/tamales-barrio-de-mexicanos', 'san-cristobal-de-las-casas/museo-del-cafe-sancris'],
  it: ['bologna/piazza-maggiore', 'bologna/san-petronio', 'bologna/due-torri', 'bologna/giardini-margherita', 'bologna/forno-brisa', 'bologna/mercato-mezzo', 'bologna/caffe-terzi'],
};
const country = process.env.COUNTRY ?? 'it';
const pilot = Boolean(process.env.PILOT);
const places = pilot ? PLACES[country].slice(0, 1) : PLACES[country];
const TURNS = 5;

const today = CLUSTERS[0];
const OLD = "Make the two answers two different things a person might really say here, each taking the talk somewhere: a choice with its reason, an answer that asks you something back, or something they notice about what's here; not a yes and a no to the same thing, and not a compliment that could be about anything.";
const NEW = 'Each answer replies to you, then makes a bid: an offer to keep the conversation going. Make the two different.';
if (!frameBrief(today).includes(OLD)) throw new Error('the Answers rule is not the one the card names');
if (!today.some((s) => s.id === 'notice')) throw new Error('notice is not in the draw: the card compares against a draw that has it');
const ARMS: { arm: string; cluster: Setup[]; brief: string }[] = [
  { arm: 'A', cluster: today, brief: frameBrief(today) },
  ...(pilot ? [] : [{ arm: 'A2', cluster: today, brief: frameBrief(today) }]),
  { arm: 'B', cluster: today.filter((s) => s.id !== 'notice'), brief: frameBrief(today).replace(OLD, NEW) },
];

interface Saved { turn: number; setup: string; line: string; en: string; answers: { text: string; en: string }[]; ms: number; said?: string; likes?: [boolean, boolean]; tells?: [boolean, boolean]; life?: [boolean, boolean]; why?: [string, string] }
interface Visit { arm: string; place: string; name: string; where: string; turns: Saved[]; endedEarly: boolean }

const visits = await pool(places.flatMap((p) => ARMS.map(({ arm, cluster, brief }) => async (): Promise<Visit> => {
  const [city, place] = p.split('/');
  const character = characterForVisit(city, place);
  if (!character) throw new Error(`no character at ${p}`);
  const transcript: Turn[] = [];
  const turns: Saved[] = [];
  let said: string | undefined;
  let endedEarly = false;
  for (let turn = 0; turn <= TURNS; turn++) {
    const setup = turn === 0 ? OPENER : pickSetup({ conversationId: `n1-${p}`, turn, characterId: character.id }, cluster);
    const started = Date.now();
    const raw = await runTurn({ character, transcript, learnerSaid: said, brief, note: setupLine(setup), answers: true, withDone: true });
    const answers = (raw.answers ?? []).filter((a) => a.text.trim());
    turns.push({ turn, setup: setup.id, line: assemblePieces(raw.line), en: englishOf(raw.line), answers, ms: Date.now() - started, said });
    if (raw.done) { endedEarly = turn < TURNS; break; }
    if (said) transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: raw.line, translation: raw.en });
    said = (answers[turn % 2] ?? answers[0])?.text;
    if (!said) { endedEarly = turn < TURNS; break; }
  }
  return { arm, place: p, name: character.name, where: `${character.role}, ${character.city}. ${character.appearance.setting.split('. ')[0]}.`, turns, endedEarly };
})), 7);

// The two judge questions, one call a turn to each judge; the visit so far is given in English
const SCHEMA = { type: 'object', properties: { likes: { type: 'boolean' }, tells: { type: 'boolean' }, life: { type: 'boolean' }, why: { type: 'string' } }, required: ['likes', 'tells', 'life', 'why'], additionalProperties: false };
const question = (v: Visit, i: number) => `A learner of a language is talking with ${v.name}, a character in a game (${v.where}) Their visit so far, in English:

${v.turns.slice(0, i).map((t) => `${t.said ? `LEARNER: ${t.said}\n` : ''}${v.name.toUpperCase()}: ${t.en}`).join('\n') || '(this is the first line of the visit)'}

The line to judge:
${v.turns[i].said ? `LEARNER: ${v.turns[i].said}\n` : ''}${v.name.toUpperCase()}: ${v.turns[i].en}

Answer three yes/no questions about the line to judge only.
likes: does it end by asking the learner whether they like, or what they think of, the place they are in or something there (a square, a church, flowers, the music)? Not food or drink they are being served, and not something to do.
tells: does it tell the learner something specific about the place, its food, customs or history, that was not said earlier in the visit?
life: does it tell the learner something specific about the character's own life or work that was not said earlier in the visit?
why: one short sentence for each answer.`;
await pool(visits.flatMap((v) => v.turns.map((t, i) => async () => {
  const [c, g] = await Promise.all([
    ask(question(v, i), { schema: SCHEMA, max: 600 }).then((s) => JSON.parse(s) as { likes: boolean; tells: boolean; life: boolean; why: string }),
    askGrok<{ likes: boolean; tells: boolean; life: boolean; why: string }>(question(v, i), SCHEMA),
  ]);
  t.likes = [c.likes, g.likes]; t.tells = [c.tells, g.tells]; t.life = [c.life, g.life]; t.why = [c.why, g.why];
})), 8);

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '');
const file = join(OUT, `n1-${country}-${pilot ? 'pilot' : 'real'}-${stamp}.json`);
writeFileSync(file, JSON.stringify(visits, null, 1));

const sentences = (s: string) => s.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
console.log(`N1 · ${country} · ${pilot ? 'pilot' : 'real run'} · ${file}\n`);
type K = 'likes' | 'tells' | 'life';
for (const { arm } of ARMS) {
  const ts = visits.filter((v) => v.arm === arm).flatMap((v) => v.turns);
  const after = ts.filter((t) => t.turn > 0);
  const as = ts.flatMap((t) => t.answers.map((a) => a.text));
  const two = as.filter((a) => sentences(a).length >= 2);
  const both = (k: K, of = ts) => of.filter((t) => t[k]![0] && t[k]![1]).length;
  const either = (k: K, of = ts) => of.filter((t) => t[k]![0] || t[k]![1]).length;
  console.log(`${arm}: turns ${ts.length} (${after.length} after the opener), answers ${as.length}
  1 asks liking of the place or something there, after the opener (both judges): ${both('likes', after)} of ${after.length}   (either judge ${either('likes', after)}; openers ${both('likes', ts.filter((t) => t.turn === 0))})
  2 answers, second part a question: ${two.filter((a) => sentences(a).at(-1)!.includes('?')).length}
  3 answers, second part not a question: ${two.filter((a) => !sentences(a).at(-1)!.includes('?')).length}
  4 tells something specific and new about the place (both judges): ${both('tells')}   (either judge ${either('tells')})
  4b the same about her own life or work: ${both('life')}   (either judge ${either('life')})
  5 words an answer: ${(as.reduce((n, a) => n + words(a), 0) / Math.max(1, as.length)).toFixed(1)}
  guards: her words in the language a turn ${(ts.reduce((n, t) => n + words(t.line), 0) / ts.length).toFixed(1)}, reply ${(ts.reduce((n, t) => n + t.ms, 0) / ts.length / 1000).toFixed(1)} s, turns with fewer than two answers ${ts.filter((t) => t.answers.length < 2).length}, visits ended early ${visits.filter((v) => v.arm === arm && v.endedEarly).length}
  notes drawn: ${Object.entries(ts.reduce<Record<string, number>>((m, t) => ({ ...m, [t.setup]: (m[t.setup] ?? 0) + 1 }), {})).map(([k, n]) => `${k} ${n}`).join(', ')}`);
}
