# Improvement Loop Orchestrator

**Status:** ✅ Complete and ready to use

## Overview

The improvement loop orchestrator (`run-improvement-loop.mjs`) is the main controller that ties together the entire improvement system. It runs a continuous cycle of testing, analysis, improvement, and verification until conversation quality meets the target threshold.

## What It Does

### The Improvement Cycle

```
┌─────────────────────────────────────────────────────────┐
│                    IMPROVEMENT LOOP                     │
└─────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │  Run Tests   │  Execute simulated learner conversations
     └──────┬───────┘  Get scores from judge
            │
            ▼
     ┌──────────────┐
     │   Analyze    │  Identify failure patterns
     └──────┬───────┘  Group by type and severity
            │
            ▼
     ┌──────────────┐
     │   Generate   │  Create improvement proposals
     └──────┬───────┘  Estimate impact and priority
            │
            ▼
     ┌──────────────┐
     │  Get Approval│  Show improvements to user
     └──────┬───────┘  (unless --auto mode)
            │
            ▼
     ┌──────────────┐
     │    Apply     │  Modify code/prompts
     └──────┬───────┘  Create git commit
            │
            ▼
     ┌──────────────┐
     │  Run Tests   │  Verify improvements worked
     └──────┬───────┘  Compare scores
            │
            ▼
     ┌──────────────┐
     │   Continue?  │  Loop until done
     └──────────────┘
          │     │
        Yes    No → Done!
          │
          └─────┐
                ▼
```

### Stopping Conditions

The loop automatically stops when:

1. **Success:** All tests pass threshold (default: 8.0/10)
2. **Plateau:** No more improvements can be generated
3. **Limit:** Maximum iterations reached (default: 5)
4. **User:** User chooses to stop (interactive mode)
5. **Error:** Fatal error occurs in any step

## Usage

### Command Line

```bash
# Interactive mode (asks for approval on each improvement)
npm run improve:loop

# Auto mode (applies all improvements without asking)
npm run improve:loop:auto

# With custom configuration
npm run improve:loop -- --max 10 --threshold 9.0

# Verbose output (show all details)
npm run improve:loop:verbose

# Combination of options
npm run improve:loop -- --auto --max 10 --threshold 8.5 --verbose
```

### Programmatic

```javascript
import { runImprovementLoop } from './tests/improve/run-improvement-loop.mjs';

// Run with custom options
const history = await runImprovementLoop({
  maxIterations: 10,
  passThreshold: 8.5,
  autoApply: true,
  verbose: false,
});

console.log(`Final score: ${history.finalScore}`);
console.log(`Improvement: +${history.totalImprovement} points`);
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `--max N` | 5 | Stop after N iterations |
| `--threshold X` | 8.0 | Tests must score ≥ X to pass |
| `--auto` | false | Apply all improvements without confirmation |
| `--verbose` | false | Show detailed output for debugging |

## Output

### During Execution

```
🔄 Starting Improvement Loop

Configuration:
  Max iterations: 5
  Pass threshold: 8.0/10
  Mode: Interactive
  Verbose: false

============================================================
ITERATION 1/5
============================================================

▶ Running simulated learner tests...
  ✓ Tests complete: 6.5/10 avg, 8/12 below threshold

▶ Analyzing failures and generating improvements...
  ✓ Generated 3 improvement suggestions

Generated improvements:

[1] Fix critical conversation quality issues
    Priority: high
    4 tests scored below 5.0. These indicate fundamental...
    Files: lib/conversation.ts, lib/prompts.ts
    Estimated impact: +1.5 to +2.5 points

[2] Improve scaffolding and error handling
    Priority: medium
    4 tests scored between 5.0 and 8.0...
    Files: lib/conversation.ts
    Estimated impact: +0.5 to +1.5 points

Which improvements to apply? (comma-separated numbers, "all", or "none"): 1,2

▶ Applying improvements...
  • Applying: Fix critical conversation quality issues
  • Applying: Improve scaffolding and error handling
  ✓ Applied 2 improvements
  ✓ Created commit: abc123def

✓ Iteration 1 complete

[... next iteration ...]
```

### Generated Files

1. **History File:** `/tests/reports/improvement-history.json`

```json
{
  "startedAt": "2026-10-10T12:00:00.000Z",
  "completedAt": "2026-10-10T12:15:00.000Z",
  "status": "completed",
  "stopReason": "all_tests_passing",
  "config": {
    "maxIterations": 5,
    "passThreshold": 8.0,
    "autoApply": false
  },
  "iterations": [
    {
      "number": 1,
      "testResults": {
        "avgScore": 6.5,
        "failures": 8,
        "total": 12,
        "details": [...]
      },
      "improvements": [...],
      "appliedImprovements": [...],
      "commitHash": "abc123def",
      "duration": 45.2,
      "timestamp": "2026-10-10T12:00:00.000Z"
    }
  ],
  "finalScore": 8.2,
  "totalImprovement": 1.7
}
```

2. **Progress Report:** `/tests/reports/improvement-progress-[timestamp].md`

```markdown
# Improvement Loop Progress Report

**Iterations:** 3
**Started:** 10/10/2026, 12:00:00 PM
**Latest:** 10/10/2026, 12:15:00 PM

## Summary

- Initial score: 6.5/10
- Current score: 8.2/10
- Total improvement: +1.7 points
- Current failures: 0/12

## Iteration History

### Iteration 1
- Score: 6.5/10
- Failures: 8/12
- Improvements applied: 2

**Applied improvements:**
- Fix critical conversation quality issues
- Improve scaffolding and error handling

[...]
```

3. **Test Reports:** `/tests/reports/simulated-learner-[timestamp].md`
   - One generated per iteration
   - Contains full conversation transcripts
   - Includes judge scores and feedback

## Utilities

The orchestrator exports utility functions:

### compareIterations()

Compare results between two iterations:

```javascript
import { compareIterations } from './tests/improve/run-improvement-loop.mjs';

const comparison = compareIterations(history.iterations[0], history.iterations[1]);

console.log(comparison);
// {
//   scoreDelta: +1.3,
//   failureDelta: -3,  // 3 fewer failures
//   improved: true,
//   scoreChange: 'increased',
//   failureChange: 'decreased'
// }
```

### generateProgressReport()

Generate a markdown progress report:

```javascript
import { generateProgressReport } from './tests/improve/run-improvement-loop.mjs';

const report = generateProgressReport(history.iterations);
console.log(report);  // Markdown string
```

## Architecture

### File Structure

```
tests/improve/
├── run-improvement-loop.mjs   ← Main orchestrator (THIS FILE)
├── analyze-failures.mjs        ← Pattern detection (TODO)
├── generate-improvements.mjs   ← Fix generation (TODO)
├── apply-improvements.mjs      ← Code modification (TODO)
├── README.md                   ← Full system docs
└── ORCHESTRATOR.md            ← This file
```

### Dependencies

The orchestrator integrates with:

- **Test Runner:** `/tests/run-simulated-learner.mjs`
  - Runs conversations with simulated learners
  - Calls judge to score quality
  - Generates test reports

- **Failure Analyzer:** `analyze-failures.mjs` (TODO)
  - Parses judge feedback
  - Groups failures by pattern
  - Identifies root causes

- **Improvement Generator:** `generate-improvements.mjs` (TODO)
  - Uses Claude to analyze patterns
  - Creates specific, actionable fixes
  - Estimates impact and priority

- **Improvement Applier:** `apply-improvements.mjs` (TODO)
  - Safely modifies files
  - Creates backups
  - Commits changes to git

## Implementation Status

### ✅ Complete

- Main loop structure and flow control
- Test runner integration
- User approval/selection flow
- Iteration history tracking
- Progress report generation
- Git commit integration
- CLI argument parsing
- Error handling and recovery
- Stopping condition logic
- Programmatic API

### ⏳ TODO (Using Mocks)

The orchestrator currently uses **mock implementations** for:

1. **Failure Analysis** - Returns placeholder improvement suggestions
2. **Improvement Generation** - Based on simple score thresholds
3. **Improvement Application** - Simulates applying changes

These need to be replaced with real implementations in:
- `analyze-failures.mjs` - Parse judge feedback, detect patterns
- `generate-improvements.mjs` - Use Claude to create fixes
- `apply-improvements.mjs` - Modify actual files safely

The mock implementations are sufficient to demonstrate the full loop workflow, but the actual improvements won't have real effects until the TODO modules are implemented.

## Example Workflow

### Starting Fresh

```bash
# Run initial tests to establish baseline
npm run test:learner

# Check results (look for low scores)
cat tests/reports/simulated-learner-*.md | tail -50

# Start improvement loop
npm run improve:loop

# Review each suggested improvement
# Approve the ones that make sense
# Loop continues until tests pass
```

### Resuming After Changes

```bash
# If you made manual changes, verify they work
npm run test:learner

# Continue improving if scores still low
npm run improve:loop

# Use auto mode if you trust the suggestions
npm run improve:loop:auto
```

### Higher Quality Bar

```bash
# Set threshold to 9.0 for production-ready quality
npm run improve:loop -- --threshold 9.0 --max 10

# This may require many more iterations
# and generate different types of improvements
```

## Advanced Usage

### Custom Iteration Logic

```javascript
import { runImprovementLoop } from './tests/improve/run-improvement-loop.mjs';

async function improveUntilProduction() {
  let threshold = 7.0;  // Start easy

  while (threshold < 9.0) {
    console.log(`\nTarget threshold: ${threshold}/10`);

    const history = await runImprovementLoop({
      passThreshold: threshold,
      maxIterations: 3,
      autoApply: false,  // Review each change
    });

    if (history.status !== 'completed') {
      console.log('Failed to reach threshold, stopping');
      break;
    }

    // Increase bar for next round
    threshold += 0.5;
  }

  console.log('Production quality achieved!');
}

await improveUntilProduction();
```

### Selective Improvement Application

```javascript
import { runImprovementLoop } from './tests/improve/run-improvement-loop.mjs';

async function applyOnlyCritical() {
  // Run the loop but filter improvements
  const history = await runImprovementLoop({
    maxIterations: 10,
    autoApply: false,  // We'll review each one
  });

  // Later analysis
  const criticalFixes = history.iterations
    .flatMap(iter => iter.appliedImprovements)
    .filter(imp => imp.priority === 'high');

  console.log(`Applied ${criticalFixes.length} critical fixes`);
}
```

## Troubleshooting

### "No test reports found"

The orchestrator needs test results to analyze. Run the test suite first:

```bash
npm run test:learner
```

### "Command failed: npm run test:learner"

Check that:
- `ANTHROPIC_API_KEY` is set in `.env.local`
- Test personas and scenes are properly configured
- No syntax errors in test runner

### Loop stops immediately

Check:
- Initial test scores may already be above threshold
- Test runner may be failing (check reports directory)
- Git may have uncommitted changes preventing commits

### Improvements have no effect

This is expected with mock implementations. The orchestrator structure is complete, but the actual improvement logic (analysis, generation, application) needs to be implemented in the separate modules.

### Git commits fail

Ensure:
- Working directory is clean before starting
- You have write permissions
- Repository is initialized
- No merge conflicts

## Next Steps

To make the improvement loop fully functional:

1. **Implement `analyze-failures.mjs`**
   - Parse judge criteria and scores
   - Group failures by pattern
   - Extract quotes and examples
   - Identify root causes

2. **Implement `generate-improvements.mjs`**
   - Use Claude to analyze patterns
   - Generate specific code/prompt changes
   - Provide find/replace operations
   - Estimate impact scores

3. **Implement `apply-improvements.mjs`**
   - Safe file modification
   - Backup original files
   - Apply find/replace operations
   - Verify changes compile
   - Rollback on errors

4. **Enhance orchestrator**
   - Add visualization of progress
   - Support partial rollback
   - Add dry-run mode
   - Improve error recovery

## See Also

- `/tests/README.md` - Overall testing documentation
- `/tests/improve/README.md` - Full improvement system docs
- `/tests/run-simulated-learner.mjs` - Test runner
- `/docs/10-testing.md` - Testing strategy
