/**
 * JSON schema for the conversation quality call (content/it/prompts/quality.md).
 * Plain object, no imports, so tests/check-turn-schema.mjs can check it too.
 */
const count = { type: 'integer' };

export const qualityOutputJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    pronunciationCorrections: count,
    correctionsAsked: count,
    correctionsUnprompted: count,
    garbled: count,
    garbledMissed: count,
    lost: {
      type: 'array',
      items: {
        additionalProperties: false,
        type: 'object',
        properties: { line: count, pulledBack: { type: 'boolean' } },
        required: ['line', 'pulledBack'],
      },
    },
    englishUnasked: count,
    incoherent: count,
    alive: count,
    note: { type: 'string' },
  },
  required: [
    'pronunciationCorrections',
    'correctionsAsked',
    'correctionsUnprompted',
    'garbled',
    'garbledMissed',
    'lost',
    'englishUnasked',
    'incoherent',
    'alive',
    'note',
  ],
};
