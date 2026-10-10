#!/usr/bin/env node
/**
 * Test script for the improvement applier
 *
 * This script tests all the key functionality of the applier:
 * - Showing diffs
 * - Applying improvements
 * - Handling skipped improvements
 * - Creating backups
 * - (Git operations are not tested to avoid side effects)
 */

import { applyImprovements, showDiff } from './apply-improvements.mjs';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test directory
const TEST_DIR = resolve(__dirname, '.test-tmp');
const TEST_FILE = resolve(TEST_DIR, 'test.js');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function assert(condition, message) {
  if (!condition) {
    log(`❌ FAILED: ${message}`, 'red');
    throw new Error(message);
  } else {
    log(`✅ PASSED: ${message}`, 'green');
  }
}

// ============================================================================
// Test Setup
// ============================================================================

function setup() {
  log('\n📋 Setting up test environment...', 'blue');

  // Clean up any previous test artifacts
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }

  // Create test directory
  mkdirSync(TEST_DIR, { recursive: true });

  // Create test file
  const testContent = `function greet(name) {
  console.log('Hello ' + name);
}

function farewell(name) {
  console.log('Goodbye ' + name);
}

module.exports = { greet, farewell };
`;

  writeFileSync(TEST_FILE, testContent, 'utf-8');

  log('✅ Test environment ready\n', 'green');
}

function teardown() {
  log('\n🧹 Cleaning up test environment...', 'blue');

  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }

  log('✅ Cleanup complete\n', 'green');
}

// ============================================================================
// Tests
// ============================================================================

async function testShowDiff() {
  log('🧪 Test: showDiff()', 'yellow');

  const improvement = {
    improvementId: 'test-greeting',
    file: TEST_FILE,
    oldString: "console.log('Hello ' + name);",
    newString: "console.log(`Hello, ${name}!`);",
    description: 'Use template literals',
  };

  const result = showDiff(improvement);

  assert(result.willApply === true, 'Should be able to apply the change');
  assert(result.filepath === TEST_FILE, 'File path should match');
  assert(result.diff.includes('-'), 'Diff should contain removal lines');
  assert(result.diff.includes('+'), 'Diff should contain addition lines');
  assert(result.newContent.includes('`Hello, ${name}!`'), 'New content should contain the replacement');

  log('');
}

async function testShowDiffFileNotFound() {
  log('🧪 Test: showDiff() - File not found', 'yellow');

  const improvement = {
    improvementId: 'test-nonexistent',
    file: resolve(TEST_DIR, 'nonexistent.js'),
    oldString: 'foo',
    newString: 'bar',
  };

  const result = showDiff(improvement);

  assert(result.willApply === false, 'Should not be able to apply to nonexistent file');
  assert(result.diff === null, 'Diff should be null for nonexistent file');

  log('');
}

async function testShowDiffStringNotFound() {
  log('🧪 Test: showDiff() - String not found', 'yellow');

  const improvement = {
    improvementId: 'test-notfound',
    file: TEST_FILE,
    oldString: 'this string does not exist',
    newString: 'replacement',
  };

  const result = showDiff(improvement);

  assert(result.willApply === false, 'Should not be able to apply when string not found');
  assert(result.diff === null, 'Diff should be null when string not found');

  log('');
}

async function testApplySingleImprovement() {
  log('🧪 Test: applyImprovements() - Single improvement', 'yellow');

  const improvements = [
    {
      improvementId: 'improve-greeting',
      file: TEST_FILE,
      oldString: "console.log('Hello ' + name);",
      newString: "console.log(`Hello, ${name}!`);",
      description: 'Use template literals',
      category: 'enhancement',
    },
  ];

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
  });

  assert(result.applied.length === 1, 'Should apply one improvement');
  assert(result.skipped.length === 0, 'Should skip zero improvements');
  assert(result.applied[0].improvementId === 'improve-greeting', 'Should apply correct improvement');

  // Verify file was modified
  const content = readFileSync(TEST_FILE, 'utf-8');
  assert(content.includes('`Hello, ${name}!`'), 'File should contain the new code');
  assert(!content.includes("'Hello ' + name"), 'File should not contain the old code');

  log('');
}

async function testApplyMultipleImprovements() {
  log('🧪 Test: applyImprovements() - Multiple improvements', 'yellow');

  // Reset test file
  const testContent = `function greet(name) {
  console.log('Hello ' + name);
}

function farewell(name) {
  console.log('Goodbye ' + name);
}

module.exports = { greet, farewell };
`;
  writeFileSync(TEST_FILE, testContent, 'utf-8');

  const improvements = [
    {
      improvementId: 'improve-greeting',
      file: TEST_FILE,
      oldString: "console.log('Hello ' + name);",
      newString: "console.log(`Hello, ${name}!`);",
    },
    {
      improvementId: 'improve-farewell',
      file: TEST_FILE,
      oldString: "console.log('Goodbye ' + name);",
      newString: "console.log(`Goodbye, ${name}!`);",
    },
  ];

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
  });

  assert(result.applied.length === 2, 'Should apply two improvements');
  assert(result.skipped.length === 0, 'Should skip zero improvements');

  // Verify file was modified
  const content = readFileSync(TEST_FILE, 'utf-8');
  assert(content.includes('`Hello, ${name}!`'), 'File should contain the greeting change');
  assert(content.includes('`Goodbye, ${name}!`'), 'File should contain the farewell change');

  log('');
}

async function testSkipImprovementFileNotFound() {
  log('🧪 Test: applyImprovements() - Skip when file not found', 'yellow');

  const improvements = [
    {
      improvementId: 'nonexistent-file',
      file: resolve(TEST_DIR, 'nonexistent.js'),
      oldString: 'foo',
      newString: 'bar',
    },
  ];

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
  });

  assert(result.applied.length === 0, 'Should apply zero improvements');
  assert(result.skipped.length === 1, 'Should skip one improvement');
  assert(result.skipped[0].improvementId === 'nonexistent-file', 'Should skip correct improvement');
  assert(result.skipped[0].reason.includes('not found'), 'Reason should mention file not found');

  log('');
}

async function testSkipImprovementStringNotFound() {
  log('🧪 Test: applyImprovements() - Skip when string not found', 'yellow');

  const improvements = [
    {
      improvementId: 'string-not-found',
      file: TEST_FILE,
      oldString: 'this string does not exist',
      newString: 'replacement',
    },
  ];

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
  });

  assert(result.applied.length === 0, 'Should apply zero improvements');
  assert(result.skipped.length === 1, 'Should skip one improvement');
  assert(result.skipped[0].reason.includes('not found'), 'Reason should mention string not found');

  log('');
}

async function testBackupCreation() {
  log('🧪 Test: Backup creation', 'yellow');

  // Reset test file
  const testContent = `function test() {
  return 'original';
}
`;
  writeFileSync(TEST_FILE, testContent, 'utf-8');

  const improvements = [
    {
      improvementId: 'test-backup',
      file: TEST_FILE,
      oldString: "'original'",
      newString: "'modified'",
    },
  ];

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
    createBackup: true,
  });

  assert(result.applied.length === 1, 'Should apply one improvement');
  assert(result.applied[0].backupPath !== undefined, 'Should have backup path');
  assert(existsSync(result.applied[0].backupPath), 'Backup file should exist');

  // Verify backup contains original content
  const backupContent = readFileSync(result.applied[0].backupPath, 'utf-8');
  assert(backupContent.includes("'original'"), 'Backup should contain original content');

  log('');
}

async function testMixedResults() {
  log('🧪 Test: Mixed applied and skipped improvements', 'yellow');

  // Reset test file
  const testContent = `function test() {
  return 'value';
}
`;
  writeFileSync(TEST_FILE, testContent, 'utf-8');

  const improvements = [
    {
      improvementId: 'valid-change',
      file: TEST_FILE,
      oldString: "'value'",
      newString: "'new-value'",
    },
    {
      improvementId: 'invalid-change',
      file: TEST_FILE,
      oldString: 'nonexistent string',
      newString: 'replacement',
    },
    {
      improvementId: 'valid-change-2',
      file: TEST_FILE,
      oldString: 'function test()',
      newString: 'function testFunction()',
    },
  ];

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
  });

  assert(result.applied.length === 2, 'Should apply two improvements');
  assert(result.skipped.length === 1, 'Should skip one improvement');
  assert(result.skipped[0].improvementId === 'invalid-change', 'Should skip the invalid change');

  // Verify valid changes were applied
  const content = readFileSync(TEST_FILE, 'utf-8');
  assert(content.includes("'new-value'"), 'File should contain first change');
  assert(content.includes('testFunction'), 'File should contain second change');

  log('');
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runTests() {
  log('\n' + '='.repeat(80), 'blue');
  log('🧪 Improvement Applier Test Suite', 'blue');
  log('='.repeat(80) + '\n', 'blue');

  try {
    setup();

    await testShowDiff();
    await testShowDiffFileNotFound();
    await testShowDiffStringNotFound();
    await testApplySingleImprovement();
    await testApplyMultipleImprovements();
    await testSkipImprovementFileNotFound();
    await testSkipImprovementStringNotFound();
    await testBackupCreation();
    await testMixedResults();

    teardown();

    log('='.repeat(80), 'green');
    log('✅ All tests passed!', 'green');
    log('='.repeat(80) + '\n', 'green');

    process.exit(0);
  } catch (error) {
    log('\n' + '='.repeat(80), 'red');
    log('❌ Test suite failed!', 'red');
    log('='.repeat(80), 'red');
    log(`\nError: ${error.message}\n`, 'red');

    teardown();

    process.exit(1);
  }
}

runTests();
