# Improvement Applier - Quick Reference

## Command Line

```bash
# Help
node apply-improvements.mjs --help

# Manual mode (confirm each change)
node apply-improvements.mjs --input improvements.json

# Auto mode (apply all)
node apply-improvements.mjs --input improvements.json --auto --iteration 5

# Rollback
node apply-improvements.mjs --rollback test-iteration-4
```

## API

```javascript
import { applyImprovements, showDiff, rollbackIteration } from './apply-improvements.mjs';

// Apply improvements
const result = await applyImprovements(improvements, {
  auto: false,          // false = ask for confirmation, true = auto-apply
  iteration: 5,         // iteration number for git tag
  createBackup: true,   // create backups before applying
  commit: true,         // create git commit
  tag: true            // create git tag (requires iteration)
});

// Show diff only (no changes)
const { willApply, diff, filepath } = showDiff(improvement);

// Rollback to commit or tag
await rollbackIteration('test-iteration-4');
await rollbackIteration('abc123');
```

## Input Format

```json
[
  {
    "improvementId": "fix-english-switching",
    "file": "/absolute/path/to/file.js",
    "oldString": "exact text to replace",
    "newString": "replacement text",
    "description": "Human readable description",
    "category": "bug-fix"
  }
]
```

## Output Format

```javascript
{
  applied: [
    { improvementId: 'fix-1', status: 'applied', file: '...', backupPath: '...' }
  ],
  skipped: [
    { improvementId: 'fix-2', reason: 'user declined', file: '...' }
  ],
  commit: 'abc123',
  tag: 'test-iteration-5'
}
```

## Common Workflows

### Manual Review
```bash
# Apply with confirmation for each change
node apply-improvements.mjs --input improvements.json
```

### Automated Testing
```bash
# Auto-apply and tag
node apply-improvements.mjs --input improvements.json --auto --iteration 5

# Run tests
npm test

# Rollback if tests fail
node apply-improvements.mjs --rollback test-iteration-4
```

### Preview Only
```javascript
import { showDiff } from './apply-improvements.mjs';

for (const improvement of improvements) {
  const result = showDiff(improvement);
  if (result.willApply) {
    console.log('Would apply:', improvement.improvementId);
  }
}
```

## Safety Features

- ✅ Backups created automatically in `.backups/`
- ✅ Shows diff before applying
- ✅ User confirmation (unless --auto)
- ✅ Validates file exists and string matches
- ✅ Git integration with commits and tags
- ✅ Easy rollback to any previous state
- ✅ Restores from backup on write failure

## Troubleshooting

| Error | Solution |
|-------|----------|
| "File does not exist" | Use absolute path, not relative |
| "Old string not found" | Check exact whitespace and line endings |
| "Git commit failed" | Ensure you're in a git repo with no conflicts |

## Files

- `apply-improvements.mjs` - Main applier
- `test-applier.mjs` - Test suite
- `example-usage.mjs` - Usage examples
- `README.md` - Full documentation
- `USAGE.md` - Detailed guide

## Run Tests

```bash
# Run all tests
node test-applier.mjs

# Run examples
node example-usage.mjs
```
