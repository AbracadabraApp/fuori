/**
 * Language data for Mexican Spanish. Code reads language-specific words from
 * here (see "Keeping other languages possible" in docs/05-architecture.md).
 */
export const language = {
  code: 'es',
  name: 'Spanish',
  speechLang: 'es-MX',
  /** The country's clock, for the day of the week and the month characters know (lib/today.ts) */
  timeZone: 'America/Mexico_City',

  /** The app's name in this country (lead candidate, docs/mexico-version.md) */
  appName: 'Afuera',

  /** The country's card in the app's country choice and Settings: name and
   *  line in English (app chrome). Picture: public/images/es-mx/country/es-mx.jpg
   *  (from design/country-cards/) */
  card: { country: 'Mexico', learn: 'Learn Mexican Spanish' },

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
      board: 'Súbete', // tú, like Italy's "Sali" and "¿A dónde quieres ir?" (2026-11-05)
    },
    whereTo: '¿A dónde quieres ir?', // departures board title
    letsDoIt: '¡Sí, va!', // Learn home: the Lessons card's button (canvas "Learn area", D3)
    howToSay: 'Cómo se dice:', // say it in English: the label on what the learner said
    /** Flashcards (docs/flashcards.md → The banner and help): each stage's instruction, shown, not spoken */
    cards: { repeat: "Repite", howDoYouSay: "¿Cómo se dice?", whatIsIt: "¿Qué es?" },
    /** Visit stamps on place and city cards (docs/visited-badge.md): the stamp's words, then the English label under it */
    stamp: { visited: 'ya fuiste', regular: 'de casa', visitedLabel: 'Visited', regularLabel: 'Regular' },
    /** A lesson's buttons (lib/lesson.ts): after Magda teaches, between practice scenes, back to her review, at the end; the English for VoiceOver's hint */
    lesson: { go: '¡Vámonos!', next: 'Siguiente', back: 'Con Magda', done: '¡Listo!', goLabel: "Let's go", nextLabel: 'Next', backLabel: 'Back to Magda', doneLabel: 'Done' },
    youAreHere: 'Estás aquí', // departures board: the current city
  },
};
