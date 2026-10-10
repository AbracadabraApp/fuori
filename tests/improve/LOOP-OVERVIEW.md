# Automated Improvement Loop - Complete System

## Overview

The automated improvement loop continuously tests, analyzes, fixes, and re-tests the conversation engine until quality targets are met.

```
┌─────────────────────────────────────────────────────────────┐
│                   IMPROVEMENT LOOP CYCLE                     │
└─────────────────────────────────────────────────────────────┘

Iteration 1:
  ┌─────────────────┐
  │  Run Tests      │  npm run test:learner
  │  (test runner)  │  → Simulates learners × scenes
  └────────┬────────┘  → Generates test report
           │
           ▼
  ┌─────────────────┐
  │ Analyze         │  analyze-failures.mjs
  │ Failures        │  → Groups failures by category
  └────────┬────────┘  → Identifies patterns
           │            → Finds root causes
           ▼
  ┌─────────────────┐
  │ Generate        │  generate-improvements.mjs
  │ Improvements    │  → Claude proposes specific fixes
  └────────┬────────┘  → Validates & prioritizes
           │
           ▼
  ┌─────────────────┐
  │ Review &        │  Interactive or --auto
  │ Approve         │  → Shows diffs
  └────────┬────────┘  → User confirms or skips
           │
           ▼
  ┌─────────────────┐
  │ Apply           │  apply-improvements.mjs
  │ Changes         │  → Backs up files
  └────────┬────────┘  → Applies edits
           │            → Creates git commit
           ▼
  ┌─────────────────┐
  │ Compare         │  Did scores improve?
  │ Results         │  Continue or stop?
  └────────┬────────┘
           │
           ▼
        [Loop again or stop]

Stopping Conditions:
  ✓ All tests pass threshold (default: 8.0/10)
  ✓ No improvements generated
  ✓ Max iterations reached (default: 5)
  ✓ User chooses to stop
```

## Components

### 1. Test Runner (`tests/run-simulated-learner.mjs`)
**What it does:**
- Loads 4 learner personas (English speaker, Spanish speaker, hesitant, confident-but-wrong)
- Runs conversations through 2 test scenes (Giulia at bar, Rita at market)
- Judges each conversation on 14 criteria across 7 categories
- Generates detailed test report

**Output:** `tests/reports/simulated-learner-YYYY-MM-DD.md`

### 2. Failure Analyzer (`tests/improve/analyze-failures.mjs`)
**What it does:**
- Loads test results
- Extracts all failures (scores < 6/10)
- Groups by category (forgiveness, correction, character, help, goals, memory, level)
- Identifies patterns across failures ("NPC switches to English 4 times")
- Categorizes root causes (prompt issues, missing instructions, conflicting rules)
- Prioritizes by severity and impact

**Output:**
- `tests/reports/failure-analysis-YYYY-MM-DD.md` (human-readable)
- `tests/reports/failure-analysis-YYYY-MM-DD.json` (structured data)

### 3. Improvement Generator (`tests/improve/generate-improvements.mjs`)
**What it does:**
- Takes failure analysis as input
- Uses Claude to propose specific fixes for each root cause
- Generates 4 types of improvements:
  - **Prompt improvements** (conversation engine prompts)
  - **Level rule adjustments** (A1/A2 constraints)
  - **Character sheet additions** (behavioral guidelines)
  - **System instruction clarifications** (judge rubric)
- Validates proposed changes (file exists, text found)
- Prioritizes by impact score

**Output:** `tests/reports/improvements-YYYY-MM-DD.json`

### 4. Improvement Applier (`tests/improve/apply-improvements.mjs`)
**What it does:**
- Loads improvements JSON
- For each improvement:
  - Shows unified diff
  - Asks for confirmation (or auto-applies with --auto)
  - Creates backup before modifying
  - Applies the edit
- Creates git commit with all changes
- Tags commit with iteration number

**Output:**
- Modified source files
- Git commit + tag (`test-iteration-N`)
- Backups in `.backups/`

### 5. Loop Orchestrator (`tests/improve/run-improvement-loop.mjs`)
**What it does:**
- Coordinates the entire cycle
- Tracks iteration history
- Compares scores between iterations
- Generates progress reports
- Handles stopping conditions
- Manages user interaction (or auto mode)

**Output:** `tests/reports/improvement-history.json`

## Usage

### Quick Start
```bash
# Interactive mode - shows each improvement for approval
npm run improve:loop

# Auto mode - applies all improvements automatically
npm run improve:loop --auto

# Custom configuration
npm run improve:loop -- --max 10 --threshold 9.0 --verbose
```

### Configuration Options
- `--max N` - Maximum iterations (default: 5)
- `--threshold X` - Pass threshold score (default: 8.0/10)
- `--auto` - Auto-apply all improvements without confirmation
- `--verbose` - Show detailed output

### Example Session
```
🔄 Improvement Loop - Iteration 1/5

📊 Running tests...
  3 personas × 2 scenes = 6 conversations
  Average score: 6.2/10
  Failures: 12/84 criteria (14.3%)

🔍 Analyzing failures...
  Found 4 patterns:
    - NPC switches to English (4 occurrences) - HIGH
    - Transcription noise treated as mistakes (2 occurrences) - HIGH
    - Over-corrections (3 occurrences) - MEDIUM
    - Regional dialect overused (3 occurrences) - LOW

💡 Generated 5 improvements:
  1. fix-english-switching (impact: 4, confidence: high)
  2. improve-transcription-noise-handling (impact: 2, confidence: high)
  3. reduce-over-correction (impact: 3, confidence: medium)
  4. limit-regional-dialect (impact: 3, confidence: medium)
  5. strengthen-a1-confusion-guidance (impact: 2, confidence: medium)

📝 Applying improvements...
  [Shows diff for fix-english-switching]
  Apply this change? (y/n): y
  ✓ Applied fix-english-switching
  [Shows diff for improve-transcription-noise-handling]
  Apply this change? (y/n): y
  ✓ Applied improve-transcription-noise-handling
  ...

📦 Created commit: abc123def456
🏷️  Tagged: test-iteration-1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Improvement Loop - Iteration 2/5

📊 Running tests...
  Average score: 7.8/10 (+1.6)
  Failures: 5/84 criteria (6.0%)

🔍 Analyzing failures...
  Found 2 patterns:
    - NPC responses too long for A1 (3 occurrences) - MEDIUM
    - Goals not tracked accurately (2 occurrences) - MEDIUM

💡 Generated 2 improvements:
  1. enforce-a1-sentence-length (impact: 3, confidence: high)
  2. improve-goal-tracking (impact: 2, confidence: high)

📝 Applying improvements...
  ✓ Applied enforce-a1-sentence-length
  ✓ Applied improve-goal-tracking

📦 Created commit: def456ghi789
🏷️  Tagged: test-iteration-2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Improvement Loop - Iteration 3/5

📊 Running tests...
  Average score: 8.4/10 (+0.6)
  Failures: 2/84 criteria (2.4%)

✅ All tests passed threshold (8.0/10)!

📈 Final Results:
  - Total iterations: 3
  - Initial score: 6.2/10
  - Final score: 8.4/10
  - Total improvement: +2.2 points
  - Improvements applied: 7
  - Time: 12.5 minutes

💾 Full history saved to: tests/reports/improvement-history.json
```

## Iteration History Format

The loop tracks complete history for analysis:

```json
{
  "startedAt": "2024-01-15T10:00:00.000Z",
  "completedAt": "2024-01-15T10:12:30.000Z",
  "config": {
    "maxIterations": 5,
    "passThreshold": 8.0,
    "autoApply": false
  },
  "iterations": [
    {
      "number": 1,
      "testResults": {
        "avgScore": 6.2,
        "failures": 12,
        "total": 84,
        "details": [...]
      },
      "improvements": [
        {
          "id": "fix-english-switching",
          "type": "prompt",
          "applied": true,
          "estimatedImpact": 4
        }
      ],
      "commitHash": "abc123def456",
      "duration": 240,
      "timestamp": "2024-01-15T10:04:00.000Z"
    },
    {
      "number": 2,
      "testResults": {
        "avgScore": 7.8,
        "failures": 5,
        "total": 84
      },
      "improvements": [...],
      "commitHash": "def456ghi789",
      "duration": 180,
      "timestamp": "2024-01-15T10:07:00.000Z"
    },
    {
      "number": 3,
      "testResults": {
        "avgScore": 8.4,
        "failures": 2,
        "total": 84
      },
      "improvements": [],
      "duration": 150,
      "timestamp": "2024-01-15T10:09:30.000Z"
    }
  ],
  "finalScore": 8.4,
  "totalImprovement": 2.2,
  "status": "completed",
  "stopReason": "All tests passed threshold"
}
```

## Rollback Support

If an iteration makes things worse, you can roll back:

```bash
# Rollback to a specific iteration
node tests/improve/apply-improvements.mjs --rollback test-iteration-1

# Or use git directly
git reset --hard test-iteration-1
```

## Key Features

### Safety
- ✅ Backups created before every change
- ✅ Diffs shown before applying
- ✅ User confirmation required (unless --auto)
- ✅ Git commits for easy rollback
- ✅ Validation of all proposed changes

### Intelligence
- ✅ Claude analyzes patterns across failures
- ✅ Proposes specific, targeted fixes
- ✅ Prioritizes by impact and confidence
- ✅ Learns from iteration history

### Efficiency
- ✅ Automated testing loop
- ✅ Parallel agent execution where possible
- ✅ Stops when targets met
- ✅ Tracks progress over time

### Flexibility
- ✅ Interactive or fully automated
- ✅ Configurable quality thresholds
- ✅ Manual override at any step
- ✅ Works with or without git

## Cost Estimates

Typical cost per iteration (using Claude Sonnet 4.5):

- Test runner: ~$0.50-1.00 (6 conversations, 10 turns each)
- Failure analysis: ~$0.10-0.20 (analyzing patterns)
- Improvement generation: ~$0.20-0.40 (generating fixes)

**Total per iteration:** ~$0.80-1.60

**Full 5-iteration run:** ~$4-8

## Next Steps

1. **Run your first loop:**
   ```bash
   npm run improve:loop
   ```

2. **Review the results:**
   - Check `tests/reports/improvement-history.json`
   - Review git commits created
   - Compare scores across iterations

3. **Iterate until satisfied:**
   - Adjust threshold if needed
   - Run more iterations
   - Manual tweaks between runs

4. **Use insights for manual improvements:**
   - Review failure patterns
   - Understand what works
   - Apply learnings to future features

## Files Created

All files are in `/Users/josh.petersen/fuori/tests/`:

```
tests/
├── run-simulated-learner.mjs       # Test runner
├── personas/
│   └── learner-personas.ts         # 4 realistic personas
├── judge/
│   └── rubric.ts                   # 14 evaluation criteria
├── report/
│   └── generate-report.ts          # Report formatter
├── improve/
│   ├── analyze-failures.mjs        # Pattern finder
│   ├── generate-improvements.mjs   # Fix proposer
│   ├── apply-improvements.mjs      # Change applier
│   ├── run-improvement-loop.mjs    # Main orchestrator
│   └── LOOP-OVERVIEW.md           # This file
└── reports/
    ├── simulated-learner-*.md      # Test results
    ├── failure-analysis-*.json     # Failure patterns
    ├── improvements-*.json         # Proposed fixes
    └── improvement-history.json    # Full loop history
```

## Integration with Development

The improvement loop is designed to complement your development workflow:

1. **Before making changes:**
   - Run tests to establish baseline
   - Use loop to automatically fix obvious issues

2. **During development:**
   - Make manual changes
   - Run tests to verify
   - Use failure analysis to guide fixes

3. **Before committing:**
   - Run full test suite
   - Review failure patterns
   - Apply high-confidence improvements

4. **Regular maintenance:**
   - Weekly improvement loop runs
   - Track quality trends over time
   - Use insights for architecture decisions

The loop doesn't replace manual development - it accelerates the test-fix-verify cycle and surfaces insights you might miss.
