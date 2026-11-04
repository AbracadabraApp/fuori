// What would a cultural lesson sound like? (Josh, 2026-11-03: "do a test of
// the dialogue you might get"; docs/culture.md → Cultural lessons.)
// 1. One call picks Rome's set of cultural items from its shown people, with
//    no city lists (Claude's own knowledge), tipico not stereotypical.
// 2. A narrow fact judge checks every item.
// 3. Two items are played as lessons (mostly listening, a personal question
//    at the end of each turn) against a simulated learner: one Intermediate,
//    one Beginner. Nothing is written to content.
//   npx tsx --env-file-if-exists=.env.local tests/experiments/culture-lesson.mts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { ask, OUT } from './common.mjs';

const city = cities.find((c) => c.id === 'roma-nuova')!;
const people = city.places.filter((p) => !p.hidden && p.characterId).map((place) => {
  const c = characterForPlace(city, place)!;
  return { id: c.id, name: c.name, age: c.age, role: c.role, where: c.appearance?.setting ?? place.name };
});

const PICK = `You help make a language-learning game set in today's ${city.name}. A newcomer who has come to live there learns its culture from its people. Below are the people the newcomer can meet. Pick 6 cultural items for the city, each told by one of these people, spread across food, history, folklore and traditions, art, and rivalry with other towns or neighbourhoods (campanilismo).

Each item is one particular thing, small enough to tell in two minutes: one story, one reason. It must be tipico, not a stereotype: something people who live here would talk about in an ordinary week and be proud of, not what a visitor expects (no "Rome is famous for…", no must-see landmarks for their own sake). Only well-known facts you're sure of. Pick the teller it fits: their place, their role, their age.

For each item: chip (its name, at most four English words, that fits only this thing), teller (the person's id), topic, facts (three or four sentences: the story and the reason, in English), words (one or two Italian words worth keeping, with their English).`;

const pickSchema = {
  type: 'object', additionalProperties: false, required: ['items'],
  properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['chip', 'teller', 'topic', 'facts', 'words'], properties: {
    chip: { type: 'string' }, teller: { type: 'string' }, topic: { type: 'string' }, facts: { type: 'string' },
    words: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['it', 'en'], properties: { it: { type: 'string' }, en: { type: 'string' } } } },
  } } } },
};

const FACTS = `You check facts for a language-learning game. For each item, list every factual claim in it and mark each one confirmed only if it is well known and you are certain of it; anything doubtful, disputed or that you can't confirm is not confirmed. An item passes only if every claim is confirmed. Legends count as confirmed when they are told as legends.`;
const factSchema = {
  type: 'object', additionalProperties: false, required: ['items'],
  properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['chip', 'pass', 'doubts'], properties: {
    chip: { type: 'string' }, pass: { type: 'boolean' }, doubts: { type: 'array', items: { type: 'string' } },
  } } } },
};

type Item = { chip: string; teller: string; topic: string; facts: string; words: { it: string; en: string }[] };
type Turn = { who: string; line: string; en?: string };

const lineSchema = { type: 'object', additionalProperties: false, required: ['line', 'en'], properties: { line: { type: 'string' }, en: { type: 'string' } } };

function tellerBrief(item: Item, level: 'Beginner' | 'Intermediate') {
  const p = people.find((x) => x.id === item.teller)!;
  const words = item.words.map((w) => `${w.it} (${w.en})`).join(', ');
  const how = level === 'Beginner'
    ? `They're a Beginner: tell the story in simple spoken English, and say the Italian words (${words}) in Italian as they come up, so they can say them back.`
    : `They're an Intermediate learner: tell it in simple Italian they can follow.`;
  return `You are ${p.name}, a ${p.age}-year-old ${p.role} in ${city.name}, at ${p.where}. A newcomer who now lives in ${city.name} and is learning Italian has asked you about "${item.chip}". What you know about it: ${item.facts}
${how}
Tell it in three short turns, the way someone who loves it would. End each of the first two turns with a personal question about their own experience, like "Have you ever…?", never a quiz. The third turn finishes the story with the word worth keeping and says goodbye, with no question.
Respond with JSON: { "line": what you say, "en": English translation }`;
}

const LEARNER = (level: 'Beginner' | 'Intermediate') => level === 'Beginner'
  ? `You play a Beginner learner of Italian, an American adult who has just moved to Rome. Answer what was said in one short sentence of English, sometimes trying one Italian word you just heard. Just the sentence.`
  : `You play an Intermediate learner of Italian (about A2), an American adult who has just moved to Rome. Answer in one or two short, simple Italian sentences, with the occasional small mistake. Just the sentence.`;

async function lesson(item: Item, level: 'Beginner' | 'Intermediate') {
  const p = people.find((x) => x.id === item.teller)!;
  const turns: Turn[] = [];
  const transcript = () => turns.map((t) => `${t.who}: ${t.line}`).join('\n');
  for (let i = 0; i < 3; i++) {
    const so = turns.length ? `The conversation so far:\n${transcript()}\n\nYour turn ${i + 1} of 3.` : 'Your turn 1 of 3.';
    const r = JSON.parse(await ask(so, { system: tellerBrief(item, level), schema: lineSchema, max: 1500 }));
    turns.push({ who: p.name, line: r.line, en: r.en });
    if (i < 2) turns.push({ who: 'Learner', line: await ask(`${transcript()}\n\nYour reply:`, { system: LEARNER(level), max: 300 }) });
  }
  return turns;
}

const picked: { items: Item[] } = JSON.parse(await ask(`People:\n${people.map((p) => `- ${p.id}: ${p.name}, ${p.age}, ${p.role}, at ${p.where}`).join('\n')}`, { system: PICK, schema: pickSchema, max: 6000 }));
const checked: { items: { chip: string; pass: boolean; doubts: string[] }[] } = JSON.parse(await ask(JSON.stringify(picked.items.map(({ chip, facts }) => ({ chip, facts }))), { system: FACTS, schema: factSchema, max: 4000 }));

const passing = picked.items.filter((it) => checked.items.find((c) => c.chip === it.chip)?.pass);
const playable = passing.length >= 2 ? passing : picked.items;
const [inter, beg] = await Promise.all([lesson(playable[0], 'Intermediate'), lesson(playable[1], 'Beginner')]);

let md = `# Cultural lesson trial: ${city.name} (${new Date().toISOString().slice(0, 10)})\n\n## Items\n\n`;
for (const it of picked.items) {
  const c = checked.items.find((x) => x.chip === it.chip);
  md += `### ${it.chip} (${it.topic}) · ${people.find((p) => p.id === it.teller)?.name ?? it.teller} · fact judge: ${c?.pass ? 'pass' : 'FAIL'}\n${it.facts}\nWords: ${it.words.map((w) => `${w.it} (${w.en})`).join(', ')}\n${c?.doubts.length ? `Doubts: ${c.doubts.join('; ')}\n` : ''}\n`;
}
for (const [title, item, turns] of [['Intermediate', playable[0], inter], ['Beginner', playable[1], beg]] as const) {
  md += `## ${title}: ${item.chip}\n\n${turns.map((t) => `**${t.who}:** ${t.line}${t.en && t.en !== t.line ? `\n*(${t.en})*` : ''}`).join('\n\n')}\n\n`;
}
const file = join(OUT, `culture-lesson-${Date.now()}.md`);
writeFileSync(file, md);
console.log(file);
