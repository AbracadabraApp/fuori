#!/usr/bin/env node
/**
 * Improvement Loop Orchestrator
 *
 * Ties everything together in a continuous improvement cycle:
 * 1. Run simulated learner tests
 * 2. Analyze failures
 * 3. Generate improvements
 * 4. Present to user for approval
 * 5. Apply approved improvements
 * 6. Run tests again
 * 7. Compare results
 * 8. Repeat until done
 *
 * Usage:
 *   npm run improve:loop              # Interactive mode
 *   npm run improve:loop --auto       # Auto-apply all fixes
 *   npm run improve:loop --max 10     # Max 10 iterations
 *   npm run improve:loop --threshold 9.0  # Higher quality bar
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  maxIterations: parseInt(process.argv.find(arg => arg.startsWith('--max='))?.split('=')[1]) || 5,
  passThreshold: parseFloat(process.argv.find(arg => arg.startsWith('--threshold='))?.split('=')[1]) || 8.0,
  autoApply: process.argv.includes('--auto'),
  verbose: process.argv.includes('--verbose'),
  outputDir: resolve(__dirname, '../reports'),
  historyFile: resolve(__dirname, '../reports/improvement-history.json'),
};

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} IterationResult
 * @property {number} number - Iteration number (1-indexed)
 * @property {Object} testResults - Test run results
 * @property {number} testResults.avgScore - Average score across all conversations
 * @property {number} testResults.failures - Count of tests below threshold
 * @property {number} testResults.total - Total number of tests
 * @property {Object[]} testResults.details - Individual test results
 * @property {Object[]} improvements - Improvements generated
 * @property {Object[]} appliedImprovements - Improvements that were applied
 * @property {string} [commitHash] - Git commit hash after applying improvements
 * @property {number} duration - Time taken for this iteration (seconds)
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} ImprovementHistory
 * @property {string} startedAt - ISO timestamp
 * @property {string} [completedAt] - ISO timestamp
 * @property {Object} config - Configuration used
 * @property {IterationResult[]} iterations - All iterations
 * @property {number} [finalScore] - Final average score
 * @property {number} [totalImprovement] - Score improvement from start to end
 * @property {string} status - 'running' | 'completed' | 'stopped' | 'failed'
 * @property {string} [stopReason] - Why the loop stopped
 */

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Run a shell command and capture output
 */
function runCommand(command, description) {
  if (CONFIG.verbose) {
    console.log(`  → ${description}: ${command}`);
  }
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '../..'),
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
    });
    return output;
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

/**
 * Get current git commit hash
 */
function getCommitHash() {
  try {
    return execSync('git rev-parse HEAD', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '../..'),
    }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Prompt user for yes/no confirmation
 */
async function promptYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Prompt user to select improvements to apply
 */
async function promptSelectImprovements(improvements) {
  if (improvements.length === 0) {
    return [];
  }

  console.log('\nGenerated improvements:');
  improvements.forEach((imp, idx) => {
    console.log(`\n[${idx + 1}] ${imp.title || imp.id}`);
    console.log(`    Priority: ${imp.priority || 'medium'}`);
    console.log(`    ${imp.description || imp.rationale || 'No description'}`);
    if (imp.files) {
      console.log(`    Files: ${imp.files.join(', ')}`);
    }
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\nWhich improvements to apply? (comma-separated numbers, "all", or "none"): ', (answer) => {
      rl.close();

      const input = answer.trim().toLowerCase();
      if (input === 'none' || input === '') {
        resolve([]);
      } else if (input === 'all') {
        resolve(improvements);
      } else {
        const indices = input.split(',').map(s => parseInt(s.trim()) - 1);
        const selected = indices
          .filter(i => i >= 0 && i < improvements.length)
          .map(i => improvements[i]);
        resolve(selected);
      }
    });
  });
}

/**
 * Load improvement history from file
 */
function loadHistory() {
  if (!existsSync(CONFIG.historyFile)) {
    return null;
  }
  try {
    const content = readFileSync(CONFIG.historyFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Warning: Could not load history file:', error.message);
    return null;
  }
}

/**
 * Save improvement history to file
 */
function saveHistory(history) {
  mkdirSync(dirname(CONFIG.historyFile), { recursive: true });
  writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2), 'utf-8');
}

// ============================================================================
// Core Loop Functions
// ============================================================================

/**
 * Run simulated learner tests
 */
async function runTests() {
  console.log('\n▶ Running simulated learner tests...');

  try {
    // Run the test command
    const output = runCommand(
      'npm run test:learner',
      'Running test suite'
    );

    // Parse the latest test report
    const reportsDir = resolve(__dirname, '../reports');
    const files = require('fs').readdirSync(reportsDir)
      .filter(f => f.startsWith('simulated-learner-') && f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error('No test reports found');
    }

    const latestReport = resolve(reportsDir, files[0]);
    const reportContent = readFileSync(latestReport, 'utf-8');

    // Parse report to extract scores
    // Format: "- Average score: 7.5/10"
    const avgScoreMatch = reportContent.match(/Average score:\s*([\d.]+)\/10/);
    const avgScore = avgScoreMatch ? parseFloat(avgScoreMatch[1]) : 0;

    // Count failures (scores below threshold)
    const scoreMatches = [...reportContent.matchAll(/\*\*Overall Score:\*\*\s*([\d.]+)\/10/g)];
    const scores = scoreMatches.map(m => parseFloat(m[1]));
    const failures = scores.filter(s => s < CONFIG.passThreshold).length;

    // Extract individual test details
    const details = [];
    const testSections = reportContent.split('###').slice(1); // Skip header

    for (const section of testSections) {
      const titleMatch = section.match(/^(.+)\n/);
      const scoreMatch = section.match(/\*\*Overall Score:\*\*\s*([\d.]+)\/10/);

      if (titleMatch && scoreMatch) {
        const [persona, sceneId] = titleMatch[1].trim().split(' × ');
        details.push({
          persona: persona.trim(),
          sceneId: sceneId.trim(),
          score: parseFloat(scoreMatch[1]),
          passed: parseFloat(scoreMatch[1]) >= CONFIG.passThreshold,
        });
      }
    }

    console.log(`  ✓ Tests complete: ${avgScore.toFixed(1)}/10 avg, ${failures}/${scores.length} below threshold`);

    return {
      avgScore,
      failures,
      total: scores.length,
      details,
      reportPath: latestReport,
    };

  } catch (error) {
    console.error('  ✗ Test execution failed:', error.message);
    throw error;
  }
}

/**
 * Analyze failures and generate improvement suggestions
 *
 * For now, this is a placeholder that returns mock improvements.
 * TODO: Implement actual failure analysis and improvement generation
 */
async function analyzeAndGenerateImprovements(testResults, iterationNumber) {
  console.log('\n▶ Analyzing failures and generating improvements...');

  // TODO: Call analyze-failures.mjs
  // TODO: Call generate-improvements.mjs

  // For now, return mock improvements based on test results
  const improvements = [];

  if (testResults.failures > 0) {
    const failedTests = testResults.details.filter(t => !t.passed);

    // Group failures by common issues
    const lowScores = failedTests.filter(t => t.score < 5);
    const mediumScores = failedTests.filter(t => t.score >= 5 && t.score < CONFIG.passThreshold);

    if (lowScores.length > 0) {
      improvements.push({
        id: `iter${iterationNumber}-critical-fix`,
        title: 'Fix critical conversation quality issues',
        priority: 'high',
        description: `${lowScores.length} tests scored below 5.0. These indicate fundamental issues with conversation flow, level adherence, or character consistency.`,
        rationale: 'Critical quality threshold violated',
        files: ['lib/conversation.ts', 'lib/prompts.ts'],
        type: 'prompt_adjustment',
        estimatedImpact: '+1.5 to +2.5 points',
      });
    }

    if (mediumScores.length > 0) {
      improvements.push({
        id: `iter${iterationNumber}-moderate-fix`,
        title: 'Improve scaffolding and error handling',
        priority: 'medium',
        description: `${mediumScores.length} tests scored between 5.0 and ${CONFIG.passThreshold}. These need refinement in scaffolding balance, correction style, or goal tracking.`,
        rationale: 'Quality threshold not met but not critical',
        files: ['lib/conversation.ts'],
        type: 'logic_adjustment',
        estimatedImpact: '+0.5 to +1.5 points',
      });
    }

    // Check for persona-specific issues
    const personaFailures = {};
    failedTests.forEach(t => {
      personaFailures[t.persona] = (personaFailures[t.persona] || 0) + 1;
    });

    const problematicPersonas = Object.entries(personaFailures)
      .filter(([_, count]) => count >= 2);

    if (problematicPersonas.length > 0) {
      improvements.push({
        id: `iter${iterationNumber}-persona-fix`,
        title: 'Adjust handling of specific learner types',
        priority: 'medium',
        description: `Personas ${problematicPersonas.map(([p]) => p).join(', ')} consistently underperform. May need specialized handling for their mistake patterns or behavior.`,
        rationale: 'Persona-specific pattern detected',
        files: ['lib/conversation.ts', 'tests/personas/learner-personas.ts'],
        type: 'persona_adjustment',
        estimatedImpact: '+0.5 to +1.0 points',
      });
    }
  }

  if (improvements.length === 0) {
    console.log('  ✓ No improvements needed - all tests passing!');
  } else {
    console.log(`  ✓ Generated ${improvements.length} improvement suggestions`);
  }

  return improvements;
}

/**
 * Apply improvements to the codebase
 *
 * For now, this is a placeholder that simulates applying improvements.
 * TODO: Implement actual improvement application
 */
async function applyImprovements(improvements) {
  console.log('\n▶ Applying improvements...');

  // TODO: Call apply-improvements.mjs

  const applied = [];

  for (const improvement of improvements) {
    console.log(`  • Applying: ${improvement.title}`);

    // Simulate applying the improvement
    // In reality, this would modify files based on the improvement spec

    applied.push({
      ...improvement,
      appliedAt: new Date().toISOString(),
      success: true,
    });
  }

  console.log(`  ✓ Applied ${applied.length} improvements`);

  return applied;
}

/**
 * Create a git commit for the improvements
 */
function commitImprovements(improvements, iterationNumber) {
  if (improvements.length === 0) {
    return null;
  }

  try {
    const message = `Iteration ${iterationNumber}: Applied ${improvements.length} improvement(s)

${improvements.map(imp => `- ${imp.title}`).join('\n')}

Generated by improvement loop orchestrator`;

    runCommand('git add .', 'Staging changes');
    runCommand(`git commit -m "${message.replace(/"/g, '\\"')}"`, 'Creating commit');

    const hash = getCommitHash();
    console.log(`  ✓ Created commit: ${hash}`);

    return hash;
  } catch (error) {
    console.warn('  ⚠ Could not create git commit:', error.message);
    return null;
  }
}

// ============================================================================
// Comparison and Reporting
// ============================================================================

/**
 * Compare two iterations
 */
export function compareIterations(iter1, iter2) {
  const scoreDelta = iter2.testResults.avgScore - iter1.testResults.avgScore;
  const failureDelta = iter1.testResults.failures - iter2.testResults.failures; // Positive = improvement

  return {
    scoreDelta,
    failureDelta,
    improved: scoreDelta > 0 || failureDelta > 0,
    scoreChange: scoreDelta > 0 ? 'increased' : scoreDelta < 0 ? 'decreased' : 'unchanged',
    failureChange: failureDelta > 0 ? 'decreased' : failureDelta < 0 ? 'increased' : 'unchanged',
  };
}

/**
 * Generate a progress report
 */
export function generateProgressReport(iterations) {
  if (iterations.length === 0) {
    return 'No iterations completed yet.';
  }

  const first = iterations[0];
  const last = iterations[iterations.length - 1];
  const totalImprovement = last.testResults.avgScore - first.testResults.avgScore;

  let report = `# Improvement Loop Progress Report\n\n`;
  report += `**Iterations:** ${iterations.length}\n`;
  report += `**Started:** ${new Date(first.timestamp).toLocaleString()}\n`;
  report += `**Latest:** ${new Date(last.timestamp).toLocaleString()}\n\n`;

  report += `## Summary\n\n`;
  report += `- Initial score: ${first.testResults.avgScore.toFixed(1)}/10\n`;
  report += `- Current score: ${last.testResults.avgScore.toFixed(1)}/10\n`;
  report += `- Total improvement: ${totalImprovement > 0 ? '+' : ''}${totalImprovement.toFixed(1)} points\n`;
  report += `- Current failures: ${last.testResults.failures}/${last.testResults.total}\n\n`;

  report += `## Iteration History\n\n`;

  iterations.forEach((iter, idx) => {
    report += `### Iteration ${iter.number}\n\n`;
    report += `- Score: ${iter.testResults.avgScore.toFixed(1)}/10\n`;
    report += `- Failures: ${iter.testResults.failures}/${iter.testResults.total}\n`;
    report += `- Improvements applied: ${iter.appliedImprovements.length}\n`;

    if (idx > 0) {
      const comparison = compareIterations(iterations[idx - 1], iter);
      report += `- Change: ${comparison.scoreDelta > 0 ? '+' : ''}${comparison.scoreDelta.toFixed(1)} points`;
      if (comparison.failureDelta !== 0) {
        report += `, ${Math.abs(comparison.failureDelta)} ${comparison.failureDelta > 0 ? 'fewer' : 'more'} failures`;
      }
      report += `\n`;
    }

    if (iter.appliedImprovements.length > 0) {
      report += `\n**Applied improvements:**\n`;
      iter.appliedImprovements.forEach(imp => {
        report += `- ${imp.title}\n`;
      });
    }

    report += `\n`;
  });

  return report;
}

/**
 * Save progress report to file
 */
function saveProgressReport(history) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = resolve(CONFIG.outputDir, `improvement-progress-${timestamp}.md`);

  const report = generateProgressReport(history.iterations);

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, 'utf-8');

  console.log(`\n📄 Progress report saved: ${reportPath}`);

  return reportPath;
}

// ============================================================================
// Main Loop
// ============================================================================

/**
 * Run the improvement loop
 */
export async function runImprovementLoop(options = {}) {
  // Merge options with CLI config
  const config = {
    ...CONFIG,
    ...options,
  };

  console.log('🔄 Starting Improvement Loop\n');
  console.log(`Configuration:`);
  console.log(`  Max iterations: ${config.maxIterations}`);
  console.log(`  Pass threshold: ${config.passThreshold}/10`);
  console.log(`  Mode: ${config.autoApply ? 'Auto-apply' : 'Interactive'}`);
  console.log(`  Verbose: ${config.verbose}`);

  // Initialize history
  const history = {
    startedAt: new Date().toISOString(),
    config: {
      maxIterations: config.maxIterations,
      passThreshold: config.passThreshold,
      autoApply: config.autoApply,
    },
    iterations: [],
    status: 'running',
  };

  let continueLoop = true;
  let iterationNumber = 0;

  while (continueLoop && iterationNumber < config.maxIterations) {
    iterationNumber++;
    const iterationStart = Date.now();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`ITERATION ${iterationNumber}/${config.maxIterations}`);
    console.log(`${'='.repeat(60)}`);

    try {
      // Step 1: Run tests
      const testResults = await runTests();

      // Step 2: Check if we're done
      const allPassing = testResults.failures === 0;
      const thresholdMet = testResults.avgScore >= config.passThreshold;

      if (allPassing && thresholdMet) {
        console.log('\n✅ All tests passing and threshold met!');
        history.status = 'completed';
        history.stopReason = 'all_tests_passing';
        continueLoop = false;

        // Record final iteration (no improvements needed)
        history.iterations.push({
          number: iterationNumber,
          testResults,
          improvements: [],
          appliedImprovements: [],
          duration: (Date.now() - iterationStart) / 1000,
          timestamp: new Date().toISOString(),
        });

        break;
      }

      // Step 3: Analyze and generate improvements
      const improvements = await analyzeAndGenerateImprovements(testResults, iterationNumber);

      if (improvements.length === 0) {
        console.log('\n⚠ No improvements could be generated.');
        history.status = 'completed';
        history.stopReason = 'no_improvements_possible';
        continueLoop = false;

        history.iterations.push({
          number: iterationNumber,
          testResults,
          improvements: [],
          appliedImprovements: [],
          duration: (Date.now() - iterationStart) / 1000,
          timestamp: new Date().toISOString(),
        });

        break;
      }

      // Step 4: Get user approval (unless auto-apply)
      let improvementsToApply = improvements;

      if (!config.autoApply) {
        improvementsToApply = await promptSelectImprovements(improvements);

        if (improvementsToApply.length === 0) {
          console.log('\n⚠ No improvements selected.');
          const shouldStop = await promptYesNo('\nStop the improvement loop?');

          if (shouldStop) {
            history.status = 'stopped';
            history.stopReason = 'user_stopped';
            continueLoop = false;

            history.iterations.push({
              number: iterationNumber,
              testResults,
              improvements,
              appliedImprovements: [],
              duration: (Date.now() - iterationStart) / 1000,
              timestamp: new Date().toISOString(),
            });

            break;
          } else {
            // Skip this iteration, run tests again
            console.log('\nSkipping improvements, will re-run tests...');
            continue;
          }
        }
      }

      // Step 5: Apply improvements
      const appliedImprovements = await applyImprovements(improvementsToApply);

      // Step 6: Commit changes (optional)
      const commitHash = commitImprovements(appliedImprovements, iterationNumber);

      // Record iteration
      history.iterations.push({
        number: iterationNumber,
        testResults,
        improvements,
        appliedImprovements,
        commitHash,
        duration: (Date.now() - iterationStart) / 1000,
        timestamp: new Date().toISOString(),
      });

      // Save history after each iteration
      saveHistory(history);

      // Step 7: Continue to next iteration (tests will run again)
      console.log(`\n✓ Iteration ${iterationNumber} complete`);

    } catch (error) {
      console.error(`\n❌ Error in iteration ${iterationNumber}:`, error.message);

      history.status = 'failed';
      history.stopReason = `error: ${error.message}`;
      history.iterations.push({
        number: iterationNumber,
        error: error.message,
        duration: (Date.now() - iterationStart) / 1000,
        timestamp: new Date().toISOString(),
      });

      saveHistory(history);
      throw error;
    }
  }

  // Loop complete
  if (iterationNumber >= config.maxIterations && continueLoop) {
    console.log('\n⚠ Maximum iterations reached');
    history.status = 'completed';
    history.stopReason = 'max_iterations';
  }

  history.completedAt = new Date().toISOString();

  // Calculate final stats
  if (history.iterations.length > 0) {
    const firstIter = history.iterations[0];
    const lastIter = history.iterations[history.iterations.length - 1];

    if (firstIter.testResults && lastIter.testResults) {
      history.finalScore = lastIter.testResults.avgScore;
      history.totalImprovement = lastIter.testResults.avgScore - firstIter.testResults.avgScore;
    }
  }

  // Save final history and generate report
  saveHistory(history);
  const reportPath = saveProgressReport(history);

  console.log('\n' + '='.repeat(60));
  console.log('IMPROVEMENT LOOP COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nStatus: ${history.status}`);
  console.log(`Reason: ${history.stopReason || 'N/A'}`);
  console.log(`Iterations: ${history.iterations.length}`);

  if (history.finalScore !== undefined) {
    console.log(`Final score: ${history.finalScore.toFixed(1)}/10`);
  }

  if (history.totalImprovement !== undefined) {
    console.log(`Total improvement: ${history.totalImprovement > 0 ? '+' : ''}${history.totalImprovement.toFixed(1)} points`);
  }

  console.log(`\nHistory saved: ${CONFIG.historyFile}`);
  console.log(`Report saved: ${reportPath}\n`);

  return history;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  try {
    await runImprovementLoop();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
