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
      line: '¡Qué padre que ya hables español! Entonces, cuéntame: ¿qué te gusta de México? Toca el micrófono para hablar.',
      en: 'How great that you already speak Spanish! So, tell me: what do you like about Mexico? Tap the microphone to talk.',
    },
    /** The send-off always ends with this (Claude writes what comes before it) */
    help: { line: 'Si necesitas ayuda, nada más pregunta.', en: 'If you need help, just ask.' },
  },
};
