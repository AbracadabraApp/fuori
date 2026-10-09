/**
 * B1 Level - Intermediate (Independent User)
 *
 * Based on CEFR standards and "Profilo della lingua italiana"
 * The threshold of independence. Can handle travel, work, and social
 * situations with confidence. Beginning to use subjunctive mood.
 */

import type { LevelDefinition } from './a1';

export const b1: LevelDefinition = {
  level: 'B1',
  description: 'Intermediate level. Can understand main points of clear standard input on familiar matters. Can deal with most situations while traveling. Can produce simple connected text on familiar topics. Can describe experiences, events, dreams, hopes and give brief explanations.',

  vocabulary: {
    size: '2000-2500 words',  // active vocabulary
    topics: [
      'All A2+ topics (mastered and nuanced)',
      'Work and professional life (detailed)',
      'Abstract concepts (justice, ethics, progress)',
      'Current events and news',
      'Culture and arts',
      'Literature and storytelling',
      'Technology and innovation',
      'Social issues',
      'Personal development',
      'Emotions and psychology (nuanced)',
      'Argument and persuasion',
      'Processes and procedures',
      'History and traditions',
      'Regional and national identity',
    ],
    examples: [
      // Professional
      'carriera', 'contratto', 'colloquio', 'candidato', 'competenza', 'responsabilità', 'incarico', 'obiettivo',
      // Abstract
      'giustizia', 'diritto', 'libertà', 'uguaglianza', 'progresso', 'sviluppo', 'crescita', 'crisi', 'cambiamento',
      // Current events
      'politica', 'governo', 'elezioni', 'legge', 'economia', 'mercato', 'società', 'cultura', 'tradizione',
      // Nuanced emotions
      'delusione', 'speranza', 'paura', 'ansia', 'nostalgia', 'rimpianto', 'orgoglio', 'vergogna', 'invidia',
      // Argument
      'argomento', 'ragione', 'prova', 'esempio', 'conseguenza', 'causa', 'effetto', 'vantaggio', 'svantaggio',
      // Culture
      'opera', 'mostra', 'spettacolo', 'romanzo', 'autore', 'artista', 'patrimonio', 'monumento',
      // Discourse markers
      'innanzitutto', 'anzitutto', 'poi', 'inoltre', 'infine', 'da un lato...dall\'altro', 'non solo...ma anche',
      'nonostante', 'sebbene', 'benché', 'affinché', 'purché', 'a meno che',
      // Opinion expressions
      'a mio parere', 'a dire il vero', 'francamente', 'sinceramente', 'per quanto mi riguarda',
      // Regional/cultural
      'paesino', 'borgo', 'campanile', 'piazza', 'dialetto', 'accento', 'regione', 'provincia',
    ],
  },

  grammar: {
    tenses: [
      'All previous tenses (mastered)',
      'congiuntivo presente (subjunctive present)',
      'congiuntivo passato (subjunctive past)',
      'condizionale passato (conditional perfect)',
    ],
    structures: [
      'All A2+ structures (mastered)',
      'Congiuntivo presente after: penso che, credo che, voglio che, è importante che, bisogna che, etc.',
      'Congiuntivo passato for past opinions and uncertainties',
      'Subjunctive with expressions of doubt, emotion, desire, necessity',
      'Subjunctive vs indicative choice based on certainty',
      'Conditional sentences (type 1 & 2)',
      'Se + congiuntivo imperfetto + condizionale (hypotheticals)',
      'Relative pronouns: il quale, la quale (formal)',
      'Passive voice (all tenses)',
      'Impersonal si (si dice, si fa)',
      'Combined pronouns (all combinations, mastered)',
      'Consecutive tenses (sequence of tenses with subjunctive)',
      'Discourse connectors for coherent paragraphs',
      'Reported speech (basic)',
    ],
    examples: [
      // Subjunctive present
      'Penso che sia importante studiare.', // I think it's important to study
      'Voglio che tu venga con me.', // I want you to come with me
      'È necessario che parliate italiano.', // It's necessary that you speak Italian
      'Dubito che arrivi in orario.', // I doubt he'll arrive on time
      // Subjunctive past
      'Credo che sia già partito.', // I think he has already left
      'Non sapevo che avessi studiato medicina.', // I didn't know you had studied medicine
      // Conditional perfect
      'Avrei voluto venire, ma ero malato.', // I would have liked to come, but I was sick
      'Sarei andato in Italia se avessi avuto soldi.', // I would have gone to Italy if I had had money
      // Conditional sentences
      'Se avessi tempo, verrei con te.', // If I had time, I would come with you
      'Se fossi ricco, comprerei una casa al mare.', // If I were rich, I would buy a house by the sea
      // Passive
      'Il libro è stato scritto nel 1950.', // The book was written in 1950
      'La città fu fondata dai Romani.', // The city was founded by the Romans
      // Impersonal si
      'In Italia si mangia bene.', // In Italy one eats well
      'Si dice che pioverà domani.', // They say it will rain tomorrow
      // Reported speech
      'Ha detto che sarebbe venuto.', // He said he would come
      'Mi ha chiesto se avessi fame.', // He asked me if I was hungry
      // Complex structures
      'Nonostante sia stanco, continuo a lavorare.', // Although I'm tired, I continue working
      'Affinché tu possa capire, te lo spiego meglio.', // So that you can understand, I'll explain it better
      'Purché arrivi in orario, va bene.', // As long as you arrive on time, it's fine
    ],
  },

  situations: {
    canDo: [
      'All A2+ situations (mastered)',
      'Handle most travel situations independently',
      'Participate in work meetings and discussions',
      'Express complex opinions with justification',
      'Narrate stories with detail and color',
      'Discuss current events and news',
      'Explain problems and negotiate solutions',
      'Give presentations on familiar topics',
      'Write coherent texts (emails, letters, essays)',
      'Understand main points of news broadcasts',
      'Participate in group conversations',
      'Express emotions with nuance',
      'Make and respond to arguments',
      'Discuss hypothetical situations',
      'Talk about dreams, hopes, regrets',
      'Understand regional variations in speech',
    ],
    examples: [
      'Work discussion: Penso che dovremmo cambiare strategia perché il mercato è diverso',
      'Storytelling: Quando sono arrivato a Venezia, pioveva. Nonostante il maltempo, la città era bellissima',
      'Hypothetical: Se potessi vivere ovunque, sceglierei una piccola città in Toscana',
      'Opinion: A mio parere, è importante che il governo investa nell\'educazione',
      'Negotiation: Capisco la sua posizione, però penso che dovremmo trovare un compromesso',
      'Expressing regret: Avrei voluto studiare di più quando ero giovane',
      'Complex request: Mi chiedevo se fosse possibile spostare la riunione a domani',
    ],
  },

  speech: {
    sentenceLength: '10-15+ words per sentence',
    complexity: 'Complex sentences with multiple subordinate clauses. Can build extended discourse with clear coherence. Uses varied sentence structures and sophisticated connectors.',
    pace: 'normal to quick',
    pauseFrequency: 'Natural conversational pauses; maintains momentum in extended speech',
    repetition: 'Minimal - assumes comprehension; may reformulate for emphasis or clarification but not for basic understanding',
    supportNeeded: [
      'Clear models of subjunctive usage in context',
      'Explicit triggers for subjunctive (expressions requiring it)',
      'Support for sequence of tenses',
      'Rich discourse markers for native-like flow',
      'Idiomatic expressions integrated naturally',
      'Cultural references explained in Italian',
      'Less scaffolding; more autonomous comprehension expected',
      'Can handle regional accents and vocabulary',
    ],
  },

  regionalisms: {
    amount: 'frequent',
    whenToUse: 'Use regional features naturally according to character background. 3-5 regional features per conversation. Examples: Tuscan gorgia toscana (aspirated c), "un po\'" as "un po\'", "babbo" for padre; Roman "aò", "mo\'", "anvedi", "daje", glottal stops, "famo" instead of "facciamo"; Neapolitan "aggio" (ho), "mo" (adesso), "guagliò" (ragazzo), vowel pronunciation; Northern "ciao belli", vowel sounds, influence from local languages; Sicilian vowel sounds, "picciriddo" (bambino), final vowel changes. Regional foods, traditions, festivals naturally integrated. Regional discourse markers (Tuscan "i\'").',
    notes: 'At B1, learner should embrace regional diversity as part of authentic Italian. Characters can speak with their authentic regional voice while remaining comprehensible. Model code-switching between standard and regional.',
  },

  culturalNotes: {
    pragmatics: [
      'Subjunctive for sophisticated politeness and hedging',
      'Complex disagreement strategies (capisco però...)',
      'Storytelling conventions (c\'era una volta, alla fine)',
      'Italian humor and irony',
      'Formal vs informal register switching',
      'Cultural references (history, literature, cinema)',
      'Understanding gestures as linguistic elements',
      'Social protocols (greetings in different contexts)',
      'Regional pride and identity',
      'Food culture at deep level (regional dishes, traditions)',
      'Understanding of Italian administrative/bureaucratic language (basic)',
    ],
    avoidAtThisLevel: [
      'Literary or archaic language (unless teaching it)',
      'Heavy dialect that would be incomprehensible',
      'Very technical jargon without explanation',
      'Complex philosophical or highly abstract discourse',
    ],
  },

  assessmentCriteria: {
    readyToProgress: [
      'Uses congiuntivo presente correctly with common triggers (70%+ accuracy)',
      'Active vocabulary of 1800+ words',
      'Can tell extended stories with detail and coherence',
      'Participates comfortably in group discussions',
      'Can express and defend complex opinions',
      'Understands main points of standard Italian at natural speed',
      'Uses discourse markers to create coherent extended speech',
      'Self-corrects subjunctive errors',
      'Can handle most social and professional situations',
      'Understands and uses some regional expressions',
      'Switches register appropriately (formal/informal)',
      'Can write coherent multi-paragraph texts',
      'Demonstrates cultural awareness in language use',
    ],
    stillNeeds: [
      'Cannot use subjunctive or avoids it completely',
      'Limited vocabulary (under 1500 words)',
      'Cannot sustain conversation on abstract topics',
      'Struggles with hypothetical situations',
      'Needs very simplified, slow speech',
      'Cannot understand regional variation at all',
      'No awareness of register or formality',
      'Cannot narrate with detail or coherence',
      'Relies heavily on basic structures from A2',
    ],
  },
};

/**
 * Note: B1 to B2 transition
 *
 * B1 to B2 is a significant leap requiring extensive input and production practice.
 * Learner should consume native-level content (films, books, podcasts) while continuing to produce.
 *
 * Focus areas for B2:
 * - Mastery of all subjunctive forms (including imperfect and pluperfect)
 * - Complex conditional sentences (type 3)
 * - Sophisticated vocabulary (4000-5000 words)
 * - Idiomatic fluency
 * - Understand rapid native speech with regional features
 * - Discuss abstract concepts with ease
 * - Write with style and sophistication
 */
