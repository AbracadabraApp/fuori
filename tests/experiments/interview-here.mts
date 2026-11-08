// C9 (docs/prompt-trials.md → C9): H2's interview with the here line as it is (A)
// and edited from the character's own point of view (B), H2's 10 Mexico
// characters. Per character, Claude and Grok read both interviews blind (X/Y):
// which gives a newcomer more real things to learn about the country, or about
// the same. Shorter wins unless both judges pick A for more than half.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/interview-here.mts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, askGrok, startTest } from './common.mjs';

startTest('C9 (2026-11-08)');

const FAST_GROK = 'grok-4.20-0309-non-reasoning';
const T0 = Date.now();
const QUESTIONS = ['Hola. ¿Qué hace usted aquí?', '¿Qué me recomienda?', '¿Qué debería saber alguien nuevo aquí?', '¿De dónde es usted?', '¿Qué hace en su tiempo libre?'];
// B, Josh's "Edit all 10" and "Ok", 2026-11-08
const EDITED: Record<string, string> = {
  'Don Chucho Mendoza': 'You spend your day at your stand, shining shoes with polish and a brush for customers who climb up on the chair for a boleada.',
  'Vale Ortiz': 'You work at Libros Tecolote, finding people the book they didn\'t know they wanted.',
  'Doña Ofelia Santiago': 'You make tlayudas on the comal, spread with asiento, beans and quesillo, while tasajo and cecina enchilada grill over charcoal and smoke fills the aisle.',
  'Emiliano Matus': 'You tend the bar at Mezcalería Los Amantes, serving mezcal in small copitas, sipped slowly with orange slices and sal de gusano. Espadín is what you pour most often.',
  'Memo Orozco': 'You run a tejuino cart next to the Mercado San Juan de Dios, serving it with lime, salt and ice, and a scoop of lime nieve on top for those who want it.',
  'Ximena Godínez': 'You shape clay and paint your pieces in your workshop: cazuelas, jarros and plates, some polished by hand with a smooth stone.',
  'Doña Rosa Ledesma': 'You sell flowers at your stall, wrapping them in paper for people who want them for the church or for the altar at home.',
  'Beto Rangel': 'You wait at the taxi stand by the Jardín Allende, taking people up and down the cobbled streets.',
  'Sofía Quintero': 'You help out in your family\'s dulcería on the Calle de los Dulces, selling camote, tortitas de Santa Clara, muéganos and jamoncillo.',
  'Padre Tomás Herrera': 'You are the priest at the Templo de Santo Domingo, and you greet people between services.',
};

const people = cities.filter((c) => !c.hidden).flatMap((c) =>
  (c.characters ?? []).filter((p) => p.here && c.places.some((x) => x.id === p.placeId && !x.hidden && x.characterId === p.id)).slice(0, 2).map((p) => ({ city: c, place: c.places.find((x) => x.id === p.placeId)!, here: p.here! }))).slice(0, 10);

function sheets(p: typeof people[number]): { A: CharacterSheet; B: CharacterSheet } {
  const A = characterForPlace(p.city, p.place)!;
  const edited = EDITED[A.name];
  if (!edited) throw new Error(`no edited line for ${A.name}`);
  if (!A.appearance.setting.endsWith(p.here)) throw new Error(`${A.name}: here line not at the end of the setting`);
  return { A, B: { ...A, appearance: { ...A.appearance, setting: A.appearance.setting.slice(0, -p.here.length) + edited } } };
}

async function interview(him: CharacterSheet): Promise<string> {
  const t: Turn[] = [];
  const lines: string[] = [];
  const npc = async (learnerSaid?: string) => {
    const r = await runTurn({ character: him, transcript: [...t], learnerSaid });
    if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
    t.push({ who: 'npc', transcript: r.line, translation: r.en });
    lines.push(`${him.name}: ${r.line}\n  (${r.en})`);
  };
  await npc();
  for (const q of QUESTIONS) { lines.push(`Learner: ${q}`); await npc(q); }
  return lines.join('\n');
}

const VERDICT = { type: 'object', properties: { better: { type: 'string', enum: ['X', 'Y', 'same'] }, reason: { type: 'string' } }, required: ['better', 'reason'], additionalProperties: false };
type V = { better: 'X' | 'Y' | 'same'; reason: string };
const TAUGHT = { type: 'object', properties: { taught: { type: 'array', items: { type: 'string' } } }, required: ['taught'], additionalProperties: false };
const taught = async (who: string, text: string) => (JSON.parse(await ask(`An interview with ${who}.\n\n${text}\n\nList each real thing about ${language.card.country} (its people, customs, food, places, words) a newcomer learns from these answers, each short, in English. Reply with JSON: taught.`, { schema: TAUGHT, max: 1500 })) as { taught: string[] }).taught;

async function one(p: typeof people[number]) {
  const { A, B } = sheets(p);
  const [a, b] = await Promise.all([interview(A), interview(B)]);
  const wpl = (v: string) => { const ls = v.split('\n').filter((l) => l.startsWith(`${A.name}: `)); return ls.reduce((n, l) => n + l.split(/\s+/).length - A.name.split(' ').length, 0) / ls.length; };
  const flip = Math.random() < 0.5;
  const [X, Y] = flip ? [b, a] : [a, b];
  const q = [
    `Two versions of the same first meeting with ${A.name}, ${A.role} in ${p.city.name}. A newcomer living in ${language.card.country} asks the same five questions.`,
    `Which is clearly better for a newcomer learning ${language.card.country} (its people, culture and language)? If neither is clearly better, say same.`,
    '', 'X:', X, '', 'Y:', Y, '', 'Reply with JSON: better (X, Y or same), reason (two sentences).',
  ].join('\n');
  const [vc, vg, ta, tb] = await Promise.all([ask(q, { schema: VERDICT, max: 1500 }).then((s) => JSON.parse(s) as V), askGrok<V>(q, VERDICT, FAST_GROK), taught(A.name, a), taught(A.name, b)]);
  const name = (v: V['better']) => (v === 'same' ? 'same' : (v === 'X') === !flip ? 'A' : 'B');
  const c = name(vc.better), g = name(vg.better);
  const words = { a: wpl(a), b: wpl(b), lineA: p.here.split(/\s+/).length, lineB: EDITED[A.name].split(/\s+/).length };
  console.log(`${A.name}: Claude ${c} · Grok ${g} · taught A ${ta.length} B ${tb.length} · words per reply A ${words.a.toFixed(1)} B ${words.b.toFixed(1)} · line A ${words.lineA} B ${words.lineB}`);
  return { name: A.name, here: p.here, edited: EDITED[A.name], a, b, ta, tb, claude: { pick: c, reason: vc.reason }, grok: { pick: g, reason: vg.reason }, aWins: c === 'A' && g === 'A', bWins: c === 'B' && g === 'B', words };
}

const settled = await Promise.allSettled(people.map(one));
for (const r of settled) if (r.status === 'rejected') console.error(`failed: ${r.reason}`);
const out = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
const aWins = out.filter((o) => o.aWins).length, bWins = out.filter((o) => o.bWins).length;
const sum = (k: 'ta' | 'tb') => out.reduce((n, o) => n + o[k].length, 0);
const avg = (k: 'a' | 'b') => (out.reduce((n, o) => n + o.words[k], 0) / out.length).toFixed(1);
const result = `Long (A) wins ${aWins} of ${out.length} (both judges), edited (B) ${bWins}, the rest split or same. ${aWins > out.length / 2 ? 'LONGER WINS: the cut facts did work' : 'SHORTER WINS'}. Things taught: A ${sum('ta')} · B ${sum('tb')}. Words per reply: A ${avg('a')} · B ${avg('b')}`;
const list = (xs: string[]) => xs.map((x) => `- ${x}`).join('\n') || '- nothing';
const md = ['# C9: here lines edited from their own point of view, interviewed', '', result, '', ...out.flatMap((o) => [
  `## ${o.name}: Claude ${o.claude.pick}, Grok ${o.grok.pick} (words per reply A ${o.words.a.toFixed(1)} · B ${o.words.b.toFixed(1)}; line A ${o.words.lineA} · B ${o.words.lineB} words)`, '', `- Claude: ${o.claude.reason}`, `- Grok: ${o.grok.reason}`, '',
  `A (as is): "${o.here}"`, '', `Taught (${o.ta.length}):`, list(o.ta), '', '```', o.a, '```', '',
  `B (edited): "${o.edited}"`, '', `Taught (${o.tb.length}):`, list(o.tb), '', '```', o.b, '```', '']),
].join('\n');
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c9-es-mx-${new Date().toISOString().slice(0, 16).replace(':', '')}.md`);
writeFileSync(file, md);
console.log(`${result}\nTime: ${((Date.now() - T0) / 1000).toFixed(0)} s\n→ ${file.replace(process.cwd() + '/', '')}`);
