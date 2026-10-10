# Judge Rubric for Simulated Learner Tests

This directory contains the rubric that Claude uses to judge conversation quality in automated tests.

## Overview

The judge rubric (`rubric.ts`) defines 14 criteria across 7 categories:

1. **Forgiveness** (2 criteria): Transcription noise reconstruction, accent/spelling flexibility
2. **Correction** (2 criteria): Natural recasting, appropriate error selection
3. **Character** (3 criteria): Stays in Italian, personality consistency, regional touches
4. **Help** (3 criteria): Sparse hints, appropriate confused flag, natural scaffolding
5. **Goals** (2 criteria): Accurate step tracking, correct scene completion
6. **Memory** (1 criterion): Character remembers learner
7. **Level** (4 criteria): A1 vocabulary, grammar, sentence length, pace/support

## Usage

### In the Simulated Learner Test

The simulated learner test (`npm run test:learner`) works in three phases:

1. **Run**: Learner personas play through scenes using real `/api/turn` calls
2. **Judge**: A separate Claude call evaluates each conversation against this rubric
3. **Report**: Results saved to `tests/reports/<date>.md`

### Judge Prompt Structure

For each conversation, the judge receives:

```
<rubric>
[The criterion's evaluationPrompt]
</rubric>

<character_sheet>
[Character details: personality, speaking style, formality, etc.]
</character_sheet>

<scene>
[Scene details: place, goals, steps]
</scene>

<conversation_transcript>
[Full conversation with all turn outputs including understood, it, en, correction,
words, steps_done, hint, confused, mood, scene_over, memory_notes]
</conversation_transcript>

Task: Evaluate this conversation against the criterion above. Return a JudgmentResult.
```

### Judgment Result Format

```typescript
{
  criterionId: "forgiveness-transcription-noise",
  pass: true,
  score: 9,  // optional, 0-10 when applicable
  evidence: "Turn 3: Learner said 'bone journal', character understood as 'buongiorno', no correction issued",
  notes: "Excellent reconstruction of transcription noise. All instances handled appropriately."
}
```

## Example Evaluation

### Criterion: `forgiveness-transcription-noise`

**Conversation excerpt:**
```
Learner: "bone journal"
Character understood: "buongiorno"
Character said: "Buongiorno! Come stai?"
Correction: null
```

**Judgment:**
- ✅ Pass
- Evidence: "Character reconstructed 'bone journal' → 'buongiorno' without issuing correction"
- Notes: "Perfect forgiveness of transcription noise"

### Criterion: `correction-real-mistakes-recast`

**Conversation excerpt:**
```
Learner: "voglio un cappuccino"
Character understood: "voglio un cappuccino"
Character said: "Ah, vorrei un cappuccino! Certo, subito."
Correction: {
  said: "voglio un cappuccino",
  better: "vorrei un cappuccino",
  why: "Use 'vorrei' for polite requests"
}
```

**Judgment:**
- ✅ Pass
- Score: 10/10
- Evidence: "Character recast 'voglio' → 'vorrei' naturally in response without breaking character"
- Notes: "Perfect natural correction. Stayed in character, correction recorded properly, explanation under 15 words."

### Criterion: `level-a1-vocabulary`

**Conversation with problematic vocabulary:**
```
Character: "Vorrei suggerirti il nostro straordinario tiramisù artigianale,
           preparato secondo la ricetta tradizionale della nonna."
```

**Judgment:**
- ❌ Fail
- Score: 3/10
- Evidence: "Turn 5: Used 'suggerirti' (suggest to you), 'straordinario' (extraordinary), 'artigianale' (artisanal), 'tradizionale' (traditional) - all above A1 level"
- Notes: "Vocabulary too advanced. A1 version should be: 'Abbiamo un buon tiramisù. È molto buono.' (simple adjectives, common words)"

## Modifying the Rubric

When updating criteria:

1. Edit `rubric.ts`
2. Update the `evaluationPrompt` to be clear and specific
3. Run `npx tsc --noEmit` to verify types
4. Test with a sample conversation
5. Update this README if categories change

## Pedagogical Basis

The rubric enforces principles from:
- **CLT (Communicative Language Teaching)**: Natural recasting, staying in character
- **Comprehensible Input (Krashen)**: Level-appropriate vocabulary and grammar
- **ZPD (Vygotsky)**: Scaffolding only when needed, not over-helping
- **Progetto Italiano methodology**: Inductive learning through authentic conversation

See `docs/04-conversation-engine.md` for full pedagogical foundations.
