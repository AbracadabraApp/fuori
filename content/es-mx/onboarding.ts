/**
 * Onboarding in Mexico: the woman from the country card greets the learner
 * (docs/onboarding-design.md, agreed with Josh 2026-10-15/16). Her fixed lines
 * are the agreed text, each with its English; the follow-up and the speaker's
 * send-off are written by Claude (content/es-mx/prompts/onboarding.md).
 */
export const onboarding = {
  guide: {
    /** Her id for /v1/speak; she isn't a character in the world */
    id: 'guide',
    /** Camila: warm, inviting Mexican Spanish (voices.ts) */
    voice: 'spPXlKT5a4JMfbhPRAzA',
    /** How far her picture is lifted, as a share of the screen height, so her
     *  face stays clear of the text (design/onboarding/walkthrough.html: 26%) */
    lift: 0.26,
  },
  lines: {
    welcome: { line: '¡Hola, qué gusto conocerte! ¿Hablas algo de español?', en: 'Hi, lovely to meet you! Do you speak any Spanish?' },
    notYet: { line: '¡Todavía no!', en: 'Not yet!' },
    some: { line: 'Sí, pero quiero mejorar', en: 'Yes, but I want to improve' },
    beginnerSendOff: {
      line: '¡Muy bien! Poco a poco. Si necesitas ayuda, nada más pregunta: aquí todos te ayudan.',
      en: 'Great! Little by little. If you need help, just ask: everyone here will help you.',
    },
    go: { line: '¡Vamos!', en: "Let's go!" },
    question: {
      line: '¡Qué padre que ya hables español! Entonces, cuéntame: ¿qué te gusta de México?',
      en: 'How great that you already speak Spanish! So, tell me: what do you like about Mexico?',
    },
    /** Name and address (docs/onboarding-design.md → Name and address): after the first tap. {name} is what Whisper heard */
    askName: { line: '¿Cómo te llamas? Toca el micrófono y dime tu nombre.', en: "What's your name? Tap the microphone and tell me your name." },
    address: {
      line: '¡Mucho gusto, {name}! En español las palabras cambian según el género. ¿Te digo «bienvenida» o «bienvenido»?',
      en: 'Nice to meet you, {name}! In Spanish, words change with gender. Should I say bienvenida (female) or bienvenido (male) to you?',
    },
    asWoman: { line: '¡Bienvenida!', en: 'female' },
    asMan: { line: '¡Bienvenido!', en: 'male' },
    welcomeWoman: { line: '¡Bienvenida, {name}!', en: 'Welcome, {name}!' },
    welcomeMan: { line: '¡Bienvenido, {name}!', en: 'Welcome, {name}!' },
    /** The send-off always ends with this (Claude writes what comes before it) */
    help: { line: 'Si necesitas ayuda, nada más pregunta.', en: 'If you need help, just ask.' },
  },
  /** The orientation tour (docs/orientation-script.md; Josh, 2026-10-23),
   *  steps 1–3 for now: name by mic, masculine or feminine, level. Each card
   *  opens with her line in Spanish and its English, then a note in English
   *  (app chrome; *word* is italic). {name} is the name she picked out */
  orientation: {
    hello: {
      line: '¡Hola! Bienvenidos a Afuera.',
      en: 'Hi! Welcome to Afuera.',
      note: "I'll show you how Afuera works. Tap the green microphone and say your name.",
    },
    askName: { line: '¿Cómo te llamas?', en: "What's your name? Tap the mic" },
    niceToMeet: {
      line: '¡Mucho gusto, {name}!',
      en: 'Nice to meet you, {name}!',
      note: 'Spanish words can be masculine or feminine. Even a welcome changes: *bienvenido* for a man, *bienvenida* for a woman. How should people greet you?',
    },
    /** The two buttons (Josh, 2026-10-23): the word, and Masculine / Feminine under it */
    asMan: { line: 'Bienvenido', en: 'Masculine' },
    asWoman: { line: 'Bienvenida', en: 'Feminine' },
    welcomeMan: { line: 'Gracias. ¡Bienvenido, {name}!', en: 'Thanks. Welcome, {name}!', note: "Now, how much Spanish do you speak? This is how you'd ask someone:" },
    welcomeWoman: { line: 'Gracias. ¡Bienvenida, {name}!', en: 'Thanks. Welcome, {name}!', note: "Now, how much Spanish do you speak? This is how you'd ask someone:" },
    askLevel: { line: '¿Hablas español?', en: 'Do you speak Spanish?' },
    levelSet: { line: '¡Perfecto!', en: 'Perfect!', note: "I'll start you there. You can change it any time in Settings." },
    next: { line: 'Siguiente', en: 'Next' },
    /** Cards 4–7 (Josh, 2026-10-23: 7 cards). Card 4 opens with ¡Perfecto!,
     *  after the level; levelSet stays for builds from before */
    trip: {
      line: '¡Perfecto! Afuera es tu vida en México.',
      en: 'Perfect! Afuera is your life in Mexico.',
      note: "You stay a while, go out and talk to people. No lessons, no scores: you learn by talking, and people help you the way they'd help any newcomer.",
    },
    sayIt: {
      line: '¿No sabes cómo se dice?',
      en: "Don't know how to say it?",
      note: 'Say it in English, and it comes back in Spanish for you to read out loud. Like this:',
    },
    /** Card 5's example, shown as the game shows it: what was said, the line to read */
    sayItExample: { line: 'Estoy aquí unos meses para aprender español.', en: "I'm here for a few months to learn Spanish" },
    help: {
      line: 'Si no entiendes, pregunta.',
      en: "If you don't understand, ask.",
      note: "Everyone here will help you. Just ask, in English: they'll explain, then go back to Spanish.",
    },
    /** Card 6, beside the Learn book (Josh's words) */
    learn: 'After a conversation, this book appears. It reviews what you said in the conversation and helps you keep track of new vocabulary.',
    ready: { line: 'Eso es todo, {name}. ¡Vámonos!', en: "That's everything, {name}. Let's go!", note: "Answer in Spanish if you can, in English if you can't." },
    go: { line: '¡Vámonos!', en: "Let's go!" },
  },
};
