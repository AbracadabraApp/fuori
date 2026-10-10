/**
 * JSON schema for Claude's structured output in /api/turn.
 * M1 uses a radically simple output: just Italian and English.
 * Everything else (corrections, help, mood) happens naturally in conversation.
 */
export const turnOutputJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    it: {
      type: 'string',
      description: "The character's reply in Italian",
    },
    en: {
      type: 'string',
      description: 'English translation of the reply',
    },
  },
  required: ['it', 'en'],
};
