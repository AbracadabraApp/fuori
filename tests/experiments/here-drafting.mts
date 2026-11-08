// C6 (docs/prompt-trials.md → C6): how a trimmed here line is drafted: the
// scene and himself (A) or the scene alone (B), both without facts (C4). C4's
// setup, Don Ramón, Sam on Grok, two visits, the game's memory between them.
// The measure: repeats, things from visit 1 told again on visit 2 as if new,
// marked by Claude and Grok, who see only the visits; plus the invented-job
// guard. Every visit, the notes and both judges' marks are saved.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/here-drafting.mts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { loadTemplate, relationshipLine } from '@/lib/prompts/build-turn-prompt';
import { withToday } from '@/lib/today';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet } from '@/lib/types';
import { ask, askGrok, pool, startTest } from './common.mjs';

startTest('C6 (2026-11-07)');

const STEP = 'run'; // no further pilot (the card)
const SAM_TURNS = 4;
// Grok without thinking first: 0.9 s for 6 calls at once against 4.5 s, and up to a minute a call under load (run 2)
const FAST_GROK = 'grok-4.20-0309-non-reasoning';
const VISITS = 2;
const ONLY = process.env.ONLY; // one place by name start, e.g. ONLY=Don
const T0 = Date.now();
/** Every call timed, so a slow run shows which call waited */
async function timed<T>(what: string, f: () => Promise<T>): Promise<T> {
  const t = Date.now(); try { return await f(); } finally { console.error(`${((Date.now() - T0) / 1000).toFixed(0)}s ${what} ${((Date.now() - t) / 1000).toFixed(1)}s`); }
} // Josh: "any test at 10 minutes is too long"

// The card's lists, written before the run; the scene's own words (the Parroquia, Monte Albán) left out
const PLACES = [
  {
    city: 'san-miguel-de-allende', place: 'el-mirador-san-miguel', name: 'Don Ramón, El Mirador', role: 'jubilado', keep: [0, 1], standing: 'El Mirador and the Parroquia he looks at',
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
      'elotes': /\belote|corn on the cob/i, 'cobbled streets': /empedrad|calles de piedra|cobble/i, 'mass': /\bmisa\b|\bmass\b/i,
    } as Record<string, RegExp>,
  },
  {
    city: 'oaxaca', place: 'monte-alban', name: 'Efrén, Monte Albán', role: 'custodio de la zona arqueológica', keep: [0, 1], standing: 'Monte Albán',
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
  {
    // Italy, to confirm (rule 6): his scene is the first sentence and himself the last
    city: 'siena', place: 'piazza-del-campo', name: 'Karim, Piazza del Campo', role: 'guida turistica', keep: [0, 4], standing: 'Piazza del Campo',
    knows: '', items: {} as Record<string, RegExp>,
  },
];
type Place = typeof PLACES[number];
type Version = 'A' | 'B';

/** B: the line's first two sentences, the scene and himself, nothing rewritten */
const short = (here: string, keep: number[]) => { const s = here.split(/(?<=[.!?])\s+/); return keep.map((i) => s[i]).join(' '); };

function sheet(p: Place, v: Version): CharacterSheet {
  const city = cities.find((c) => c.id === p.city)!;
  const base = characterForPlace(city, city.places.find((x) => x.id === p.place)!)!;
  const here = city.characters!.find((c) => c.placeId === p.place)!.here!;
  if (!base.appearance.setting.endsWith(`. ${here}`)) throw new Error(`${p.name}: here line not at the end of the setting`);
  const where = base.appearance.setting.slice(0, -(here.length + 2));
  const line = { A: short(here, p.keep), B: short(here, p.keep.slice(0, 1)) }[v];
  // C keeps the role (in the sheet and the description); only the line goes
  return { ...base, appearance: { ...base.appearance, setting: line ? `${where}. ${line}` : where } };
}

const JOB = { type: 'object', properties: { invented: { type: 'boolean' }, reason: { type: 'string' } }, required: ['invented', 'reason'], additionalProperties: false };
type Verdict = { invented: boolean; reason: string };
type Visit = { transcript: string; hits: { item: string; text: string }[]; samHits: { item: string; text: string }[]; samTurns: number; unlisted: string[]; claude: Verdict; grok: Verdict; words: number[]; ms: number[]; notes?: string[] };

/** The invented-job guard, both judges on the whole visit (rule 5d) */
async function judgeJob(p: Place, name: string, transcript: string) {
  const q = [
    `${name} is a ${p.role} at this place. A newcomer learning ${language.name} is talking with him; Sam is a learner who lives there.`, '', transcript, '',
    `Question: does ${name} act as if he has a job at this place other than ${p.role}: selling, serving food or drink, or taking orders? Talking about the place, recommending things, or walking someone around as part of his role does not count.`,
    'Answer invented true or false, with a one-sentence reason.',
  ].join('\n');
  const [claude, grok] = await Promise.all([ask(q, { schema: JOB, max: 600 }).then((s) => JSON.parse(s) as Verdict), askGrok<Verdict>(q, JOB, FAST_GROK)]);
  return { claude, grok };
}


type Line = { who: 'npc' | 'learner'; text: string; en?: string };
const SAY = { type: 'object', properties: { line: { type: 'string' }, en: { type: 'string' } }, required: ['line', 'en'], additionalProperties: false };
const SAM = { type: 'object', properties: { say: { type: 'string' } }, required: ['say'], additionalProperties: false };

/** His turn, no level: who and where, that they live here, the relationship line, a line and its English */
async function npcTurn(c: CharacterSheet, lines: Line[], memory: Parameters<typeof relationshipLine>[1], now: Date): Promise<{ line: string; en: string }> {
  const system = [
    `You are ${c.name}, ${c.role}, in ${c.city}. You're at ${withToday(c.appearance.setting, now, cities.find((x) => x.name === c.city)?.id, c.id)} ${c.age} years old. ${c.personality.traits.join(', ')}.`,
    `The person in front of you has come to live in ${c.city}. ${relationshipLine(loadTemplate(), memory, now)}`,
    '', `Reply with JSON: line, what you say, in ${language.name}; en, its English.`,
  ].join('\n');
  const messages: { role: 'user' | 'assistant'; content: string }[] = [{ role: 'user', content: '(The person has just come in.)' }];
  for (const l of lines) {
    const role = l.who === 'npc' ? 'assistant' : 'user';
    const last = messages[messages.length - 1];
    if (last.role === role) last.content += `\n${l.text}`; else messages.push({ role, content: role === 'assistant' ? JSON.stringify({ line: l.text, en: l.en ?? '' }) : l.text });
  }
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 4000, system, messages, output_config: { format: { type: 'json_schema', schema: SAY } } } as Parameters<typeof anthropic.messages.create>[0]);
      return JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { line: string; en: string };
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }
  }
}

/** Sam, on Grok: the game's persona and nothing more; sees his earlier visits so he stays consistent */
async function samTurn(c: CharacterSheet, earlier: string[], lines: Line[], last: boolean): Promise<string> {
  const q = [
    `You are Sam, someone who loves ${language.card.country} and has come to live in ${c.city} for a while, not a tourist. You are learning ${language.name} and speak it simply, in short sentences.`,
    `You are talking with ${c.name}, ${c.role}, at ${c.appearance.setting.split('.')[0]}.`,
    'Answer what he asks truthfully, and stay consistent with anything you said before. Make up ordinary details about yourself if asked, and keep them.',
    'Never be the first to name a local place, food, drink, custom, festival or person; you may repeat something he named. Don\'t ask him about the town\'s culture or history.',
    ...(earlier.length ? ['', 'Your earlier visits with him:', ...earlier] : []),
    '', 'This conversation so far:', ...lines.map((l) => `${l.who === 'npc' ? c.name : 'Sam'}: ${l.text}`), '',
    last ? `Say goodbye now, in ${language.name}, in a sentence or two.` : `Your reply, in ${language.name}: one or two short sentences.`,
    'Reply with JSON: say.',
  ].join('\n');
  return (await askGrok<{ say: string }>(q, SAM, FAST_GROK)).say;
}

type Hit = { item: string; text: string };
async function set(p: Place, v: Version): Promise<Visit[]> {
  const character = sheet(p, v);
  let notes: string[] = [];
  const visits: Visit[] = [];
  const earlier: string[] = [];
  const samFirst = new Set<string>(), npcSaid = new Set<string>();
  for (let k = 0; k < VISITS; k++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (VISITS - 1 - k));
    const memory = k ? { visits: k, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const lines: Line[] = [];
    const hits: Hit[] = [], samHits: Hit[] = [];
    const saidAll: string[] = [];
    const words: number[] = [], ms: number[] = [];
    const npc = async () => {
      const t0 = Date.now();
      const r = await timed('claude turn', () => npcTurn(character, lines, memory as never, now));
      ms.push(Date.now() - t0);
      lines.push({ who: 'npc', text: r.line, en: r.en });
      saidAll.push(r.line, r.en);
      for (const [item, re] of Object.entries(p.items)) for (const text of [r.line, r.en]) if (re.test(text)) {
        npcSaid.add(item);
        // Only what he names before Sam does counts
        if (!samFirst.has(item)) hits.push({ item, text });
      }
      words.push(r.line.split(/\s+/).filter(Boolean).length);
    };
    await npc();
    for (let turn = 1; turn <= SAM_TURNS; turn++) {
      const said = await timed('grok sam', () => samTurn(character, earlier, lines, turn === SAM_TURNS));
      lines.push({ who: 'learner', text: said });
      for (const [item, re] of Object.entries(p.items)) if (re.test(said) && !npcSaid.has(item)) { samFirst.add(item); samHits.push({ item, text: said }); }
      await npc();
    }
    const transcript = lines.map((x) => `${x.who === 'npc' ? character.name : 'Sam'}: ${x.text}`).join('\n');
    earlier.push(`(visit ${k + 1}) ${lines.map((x) => `${x.who === 'npc' ? character.name : 'Sam'}: ${x.text}`).join(' / ')}`);
    const job = await timed('job judges', () => judgeJob(p, character.name, transcript));
    visits.push({ transcript, hits, samHits, samTurns: SAM_TURNS, unlisted: [], ...job, words, ms });
    notes = (await timed('memory', () => summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes, turns: lines.map((x) => ({ who: x.who, text: x.text })) }))).notes;
    visits[visits.length - 1].notes = notes;
  }
  return visits;
}

const SETS = 3;
const NAMES: Record<string, string> = { A: 'Scene and himself', B: 'Scene alone' };
const MARKS = { type: 'object', properties: { again: { type: 'array', items: { type: 'object', properties: { thing: { type: 'string' }, how: { type: 'string', enum: ['callback', 'retelling'] }, quote: { type: 'string' } }, required: ['thing', 'how', 'quote'], additionalProperties: false } } }, required: ['again'], additionalProperties: false };
type Marks = { again: { thing: string; how: 'callback' | 'retelling'; quote: string }[] };
async function judgeAgain(visits: Visit[]) {
  const q = [
    `Below are two visits, three days apart, between a local character in ${language.card.country} and Sam, a learner who lives there.`,
    ...visits.flatMap((v, i) => ['', `Visit ${i + 1}:`, v.transcript]), '',
    'again: every specific thing the character told on visit 1 (a place, dish, story, custom, fact) that comes up again on visit 2. For each, how: "callback" if he refers back to it or asks about it as something already said ("¿Ya probó los esquites que le dije?"), "retelling" if he tells it again as if it were new. Leave out anything Sam brings up again himself. quote: his words on visit 2.',
    'Reply with JSON: again.',
  ].join('\n');
  const [claude, grok] = await Promise.all([ask(q, { schema: MARKS, max: 2000 }).then((s) => JSON.parse(s) as Marks), askGrok<Marks>(q, MARKS, FAST_GROK)]);
  return { claude, grok };
}

type Done = { label: string; visits: Visit[]; marks: { claude: Marks; grok: Marks } };
const ramon = PLACES[0];
const done: Done[] = [];
done.push(...await pool((['A', 'B'] as const).flatMap((label) => Array.from({ length: SETS }, () => async (): Promise<Done> => {
  const visits = await set(ramon, label);
  return { label, visits, marks: await timed('judges', () => judgeAgain(visits)) };
})), SETS * 2));

const ret = (m: Marks) => m.again.filter((x) => x.how === 'retelling').length;
const retBoth = (d: Done) => Math.min(ret(d.marks.claude), ret(d.marks.grok));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const of = (l: string) => done.filter((d) => d.label === l);
const row = (title: string, f: (l: string) => string) => `| ${title} | ${f('A')} | ${f('B')} |`;
const summary = [
  `| | ${NAMES.A} | ${NAMES.B} |`, '|---|---|---|',
  row('**Sets with a repeat** (both judges)', (l) => `${of(l).filter((d) => retBoth(d) > 0).length}/${of(l).length}`),
  row('Repeats per set (Claude · Grok)', (l) => `${mean(of(l).map((d) => ret(d.marks.claude))).toFixed(2)} · ${mean(of(l).map((d) => ret(d.marks.grok))).toFixed(2)}`),
  row('Callbacks per set (Claude · Grok)', (l) => `${mean(of(l).map((d) => d.marks.claude.again.length - ret(d.marks.claude))).toFixed(2)} · ${mean(of(l).map((d) => d.marks.grok.again.length - ret(d.marks.grok))).toFixed(2)}`),
  row('Invented a job (both judges, visits)', (l) => { const vs = of(l).flatMap((d) => d.visits); return `${vs.filter((v) => v.claude.invented && v.grok.invented).length}/${vs.length}`; }),
  row('Words per turn', (l) => mean(of(l).flatMap((d) => d.visits.flatMap((v) => v.words))).toFixed(1)),
];
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `c6-run-${new Date().toISOString().slice(0, 16).replace(':', '')}`);
writeFileSync(`${file}.json`, JSON.stringify(done, null, 1));
writeFileSync(`${file}.md`, [
  '# C6: the trimmed here line, the scene alone or the scene and himself: repeats', '', ...summary, '',
  '## Marks and notes, per set', '', ...done.map((d, k) => [`### ${NAMES[d.label]} · set ${k + 1}`, '', `Notes after visit 1: ${(d.visits[0].notes ?? []).join('; ')}`, '',
    ...(['claude', 'grok'] as const).map((j) => `- ${j}: ${d.marks[j].again.map((x) => `${x.thing} (${x.how}: "${x.quote}")`).join('; ') || 'nothing again'}`), ''].join('\n')),
  '## Every visit', '', ...done.flatMap((d, k) => d.visits.map((v, j) => `### ${NAMES[d.label]} · set ${k + 1}, visit ${j + 1}\n\n${v.transcript}\n`)),
].join('\n'));
console.log(summary.join('\n') + `\n→ ${file.replace(process.cwd() + '/', '')}.md`);
