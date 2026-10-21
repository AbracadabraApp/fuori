/**
 * JSON schema for the Learn page (content/<country>/prompts/learn.md,
 * docs/learn.md → The page). The app lays it out: corrections as tap-to-fix
 * buttons, the words as one plain list, then Good to know.
 */
export const learnOutputJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['corrections', 'words', 'goodToKnow'],
  properties: {
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['said', 'why', 'right'],
        properties: {
          said: { type: 'string', description: 'What the learner said (only the part that changes when the fix is small)' },
          why: { type: 'string', description: 'One plain line in English' },
          right: { type: 'string', description: 'The same part said right, in the language only; the character says it aloud' },
        },
      },
    },
    words: {
      type: 'object',
      additionalProperties: false,
      required: ['things', 'doing'],
      properties: {
        things: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['word', 'en', 'plural'],
            properties: {
              word: { type: 'string', description: 'The noun with its article' },
              en: { type: 'string' },
              plural: { type: 'string', description: 'The plural with its article if that is what was said, else empty' },
            },
          },
        },
        doing: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['infinitive', 'en', 'form'],
            properties: {
              infinitive: { type: 'string' },
              en: { type: 'string' },
              form: { type: 'string', description: 'The form used in the conversation, if different from the infinitive, else empty' },
            },
          },
        },
      },
    },
    goodToKnow: { type: 'string', description: 'One cultural or practical point from the scene, or empty' },
  },
};

export interface LearnPage {
  corrections: { said: string; why: string; right: string }[];
  words: { things: { word: string; en: string; plural: string }[]; doing: { infinitive: string; en: string; form: string }[] };
  goodToKnow: string;
}
