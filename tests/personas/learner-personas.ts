/**
 * Learner personas for simulated learner testing
 *
 * These personas represent realistic A1 beginners with common mistakes,
 * transcription noise patterns, and different learning backgrounds.
 *
 * Used by the simulated learner test suite (npm run test:learner) to validate
 * that the conversation engine handles real beginner behavior correctly.
 */

export interface LearnerPersona {
  id: string;
  name: string;
  description: string;
  commonMistakes: string[];
  transcriptionNoisePatterns: { spoken: string; whisperOutput: string }[];
  level: 'A1';
  nativeLanguage: string;
}

/**
 * English speaker - classic beginner mistakes
 *
 * Typical patterns:
 * - Uses "voglio" (I want) instead of polite "vorrei" (I would like)
 * - Confuses article genders (la/il)
 * - Mixes up essere/avere (io sono fame instead of ho fame)
 * - Pronounces Italian words with English phonetics
 */
export const englishSpeakerPersona: LearnerPersona = {
  id: 'english-speaker',
  name: 'Sarah (English speaker)',
  description: 'Native English speaker, no Romance language background. Tends to be direct and use command forms. Struggles with gendered articles and false friends.',
  level: 'A1',
  nativeLanguage: 'English',

  commonMistakes: [
    // Directness - using voglio instead of vorrei
    'voglio un cappuccino',
    'voglio andare',
    'voglio questo',

    // Article gender confusion
    'la cappuccino',
    'il pizza',
    'la gelato',
    'il pasta',

    // Essere/avere confusion
    'io sono fame',
    'io sono sete',
    'io sono freddo',

    // Wrong verb forms
    'io va',
    'tu è',
    'noi è',

    // Mixing English words
    'vorrei one cappuccino',
    'quanto costa this?',
    'mi piace the gelato',

    // False friends / direct translation
    'io sono caldo', // (trying to say "I am hot" but sounds sexual)
    'attualmente io lavoro', // (means "currently" not "actually")
  ],

  transcriptionNoisePatterns: [
    // Greetings with English pronunciation
    { spoken: 'buongiorno', whisperOutput: 'bone journal' },
    { spoken: 'buongiorno', whisperOutput: 'buon journal' },
    { spoken: 'buonasera', whisperOutput: 'bona sera' },
    { spoken: 'arrivederci', whisperOutput: 'arriva derci' },
    { spoken: 'prego', whisperOutput: 'praygo' },

    // Common phrases with American accent
    { spoken: 'vorrei', whisperOutput: 'voray' },
    { spoken: 'vorrei', whisperOutput: 'vorray' },
    { spoken: 'grazie', whisperOutput: 'grazzy' },
    { spoken: 'per favore', whisperOutput: 'pair favore' },

    // Food/drink items
    { spoken: 'cappuccino', whisperOutput: 'capuchino' },
    { spoken: 'cornetto', whisperOutput: 'cornetta' },
    { spoken: 'cornetto', whisperOutput: 'corneta' },
    { spoken: 'tramezzino', whisperOutput: 'tramezino' },

    // Questions
    { spoken: 'quanto costa', whisperOutput: 'quando costa' },
    { spoken: 'quanto costa', whisperOutput: 'quanta costa' },
    { spoken: 'dov\'è', whisperOutput: 'dove' },
    { spoken: 'come si dice', whisperOutput: 'come si dis' },
    { spoken: 'come si dice', whisperOutput: 'comesi dice' },

    // Numbers with English pronunciation
    { spoken: 'cinque', whisperOutput: 'chinkway' },
    { spoken: 'due', whisperOutput: 'doo-ay' },
    { spoken: 'tre euro', whisperOutput: 'tray euro' },
  ],
};

/**
 * Spanish speaker - has Romance language advantage but makes false friend mistakes
 *
 * Typical patterns:
 * - Generally better with gender and verb conjugation
 * - But makes Spanish-Italian false friend errors
 * - Uses Spanish words when Italian word is forgotten
 * - More confident, sometimes too fast
 */
export const spanishSpeakerPersona: LearnerPersona = {
  id: 'spanish-speaker',
  name: 'Carlos (Spanish speaker)',
  description: 'Native Spanish speaker. Has advantage with grammar structure and gender but makes false friend mistakes. Sometimes slips Spanish words into Italian sentences.',
  level: 'A1',
  nativeLanguage: 'Spanish',

  commonMistakes: [
    // False friends (Spanish words that are different in Italian)
    'estoy bene', // (Spanish "estoy" instead of Italian "sto")
    'io soy Carlos', // (Spanish "soy" instead of Italian "sono")
    'quiero un caffè', // (Spanish "quiero" instead of Italian "voglio/vorrei")
    'muchas grazie', // (Spanish "muchas" instead of Italian "molte")

    // Spanish words slipping in
    'vorrei agua', // (Spanish "agua" instead of Italian "acqua")
    'mi nombre è Carlos', // (Spanish "nombre" instead of Italian "nome")
    'quanto cuesta', // (Spanish "cuesta" instead of Italian "costa")

    // Italian words with Spanish pronunciation/spelling patterns
    'buonos días', // (mixing Italian "buon" with Spanish "días")
    'arrivederchi', // (close to Italian but not quite)

    // Over-applying Spanish rules
    'io estudio italiano', // (Spanish verb form)
    'la leche', // (Spanish "leche" instead of Italian "latte")
    'un cosa', // (wrong gender - Spanish "cosa" is feminine)
  ],

  transcriptionNoisePatterns: [
    // Spanish words captured instead of Italian
    { spoken: 'sto bene', whisperOutput: 'estoy bene' },
    { spoken: 'vorrei', whisperOutput: 'quiero' },
    { spoken: 'acqua', whisperOutput: 'agua' },
    { spoken: 'costa', whisperOutput: 'cuesta' },
    { spoken: 'nome', whisperOutput: 'nombre' },

    // Spanish pronunciation of Italian words
    { spoken: 'grazie', whisperOutput: 'grazias' },
    { spoken: 'buongiorno', whisperOutput: 'buonos giorno' },
    { spoken: 'prego', whisperOutput: 'prego' }, // (actually correct but with Spanish 'r')

    // Mixed Spanish-Italian
    { spoken: 'mi chiamo', whisperOutput: 'mi chiamo' }, // (often correct)
    { spoken: 'quanto costa', whisperOutput: 'quanto cuesta' },
    { spoken: 'per favore', whisperOutput: 'por favor' },

    // Italian words with Spanish false friends
    { spoken: 'sono', whisperOutput: 'soy' },
    { spoken: 'sto', whisperOutput: 'estoy' },
  ],
};

/**
 * Hesitant beginner - lacks confidence, speaks slowly with many pauses
 *
 * Typical patterns:
 * - Long pauses mid-sentence
 * - Self-corrections
 * - Incomplete sentences
 * - Asking for help frequently
 * - Mixing Italian with English when stuck
 */
export const hesitantBeginnerPersona: LearnerPersona = {
  id: 'hesitant-beginner',
  name: 'Emma (hesitant beginner)',
  description: 'Anxious beginner, speaks very slowly with many pauses and self-corrections. Frequently switches to English when stuck. Lacks confidence but tries hard.',
  level: 'A1',
  nativeLanguage: 'English',

  commonMistakes: [
    // Incomplete sentences / trailing off
    'vorrei un...',
    'io sono... eh...',
    'mi chiamo... wait...',

    // Self-corrections mid-sentence
    'la... no... il cappuccino',
    'voglio... vorrei un caffè',
    'io è... sono... italiano',

    // Asking for help in English
    'come si dice "coffee"?',
    'how do you say water?',
    'I don\'t know the word',
    'what is the word for...?',

    // Mixing Italian and English
    'vorrei un coffee',
    'grazie... thank you',
    'io sono... I am... from America',
    'mi piace the food',

    // Simple word order errors
    'un caffè vorrei',
    'bene sto',
    'Emma mi chiamo',

    // Dropping articles entirely
    'vorrei cappuccino', // (missing "un")
    'mi piace gelato', // (missing "il")
    'sono studente', // (missing "uno/una")
  ],

  transcriptionNoisePatterns: [
    // Pauses captured as partial words
    { spoken: 'vorrei un...', whisperOutput: 'vorrei un' },
    { spoken: 'buon... giorno', whisperOutput: 'buon giorno' },
    { spoken: 'mi... chiamo', whisperOutput: 'mi chiamo' },

    // Self-corrections captured
    { spoken: 'la... il cappuccino', whisperOutput: 'la il cappuccino' },
    { spoken: 'voglio... vorrei', whisperOutput: 'voglio vorrei' },

    // Hesitant pronunciation
    { spoken: 'grazie', whisperOutput: 'graz... grazie' },
    { spoken: 'buongiorno', whisperOutput: 'buon... giorno' },
    { spoken: 'per favore', whisperOutput: 'per... favore' },

    // Very slow/uncertain pronunciation may be misheard
    { spoken: 'vorrei', whisperOutput: 'vo... vorrei' },
    { spoken: 'cappuccino', whisperOutput: 'cappu... ccino' },
    { spoken: 'quanto costa', whisperOutput: 'quanto... costa' },

    // Mixing languages captured
    { spoken: 'vorrei coffee', whisperOutput: 'vorrei coffee' },
    { spoken: 'grazie thank you', whisperOutput: 'grazie thank you' },
  ],
};

/**
 * Confident but wrong - speaks boldly but makes systematic errors
 *
 * Typical patterns:
 * - No hesitation but incorrect grammar
 * - Over-generalizes rules
 * - Mispronounces with confidence
 * - Makes gender errors consistently
 * - Doesn't self-correct
 */
export const confidentButWrongPersona: LearnerPersona = {
  id: 'confident-but-wrong',
  name: 'Jake (confident but wrong)',
  description: 'Confident beginner who speaks boldly but makes systematic errors. Over-applies rules, consistent gender mistakes, strong English accent. Doesn\'t realize when wrong.',
  level: 'A1',
  nativeLanguage: 'English',

  commonMistakes: [
    // Systematic gender errors (picks one and sticks with it)
    'il pizza',
    'il birra',
    'il pasta',
    'la cappuccino',
    'la vino',
    'la pane',

    // Over-regularizing verbs
    'io ando', // (regularizing "andare" incorrectly)
    'tu fai', // (should be different context)
    'loro sonto', // (invented form of "sono")
    'io vengo here', // (mixing)

    // Wrong but confident word order
    'io voglio molto gelato',
    'la grande pizza',
    'un rosso vino',

    // Using wrong form with confidence
    'voglio un caffè', // (should be "vorrei" but says it confidently)
    'io sono venti anni', // (wrong - should be "ho")
    'mi piace molto the cappuccino',

    // Consistent pronunciation errors
    'buonJORno', // (wrong stress)
    'graZIE mille', // (wrong stress)
    'capPUCCino', // (wrong stress)
  ],

  transcriptionNoisePatterns: [
    // Mispronounced with strong accent but clearly
    { spoken: 'buongiorno', whisperOutput: 'bwonJORno' },
    { spoken: 'buongiorno', whisperOutput: 'bongiorno' },
    { spoken: 'grazie', whisperOutput: 'GRAT-zee' },
    { spoken: 'cappuccino', whisperOutput: 'kapputSEEno' },

    // Wrong stress but confident delivery captured clearly
    { spoken: 'prego', whisperOutput: 'PREgo' }, // (should be second syllable)
    { spoken: 'cornetto', whisperOutput: 'corNETto' },
    { spoken: 'vorrei', whisperOutput: 'VORrei' },

    // Over-articulated/Americanized
    { spoken: 'arrivederci', whisperOutput: 'ah-ree-veh-DER-chee' },
    { spoken: 'per favore', whisperOutput: 'pear fah-VOR-ay' },
    { spoken: 'quanto costa', whisperOutput: 'KWAN-toe KOS-tah' },

    // Common substitutions with confident delivery
    { spoken: 'acqua', whisperOutput: 'aqua' },
    { spoken: 'questo', whisperOutput: 'questo' }, // (actually right)
    { spoken: 'cosa', whisperOutput: 'kosa' },
    { spoken: 'subito', whisperOutput: 'soobeeto' },
  ],
};

/**
 * All personas in an array for easy iteration in tests
 */
export const allPersonas: LearnerPersona[] = [
  englishSpeakerPersona,
  spanishSpeakerPersona,
  hesitantBeginnerPersona,
  confidentButWrongPersona,
];

/**
 * Helper to get a persona by ID
 */
export function getPersonaById(id: string): LearnerPersona | undefined {
  return allPersonas.find(p => p.id === id);
}

/**
 * Helper to get random transcription noise for a persona
 */
export function getRandomTranscriptionNoise(
  persona: LearnerPersona,
  count: number = 3
): Array<{ spoken: string; whisperOutput: string }> {
  const patterns = persona.transcriptionNoisePatterns;
  const shuffled = [...patterns].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Helper to get random common mistakes for a persona
 */
export function getRandomMistakes(
  persona: LearnerPersona,
  count: number = 5
): string[] {
  const mistakes = persona.commonMistakes;
  const shuffled = [...mistakes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
