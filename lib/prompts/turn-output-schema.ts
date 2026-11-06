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

/** What ends a conversation: their goodbye, said back (docs/beginner-scaffolding.md 11b; Josh, 2026-11-06, Beto) */
export const doneField = {
  type: 'boolean',
  description: 'True only when this reply ends the conversation: they have said goodbye and you say goodbye back',
};

/** An ordinary conversation's reply: the line, its English, and whether it ends here */
export const turnOutputWithDoneJsonSchema = {
  ...turnOutputJsonSchema,
  properties: { ...turnOutputJsonSchema.properties, done: doneField },
  required: ['line', 'en', 'done'],
};
