# Simulated Learner Testing

Automated quality testing for the conversation engine using Claude-as-learner and Claude-as-judge.

## Overview

The simulated learner test suite validates that:
- Characters forgive speech recognition noise
- Real mistakes are recast naturally (not taught)
- Characters stay in Italian and in character
- Scaffolding is appropriate (not over-helping)
- Goal tracking is accurate
- Language level is appropriate (A1/A2)

See [docs/10-testing.md](../docs/10-testing.md) section 4b for the full testing strategy.

## Test Components

### 1. Learner Personas (`personas/learner-personas.ts`)

Realistic learner profiles with:
- Level (A1, A1+, A2)
- Common mistakes (grammar errors, wrong word choice)
- Transcription noise patterns (speech-to-text errors)
- Behavioral characteristics

Current personas:
- **English speaker**: Classic beginner mistakes (voglio/vorrei, gender confusion)
- **Spanish speaker**: False friends, Romance language advantage
- **Hesitant beginner**: Slow, uncertain, frequent pauses
- **Confident but wrong**: Speaks boldly with systematic errors

### 2. Judge Rubric (`judge/rubric.ts`)

Comprehensive evaluation criteria organized by category:
- **Forgiveness**: Transcription noise, spelling variations
- **Correction**: Natural recasting, appropriate selection
- **Character**: Stays in Italian, personality consistency
- **Help**: Hint usage, confused flag, natural scaffolding
- **Goals**: Step tracking, scene completion
- **Memory**: Character remembers learner
- **Level**: Vocabulary, grammar, sentence complexity

Each criterion has:
- Clear pass/fail conditions
- Detailed evaluation prompt for the judge
- Examples of good/bad behavior

### 3. Test Runner (`run-simulated-learner.mjs`)

Orchestrates the full test cycle:

1. **Load test data**: Personas, scenes, characters, level rules
2. **Simulate conversation**: Claude plays the learner (realistic mistakes + transcription noise)
3. **Generate NPC responses**: Claude plays the character (using conversation engine prompts)
4. **Judge conversation**: Separate Claude call evaluates against rubric
5. **Generate report**: Markdown report with scores, examples, transcripts

## Running Tests

### Basic usage:

```bash
# Run all test combinations
npm run test:learner

# Run with verbose output (shows each turn)
npm run test:learner --verbose
```

### Requirements:

- `ANTHROPIC_API_KEY` in `.env.local`
- Sufficient API credits (each conversation uses multiple Claude calls)

### What it does:

1. Loads all personas and scenes
2. For each persona × scene combination:
   - Runs 8-12 turn conversation
   - Simulates realistic learner behavior
   - Gets character responses using production prompts
   - Evaluates conversation quality
3. Generates timestamped report in `tests/reports/`

### Cost estimate:

- ~3-5 Claude calls per conversation
- ~6 conversations per run (3 personas × 2 scenes)
- Total: ~20-30 API calls per run
- Cost: ~$0.50-1.00 per full run

## Output

Reports are saved to `tests/reports/simulated-learner-YYYY-MM-DD-HHMMSS.md`

Report includes:
- Summary statistics (success rate, average score)
- Detailed results per conversation
- Criteria breakdown with scores and evidence
- Transcript excerpts for low-scoring conversations

Example report structure:

```markdown
# Simulated Learner Test Report

Generated: 2024-01-15T10:30:00.000Z
Model: claude-sonnet-5-5
Conversations: 6

## Summary

- Successful: 6/6
- Average score: 8.2/10

## Results by Conversation

### english-speaker × test-bar-morning

**Overall Score:** 8/10

**Criteria:**
- **Stayed within level:** 9/10
  - Character used appropriate A1 vocabulary and grammar
  - Examples: "Cosa prendi?", "Un caffè, certo!"

- **Forgiveness & Correction:** 9/10
  - Reconstructed "bone journal" → "buongiorno" without correction
  - Naturally recast "voglio" → "vorrei" in response

[... more criteria ...]

**Summary:** Strong performance overall. Character maintained natural conversation while providing appropriate corrections. Minor over-scaffolding on turn 7 could be reduced.

---

### [Next conversation...]
```

## When to Run

**On prompt changes:**
- Modified house rules or level rules
- Changed character prompt structure
- Updated conversation engine logic

**Before releases:**
- Full test suite to validate quality
- Compare against previous reports

**Not on every commit:**
- Tests are relatively expensive (API calls)
- Run when conversation behavior changes

## Expanding Tests

### Adding personas:

Edit `personas/learner-personas.ts`:

```typescript
export const newPersona: LearnerPersona = {
  id: 'german-speaker',
  level: 'A1',
  nativeLanguage: 'German',
  commonMistakes: [
    'capitalizes all nouns (German habit)',
    'uses "ich" instead of "io"',
    // ...
  ],
  transcriptionNoise: [
    // German pronunciation patterns
  ],
  behaviorDescription: '...',
};
```

### Adding scenes:

Currently uses inline test scenes. To use real scenes:

1. Update `loadTestScenes()` in test runner
2. Import from `content/it/cities/`
3. Select representative scenes (bar, market, etc.)

### Modifying rubric:

Edit `judge/rubric.ts`:

```typescript
{
  id: 'new-criterion',
  name: 'Criterion Name',
  description: 'What this evaluates',
  category: 'character', // or other category
  evaluationPrompt: `Detailed prompt for judge...`
}
```

## Integration with CI/CD

Future: Run automatically on PR for conversation-related changes

```yaml
# .github/workflows/test-conversation.yml
- name: Run simulated learner tests
  run: npm run test:learner
  if: contains(github.event.head_commit.message, '[test-conversation]')
```

## Troubleshooting

**"ANTHROPIC_API_KEY not found"**
- Ensure `.env.local` exists with valid API key
- Check the key has sufficient credits

**"Error getting learner response"**
- Check API rate limits
- Verify model name is correct
- Increase timeout if needed

**Tests timing out:**
- Reduce `turnsPerConversation` in CONFIG
- Add longer delays between API calls
- Run smaller subsets of personas/scenes

**Low scores on all tests:**
- Review recent prompt changes
- Compare transcript to expected behavior
- Check if level rules are too restrictive

## Related Documentation

- [Testing Strategy](../docs/10-testing.md) - Full testing approach
- [Conversation Engine](../docs/04-conversation-engine.md) - How prompts work
- [Level Rules](../content/it/levels/) - CEFR level definitions
- [Character Sheets](../content/it/characters/) - Character definitions
