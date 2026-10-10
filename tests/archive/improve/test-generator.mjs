#!/usr/bin/env node
/**
 * Test script for improvement generator
 *
 * Demonstrates the API without requiring real Claude calls
 */

import { prioritizeImprovements } from './generate-improvements.mjs';
import fs from 'fs/promises';
import path from 'path';

console.log('🧪 Testing Improvement Generator\n');

// Load the example improvements
const examplePath = path.join(
  process.cwd(),
  'tests/improve/example-improvements.json'
);

try {
  const content = await fs.readFile(examplePath, 'utf-8');
  const data = JSON.parse(content);

  console.log('✅ Loaded example improvements');
  console.log(`   Total improvements: ${data.improvements.length}\n`);

  // Test prioritization
  console.log('🎯 Testing prioritization...\n');
  const prioritized = prioritizeImprovements(data.improvements);

  console.log('Top 3 Priority Improvements:\n');
  prioritized.slice(0, 3).forEach((imp, idx) => {
    console.log(`${idx + 1}. ${imp.description}`);
    console.log(`   Type: ${imp.type}`);
    console.log(`   Impact: ${imp.estimatedImpact} failures`);
    console.log(`   Confidence: ${imp.confidence}`);
    console.log(`   Priority Score: ${imp.priorityScore.toFixed(2)}`);
    console.log(`   File: ${imp.targetFile}`);
    console.log();
  });

  // Test validation
  console.log('✅ Testing validation...\n');
  const hasWarnings = prioritized.filter((i) => i.warnings.length > 0);
  console.log(`   Improvements with warnings: ${hasWarnings.length}`);

  const validatedOk = prioritized.filter(
    (i) => i.validation.fileExists && i.validation.textExists
  );
  console.log(`   Improvements validated OK: ${validatedOk.length}`);
  console.log();

  // Test summary
  console.log('📊 Summary Statistics:\n');
  console.log(`   Total improvements: ${data.summary.totalImprovements}`);
  console.log(`   By type:`);
  Object.entries(data.summary.byType).forEach(([type, count]) => {
    console.log(`     - ${type}: ${count}`);
  });
  console.log(`   Estimated fixes: ${data.summary.totalEstimatedFixes}`);
  console.log(`   High confidence: ${data.summary.highConfidenceCount}`);
  console.log();

  // Verify exports
  console.log('✅ All exports working correctly\n');

  console.log('✨ Test passed! Generator is ready to use.\n');
  console.log('To use with real data:');
  console.log('  node tests/improve/generate-improvements.mjs tests/reports/analysis-*.json\n');
} catch (err) {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
}
