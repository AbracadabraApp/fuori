# Improvement Generator - Implementation Summary

## What Was Built

Created `/Users/josh.petersen/fuori/tests/improve/generate-improvements.mjs` - an AI-powered improvement generator that analyzes test failures and proposes specific, actionable fixes.

## Key Features

### 1. Claude-Powered Analysis
- Uses Claude Sonnet 4.5 to analyze failure patterns
- Generates specific text changes (exact find/replace)
- Provides reasoning tied to specific failures
- Estimates impact conservatively

### 2. Multiple Improvement Types
- **Prompt improvements** - Rewrites conversation prompts
- **Level rule adjustments** - Modifies A1/A2 constraints  
- **Character sheet additions** - Adds missing behavioral rules
- **System instruction clarifications** - Improves rubric/house rules

### 3. Validation & Enrichment
- Validates target files exist
- Checks original text is found (with line numbers)
- Links improvements to specific failures
- Identifies validation warnings

### 4. Prioritization
- Scores improvements by impact (60%) + confidence (40%)
- Ranks by effectiveness
- Highlights high-confidence fixes

## Architecture

```
Input: failure-analysis.json
  ↓
Load source files (prompts, levels, characters, rubric)
  ↓
Build comprehensive prompt for Claude
  ↓
Claude analyzes patterns → proposes fixes
  ↓
Parse and validate improvements
  ↓
Enrich with metadata (addressed failures, line numbers)
  ↓
Prioritize by impact score
  ↓
Output: improvements.json
```

## Output Structure

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
      reasoning: "4 failures showed...",
      estimatedImpact: 4,
      confidence: 'high',
      
      // Enrichments
      validation: { fileExists: true, textExists: true, lineNumber: 78 },
      addressedFailures: [...],
      priorityScore: 0.94,
      priorityRank: 1
    }
  ],
  summary: { ... },
  metadata: { ... }
}
```

## Usage

### CLI
```bash
node tests/improve/generate-improvements.mjs tests/reports/analysis-*.json
```

### Module API
```javascript
import { generateImprovements, prioritizeImprovements } from './generate-improvements.mjs';

const result = await generateImprovements(failureAnalysis, {
  projectRoot: process.cwd(),
  maxImprovements: 10,
  focusTypes: ['prompt', 'level', 'character', 'system']
});

const prioritized = prioritizeImprovements(result.improvements);
```

## Example Output

See `/Users/josh.petersen/fuori/tests/improve/example-improvements.json` for a realistic example showing:
- System prompt clarifications (fixing English-switching)
- Transcription noise handling improvements
- Character sheet language policy additions
- A1 level confusion guidance
- Rubric criteria clarifications

Each improvement includes:
- Exact text to find/replace
- Specific failure references
- Conservative impact estimates
- Validation status

## Integration with Test Loop

```
1. Run tests → results.json
2. Analyze failures → analysis.json
3. Generate improvements → improvements.json ✨ (this tool)
4. Apply improvements → apply-improvements.mjs
5. Re-run tests → measure impact
6. Iterate
```

## Key Design Decisions

### Why Claude?
- Understands context of language teaching
- Can propose nuanced prompt changes
- Reasons about failure patterns
- Generates human-quality explanations

### Why Conservative Estimates?
- Prevents over-promising
- Focuses on high-confidence fixes first
- Easier to track actual vs estimated impact

### Why Exact Text Matching?
- Enables safe automated application
- No ambiguity about what to change
- Easy to review before applying

### Why Prioritization?
- Apply high-impact fixes first
- Test incrementally
- Avoid applying low-confidence changes

## Example Improvements Generated

From the real failure analysis of 5 failures:

1. **fix-english-switching-system-prompt** (priority #1)
   - Type: prompt
   - Impact: 4 failures
   - Confidence: high
   - Makes "never switch to English" absolute with Italian alternatives

2. **improve-transcription-noise-handling** (priority #2)
   - Type: prompt
   - Impact: 2 failures
   - Confidence: high
   - Adds examples distinguishing noise from real errors

3. **strengthen-a1-level-confusion-guidance** (priority #4)
   - Type: level
   - Impact: 2 failures
   - Confidence: medium
   - Adds confusion-handling to A1 support strategies

## Files Created

1. `/Users/josh.petersen/fuori/tests/improve/generate-improvements.mjs` (478 lines)
   - Main generator with Claude integration
   - Validation and enrichment logic
   - Prioritization algorithm
   - CLI interface

2. `/Users/josh.petersen/fuori/tests/improve/example-improvements.json`
   - Realistic example output
   - Shows all improvement types
   - Demonstrates prioritization

3. Updated `/Users/josh.petersen/fuori/tests/improve/README.md`
   - Added improvement generator documentation
   - Usage examples
   - Integration guide

## Next Steps

1. **Test the generator** with real failure analysis:
   ```bash
   node tests/improve/generate-improvements.mjs tests/reports/failure-analysis-*.json
   ```

2. **Review generated improvements** - check that reasoning and impact make sense

3. **Apply high-confidence improvements** using apply-improvements.mjs

4. **Re-run tests** to measure actual impact vs estimates

5. **Iterate** - refine the system prompt for better suggestions

## Configuration

The generator can be tuned via:
- `maxImprovements` - limit number of suggestions (default: 10)
- `focusTypes` - focus on specific improvement types
- Claude temperature - currently 0.3 for focused suggestions
- Source files loaded - controls what Claude sees as context

## Success Metrics

The generator is working well if:
- ✅ High-confidence improvements fix 60%+ of targeted failures
- ✅ No improvements break passing tests
- ✅ Reasoning clearly ties back to failure patterns
- ✅ originalText validation succeeds (no file errors)
- ✅ Prioritization ranks most impactful fixes first

## Notes

- Uses `claude-sonnet-4-5-20250929` model
- Temperature 0.3 for practical suggestions
- Loads 6 key source files for context
- Maintains character personality in changes
- Focuses on clarifying ambiguous instructions over major rewrites
