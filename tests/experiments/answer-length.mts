// Beginner answers to say back (beginner.md; Josh, 2026-11-05, on Doña
// Chela's "Quiero probar un chapulín, por favor" and "I want to try the
// quesillo"): how long the offered answers are, and whether their English
// leaves a local word unexplained. Opening turns at S1 and S2 at shown
// places, with the code as it stands; run before and after a change, same N.
//   COUNTRY=it    npx tsx --env-file=.env.local tests/experiments/answer-length.mts [n]
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/answer-length.mts [n]
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';

const N = Number(process.argv[2] ?? 2);
// Eight shown places with a character, spread over the cities
const places = cities.filter((c) => !c.hidden).flatMap((c) => c.places.filter((p) => !p.hidden && characterForPlace(c, p)).map((p) => ({ c, p })));
const picked = Array.from({ length: 8 }, (_, i) => places[Math.floor((i * places.length) / 8)]);

async function unexplained(answers: { text: string; en: string }[]): Promise<boolean> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 300, thinking: { type: 'between_tools' },
    system: `You check a game for English speakers learning ${language.name}. Each answer is shown in ${language.name} with its English underneath. Does any English leave a local word untranslated and unexplained, so an English speaker wouldn't know what it is (a food, a drink, a dish, a thing only found there)? Well-known words in English (pizza, cappuccino, taco, espresso) are fine. Reply with JSON: unexplained (boolean).`,
    messages: [{ role: 'user', content: answers.map((a) => `${a.text} → ${a.en}`).join('\n') }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, properties: { unexplained: { type: 'boolean' } }, required: ['unexplained'] } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return JSON.parse(replyText(r as never)).unexplained === true;
}

const rows: { words: number[]; unexplained: boolean; line: string }[] = [];
await Promise.all(picked.flatMap(({ c, p }) => (['S1', 'S2'] as const).flatMap((s) => Array.from({ length: N }, async () => {
  const character = characterForPlace(c, p)!;
  const stage = STAGES[s];
  const r = await runBeginnerTurn({ character, transcript: [], stageText: stageText(stage, character.role), maxAnswers: stage.answers });
  const answers = r.parts.filter((x) => x.kind === 'answer');
  if (!answers.length) return;
  rows.push({ words: answers.map((a) => a.text.split(/\s+/).filter(Boolean).length), unexplained: await unexplained(answers), line: `${s} ${character.name}: ${answers.map((a) => `«${a.text}» (${a.en})`).join(' | ')}` });
}))));
const all = rows.flatMap((r) => r.words);
const mean = all.reduce((a, b) => a + b, 0) / all.length;
console.log(`[${pack.id}] ${rows.length} turns with answers, ${all.length} answers: mean ${mean.toFixed(1)} words, ${all.filter((w) => w >= 5).length} of ${all.length} with 5+ words; English leaves a local word unexplained in ${rows.filter((r) => r.unexplained).length} of ${rows.length} turns\n${rows.map((r) => `${r.unexplained ? 'UNEXPLAINED ' : ''}${r.line}`).join('\n')}`);
