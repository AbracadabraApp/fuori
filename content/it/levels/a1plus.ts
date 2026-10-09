/**
 * A1+ Level - Upper Beginner
 *
 * Bridge between A1 and A2. Learner has mastered present tense and
 * is beginning to discuss the past and express basic preferences.
 * This is not an official CEFR level but a practical milestone.
 */

import type { LevelDefinition } from './a1';

export const a1plus: LevelDefinition = {
  level: 'A1+',
  description: 'Upper beginner. Confident with present tense, beginning to use past tense (passato prossimo). Can express simple preferences and describe basic routines.',

  vocabulary: {
    size: '700-900 words',  // active vocabulary
    topics: [
      'All A1 topics (consolidated)',
      'Daily routines and time expressions',
      'Weather (basic)',
      'Hobbies and free time activities',
      'Common places in a city',
      'Basic clothing items',
      'Simple adjectives for description',
      'Modal verbs (volere, potere, dovere)',
      'Common past participles',
      'Frequency adverbs (sempre, mai, spesso)',
    ],
    examples: [
      // Time expressions
      'oggi', 'ieri', 'domani', 'stamattina', 'stasera', 'settimana', 'mese',
      // Daily activities
      'mangiare', 'bere', 'dormire', 'lavorare', 'studiare', 'parlare', 'ascoltare', 'guardare',
      // Hobbies
      'leggere', 'scrivere', 'cantare', 'ballare', 'nuotare', 'giocare', 'musica', 'sport',
      // Weather
      'sole', 'pioggia', 'caldo', 'freddo', 'bello', 'brutto', // for weather
      // Modal verbs
      'voglio', 'posso', 'devo', 'vuoi', 'puoi', 'devi',
      // Places
      'ristorante', 'bar', 'supermercato', 'banca', 'ospedale', 'stazione', 'aeroporto', 'centro',
      // Clothing
      'vestito', 'scarpe', 'giacca', 'pantaloni', 'camicia', 'gonna',
      // Common past participles
      'fatto', 'mangiato', 'bevuto', 'andato', 'stato', 'visto', 'parlato',
    ],
  },

  grammar: {
    tenses: [
      'presente (consolidated)',
      'passato prossimo (introduced, focus on regular forms)',
    ],
    structures: [
      'All A1 structures (mastered)',
      'Passato prossimo with avere (regular verbs)',
      'Passato prossimo with essere (common verbs: andare, venire, stare)',
      'Basic past participle agreement with essere',
      'Modal verbs: volere, potere, dovere (present tense)',
      'Mi piace / mi piacciono (expressing preferences)',
      'Reflexive verbs in present (common ones: chiamarsi, alzarsi)',
      'Direct object pronouns (mi, ti, lo, la) - recognition only',
      'Prepositional phrases (a casa, in centro, dal medico)',
      'Time expressions with "fa" (due giorni fa)',
      'Basic comparisons (più...di, meno...di)',
    ],
    examples: [
      'Ho mangiato una pizza.', // I ate a pizza
      'Sono andato al mare.', // I went to the seaside
      'Ieri ho parlato con Maria.', // Yesterday I spoke with Maria
      'Voglio un caffè.', // I want a coffee
      'Posso andare al cinema?', // Can I go to the cinema?
      'Devo studiare italiano.', // I must study Italian
      'Mi piace la pasta.', // I like pasta
      'Mi piacciono i film italiani.', // I like Italian films
      'Mi chiamo Luca.', // My name is Luca (lit: I call myself)
      'Mi alzo alle sette.', // I get up at seven
      'Lavoro dal lunedì al venerdì.', // I work from Monday to Friday
      'È più grande di me.', // It's bigger than me
    ],
  },

  situations: {
    canDo: [
      'All A1 situations (with more confidence)',
      'Describe daily routine in simple terms',
      'Talk about recent past activities (what I did yesterday/last week)',
      'Express wants and needs using modal verbs',
      'Make simple comparisons',
      'Describe basic weather',
      'Talk about hobbies and free time',
      'Ask for permission (posso...?)',
      'Express obligation (devo...)',
      'Understand simple past narratives if spoken slowly',
      'Give basic reasons (perché...)',
    ],
    examples: [
      'Describing your day: Stamattina ho mangiato pane e marmellata',
      'Talking about weekend: Sabato sono andato al cinema',
      'Expressing preferences: Mi piace il gelato al cioccolato',
      'Asking permission: Posso aprire la finestra?',
      'Daily routine: Mi alzo alle sette e faccio colazione',
      'Making plans: Voglio andare in Italia quest\'estate',
    ],
  },

  speech: {
    sentenceLength: '4-7 words per sentence',
    complexity: 'Simple sentences with occasional compound elements. Can connect two ideas with "e" or "ma". Beginning to use subordinate clauses with "perché".',
    pace: 'slow',
    pauseFrequency: 'Regular pauses, but beginning to connect sentences more fluidly',
    repetition: 'Moderate - repeat key phrases but vary structure slightly to show different uses',
    supportNeeded: [
      'Clear models of passato prossimo forms',
      'Frequent review of avere vs essere selection',
      'Visual support for new vocabulary',
      'Explicit statement of time frames (ieri, oggi, domani)',
      'Simple connector words (e, ma, perché)',
      'Confirmation of understanding',
      'Avoid fast speech or blending words',
      'Limited use of idioms (only very common ones like "va bene")',
    ],
  },

  regionalisms: {
    amount: 'minimal',
    whenToUse: 'Can introduce 1-2 very common regional variations if relevant to story context, but always provide standard Italian equivalent. E.g., "Va bene" → Roman "Vabbè" (mention but teach standard); "ragazzo/a" sometimes shortens in speech.',
    notes: 'Primarily expose to standard Italian. Brief mentions of regional variation only for cultural awareness.',
  },

  culturalNotes: {
    pragmatics: [
      'Using "mi piace" for politeness (indirect preferences)',
      'Common expressions: "mamma mia", "va bene", "per carità"',
      'Difference between "buono" and "bello"',
      'Use of "fare" in many expressions (fare colazione, fare una doccia)',
      'Introduction to formal "Lei" (recognition only)',
    ],
    avoidAtThisLevel: [
      'Complex conditionals or subjunctive',
      'Formal register beyond basic "Lei"',
      'Regional dialects (beyond brief mentions)',
      'Proverbs or literary expressions',
    ],
  },

  assessmentCriteria: {
    readyToProgress: [
      'Can comfortably use passato prossimo for regular verbs',
      'Correctly chooses avere vs essere 60%+ of the time',
      'Uses modal verbs (volere, potere, dovere) appropriately',
      'Has active vocabulary of 600+ words',
      'Can describe a simple past event in 3-4 sentences',
      'Beginning to use time expressions naturally (ieri, stamattina)',
      'Self-corrects present vs past tense errors',
      'Asks "come si dice?" for new vocabulary needs',
    ],
    stillNeeds: [
      'Cannot form passato prossimo without heavy prompting',
      'Confuses present and past consistently',
      'Limited vocabulary outside memorized phrases',
      'Cannot express basic wants/needs',
      'Avoids speaking about the past',
      'Relies on present tense for all communication',
    ],
  },
};
