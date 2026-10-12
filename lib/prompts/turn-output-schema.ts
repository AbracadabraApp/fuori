/**
 * JSON schema for Claude's structured output in /api/turn.
 * M1 uses a radically simple output: what the character says (`line`, in the
 * language being learned) and its English translation.
 * Everything else (corrections, help, mood) happens naturally in conversation.
 */
export const turnOutputJsonSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    line: {
      type: 'string',
      description: "What the character says, in the language the person is learning",
    },
    en: {
      type: 'string',
      description: 'English translation of the reply',
    },
  },
  required: ['line', 'en'],
};
