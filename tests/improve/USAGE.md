# Quick Start Guide: Improvement Applier

## Basic Usage

### 1. Create an Improvements File

Create a JSON file with the improvements you want to apply:

```json
[
  {
    "improvementId": "fix-english-switching",
    "file": "/absolute/path/to/file.js",
    "oldString": "if (confused) return 'I do not understand';",
    "newString": "if (confused) return 'Non capisco';",
    "description": "Fix English response when confused",
    "category": "bug-fix"
  }
]
```

### 2. Apply with Confirmation (Manual Mode)

```bash
node apply-improvements.mjs --input improvements.json
```

This will:
- Show a diff for each improvement
- Ask "Apply this change? (y/n)"
- Create backups before applying
- Show a summary when done

### 3. Auto-Apply (No Confirmation)

```bash
node apply-improvements.mjs --input improvements.json --auto --iteration 5
```

This will:
- Apply all improvements automatically
- Create a git commit with iteration number
- Tag the commit as `test-iteration-5`

## Common Workflows

### Manual Review and Apply

Good for when you want to carefully review each change:

```bash
# Apply with confirmation
node apply-improvements.mjs --input improvements.json

# If satisfied, commit manually
git add .
git commit -m "Apply improvements from manual review"
```

### Automated Testing Workflow

Good for CI/CD or automated improvement loops:

```bash
# Auto-apply and tag
node apply-improvements.mjs --input improvements.json --auto --iteration 5

# Run tests
npm test

# If tests fail, rollback
node apply-improvements.mjs --rollback test-iteration-4
```

### Preview Only

To see what would change without applying:

```javascript
import { showDiff } from './apply-improvements.mjs';

const improvement = { /* ... */ };
const result = showDiff(improvement);

if (result.willApply) {
  console.log('Would apply this change:');
  console.log(result.diff);
}
```

## Output Format

The applier returns detailed results:

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
      improvementId: 'another-fix',
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

Every file is backed up before modification:

```
tests/improve/.backups/
  file.js.2026-10-10T12-00-00-000Z.backup
  other.js.2026-10-10T12-15-30-000Z.backup
```

### Git Integration

Creates clean commits with descriptive messages:

```
commit abc123def456
Author: You <you@example.com>
Date:   Sat Oct 10 12:00:00 2026

    Apply improvements from iteration 5

    Improvements: fix-english-switching, improve-scaffolding
```

### Rollback Support

Easy rollback to any previous state:

```bash
# Rollback to specific iteration
node apply-improvements.mjs --rollback test-iteration-4

# Rollback to specific commit
node apply-improvements.mjs --rollback abc123

# Rollback one commit
node apply-improvements.mjs --rollback HEAD~1
```

## Tips

### Finding the Right String to Replace

The `oldString` must match exactly, including whitespace. To find it:

1. Open the file in your editor
2. Copy the exact text you want to replace
3. Use that as `oldString`

### Multiple Changes in One File

You can have multiple improvements for the same file. They will be applied in order:

```json
[
  {
    "improvementId": "fix-1",
    "file": "/path/to/file.js",
    "oldString": "old code 1",
    "newString": "new code 1"
  },
  {
    "improvementId": "fix-2",
    "file": "/path/to/file.js",
    "oldString": "old code 2",
    "newString": "new code 2"
  }
]
```

**Important**: If the changes overlap or affect each other, apply them one at a time to avoid conflicts.

### Absolute Paths Required

All file paths must be absolute:

```json
{
  "file": "/Users/you/project/src/file.js"  // ✅ Good
  "file": "src/file.js"                      // ❌ Bad - relative path
}
```

### Testing Your Improvements

Before applying to your main codebase:

1. Create a test branch: `git checkout -b test-improvements`
2. Apply improvements: `node apply-improvements.mjs --input improvements.json --auto`
3. Run tests: `npm test`
4. If good: `git checkout main && git merge test-improvements`
5. If bad: `git checkout main && git branch -D test-improvements`

## Troubleshooting

### "Old string not found in file"

The text in `oldString` doesn't exist in the file. Check:
- Exact whitespace and indentation
- Line endings (LF vs CRLF)
- The string hasn't already been replaced

### "File does not exist"

The path in `file` is wrong. Check:
- Using absolute path, not relative
- File hasn't been moved or renamed
- Typo in the path

### "Git commit failed"

Common causes:
- Not in a git repository
- Uncommitted changes that would conflict
- No changes to commit (all improvements were skipped)

### Backup Not Restoring

If manual backup restoration is needed:

```bash
# Find your backup
ls tests/improve/.backups/

# Copy it back
cp tests/improve/.backups/file.js.TIMESTAMP.backup path/to/file.js
```

## Advanced Usage

### Programmatic API

```javascript
import { applyImprovements, showDiff, rollbackIteration } from './apply-improvements.mjs';

// Custom workflow
async function improveAndVerify(improvements) {
  // Preview all changes
  for (const improvement of improvements) {
    const result = showDiff(improvement);
    if (!result.willApply) {
      console.warn(`Cannot apply: ${improvement.improvementId}`);
    }
  }

  // Apply with custom options
  const result = await applyImprovements(improvements, {
    auto: true,
    createBackup: true,
    commit: true,
    tag: true,
    iteration: 5
  });

  // Custom validation
  if (result.applied.length === 0) {
    throw new Error('No improvements were applied!');
  }

  // Run custom tests
  const passed = await runCustomTests();

  if (!passed && result.commit) {
    await rollbackIteration(result.commit + '~1');
  }

  return result;
}
```

### Integration with Testing Framework

```javascript
import { applyImprovements } from './apply-improvements.mjs';
import { runSimulatedLearner } from '../run-simulated-learner.mjs';

async function improvementLoop(maxIterations = 10) {
  for (let i = 1; i <= maxIterations; i++) {
    console.log(`\n🔄 Iteration ${i}/${maxIterations}`);

    // Run tests
    const testResults = await runSimulatedLearner();

    // Analyze failures
    const improvements = await analyzeFailures(testResults);

    if (improvements.length === 0) {
      console.log('✅ No improvements needed!');
      break;
    }

    // Apply improvements
    await applyImprovements(improvements, {
      auto: true,
      iteration: i
    });

    // Verify improvements
    const newResults = await runSimulatedLearner();
    const improved = compareResults(testResults, newResults);

    if (!improved) {
      console.warn('⚠️  Improvements did not help, rolling back');
      await rollbackIteration(`test-iteration-${i}`);
      break;
    }
  }
}
```

## See Also

- [README.md](./README.md) - Full documentation
- [Test Applier Tests](./test-applier.mjs) - Test suite examples
- [Simulated Learner Tests](../README.md) - Testing framework overview
