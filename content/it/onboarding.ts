/**
 * Onboarding in Italy: the woman from the country card greets the learner
 * (docs/onboarding-design.md, agreed with Josh 2026-10-15/16). Her fixed lines
 * are the agreed text, each with its English; the follow-up and the speaker's
 * send-off are written by Claude (content/it/prompts/onboarding.md). App words
 * ("Answer in Italian or English", "Press when done") are English chrome in
 * the app, with the language name from language.ts.
 */
export const onboarding = {
  guide: {
    /** Her id for /v1/speak; she isn't a character in the world */
    id: 'guide',
    /** Rossana: warm, conversational, native Italian (voices.ts) */
    voice: 'MuTiG4dbrEGYEy3XP4iP',
    /** How far her picture is lifted, as a share of the screen height, so her
     *  face stays clear of the text (design/onboarding/walkthrough.html: 4%) */
    lift: 0.04,
  },
  lines: {
    welcome: { line: "Ciao, che bello conoscerti! Parli un po' d'italiano?", en: 'Hi, lovely to meet you! Do you speak any Italian?' },
    notYet: { line: 'Non ancora!', en: 'Not yet!' },
    some: { line: 'Sì, ma voglio migliorare', en: 'Yes, but I want to improve' },
    beginnerSendOff: {
      line: 'Benissimo! Piano piano. Se hai bisogno di aiuto, chiedi pure: qui tutti ti aiutano.',
      en: 'Great! Little by little. If you need help, just ask: everyone here will help you.',
    },
    go: { line: 'Andiamo!', en: "Let's go!" },
    question: {
      line: "Che bello che parli già italiano! Allora, raccontami: cosa ti piace dell'Italia? Tocca il microfono per parlare.",
      en: 'How lovely that you already speak Italian! So, tell me: what do you like about Italy? Tap the microphone to talk.',
    },
    /** Name and address (docs/onboarding-design.md → Name and address): after the first tap. {name} is what Whisper heard */
    askName: { line: 'Come ti chiami? Tocca il microfono e dimmi il tuo nome.', en: "What's your name? Tap the microphone and tell me your name." },
    address: {
      line: 'Piacere, {name}! In italiano le parole cambiano con il genere. Ti dico «benvenuta» o «benvenuto»?',
      en: 'Nice to meet you, {name}! In Italian, words change with gender. Should I say benvenuta (female) or benvenuto (male) to you?',
    },
    asWoman: { line: 'Benvenuta!', en: 'female' },
    asMan: { line: 'Benvenuto!', en: 'male' },
    welcomeWoman: { line: 'Benvenuta, {name}!', en: 'Welcome, {name}!' },
    welcomeMan: { line: 'Benvenuto, {name}!', en: 'Welcome, {name}!' },
    /** The send-off always ends with this (Claude writes what comes before it) */
    help: { line: 'Se hai bisogno di aiuto, chiedi pure a chiunque.', en: 'If you need help, just ask anyone.' },
  },
  /** The orientation tour (docs/orientation-script.md; Josh, 2026-10-23),
   *  steps 1–3 for now: name by mic, masculine or feminine, level. Each card
   *  opens with her line in Italian and its English, then a note in English
   *  (app chrome; *word* is italic). {name} is the name she picked out */
  orientation: {
    hello: {
      line: 'Ciao! Benvenuti a Fuori.',
      en: 'Hi! Welcome to Fuori.',
      note: "I'll show you how Fuori works. Tap the green microphone to say your name. Tap it again to finish.",
    },
    askName: { line: 'Come ti chiami?', en: "What's your name? Tap the mic" },
    niceToMeet: {
      line: 'Piacere, {name}!',
      en: 'Nice to meet you, {name}!',
      note: 'Italian words can be masculine or feminine. Even a welcome changes: *benvenuto* for a man, *benvenuta* for a woman. How should people greet you?',
    },
    /** The two buttons (Josh, 2026-10-23): the word, and Masculine / Feminine under it */
    asMan: { line: 'Benvenuto', en: 'Masculine' },
    asWoman: { line: 'Benvenuta', en: 'Feminine' },
    welcomeMan: { line: 'Grazie. Benvenuto, {name}!', en: 'Thanks. Welcome, {name}!', note: "Now, how much Italian do you speak? This is how you'd ask someone:" },
    welcomeWoman: { line: 'Grazie. Benvenuta, {name}!', en: 'Thanks. Welcome, {name}!', note: "Now, how much Italian do you speak? This is how you'd ask someone:" },
    askLevel: { line: 'Parli italiano?', en: 'Do you speak Italian?' },
    levelSet: { line: 'Perfetto!', en: 'Perfect!', note: "I'll start you there. You can change it any time in Settings." },
    next: { line: 'Avanti', en: 'Next' },
  },
};
