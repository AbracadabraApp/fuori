/**
 * JSON schemas for the greeter's two Claude replies (lib/onboarding.ts):
 * the follow-up is { line, en } like a character's turn; the send-off adds the
 * placement.
 */
export { turnOutputJsonSchema as followUpJsonSchema } from './turn-output-schema';

export const sendOffJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    reason: { type: 'string', description: 'One short line in English on why this level' },
    line: { type: 'string', description: 'Her reply, in the language the person is learning' },
    en: { type: 'string', description: 'English translation of the reply' },
  },
  required: ['level', 'reason', 'line', 'en'],
};
