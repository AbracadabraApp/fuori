/**
 * JSON schema for Claude's structured output in /api/turn.
 * M1 uses a radically simple output: what the character says (`it`, named for
 * the language code) and its English translation.
 * Everything else (corrections, help, mood) happens naturally in conversation.
 */
export const turnOutputJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    it: {
      type: 'string',
      description: "What the character says, in the language the person is learning",
    },
    en: {
      type: 'string',
      description: 'English translation of the reply',
    },
  },
  required: ['it', 'en'],
};
