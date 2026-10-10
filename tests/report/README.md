# Test Report Generator

Generates markdown reports for simulated learner test results, as described in [docs/10-testing.md](../../docs/10-testing.md) section 4b.

## Purpose

The report generator evaluates conversation quality against 8 criteria:

1. **Stayed within level** - Length, tenses, vocabulary within A1-A2
2. **Recast mistakes** - Real mistakes recast, transcription noise ignored
3. **Stayed in Italian** - Never switched to English unprompted
4. **Maintained formality** - tu/Lei as character sheet specifies
5. **Goals tracked correctly** - Steps ticked only when actually done
6. **Confused used sparingly** - Confused flag used appropriately
7. **Hints used sparingly** - Hints offered when needed, not excessively
8. **Stayed in character** - Personality, pace, regionalisms consistent

## Usage

### Basic Usage

```typescript
import { reportGenerator, TestRun } from './generate-report';

// Your test results
const results: TestRun[] = [
  // ... test run data
];

// Generate markdown string
const markdown = reportGenerator.generate(results);
console.log(markdown);

// Or save directly to file
const filepath = await reportGenerator.save(results);
// Saves to: tests/reports/YYYY-MM-DD-HHmm.md
```

### Running Example

```bash
# See a sample report
npx tsx tests/report/example-usage.ts
```

## Report Format

The generated markdown report includes:

### Summary Section
- Total conversations tested
- Overall pass rate per criterion
- Personas tested
- Scenes tested
- Characters tested

### Per-Criterion Breakdown
- Pass rate for each of the 8 criteria
- Average score (0-10) if scored

### Worst Examples
- For each failing criterion, 2-3 worst examples
- Includes conversation snippet
- Shows what went wrong

### Per-Character Analysis
- How each character performed
- Which characters struggle most
- Specific areas of difficulty

### Per-Persona Analysis
- Did the test correctly handle different learner types?
- Specific observations for each persona

## Report Files

Reports are saved to `tests/reports/` with format: `YYYY-MM-DD-HHmm.md`

Example: `tests/reports/2026-10-10-1430.md`

Each report includes:
- Timestamp
- Git commit hash (for tracking which version was tested)

## TestRun Data Structure

```typescript
interface TestRun {
  id: string;
  timestamp: Date;
  personaId: string;
  personaName: string;
  characterId: string;
  characterName: string;
  sceneId: string;
  sceneName: string;

  transcript: Array<{
    who: 'learner' | 'npc';
    text: string;
  }>;

  scores: {
    stayedWithinLevel: Score;
    recastMistakes: Score;
    stayedInItalian: Score;
    maintainedFormality: Score;
    goalsTrackedCorrectly: Score;
    confusedUsedSparingly: Score;
    hintsUsedSparingly: Score;
    stayedInCharacter: Score;
  };
}

interface Score {
  pass: boolean;              // Did this criterion pass?
  value?: number;             // Optional 0-10 score
  evidence: string;           // What went right or wrong
  snippet?: string;           // Relevant conversation excerpt
}
```

## Integration with Test Runner

The report generator is designed to work with the simulated learner test runner (to be built):

```typescript
// tests/run-simulated-learner.ts (future)
import { reportGenerator } from './report/generate-report';

async function runTests() {
  // 1. Load personas
  const personas = loadPersonas();

  // 2. Run conversations
  const results = await runConversations(personas);

  // 3. Judge results (separate Claude call)
  const scored = await judgeResults(results);

  // 4. Generate report
  const filepath = await reportGenerator.save(scored);
  console.log(`Report saved: ${filepath}`);
}
```

## When to Run

Run the simulated learner tests:
- When prompts change (character house rules, system prompts)
- When character sheets are updated
- Before releases
- To compare improvements over time

## Reading Reports

1. **Check overall pass rates** - Any below 70%? Those need attention.
2. **Review worst examples** - Understand specific failures.
3. **Compare characters** - Which need character sheet refinement?
4. **Validate personas** - Are different learner types handled correctly?

## Next Steps

After reviewing a report:
1. Identify patterns in failures
2. Update relevant prompts or character sheets
3. Re-run tests to measure improvement
4. Compare reports over time using git history

---

See [docs/10-testing.md](../../docs/10-testing.md) for the full testing strategy.
