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
  // Leaving in any words counts (Josh's Isidro visit, 2026-11-13: "I must see the dentist", "we must stop", "I must insist
  // we stop" got done: false three times of three on replay; docs/bugs.md B3). The character judges it: any language, no phrase list
  description: 'True only when this reply ends the conversation: they are leaving (they said goodbye, or that they have to go or want to stop, in any words) and you say goodbye back',
};

/** An ordinary conversation's reply: the line, its English, and whether it ends here */
export const turnOutputWithDoneJsonSchema = {
  ...turnOutputJsonSchema,
  properties: { ...turnOutputJsonSchema.properties, done: doneField },
  required: ['line', 'en', 'done'],
};

/** The answers the learner can say back, shown as bubbles on their turn (Beginner 2 on the one-line reply, 2026-11-11) */
// At least one: this schema is used only when the turn asks for answers. "Empty when none were asked for" let the
// character send none about 1 reply in 8 (tests/experiments/empty-answers.mts, 2026-11-13), on the goodbye turn too,
// so the learner had nothing to say back and the visit ran on (docs/bugs.md B1, B3)
export const answersField = {
  type: 'array',
  minItems: 1,
  description: 'What they can say back, each in the language they are learning with its English',
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
