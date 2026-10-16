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

  /** The country's card in the app's country choice and Settings: name and
   *  line in English (app chrome), the greeting in the language. Picture:
   *  public/images/es-mx/country/es-mx.jpg (from design/country-cards/) */
  card: { country: 'Mexico', learn: 'Learn Mexican Spanish', greeting: '¡Hola!' },

  /** How people address each other: the words for formal and informal */
  formality: { formal: 'usted', informal: 'tú' },

  /** Interface words */
  ui: {
    showMore: 'Ver más', // under the city and place feeds
    /** The ticket at the bus terminal (app/components/Ticket.tsx) */
    ticket: {
      vehicle: 'bus' as const,
      carrier: 'Autobuses', // generic word, not a company name
      service: 'Primera clase',
      platform: 'Andén',
      seat: 'Asiento',
      fareLabel: 'Boleto',
      fare: 'Sencillo',
      board: 'Subir',
    },
    whereTo: '¿A dónde quiere ir?', // departures board title
    youAreHere: 'Está aquí', // departures board: the current city
  },
};
