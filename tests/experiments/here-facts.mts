// C3 (docs/prompt-trials.md → C3): does a here line with 5 facts give more
// different local things across 3 visits than the same line cut to its first 3?
// On the floor prompt (floor-prompt.mts), at two Mexican places that don't
// sell; three visits a set, 3 days apart, memory written between visits by the
// game's own summariser; the learner's lines fixed. Counted in code from the
// card's lists (the line's facts and true local things not in it), only in her
// english, word and question parts and their English, never the answers
// offered. Every visit, every keyword hit and the guards are saved.
//   COUNTRY=es-mx STEP=pilot|run npx tsx --env-file=.env.local tests/experiments/here-facts.mts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn, type Part } from '@/lib/beginner';
import { STAGES } from '@/lib/path';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { pool, startTest } from './common.mjs';
import { useFloor } from './floor-prompt.mjs';

startTest('C3 (2026-11-07)');

const STEP = process.env.STEP ?? 'pilot';
// After the pilot: lines that fit after almost any opener (a greeting and the name together; two open doors)
const LEARNER = ['¡Buenas tardes! Soy Sam. ¿Cómo está?', '¿Y qué me cuenta hoy?', '¡Qué interesante! ¿Y qué más?', 'Gracias. ¡Hasta luego!'];

// The card's lists, written before the run: in the line (P, the last two cut in B) and not in it (U)
const PLACES = [
  {
    city: 'san-miguel-de-allende', place: 'el-mirador-san-miguel', name: 'Don Ramón, El Mirador',
    items: {
      R1: /nac[ií] aqu[ií]|born here|pueblo tranquilo|quiet town/i, R2: /zeferino|neog[óo]tic|alba[ñn]il|mason/i,
      R3: /ignacio allende|allende naci|naci[óo] allende|independencia|independence/i, R4: /artist|\bguerra\b|\bwar\b/i, R5: /unesco|patrimonio|2008/i,
      'Jardín': /jard[ií]n principal|jard[ií]n allende/i, 'Instituto Allende': /instituto allende/i, 'Bellas Artes': /bellas artes/i, 'La Aurora': /aurora/i,
      'Charco del Ingenio': /charco del ingenio/i, 'Atotonilco': /atotonilco/i, 'callejoneada': /callejoneada/i,
    } as Record<string, RegExp>,
    planted: ['R1', 'R2', 'R3', 'R4', 'R5'],
  },
  {
    city: 'oaxaca', place: 'monte-alban', name: 'Efrén, Monte Albán',
    items: {
      E1: /hablo zapoteco|en zapoteco|mi pueblo|my village/i, E2: /gran plaza/i, E3: /juego de pelota|ball ?court/i, E4: /danzante/i, E5: /unesco|patrimonio/i,
      'Tumba 7': /tumba|\btomb\b/i, 'Edificio J': /edificio j|building j|observator/i, 'Santo Domingo': /santo domingo/i, 'mezcal': /mezcal/i,
      'tlayuda': /tlayuda/i, 'Mitla': /mitla/i, 'Guelaguetza': /guelaguetza/i,
    } as Record<string, RegExp>,
    planted: ['E1', 'E2', 'E3', 'E4', 'E5'],
  },
];

/** B: the here line cut to its who sentence and first 3 facts (the last two sentences out) */
function cut(here: string): string {
  const s = here.split(/(?<=[.!?])\s+/);
  if (s.length !== 6) throw new Error(`expected a who sentence and 5 facts, got ${s.length} sentences: ${here}`);
  return s.slice(0, 4).join(' ');
}

type Visit = { lines: string[]; transcript: string; hits: { item: string; text: string }[]; words: number[]; langShare: number[]; ms: number[] };

async function set(p: typeof PLACES[number], version: 'A' | 'B'): Promise<Visit[]> {
  const city = cities.find((c) => c.id === p.city)!;
  const base = characterForPlace(city, city.places.find((x) => x.id === p.place)!)!;
  const here = city.characters!.find((c) => c.placeId === p.place)!.here!;
  if (!base.appearance.setting.includes(here)) throw new Error(`${p.name}: here line not in the setting`);
  const character: CharacterSheet = { ...base, appearance: { ...base.appearance, setting: version === 'B' ? base.appearance.setting.replace(here, cut(here)) : base.appearance.setting } };
  let notes: string[] = [];
  const visits: Visit[] = [];
  for (let v = 0; v < 3; v++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (2 - v));
    const memory = v ? { visits: v, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const t: Turn[] = [];
    const visit: Visit = { lines: [], transcript: '', hits: [], words: [], langShare: [], ms: [] };
    const turn = async (learnerSaid?: string) => {
      const t0 = Date.now();
      const r = await runBeginnerTurn({ character, transcript: [...t], learnerSaid, memory: memory as never, now, maxAnswers: STAGES.S2.answers, withDone: true });
      visit.ms.push(Date.now() - t0);
      if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
      // Only what she says, and its English: never the answers offered
      const said = r.parts.filter((x: Part) => x.kind !== 'answer');
      // A mention counts, questions too (Josh, 2026-11-07: "we dont need a high bar on facts")
      for (const x of said) for (const [item, re] of Object.entries(p.items)) for (const text of [x.text, x.en]) if (text && re.test(text)) visit.hits.push({ item, text });
      const lang = said.filter((x) => x.kind !== 'english').reduce((a, x) => a + x.text.split(/\s+/).filter(Boolean).length, 0);
      const en = said.filter((x) => x.kind === 'english').reduce((a, x) => a + x.text.split(/\s+/).filter(Boolean).length, 0);
      visit.words.push(r.line.split(/\s+/).filter(Boolean).length);
      visit.langShare.push(lang / Math.max(1, lang + en));
      return r;
    };
    let r = await turn();
    for (const said of LEARNER) {
      if (r.done) break;
      r = await turn(said);
    }
    visit.lines = t.filter((x) => x.who === 'npc').map((x) => x.transcript);
    visit.transcript = t.map((x) => `${x.who === 'npc' ? character.name : 'Learner'}: ${x.transcript}`).join('\n');
    visits.push(visit);
    notes = (await summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
  }
  return visits;
}

const labels: { label: string; version: 'A' | 'B' }[] = STEP === 'pilot' ? [{ label: 'A', version: 'A' }, { label: 'B', version: 'B' }] : [{ label: 'A1', version: 'A' }, { label: 'A2', version: 'A' }, { label: 'B', version: 'B' }];
// Real run in two waves, so it can stop early: 2 sets each, then 1 more (the card's stop rule)
const waves = STEP === 'pilot' ? [1] : [2, 1];

useFloor(true);
type Done = { place: string; label: string; visits: Visit[] };
const done: Done[] = [];
const items = (d: Done) => new Set(d.visits.flatMap((v) => v.hits.map((h) => h.item)));
const meanItems = (label: string, place?: string, only?: (i: string) => boolean) => {
  const ds = done.filter((d) => d.label === label && (!place || d.place === place));
  return ds.length ? ds.reduce((a, d) => a + [...items(d)].filter((i) => !only || only(i)).length, 0) / ds.length : 0;
};
let stopped = '';
for (const [w, n] of waves.entries()) {
  const jobs = PLACES.flatMap((p) => labels.flatMap(({ label, version }) => Array.from({ length: n }, () => async () => ({ place: p.name, label, visits: await set(p, version) }))));
  done.push(...await pool(jobs, 6));
  if (STEP !== 'pilot' && w === 0 && Math.abs(meanItems('A1') - meanItems('B')) <= 0.5) { stopped = `Stopped after the first wave: A1 ${meanItems('A1').toFixed(2)} and B ${meanItems('B').toFixed(2)} are 0.5 or less apart`; break; }
}
useFloor(false);

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const plantedIds = new Set(PLACES.flatMap((p) => p.planted));
const retold = (d: Done) => [...items(d)].filter((i) => d.visits.filter((v) => v.hits.some((h) => h.item === i)).length >= 2).length;
const row = (title: string, f: (label: string) => string) => `| ${title} | ${labels.map(({ label }) => f(label)).join(' | ')} |`;
const forLabel = (label: string) => done.filter((d) => d.label === label);
const summary = [
  `| | ${labels.map(({ label }) => (label === 'B' ? 'Cut to 3 facts' : `5 facts (${label})`)).join(' | ')} |`, `|---|${labels.map(() => '---').join('|')}|`,
  row('Different local things per set', (l) => meanItems(l).toFixed(2)),
  ...PLACES.map((p) => row(`  ${p.name}`, (l) => meanItems(l, p.name).toFixed(2))),
  row('  of them from the line', (l) => meanItems(l, undefined, (i) => plantedIds.has(i)).toFixed(2)),
  row('  of them not in the line', (l) => meanItems(l, undefined, (i) => !plantedIds.has(i)).toFixed(2)),
  row('Sets', (l) => `${forLabel(l).length}`),
  row('Things said on 2+ visits of a set (read)', (l) => mean(forLabel(l).map(retold)).toFixed(2)),
  row('Words per turn', (l) => mean(forLabel(l).flatMap((d) => d.visits.flatMap((v) => v.words))).toFixed(1)),
  row('Share in the language', (l) => `${Math.round(100 * mean(forLabel(l).flatMap((d) => d.visits.flatMap((v) => v.langShare))))}%`),
  row('Reply time', (l) => `${(mean(forLabel(l).flatMap((d) => d.visits.flatMap((v) => v.ms))) / 1000).toFixed(1)} s`),
];

const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c3-${STEP}-${new Date().toISOString().slice(0, 16).replace(':', '')}`);
writeFileSync(`${file}.json`, JSON.stringify(done, null, 1));
writeFileSync(`${file}.md`, [
  `# C3 ${STEP}: more facts in a here line, more different local things across visits?`, '', ...(stopped ? [`**${stopped}**`, ''] : []), ...summary, '',
  '## Every keyword hit', '', ...done.flatMap((d, k) => d.visits.flatMap((v, i) => v.hits.map((h) => `- ${d.label} · ${d.place} · set ${k + 1} visit ${i + 1} · **${h.item}**: ${h.text}`))), '',
  '## Every visit', '', ...done.flatMap((d, k) => d.visits.map((v, i) => `### ${d.label} · ${d.place} · set ${k + 1}, visit ${i + 1} · ${[...new Set(v.hits.map((h) => h.item))].join(', ') || 'nothing counted'}\n\n${v.transcript}\n`)),
].join('\n'));
console.log([stopped, ...summary].filter(Boolean).join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
