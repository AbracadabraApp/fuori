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
  /** A Beginner step's mix where this country's differs from the shared settings (lib/dialogue/pieces.ts → SETTINGS), by step number. Italy's step 4 measured level with step 3 at the shared setting (51% each), so more of its sentences are said bare (Josh, 2026-11-15: "italy 4 could mix more") */
  stepSettings: { 4: { ways: { echo: 0.3, bare: 0.7 }, last: 'echo' as const } },
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
      destination: 'Destinazione', // departures board: the column of city names
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
    levelUp: { theme: 'awning' as const, kicker: "You're doing great with {name}", headline: 'Ready for more?', how: 'How {name} talks to you', now: 'Now', next: 'Next step', play: 'Play', answers: 'Your answers: still two to choose from, and now you can say your own.', yes: 'Sì, più italiano!', yesLabel: 'Yes, more Italian', notYet: 'Not yet',
      /** The line under the cards, by the step being offered: what changes there (lib/dialogue/pieces.ts → SETTINGS). `answers` above is the fallback */
      steps: {
        2: 'Next: each sentence in Italian, then in English.',
        3: 'Next: more of each sentence in Italian, with the key words in English.',
        4: 'Next: some sentences in Italian only. The question still comes with its English.',
        5: 'Next: Italian only, except the question.',
        6: 'Next: all in Italian, and no answers to choose from. English is there whenever you ask.',
      },
      /** The offer that moves the level (D34, D35; lib/level-up.ts → moveFrom): the next card's label and the line under the cards */
      to: {
        intermediate: { next: 'Intermediate', answers: 'Intermediate: no answers to choose from. You say it your own way, in Italian, and English is there whenever you ask.' },
        advanced: { next: 'Advanced', answers: 'Advanced: everyone talks to you as someone who speaks Italian well.' },
      } },
  },
};
