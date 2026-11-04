// Cultural lessons through the server's own code (lib/lesson.ts → lessonBrief
// with part "story", lib/culture.ts): the set's first items played as a
// Beginner (the Beginner format) and as an Intermediate learner (the
// character prompt with the brief), against a simulated learner. Reports
// words per teller turn (the earlier trial's ran to about 90) and whether the
// lesson ends on the third turn.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/culture-story-trial.mts [items, default 2] [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { lessonBrief } from '@/lib/lesson';
import { cultureSet } from '@/lib/culture';
import type { Turn } from '@/lib/types';

const n = Number(process.argv[2] ?? 2);
const out = process.argv[3];
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

async function learner(conv: string, beginner: boolean): Promise<string> {
  const who = beginner
    ? `a Beginner learner of ${language.name} who has just moved here: answer in one short sentence of English, sometimes trying a ${language.name} word you just heard`
    : `an Intermediate learner of ${language.name} (about A2) who has just moved here: answer in one or two short, simple ${language.name} sentences, with the occasional small mistake`;
  const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: 300, thinking: { type: 'between_tools' }, system: `You play ${who}. Reply with JSON: said.`, messages: [{ role: 'user', content: `${conv}\n\nWhat do you say?` }], output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['said'], properties: { said: { type: 'string' } } } } } } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { said: string }).said;
}

async function play(itemId: string, beginner: boolean) {
  const it = cultureSet().find((x) => x.id === itemId)!;
  const city = cities.find((c) => c.id === it.cityId)!;
  const character = characterForPlace(city, city.places.find((p) => p.id === it.placeId)!)!;
  const transcript: Turn[] = [];
  const lines: string[] = [];
  const lengths: number[] = [];
  let said: string | undefined;
  let endedAt = -1;
  for (let i = 0; i < 5; i++) {
    const b = await lessonBrief({ stepId: it.id, part: 'story' }, 'trial', transcript, said, undefined, beginner);
    const r = b.speaking ? await runTurn({ character, transcript, learnerSaid: said, brief: b.brief }) : await runBeginnerTurn({ character, transcript, learnerSaid: said, stageText: b.brief });
    if (said) { transcript.push({ who: 'learner', transcript: said }); lines.push(`Learner: ${said}`); }
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    lines.push(`${character.name}: ${r.line}`);
    lengths.push(words(r.line));
    if (b.forcedDone) { endedAt = i; break; }
    said = await learner(lines.join('\n'), beginner);
  }
  return { id: it.id, chip: it.chip, level: beginner ? 'Beginner' : 'Intermediate', lengths, ended: endedAt === 2, lines };
}

const items = cultureSet().slice(0, n);
const results = await Promise.all(items.flatMap((it) => [play(it.id, false), play(it.id, true)]));
const summary = results.map((r) => `${r.level} · ${r.chip}: words per turn ${r.lengths.join('/')} · ends on turn 3 ${r.ended ? 'ok' : 'FAIL'}`).join('\n');
console.log(`[${pack.id}]\n${summary}`);
if (out) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `culture-story-${pack.id}.md`), `# Cultural lessons, ${pack.id}\n\n${summary}\n\n${results.map((r) => `## ${r.level}: ${r.chip}\n\n\`\`\`\n${r.lines.join('\n')}\n\`\`\``).join('\n\n')}\n`);
}
