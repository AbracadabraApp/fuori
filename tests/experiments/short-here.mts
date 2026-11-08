// C4 (docs/prompt-trials.md → C4): does a short here line (the scene and
// himself) spread local talk over visits instead of unloading it on the first?
// A: the line as written; B: its first two sentences (run twice, the noise
// check); C: no line, the place's name only; D: B plus one sentence saying he
// knows his town. On the floor prompt, Mexico for direction (rule 6), C3's
// harness: three visits a set, memory written between them by the game's own
// summariser, the learner's lines fixed. Counted in code from the card's lists,
// only in his english, word and question parts and their English. Every visit,
// every hit, the local things no list caught and the invented-job verdicts are saved.
//   COUNTRY=es-mx STEP=pilot|run npx tsx --env-file=.env.local tests/experiments/short-here.mts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn, type Part } from '@/lib/beginner';
import { STAGES } from '@/lib/path';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, askGrok, pool, startTest } from './common.mjs';
import { useFloor } from './floor-prompt.mjs';

startTest('C4 (2026-11-07)');

const STEP = process.env.STEP ?? 'pilot';
// Lines that answer almost any question, so nothing is asked again only because it went unanswered (C3)
const LEARNER = ['¡Buenas tardes! Soy Sam. ¿Cómo está?', 'Mmm, no sé. ¿Usted qué me recomienda?', '¡Qué interesante! Cuénteme más.', 'Gracias. ¡Hasta luego!'];

// The card's lists, written before the run; the scene's own words (the Parroquia, Monte Albán) left out
const PLACES = [
  {
    city: 'san-miguel-de-allende', place: 'el-mirador-san-miguel', name: 'Don Ramón, El Mirador', role: 'jubilado',
    knows: 'You have lived in San Miguel de Allende all your life and know it well.',
    items: {
      R1: /nac[ií] aqu[ií]|born here|pueblo tranquilo|quiet town/i, R2: /zeferino|neog[óo]tic|alba[ñn]il|mason/i,
      R3: /ignacio allende|allende naci|naci[óo] allende|independencia|independence/i, R4: /artist|\bguerra\b|\bwar\b/i, R5: /unesco|patrimonio|2008/i,
      'Jardín': /jard[ií]n principal|jard[ií]n allende|\bel jard[ií]n\b|\bthe jard[ií]n\b/i, 'Instituto Allende': /instituto allende/i, 'Bellas Artes': /bellas artes/i,
      'La Aurora': /la aurora|f[áa]brica/i, 'Charco del Ingenio': /charco del ingenio/i, 'Atotonilco': /atotonilco/i, 'callejoneada': /callejoneada/i,
      'Alborada': /alborada/i, 'Los Locos': /los locos/i, 'Día de Muertos': /d[ií]a de (los )?muertos|day of the dead/i, 'Semana Santa': /semana santa|holy week/i,
      'mariachis': /mariachi/i, 'enchiladas mineras': /enchiladas mineras/i, 'Parque Juárez': /parque ju[áa]rez/i, 'El Chorro': /el chorro/i,
      'Calle Aldama': /aldama/i, 'Ignacio Ramírez market': /ignacio ram[ií]rez|mercado de artesan/i, 'San Francisco': /san francisco/i,
      'Oratorio': /oratorio/i, 'Dolores Hidalgo': /dolores hidalgo|\bdolores\b/i, 'Cañada de la Virgen': /ca[ñn]ada de la virgen/i,
    } as Record<string, RegExp>,
  },
  {
    city: 'oaxaca', place: 'monte-alban', name: 'Efrén, Monte Albán', role: 'custodio de la zona arqueológica',
    knows: 'You know Oaxaca and its valley well.',
    items: {
      E1: /hablo zapoteco|en zapoteco|mi pueblo|my village/i, E2: /gran plaza/i, E3: /juego de pelota|ball ?court/i, E4: /danzante/i, E5: /unesco|patrimonio/i,
      'Tomb 7': /tumba|\btomb\b/i, 'Edificio J': /edificio j|building j|observator/i, 'Alfonso Caso': /alfonso caso|\bcaso\b/i, 'Santo Domingo': /santo domingo/i,
      'mezcal': /mezcal/i, 'tlayuda': /tlayuda/i, 'mole': /\bmole\b/i, 'chapulines': /chapul[ií]n/i, 'Mitla': /mitla/i, 'Hierve el Agua': /hierve el agua/i,
      'Guelaguetza': /guelaguetza/i, 'Día de Muertos': /d[ií]a de (los )?muertos|day of the dead/i, 'Noche de Rábanos': /r[áa]bano|radish/i, 'Zócalo': /z[óo]calo/i,
      'calendas': /calenda/i, 'Teotitlán': /teotitl[áa]n/i, 'alebrijes': /alebrije/i, 'barro negro': /barro negro|black pottery/i, 'Tule tree': /\btule\b/i,
      'chocolate': /chocolate/i, 'tejate': /tejate/i, 'quesillo': /quesillo/i, '20 de Noviembre market': /20 de noviembre|veinte de noviembre/i,
      'Benito Juárez': /benito ju[áa]rez/i, 'Mixtec': /mixtec|mixteco/i,
    } as Record<string, RegExp>,
  },
];
type Place = typeof PLACES[number];
type Version = 'A' | 'B' | 'C' | 'D';

/** B: the line's first two sentences, the scene and himself, nothing rewritten */
const short = (here: string) => here.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

function sheet(p: Place, v: Version): CharacterSheet {
  const city = cities.find((c) => c.id === p.city)!;
  const base = characterForPlace(city, city.places.find((x) => x.id === p.place)!)!;
  const here = city.characters!.find((c) => c.placeId === p.place)!.here!;
  if (!base.appearance.setting.endsWith(`. ${here}`)) throw new Error(`${p.name}: here line not at the end of the setting`);
  const where = base.appearance.setting.slice(0, -(here.length + 2));
  const line = { A: here, B: short(here), C: '', D: `${short(here)} ${p.knows}` }[v];
  // C keeps the role (in the sheet and the description); only the line goes
  return { ...base, appearance: { ...base.appearance, setting: line ? `${where}. ${line}` : where } };
}

const JOB = { type: 'object', properties: { invented: { type: 'boolean' }, reason: { type: 'string' } }, required: ['invented', 'reason'], additionalProperties: false };
const LOCAL = { type: 'object', properties: { things: { type: 'array', items: { type: 'string' } } }, required: ['things'], additionalProperties: false };
type Verdict = { invented: boolean; reason: string };
type Visit = { transcript: string; hits: { item: string; text: string }[]; unlisted: string[]; claude: Verdict; grok: Verdict; words: number[]; langShare: number[]; ms: number[] };

/** The invented-job guard, both judges on the whole visit (rule 5d) */
async function judgeJob(p: Place, name: string, transcript: string) {
  const q = [
    `${name} is a ${p.role} at this place. A newcomer learning Spanish is talking with him; the learner's lines are fixed and the same every visit.`, '', transcript, '',
    `Question: does ${name} act as if he has a job at this place other than ${p.role}: selling, serving food or drink, or taking orders? Talking about the place, recommending things, or walking someone around as part of his role does not count.`,
    'Answer invented true or false, with a one-sentence reason.',
  ].join('\n');
  const [claude, grok] = await Promise.all([ask(q, { schema: JOB, max: 600 }).then((s) => JSON.parse(s) as Verdict), askGrok<Verdict>(q, JOB)]);
  return { claude, grok };
}

/** The local things he names, for the unlisted section: what no pattern caught is read, not counted */
async function localThings(said: string): Promise<string[]> {
  const q = `Below is what a character in Mexico said. List each specific local thing he names: a place, building, street, dish, drink, craft, custom, festival, historical person or event. Short names only, in the words he used. Empty if none.\n\n${said}`;
  return (JSON.parse(await ask(q, { schema: LOCAL, max: 800 })) as { things: string[] }).things;
}

async function set(p: Place, v: Version): Promise<Visit[]> {
  const character = sheet(p, v);
  let notes: string[] = [];
  const visits: Visit[] = [];
  for (let k = 0; k < 3; k++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (2 - k));
    const memory = k ? { visits: k, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const t: Turn[] = [];
    const hits: Visit['hits'] = [];
    const saidAll: string[] = [];
    const words: number[] = [], langShare: number[] = [], ms: number[] = [];
    const turn = async (learnerSaid?: string) => {
      const t0 = Date.now();
      const r = await runBeginnerTurn({ character, transcript: [...t], learnerSaid, memory: memory as never, now, maxAnswers: STAGES.S2.answers, withDone: true });
      ms.push(Date.now() - t0);
      if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
      // Only what he says, and its English: never the answers offered
      const said = r.parts.filter((x: Part) => x.kind !== 'answer');
      for (const x of said) {
        saidAll.push(x.text, x.en ?? '');
        for (const [item, re] of Object.entries(p.items)) for (const text of [x.text, x.en]) if (text && re.test(text)) hits.push({ item, text });
      }
      const lang = said.filter((x) => x.kind !== 'english').reduce((a, x) => a + x.text.split(/\s+/).filter(Boolean).length, 0);
      const en = said.filter((x) => x.kind === 'english').reduce((a, x) => a + x.text.split(/\s+/).filter(Boolean).length, 0);
      words.push(r.line.split(/\s+/).filter(Boolean).length);
      langShare.push(lang / Math.max(1, lang + en));
      return r;
    };
    let r = await turn();
    for (const said of LEARNER) {
      if (r.done) break;
      r = await turn(said);
    }
    const transcript = t.map((x) => `${x.who === 'npc' ? character.name : 'Learner'}: ${x.transcript}`).join('\n');
    const [job, things] = await Promise.all([judgeJob(p, character.name, transcript), localThings(saidAll.filter(Boolean).join('\n'))]);
    const unlisted = things.filter((th) => !Object.values(p.items).some((re) => re.test(th)) && !/parroquia|monte alb[áa]n|mirador/i.test(th));
    visits.push({ transcript, hits, unlisted, ...job, words, langShare, ms });
    notes = (await summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
  }
  return visits;
}

const labels: { label: string; version: Version }[] = STEP === 'pilot'
  ? [{ label: 'A', version: 'A' }, { label: 'B', version: 'B' }, { label: 'C', version: 'C' }, { label: 'D', version: 'D' }]
  : [{ label: 'A', version: 'A' }, { label: 'B1', version: 'B' }, { label: 'B2', version: 'B' }, { label: 'C', version: 'C' }, { label: 'D', version: 'D' }];
const places = STEP === 'pilot' ? PLACES.slice(0, 1) : PLACES;
// Real run in two waves, so it can stop early: 2 sets each, then 1 more (the card's stop rule)
const waves = STEP === 'pilot' ? [1] : [2, 1];

type Done = { place: string; label: string; visits: Visit[] };
const done: Done[] = [];
const itemsOn = (v: Visit) => new Set(v.hits.map((h) => h.item));
const firstVisit = (d: Done) => itemsOn(d.visits[0]).size;
const newLater = (d: Done) => { const seen = new Set(itemsOn(d.visits[0])); let n = 0; for (const v of d.visits.slice(1)) for (const i of itemsOn(v)) if (!seen.has(i)) { n++; seen.add(i); } return n; };
const toldAgain = (d: Done) => [...new Set(d.visits.flatMap((v) => [...itemsOn(v)]))].filter((i) => d.visits.filter((v) => itemsOn(v).has(i)).length >= 2);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const of = (label: string, place?: string) => done.filter((d) => d.label === label && (!place || d.place === place));
const m = (label: string, f: (d: Done) => number, place?: string) => mean(of(label, place).map(f));

useFloor(true);
let stopped = '';
for (const [w, n] of waves.entries()) {
  const jobs = places.flatMap((p) => labels.flatMap(({ label, version }) => Array.from({ length: n }, () => async () => ({ place: p.name, label, visits: await set(p, version) }))));
  done.push(...await pool(jobs, 6));
  if (STEP !== 'pilot' && w === 0 && ['B1', 'B2', 'C', 'D'].every((l) => m(l, newLater) < 0.5)) { stopped = 'Stopped after the first wave: both B runs, C and D all under 0.5 on new later'; break; }
}
useFloor(false);

const row = (title: string, f: (label: string) => string) => `| ${title} | ${labels.map(({ label }) => f(label)).join(' | ')} |`;
const NAMES: Record<string, string> = { A: "Today's line", B: 'Short', B1: 'Short (1)', B2: 'Short (2)', C: 'No line', D: 'Short + knows town' };
const jobCount = (label: string) => { const vs = of(label).flatMap((d) => d.visits); return `${vs.filter((v) => v.claude.invented && v.grok.invented).length}/${vs.length} (${vs.filter((v) => v.claude.invented !== v.grok.invented).length} split)`; };
const summary = [
  `| | ${labels.map(({ label }) => NAMES[label]).join(' | ')} |`, `|---|${labels.map(() => '---').join('|')}|`,
  row('**New later** (per set)', (l) => m(l, newLater).toFixed(2)),
  ...places.map((p) => row(`  ${p.name}`, (l) => m(l, newLater, p.name).toFixed(2))),
  row('First visit', (l) => m(l, firstVisit).toFixed(2)),
  row('Told again (read: callback or retelling)', (l) => m(l, (d) => toldAgain(d).length).toFixed(2)),
  row('Unlisted local things per set (read)', (l) => m(l, (d) => d.visits.reduce((a, v) => a + v.unlisted.length, 0)).toFixed(2)),
  row('Invented a job (both judges)', jobCount),
  row('Sets', (l) => `${of(l).length}`),
  row('Words per turn', (l) => mean(of(l).flatMap((d) => d.visits.flatMap((v) => v.words))).toFixed(1)),
  row('Share in the language', (l) => `${Math.round(100 * mean(of(l).flatMap((d) => d.visits.flatMap((v) => v.langShare))))}%`),
  row('Reply time', (l) => `${(mean(of(l).flatMap((d) => d.visits.flatMap((v) => v.ms))) / 1000).toFixed(1)} s`),
];

const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c4-${STEP}-${new Date().toISOString().slice(0, 16).replace(':', '')}`);
writeFileSync(`${file}.json`, JSON.stringify(done, null, 1));
writeFileSync(`${file}.md`, [
  `# C4 ${STEP}: a short here line, local talk spread over visits?`, '', ...(stopped ? [`**${stopped}**`, ''] : []), ...summary, '',
  '## Told again (mark each: callback or retelling)', '', ...done.flatMap((d, k) => toldAgain(d).map((i) => `- ${NAMES[d.label]} · ${d.place} · set ${k + 1} · **${i}**: ${d.visits.map((v, j) => (itemsOn(v).has(i) ? `visit ${j + 1}: ${v.hits.find((h) => h.item === i)!.text}` : '')).filter(Boolean).join(' / ')}`)), '',
  '## Local things no list caught', '', ...done.flatMap((d, k) => d.visits.flatMap((v, j) => (v.unlisted.length ? [`- ${NAMES[d.label]} · ${d.place} · set ${k + 1} visit ${j + 1}: ${v.unlisted.join(', ')}`] : []))), '',
  '## Invented-job verdicts that split or said yes', '', ...done.flatMap((d, k) => d.visits.flatMap((v, j) => (v.claude.invented || v.grok.invented ? [`- ${NAMES[d.label]} · ${d.place} · set ${k + 1} visit ${j + 1}: Claude ${v.claude.invented ? 'yes' : 'no'} (${v.claude.reason}) · Grok ${v.grok.invented ? 'yes' : 'no'} (${v.grok.reason})`] : []))), '',
  '## Every visit', '', ...done.flatMap((d, k) => d.visits.map((v, j) => `### ${NAMES[d.label]} · ${d.place} · set ${k + 1}, visit ${j + 1} · ${[...itemsOn(v)].join(', ') || 'nothing counted'}\n\n${v.transcript}\n`)),
].join('\n'));
console.log([stopped, ...summary].filter(Boolean).join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
