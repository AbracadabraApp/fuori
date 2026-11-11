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

/** The answers the learner can say back, shown as bubbles on their turn (Beginner 2 on the one-line reply, 2026-11-11) */
export const answersField = {
  type: 'array',
  description: 'What they can say back, each in the language they are learning with its English; empty when none were asked for',
  items: {
    additionalProperties: false,
    type: 'object',
    properties: {
      text: { type: 'string', description: 'What they can say, in the language they are learning' },
      en: { type: 'string', description: 'Its English' },
    },
    required: ['text', 'en'],
  },
};

/** Beginner 2, cluster 1: the one-line reply with the answers to say back after it (line first, so the voice starts early as usual) */
export const turnOutputWithAnswersJsonSchema = {
  ...turnOutputJsonSchema,
  properties: { ...turnOutputJsonSchema.properties, answers: answersField, done: doneField },
  required: ['line', 'en', 'answers', 'done'],
};
