/**
 * Lessons made ahead from the syllabus, one per step (docs/teach-plan.md →
 * Lessons and missions; prompt content/<country>/prompts/lesson-steps.md).
 * Writes content/<country>/lessons.json, for review before the app uses it.
 *
 *   npx tsx --env-file=.env.local scripts/make-lessons.mts a1-01 a1-02 …   (COUNTRY=es-mx for Mexico)
 *
 * Units already in lessons.json are kept unless named again.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { language, pack } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';

const ids = process.argv.slice(2);
if (!ids.length) throw new Error('name the units: a1-01 a1-02 …');
const dir = join('content', pack.id);
const syllabus = JSON.parse(readFileSync(join(dir, 'syllabus.json'), 'utf8'));
const out = join(dir, 'lessons.json');
const all: { version: string; units: Record<string, unknown> } = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : { version: '', units: {} };

const line = { type: 'object', additionalProperties: false, properties: { it: { type: 'string' }, en: { type: 'string' } }, required: ['it', 'en'] };
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          how_to: { type: 'string' },
          intro: { type: 'string' },
          examples: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { role: { type: 'string' }, place: { type: 'string' }, it: { type: 'string' }, en: { type: 'string' } }, required: ['role', 'place', 'it', 'en'] } },
          notice: { type: 'string' },
          context: { type: 'string' },
          practice: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { ask: line, answer: line }, required: ['ask', 'answer'] } },
          mission: { type: 'object', additionalProperties: false, properties: { place: { type: 'string' }, goal: { type: 'string' }, say: line, listen_for: { type: 'array', items: { type: 'string' } } }, required: ['place', 'goal', 'say', 'listen_for'] },
        },
        required: ['title', 'how_to', 'intro', 'examples', 'notice', 'context', 'practice', 'mission'],
      },
    },
  },
  required: ['steps'],
};

const f = readPromptFile('lesson-steps.md');
const system = fill(f.block('System prompt'), { language: language.name, country: language.card.country });
for (const id of ids) {
  const unit = syllabus.units.find((u: { id: string }) => u.id === id);
  if (!unit) throw new Error(`no unit ${id}`);
  const t0 = Date.now();
  const r = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: JSON.stringify({ id: unit.id, title: unit.title, can_do: unit.can_do, frames: unit.frames, model_exchanges: unit.model_exchanges, grammar: unit.grammar, common_errors: unit.common_errors, culture: unit.culture, situations: unit.situations }, null, 1) }],
    output_config: { format: { type: 'json_schema', schema } },
  } as any);
  const res = JSON.parse(replyText(r));
  all.units[id] = { title: unit.title, steps: res.steps.map((s: object, i: number) => ({ id: `${id}-${i + 1}`, ...s })) };
  console.log(`${id}: ${res.steps.length} steps (${((Date.now() - t0) / 1000).toFixed(0)} s): ${res.steps.map((s: { title: string }) => s.title).join(' · ')}`);
}
all.version = f.version;
writeFileSync(out, JSON.stringify(all, null, 2) + '\n');
