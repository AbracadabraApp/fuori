// A Learn lesson, trial (Josh, 2026-10-26: "an on-syllabus lesson using what
// you have seen"): one step of a syllabus unit at the learner's level, its
// examples in the voices of people they know.
// Prompt: content/<country>/prompts/lesson.md. Input: a JSON export of the
// learner ({ studyFile, conversations: [{ character_id, place_id, city_id }] }).
//   npx tsx --env-file=.env.local tests/experiments/lesson.mts <learner.json> <unit id> <out dir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack, tutor } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { characterForVisit } from '@/lib/characters/for-visit';
import { voiceForCharacter } from '@/lib/voice/early-voice';
import { getVoiceProvider } from '@/lib/voice/providers';

const [input, unitId, out] = process.argv.slice(2);
const learner = JSON.parse(readFileSync(input, 'utf8'));
const syllabus = JSON.parse(readFileSync(join('content', pack.id, 'syllabus.json'), 'utf8'));
const unit = syllabus.units.find((u: { id: string }) => u.id === unitId);
if (!unit) throw new Error(`no unit ${unitId}`);

// The people the learner knows: name, role, place, city
const people = new Map<string, { name: string; role: string; place: string; city: string }>();
for (const c of learner.conversations as { character_id: string; place_id: string; city_id: string }[]) {
  const ch = characterForVisit(c.city_id, c.place_id);
  const city = cities.find((x) => x.id === c.city_id);
  people.set(c.character_id, { name: ch?.name ?? c.character_id, role: ch?.role ?? '', place: city?.places.find((p) => p.id === c.place_id)?.name ?? c.place_id, city: city?.name ?? c.city_id });
}

const line = { type: 'object', additionalProperties: false, properties: { it: { type: 'string' }, en: { type: 'string' } }, required: ['it', 'en'] };
const said = { type: 'object', additionalProperties: false, properties: { who: { type: 'string' }, it: { type: 'string' }, en: { type: 'string' } }, required: ['who', 'it', 'en'] };
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    how_to: { type: 'string' },
    intro: { type: 'string' },
    examples: { type: 'array', items: said },
    notice: { type: 'string' },
    practice: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { ask: line, answer: line }, required: ['ask', 'answer'] } },
    town: { type: 'object', additionalProperties: false, properties: { who: { type: 'string' }, where: { type: 'string' }, it: { type: 'string' }, en: { type: 'string' } }, required: ['who', 'where', 'it', 'en'] },
  },
  required: ['title', 'how_to', 'intro', 'examples', 'notice', 'practice', 'town'],
};

const f = readPromptFile('lesson.md');
const system = fill(f.block('System prompt'), {
  language: language.name,
  country: language.card.country,
  unit: JSON.stringify({ title: unit.title, can_do: unit.can_do, frames: unit.frames, grammar: unit.grammar, common_errors: unit.common_errors }, null, 1),
  studyFile: learner.studyFile.map((n: string) => `- ${n}`).join('\n'),
  people: [...people].map(([id, p]) => `- ${p.name} (id ${id}): ${p.role}, ${p.place}, ${p.city}`).join('\n'),
});
const t0 = Date.now();
const r = await anthropic.messages.create({
  model: CLAUDE_MODEL,
  max_tokens: 4000,
  system,
  messages: [{ role: 'user', content: 'Write the lesson.' }],
  output_config: { format: { type: 'json_schema', schema } },
} as any);
const lesson = JSON.parse(replyText(r));
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'lesson.json'), JSON.stringify({ unit: unit.id, prompt: f.version, lesson, people: Object.fromEntries(people) }, null, 2));
console.error(`lesson written in ${((Date.now() - t0) / 1000).toFixed(1)} s (prompt ${f.version})`);

// Each line in its speaker's voice: the people the learner knows, Magda for the rest
const voice = getVoiceProvider('elevenlabs');
let n = 0;
async function say(who: string, text: string): Promise<string> {
  const file = `${String(++n).padStart(2, '0')}.mp3`;
  const res = await voice.synthesize({ text, language: language.code, voice: voiceForCharacter(who), speed: 0.9, characterId: who });
  if (!res.audio) throw new Error(`no audio for ${who}: ${text}`);
  writeFileSync(join(out, file), res.audio);
  return file;
}
const audio = {
  examples: await Promise.all(lesson.examples.map((e: { who: string; it: string }) => say(e.who, e.it))),
  practice: await Promise.all(lesson.practice.map(async (p: { ask: { it: string }; answer: { it: string } }) => ({ ask: await say(tutor.id, p.ask.it), answer: await say(tutor.id, p.answer.it) }))),
  town: await say(tutor.id, lesson.town.it),
};
writeFileSync(join(out, 'lesson.json'), JSON.stringify({ unit: unit.id, prompt: f.version, lesson, audio, people: Object.fromEntries(people) }, null, 2));
console.log(JSON.stringify(lesson, null, 2));
