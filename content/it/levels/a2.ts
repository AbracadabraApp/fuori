/**
 * A2 Level - Elementary
 *
 * Based on CEFR standards and "Profilo della lingua italiana"
 * Can handle routine tasks and describe experiences in simple terms.
 * The key milestone: mastering the passato prossimo/imperfetto contrast.
 */

import type { LevelDefinition } from './a1';

export const a2: LevelDefinition = {
  level: 'A2',
  description: 'Elementary level. Can understand sentences and frequently used expressions. Can communicate in simple routine tasks. Can describe background and immediate environment.',

  vocabulary: {
    size: '1000-1200 words',  // active vocabulary
    topics: [
      'All A1+ topics (consolidated)',
      'Travel and tourism (hotels, tickets, directions)',
      'Shopping and transactions',
      'Health and body parts',
      'Work and professions',
      'Describing people and things',
      'House and furniture',
      'Transportation',
      'Nature and geography (basic)',
      'Technology (basic - phone, computer)',
      'Emotions and feelings',
      'Quantities and measurements',
    ],
    examples: [
      // Travel
      'viaggio', 'vacanza', 'albergo', 'camera', 'biglietto', 'treno', 'aereo', 'partire', 'arrivare', 'prenotare',
      // Shopping
      'negozio', 'prezzo', 'comprare', 'vendere', 'pagare', 'costare', 'sconto', 'cassa', 'taglia', 'numero',
      // Health
      'salute', 'medico', 'malato', 'febbre', 'male', 'testa', 'mano', 'piede', 'occhio', 'farmacia',
      // Work
      'lavoro', 'ufficio', 'collega', 'capo', 'stipendio', 'riunione', 'progetto', 'professore', 'studente',
      // Descriptors
      'alto', 'basso', 'magro', 'grasso', 'giovane', 'vecchio', 'simpatico', 'gentile', 'intelligente',
      // House
      'appartamento', 'stanza', 'cucina', 'bagno', 'camera da letto', 'letto', 'tavolo', 'sedia', 'finestra',
      // Emotions
      'felice', 'triste', 'arrabbiato', 'stanco', 'contento', 'preoccupato', 'sorpreso',
      // Time/frequency
      'qualche volta', 'spesso', 'raramente', 'sempre', 'mai', 'ancora', 'già', 'prima', 'dopo', 'mentre',
      // Connectors
      'quando', 'se', 'perché', 'quindi', 'però', 'anche', 'invece', 'allora',
    ],
  },

  grammar: {
    tenses: [
      'presente (mastered)',
      'passato prossimo (mastered)',
      'imperfetto (introduced and contrasted with passato prossimo)',
      'futuro semplice (introduced)',
    ],
    structures: [
      'All A1+ structures (mastered)',
      'Imperfetto for descriptions, habits, and ongoing past actions',
      'Contrast: passato prossimo (completed actions) vs imperfetto (background/habitual)',
      'Futuro semplice (regular forms)',
      'Reflexive verbs (common ones: alzarsi, lavarsi, vestirsi, divertirsi)',
      'Direct object pronouns (lo, la, li, le) - active use',
      'Indirect object pronouns (mi, ti, gli, le) - introduced',
      'Ci (there) and ne (of it/them) - basic uses',
      'Prepositions articulated (del, della, dei, delle, dal, dalla, etc.)',
      'Comparatives and superlatives',
      'Imperative (informal tu and noi forms)',
      'Gerund with stare (sto mangiando)',
      'Adverbs of manner (-mente)',
    ],
    examples: [
      // Imperfetto
      'Quando ero piccolo, abitavo a Roma.', // When I was little, I lived in Rome
      'Faceva bel tempo ieri.', // The weather was nice yesterday
      'Andavo sempre al mare in estate.', // I always went to the seaside in summer
      // Contrast
      'Mentre camminavo, ho visto un gatto.', // While I was walking, I saw a cat
      'Ieri pioveva, ma oggi c\'è il sole.', // Yesterday it was raining, but today it's sunny
      // Future
      'Domani andrò al cinema.', // Tomorrow I will go to the cinema
      'La settimana prossima visiterò Firenze.', // Next week I will visit Florence
      // Reflexives
      'Mi alzo alle sette ogni giorno.', // I get up at seven every day
      'Ci siamo divertiti molto.', // We had a lot of fun
      // Pronouns
      'Lo compro domani.', // I'll buy it tomorrow
      'Gli ho dato il libro.', // I gave him the book
      'Ce ne sono tre.', // There are three of them
      // Comparative
      'Roma è più grande di Firenze.', // Rome is bigger than Florence
      'Il film è meno interessante del libro.', // The film is less interesting than the book
      // Imperative
      'Ascolta!', // Listen!
      'Andiamo al bar!', // Let's go to the bar!
      // Gerund
      'Sto leggendo un libro.', // I'm reading a book
      'Stavano mangiando quando sono arrivato.', // They were eating when I arrived
    ],
  },

  situations: {
    canDo: [
      'All A1+ situations (with fluency)',
      'Handle common travel situations (booking hotels, buying tickets)',
      'Describe past experiences with detail (background vs events)',
      'Talk about habitual actions in the past vs now',
      'Make future plans and predictions',
      'Give instructions and directions',
      'Make comparisons between things',
      'Express ongoing actions (I am doing...)',
      'Handle shopping transactions',
      'Describe people and places',
      'Talk about health problems with a doctor',
      'Explain simple work situations',
      'Discuss routines and schedules',
      'Narrate a simple story in the past',
    ],
    examples: [
      'At hotel: Vorrei prenotare una camera per due notti',
      'Narrating: Ieri sono andato al mare. Faceva bel tempo e c\'erano molte persone',
      'Comparing: Questo ristorante è più caro di quello',
      'Shopping: Questa gonna è troppo grande. Avete una taglia più piccola?',
      'Directions: Vai dritto e poi gira a sinistra',
      'Health: Ho mal di testa da stamattina',
      'Childhood: Quando ero bambino, giocavo sempre nel parco',
    ],
  },

  speech: {
    sentenceLength: '6-10 words per sentence',
    complexity: 'Multiple simple sentences connected logically. Can use basic subordinate clauses (quando, perché, se). Beginning to maintain narrative across several sentences.',
    pace: 'slow to normal',
    pauseFrequency: 'Natural pauses between thoughts, but sentences flow better than A1+',
    repetition: 'Moderate - introduce variations of the same concept, model different ways to express similar ideas',
    supportNeeded: [
      'Clear models of imperfetto vs passato prossimo usage',
      'Explicit framing of time and context',
      'Frequent use of connecting words (quando, mentre, perché)',
      'Support for pronoun usage (can be confusing)',
      'Reformulation when introducing new structures',
      'Occasional English cognates for new vocabulary',
      'Confirm understanding of longer narratives',
      'Simple idioms can be introduced with explanation',
    ],
  },

  regionalisms: {
    amount: 'occasional',
    whenToUse: 'Can use 1-2 regional words per conversation if they add authenticity, but always make meaning clear from context or provide standard equivalent. Examples: "Vabbè" (va bene - Roman/informal), "Boh" (non lo so - universal youth), "Ragà" (ragazzi - Roman). Regional foods can be mentioned with explanation. Some pronunciation variation acceptable (gorgia toscana if Tuscan character).',
    notes: 'Primary focus remains standard Italian, but can start exposing learner to the reality that Italians use regional variations. Always ensure comprehensibility.',
  },

  culturalNotes: {
    pragmatics: [
      'Using imperfetto for politeness (volevo dire... - I wanted to say)',
      'Imperative softened with "per favore" or "per piacere"',
      'Use of "magari" (expressing wish)',
      'Common interjections: "mamma mia", "dai", "boh", "vabbè"',
      'Formal "Lei" should be more active now',
      'The "passeggiata" and daily routines',
      'Italian meal times and food culture',
    ],
    avoidAtThisLevel: [
      'Subjunctive mood',
      'Complex conditionals (type 2 & 3)',
      'Passive voice',
      'Heavy dialect',
      'Literary or archaic forms',
      'Complex discourse markers',
    ],
  },

  assessmentCriteria: {
    readyToProgress: [
      'Can reliably distinguish passato prossimo from imperfetto (70%+ accuracy)',
      'Uses reflexive verbs correctly',
      'Active vocabulary of 900+ words',
      'Can tell a simple past story with background and events',
      'Uses direct object pronouns in natural context',
      'Can form and use basic future tense',
      'Handles common travel/shopping situations independently',
      'Beginning to use connecting words naturally (mentre, quando, perché)',
      'Self-corrects tense usage',
      'Asks for clarification in Italian (Cosa significa? Può ripetere?)',
    ],
    stillNeeds: [
      'Cannot distinguish imperfetto from passato prossimo',
      'Avoids using pronouns or uses them incorrectly',
      'Very limited past-tense narration ability',
      'Cannot form future tense',
      'Struggles with basic travel situations',
      'Vocabulary remains under 700 words',
      'Relies on memorized phrases without flexibility',
    ],
  },
};
