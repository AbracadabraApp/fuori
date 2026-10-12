/**
 * Language data for Italian. Code reads language-specific words from here
 * (see "Keeping other languages possible" in docs/05-architecture.md).
 */
export const language = {
  code: 'it',
  name: 'Italian',
  speechLang: 'it-IT',

  /** The app's name in this country (header, messages) */
  appName: 'Fuori',

  /** How people address each other: the words for formal and informal */
  formality: { formal: 'Lei', informal: 'tu' },

  /** Interface words */
  ui: {
    showMore: 'Mostra altro', // under the city and place feeds
  },
};
