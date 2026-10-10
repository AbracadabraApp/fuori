#!/usr/bin/env node
/**
 * Failure Analyzer for Test Results
 *
 * Analyzes test reports to identify patterns in failures and categorize root causes.
 * Helps prioritize prompt and level rule improvements.
 *
 * Usage:
 *   node tests/improve/analyze-failures.mjs <path-to-report.json>
 *   npm run analyze:failures <path-to-report.json>
 *
 * See: docs/10-testing.md section 4b
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';

// ============================================================================
// Configuration
// ============================================================================

const FAILURE_THRESHOLD = 6; // Scores below this are considered failures
const PATTERN_MIN_OCCURRENCES = 2; // Minimum times a pattern must appear

// Criterion categories from rubric
const CRITERIA_CATEGORIES = {
  forgiveness: ['forgiveness-transcription-noise', 'forgiveness-no-accent-errors'],
  correction: ['correction-real-mistakes-recast', 'correction-appropriate-selection'],
  character: ['character-stays-in-italian', 'character-personality-consistent', 'character-regional-appropriate'],
  help: ['help-hint-null-most-turns', 'help-confused-flag-appropriate', 'help-natural-scaffolding'],
  goals: ['goals-steps-accurate', 'goals-scene-completion'],
  memory: ['memory-character-remembers'],
  level: ['level-a1-vocabulary', 'level-a1-grammar', 'level-a1-sentence-length', 'level-a1-pace-and-support']
};

// Root cause categories
const ROOT_CAUSE_TYPES = {
  PROMPT_WORDING: 'prompt-wording',
  MISSING_INSTRUCTION: 'missing-instruction',
  CONFLICTING_RULES: 'conflicting-rules',
  LEVEL_RULE_PROBLEM: 'level-rule-problem',
  CHARACTER_SHEET_GAP: 'character-sheet-gap'
};

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Load and analyze test results from a report file
 * @param {string} reportPath - Path to JSON report file
 * @returns {Object} Complete failure analysis
 */
export async function analyzeFailures(reportPath) {
  console.log(`\n📊 Analyzing failures from: ${basename(reportPath)}\n`);

  // Load the report
  const report = JSON.parse(readFileSync(reportPath, 'utf-8'));

  // Extract test runs
  const testRuns = report.testRuns || report.results || report;

  if (!Array.isArray(testRuns)) {
    throw new Error('Report format not recognized. Expected array of test runs.');
  }

  console.log(`Found ${testRuns.length} test runs\n`);

  // 1. Extract all failures
  const failures = extractFailures(testRuns);
  console.log(`Identified ${failures.length} criterion failures\n`);

  // 2. Group by category
  const failuresByCategory = groupByCategory(failures);

  // 3. Identify patterns
  const patterns = identifyPatterns(failures);
  console.log(`Identified ${patterns.length} patterns\n`);

  // 4. Categorize root causes
  const rootCauses = categorizeRootCauses(patterns, failures);
  console.log(`Identified ${rootCauses.length} root causes\n`);

  return {
    summary: {
      totalTests: testRuns.length,
      totalFailures: failures.length,
      failureRate: ((failures.length / (testRuns.length * 10)) * 100).toFixed(1) + '%', // Assuming ~10 criteria per test
      worstCategory: findWorstCategory(failuresByCategory),
    },
    failuresByCategory,
    patterns,
    rootCauses,
    recommendations: generateRecommendations(rootCauses, patterns),
  };
}

/**
 * Extract all failures from test runs
 */
function extractFailures(testRuns) {
  const failures = [];

  for (const run of testRuns) {
    if (run.error) continue; // Skip errored tests

    const judgment = run.judgment;
    if (!judgment || !judgment.criteria) continue;

    for (const criterion of judgment.criteria) {
      if (criterion.score < FAILURE_THRESHOLD) {
        failures.push({
          testId: `${run.persona} × ${run.sceneId}`,
          persona: run.persona,
          sceneId: run.sceneId,
          characterId: run.characterId,
          criterion: criterion.criterion,
          score: criterion.score,
          reasoning: criterion.reasoning,
          examples: criterion.examples || [],
          transcript: run.transcript,
        });
      }
    }
  }

  return failures;
}

/**
 * Group failures by criterion category
 */
function groupByCategory(failures) {
  const grouped = {
    forgiveness: [],
    correction: [],
    character: [],
    help: [],
    goals: [],
    memory: [],
    level: [],
    uncategorized: []
  };

  for (const failure of failures) {
    const category = findCategory(failure.criterion);
    grouped[category].push({
      testId: failure.testId,
      criterion: failure.criterion,
      score: failure.score,
      issue: failure.reasoning,
      examples: failure.examples,
    });
  }

  return grouped;
}

/**
 * Find category for a criterion name
 */
function findCategory(criterionName) {
  for (const [category, criteria] of Object.entries(CRITERIA_CATEGORIES)) {
    // Match by ID or by name substring
    if (criteria.some(c => criterionName.includes(c) || c.includes(criterionName.toLowerCase()))) {
      return category;
    }
  }

  // Try partial matches
  if (criterionName.toLowerCase().includes('forgiv')) return 'forgiveness';
  if (criterionName.toLowerCase().includes('correct')) return 'correction';
  if (criterionName.toLowerCase().includes('character') || criterionName.toLowerCase().includes('italian')) return 'character';
  if (criterionName.toLowerCase().includes('hint') || criterionName.toLowerCase().includes('confus') || criterionName.toLowerCase().includes('help')) return 'help';
  if (criterionName.toLowerCase().includes('goal') || criterionName.toLowerCase().includes('step')) return 'goals';
  if (criterionName.toLowerCase().includes('memor') || criterionName.toLowerCase().includes('remember')) return 'memory';
  if (criterionName.toLowerCase().includes('level') || criterionName.toLowerCase().includes('vocabular') || criterionName.toLowerCase().includes('grammar')) return 'level';

  return 'uncategorized';
}

/**
 * Identify patterns across multiple failures
 */
export function identifyPatterns(failures) {
  const patterns = [];

  // Pattern: Same issue across multiple tests
  const issueGroups = groupBy(failures, f => f.reasoning.substring(0, 50)); // Group by first 50 chars of reasoning

  for (const [issueSnippet, group] of Object.entries(issueGroups)) {
    if (group.length >= PATTERN_MIN_OCCURRENCES) {
      const affectedCriteria = [...new Set(group.map(f => f.criterion))];
      const affectedScenes = [...new Set(group.map(f => f.sceneId))];

      patterns.push({
        pattern: summarizePattern(group),
        occurrences: group.length,
        affectedCriteria,
        affectedScenes,
        avgScore: (group.reduce((sum, f) => sum + f.score, 0) / group.length).toFixed(1),
        examples: group.slice(0, 3).flatMap(f => f.examples).filter(Boolean).slice(0, 3),
      });
    }
  }

  // Pattern: Character switches to English
  const englishSwitches = failures.filter(f =>
    f.reasoning.toLowerCase().includes('english') ||
    f.examples.some(ex => /[A-Z][a-z]+ [a-z]+ [a-z]+/.test(ex) && !ex.includes('italiano'))
  );

  if (englishSwitches.length >= PATTERN_MIN_OCCURRENCES) {
    patterns.push({
      pattern: 'NPC switches to English when learner struggles',
      occurrences: englishSwitches.length,
      affectedCriteria: ['character-stays-in-italian'],
      affectedScenes: [...new Set(englishSwitches.map(f => f.sceneId))],
      avgScore: (englishSwitches.reduce((sum, f) => sum + f.score, 0) / englishSwitches.length).toFixed(1),
      examples: englishSwitches.flatMap(f => f.examples).filter(Boolean).slice(0, 3),
    });
  }

  // Pattern: Over-correcting
  const overCorrections = failures.filter(f =>
    f.criterion.toLowerCase().includes('correction') &&
    (f.reasoning.toLowerCase().includes('too many') ||
     f.reasoning.toLowerCase().includes('over-correct'))
  );

  if (overCorrections.length >= PATTERN_MIN_OCCURRENCES) {
    patterns.push({
      pattern: 'NPC over-corrects learner mistakes',
      occurrences: overCorrections.length,
      affectedCriteria: ['correction-appropriate-selection'],
      affectedScenes: [...new Set(overCorrections.map(f => f.sceneId))],
      avgScore: (overCorrections.reduce((sum, f) => sum + f.score, 0) / overCorrections.length).toFixed(1),
      examples: overCorrections.flatMap(f => f.examples).filter(Boolean).slice(0, 3),
    });
  }

  // Pattern: Transcription noise treated as mistakes
  const transcriptionIssues = failures.filter(f =>
    f.criterion.toLowerCase().includes('transcription') ||
    (f.reasoning.toLowerCase().includes('noise') && f.reasoning.toLowerCase().includes('correc'))
  );

  if (transcriptionIssues.length >= PATTERN_MIN_OCCURRENCES) {
    patterns.push({
      pattern: 'Transcription noise treated as learner mistakes',
      occurrences: transcriptionIssues.length,
      affectedCriteria: ['forgiveness-transcription-noise'],
      affectedScenes: [...new Set(transcriptionIssues.map(f => f.sceneId))],
      avgScore: (transcriptionIssues.reduce((sum, f) => sum + f.score, 0) / transcriptionIssues.length).toFixed(1),
      examples: transcriptionIssues.flatMap(f => f.examples).filter(Boolean).slice(0, 3),
    });
  }

  // Pattern: Sentence length violations
  const lengthViolations = failures.filter(f =>
    f.criterion.toLowerCase().includes('sentence') ||
    f.reasoning.toLowerCase().includes('too long') ||
    f.reasoning.toLowerCase().includes('exceeds')
  );

  if (lengthViolations.length >= PATTERN_MIN_OCCURRENCES) {
    patterns.push({
      pattern: 'NPC responses exceed level-appropriate sentence length',
      occurrences: lengthViolations.length,
      affectedCriteria: ['level-a1-sentence-length'],
      affectedScenes: [...new Set(lengthViolations.map(f => f.sceneId))],
      avgScore: (lengthViolations.reduce((sum, f) => sum + f.score, 0) / lengthViolations.length).toFixed(1),
      examples: lengthViolations.flatMap(f => f.examples).filter(Boolean).slice(0, 3),
    });
  }

  // Sort patterns by occurrences (most common first)
  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Categorize root causes based on patterns and failures
 */
export function categorizeRootCauses(patterns, failures) {
  const rootCauses = [];

  // Analyze each pattern for root causes
  for (const pattern of patterns) {
    const causes = inferRootCause(pattern, failures);
    rootCauses.push(...causes);
  }

  // Deduplicate and sort by severity
  const uniqueCauses = deduplicateRootCauses(rootCauses);
  return uniqueCauses.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Infer root cause(s) from a pattern
 */
function inferRootCause(pattern, failures) {
  const causes = [];

  // English switching -> Missing instruction
  if (pattern.pattern.toLowerCase().includes('english')) {
    causes.push({
      cause: 'Missing explicit instruction to never switch to English',
      type: ROOT_CAUSE_TYPES.MISSING_INSTRUCTION,
      affectedPrompts: ['npc-prompt', 'house-rules'],
      severity: 'high',
      evidence: pattern.examples,
      fix: 'Add to house rules: "Never switch to English unless explicitly asked by learner. Even if confused, respond in simple Italian."',
    });
  }

  // Over-correction -> Prompt wording issue
  if (pattern.pattern.toLowerCase().includes('over-correct')) {
    causes.push({
      cause: 'Prompt encourages correcting too many mistakes',
      type: ROOT_CAUSE_TYPES.PROMPT_WORDING,
      affectedPrompts: ['npc-prompt', 'correction-rules'],
      severity: 'medium',
      evidence: pattern.examples,
      fix: 'Clarify in prompt: "Only correct mistakes that impede communication or are systematic. Ignore minor imperfections. Maximum 1-2 corrections per conversation."',
    });
  }

  // Transcription noise -> Unclear instruction
  if (pattern.pattern.toLowerCase().includes('transcription noise')) {
    causes.push({
      cause: 'Forgiveness rules for transcription noise not clear enough',
      type: ROOT_CAUSE_TYPES.PROMPT_WORDING,
      affectedPrompts: ['npc-prompt', 'house-rules'],
      severity: 'high',
      evidence: pattern.examples,
      fix: 'Strengthen house rules: "TRANSCRIPTION NOISE (like \'bone journal\' for \'buongiorno\') is NOT a learner mistake. Reconstruct the intended Italian and respond naturally. NEVER correct transcription noise."',
    });
  }

  // Sentence length -> Level rule problem
  if (pattern.pattern.toLowerCase().includes('sentence length') || pattern.pattern.toLowerCase().includes('exceeds')) {
    causes.push({
      cause: 'Level rules for sentence length not enforced consistently',
      type: ROOT_CAUSE_TYPES.LEVEL_RULE_PROBLEM,
      affectedPrompts: ['npc-prompt', 'level-rules'],
      severity: 'medium',
      evidence: pattern.examples,
      fix: 'Make sentence length rule more explicit: "A1: 3-5 words per sentence. Count your words. Use periods, not commas, to break long thoughts."',
    });
  }

  // Character consistency issues
  if (pattern.pattern.toLowerCase().includes('character') || pattern.pattern.toLowerCase().includes('personality')) {
    causes.push({
      cause: 'Character sheet lacks specific behavioral guidelines',
      type: ROOT_CAUSE_TYPES.CHARACTER_SHEET_GAP,
      affectedPrompts: ['character-sheet'],
      severity: 'medium',
      evidence: pattern.examples,
      fix: 'Add to character sheet: concrete examples of how this character speaks in different situations (happy, confused, busy).',
    });
  }

  return causes;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Group array by key function
 */
function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Summarize a pattern from a group of failures
 */
function summarizePattern(failureGroup) {
  // Extract common words from reasoning
  const reasonings = failureGroup.map(f => f.reasoning.toLowerCase());
  const commonWords = findCommonWords(reasonings);

  if (commonWords.length > 0) {
    return `Issues with ${commonWords.slice(0, 3).join(', ')}`;
  }

  // Fall back to first reasoning (truncated)
  return failureGroup[0].reasoning.substring(0, 60) + '...';
}

/**
 * Find common meaningful words across strings
 */
function findCommonWords(strings) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const wordCounts = {};

  for (const str of strings) {
    const words = str.split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  return Object.entries(wordCounts)
    .filter(([_, count]) => count >= PATTERN_MIN_OCCURRENCES)
    .sort((a, b) => b[1] - a[1])
    .map(([word, _]) => word);
}

/**
 * Find the category with the most failures
 */
function findWorstCategory(failuresByCategory) {
  let maxCount = 0;
  let worstCategory = 'none';

  for (const [category, failures] of Object.entries(failuresByCategory)) {
    if (failures.length > maxCount) {
      maxCount = failures.length;
      worstCategory = category;
    }
  }

  return { category: worstCategory, count: maxCount };
}

/**
 * Deduplicate root causes by merging similar ones
 */
function deduplicateRootCauses(rootCauses) {
  const seen = new Map();

  for (const cause of rootCauses) {
    const key = `${cause.type}:${cause.cause.substring(0, 30)}`;

    if (seen.has(key)) {
      // Merge evidence
      const existing = seen.get(key);
      existing.evidence = [...new Set([...existing.evidence, ...cause.evidence])];
    } else {
      seen.set(key, cause);
    }
  }

  return Array.from(seen.values());
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(rootCauses, patterns) {
  const recommendations = [];

  // High priority recommendations from root causes
  const highPriority = rootCauses.filter(rc => rc.severity === 'high');
  for (const rc of highPriority) {
    recommendations.push({
      priority: 'high',
      action: rc.fix,
      impact: `Fixes ${patterns.find(p => p.examples === rc.evidence)?.occurrences || 'multiple'} failures`,
      files: rc.affectedPrompts,
    });
  }

  // Medium priority
  const mediumPriority = rootCauses.filter(rc => rc.severity === 'medium');
  for (const rc of mediumPriority) {
    recommendations.push({
      priority: 'medium',
      action: rc.fix,
      impact: `Improves ${patterns.find(p => p.examples === rc.evidence)?.occurrences || 'some'} test cases`,
      files: rc.affectedPrompts,
    });
  }

  return recommendations.slice(0, 10); // Top 10 recommendations
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Format analysis as readable text report
 */
function formatReport(analysis) {
  let report = '';

  report += '# Test Failure Analysis\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;

  // Summary
  report += '## Summary\n\n';
  report += `- Total tests: ${analysis.summary.totalTests}\n`;
  report += `- Total failures: ${analysis.summary.totalFailures}\n`;
  report += `- Failure rate: ${analysis.summary.failureRate}\n`;
  report += `- Worst category: ${analysis.summary.worstCategory.category} (${analysis.summary.worstCategory.count} failures)\n\n`;

  // Failures by category
  report += '## Failures by Category\n\n';
  for (const [category, failures] of Object.entries(analysis.failuresByCategory)) {
    if (failures.length === 0) continue;

    report += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${failures.length} failures)\n\n`;

    for (const failure of failures.slice(0, 5)) { // Show top 5 per category
      report += `**${failure.criterion}** (score: ${failure.score}/10)\n`;
      report += `- Test: ${failure.testId}\n`;
      report += `- Issue: ${failure.issue}\n`;

      if (failure.examples && failure.examples.length > 0) {
        report += `- Example: "${failure.examples[0]}"\n`;
      }
      report += '\n';
    }

    if (failures.length > 5) {
      report += `_... and ${failures.length - 5} more_\n\n`;
    }
  }

  // Patterns
  report += '## Identified Patterns\n\n';
  for (const pattern of analysis.patterns) {
    report += `### ${pattern.pattern}\n\n`;
    report += `- Occurrences: ${pattern.occurrences}\n`;
    report += `- Average score: ${pattern.avgScore}/10\n`;
    report += `- Affected criteria: ${pattern.affectedCriteria.join(', ')}\n`;
    report += `- Affected scenes: ${pattern.affectedScenes.join(', ')}\n`;

    if (pattern.examples && pattern.examples.length > 0) {
      report += '\nExamples:\n';
      for (const example of pattern.examples) {
        report += `- "${example}"\n`;
      }
    }
    report += '\n';
  }

  // Root causes
  report += '## Root Causes\n\n';
  for (const rc of analysis.rootCauses) {
    const emoji = rc.severity === 'high' ? '🔴' : rc.severity === 'medium' ? '🟡' : '🟢';
    report += `${emoji} **${rc.cause}**\n\n`;
    report += `- Type: ${rc.type}\n`;
    report += `- Severity: ${rc.severity}\n`;
    report += `- Affected prompts: ${rc.affectedPrompts.join(', ')}\n`;
    report += `- Fix: ${rc.fix}\n\n`;
  }

  // Recommendations
  report += '## Recommendations (Priority Order)\n\n';
  for (let i = 0; i < analysis.recommendations.length; i++) {
    const rec = analysis.recommendations[i];
    const emoji = rec.priority === 'high' ? '🔴' : '🟡';

    report += `${i + 1}. ${emoji} ${rec.action}\n`;
    report += `   - Impact: ${rec.impact}\n`;
    report += `   - Files: ${rec.files.join(', ')}\n\n`;
  }

  return report;
}

/**
 * Save analysis to file
 */
function saveAnalysis(analysis, originalReportPath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = resolve('tests/reports', `failure-analysis-${timestamp}.md`);

  const report = formatReport(analysis);
  writeFileSync(outputPath, report, 'utf-8');

  // Also save JSON
  const jsonPath = outputPath.replace('.md', '.json');
  writeFileSync(jsonPath, JSON.stringify(analysis, null, 2), 'utf-8');

  return { markdown: outputPath, json: jsonPath };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node analyze-failures.mjs <path-to-report.json>');
    console.error('\nExample:');
    console.error('  node tests/improve/analyze-failures.mjs tests/reports/simulated-learner-2024-01-15.json');
    process.exit(1);
  }

  const reportPath = resolve(args[0]);

  try {
    // Run analysis
    const analysis = await analyzeFailures(reportPath);

    // Save results
    const savedPaths = saveAnalysis(analysis, reportPath);

    console.log('\n✅ Analysis complete!\n');
    console.log(`📄 Markdown report: ${savedPaths.markdown}`);
    console.log(`📊 JSON data: ${savedPaths.json}\n`);

    // Print summary
    console.log('Top 3 Recommendations:');
    for (let i = 0; i < Math.min(3, analysis.recommendations.length); i++) {
      const rec = analysis.recommendations[i];
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action.substring(0, 80)}...`);
    }
    console.log();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
