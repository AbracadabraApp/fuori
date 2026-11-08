// C5b (docs/prompt-trials.md → C5b): the met-before line as it is (A) against
// the same with "Don't repeat yourself." after the notes (B). Only the text sent to Claude changes, inside this
// script: both go through the game's own turn code (B by its replacement-prompt
// parameter). Don Ramón, one 3-visit conversation each, side by side; Grok plays
// Sam; the game's memory between visits. The measure: groundhog repeats on
// visits 2 and 3 (told again as new, or a question asked again after Sam
// answered it), listed by Claude and Grok, blind; a repeat counts when both list it.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/memory-line.mts
// Another character: CITY=<city id> PLACE=<place id> (and COUNTRY=it for Italy).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { summarizeWithClaude } from '@/lib/remember';
import { withDialogueRules } from '@/lib/dialogue/rules';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, askGrok, startTest } from './common.mjs';

startTest('C5b (2026-11-08)');

const FAST_GROK = 'grok-4.20-0309-non-reasoning';
const VISITS = 3, SAM_TURNS = 4;
const T0 = Date.now();
const CITY = process.env.CITY ?? 'san-miguel-de-allende', PLACE = process.env.PLACE ?? 'el-mirador-san-miguel';
const foundCity = cities.find((c) => c.id === CITY);
const foundPlace = foundCity?.places.find((p) => p.id === PLACE);
if (!foundCity || !foundPlace) throw new Error(`no place ${CITY}/${PLACE} in ${language.card.country}`);
const city = foundCity, place = foundPlace;
const him = characterForPlace(city, place)!;
if (!him) throw new Error(`nobody at ${CITY}/${PLACE}`);
const ADDED = "Don't repeat yourself."; // Josh, 2026-11-08: a guardrail, not a steer

type Memory = { visits: number; lastVisit: string; notes: string[] } | undefined;
/** B: the game's own prompt for this turn, with the sentence after the notes line */
function lineB(c: CharacterSheet, transcript: Turn[], memory: Memory, now: Date): string | undefined {
  if (!memory) return undefined; // first visit: no met-before line, A and B the same
  const full = (buildTurnPrompt({ character: c, transcript, memory: memory as never, now } as never) as { system: string }).system;
  const at = full.match(/^You remember: .*$/m);
  if (!at) throw new Error('notes line not found');
  // the turn code adds the shared rules to a replacement prompt too, so take off the copy already in it
  const rules = withDialogueRules('');
  if (!full.endsWith(rules)) throw new Error('rules block not at the end');
  return full.slice(0, -rules.length).replace(at[0], `${at[0]}\n${ADDED}`);
}

const SAM = { type: 'object', properties: { say: { type: 'string' } }, required: ['say'], additionalProperties: false };
async function samTurn(earlier: string[], lines: string[], last: boolean): Promise<string> {
  const q = [
    `You are Sam, someone who loves ${language.card.country} and is living in ${language.card.country} for a while, not a tourist, and is in ${city.name} today. You are learning ${language.name} and speak it simply, in short sentences.`,
    `You are talking with ${him.name}, ${him.role}, at ${place.name}.`,
    'Answer what he asks truthfully, and stay consistent with anything you said before. Make up ordinary details about yourself if asked, and keep them.',
    'Never be the first to name a local place, food, drink, custom, festival or person; you may repeat something he named. Don\'t ask him about the town\'s culture or history.',
    'Don\'t repeat your own earlier lines or greetings; talk the way you would on this visit.',
    ...(earlier.length ? ['', 'Your earlier visits with him:', ...earlier] : []),
    '', 'This conversation so far:', ...lines, '',
    last ? `Say goodbye now, in ${language.name}, in a sentence or two.` : `Your reply, in ${language.name}: one or two short sentences.`,
    'Reply with JSON: say.',
  ].join('\n');
  return (await askGrok<{ say: string }>(q, SAM, FAST_GROK)).say;
}

async function conversation(label: 'A' | 'B'): Promise<{ visits: string[]; notes: string[][] }> {
  let notes: string[] = [];
  const earlier: string[] = [], visits: string[] = [], allNotes: string[][] = [];
  for (let k = 0; k < VISITS; k++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (VISITS - 1 - k));
    const memory: Memory = k ? { visits: k, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const t: Turn[] = [];
    const lines: string[] = [];
    const npc = async (learnerSaid?: string) => {
      const system = label === 'B' ? lineB(him, t, memory, now) : undefined;
      const r = await runTurn({ character: him, transcript: [...t], learnerSaid, memory: memory as never, now, withDone: true, ...(system ? { system } : {}) });
      if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
      lines.push(`${him.name}: ${r.line}`);
      console.log(`${label} visit ${k + 1} · ${him.name}: ${r.line}`);
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
    notes = (await summarizeWithClaude({ character: { name: him.name, age: him.age, role: him.role, city: him.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
    allNotes.push(notes);
  }
  return { visits, notes: allNotes };
}

const [A, B] = await Promise.all([conversation('A'), conversation('B')]);

// The measure: groundhog repeats, each conversation judged alone, blind to version
const show = (v: string[]) => v.map((s, i) => `Visit ${i + 1}:\n${s}`).join('\n\n');
const LIST = { type: 'object', properties: { repeats: { type: 'array', items: { type: 'object', properties: { visit: { type: 'integer' }, quote: { type: 'string' }, earlier: { type: 'string' } }, required: ['visit', 'quote', 'earlier'], additionalProperties: false } } }, required: ['repeats'], additionalProperties: false };
const judgeQ = (v: string[]) => [
  `Three visits, three days apart, between ${him.name}, a ${him.role} at ${place.name} in ${city.name}, and Sam, a learner living in ${language.card.country}.`,
  `List every time, on visit 2 or 3, ${him.name} replays an earlier visit as if it hadn't happened: he tells Sam something as new that he already told on an earlier visit, or asks a question Sam already answered on an earlier visit.`,
  'Do not list: coming back to a topic, referring back to what was said ("did you go in the end?", "as I told you"), building on it, or anything Sam brings up first. Only replays.',
  '', show(v), '',
  'Reply with JSON: repeats, each with visit (2 or 3), quote (his words on that visit), earlier (what he said or asked before). Empty if none.',
].join('\n');
type L = { repeats: { visit: number; quote: string; earlier: string }[] };
const judge = async (v: string[]) => {
  const q = judgeQ(v);
  const [c, g] = await Promise.all([ask(q, { schema: LIST, max: 2000 }).then((s) => JSON.parse(s) as L), askGrok<L>(q, LIST, FAST_GROK)]);
  return { claude: c.repeats, grok: g.repeats };
};
const [jA, jB] = await Promise.all([judge(A.visits), judge(B.visits)]);

// Both list it: same visit and a shared word of 5+ letters in the quote (the listed lines are printed for reading either way)
const words = (s: string) => new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-zñ]{5,}/g) ?? []);
const agreed = (j: Awaited<ReturnType<typeof judge>>) => j.claude.filter((c) => j.grok.some((g) => g.visit === c.visit && [...words(c.quote)].some((w) => words(g.quote).has(w))));
const aBoth = agreed(jA), bBoth = agreed(jB);
const verdict = aBoth.length && !bBoth.length ? 'HYPOTHESIS MET: A replays, B doesn\'t'
  : !aBoth.length && !bBoth.length ? 'neither replays: nothing to change'
  : aBoth.length && bBoth.length ? 'both replay: the line isn\'t the cause'
  : 'B replays and A doesn\'t: the sentence makes it worse';
const list = (xs: L['repeats']) => xs.map((x) => `  v${x.visit}: "${x.quote}" (earlier: ${x.earlier})`).join('\n') || '  none';
const result = [
  `A (as is): both judges ${aBoth.length} · Claude ${jA.claude.length} · Grok ${jA.grok.length}`, list(aBoth),
  `B (+ sentence): both judges ${bBoth.length} · Claude ${jB.claude.length} · Grok ${jB.grok.length}`, list(bBoth),
  `Result: ${verdict}`,
];
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c5b-${CITY}-${PLACE}-${new Date().toISOString().slice(0, 16).replace(':', '')}`);
writeFileSync(`${file}.json`, JSON.stringify({ A, B, jA, jB }, null, 1));
writeFileSync(`${file}.md`, ['# C5b: the memory line', '', `B adds: "${ADDED}"`, '', ...result, '', '## Judges, all listed', '', `A Claude:\n${list(jA.claude)}`, `A Grok:\n${list(jA.grok)}`, `B Claude:\n${list(jB.claude)}`, `B Grok:\n${list(jB.grok)}`, '', '## As is (A)', '', show(A.visits), '', `Notes: ${A.notes.map((n) => n.join('; ')).join(' | ')}`, '', '## With the sentence (B)', '', show(B.visits), '', `Notes: ${B.notes.map((n) => n.join('; ')).join(' | ')}`, ''].join('\n'));
console.log(result.join('\n') + `\nTime: ${((Date.now() - T0) / 1000).toFixed(0)} s\n→ ${file.replace(process.cwd() + '/', '')}.md`);
