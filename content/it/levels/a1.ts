/**
 * A1 Level - Absolute Beginner
 *
 * Based on CEFR standards and "Profilo della lingua italiana"
 * Reference: De Mauro's "vocabolario fondamentale" (FO) subset
 */

export const a1 = {
  level: 'A1',
  description: 'Absolute beginner. Can understand and use familiar everyday expressions and very basic phrases. Can introduce themselves and ask basic questions about personal details.',

  vocabulary: {
    size: '400-600 words',  // active vocabulary
    topics: [
      'Greetings and introductions',
      'Numbers (0-100)',
      'Days of the week, months',
      'Family members (immediate family)',
      'Colors',
      'Basic food and drinks',
      'Common objects in the home',
      'Basic verbs (essere, avere, fare, andare, venire)',
      'Simple adjectives (bello, brutto, grande, piccolo)',
      'Basic prepositions (in, a, di, da, con)',
    ],
    examples: [
      // Greetings
      'ciao', 'buongiorno', 'buonasera', 'arrivederci', 'per favore', 'grazie', 'prego', 'scusa',
      // Essential verbs
      'sono', 'ho', 'è', 'hai', 'va bene', 'va', 'vado', 'viene', 'vengo',
      // Family
      'madre', 'padre', 'fratello', 'sorella', 'figlio', 'figlia', 'famiglia',
      // Food basics
      'acqua', 'caffè', 'pane', 'pasta', 'pizza', 'gelato', 'vino', 'birra',
      // Common words
      'casa', 'lavoro', 'città', 'nome', 'anno', 'giorno', 'tempo', 'cosa',
      // Numbers
      'uno', 'due', 'tre', 'quattro', 'cinque', 'dieci', 'venti', 'cento',
      // Question words
      'chi', 'cosa', 'dove', 'quando', 'come', 'perché', 'quanto',
    ],
  },

  grammar: {
    tenses: [
      'presente (present tense only)',
    ],
    structures: [
      'Subject pronouns (io, tu, lui/lei, noi, voi, loro)',
      'Essere and avere conjugation',
      'Regular verbs: -are, -ere, -ire (pattern 1)',
      'Articles: definite (il, la, i, le) and indefinite (un, una)',
      'Noun gender (masculine/feminine)',
      'Basic adjective agreement',
      'Simple negation with "non"',
      'Basic questions with intonation',
      'Question words (dove, quando, chi, cosa)',
      'Numbers and time expressions',
      'Basic prepositions (a, in, di, da, con)',
    ],
    examples: [
      'Io sono Maria.', // I am Maria
      'Tu sei italiano?', // Are you Italian?
      'Lui ha un fratello.', // He has a brother
      'Noi parliamo italiano.', // We speak Italian
      'Dove abiti?', // Where do you live?
      'Come ti chiami?', // What's your name?
      'Quanti anni hai?', // How old are you?
      'Mi piace il caffè.', // I like coffee
      'Non capisco.', // I don't understand
      'Che ore sono?', // What time is it?
    ],
  },

  situations: {
    canDo: [
      'Introduce yourself (name, age, nationality)',
      'Greet people and say goodbye',
      'Ask and answer simple questions about personal details',
      'Order basic food and drinks at a bar or restaurant',
      'Ask for prices and numbers',
      'Tell the time',
      'Talk about family members',
      'Understand simple instructions',
      'Ask for help with basic phrases ("Non capisco", "Come si dice?")',
      'Fill in simple forms (name, address, nationality)',
    ],
    examples: [
      'At a café: ordering un caffè, per favore',
      'Meeting someone: Mi chiamo Marco. E tu?',
      'Shopping: Quanto costa?',
      'Asking directions: Dov\'è la stazione?',
      'In class: Come si dice "hello" in italiano?',
    ],
  },

  speech: {
    sentenceLength: '3-5 words per sentence',
    complexity: 'Single simple sentences. Subject + verb + object. One idea per sentence. Heavy use of high-frequency words.',
    pace: 'slow',
    pauseFrequency: 'Frequent pauses between sentences. Allow processing time.',
    repetition: 'High - repeat key phrases 2-3 times, using exact same words',
    supportNeeded: [
      'Frequent use of cognates and international words',
      'Visual context or gestures implied',
      'Repetition of same structure multiple times',
      'One concept at a time',
      'Confirmation questions (Capisci? Va bene?)',
      'Simple yes/no questions',
      'Avoid idioms completely',
      'Stick to present tense only',
    ],
  },

  regionalisms: {
    amount: 'none',
    whenToUse: 'Only standard Italian at A1. Regional vocabulary or pronunciation would confuse learners at this level.',
    notes: 'Use "tu" form universally in teaching contexts, though introduce existence of "Lei" formal.',
  },

  culturalNotes: {
    pragmatics: [
      'Use of "ciao" vs "buongiorno/buonasera"',
      'Difference between "per favore" and "per piacere"',
      'When to say "prego" (multiple meanings)',
      'Basic use of "tu" (informal you)',
    ],
    avoidAtThisLevel: [
      'Formal "Lei" conjugations (introduce concept only)',
      'Regional greetings beyond standard',
      'Complex politeness strategies',
      'Idiomatic expressions',
    ],
  },

  assessmentCriteria: {
    readyToProgress: [
      'Can conjugate essere and avere without hesitation',
      'Can form present tense of regular -are verbs',
      'Uses articles correctly 70%+ of the time',
      'Has memorized 300+ high-frequency words',
      'Can sustain a 3-4 turn conversation on familiar topics',
      'Asks clarification questions when confused',
      'Beginning to self-correct basic errors (gender, articles)',
    ],
    stillNeeds: [
      'Frequent prompting for basic vocabulary',
      'Cannot form simple present tense sentences',
      'Confuses masculine/feminine consistently',
      'Cannot ask basic questions (come, dove, quando)',
      'Relies heavily on English/other languages',
    ],
  },
};

export type LevelDefinition = typeof a1;
