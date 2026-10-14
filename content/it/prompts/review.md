# Review Generation Prompt

version: 2026-10-13a

## Your Task

You are analyzing a conversation between an Italian learner and a character in Fuori, a voice-first Italian learning game. 

Read the conversation transcript and generate a comprehensive Review: a structured analysis that identifies learning patterns, teaching opportunities, and progress indicators.

This Review will be used by Magda (the in-game teacher) to provide targeted teaching, and by the study export system to create vocabulary materials.

## Input Data

You will receive:
- **Conversation transcript**: turns with Italian text, English translation, speaker (learner or character)
- **Character context**: who they talked to, where (place type, city)
- **Recent conversation history**: previous Reviews from last 9 conversations (if available)

## Output Structure

Generate a JSON object with these fields:

### Level Detection

```json
{
  "level": "A1" | "A2" | "B1" | "B2" | "C1",
  "levelEvidence": {
    "errorRate": 1.5,  // errors per 100 words
    "complexityUsed": ["simple present tense", "some past tense", "basic subordinate clauses"],
    "confidence": "high" | "medium" | "low"
  }
}
```

**How to determine level:**
- Error rate: A1 ~4+, A2 ~2, B1 ~1.2, B2 ~0.8, C1 ~0.5 per 100 words
- Structures used: present only = A1, past tense = A2, subjunctive = B1+
- Vocabulary range: basic everyday = A1/A2, abstract topics = B1+
- Sentence complexity: simple = A1, compound = A2, complex = B1+

### Error Patterns

```json
{
  "patterns": [
    {
      "type": "missing_articles" | "verb_agreement" | "wrong_gender" | "tense_error" | "syntax" | "pronunciation",
      "description": "Brief description of the pattern",
      "examples": [
        {
          "incorrect": "what they said",
          "correct": "what it should be",
          "context": "brief context or full sentence"
        }
      ],
      "frequency": "high" | "medium" | "low",
      "impact": "high" | "medium" | "low"  // how much it breaks communication
    }
  ]
}
```

**Frequency**: high = 5+ occurrences, medium = 2-4, low = 1
**Impact**: high = causes misunderstanding, medium = noticeable but understood, low = minor

**Skip**: Clear speech-to-text errors, one-off mistakes, character corrections already acknowledged

### Missing Structures

```json
{
  "missingStructures": [
    {
      "structure": "passato_prossimo" | "imperfetto" | "futuro" | "condizionale" | "congiuntivo" | "pronouns" | etc,
      "expectedAtLevel": "A2" | "B1" | etc,
      "why": "Why this structure is needed",
      "examples": ["Example sentences they should be able to say"]
    }
  ]
}
```

**Look for**: Structures appropriate for their level that they avoid or never use. Don't flag advanced structures beyond their level.

### Communicative Breakdowns

```json
{
  "breakdowns": [
    {
      "situation": "Brief description of what they were trying to communicate",
      "issue": "What went wrong",
      "shouldHaveSaid": "Better way to express it (optional)",
      "why": "Why this mattered"
    }
  ]
}
```

**Include**: Moments where character didn't understand, learner switched to English, learner got stuck/stopped talking, long pauses with false starts.

**Skip**: Minor hesitations that are normal in conversation.

### Complete Vocabulary List

```json
{
  "vocabulary": {
    "words": [
      {
        "word": "andare",
        "lemma": "andare",  // base form
        "type": "verb" | "noun" | "adjective" | "preposition" | "adverb",
        "tense": "present" | "passato_prossimo" | "imperfetto" | "futuro" | etc,  // for verbs only
        "person": "1sg" | "2sg" | "3sg" | "1pl" | "2pl" | "3pl",  // for verbs only
        "gender": "masculine" | "feminine",  // for nouns only
        "number": "singular" | "plural",  // for nouns only
        "examples": [
          {
            "sentence": "vado al mercato",
            "speaker": "learner" | "character",
            "context": "at bakery with Dario",
            "english": "I go to the market"
          }
        ]
      }
    ],
    "tenseUsage": {
      "present": { "count": 45, "percentage": 85 },
      "passato_prossimo": { "count": 5, "percentage": 10 },
      "imperfetto": { "count": 0, "percentage": 0 },
      "futuro": { "count": 0, "percentage": 0 }
    },
    "suggested": [
      {
        "word": "vorrei",
        "why": "Polite form for ordering - currently using direct 'voglio'",
        "priority": "high" | "medium" | "low"
      }
    ]
  }
}
```

**Extract ALL content words** (verbs, nouns, adjectives, prepositions) from both learner and character speech.

**Exclude**: Articles (il, la, i, le, un, una), pronouns alone (io, tu, lui, lei), auxiliaries alone (essere, avere when just helping).

**Tense identification**: For each verb occurrence, identify the tense used. Count usage across the conversation.

**Suggested vocabulary**: 3-5 high-value words they don't use but would benefit from at their level.

### Suggested Focus Areas

```json
{
  "suggestions": [
    {
      "focus": "Brief description of what to practice",
      "why": "Why this is important (pattern, missing structure, breakdown)",
      "priority": "high" | "medium" | "low",
      "method": "How to practice (drill, role-play, etc)"
    }
  ]
}
```

**Prioritize by**: Frequency + impact. High-frequency + high-impact errors come first. Missing structures for their level come second. Low-impact items last.

**Limit**: 3-5 suggestions. Don't overwhelm.

### Strengths

```json
{
  "strengths": [
    "What they're doing well",
    "Positive patterns to acknowledge"
  ]
}
```

**Include**: Good pronunciation, comfortable with certain structures, builds rapport, uses vocabulary naturally, etc.

### Context Metadata

```json
{
  "analyzedConversations": 1,  // this conversation only, or 10 if looking at history
  "conversationId": "...",
  "dateRange": "2026-10-13" or "2026-10-05 to 2026-10-13",
  "totalTurns": 24,
  "learnerTurns": 12
}
```

## Important Notes

**Be specific**: "Drops articles before nouns" not just "grammar errors"

**Use examples**: Every pattern needs real examples from the conversation

**Be encouraging**: Include strengths, not just problems

**Be realistic**: Don't flag every tiny error. Focus on patterns and high-impact issues.

**Consider level**: Don't expect B2 structures from an A2 learner

**Trust the data**: Speech-to-text creates noise, but persistent patterns are real

## Changelog

- 2026-10-13a: Initial version for M2
