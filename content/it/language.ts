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

  /** The country's card in the app's country choice and Settings: name and
   *  line in English (app chrome). Picture: public/images/country/it.jpg
   *  (from design/country-cards/) */
  card: { country: 'Italy', learn: 'Learn Italian' },

  /** How people address each other: the words for formal and informal */
  formality: { formal: 'Lei', informal: 'tu' },

  /** Interface words */
  ui: {
    showMore: 'Mostra altro', // under the city and place feeds
    /** The ticket at the station (app/components/Ticket.tsx) */
    ticket: {
      vehicle: 'train' as const,
      carrier: 'Ferrovie', // generic word, not a company name
      service: 'Regionale · 2ª classe',
      platform: 'Binario',
      seat: 'Posto',
      fareLabel: 'Tariffa',
      fare: 'Solo andata',
      board: 'Sali',
    },
    whereTo: 'Dove vuoi andare?', // departures board title
    youAreHere: 'Sei qui', // departures board: the current city
  },
};
