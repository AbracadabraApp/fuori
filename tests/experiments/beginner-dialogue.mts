// Beginner level dialogue, trial (docs/beginner-scaffolding.md → Goals; Josh,
// 2026-10-25): Josh's real conversations replayed with content/<country>/
// prompts/beginner.md, his lines as he said them, against what the character
// said that day. Writes a side-by-side report and counts per turn: English
// and target-language words, questions, answers offered.
//   npx tsx --env-file=.env.local tests/experiments/beginner-dialogue.mts tests/experiments/out/beginner-source.json > tests/experiments/out/beginner-dialogue-<country>.md
// (COUNTRY=es-mx for Mexico; the source file holds both countries' conversations)
import { readFileSync } from 'node:fs';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

type Part = { kind: 'english' | 'word' | 'question' | 'answer'; text: string; en: string };
const schema = { type: 'object', additionalProperties: false, required: ['parts'], properties: { parts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['kind', 'text', 'en'], properties: { kind: { type: 'string', enum: ['english', 'word', 'question', 'answer'] }, text: { type: 'string' }, en: { type: 'string' } } } } } };

const rows = JSON.parse(readFileSync(process.argv[2], 'utf8')) as { id: string; character_id: string; place_id: string; city_id: string; turns: { who: string; text: string }[] }[];
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

/** A simulated beginner's next line: mostly one of the offered answers (their
 * name filled in), sometimes their own short try with a mistake, and a
 * goodbye when the character offers one; "" to stop after the goodbye */
async function beginner(parts: Part[], turn: number): Promise<string> {
  const heard = parts.map((p) => (p.kind === 'english' ? p.text : `[${p.kind}] ${p.text}`)).join('\n');
  const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: 400, thinking: { type: 'between_tools' }, system: `You play a real beginner learner of ${language.name} named Sam, on a first visit, talking to a shopkeeper in a game. Reply with ONLY what Sam says, in ${language.name}, as speech-to-text would hear it: usually one of the offered answers (with Sam's name or real choice filled in), sometimes a short try of your own with a small beginner mistake. If they already said goodbye and the shopkeeper said goodbye back, reply with exactly END.`, messages: [{ role: 'user', content: `Turn ${turn + 1}. The shopkeeper said:\n${heard}` }] } as any);
  const t = replyText(r).trim();
  return t === 'END' ? '' : t;
}
const said = (parts: Part[]) => parts.map((p) => p.text).join(' ');

for (const row of rows) {
  const city = cities.find((c) => c.id === row.city_id);
  const place = city?.places.find((p) => p.id === row.place_id);
  if (!city || !place) continue; // the other country's conversation
  const ch = characterForPlace(city, place)!;
  const character = `${ch.age} years old. ${ch.personality.traits.join(', ')}. ${ch.speech.description}`;
  const system = fill(readPromptFile('beginner.md').block('System prompt'), {
    name: ch.name, role: ch.role, place: place.name, neighbourhood: (place as any).neighbourhood ?? '', city: city.name, character, language: language.name,
    formality: `the polite form ("${language.formality.formal}") unless you already use the familiar one`,
  });
  const learner = row.turns.filter((t) => t.who === 'learner').map((t) => t.text).slice(0, 6);
  // SIMULATE=1: a simulated beginner answers the character's own questions
  // (one of the offered sentences, or their own try), up to 8 turns
  const simulate = process.env.SIMULATE === '1';
  const turnsToRun = simulate ? 8 : learner.length;
  const today = row.turns.filter((t) => t.who === 'npc').map((t) => t.text);
  const messages: { role: 'user' | 'assistant'; content: string }[] = [{ role: 'user', content: '(The person has just come in.)' }];
  console.log(`\n## ${ch.name}, ${ch.role} (${place.name}, ${city.name})\n`);
  let tot = { en: 0, lang: 0, q: 0, a: 0, turns: 0 };
  let lastParts: Part[] = [];
  for (let i = 0; i <= turnsToRun; i++) {
    const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: 2000, temperature: 1, thinking: { type: 'between_tools' }, system, messages, output_config: { format: { type: 'json_schema', schema } } } as any);
    const parts = JSON.parse(replyText(r)).parts as Part[];
    const en = parts.filter((p) => p.kind === 'english').reduce((n, p) => n + words(p.text), 0);
    const lang = parts.filter((p) => p.kind !== 'english').reduce((n, p) => n + words(p.text), 0);
    const q = parts.filter((p) => p.kind === 'question').length, a = parts.filter((p) => p.kind === 'answer').length;
    tot = { en: tot.en + en, lang: tot.lang + lang, q: tot.q + q, a: tot.a + a, turns: tot.turns + 1 };
    if (!simulate) console.log(`**Today:** *${today[i] ?? '—'}*\n`);
    console.log(`**Beginner:** ${parts.map((p) => (p.kind === 'english' ? p.text : `[${p.kind}: **${p.text}** — ${p.en}]`)).join(' ')}\n`);
    console.log(`<sub>English ${en} words · ${language.name} ${lang} · questions ${q} · answers offered ${a}</sub>\n`);
    messages.push({ role: 'assistant', content: said(parts) });
    lastParts = parts;
    if (i < turnsToRun) {
      const line = simulate ? await beginner(lastParts, i) : learner[i];
      if (!line) break;
      console.log(`> **${simulate ? 'Beginner' : 'Josh'}:** ${line}\n`);
      messages.push({ role: 'user', content: line });
    }
  }
  console.log(`**Totals:** ${tot.turns} turns · English ${tot.en} words, ${language.name} ${tot.lang} · questions ${tot.q} (${(tot.q / tot.turns).toFixed(1)} a turn) · answers offered ${tot.a}\n`);
}
