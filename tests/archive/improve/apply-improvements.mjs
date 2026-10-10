#!/usr/bin/env node
/**
 * Improvement Applier
 *
 * Safely applies proposed improvements to the codebase with user confirmation,
 * diff previews, rollback support, and git integration.
 *
 * Usage:
 *   import { applyImprovements, showDiff, rollbackIteration } from './apply-improvements.mjs';
 *
 *   // Manual mode (default) - asks for confirmation
 *   const result = await applyImprovements(improvements);
 *
 *   // Auto mode - applies all without confirmation
 *   const result = await applyImprovements(improvements, { auto: true });
 *
 *   // Rollback last iteration
 *   await rollbackIteration('abc123');
 *
 * Features:
 * - Shows diffs before applying changes
 * - User confirmation for each change (unless --auto)
 * - Creates backups before applying
 * - Tracks applied/skipped changes
 * - Creates git commits with iteration tags
 * - Rollback support
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  backupDir: resolve(__dirname, '.backups'),
  maxDiffLines: 50,
  verbose: process.argv.includes('--verbose'),
};

// ============================================================================
// Types (JSDoc)
// ============================================================================

/**
 * @typedef {Object} Improvement
 * @property {string} improvementId - Unique identifier for the improvement
 * @property {string} file - Absolute path to the file to modify
 * @property {string} oldString - The text to replace
 * @property {string} newString - The text to replace it with
 * @property {string} [description] - Human-readable description of the change
 * @property {string} [category] - Category of improvement (e.g., 'bug-fix', 'enhancement')
 */

/**
 * @typedef {Object} ApplyResult
 * @property {AppliedImprovement[]} applied - Successfully applied improvements
 * @property {SkippedImprovement[]} skipped - Skipped improvements
 * @property {string} commit - Git commit hash
 * @property {string} tag - Git tag name
 */

/**
 * @typedef {Object} AppliedImprovement
 * @property {string} improvementId
 * @property {string} status - 'applied'
 * @property {string} file - Absolute path to modified file
 * @property {string} [commit] - Git commit hash
 */

/**
 * @typedef {Object} SkippedImprovement
 * @property {string} improvementId
 * @property {string} reason - Why it was skipped
 * @property {string} [file] - File that would have been modified
 */

/**
 * @typedef {Object} ApplyOptions
 * @property {boolean} [auto=false] - Auto-apply without confirmation
 * @property {number} [iteration] - Test iteration number
 * @property {boolean} [createBackup=true] - Create backups before applying
 * @property {boolean} [commit=true] - Create git commit
 * @property {boolean} [tag=true] - Create git tag
 */

// ============================================================================
// Utilities
// ============================================================================

/**
 * Execute git command and return output
 */
function git(args, options = {}) {
  try {
    const cwd = options.cwd || process.cwd();
    const result = execSync(`git ${args}`, {
      cwd,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    return options.silent ? result.trim() : '';
  } catch (error) {
    if (options.allowFail) {
      return '';
    }
    throw new Error(`Git command failed: git ${args}\n${error.message}`);
  }
}

/**
 * Check if we're in a git repository
 */
function isGitRepo(cwd = process.cwd()) {
  try {
    git('rev-parse --git-dir', { cwd, silent: true, allowFail: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current git commit hash
 */
function getCurrentCommit(cwd = process.cwd()) {
  return git('rev-parse HEAD', { cwd, silent: true });
}

/**
 * Create readline interface for user input
 */
function createPrompt() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask user a yes/no question
 */
function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = createPrompt();
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Generate a unified diff between two strings
 */
function generateDiff(oldContent, newContent, filename = 'file') {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const diff = [];
  diff.push(`--- a/${filename}`);
  diff.push(`+++ b/${filename}`);

  // Simple line-by-line diff
  let i = 0;
  let j = 0;
  const hunks = [];
  let currentHunk = null;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      // Lines match
      if (currentHunk) {
        currentHunk.context.push(` ${oldLines[i]}`);
        if (currentHunk.context.length > 3) {
          hunks.push(currentHunk);
          currentHunk = null;
        }
      }
      i++;
      j++;
    } else {
      // Lines differ
      if (!currentHunk) {
        currentHunk = {
          oldStart: Math.max(0, i - 3),
          newStart: Math.max(0, j - 3),
          lines: [],
          context: [],
        };
        // Add context before the change
        for (let k = Math.max(0, i - 3); k < i; k++) {
          currentHunk.lines.push(` ${oldLines[k]}`);
        }
      }

      if (i < oldLines.length && (j >= newLines.length || oldLines[i] !== newLines[j])) {
        currentHunk.lines.push(`-${oldLines[i]}`);
        i++;
      }
      if (j < newLines.length && (i >= oldLines.length || oldLines[i - 1] !== newLines[j])) {
        currentHunk.lines.push(`+${newLines[j]}`);
        j++;
      }
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  // Format hunks
  for (const hunk of hunks) {
    const oldCount = hunk.lines.filter(l => !l.startsWith('+')).length;
    const newCount = hunk.lines.filter(l => !l.startsWith('-')).length;
    diff.push(`@@ -${hunk.oldStart + 1},${oldCount} +${hunk.newStart + 1},${newCount} @@`);
    diff.push(...hunk.lines);
  }

  return diff.join('\n');
}

// ============================================================================
// Backup Management
// ============================================================================

/**
 * Create a backup of a file before modifying
 */
function createBackup(filepath) {
  if (!existsSync(filepath)) {
    throw new Error(`File does not exist: ${filepath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = basename(filepath);
  const backupFilename = `${filename}.${timestamp}.backup`;
  const backupPath = resolve(CONFIG.backupDir, backupFilename);

  // Ensure backup directory exists
  mkdirSync(CONFIG.backupDir, { recursive: true });

  // Copy file to backup
  copyFileSync(filepath, backupPath);

  if (CONFIG.verbose) {
    console.log(`  📦 Backup created: ${backupPath}`);
  }

  return backupPath;
}

/**
 * Restore a file from backup
 */
function restoreFromBackup(backupPath, targetPath) {
  if (!existsSync(backupPath)) {
    throw new Error(`Backup does not exist: ${backupPath}`);
  }

  copyFileSync(backupPath, targetPath);

  if (CONFIG.verbose) {
    console.log(`  📦 Restored from backup: ${backupPath} → ${targetPath}`);
  }
}

// ============================================================================
// Diff Display
// ============================================================================

/**
 * Show a diff of the proposed change
 * @param {Improvement} improvement
 * @returns {Object} { filepath, diff, willApply }
 */
export function showDiff(improvement) {
  const { file, oldString, newString, improvementId, description } = improvement;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Improvement: ${improvementId}`);
  if (description) {
    console.log(`   ${description}`);
  }
  console.log(`   File: ${file}`);
  console.log(`${'='.repeat(80)}`);

  // Check if file exists
  if (!existsSync(file)) {
    console.log('❌ File does not exist!');
    return { filepath: file, diff: null, willApply: false };
  }

  // Read file content
  const currentContent = readFileSync(file, 'utf-8');

  // Check if old string exists in file
  if (!currentContent.includes(oldString)) {
    console.log('❌ Old string not found in file!');
    console.log('\nSearching for:');
    console.log(oldString.substring(0, 200) + (oldString.length > 200 ? '...' : ''));
    return { filepath: file, diff: null, willApply: false };
  }

  // Generate new content
  const newContent = currentContent.replace(oldString, newString);

  // Generate and display diff
  const diff = generateDiff(currentContent, newContent, file);
  const diffLines = diff.split('\n');

  if (diffLines.length > CONFIG.maxDiffLines) {
    console.log(diffLines.slice(0, CONFIG.maxDiffLines).join('\n'));
    console.log(`\n... (${diffLines.length - CONFIG.maxDiffLines} more lines)`);
  } else {
    console.log(diff);
  }

  return { filepath: file, diff, willApply: true, newContent };
}

// ============================================================================
// Apply Improvements
// ============================================================================

/**
 * Apply a single improvement to a file
 * @param {Improvement} improvement
 * @param {ApplyOptions} options
 * @returns {AppliedImprovement | SkippedImprovement}
 */
async function applySingleImprovement(improvement, options = {}) {
  const { file, oldString, newString, improvementId } = improvement;

  // Show diff
  const { filepath, diff, willApply, newContent } = showDiff(improvement);

  if (!willApply) {
    return {
      improvementId,
      reason: 'File does not exist or old string not found',
      file: filepath,
    };
  }

  // Ask for confirmation unless auto mode
  if (!options.auto) {
    const shouldApply = await askYesNo('\n❓ Apply this change?');
    if (!shouldApply) {
      return {
        improvementId,
        reason: 'User declined',
        file: filepath,
      };
    }
  }

  // Create backup if enabled
  let backupPath;
  if (options.createBackup !== false) {
    try {
      backupPath = createBackup(filepath);
    } catch (error) {
      console.error(`❌ Failed to create backup: ${error.message}`);
      return {
        improvementId,
        reason: `Backup failed: ${error.message}`,
        file: filepath,
      };
    }
  }

  // Apply the change
  try {
    writeFileSync(filepath, newContent, 'utf-8');
    console.log(`✅ Applied: ${improvementId}`);

    return {
      improvementId,
      status: 'applied',
      file: filepath,
      backupPath,
    };
  } catch (error) {
    console.error(`❌ Failed to apply: ${error.message}`);

    // Restore from backup if we created one
    if (backupPath) {
      try {
        restoreFromBackup(backupPath, filepath);
        console.log('✅ Restored from backup');
      } catch (restoreError) {
        console.error(`❌ Failed to restore from backup: ${restoreError.message}`);
      }
    }

    return {
      improvementId,
      reason: `Apply failed: ${error.message}`,
      file: filepath,
    };
  }
}

/**
 * Apply multiple improvements
 * @param {Improvement[]} improvements - Array of improvements to apply
 * @param {ApplyOptions} options - Options for applying
 * @returns {Promise<ApplyResult>}
 */
export async function applyImprovements(improvements, options = {}) {
  const {
    auto = false,
    iteration = null,
    createBackup = true,
    commit = true,
    tag = true,
  } = options;

  console.log('\n🔧 Improvement Applier\n');
  console.log(`Mode: ${auto ? 'AUTO' : 'MANUAL'}`);
  console.log(`Improvements to process: ${improvements.length}`);
  console.log(`Create backups: ${createBackup}`);
  console.log(`Create commit: ${commit}`);
  if (iteration !== null) {
    console.log(`Iteration: ${iteration}`);
  }
  console.log('');

  // Check if we're in a git repo
  const inGitRepo = isGitRepo();
  if (commit && !inGitRepo) {
    console.warn('⚠️  Not in a git repository. Commit and tag will be skipped.');
  }

  const applied = [];
  const skipped = [];

  // Process each improvement
  for (let i = 0; i < improvements.length; i++) {
    const improvement = improvements[i];
    console.log(`\n[${i + 1}/${improvements.length}] Processing: ${improvement.improvementId}`);

    const result = await applySingleImprovement(improvement, {
      auto,
      createBackup,
    });

    if (result.status === 'applied') {
      applied.push(result);
    } else {
      skipped.push(result);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Summary');
  console.log('='.repeat(80));
  console.log(`✅ Applied: ${applied.length}`);
  console.log(`⏭️  Skipped: ${skipped.length}`);

  if (skipped.length > 0) {
    console.log('\nSkipped improvements:');
    for (const skip of skipped) {
      console.log(`  - ${skip.improvementId}: ${skip.reason}`);
    }
  }

  // Create git commit if requested and there are changes
  let commitHash = null;
  let tagName = null;

  if (commit && inGitRepo && applied.length > 0) {
    console.log('\n📝 Creating git commit...');

    try {
      // Stage all modified files
      const files = [...new Set(applied.map(a => a.file))];
      for (const file of files) {
        git(`add "${file}"`);
      }

      // Create commit message
      const improvementIds = applied.map(a => a.improvementId).join(', ');
      const commitMessage = iteration !== null
        ? `Apply improvements from iteration ${iteration}\n\nImprovements: ${improvementIds}`
        : `Apply improvements\n\nImprovements: ${improvementIds}`;

      // Commit
      git(`commit -m "${commitMessage}"`);
      commitHash = getCurrentCommit();

      console.log(`✅ Commit created: ${commitHash}`);

      // Create tag if requested
      if (tag && iteration !== null) {
        tagName = `test-iteration-${iteration}`;
        git(`tag -a ${tagName} -m "Test iteration ${iteration}"`, { allowFail: true });
        console.log(`✅ Tag created: ${tagName}`);
      }
    } catch (error) {
      console.error(`❌ Git commit failed: ${error.message}`);
    }
  }

  console.log('\n✅ Done!\n');

  return {
    applied,
    skipped,
    commit: commitHash,
    tag: tagName,
  };
}

// ============================================================================
// Rollback
// ============================================================================

/**
 * Rollback to a specific commit
 * @param {string} commitHash - The commit to rollback to (or tag name)
 * @returns {Promise<void>}
 */
export async function rollbackIteration(commitHash) {
  console.log(`\n⏪ Rolling back to: ${commitHash}\n`);

  // Check if we're in a git repo
  if (!isGitRepo()) {
    throw new Error('Not in a git repository');
  }

  // Show what will be affected
  try {
    console.log('Changes that will be rolled back:');
    git(`diff --stat ${commitHash}..HEAD`);
  } catch (error) {
    console.error(`❌ Failed to show diff: ${error.message}`);
  }

  // Ask for confirmation
  const shouldRollback = await askYesNo('\n❓ Proceed with rollback?');
  if (!shouldRollback) {
    console.log('❌ Rollback cancelled');
    return;
  }

  // Perform rollback
  try {
    git(`reset --hard ${commitHash}`);
    console.log(`✅ Rolled back to: ${commitHash}`);
  } catch (error) {
    throw new Error(`Rollback failed: ${error.message}`);
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Parse command line arguments
 */
function parseArgs(argv) {
  const args = {
    auto: false,
    iteration: null,
    inputFile: null,
    rollback: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--auto':
        args.auto = true;
        break;
      case '--iteration':
        args.iteration = parseInt(argv[++i], 10);
        break;
      case '--input':
        args.inputFile = argv[++i];
        break;
      case '--rollback':
        args.rollback = argv[++i];
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }

  return args;
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Improvement Applier

Usage:
  node apply-improvements.mjs [options]

Options:
  --auto                    Auto-apply all improvements without confirmation
  --iteration <number>      Test iteration number (for commit message and tag)
  --input <file>            JSON file containing improvements
  --rollback <commit>       Rollback to a specific commit or tag
  --help, -h                Show this help message

Examples:
  # Apply improvements with confirmation
  node apply-improvements.mjs --input improvements.json

  # Auto-apply all improvements
  node apply-improvements.mjs --input improvements.json --auto --iteration 5

  # Rollback to a previous iteration
  node apply-improvements.mjs --rollback test-iteration-4

Input JSON format:
  [
    {
      "improvementId": "fix-english-switching",
      "file": "/absolute/path/to/file.js",
      "oldString": "old code here",
      "newString": "new code here",
      "description": "Fix English switching bug",
      "category": "bug-fix"
    }
  ]
`);
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Handle rollback
  if (args.rollback) {
    try {
      await rollbackIteration(args.rollback);
      process.exit(0);
    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      process.exit(1);
    }
  }

  // Apply improvements
  if (!args.inputFile) {
    console.error('❌ Error: --input is required');
    showHelp();
    process.exit(1);
  }

  if (!existsSync(args.inputFile)) {
    console.error(`❌ Error: Input file not found: ${args.inputFile}`);
    process.exit(1);
  }

  try {
    // Load improvements
    const improvementsJson = readFileSync(args.inputFile, 'utf-8');
    const improvements = JSON.parse(improvementsJson);

    if (!Array.isArray(improvements)) {
      throw new Error('Input must be an array of improvements');
    }

    // Validate improvements
    for (const imp of improvements) {
      if (!imp.improvementId || !imp.file || !imp.oldString || !imp.newString) {
        throw new Error(`Invalid improvement: ${JSON.stringify(imp)}`);
      }
    }

    // Apply improvements
    const result = await applyImprovements(improvements, {
      auto: args.auto,
      iteration: args.iteration,
    });

    // Write result to file
    const resultFile = args.inputFile.replace('.json', '.result.json');
    writeFileSync(resultFile, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`📄 Result written to: ${resultFile}`);

    // Exit with error code if any skipped
    process.exit(result.skipped.length > 0 ? 1 : 0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
