/**
 * Improvement Generator
 *
 * Takes failure analysis and generates specific, actionable fixes for:
 * - Prompt improvements (conversation engine, character sheets)
 * - Level rule adjustments (A1/A2 constraints)
 * - Character sheet additions (missing behavioral rules)
 * - System instruction clarifications (house rules)
 *
 * Uses Claude to analyze failures and propose specific code/prompt changes.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate improvements based on failure analysis
 *
 * @param {Object} failureAnalysis - Output from analyze-failures.mjs
 * @param {Object} options - Configuration options
 * @param {string} options.projectRoot - Path to project root (default: process.cwd())
 * @param {number} options.maxImprovements - Max improvements to generate (default: 10)
 * @param {string[]} options.focusTypes - Focus on specific improvement types (default: all)
 * @returns {Promise<Object>} - Improvements with reasoning and estimates
 */
export async function generateImprovements(failureAnalysis, options = {}) {
  const {
    projectRoot = process.cwd(),
    maxImprovements = 10,
    focusTypes = ['prompt', 'level', 'character', 'system'],
  } = options;

  console.log('\n🔧 Generating improvements from failure analysis...\n');

  // Load relevant source files for context
  const sourceFiles = await loadSourceFiles(projectRoot);

  // Build the prompt for Claude
  const analysisPrompt = buildAnalysisPrompt(
    failureAnalysis,
    sourceFiles,
    maxImprovements,
    focusTypes
  );

  // Call Claude to generate improvements
  const response = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
    max_tokens: 8192,
    temperature: 0.3, // Lower temperature for more focused, practical suggestions
    system: IMPROVEMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
  });

  // Parse the response
  const improvements = parseImprovementResponse(response.content[0].text);

  // Validate and enrich improvements
  const enrichedImprovements = await enrichImprovements(
    improvements,
    sourceFiles,
    failureAnalysis
  );

  // Generate summary
  const summary = generateSummary(enrichedImprovements, failureAnalysis);

  return {
    improvements: enrichedImprovements,
    summary,
    metadata: {
      generatedAt: new Date().toISOString(),
      failureCount: failureAnalysis.summary.totalFailures,
      improvementCount: enrichedImprovements.length,
      estimatedFixCount: enrichedImprovements.reduce(
        (sum, imp) => sum + imp.estimatedImpact,
        0
      ),
    },
  };
}

/**
 * Prioritize improvements by impact and confidence
 *
 * @param {Array} improvements - Array of improvement objects
 * @returns {Array} - Sorted improvements with priority scores
 */
export function prioritizeImprovements(improvements) {
  // Calculate priority score for each improvement
  const scored = improvements.map((improvement) => {
    const impactWeight = 0.6;
    const confidenceWeight = 0.4;

    const confidenceScore = {
      high: 1.0,
      medium: 0.6,
      low: 0.3,
    }[improvement.confidence];

    // Normalize impact (assume max 20 failures per improvement)
    const normalizedImpact = Math.min(improvement.estimatedImpact / 20, 1.0);

    const priorityScore =
      normalizedImpact * impactWeight + confidenceScore * confidenceWeight;

    return {
      ...improvement,
      priorityScore,
    };
  });

  // Sort by priority score (highest first)
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  // Add priority rank
  return scored.map((improvement, index) => ({
    ...improvement,
    priorityRank: index + 1,
  }));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load relevant source files for context
 */
async function loadSourceFiles(projectRoot) {
  const files = {};

  const filesToLoad = [
    'app/api/turn/route.ts',
    'content/it/levels/a1.ts',
    'content/it/levels/a2.ts',
    'content/it/characters/giulia.ts',
    'content/it/characters/rita.ts',
    'tests/judge/rubric.ts',
  ];

  for (const filePath of filesToLoad) {
    const fullPath = path.join(projectRoot, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      files[filePath] = content;
    } catch (err) {
      console.warn(`⚠️  Could not load ${filePath}: ${err.message}`);
    }
  }

  return files;
}

/**
 * Build the analysis prompt for Claude
 */
function buildAnalysisPrompt(
  failureAnalysis,
  sourceFiles,
  maxImprovements,
  focusTypes
) {
  return `You are an expert at analyzing test failures and proposing specific, actionable fixes.

# FAILURE ANALYSIS

${JSON.stringify(failureAnalysis, null, 2)}

# CURRENT SOURCE FILES

${Object.entries(sourceFiles)
  .map(([path, content]) => `## ${path}\n\n\`\`\`\n${content}\n\`\`\``)
  .join('\n\n')}

# YOUR TASK

Analyze the failures and generate up to ${maxImprovements} specific improvements.

Focus on these improvement types: ${focusTypes.join(', ')}

For each improvement, provide:

1. **ID**: A unique kebab-case identifier (e.g., "fix-english-switching")
2. **Type**: One of: ${focusTypes.join(', ')}
3. **Target File**: The exact file path that needs changes
4. **Description**: A clear, one-sentence description of the fix
5. **Original Text**: The current text/code that needs changing (exact match)
6. **Proposed Text**: The improved text/code
7. **Reasoning**: Why this fix addresses the failures (cite specific failure IDs/patterns)
8. **Estimated Impact**: Number of failures this should fix (be conservative)
9. **Confidence**: high/medium/low based on how certain you are this will work

# IMPROVEMENT TYPES

- **prompt**: Changes to conversation prompts in API route handlers
- **level**: Adjustments to level definitions (A1, A2, etc.)
- **character**: Additions/changes to character sheets
- **system**: Changes to system instructions or rubric

# GUIDELINES

- Be SPECIFIC: Quote exact text to find/replace
- Be CONSERVATIVE: Don't promise to fix more failures than likely
- Focus on HIGH-IMPACT changes that fix multiple failures
- Don't propose changes that might break passing tests
- Prefer prompt clarifications over code changes
- Keep the character's personality intact

# OUTPUT FORMAT

Return a JSON object with this structure:

\`\`\`json
{
  "improvements": [
    {
      "id": "fix-english-switching",
      "type": "prompt",
      "targetFile": "app/api/turn/route.ts",
      "description": "Add explicit instruction to never switch to English",
      "originalText": "1. Stay entirely in Italian (never switch to English unprompted)",
      "proposedText": "1. Stay entirely in Italian at ALL times. NEVER switch to English, even if the learner seems confused. If you cannot understand, stay in Italian and ask for clarification: 'Non ho capito. Puoi ripetere?'",
      "reasoning": "Failures 'giulia-order-confused-01' and 'rita-directions-02' show NPCs switching to English when confused. The current instruction 'never switch unprompted' is ambiguous about what constitutes 'prompted'. Making this absolute eliminates the ambiguity.",
      "estimatedImpact": 4,
      "confidence": "high"
    }
  ]
}
\`\`\`

Generate practical, high-impact improvements now:`;
}

/**
 * Parse Claude's improvement response
 */
function parseImprovementResponse(responseText) {
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  const jsonText = jsonMatch ? jsonMatch[1] : responseText;

  try {
    const parsed = JSON.parse(jsonText);
    return parsed.improvements || [];
  } catch (err) {
    console.error('Failed to parse improvement response:', err.message);
    console.error('Response text:', responseText.substring(0, 500));
    return [];
  }
}

/**
 * Enrich improvements with additional metadata
 */
async function enrichImprovements(improvements, sourceFiles, failureAnalysis) {
  return improvements.map((improvement) => {
    // Validate that targetFile exists
    const fileExists = improvement.targetFile in sourceFiles;

    // Validate that originalText exists in target file
    let textExists = false;
    let lineNumber = null;

    if (fileExists) {
      const content = sourceFiles[improvement.targetFile];
      const lines = content.split('\n');
      const searchText = improvement.originalText.trim();

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchText.substring(0, 50))) {
          textExists = true;
          lineNumber = i + 1;
          break;
        }
      }
    }

    // Identify which specific failures this addresses
    const addressedFailures = identifyAddressedFailures(
      improvement,
      failureAnalysis
    );

    return {
      ...improvement,
      validation: {
        fileExists,
        textExists,
        lineNumber,
      },
      addressedFailures,
      warnings: [
        ...(!fileExists ? [`Target file ${improvement.targetFile} not found`] : []),
        ...(!textExists && fileExists
          ? ['Original text not found in target file']
          : []),
      ],
    };
  });
}

/**
 * Identify which failures an improvement addresses
 */
function identifyAddressedFailures(improvement, failureAnalysis) {
  const addressed = [];
  const reasoning = improvement.reasoning.toLowerCase();

  // Look for failure IDs mentioned in reasoning
  for (const failure of failureAnalysis.failures || []) {
    const failureId = `${failure.persona}-${failure.sceneId}`.toLowerCase();
    if (reasoning.includes(failureId) || reasoning.includes(failure.persona)) {
      addressed.push({
        testRun: failureId,
        criterion: failure.criterion,
        relevance: 'direct', // mentioned in reasoning
      });
    }
  }

  // Look for patterns mentioned in reasoning
  for (const pattern of failureAnalysis.patterns || []) {
    if (reasoning.includes(pattern.pattern.toLowerCase())) {
      for (const failureId of pattern.failures) {
        if (!addressed.find((f) => f.testRun === failureId)) {
          addressed.push({
            testRun: failureId,
            criterion: pattern.pattern,
            relevance: 'pattern', // part of a pattern
          });
        }
      }
    }
  }

  return addressed;
}

/**
 * Generate summary of improvements
 */
function generateSummary(improvements, failureAnalysis) {
  const byType = {};
  improvements.forEach((imp) => {
    byType[imp.type] = (byType[imp.type] || 0) + 1;
  });

  const totalEstimatedFixes = improvements.reduce(
    (sum, imp) => sum + imp.estimatedImpact,
    0
  );

  const highConfidence = improvements.filter((i) => i.confidence === 'high')
    .length;

  return {
    totalImprovements: improvements.length,
    byType,
    totalEstimatedFixes,
    fixRate: `${((totalEstimatedFixes / failureAnalysis.summary.totalFailures) * 100).toFixed(1)}%`,
    highConfidenceCount: highConfidence,
    validationIssues: improvements.filter((i) => i.warnings.length > 0).length,
  };
}

// ============================================================================
// System Prompt for Claude
// ============================================================================

const IMPROVEMENT_SYSTEM_PROMPT = `You are an expert at analyzing test failures in language learning applications and proposing specific, actionable fixes.

Your role is to:
1. Identify patterns in test failures
2. Trace failures back to their root causes in prompts, level definitions, or character sheets
3. Propose precise text changes that will fix the failures
4. Estimate impact conservatively
5. Maintain the app's voice and personality

Key principles:
- Be SPECIFIC: Quote exact text for find/replace operations
- Be PRACTICAL: Propose changes that can be applied immediately
- Be CONSERVATIVE: Don't over-promise on impact
- Be CLEAR: Explain why each fix addresses the failures
- Maintain CHARACTER: Keep personality and teaching philosophy intact

You have deep knowledge of:
- CEFR language levels (A1, A2, B1, etc.)
- Italian language teaching methodology
- Conversational AI prompt engineering
- Character-driven learning experiences

Focus on fixes that:
- Clarify ambiguous instructions
- Add missing behavioral constraints
- Adjust level-appropriate language rules
- Improve error correction strategies
- Maintain immersion and character consistency`;

// ============================================================================
// CLI Interface
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const analysisFile = process.argv[2];

  if (!analysisFile) {
    console.error('Usage: node generate-improvements.mjs <failure-analysis.json>');
    console.error(
      'Example: node generate-improvements.mjs tests/reports/analysis-2024-01-15.json'
    );
    process.exit(1);
  }

  try {
    const analysisContent = await fs.readFile(analysisFile, 'utf-8');
    const failureAnalysis = JSON.parse(analysisContent);

    const result = await generateImprovements(failureAnalysis);

    // Print summary
    console.log('\n📊 IMPROVEMENT SUMMARY\n');
    console.log(`Total improvements generated: ${result.summary.totalImprovements}`);
    console.log(
      `By type: ${Object.entries(result.summary.byType)
        .map(([type, count]) => `${type}=${count}`)
        .join(', ')}`
    );
    console.log(
      `Estimated fixes: ${result.summary.totalEstimatedFixes} / ${result.metadata.failureCount} (${result.summary.fixRate})`
    );
    console.log(
      `High confidence: ${result.summary.highConfidenceCount} / ${result.summary.totalImprovements}`
    );

    if (result.summary.validationIssues > 0) {
      console.log(
        `\n⚠️  ${result.summary.validationIssues} improvements have validation warnings`
      );
    }

    // Prioritize improvements
    const prioritized = prioritizeImprovements(result.improvements);

    console.log('\n🎯 TOP PRIORITY IMPROVEMENTS\n');
    prioritized.slice(0, 5).forEach((imp, idx) => {
      console.log(`${idx + 1}. [${imp.type}] ${imp.description}`);
      console.log(`   Impact: ${imp.estimatedImpact} failures | Confidence: ${imp.confidence}`);
      console.log(`   File: ${imp.targetFile}`);
      if (imp.warnings.length > 0) {
        console.log(`   ⚠️  ${imp.warnings.join(', ')}`);
      }
      console.log();
    });

    // Save results
    const outputPath = analysisFile.replace('.json', '-improvements.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify({ ...result, prioritized }, null, 2)
    );

    console.log(`\n✅ Improvements saved to: ${outputPath}\n`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
