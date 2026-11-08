// C7 (docs/prompt-trials.md → C7): the character's payload, as is (A, the
// game's Intermediate prompt unchanged) against stripped (B, the same prompt
// with its who line replaced by name, role, place, city and "You were born
// here."). Only the text sent to Claude changes, inside this script: both go
// through the game's own turn code (B by its replacement-prompt parameter).
// Don Ramón, one 3-visit conversation each, side by side; Grok plays Sam; the
// game's memory between visits. The measure: not clearly worse, two judges
// reading both conversations blind; plus a guard that B stays who he is.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/stripped-payload.mts
// Another character: CITY=<city id> PLACE=<place id> (and COUNTRY=it for Italy), e.g.
//   COUNTRY=it CITY=siena PLACE=piazza-del-campo npx tsx --env-file=.env.local tests/experiments/stripped-payload.mts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, askGrok, startTest } from './common.mjs';

startTest('C7 (2026-11-07)');

const FAST_GROK = 'grok-4.20-0309-non-reasoning';
const VISITS = 3, SAM_TURNS = 4;
const T0 = Date.now();
const CITY = process.env.CITY ?? 'san-miguel-de-allende', PLACE = process.env.PLACE ?? 'el-mirador-san-miguel';
const foundCity = cities.find((c) => c.id === CITY);
const foundPlace = foundCity?.places.find((p) => p.id === PLACE);
if (!foundCity || !foundPlace) throw new Error(`no place ${CITY}/${PLACE} in ${language.card.country}`);
const city = foundCity, place = foundPlace;
// "ramon" is whoever stands at the place (Don Ramón by default)
const ramon = characterForPlace(city, place)!;
if (!ramon) throw new Error(`nobody at ${CITY}/${PLACE}`);
const STRIPPED = `You are ${ramon.name}, ${ramon.role}, at ${place.name} (${place.kind}), in ${city.name}. You were born here.`;

type Memory = { visits: number; lastVisit: string; notes: string[] } | undefined;
/** B: the game's own prompt for this turn, its who line (the first paragraph) replaced */
function strippedSystem(c: CharacterSheet, transcript: Turn[], memory: Memory, now: Date): string {
  const full = (buildTurnPrompt({ character: c, transcript, memory: memory as never, now } as never) as { system: string }).system;
  const cut = full.indexOf('\n\n');
  if (cut < 0 || !full.startsWith(`You are ${c.name}`)) throw new Error('who line not found');
  return STRIPPED + full.slice(cut);
}

const SAM = { type: 'object', properties: { say: { type: 'string' } }, required: ['say'], additionalProperties: false };
async function samTurn(earlier: string[], lines: string[], last: boolean): Promise<string> {
  const q = [
    `You are Sam, someone who loves ${language.card.country} and is living in ${language.card.country} for a while, not a tourist, and is in ${city.name} today. You are learning ${language.name} and speak it simply, in short sentences.`,
    `You are talking with ${ramon.name}, ${ramon.role}, at ${place.name}.`,
    'Answer what he asks truthfully, and stay consistent with anything you said before. Make up ordinary details about yourself if asked, and keep them.',
    'Never be the first to name a local place, food, drink, custom, festival or person; you may repeat something he named. Don\'t ask him about the town\'s culture or history.',
    ...(earlier.length ? ['', 'Your earlier visits with him:', ...earlier] : []),
    '', 'This conversation so far:', ...lines, '',
    last ? `Say goodbye now, in ${language.name}, in a sentence or two.` : `Your reply, in ${language.name}: one or two short sentences.`,
    'Reply with JSON: say.',
  ].join('\n');
  return (await askGrok<{ say: string }>(q, SAM, FAST_GROK)).say;
}

async function conversation(label: 'A' | 'B'): Promise<string[]> {
  let notes: string[] = [];
  const earlier: string[] = [];
  const visits: string[] = [];
  for (let k = 0; k < VISITS; k++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (VISITS - 1 - k));
    const memory: Memory = k ? { visits: k, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const t: Turn[] = [];
    const lines: string[] = [];
    const npc = async (learnerSaid?: string) => {
      const system = label === 'B' ? strippedSystem(ramon, t, memory, now) : undefined;
      const r = await runTurn({ character: ramon, transcript: [...t], learnerSaid, memory: memory as never, now, withDone: true, ...(system ? { system } : {}) });
      if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
      lines.push(`${ramon.name}: ${r.line}`);
      console.log(`${label} visit ${k + 1} · ${ramon.name}: ${r.line}`);
    };
    await npc();
    for (let turn = 1; turn <= SAM_TURNS; turn++) {
      const said = await samTurn(earlier, lines, turn === SAM_TURNS);
      lines.push(`Sam: ${said}`);
      console.log(`${label} visit ${k + 1} · Sam: ${said}`);
      await npc(said);
    }
    visits.push(lines.join('\n'));
    earlier.push(`(visit ${k + 1}) ${lines.join(' / ')}`);
    notes = (await summarizeWithClaude({ character: { name: ramon.name, age: ramon.age, role: ramon.role, city: ramon.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
  }
  return visits;
}

const [A, B] = await Promise.all([conversation('A'), conversation('B')]);

// The measure: blind, random order, X and Y
const flip = Math.random() < 0.5;
const [X, Y] = flip ? [B, A] : [A, B];
const show = (v: string[]) => v.map((s, i) => `Visit ${i + 1}:\n${s}`).join('\n\n');
const VERDICT = { type: 'object', properties: { better: { type: 'string', enum: ['X', 'Y', 'same'] }, reason: { type: 'string' } }, required: ['better', 'reason'], additionalProperties: false };
const q = [
  `Two versions of the same three visits, three days apart, between ${ramon.name}, a ${ramon.age}-year-old ${ramon.role} at ${place.name} in ${city.name}, and Sam, a learner living in ${language.card.country}.`,
  'Which is clearly better at this goal: he talks like a local, not a guidebook; and each return visit carries on from the earlier ones instead of replaying them (asking again a question Sam already answered, or telling again as new something he already told)? If neither is clearly better, say same.',
  '', 'X:', show(X), '', 'Y:', show(Y), '', 'Reply with JSON: better (X, Y or same), reason (two sentences).',
].join('\n');
const GUARD = { type: 'object', properties: { himself: { type: 'boolean' }, reason: { type: 'string' } }, required: ['himself', 'reason'], additionalProperties: false };
const g = `Below are three visits with ${ramon.name}. Does this character stay a ${ramon.age}-year-old ${ramon.role} from ${city.name} throughout, with no invented job, a different age, or a manner that doesn't fit? Reply with JSON: himself (true or false), reason.\n\n${show(B)}`;
type V = { better: 'X' | 'Y' | 'same'; reason: string };
type G = { himself: boolean; reason: string };
const [vc, vg, gc, gg] = await Promise.all([
  ask(q, { schema: VERDICT, max: 1500 }).then((s) => JSON.parse(s) as V), askGrok<V>(q, VERDICT, FAST_GROK),
  ask(g, { schema: GUARD, max: 800 }).then((s) => JSON.parse(s) as G), askGrok<G>(g, GUARD, FAST_GROK),
]);
const name = (v: V['better']) => (v === 'same' ? 'about the same' : (v === 'X') === !flip ? 'as is (A) better' : 'stripped (B) better');
const aWins = name(vc.better) === 'as is (A) better' && name(vg.better) === 'as is (A) better';
const lost = !gc.himself && !gg.himself;
const result = [
  `Claude: ${name(vc.better)} (${vc.reason})`, `Grok: ${name(vg.better)} (${vg.reason})`,
  `Stripped stays himself: Claude ${gc.himself ? 'yes' : 'no'} (${gc.reason}) · Grok ${gg.himself ? 'yes' : 'no'} (${gg.reason})`,
  `Result: stripped is ${aWins || lost ? 'CLEARLY WORSE' : 'not clearly worse'}`,
];
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c7-${CITY}-${PLACE}-${new Date().toISOString().slice(0, 16).replace(':', '')}`);
writeFileSync(`${file}.json`, JSON.stringify({ A, B, flip, vc, vg, gc, gg }, null, 1));
writeFileSync(`${file}.md`, ['# C7: the payload, as is against stripped', '', `Stripped who line: "${STRIPPED}"`, '', ...result.map((r) => `- ${r}`), '', '## As is (A)', '', show(A), '', '## Stripped (B)', '', show(B), ''].join('\n'));
console.log(result.join('\n') + `\nTime: ${((Date.now() - T0) / 1000).toFixed(0)} s\n→ ${file.replace(process.cwd() + '/', '')}.md`);
