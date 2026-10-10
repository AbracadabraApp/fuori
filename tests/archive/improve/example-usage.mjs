#!/usr/bin/env node
/**
 * Example: Using the Improvement Applier
 *
 * This script demonstrates how to use the improvement applier
 * programmatically in your test workflows.
 */

import { applyImprovements, showDiff, rollbackIteration } from './apply-improvements.mjs';
import { resolve } from 'path';

// ============================================================================
// Example 1: Preview Changes Before Applying
// ============================================================================

async function example1() {
  console.log('\n📖 Example 1: Preview Changes\n');

  const improvements = [
    {
      improvementId: 'example-improvement',
      file: resolve(process.cwd(), 'test-file.txt'),
      oldString: 'Hello World',
      newString: 'Hello, Beautiful World!',
      description: 'Make greeting more enthusiastic',
    },
  ];

  // Preview the change
  console.log('Previewing change...\n');
  const result = showDiff(improvements[0]);

  if (result.willApply) {
    console.log('\n✅ This change can be applied');
    console.log(`📁 File: ${result.filepath}`);
  } else {
    console.log('\n❌ This change cannot be applied');
  }
}

// ============================================================================
// Example 2: Apply Improvements Automatically
// ============================================================================

async function example2() {
  console.log('\n📖 Example 2: Auto-Apply Improvements\n');

  const improvements = [
    {
      improvementId: 'fix-1',
      file: resolve(process.cwd(), 'test-file.txt'),
      oldString: 'Hello World',
      newString: 'Ciao Mondo',
      description: 'Use Italian greeting',
    },
  ];

  // Apply automatically
  const result = await applyImprovements(improvements, {
    auto: true,
    iteration: 1,
    commit: false, // Don't commit in example
  });

  console.log('\n📊 Results:');
  console.log(`Applied: ${result.applied.length}`);
  console.log(`Skipped: ${result.skipped.length}`);

  if (result.applied.length > 0) {
    console.log('\n✅ Applied improvements:');
    for (const applied of result.applied) {
      console.log(`  - ${applied.improvementId}`);
      console.log(`    File: ${applied.file}`);
      console.log(`    Backup: ${applied.backupPath}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log('\n⏭️  Skipped improvements:');
    for (const skipped of result.skipped) {
      console.log(`  - ${skipped.improvementId}: ${skipped.reason}`);
    }
  }
}

// ============================================================================
// Example 3: Integration with Test Loop
// ============================================================================

async function example3() {
  console.log('\n📖 Example 3: Integration with Test Loop\n');

  // Simulated test results
  const testResults = {
    passed: 5,
    failed: 3,
    failures: [
      { test: 'test-1', reason: 'English switching' },
      { test: 'test-2', reason: 'Level violation' },
      { test: 'test-3', reason: 'No scaffolding' },
    ],
  };

  console.log('Test Results:');
  console.log(`  ✅ Passed: ${testResults.passed}`);
  console.log(`  ❌ Failed: ${testResults.failed}`);

  // Analyze failures and generate improvements (simplified)
  const improvements = generateImprovementsFromFailures(testResults.failures);

  console.log(`\n🔧 Generated ${improvements.length} improvements`);

  // Preview improvements
  console.log('\n📝 Preview:');
  for (const improvement of improvements) {
    console.log(`  - ${improvement.improvementId}: ${improvement.description}`);
  }

  // Apply improvements (in real workflow)
  // const result = await applyImprovements(improvements, { auto: true, iteration: 1 });
  console.log('\n💡 In a real workflow, these would be applied automatically');
}

// Helper function (simplified)
function generateImprovementsFromFailures(failures) {
  return failures.map((failure, i) => ({
    improvementId: `fix-${i + 1}`,
    file: resolve(process.cwd(), `src/conversation-engine.js`),
    oldString: 'example old code',
    newString: 'example new code',
    description: `Fix: ${failure.reason}`,
    category: 'bug-fix',
  }));
}

// ============================================================================
// Example 4: Error Handling
// ============================================================================

async function example4() {
  console.log('\n📖 Example 4: Error Handling\n');

  const improvements = [
    {
      improvementId: 'valid-change',
      file: resolve(process.cwd(), 'test-file.txt'),
      oldString: 'existing text',
      newString: 'new text',
    },
    {
      improvementId: 'invalid-change',
      file: resolve(process.cwd(), 'nonexistent.txt'),
      oldString: 'some text',
      newString: 'other text',
    },
  ];

  console.log('Attempting to apply improvements (some will fail)...\n');

  const result = await applyImprovements(improvements, {
    auto: true,
    commit: false,
  });

  console.log('\n📊 Results:');
  console.log(`Applied: ${result.applied.length}`);
  console.log(`Skipped: ${result.skipped.length}`);

  // Handle skipped improvements
  if (result.skipped.length > 0) {
    console.log('\n⚠️  Some improvements were skipped:');
    for (const skipped of result.skipped) {
      console.error(`  ❌ ${skipped.improvementId}: ${skipped.reason}`);
    }

    // You could log this, retry, or alert
    console.log('\n💡 In production, you would log these for investigation');
  }
}

// ============================================================================
// Example 5: Rollback on Test Failure
// ============================================================================

async function example5() {
  console.log('\n📖 Example 5: Rollback on Test Failure\n');

  const improvements = [
    {
      improvementId: 'risky-change',
      file: resolve(process.cwd(), 'test-file.txt'),
      oldString: 'Hello World',
      newString: 'Broken Code',
    },
  ];

  console.log('Applying improvements...');

  const result = await applyImprovements(improvements, {
    auto: true,
    iteration: 5,
    commit: false, // Would be true in real workflow
  });

  console.log(`✅ Applied ${result.applied.length} improvements`);

  // Simulate running tests
  console.log('\n🧪 Running tests...');
  const testsPassed = false; // Simulated test failure

  if (!testsPassed) {
    console.log('❌ Tests failed!');
    console.log('\n⏪ Rolling back changes...');

    // In a real workflow with commits enabled:
    // if (result.commit) {
    //   await rollbackIteration(result.commit + '~1');
    // }

    console.log('💡 In production, this would rollback to previous commit');
  } else {
    console.log('✅ Tests passed!');
  }
}

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🎓 Improvement Applier Examples');
  console.log('='.repeat(80));

  try {
    await example1();
    // await example2(); // Uncomment to actually apply changes
    await example3();
    await example4();
    await example5();

    console.log('\n' + '='.repeat(80));
    console.log('✅ All examples completed!');
    console.log('='.repeat(80) + '\n');

    console.log('💡 To see more:');
    console.log('  - Run individual examples by uncommenting them in main()');
    console.log('  - Check test-applier.mjs for comprehensive tests');
    console.log('  - Read USAGE.md for detailed usage guide');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
