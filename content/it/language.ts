/**
 * Language data for Italian. Code reads language-specific words from here
 * (see "Keeping other languages possible" in docs/05-architecture.md).
 */
export const language = {
  code: 'it',
  name: 'Italian',
  speechLang: 'it-IT',
  /** The country's clock, for the day of the week and the month characters know (lib/today.ts) */
  timeZone: 'Europe/Rome',

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
    letsDoIt: 'Sì, dai', // Learn home: the Lessons card's button (canvas "Learn area", D3)
    howToSay: 'Come si dice:', // say it in English: the label on what the learner said
    /** Flashcards (docs/flashcards.md → The banner and help): each stage's instruction, shown, not spoken */
    cards: { repeat: "Ripeti", howDoYouSay: "Come si dice?", whatIsIt: "Che cos'è?" },
    /** Visit stamps on place and city cards (docs/visited-badge.md): the stamp's words, then the English label under it */
    stamp: { visited: 'già visto', regular: 'di casa', visitedLabel: 'Visited', regularLabel: 'Regular' },
    /** A lesson's buttons (lib/lesson.ts): after Magda teaches, between practice scenes, back to her review, at the end; the English for VoiceOver's hint */
    lesson: { go: 'Andiamo!', next: 'Avanti', back: 'Da Magda', done: 'Fatto!', goLabel: "Let's go", nextLabel: 'Next', backLabel: 'Back to Magda', doneLabel: 'Done' },
    youAreHere: 'Sei qui', // departures board: the current city
    /** Level up (sketches/level-up/; lib/level-up.ts): the offer after N conversations; {name} is the character's */
    levelUp: { theme: 'awning' as const, kicker: "You're doing great with {name}", headline: 'Ready for more?', how: 'How {name} talks to you', now: 'Now', next: 'Next step', play: 'Play', answers: 'Your answers: still two to choose from, and now you can say your own.', yes: 'Sì, più italiano!', yesLabel: 'Yes, more Italian', notYet: 'Not yet' },
  },
};
