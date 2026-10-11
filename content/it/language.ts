/**
 * Language data for Italian. Code reads language-specific words from here
 * (see "Keeping other languages possible" in docs/05-architecture.md).
 */
export const language = {
  code: 'it',
  name: 'Italian',
  speechLang: 'it-IT',

  /**
   * What a character says when something fails behind the scenes, so the
   * learner stays in the conversation instead of seeing an error screen.
   */
  recovery: {
    tu: {
      didntHear: 'Scusa, non ho sentito bene. Puoi ripetere?',
      lostTrack: 'Scusa, un attimo… puoi ripetere?',
    },
    Lei: {
      didntHear: 'Scusi, non ho sentito bene. Può ripetere?',
      lostTrack: 'Scusi, un attimo… può ripetere?',
    },
  },
};
