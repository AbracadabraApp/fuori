/**
 * A2+ Level - Upper Elementary
 *
 * Bridge between A2 and B1. Learner has mastered past tenses and
 * is developing more complex expression. Beginning to use conditional
 * and express opinions. Not an official CEFR level but a practical milestone.
 */

import type { LevelDefinition } from './a1';

export const a2plus: LevelDefinition = {
  level: 'A2+',
  description: 'Upper elementary. Comfortable with past tenses, beginning to express opinions, hypotheses, and desires. Can handle complications in routine situations.',

  vocabulary: {
    size: '1400-1800 words',  // active vocabulary
    topics: [
      'All A2 topics (consolidated and expanded)',
      'Abstract concepts (happiness, freedom, difficulty)',
      'Opinions and preferences (more nuanced)',
      'Problems and solutions',
      'Environment and nature',
      'Media and entertainment',
      'Relationships and socializing',
      'Education and learning',
      'Cultural events and activities',
      'Politics and society (basic)',
      'Cause and effect',
      'Sequences and processes',
    ],
    examples: [
      // Opinion/abstract
      'opinione', 'idea', 'pensiero', 'importante', 'necessario', 'possibile', 'impossibile', 'difficile', 'facile',
      'problema', 'soluzione', 'situazione', 'esperienza', 'differenza', 'vantaggio', 'svantaggio',
      // Opinions
      'secondo me', 'penso che', 'credo che', 'mi sembra', 'sono d\'accordo', 'non sono d\'accordo',
      // Conditional expressions
      'vorrei', 'dovrei', 'potrei', 'sarebbe', 'avrei',
      // Environment
      'ambiente', 'natura', 'albero', 'fiume', 'montagna', 'mare', 'lago', 'bosco', 'inquinamento',
      // Media
      'notizia', 'giornale', 'televisione', 'programma', 'film', 'serie', 'canzone', 'articolo',
      // Relationships
      'amicizia', 'amore', 'coppia', 'sposarsi', 'litigare', 'conoscere', 'incontrarsi', 'fidanzato/a',
      // Education
      'scuola', 'università', 'corso', 'materia', 'esame', 'laurea', 'imparare', 'insegnare', 'studiare',
      // Connectors/discourse
      'infatti', 'dunque', 'allora', 'inoltre', 'comunque', 'invece', 'perciò', 'quindi', 'cioè',
      // Expressions of likelihood
      'forse', 'probabilmente', 'sicuramente', 'certamente', 'magari', 'chissà',
    ],
  },

  grammar: {
    tenses: [
      'presente (mastered)',
      'passato prossimo (mastered)',
      'imperfetto (mastered)',
      'futuro semplice (consolidated)',
      'condizionale presente (introduced)',
      'trapassato prossimo (introduced)',
    ],
    structures: [
      'All A2 structures (mastered)',
      'Condizionale for polite requests and hypotheticals',
      'Conditional + infinitive constructions (vorrei andare, potresti aiutarmi)',
      'Trapassato prossimo for past before past',
      'Combined object pronouns (me lo, te la, glielo) - basic',
      'Relative pronouns: che, cui (basic uses)',
      'Ci and ne in more contexts',
      'Imperative (formal Lei and negative forms)',
      'Gerund in more contexts',
      'Causative fare (far fare qualcosa)',
      'Stare per + infinitive (about to)',
      'More complex comparisons (tanto...quanto, così...come)',
      'Use of "da" for duration (studio italiano da due anni)',
    ],
    examples: [
      // Conditional
      'Vorrei un caffè, per favore.', // I would like a coffee, please
      'Potresti aiutarmi?', // Could you help me?
      'Sarebbe meglio partire presto.', // It would be better to leave early
      'Al tuo posto, andrei dal medico.', // In your place, I would go to the doctor
      // Trapassato
      'Quando sono arrivato, lei era già partita.', // When I arrived, she had already left
      'Avevo già mangiato quando mi hai chiamato.', // I had already eaten when you called me
      // Combined pronouns
      'Me lo dai?', // Will you give it to me?
      'Glielo ho detto ieri.', // I told him/her (it) yesterday
      'Te la porto domani.', // I'll bring it to you tomorrow
      // Relative pronouns
      'La ragazza che lavora qui è mia sorella.', // The girl who works here is my sister
      'Il libro di cui parliamo è interessante.', // The book we're talking about is interesting
      // Gerund
      'Pur avendo studiato, non ho passato l\'esame.', // Despite having studied, I didn't pass the exam
      'Andando al lavoro, ho visto Mario.', // Going to work, I saw Mario
      // Causative
      'Faccio riparare la macchina.', // I'm having the car repaired
      'Ho fatto pulire la casa.', // I had the house cleaned
      // Stare per
      'Sto per uscire.', // I'm about to leave
      'Stava per piovere.', // It was about to rain
      // Duration with "da"
      'Studio italiano da tre anni.', // I've been studying Italian for three years
      'Aspetto da mezz\'ora.', // I've been waiting for half an hour
    ],
  },

  situations: {
    canDo: [
      'All A2 situations (with confidence and flexibility)',
      'Express and justify opinions',
      'Make polite requests and suggestions',
      'Handle complications in routine situations',
      'Discuss hypothetical situations (Cosa faresti se...?)',
      'Narrate with complex time relationships (before, during, after)',
      'Describe cause and effect',
      'Make complaints politely',
      'Give advice',
      'Discuss advantages and disadvantages',
      'Participate in discussions on familiar topics',
      'Understand main points of clear standard speech',
      'Describe experiences and their impact',
      'Explain plans with contingencies',
    ],
    examples: [
      'Giving advice: Al tuo posto, parlerei con il capo',
      'Complaint: Scusi, ma questo piatto è freddo. Potrebbe scaldarlo?',
      'Opinion: Secondo me, è meglio prendere il treno perché è più veloce',
      'Hypothetical: Se avessi più tempo, viaggerei di più',
      'Complex narrative: Sono arrivato tardi perché avevo perso il treno',
      'Polite request: Le dispiacerebbe aprire la finestra?',
      'Discussion: Sono d\'accordo che l\'ambiente è importante, però...',
    ],
  },

  speech: {
    sentenceLength: '8-12 words per sentence',
    complexity: 'Can produce complex sentences with multiple clauses. Uses subordination and coordination effectively. Beginning to show discourse coherence across paragraphs.',
    pace: 'normal',
    pauseFrequency: 'Natural pauses for thought, but maintains conversational flow',
    repetition: 'Low to moderate - can reformulate and paraphrase; show synonyms and different ways to express ideas',
    supportNeeded: [
      'Models for expressing opinions and hypotheses',
      'Support with combined pronouns (can be tricky)',
      'Reformulation of complex ideas',
      'Some discourse markers (comunque, invece, infatti)',
      'Confirmation when discussing abstract topics',
      'Occasional idioms with explanation',
      'Less hand-holding than A2, more autonomy expected',
    ],
  },

  regionalisms: {
    amount: 'regular',
    whenToUse: 'Can use regional expressions naturally in context (2-3 per conversation), especially informal speech. Examples: Northern "Ciao belli" (vs standard "Ciao ragazzi"); Roman "Aò" (hey), "Anvedi" (look at that); Southern "Mo" (adesso), Naples "Vulimmo" (vogliamo); Universal informal "Boh", "Vabbè", "Mah", "Beh". Regional foods/dishes with explanation. Some pronunciation features of character\'s region acceptable.',
    notes: 'Learner should be able to distinguish standard from regional and ask about differences. Use regional features to build cultural awareness and prepare for B1.',
  },

  culturalNotes: {
    pragmatics: [
      'Complex politeness with conditional (vorrei, potrebbe)',
      'Softening opinions (mi sembra che, secondo me)',
      'Disagreeing politely (capisco, però...)',
      'Discourse markers for native-like flow (allora, comunque, dunque)',
      'Understanding "Lei" formal register actively',
      'Cultural discussion topics (food, family, piazze)',
      'Italian gestures and their meanings (can be referenced)',
      'Social norms (bars vs restaurants, aperitivo culture)',
    ],
    avoidAtThisLevel: [
      'Complex subjunctive (present subjunctive only as exposure)',
      'Literary language',
      'Heavy dialect (light regional is OK)',
      'Archaic or bureaucratic language',
      'Complex passive constructions',
    ],
  },

  assessmentCriteria: {
    readyToProgress: [
      'Can use conditional confidently for requests and hypotheses',
      'Active vocabulary of 1200+ words',
      'Can express and justify opinions on familiar topics',
      'Uses combined pronouns correctly (60%+ accuracy)',
      'Can handle complex past narration (including trapassato)',
      'Participates in conversations with some fluency',
      'Uses discourse markers to connect ideas',
      'Self-corrects and reformulates when unclear',
      'Can understand main points of standard Italian without excessive repetition',
      'Beginning to understand and use some regional expressions',
      'Asks nuanced questions (Non è che...? Cosa vuol dire esattamente...?)',
    ],
    stillNeeds: [
      'Cannot use conditional forms',
      'Struggles to express opinions beyond "mi piace/non mi piace"',
      'Vocabulary limited to concrete topics only',
      'Cannot handle complications in conversations',
      'Avoids complex sentences',
      'Still needs very slow, simplified speech',
      'No awareness of register (formal vs informal)',
      'Cannot maintain a narrative beyond 2-3 sentences',
    ],
  },
};
