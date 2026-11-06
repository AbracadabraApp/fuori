// Does a cultural lesson say what its topic is at the start? (Josh,
// 2026-11-06: "In lessons the Palio isn't described well. Cultural lessons
// need to explain the topic clearly at the start".) Plays the first teller
// turn of every item in the set, as a Beginner and as an Intermediate
// learner, through the server's own code (lib/lesson.ts, lib/culture.ts),
// and a judge asks whether a newcomer who has never heard of the topic
// would know what it is from that turn alone, and whether the first
// sentence is a topic sentence (Josh: "there is no topic sentence").
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/culture-opening.mts [out file]
import { writeFileSync } from 'node:fs';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { lessonBrief } from '@/lib/lesson';
import { cultureSet } from '@/lib/culture';

const out = process.argv[2];

async function judge(chip: string, facts: string, line: string): Promise<{ clear: boolean; topicFirst: boolean; why: string }> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 400, thinking: { type: 'between_tools' },
    system: 'You judge one turn of a cultural lesson in a language game. Reply with JSON: clear, topicFirst, why (one sentence).',
    messages: [{ role: 'user', content: `The topic: "${chip}". Background the teller had: ${facts}\n\nThe teller's first turn (the learner may only follow the English parts if it is mixed):\n${line}\n\nImagine a newcomer who has never heard of this topic or anything it depends on (for example, they don't know what the Palio is). From this turn alone, do they know plainly what the thing is: what kind of thing, and where or when it happens? clear is true only if they do. topicFirst is true only if the turn's very first sentence is a topic sentence: it names the topic and says what it is, with no greeting or small talk before it.` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['clear', 'topicFirst', 'why'], properties: { clear: { type: 'boolean' }, topicFirst: { type: 'boolean' }, why: { type: 'string' } } } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return JSON.parse(replyText(r as Parameters<typeof replyText>[0]));
}

async function first(itemId: string, beginner: boolean) {
  const it = cultureSet().find((x) => x.id === itemId)!;
  const city = cities.find((c) => c.id === it.cityId)!;
  const character = characterForPlace(city, city.places.find((p) => p.id === it.placeId)!)!;
  const b = await lessonBrief({ stepId: it.id, part: 'story' }, 'trial', [], undefined, undefined, beginner);
  const r = b.speaking ? await runTurn({ character, transcript: [], brief: b.brief }) : await runBeginnerTurn({ character, transcript: [], stageText: b.brief });
  const line = b.speaking ? `${r.line}\n(English: ${r.en})` : r.line;
  const j = await judge(it.chip, it.facts, line);
  return { chip: it.chip, level: beginner ? 'Beginner' : 'Intermediate', line, ...j };
}

const results = await Promise.all(cultureSet().flatMap((it) => [first(it.id, true), first(it.id, false)]));
const clear = results.filter((r) => r.clear).length;
const summary = `[${pack.id}] clear at the start: ${clear}/${results.length} · topic sentence first: ${results.filter((r) => r.topicFirst).length}/${results.length}\n` + results.filter((r) => !r.clear).map((r) => `  not clear · ${r.level} · ${r.chip}: ${r.why}`).join('\n');
console.log(summary);
if (out) writeFileSync(out, `${summary}\n\n${results.map((r) => `## ${r.level}: ${r.chip} (${r.clear ? 'clear' : 'NOT clear'})\n\n${r.line}\n\n${r.why}`).join('\n\n')}\n`);
