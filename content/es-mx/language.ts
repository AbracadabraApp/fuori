/**
 * Language data for Mexican Spanish. Code reads language-specific words from
 * here (see "Keeping other languages possible" in docs/05-architecture.md).
 */
export const language = {
  code: 'es',
  name: 'Spanish',
  speechLang: 'es-MX',

  /** The app's name in this country (lead candidate, docs/mexico-version.md) */
  appName: 'Afuera',

  /** How people address each other: the words for formal and informal */
  formality: { formal: 'usted', informal: 'tú' },

  /** Interface words */
  ui: {
    showMore: 'Ver más', // under the city and place feeds
    board: 'Subir', // station: get on the train or bus
    platform: 'Andén', // on the ticket
    whereTo: '¿A dónde quiere ir?', // departures board title
    youAreHere: 'Está aquí', // departures board: the current city
  },
};
