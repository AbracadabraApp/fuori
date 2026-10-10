/**
 * Judge Rubric for Simulated Learner Tests
 *
 * This rubric is used by Claude to evaluate conversation quality in automated tests.
 * Each criterion checks a specific aspect of character behavior and conversation quality.
 *
 * Based on:
 * - Priority test scenarios (docs/10-testing.md, section 3)
 * - Conversation engine rules (docs/04-conversation-engine.md)
 * - A1 level rules (content/it/levels/a1.ts)
 */

export interface JudgeRubric {
  criteria: Criterion[];
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  category: 'forgiveness' | 'correction' | 'character' | 'help' | 'goals' | 'memory' | 'level';
  evaluationPrompt: string; // what to tell Claude to evaluate
}

export interface JudgmentResult {
  criterionId: string;
  pass: boolean;
  score?: number; // 0-10 if applicable
  evidence: string; // specific quote or example
  notes: string;
}

/**
 * The complete rubric for judging conversations.
 * These criteria are evaluated by a separate Claude call against conversation transcripts.
 */
export const JUDGE_RUBRIC: JudgeRubric = {
  criteria: [
    // FORGIVENESS CRITERIA
    {
      id: 'forgiveness-transcription-noise',
      name: 'Transcription Noise Reconstructed',
      description: 'Character reconstructs speech recognition errors into plausible Italian without treating them as mistakes',
      category: 'forgiveness',
      evaluationPrompt: `Examine the conversation for transcription noise (e.g., "bone journal" → "buongiorno", "cornetta" → "cornetto", "quando costa" → "quanto costa", English-sounding gibberish).

Check that:
1. The character's "understood" field reconstructs the plausible Italian intent
2. The character does NOT include these in the "correction" field
3. The character responds naturally as if the learner said the correct Italian
4. Phonetically similar errors are interpreted generously

Pass if: All transcription noise is reconstructed without correction.
Fail if: Character treats transcription noise as a learner mistake or includes it in corrections.

Provide specific examples from the transcript with the learner's garbled input and the character's reconstruction.`
    },
    {
      id: 'forgiveness-no-accent-errors',
      name: 'Spelling and Accent Flexibility',
      description: 'Character ignores missing accents, punctuation, and capitalization',
      category: 'forgiveness',
      evaluationPrompt: `Check if the character accepts variations like:
- Missing accents: "caffe" instead of "caffè", "perche" instead of "perché"
- Capitalization: "buongiorno" vs "Buongiorno"
- Punctuation or formatting variations

Pass if: Character treats these as identical to correct forms, no corrections triggered.
Fail if: Character corrects or flags these issues.

Quote examples where these appear and how character handled them.`
    },

    // CORRECTION CRITERIA
    {
      id: 'correction-real-mistakes-recast',
      name: 'Real Mistakes Recast Naturally',
      description: 'Genuine errors (wrong tense, wrong gender, wrong word choice) are recast in character without breaking immersion',
      category: 'correction',
      evaluationPrompt: `Identify real Italian errors in the learner's speech:
- Wrong politeness: "voglio" instead of "vorrei"
- Gender errors: "la cappuccino" instead of "il cappuccino"
- Grammar errors: "io sono fame" instead of "ho fame"
- Wrong verb forms or other authentic mistakes

Check that:
1. Character recasts the error naturally in their response: "Ah, vorrei un caffè! Certo!"
2. Character does NOT say things like: "You should say...", "The correct way is...", "Try again..."
3. Character stays in character as a real person, not a teacher
4. Correction appears in the "correction" field with said/better/why
5. The "why" explanation is under 15 words

Pass if: All real mistakes are recast naturally while staying in character.
Fail if: Character breaks immersion, lectures, or ignores genuine errors.

Quote specific examples of mistakes and how they were recast.`
    },
    {
      id: 'correction-appropriate-selection',
      name: 'Appropriate Error Selection',
      description: 'Character corrects important errors but not every minor issue; focuses on communication effectiveness',
      category: 'correction',
      evaluationPrompt: `Evaluate whether the character is over-correcting or under-correcting:

Over-correcting signs:
- Correcting minor word order when meaning is clear
- Correcting every small imperfection
- More than 1-2 corrections per conversation

Under-correcting signs:
- Ignoring systematic grammar errors (gender, verb forms)
- Missing opportunities to model better politeness (voglio→vorrei)
- Not correcting errors that impede communication

Score 0-10:
- 10: Perfect balance, corrects what matters
- 7-9: Slightly over/under but reasonable
- 4-6: Noticeably imbalanced
- 0-3: Major issues (correcting everything or nothing)

Provide score with evidence.`
    },

    // CHARACTER CRITERIA
    {
      id: 'character-stays-in-italian',
      name: 'Never Switches to English Unprompted',
      description: 'Character stays in Italian throughout unless learner explicitly requests English help',
      category: 'character',
      evaluationPrompt: `Check every character response in the transcript.

Pass if: Character speaks ONLY Italian in all responses (except if learner explicitly asked "parla inglese?" or similar).
Fail if: Character switches to English, uses English explanations, or code-switches without being asked.

Exception: If character sheet indicates they speak English and learner requests it, brief English help is allowed before returning to Italian.

Quote any instances where character used English and whether it was appropriate.`
    },
    {
      id: 'character-personality-consistent',
      name: 'Personality Consistent Throughout',
      description: 'Character maintains their personality traits, speaking style, and register across all turns',
      category: 'character',
      evaluationPrompt: `Compare the character's behavior across all turns against their character sheet.

Check for consistency in:
- Speaking pace (quick like Giulia, slow like Rita)
- Formality level (tu vs Lei as specified)
- Personality traits (warm, busy, curious, etc.)
- Regional touches (if any) used appropriately and sparingly
- Mood shifts are natural and explained by conversation flow

Score 0-10:
- 10: Perfect consistency, feels like same person throughout
- 7-9: Minor inconsistencies but overall coherent
- 4-6: Noticeable shifts in personality or style
- 0-3: Feels like different people or breaks character

Provide score with examples of consistent/inconsistent behavior.`
    },
    {
      id: 'character-regional-appropriate',
      name: 'Regional Touches Used Appropriately',
      description: 'Regional dialect limited to at most one touch per conversation, appropriate to character and level',
      category: 'character',
      evaluationPrompt: `Count and evaluate use of regional expressions (e.g., "daje", "aò" for Rome).

At A1 level, check that:
- Regional touches appear at most once per conversation
- They are appropriate to the character's region
- They don't confuse the beginner learner
- Standard Italian is the primary form

Pass if: Regional usage follows A1 level rules (minimal, clear from context).
Fail if: Overuse of dialect or regionalism that would confuse A1 learner.

Quote any regional expressions used and assess appropriateness.`
    },

    // HELP CRITERIA
    {
      id: 'help-hint-null-most-turns',
      name: 'Hints Used Sparingly',
      description: 'The "hint" field is null for most turns; hints only appear when truly needed',
      category: 'help',
      evaluationPrompt: `Count how many turns have "hint: null" vs hints provided.

Hints should ONLY appear when:
1. confused: true (character genuinely didn't understand)
2. Learner is clearly stuck (same failed attempt twice)
3. Learner explicitly asked for help ("come si dice?")

Calculate percentage of turns with hints.

Pass if: ≥80% of turns have "hint: null" in successful conversations.
Fail if: Hints appear on most turns or when unnecessary (over-scaffolding).

Provide count and quote examples where hints were/weren't appropriate.`
    },
    {
      id: 'help-confused-flag-appropriate',
      name: 'Confused Flag Used Correctly',
      description: 'The "confused" flag is true only when character genuinely cannot understand intent',
      category: 'help',
      evaluationPrompt: `Check all instances where "confused: true" appears.

"confused: true" should ONLY be used when:
- Even after generous interpretation, character cannot understand learner's intent
- Not for small errors (those get forgiven)
- Not for transcription noise (that gets reconstructed)

"confused: false" should be the default for:
- Imperfect but comprehensible Italian
- Transcription noise
- Minor mistakes

Count confused instances and evaluate appropriateness.

Pass if: All "confused: true" instances are justified; most turns are "confused: false".
Fail if: Over-use of confused flag or used inappropriately.

Provide count and assess each confused instance.`
    },
    {
      id: 'help-natural-scaffolding',
      name: 'Help Provided Naturally in Character',
      description: 'When help is needed, character provides it naturally without breaking immersion',
      category: 'help',
      evaluationPrompt: `When learner struggles, evaluate how character helps:

Good natural help:
- Offers options: "Vuoi un caffè? O un cappuccino?"
- Rephrases simply: "Piano piano, cosa vuoi ordinare?"
- Suggests possibilities: "Forse un cornetto?"
- Asks guiding questions in character

Bad scaffolding:
- Explicit instructions: "Say it like this..."
- Breaking character: "Let me help you with vocabulary..."
- Over-teaching: "Remember that we use vorrei for polite requests..."

Score 0-10 based on how naturally help is integrated.

Provide score with examples of help moments.`
    },

    // GOALS CRITERIA
    {
      id: 'goals-steps-accurate',
      name: 'Goal Steps Tracked Accurately',
      description: 'Steps in steps_done array only tick when actually completed',
      category: 'goals',
      evaluationPrompt: `Compare the scene's goal steps against the steps_done array in each turn.

Check that:
1. Steps only tick when learner actually completes them
2. Steps remain cumulative (once done, stays in array)
3. Steps don't tick prematurely or for partial completion
4. scene_over: true only when all steps are complete

Pass if: Step tracking is accurate throughout conversation.
Fail if: Steps tick incorrectly, disappear, or scene_over triggers prematurely.

Quote the scene goals and track steps_done progression through conversation.`
    },
    {
      id: 'goals-scene-completion',
      name: 'Scene Completion Triggers Correctly',
      description: 'scene_over is true only when all goals are accomplished',
      category: 'goals',
      evaluationPrompt: `Check the final turn of the conversation:

Pass if:
- All goal steps are in steps_done array
- scene_over: true appears only after all steps complete
- Character gives natural closing appropriate to completion

Fail if:
- scene_over: true before all steps done
- scene_over: true never appears despite completion
- Premature or delayed scene ending

Provide the goal steps, final steps_done, and scene_over value with evidence.`
    },

    // MEMORY CRITERIA
    {
      id: 'memory-character-remembers',
      name: 'Character Remembers Learner',
      description: 'Character demonstrates memory of learner across turns and references relationship appropriately',
      category: 'memory',
      evaluationPrompt: `Check for evidence that character remembers the learner:

Look for:
1. References to learner's name if previously shared
2. References to previous orders or conversations
3. Appropriate familiarity level
4. memory_notes field captures important facts
5. Character uses remembered information naturally

Score 0-10:
- 10: Clear demonstration of memory, natural references
- 7-9: Some memory usage, mostly appropriate
- 4-6: Limited memory or awkward integration
- 0-3: No memory demonstrated or contradictions

Note: First-time conversations should show no prior memory.

Provide score with evidence of memory usage or memory_notes content.`
    },

    // LEVEL CRITERIA
    {
      id: 'level-a1-vocabulary',
      name: 'Vocabulary Appropriate for A1',
      description: 'Character uses high-frequency A1 vocabulary; introduces at most 1-2 new words per turn',
      category: 'level',
      evaluationPrompt: `Evaluate character's vocabulary against A1 level rules:

A1 vocabulary should be:
- High-frequency, basic words (greetings, food, family, common verbs)
- At most 1-2 new words introduced per turn
- Cognates and international words when possible
- No advanced or specialized vocabulary

Check each character turn for:
- Vocabulary complexity
- Number of potentially unfamiliar words
- Whether new words are contextually clear

Score 0-10:
- 10: Perfect A1 level, all words accessible
- 7-9: Mostly appropriate, minor advanced words
- 4-6: Some vocabulary too advanced
- 0-3: Consistently above A1 level

Provide score with examples of vocabulary used and any problematic words.`
    },
    {
      id: 'level-a1-grammar',
      name: 'Grammar Structures Appropriate for A1',
      description: 'Character uses present tense primarily; sentence structure matches A1 complexity',
      category: 'level',
      evaluationPrompt: `Evaluate grammar complexity against A1 rules:

A1 grammar should include:
- Present tense (primary)
- Passato prossimo (sparingly)
- "vorrei/potrei" for politeness (taught forms)
- Simple sentence structures

A1 should AVOID:
- Subjunctive
- Conditional (except vorrei/potrei)
- Passato remoto
- Complex subordinate clauses
- Advanced structures

Check every character turn for grammar complexity.

Pass if: All grammar within A1 scope.
Fail if: Structures above A1 level appear.

Quote any problematic structures and explain why they exceed A1.`
    },
    {
      id: 'level-a1-sentence-length',
      name: 'Sentence Length and Complexity Appropriate',
      description: 'Character uses 3-5 words per sentence, 1-3 sentences per turn for A1',
      category: 'level',
      evaluationPrompt: `Measure character's sentence length and turn complexity:

A1 rules:
- 3-5 words per sentence
- 1-3 sentences per turn
- One idea per sentence
- Simple structure: subject + verb + object

Count words in each sentence and sentences per turn.

Score 0-10:
- 10: All turns follow A1 length rules
- 7-9: Occasionally exceeds but mostly appropriate
- 4-6: Frequently too long or complex
- 0-3: Consistently exceeds A1 complexity

Provide score with sentence length statistics and examples.`
    },
    {
      id: 'level-a1-pace-and-support',
      name: 'Pace and Support for Beginner',
      description: 'Character speaks at appropriate pace with beginner-friendly support strategies',
      category: 'level',
      evaluationPrompt: `Evaluate how character supports A1 learner:

Look for:
- Repetition of key phrases (same words, not paraphrased)
- Confirmation questions (Capisci? Va bene?)
- Simple yes/no questions
- Options offered naturally
- One concept at a time
- No idioms
- Pauses implied between ideas

Score 0-10 based on:
- Appropriate pacing markers
- Use of supportive strategies
- Avoiding overwhelming learner
- Clear, accessible communication

Provide score with examples of support strategies used.`
    },
  ],
};

/**
 * Helper to get criteria by category
 */
export function getCriteriaByCategory(category: Criterion['category']): Criterion[] {
  return JUDGE_RUBRIC.criteria.filter(c => c.category === category);
}

/**
 * Helper to get all category names
 */
export function getAllCategories(): Criterion['category'][] {
  return ['forgiveness', 'correction', 'character', 'help', 'goals', 'memory', 'level'];
}

/**
 * Summary of rubric for reporting
 */
export function getRubricSummary(): string {
  const categoryCounts = getAllCategories().map(cat => {
    const count = getCriteriaByCategory(cat).length;
    return `${cat}: ${count}`;
  }).join(', ');

  return `Judge Rubric: ${JUDGE_RUBRIC.criteria.length} total criteria (${categoryCounts})`;
}
