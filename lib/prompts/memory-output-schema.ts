/**
 * JSON schema for the end-of-conversation memory call (content/it/prompts/memory.md):
 * the character's notes about the learner, and the review-log entry.
 * Plain object, no imports, so tests/check-turn-schema.mjs can check it too.
 */
const string = { type: 'string' };

export const memoryOutputJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    notes: { type: 'array', items: string, description: 'What the character remembers about the person, short lines' },
    review: {
      additionalProperties: false,
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            additionalProperties: false,
            type: 'object',
            properties: { it: string, en: string, why: string },
            required: ['it', 'en', 'why'],
          },
        },
        mistakes: {
          type: 'array',
          items: {
            additionalProperties: false,
            type: 'object',
            properties: { said: string, better: string, why: string },
            required: ['said', 'better', 'why'],
          },
        },
      },
      required: ['items', 'mistakes'],
    },
  },
  required: ['notes', 'review'],
};
