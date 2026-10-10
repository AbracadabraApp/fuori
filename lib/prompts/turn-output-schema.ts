/**
 * JSON schema for Claude's structured output in /api/turn.
 * Structured outputs require additionalProperties: false on every object and
 * don't support length limits (maxLength, maxItems); /api/turn enforces those
 * after parsing. Checked by `npm run test:schema`.
 */
export const turnOutputJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    understood: {
      type: 'string',
      description: 'The Italian the character understood the learner to mean',
    },
    it: {
      type: 'string',
      description: "The character's reply in Italian",
    },
    en: {
      type: 'string',
      description: 'English translation of the reply',
    },
    correction: {
      anyOf: [{ type: 'null' }, {
      type: 'object',
      additionalProperties: false,
      properties: {
        said: {
          type: 'string',
          description: 'What the learner said incorrectly',
        },
        better: {
          type: 'string',
          description: 'The correct way to say it',
        },
        why: {
          type: 'string',
          description: 'Brief explanation (under 100 chars)',
        },
      },
      required: ['said', 'better', 'why'],
      }],
      description: 'Correction if there was a real error worth noting',
    },
    words: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          it: {
            type: 'string',
            description: 'Italian word',
          },
          en: {
            type: 'string',
            description: 'English translation',
          },
        },
        required: ['it', 'en'],
      },
      description: 'New vocabulary words introduced (max 2)',
    },
    steps_done: {
      type: 'array',
      items: {
        type: 'number',
      },
      description: 'Goal step indices completed in this turn',
    },
    hint: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'Suggested phrase the learner could say next (only when confused or stuck)',
    },
    confused: {
      type: 'boolean',
      description: 'True only if you genuinely cannot understand what they meant',
    },
    mood: {
      type: 'string',
      enum: ['warm', 'amused', 'busy', 'curious'],
      description: 'Your emotional tone in this reply',
    },
    scene_over: {
      type: 'boolean',
      description: 'True if this is a natural ending point for the conversation',
    },
    memory_notes: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Facts about the learner worth remembering for future conversations',
    },
  },
  required: [
    'understood',
    'it',
    'en',
    'correction',
    'words',
    'steps_done',
    'hint',
    'confused',
    'mood',
    'scene_over',
    'memory_notes',
  ],
};
