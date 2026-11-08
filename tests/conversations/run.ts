/**
 * The conversation test: simulated conversations with characters the game
 * shows, through the game's own turn code, measured by counts.
 *
 *   npm run test:conversations                         # 6 characters, one per city, one conversation each
 *   npm run test:conversations -- --count=10 --seed=7  # same sample every time
 *   npm run test:conversations -- --visits=3           # return visits, the game's memory written between them
 *   npm run test:conversations -- --turns=4            # learner turns per visit
 *   npm run test:conversations -- --learner=grok       # who plays the learner: claude (default), grok, or tap (taps a reply button)
 *   npm run test:conversations -- --variant=tests/conversations/variants/<name>.json   # A (as is) against B (the variant)
 *   npm run test:conversations -- --null=3             # also run A twice for 3 characters: how much the numbers move on their own
 *   npm run test:conversations -- --pick=variant       # the characters the variant names (or first2: the first 2 in each city)
 *   npm run test:conversations -- --card="C11 (2026-11-08)"   # a test run: refuses without the reviewed card
 *   npm run test:conversations -- --no-culture --no-audit --dry
 *   npm run test:conversations -- --level="Beginner: shape"   # experimental level block (content/<country>/prompts/levels.md)
 *
 * Josh, 2026-11-08: counts, not grades ("Prefer clear output measures over
 * judgement"); every run measures everything and keeps every transcript
 * (record.ts); Claude plays the learner by default, with Grok as a switch ("1
 * is a choice"); Grok reads every transcript afterwards and says whether they
 * bear out the numbers ("best as a check ... than inline tester").
 *
 * Measures (measure.ts): words and questions per character line, the learner's
 * share of words, sentences repeated from an earlier visit, and one reader's
 * count of real things about the country learned.
 *
 * A variant file: { "name": "...", "here": { "<character name>": "<line>" },
 * "system": [{ "find": "<text in the rendered prompt>", "replace": "<text>" }] }.
 * B is A with those swaps; nothing on disk changes.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runTurn } from '@/lib/turn';
import { writeReplies } from '@/lib/replies';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { withDialogueRules } from '@/lib/dialogue/rules';
import { summarizeWithClaude } from '@/lib/remember';
import { characterForPlace } from '@/lib/characters/for-place';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { cities, language, country } from '@/content';
import type { CharacterSheet, Place, Turn } from '@/lib/types';
import { learners, type Learner } from './learners';
import { measure, cultureCount, COLUMNS, type Measures, type Visits, type Line } from './measure';
import { startRun, record, versions, type Recorded } from './record';
import { askGrok, startTest } from '../experiments/common.mjs';

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const has = (name: string) => process.argv.includes(`--${name}`);
const COUNT = Number(flag('count') ?? 6);
const TURNS = Number(flag('turns') ?? 6);
const VISITS = Number(flag('visits') ?? 1);
const NULLS = Number(flag('null') ?? 0);
const SEED = flag('seed');
const LEARNER = (flag('learner') ?? 'claude') as 'claude' | 'grok' | 'tap';
const VARIANT = flag('variant');
const PICK = flag('pick') ?? (VARIANT ? 'variant' : 'random');
const CARD = flag('card');
const LABEL = flag('label') ?? (VARIANT ? VARIANT.split('/').pop()!.replace(/\.json$/, '') : 'run');
const LEVEL = flag('level');
const LEVEL_AT = flag('level-at') as 'system' | 'last' | undefined;
const DRY = has('dry');
const CULTURE = !has('no-culture');
const AUDIT = !has('no-audit') && !!process.env.XAI_API_KEY;
const GROK = 'grok-4.20-0309-non-reasoning'; // fast; grok-4.7 took up to a minute a call under load (C4)
const T0 = Date.now();

if (CARD) startTest(CARD);
if (!['claude', 'grok', 'tap'].includes(LEARNER)) throw new Error(`--learner is claude, grok or tap, not ${LEARNER}`);

type Variant = { name: string; here?: Record<string, string>; system?: { find: string; replace: string }[] };
const variant: Variant | undefined = VARIANT ? JSON.parse(readFileSync(VARIANT, 'utf8')) : undefined;
if (variant?.system?.length && LEVEL) throw new Error('--level and a variant with system edits can\'t run together (a replaced prompt gets no level block)');

// Seeded random numbers, so --seed gives the same sample on every run
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const random = SEED !== undefined ? seeded(Number(SEED) || 0) : Math.random;
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------- Sample ----------

interface Case { character: CharacterSheet; place: Place; city: (typeof cities)[number]; here?: string; learner: Learner }

function pickSample(): Case[] {
  // Only people the game shows, each the person their place names
  const all = cities.filter((city) => !city.hidden).flatMap((city) =>
    city.places.filter((place) => !place.hidden).flatMap((place) => {
      const character = characterForPlace(city, place);
      const here = city.characters?.find((p) => p.id === place.characterId)?.here;
      return character ? [{ place, city, character, here }] : [];
    }));
  let picked: typeof all;
  if (PICK === 'variant') {
    const names = Object.keys(variant?.here ?? {});
    if (!names.length) throw new Error('--pick=variant needs a variant with here lines');
    picked = names.map((n) => { const x = all.find((y) => y.character.name === n); if (!x) throw new Error(`${n}: not shown in ${country}`); return x; }).slice(0, flag('count') ? COUNT : undefined);
  } else if (PICK === 'first2') {
    const per = new Map<string, number>();
    picked = all.filter((x) => x.here && (per.set(x.city.id, (per.get(x.city.id) ?? 0) + 1).get(x.city.id)! <= 2)).slice(0, COUNT);
  } else {
    // One per city, so the sample spreads across the country
    const seen = new Set<string>();
    picked = shuffle(all).filter((x) => !seen.has(x.city.id) && !!seen.add(x.city.id)).slice(0, COUNT);
  }
  return picked.map((x, i) => ({ ...x, learner: learners[i % learners.length] }));
}

// ---------- Versions ----------

/** B: the same character with the variant's here line, if it names one */
function sheetFor(c: Case, version: string): CharacterSheet {
  const line = version === 'B' ? variant?.here?.[c.character.name] : undefined;
  if (!line) return c.character;
  if (!c.here || !c.character.appearance.setting.endsWith(c.here)) throw new Error(`${c.character.name}: here line not at the end of the setting`);
  return { ...c.character, appearance: { ...c.character.appearance, setting: c.character.appearance.setting.slice(0, -c.here.length) + line } };
}

type Memory = { visits: number; lastVisit: string; notes: string[] } | undefined;
/** B: the game's own prompt for this turn with the variant's text swaps (the turn code adds the shared rules again, so its copy comes off) */
function systemFor(version: string, c: CharacterSheet, transcript: Turn[], memory: Memory, now: Date): string | undefined {
  if (version !== 'B' || !variant?.system?.length) return undefined;
  let full = (buildTurnPrompt({ character: c, transcript, memory: memory as never, now } as never) as { system: string }).system;
  const rules = withDialogueRules('');
  if (!full.endsWith(rules)) throw new Error('rules block not at the end of the prompt');
  full = full.slice(0, -rules.length);
  for (const e of variant.system) {
    // An edit on a line that only exists on return visits (the notes) is skipped on a first meeting
    if (full.includes(e.find)) full = full.replace(e.find, e.replace);
    else if (memory) throw new Error(`variant text not found in the prompt: "${e.find}"`);
  }
  return full;
}

// ---------- The learner ----------

const say = (t: Turn[], name: string) => t.map((x) => `${x.who === 'npc' ? name : 'Learner'}: ${x.transcript}`).join('\n');
const SAY = { type: 'object', properties: { say: { type: 'string' } }, required: ['say'], additionalProperties: false };

async function learnerLine(c: Case, earlier: string[], t: Turn[], last: boolean): Promise<string> {
  if (LEARNER === 'tap') return (await writeReplies(c.character, t)).replies[Math.floor(random() * 2)].line;
  const help = country === 'es-mx'
    ? '"Perdón, no entiendo", "¿Cómo?", "Más despacio, por favor", "¿Repite?", or in English'
    : '"Scusi, non capisco", "Come?", "Più piano, per favore", "Ripeti?", or in English';
  const q = [
    `You are role-playing a ${language.name} learner in a test: someone living in ${language.card.country} for a while, not a tourist. ${c.learner.description}`,
    `You are at ${c.place.name} in ${c.city.name}, talking to ${c.character.name} (${c.character.role}).`,
    'Answer what they just asked, truthfully and in a way someone at your level could; make up ordinary details about yourself if needed, and keep them across visits.',
    'Never be the first to name a local place, food, drink, custom, festival or person; you may repeat one they named. Don\'t steer to topics of your own.',
    `Be honest about comprehension: understand only what someone at your level really would. If their last line was too fast, long or complex, say so the way a real learner would (${help}).`,
    'Don\'t repeat your own earlier lines or greetings.',
    ...(earlier.length ? ['', 'Your earlier visits with them:', ...earlier] : []),
    '', 'This conversation so far:', say(t, c.character.name), '',
    last ? 'Answer what they asked if they asked something, then say goodbye, in a few words.' : 'What you say next: a few words, often less than a full sentence, the way real learners talk (they average about six words a line); as speech-to-text would capture it. No quotes, no stage directions.',
    'Reply with JSON: say.',
  ].join('\n');
  if (LEARNER === 'grok') return (await askGrok<{ say: string }>(q, SAY, GROK)).say;
  const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 2000, messages: [{ role: 'user', content: q }], output_config: { format: { type: 'json_schema', schema: SAY } } } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { say: string }).say;
}

// ---------- One conversation ----------

async function conversation(c: Case, version: string): Promise<Visits> {
  const him = sheetFor(c, version);
  let notes: string[] = [];
  const earlier: string[] = [];
  const visits: Visits = [];
  for (let k = 0; k < VISITS; k++) {
    // Visits 3 days apart, the last one today
    const now = new Date(Date.now() - 86_400_000 * 3 * (VISITS - 1 - k));
    const memory: Memory = k ? { visits: k, lastVisit: new Date(now.getTime() - 3 * 86_400_000).toISOString(), notes } : undefined;
    const t: Turn[] = [];
    const npc = async (learnerSaid?: string) => {
      const system = systemFor(version, him, t, memory, now);
      const r = await runTurn({ character: him, transcript: [...t], learnerSaid, memory: memory as never, now, level: LEVEL, levelAt: LEVEL_AT, ...(system ? { system } : {}) });
      if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
    };
    await npc();
    for (let i = 0; i < TURNS; i++) await npc(await learnerLine(c, earlier, t, i === TURNS - 1 && VISITS > 1));
    visits.push(t.map((x): Line => ({ who: x.who, text: x.transcript })));
    earlier.push(`(visit ${k + 1}) ${say(t, him.name).replace(/\n/g, ' / ')}`);
    if (k < VISITS - 1) notes = (await summarizeWithClaude({ character: { name: him.name, age: him.age, role: him.role, city: him.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
  }
  return visits;
}

// ---------- Grok's read-through ----------

const AUDITED = { type: 'object', properties: { agrees: { type: 'boolean' }, note: { type: 'string' } }, required: ['agrees', 'note'], additionalProperties: false };
const fmt = (m: Measures) => COLUMNS.filter(([k]) => m[k] !== undefined).map(([k, l]) => `${l} ${m[k]}`).join(', ');
const showVisits = (v: Visits, name: string) => v.map((x, i) => `Visit ${i + 1}:\n${x.map((l) => `${l.who === 'npc' ? name : 'Learner'}: ${l.text}`).join('\n')}`).join('\n\n');

async function audit(name: string, runs: { version: string; visits: Visits; measures: Measures }[]) {
  const q = [
    `Below are simulated conversations with ${name}, a character in a ${language.name}-learning game, each with the numbers counted from it. Each version is a separate run from scratch, not a continuation: A is the game as it is, B the same with one change, and "A again" a second run of A, there to show how much the numbers move by chance. Within a version, the visits are the same learner coming back. Repeats are sentences the character said again from an earlier visit of the same version; Culture is how many real things about ${language.card.country} a reader listed.`,
    ...runs.flatMap((r) => ['', `Version ${r.version === 'A2' ? 'A again' : r.version} (${fmt(r.measures)}):`, showVisits(r.visits, name)]),
    '', 'Read every line. Do the conversations bear out the numbers, and any difference between versions? Say what the numbers miss or get wrong: a replay they didn\'t count, a learner who sounds nothing like a real learner, an invented job, anything a newcomer would notice.',
    'Reply with JSON: agrees (true if the numbers are a fair account), note (two sentences).',
  ].join('\n');
  return askGrok<{ agrees: boolean; note: string }>(q, AUDITED, GROK);
}

// ---------- Main ----------

async function main() {
  const sample = pickSample();
  const plan = sample.flatMap((c, i) => [{ c, version: 'A' }, ...(variant ? [{ c, version: 'B' }] : []), ...(i < NULLS ? [{ c, version: 'A2' }] : [])]);
  console.log(`${country} · character prompt ${versions().character} · learner ${LEARNER} · ${VISITS} visit(s) × ${TURNS} turns${variant ? ` · B: ${variant.name}` : ''}${NULLS ? ` · A twice for ${NULLS}` : ''}${SEED !== undefined ? ` · seed ${SEED}` : ''}`);
  sample.forEach((c) => console.log(`  ${c.character.name}, ${c.character.role}, ${c.place.name}, ${c.city.name} · ${c.learner.id}`));
  if (DRY) {
    console.log(`\nDry run: ${plan.length} conversations, about ${plan.length * VISITS * (TURNS * 2 + 2)} calls.`);
    return;
  }

  const run = startRun(LABEL);
  const at = new Date().toISOString();
  const done = new Map<string, Recorded[]>();
  const queue = [...plan];
  let n = 0;
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const { c, version } = job;
      try {
        const visits = await conversation(c, version);
        const measures = measure(visits);
        if (CULTURE) { measures.cultureList = await cultureCount(visits, c.character.name); measures.culture = measures.cultureList.length; }
        const r: Recorded = {
          run: run.id, at, label: LABEL, card: CARD, versions: versions(), version,
          character: { id: c.character.id, name: c.character.name, role: c.character.role, city: c.city.name, place: c.place.name },
          learner: { type: c.learner.id, model: LEARNER === 'grok' ? GROK : LEARNER === 'tap' ? 'tap' : CLAUDE_MODEL },
          change: version === 'B' ? JSON.stringify({ here: variant?.here?.[c.character.name], system: variant?.system }) : undefined,
          visits, measures,
        };
        record(run.dir, ++n, r);
        done.set(c.character.name, [...(done.get(c.character.name) ?? []), r]);
        console.log(`  ✓ ${c.character.name} ${version}: ${fmt(measures)}  (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
      } catch (e) {
        console.log(`  ✗ ${c.character.name} ${version}: ${e instanceof Error ? e.message : e}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const audits = new Map<string, { agrees: boolean; note: string }>();
  if (AUDIT) await Promise.all([...done].map(async ([name, rs]) => {
    try { audits.set(name, await audit(name, rs.sort((a, b) => a.version.localeCompare(b.version)))); } catch (e) { console.log(`  ✗ audit ${name}: ${e instanceof Error ? e.message : e}`); }
  }));

  // ---------- Report ----------
  const rows = [...done.values()].flat();
  const of = (v: string) => rows.filter((r) => r.version === v);
  const avg = (rs: Recorded[], k: keyof Measures) => { const xs = rs.map((r) => r.measures[k]).filter((x): x is number => typeof x === 'number'); return xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2) : '–'; };
  /** How far the numbers move with nothing changed: the average gap between A and its copy */
  const noise = (k: keyof Measures) => {
    const gaps = of('A2').map((r2) => { const r1 = of('A').find((r) => r.character.id === r2.character.id); const a = r1?.measures[k], b = r2.measures[k]; return typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) : undefined; }).filter((x): x is number => x !== undefined);
    return gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(2) : '–';
  };
  const cols = COLUMNS.filter(([k]) => k !== 'culture' || CULTURE);
  const versionsSeen = ['A', 'B', 'A2'].filter((v) => of(v).length);
  const summary = [
    `| | ${cols.map(([, l]) => l).join(' | ')} |`, `|---|${cols.map(() => '---').join('|')}|`,
    ...versionsSeen.map((v) => `| ${v === 'A' ? 'A (as is)' : v === 'B' ? `B (${variant?.name})` : 'A again'} (${of(v).length}) | ${cols.map(([k]) => avg(of(v), k)).join(' | ')} |`),
    ...(of('A2').length ? [`| Noise: A against A again | ${cols.map(([k]) => noise(k)).join(' | ')} |`] : []),
  ];
  const disagree = [...audits].filter(([, a]) => !a.agrees);
  const md = [
    `# Conversation test: ${LABEL}`, '',
    `${at.slice(0, 16).replace('T', ' ')} UTC · ${Object.entries(versions()).map(([k, v]) => `${k} ${v}`).join(' · ')} · learner ${LEARNER} · ${VISITS} visit(s) × ${TURNS} turns${CARD ? ` · card ${CARD}` : ''}`, '',
    ...summary, '',
    AUDIT ? `Grok's read-through: ${audits.size - disagree.length} of ${audits.size} characters bear out the numbers${disagree.length ? `; not: ${disagree.map(([n]) => n).join(', ')}` : ''}.` : 'Grok\'s read-through: not run.', '',
    '## By character', '',
    `| Character | Version | ${cols.map(([, l]) => l).join(' | ')} |`, `|---|---|${cols.map(() => '---').join('|')}|`,
    ...rows.sort((a, b) => a.character.name.localeCompare(b.character.name) || a.version.localeCompare(b.version)).map((r) => `| ${r.character.name} | ${r.version} | ${cols.map(([k]) => r.measures[k] ?? '–').join(' | ')} |`), '',
    ...(AUDIT ? ['## Grok\'s read-through', '', ...[...audits].map(([name, a]) => `- **${name}** (${a.agrees ? 'bears out' : 'doesn\'t bear out'}): ${a.note}`), ''] : []),
    '## Transcripts', '', `Each conversation is saved whole in \`${run.dir.replace(process.cwd() + '/', '')}/\`, with its versions, measures, repeated sentences and culture list.`,
  ].join('\n');
  writeFileSync(join(run.dir, 'report.md'), md);
  console.log(['', ...summary, '', AUDIT ? `Grok: ${audits.size - disagree.length} of ${audits.size} bear out the numbers` : 'Grok: not run', `Time: ${((Date.now() - T0) / 1000).toFixed(0)} s`, `→ ${run.dir.replace(process.cwd() + '/', '')}/report.md`].join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
