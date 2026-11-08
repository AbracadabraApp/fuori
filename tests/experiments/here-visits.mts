// C8 (docs/prompt-trials.md → C8): the here line as it is (A) against one
// sentence cut from it (B), H2's 10 Mexico characters, one 3-visit conversation
// each, Sam on Grok, the game's memory between visits. Per character, Claude and
// Grok read both conversations blind (X/Y): which is clearly better for a
// newcomer learning the country, or about the same. Shorter wins unless both
// judges pick A for more than half.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/here-visits.mts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, askGrok, startTest } from './common.mjs';

startTest('C8 (2026-11-08)');

const FAST_GROK = 'grok-4.20-0309-non-reasoning';
const VISITS = 3, SAM_TURNS = 4;
const T0 = Date.now();
// B, Josh's yes 2026-11-08: one sentence each, cut from the character's own line
const SHORT: Record<string, string> = {
  'Don Chucho Mendoza': 'You shine shoes at your stand in Roma Norte.',
  'Vale Ortiz': 'You work at Libros Tecolote, a bookshop in Coyoacán.',
  'Doña Ofelia Santiago': 'You make tlayudas in the smoky aisle of the Mercado 20 de Noviembre.',
  'Emiliano Matus': 'You tend the bar at Mezcalería Los Amantes, pouring mezcal.',
  'Memo Orozco': 'You run a tejuino cart next to the Mercado San Juan de Dios.',
  'Ximena Godínez': 'You shape and paint clay in your workshop in Tlaquepaque.',
  'Doña Rosa Ledesma': 'You sell flowers at your stall in the Mercado Ignacio Ramírez.',
  'Beto Rangel': 'You wait for fares at the taxi stand by the Jardín Allende.',
  'Sofía Quintero': 'You help out in your family\'s dulcería on the Calle de los Dulces, selling sweets.',
  'Padre Tomás Herrera': 'You greet people at the Templo de Santo Domingo between services.',
};

const people = cities.filter((c) => !c.hidden).flatMap((c) =>
  (c.characters ?? []).filter((p) => p.here && c.places.some((x) => x.id === p.placeId && !x.hidden && x.characterId === p.id)).slice(0, 2).map((p) => ({ city: c, place: c.places.find((x) => x.id === p.placeId)!, here: p.here! }))).slice(0, 10);

function sheets(p: typeof people[number]): { A: CharacterSheet; B: CharacterSheet } {
  const A = characterForPlace(p.city, p.place)!;
  const short = SHORT[A.name];
  if (!short) throw new Error(`no short line for ${A.name}`);
  if (!A.appearance.setting.endsWith(p.here)) throw new Error(`${A.name}: here line not at the end of the setting`);
  return { A, B: { ...A, appearance: { ...A.appearance, setting: A.appearance.setting.slice(0, -p.here.length) + short } } };
}

const SAM = { type: 'object', properties: { say: { type: 'string' } }, required: ['say'], additionalProperties: false };
async function samTurn(him: CharacterSheet, p: typeof people[number], earlier: string[], lines: string[], last: boolean): Promise<string> {
  const q = [
    `You are Sam, someone who loves ${language.card.country} and is living in ${language.card.country} for a while, not a tourist, and is in ${p.city.name} today. You are learning ${language.name} and speak it simply, in short sentences.`,
    `You are talking with ${him.name}, ${him.role}, at ${p.place.name}.`,
    'Answer what they ask truthfully, and stay consistent with anything you said before. Make up ordinary details about yourself if asked, and keep them.',
    'Never be the first to name a local place, food, drink, custom, festival or person; you may repeat something they named. Don\'t ask them about the town\'s culture or history.',
    'Don\'t repeat your own earlier lines or greetings; talk the way you would on this visit.',
    ...(earlier.length ? ['', 'Your earlier visits with them:', ...earlier] : []),
    '', 'This conversation so far:', ...lines, '',
    last ? `Say goodbye now, in ${language.name}, in a sentence or two.` : `Your reply, in ${language.name}: one or two short sentences.`,
    'Reply with JSON: say.',
  ].join('\n');
  return (await askGrok<{ say: string }>(q, SAM, FAST_GROK)).say;
}

async function conversation(him: CharacterSheet, p: typeof people[number]): Promise<string[]> {
  let notes: string[] = [];
  const earlier: string[] = [], visits: string[] = [];
  for (let k = 0; k < VISITS; k++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (VISITS - 1 - k));
    const memory = k ? { visits: k, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const t: Turn[] = [];
    const lines: string[] = [];
    const npc = async (learnerSaid?: string) => {
      const r = await runTurn({ character: him, transcript: [...t], learnerSaid, memory: memory as never, now, withDone: true });
      if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
      lines.push(`${him.name}: ${r.line}`);
    };
    await npc();
    for (let turn = 1; turn <= SAM_TURNS; turn++) {
      const said = await samTurn(him, p, earlier, lines, turn === SAM_TURNS);
      lines.push(`Sam: ${said}`);
      await npc(said);
    }
    visits.push(lines.join('\n'));
    earlier.push(`(visit ${k + 1}) ${lines.join(' / ')}`);
    notes = (await summarizeWithClaude({ character: { name: him.name, age: him.age, role: him.role, city: him.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
  }
  return visits;
}

const show = (v: string[]) => v.map((s, i) => `Visit ${i + 1}:\n${s}`).join('\n\n');
const VERDICT = { type: 'object', properties: { better: { type: 'string', enum: ['X', 'Y', 'same'] }, reason: { type: 'string' } }, required: ['better', 'reason'], additionalProperties: false };
type V = { better: 'X' | 'Y' | 'same'; reason: string };

async function one(p: typeof people[number]) {
  const { A, B } = sheets(p);
  const [a, b] = await Promise.all([conversation(A, p), conversation(B, p)]);
  // guard: words per character line, so a pick on length alone shows
  const wpl = (v: string[]) => { const ls = v.join('\n').split('\n').filter((l) => l.startsWith(`${A.name}: `)); return ls.reduce((n, l) => n + l.split(/\s+/).length - A.name.split(' ').length, 0) / ls.length; };
  const flip = Math.random() < 0.5;
  const [X, Y] = flip ? [b, a] : [a, b];
  const q = [
    `Two versions of the same three visits, three days apart, between ${A.name}, ${A.role} at ${p.place.name} in ${p.city.name}, and Sam, a newcomer living in ${language.card.country} and learning ${language.name}.`,
    `Which is clearly better for Sam, who wants to learn ${language.card.country}: its people, culture and language, so as to talk about real things with real people? If neither is clearly better, say same.`,
    '', 'X:', show(X), '', 'Y:', show(Y), '', 'Reply with JSON: better (X, Y or same), reason (two sentences).',
  ].join('\n');
  const [vc, vg] = await Promise.all([ask(q, { schema: VERDICT, max: 1500 }).then((s) => JSON.parse(s) as V), askGrok<V>(q, VERDICT, FAST_GROK)]);
  const name = (v: V['better']) => (v === 'same' ? 'same' : (v === 'X') === !flip ? 'A' : 'B');
  const c = name(vc.better), g = name(vg.better);
  console.log(`${A.name}: Claude ${c} · Grok ${g}  (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
  return { name: A.name, here: p.here, short: SHORT[A.name], a, b, claude: { pick: c, reason: vc.reason }, grok: { pick: g, reason: vg.reason }, aWins: c === 'A' && g === 'A', bWins: c === 'B' && g === 'B', words: { a: wpl(a), b: wpl(b) } };
}

const settled = await Promise.allSettled(people.map(one));
for (const r of settled) if (r.status === 'rejected') console.error(`failed: ${r.reason}`);
const out = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
const avg = (k: 'a' | 'b') => (out.reduce((n, o) => n + o.words[k], 0) / out.length).toFixed(1);
const aWins = out.filter((o) => o.aWins).length, bWins = out.filter((o) => o.bWins).length;
const result = `Long (A) wins ${aWins} of ${out.length} (both judges), short (B) ${bWins}, the rest split or same. ${aWins > out.length / 2 ? 'LONGER WINS: we don\'t know a better here line yet' : 'SHORTER WINS'}. Words per line: A ${avg('a')} · B ${avg('b')}`;
const md = ['# C8: the one-sentence here line, over return visits', '', result, '', ...out.flatMap((o) => [
  `## ${o.name}: Claude ${o.claude.pick}, Grok ${o.grok.pick} (words per line A ${o.words.a.toFixed(1)} · B ${o.words.b.toFixed(1)})`, '', `- Claude: ${o.claude.reason}`, `- Grok: ${o.grok.reason}`, '', `A (as is): "${o.here}"`, '', show(o.a), '', `B (short): "${o.short}"`, '', show(o.b), '']),
].join('\n');
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c8-es-mx-${new Date().toISOString().slice(0, 16).replace(':', '')}.md`);
writeFileSync(file, md);
console.log(`${result}\nTime: ${((Date.now() - T0) / 1000).toFixed(0)} s\n→ ${file.replace(process.cwd() + '/', '')}`);
