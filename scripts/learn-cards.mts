// Learn 2.0's card bank (docs/learn-sheet-2-plan.md → The bank): cards cut from the game's own content,
// one source at a time, written to the models (content/<country>/prompts/learn-card-models.md), checked
// by code (lib/learn-card.ts → cardProblems) and, for facts, by culture.md's Facts judge; what fails is
// dropped. Idioms need no call. Each card carries its source as a footnote the learner never sees.
// Writes content/<country>/learn-cards.json, replacing only the cards of the sources it ran.
//   COUNTRY=it npx tsx --env-file=.env.local scripts/learn-cards.mts [--pilot] [--only lesson,idiom,culture,city,here,place]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, logUsage, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { idioms } from '@/lib/idioms';
import { cardProblems, CARD_LEVELS, type CardLevel, type LearnCard, type LearnCardBank } from '@/lib/learn-card';

const pilot = process.argv.includes('--pilot');
const onlyArg = process.argv[process.argv.indexOf('--only') + 1];
const only = process.argv.includes('--only') ? new Set(onlyArg.split(',')) : null;
const runs = (s: string) => !only || only.has(s);

const cut = readPromptFile('learn-cards.md');
const models = readPromptFile('learn-card-models.md');
const factsJudge = readPromptFile('culture.md').block('Facts');
const by = `learn-cards.mts@${cut.version}`;
const system = fill(cut.block('Cut'), { language: language.name, models: models.block('Models') });

/** What this run used, printed at the end (development calls aren't in the live logs) */
const spent = { calls: 0, input: 0, output: 0 };

async function ask<T>(system: string, content: string, schema: object, max = 6000): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: max, system, messages: [{ role: 'user', content }], output_config: { format: { type: 'json_schema', schema } } } as Parameters<typeof anthropic.messages.create>[0]);
      logUsage('learn-cards', r as Parameters<typeof logUsage>[1]);
      const u = (r as { usage: { input_tokens: number; output_tokens: number } }).usage;
      spent.calls++; spent.input += u.input_tokens; spent.output += u.output_tokens;
      return JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as T;
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }
  }
}

/** At most `n` at once */
async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
  }));
  return out;
}

const str = { type: 'string' };
const rowSchema = { type: 'object', additionalProperties: false, required: ['text', 'en'], properties: { text: str, en: str } };
const cardSchema = { type: 'object', additionalProperties: false, required: ['kind', 'headline', 'term', 'rows', 'note', 'uses', 'redrafted'], properties: { kind: str, headline: str, term: str, rows: { type: 'array', items: rowSchema }, note: str, uses: str, redrafted: { type: 'boolean' } } };
const cutSchema = { type: 'object', additionalProperties: false, required: ['cards'], properties: { cards: { type: 'array', items: cardSchema } } };
const factSchema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['chip', 'pass', 'doubts'], properties: { chip: str, pass: { type: 'boolean' }, doubts: { type: 'array', items: str } } } } } };

type Cut = { kind: string; headline: string; term: string; rows: { text: string; en: string }[]; note: string; uses: string; redrafted: boolean };
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const numbers = (uses: string) => [...uses.matchAll(/\d+/g)].map((m) => Number(m[0]));

async function cutCards(block: string, values: Record<string, string>): Promise<Cut[]> {
  return (await ask<{ cards: Cut[] }>(system, fill(cut.block(block), { language: language.name, ...values }), cutSchema)).cards;
}

function card(c: Cut, id: string, level: CardLevel, keys: string[], from: string, ref: string): LearnCard {
  return {
    id, kind: slug(c.kind) || 'card', headline: c.headline.trim(), ...(c.term.trim() ? { term: c.term.trim() } : {}),
    rows: c.rows.filter((r) => r.text.trim()), ...(c.note.trim() ? { note: c.note.trim() } : {}),
    level, keys: [...new Set(keys)], source: { from, ref: c.uses.trim() ? `${ref}/${c.uses.trim()}` : ref, redrafted: c.redrafted, by },
  };
}

/** Keeps the fact cards culture.md's Facts judge passes */
async function factChecked(cards: LearnCard[]): Promise<{ kept: LearnCard[]; dropped: { card: LearnCard; doubts: string[] }[] }> {
  if (!cards.length) return { kept: [], dropped: [] };
  const items = cards.map((c) => ({ chip: c.id, facts: [c.headline + (c.term ? `: ${c.term}` : ''), ...c.rows.map((r) => `${r.text} (${r.en})`), c.note ?? ''].filter(Boolean).join('. ') }));
  const verdicts = (await ask<{ items: { chip: string; pass: boolean; doubts: string[] }[] }>(factsJudge, JSON.stringify(items), factSchema, 4000)).items;
  const kept: LearnCard[] = [];
  const dropped: { card: LearnCard; doubts: string[] }[] = [];
  for (const c of cards) {
    const v = verdicts.find((x) => x.chip === c.id);
    if (v?.pass) kept.push(c); else dropped.push({ card: c, doubts: v?.doubts ?? ['no verdict'] });
  }
  return { kept, dropped };
}

const made: LearnCard[] = [];
const replaced = new Set<string>();
const log: string[] = [];
const droppedLog: string[] = [];
const keep = (c: LearnCard, what: string) => {
  const p = cardProblems(c);
  if (p.length) { droppedLog.push(`${c.id} (${what}): ${p.join(', ')}`); return; }
  made.push(c);
};

// Lessons: one or two cards a step
if (runs('lesson')) {
  replaced.add('lesson:');
  type Step = { id: string; title: string; how_to: string; examples: { role: string; place: string; said: string; en: string }[]; notice: string; context: string; practice: { ask: { said: string; en: string }; answer: { said: string; en: string } }[] };
  const steps = ['lessons.json', 'lessons-b1.json'].flatMap((file) => {
    const path = join(process.cwd(), 'content', pack.id, file);
    if (!existsSync(path)) return [];
    const json = JSON.parse(readFileSync(path, 'utf8')) as { level?: string; units: Record<string, { steps: Step[] }> };
    const level: CardLevel = json.level === 'B1' ? 'B1' : 'A1';
    return Object.entries(json.units).flatMap(([unit, u]) => u.steps.map((step) => ({ file, unit, level, step })));
  });
  const chosen = pilot ? [...steps.filter((s) => s.level === 'A1').slice(0, 4), ...steps.filter((s) => s.level === 'B1').slice(0, 2)] : steps;
  const results = await pool(chosen, 4, async ({ file, unit, level, step }) => {
    const material = [
      `Step: ${step.title}`, `How to: ${step.how_to}`,
      'Examples:', ...step.examples.map((e, i) => `${i + 1}. (${e.role}, ${e.place}) ${e.said} | ${e.en}`),
      `Notice: ${step.notice}`, `Context: ${step.context}`,
      'Practice:', ...step.practice.map((p, i) => `${i + 1}. ${p.ask.said} | ${p.ask.en} → ${p.answer.said} | ${p.answer.en}`),
    ].join('\n');
    const cards = await cutCards('Lesson', { level, material });
    const places = step.examples.map((e) => `kind:${e.place}`);
    cards.forEach((c, n) => keep(card(c, `lesson:${step.id}:${n + 1}`, level, [`lesson:${step.id}`, `unit:${unit}`, ...places], 'lesson', `${pack.id}/${file}#${step.id}`), step.id));
    return cards.length;
  });
  log.push(`lessons: ${chosen.length} steps, ${results.reduce((a, b) => a + b, 0)} cards cut`);
}

// Idioms: built as they are, no call
if (runs('idiom')) {
  replaced.add('idiom:');
  const all = idioms();
  const chosen = pilot ? all.filter((i) => i.common?.startsWith('very')).slice(0, 5) : all;
  for (const i of chosen) {
    const at = all.indexOf(i);
    const level = (CARD_LEVELS as readonly string[]).includes(i.level ?? '') ? (i.level as CardLevel) : 'B1';
    const meaning = i.meaning.trim().replace(/^./, (ch) => ch.toUpperCase()).replace(/[.;,\s]*$/, '.');
    keep({
      id: `idiom:${slug(i.text)}`, kind: 'a-saying', headline: 'A saying',
      rows: [{ text: i.text, en: i.picture }], note: meaning, level,
      keys: [`idiom:${i.text}`, ...((i as { group?: string }).group ? [`group:${(i as { group?: string }).group}`] : [])],
      source: { from: 'idioms', ref: `${pack.id}/idioms.json#${at}`, redrafted: false, by: 'learn-cards.mts (no call)' },
    }, i.text);
  }
  log.push(`idioms: ${chosen.length} cards`);
}

// Culture stories: one fact card each, fact-checked
if (runs('culture')) {
  replaced.add('culture:');
  const path = join(process.cwd(), 'content', pack.id, 'culture.json');
  const items = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as { items: { id: string; cityId: string; placeId: string; chip: string; topic: string; facts: string }[] }).items : [];
  const chosen = pilot ? items.slice(0, 3) : items;
  const cutOnes = (await pool(chosen, 4, async (it) => {
    const city = cities.find((c) => c.id === it.cityId);
    const place = city?.places.find((p) => p.id === it.placeId);
    const cards = await cutCards('Culture', { city: city?.name ?? it.cityId, material: `Place: ${place?.name ?? it.placeId} (${place?.kind ?? ''})\nStory: ${it.chip}\n1. ${it.facts}` });
    return cards.slice(0, 1).map((c) => card(c, `culture:${it.id}`, 'A1', [`city:${it.cityId}`, `place:${it.cityId}/${it.placeId}`, `topic:${it.topic}`, ...(place ? [`kind:${place.kind}`] : [])], 'culture', `${pack.id}/culture.json#${it.id}`));
  })).flat();
  const { kept, dropped } = await factChecked(cutOnes);
  kept.forEach((c) => keep(c, 'culture'));
  dropped.forEach((d) => droppedLog.push(`${d.card.id} (facts): ${d.doubts.join('; ')}`));
  log.push(`culture: ${chosen.length} stories, ${cutOnes.length} cut, ${kept.length} passed facts`);
}

// Each city: its lists and its people's here lines
const shown = cities.filter((c) => !c.hidden && !c.more);
const cityRun = pilot ? shown.slice(0, 2) : shown;
if (runs('city')) {
  replaced.add('city:');
  const cutOnes = (await pool(cityRun, 4, async (city) => {
    const n = (list: string[], from: number) => list.map((x, i) => `${from + i}. ${x}`);
    const words = n(city.localTouches, 1);
    const customs = n(city.customs, 1 + city.localTouches.length);
    const food = n(city.food, 1 + city.localTouches.length + city.customs.length);
    const material = ['Local words:', ...words, 'Customs:', ...customs, 'Food:', ...food].join('\n');
    const cards = await cutCards('City', { city: city.name, count: pilot ? '4' : '8', material });
    return cards.map((c) => card(c, `city:${city.id}:${slug(`${c.kind}-${c.term || c.rows[0]?.text || c.note.slice(0, 40)}`)}`, 'A1', [`city:${city.id}`], 'city', `${pack.id}/cities/${city.id}.ts#lists`));
  })).flat();
  const { kept, dropped } = await factChecked(cutOnes);
  kept.forEach((c) => keep(c, 'city'));
  dropped.forEach((d) => droppedLog.push(`${d.card.id} (facts): ${d.doubts.join('; ')}`));
  log.push(`city lists: ${cityRun.length} cities, ${cutOnes.length} cut, ${kept.length} passed facts`);
}
if (runs('here')) {
  replaced.add('here:');
  const cutOnes = (await pool(cityRun, 4, async (city) => {
    const lines = city.places.filter((p) => !p.hidden && p.characterId).flatMap((place) => {
      const person = city.characters?.find((ch) => ch.id === place.characterId);
      return person?.here ? [{ place, here: person.here }] : [];
    });
    if (!lines.length) return [];
    const material = lines.map((l, i) => `${i + 1}. ${l.place.name} (${l.place.kind}): ${l.here}`).join('\n');
    const cards = await cutCards('Here', { city: city.name, count: pilot ? '3' : String(Math.min(12, Math.ceil(lines.length / 2))), material });
    return cards.map((c, k) => {
      const line = lines[(numbers(c.uses)[0] ?? 0) - 1];
      const place = line?.place;
      return card(c, `here:${city.id}/${place?.id ?? 'unknown'}:${k + 1}`, 'A1', [`city:${city.id}`, ...(place ? [`place:${city.id}/${place.id}`, `kind:${place.kind}`] : [])], 'here', `${pack.id}/cities/${city.id}.ts#${place?.id ?? 'unknown'}/here`);
    });
  })).flat();
  const { kept, dropped } = await factChecked(cutOnes);
  kept.forEach((c) => keep(c, 'here'));
  dropped.forEach((d) => droppedLog.push(`${d.card.id} (facts): ${d.doubts.join('; ')}`));
  log.push(`here lines: ${cityRun.length} cities, ${cutOnes.length} cut, ${kept.length} passed facts`);
}

// Real landmarks (plazas, monuments, churches, parks, markets, museums): one fact each from Claude's own
// knowledge, fact-checked (Josh, 2026-11-23: "you could take every plaza and monument or church and get a fact").
// Bars, shops and restaurants are left out: facts about a business are less sure.
const LANDMARK = /piazza|plaza|landmark|church|chiesa|cathedral|duomo|basilica|park|parco|garden|giardin|market|mercato|museum|museo|cemetery|monument/i;
if (runs('place')) {
  replaced.add('place:');
  const cutOnes = (await pool(cityRun, 4, async (city) => {
    const places = city.places.filter((p) => !p.hidden && p.real && LANDMARK.test(p.kind)).slice(0, pilot ? 4 : undefined);
    if (!places.length) return [];
    const material = places.map((p, i) => `${i + 1}. ${p.name} (${p.kind}, ${p.neighbourhood})`).join('\n');
    const cards = await cutCards('Place', { city: city.name, material });
    return cards.flatMap((c) => {
      const place = places[(numbers(c.uses)[0] ?? 0) - 1];
      if (!place) return [];
      return [card({ ...c, uses: '' }, `place:${city.id}/${place.id}`, 'A1', [`city:${city.id}`, `place:${city.id}/${place.id}`, `kind:${place.kind}`], 'place', `${pack.id}/cities/${city.id}.ts#${place.id}`)];
    });
  })).flat();
  const { kept, dropped } = await factChecked(cutOnes);
  kept.forEach((c) => keep(c, 'place'));
  dropped.forEach((d) => droppedLog.push(`${d.card.id} (facts): ${d.doubts.join('; ')}`));
  log.push(`places: ${cityRun.length} cities, ${cutOnes.length} cut, ${kept.length} passed facts`);
}

// Write: the cards of the sources run replace their old ones; the rest stay
const out = join(process.cwd(), 'content', pack.id, 'learn-cards.json');
const before: LearnCard[] = existsSync(out) ? (JSON.parse(readFileSync(out, 'utf8')) as LearnCardBank).cards : [];
const kept = before.filter((c) => ![...replaced].some((p) => c.id.startsWith(p)));
const ids = new Set<string>();
const cards = [...kept, ...made].filter((c) => (ids.has(c.id) ? false : (ids.add(c.id), true)));
const bank: LearnCardBank = { version: new Date().toISOString().slice(0, 10), prompt: cut.version, models: models.version, cards };
writeFileSync(out, JSON.stringify(bank, null, 2) + '\n');
console.log(`[${pack.id}]${pilot ? ' pilot' : ''} ${log.join(' · ')}\n${cards.length} cards in the bank`);
console.log(`Claude: ${spent.calls} calls, ${spent.input} input tokens, ${spent.output} output tokens`);
if (droppedLog.length) console.log(`dropped:\n  ${droppedLog.join('\n  ')}`);
