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
    board: 'Sali', // station: get on the train or bus
    platform: 'Binario', // on the ticket
    whereTo: 'Dove vuoi andare?', // departures board title
    youAreHere: 'Sei qui', // departures board: the current city
  },
};
