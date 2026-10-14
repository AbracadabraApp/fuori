/**
 * Review Schema - M2 Conversation Analysis
 *
 * Generated after each conversation, this rich analysis replaces the simple M1 review log.
 * Powers Magda's teaching, study export, and level detection.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Frequency = 'high' | 'medium' | 'low';
export type Impact = 'high' | 'medium' | 'low';
export type Priority = 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'low';
export type Speaker = 'learner' | 'character';

export type ErrorType =
  | 'missing_articles'
  | 'verb_agreement'
  | 'wrong_gender'
  | 'tense_error'
  | 'syntax'
  | 'pronunciation'
  | 'word_choice'
  | 'preposition'
  | 'other';

export type MissingStructure =
  | 'passato_prossimo'
  | 'imperfetto'
  | 'futuro'
  | 'condizionale'
  | 'congiuntivo'
  | 'pronouns'
  | 'reflexive_verbs'
  | 'comparatives'
  | 'superlatives'
  | 'relative_clauses'
  | 'other';

export type VerbTense =
  | 'present'
  | 'passato_prossimo'
  | 'imperfetto'
  | 'trapassato_prossimo'
  | 'futuro'
  | 'futuro_anteriore'
  | 'condizionale'
  | 'condizionale_passato'
  | 'congiuntivo_presente'
  | 'congiuntivo_passato'
  | 'congiuntivo_imperfetto'
  | 'congiuntivo_trapassato'
  | 'imperativo'
  | 'infinito'
  | 'gerundio'
  | 'participio';

export type WordType = 'verb' | 'noun' | 'adjective' | 'preposition' | 'adverb';
export type Gender = 'masculine' | 'feminine';
export type Number = 'singular' | 'plural';
export type Person = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';

export interface ErrorExample {
  incorrect: string;
  correct: string;
  context: string;
}

export interface ErrorPattern {
  type: ErrorType;
  description: string;
  examples: ErrorExample[];
  frequency: Frequency;
  impact: Impact;
}

export interface MissingStructureItem {
  structure: MissingStructure;
  expectedAtLevel: CEFRLevel;
  why: string;
  examples: string[];
}

export interface CommunicativeBreakdown {
  situation: string;
  issue: string;
  shouldHaveSaid?: string;
  why: string;
}

export interface VocabularyExample {
  sentence: string;
  speaker: Speaker;
  context: string;
  english: string;
}

export interface VocabularyWord {
  word: string;
  lemma: string;
  type: WordType;
  // Verb-specific
  tense?: VerbTense;
  person?: Person;
  // Noun-specific
  gender?: Gender;
  number?: Number;
  // All words
  examples: VocabularyExample[];
}

export interface TenseUsageStat {
  count: number;
  percentage: number;
}

export interface TenseUsage {
  present: TenseUsageStat;
  passato_prossimo: TenseUsageStat;
  imperfetto: TenseUsageStat;
  futuro: TenseUsageStat;
  condizionale?: TenseUsageStat;
  congiuntivo?: TenseUsageStat;
  [key: string]: TenseUsageStat | undefined;
}

export interface SuggestedVocabulary {
  word: string;
  why: string;
  priority: Priority;
}

export interface Vocabulary {
  words: VocabularyWord[];
  tenseUsage: TenseUsage;
  suggested: SuggestedVocabulary[];
}

export interface LevelEvidence {
  errorRate: number; // errors per 100 words
  complexityUsed: string[];
  confidence: Confidence;
}

export interface SuggestedFocus {
  focus: string;
  why: string;
  priority: Priority;
  method: string;
}

export interface ReviewMetadata {
  analyzedConversations: number;
  conversationId: string;
  dateRange: string;
  totalTurns: number;
  learnerTurns: number;
}

/**
 * Complete Review output - generated after each conversation
 */
export interface Review {
  // Level classification
  level: CEFRLevel;
  levelEvidence: LevelEvidence;

  // Error analysis
  patterns: ErrorPattern[];
  missingStructures: MissingStructureItem[];
  breakdowns: CommunicativeBreakdown[];

  // Vocabulary tracking
  vocabulary: Vocabulary;

  // Teaching guidance
  suggestions: SuggestedFocus[];
  strengths: string[];

  // Context
  metadata: ReviewMetadata;
}

/**
 * Simplified Review for display/API responses
 * (Full Review might be too large for some contexts)
 */
export interface ReviewSummary {
  level: CEFRLevel;
  topPatterns: string[]; // Top 3 error types
  missingStructures: string[]; // Top 3 missing structures
  suggestions: SuggestedFocus[];
  vocabularyCount: number;
  conversationDate: string;
}

/**
 * Helper to create ReviewSummary from full Review
 */
export function summarizeReview(review: Review): ReviewSummary {
  return {
    level: review.level,
    topPatterns: review.patterns
      .sort((a, b) => {
        const freqOrder = { high: 3, medium: 2, low: 1 };
        return freqOrder[b.frequency] - freqOrder[a.frequency];
      })
      .slice(0, 3)
      .map((p) => p.description),
    missingStructures: review.missingStructures
      .slice(0, 3)
      .map((s) => s.structure),
    suggestions: review.suggestions.filter((s) => s.priority === 'high'),
    vocabularyCount: review.vocabulary.words.length,
    conversationDate: review.metadata.dateRange,
  };
}
