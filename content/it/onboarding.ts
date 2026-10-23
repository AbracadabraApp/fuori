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
};
