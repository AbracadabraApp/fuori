# Improvement System

Automated improvement generation and application based on test failure analysis. This directory contains tools to analyze failures, generate fixes, and safely apply them to the codebase.

## Tools Overview

1. **analyze-failures.mjs** - Analyzes test results to identify patterns and root causes
2. **generate-improvements.mjs** ✨ - Uses Claude to propose specific fixes
3. **apply-improvements.mjs** - Safely applies improvements with backups and git integration
4. **run-improvement-loop.mjs** - Orchestrates the full improvement cycle

## Features

### Failure Analysis
- Pattern detection across multiple test failures
- Root cause identification
- Categorization by failure type (language switching, level violations, etc.)

### Improvement Generation
- Claude-powered fix proposals
- Specific text changes with exact find/replace
- Impact estimation and confidence scoring
- Automatic prioritization by effectiveness

### Safe Application
- Backups before applying any changes
- User confirmation with diff previews
- Git integration with commits and tags
- Easy rollback support

## Quick Start

```bash
# 1. Run tests and generate failures
npm run test:personas

# 2. Analyze failures to find patterns
node tests/improve/analyze-failures.mjs tests/reports/results-latest.json

# 3. Generate AI-powered improvement suggestions
node tests/improve/generate-improvements.mjs tests/reports/analysis-latest.json

# 4. Review and apply improvements
node tests/improve/apply-improvements.mjs tests/reports/analysis-latest-improvements.json

# 5. Or run the complete loop automatically
node tests/improve/run-improvement-loop.mjs tests/reports/results-latest.json
```

## Detailed Usage

### 1. Analyze Failures

```bash
node tests/improve/analyze-failures.mjs tests/reports/results-*.json
```

Outputs: `tests/reports/analysis-TIMESTAMP.json` with:
- Patterns across failures (e.g., "NPC switching to English")
- Root causes by category
- Specific failure details

### 2. Generate Improvements

```bash
node tests/improve/generate-improvements.mjs tests/reports/analysis-*.json
```

Outputs: `tests/reports/analysis-*-improvements.json` with:
- Specific proposed fixes
- Impact estimates
- Confidence levels
- Priority rankings

### 3. Apply Improvements

See "Improvement Applier" section below for details on safe application.

---

## Improvement Generator

Uses Claude to analyze failures and propose specific fixes.

### Improvement Types

#### `prompt` - Conversation Prompt Changes
Changes to prompts in `app/api/turn/route.ts`

**Example**: Clarifying language-switching behavior
```typescript
// Original
"1. Stay entirely in Italian (never switch to English unprompted)"

// Proposed
"1. Stay entirely in Italian at ALL times. NEVER switch to English."
```

#### `level` - Level Definition Adjustments
Modifications to level rules in `content/it/levels/`

**Example**: Making A1 constraints more explicit
```typescript
// Original
sentenceLength: '3-5 words per sentence'

// Proposed
sentenceLength: '3-5 words per sentence (strictly count before responding)'
```

#### `character` - Character Sheet Updates
Additions to character definitions in `content/it/characters/`

**Example**: Adding explicit language policy
```typescript
speech: {
  formality: 'tu',
  pace: 'quick',
  regionalisms: ['daje'],
  languagePolicy: 'Italian only - never switch to English'
}
```

#### `system` - System Instruction Changes
Updates to rubric or judge criteria in `tests/judge/rubric.ts`

### Output Structure

```javascript
{
  improvements: [
    {
      id: 'fix-english-switching',
      type: 'prompt',
      targetFile: 'app/api/turn/route.ts',
      description: 'Add explicit instruction to never switch to English',
      originalText: "...",
      proposedText: "...",
      reasoning: "4 failures showed NPC switching to English...",
      estimatedImpact: 4,
      confidence: 'high',

      // Enrichments
      validation: { fileExists: true, textExists: true, lineNumber: 78 },
      addressedFailures: [...],
      priorityScore: 0.94,
      priorityRank: 1
    }
  ],
  summary: {
    totalImprovements: 8,
    byType: { prompt: 4, level: 2, character: 2 },
    totalEstimatedFixes: 23,
    fixRate: '76.7%',
    highConfidenceCount: 5
  }
}
```

### Prioritization Algorithm

```
priorityScore = (normalizedImpact × 0.6) + (confidenceScore × 0.4)

where:
  normalizedImpact = min(estimatedImpact / 20, 1.0)
  confidenceScore = { high: 1.0, medium: 0.6, low: 0.3 }
```

Higher scores = higher priority

### Module API

```javascript
import { generateImprovements, prioritizeImprovements } from './generate-improvements.mjs';

// Generate improvements
const result = await generateImprovements(failureAnalysis, {
  projectRoot: process.cwd(),
  maxImprovements: 10,
  focusTypes: ['prompt', 'level', 'character', 'system']
});

// Prioritize by impact
const prioritized = prioritizeImprovements(result.improvements);
```

---

## Improvement Applier

### As a Module

```javascript
import { applyImprovements, showDiff, rollbackIteration } from './apply-improvements.mjs';

// Manual mode - asks for confirmation
const improvements = [
  {
    improvementId: 'fix-english-switching',
    file: '/path/to/file.js',
    oldString: 'old code',
    newString: 'new code',
    description: 'Fix English switching bug',
    category: 'bug-fix'
  }
];

const result = await applyImprovements(improvements);
console.log(result);
// {
//   applied: [
//     { improvementId: 'fix-english-switching', status: 'applied', file: '...' }
//   ],
//   skipped: [],
//   commit: 'abc123',
//   tag: 'test-iteration-1'
// }

// Auto mode - applies all without confirmation
const result = await applyImprovements(improvements, {
  auto: true,
  iteration: 5
});

// Show diff only
showDiff(improvements[0]);

// Rollback to previous iteration
await rollbackIteration('test-iteration-4');
```

### As a CLI Tool

```bash
# Apply improvements with confirmation
node apply-improvements.mjs --input improvements.json

# Auto-apply all improvements
node apply-improvements.mjs --input improvements.json --auto --iteration 5

# Rollback to a previous iteration
node apply-improvements.mjs --rollback test-iteration-4

# Show help
node apply-improvements.mjs --help
```

## Input Format

The improvement applier expects an array of improvement objects in JSON format:

```json
[
  {
    "improvementId": "fix-english-switching",
    "file": "/absolute/path/to/file.js",
    "oldString": "code to replace",
    "newString": "new code",
    "description": "Human-readable description",
    "category": "bug-fix"
  }
]
```

### Required Fields

- `improvementId`: Unique identifier for tracking
- `file`: Absolute path to the file to modify
- `oldString`: The exact text to replace
- `newString`: The text to replace it with

### Optional Fields

- `description`: Human-readable description of the change
- `category`: Category of improvement (e.g., 'bug-fix', 'enhancement', 'refactor')

## Output Format

The applier returns a result object:

```javascript
{
  applied: [
    {
      improvementId: 'fix-english-switching',
      status: 'applied',
      file: '/path/to/file.js',
      backupPath: '/path/to/.backups/file.js.2026-10-10T12-00-00-000Z.backup'
    }
  ],
  skipped: [
    {
      improvementId: 'other-fix',
      reason: 'user declined',
      file: '/path/to/other.js'
    }
  ],
  commit: 'abc123def456',
  tag: 'test-iteration-5'
}
```

## Safety Features

### Backups

Before applying any change, the applier creates a backup of the original file in `tests/improve/.backups/`. Backups are timestamped and can be used for manual recovery if needed.

### Diff Preview

Before applying each change, the applier shows a unified diff so you can see exactly what will change.

### User Confirmation

In manual mode (default), the applier asks for confirmation before applying each change. Use `--auto` to skip confirmation.

### Rollback Support

You can rollback to any previous commit or tag:

```bash
# Rollback to a specific iteration
node apply-improvements.mjs --rollback test-iteration-4

# Rollback to a specific commit
node apply-improvements.mjs --rollback abc123def456
```

### Git Integration

When changes are applied:

1. All modified files are staged
2. A commit is created with a descriptive message
3. If an iteration number is provided, a tag is created (e.g., `test-iteration-5`)

This makes it easy to track which improvements were applied when and rollback if needed.

## Options

### applyImprovements(improvements, options)

- `auto` (boolean, default: false): Auto-apply without confirmation
- `iteration` (number, default: null): Test iteration number for tagging
- `createBackup` (boolean, default: true): Create backups before applying
- `commit` (boolean, default: true): Create git commit
- `tag` (boolean, default: true): Create git tag (requires iteration)

### showDiff(improvement)

Returns an object with:
- `filepath`: Absolute path to the file
- `diff`: Unified diff string
- `willApply`: Boolean indicating if the change can be applied
- `newContent`: The new file content after applying the change

### rollbackIteration(commitHash)

- `commitHash` (string): Git commit hash or tag name to rollback to

## Examples

### Example 1: Manual Application

```bash
# Create improvements.json
cat > improvements.json << 'EOF'
[
  {
    "improvementId": "fix-greeting",
    "file": "/path/to/app.js",
    "oldString": "console.log('hello');",
    "newString": "console.log('Hello, World!');",
    "description": "Improve greeting message"
  }
]
EOF

# Apply with confirmation
node apply-improvements.mjs --input improvements.json
```

### Example 2: Automated Workflow

```bash
# Generate improvements from test iteration
node detect-improvements.mjs --iteration 5 --output improvements.json

# Auto-apply all improvements
node apply-improvements.mjs --input improvements.json --auto --iteration 5

# Run tests
npm test

# If tests fail, rollback
node apply-improvements.mjs --rollback test-iteration-4
```

### Example 3: Programmatic Usage

```javascript
import { applyImprovements, rollbackIteration } from './apply-improvements.mjs';

async function improveAndTest() {
  const improvements = await generateImprovements();

  // Apply improvements
  const result = await applyImprovements(improvements, {
    auto: true,
    iteration: 5
  });

  // Run tests
  const testsPassed = await runTests();

  if (!testsPassed && result.commit) {
    // Rollback if tests fail
    await rollbackIteration(result.commit + '~1');
  }

  return testsPassed;
}
```

## Integration with Test Workflow

The improvement applier is designed to integrate with the simulated learner test workflow:

1. **Run Tests**: `npm run test:learner` to generate conversation data
2. **Detect Issues**: Analyze test results to identify improvements needed
3. **Generate Improvements**: Create `improvements.json` with proposed changes
4. **Apply Improvements**: Use this tool to safely apply changes
5. **Verify**: Run tests again to ensure improvements work
6. **Rollback if Needed**: Use rollback if changes cause regressions

## Troubleshooting

### "File does not exist"

The `file` path in your improvement object must be an absolute path, not relative.

### "Old string not found in file"

The `oldString` must exactly match the text in the file, including whitespace and indentation.

### "Git commit failed"

Make sure you're in a git repository and have no uncommitted changes that would conflict.

### Backups not working

Check that the `tests/improve/.backups/` directory is writable.

## See Also

- [Testing Documentation](../../docs/10-testing.md) - Overview of the test framework
- [Simulated Learner Tests](../README.md) - Running conversation tests
- [Judge Rubric](../judge/README.md) - Understanding test evaluation
