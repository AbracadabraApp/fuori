#!/usr/bin/env node
/**
 * Simulated Learner Test Runner
 *
 * Orchestrates automated testing of conversation quality using Claude-as-learner
 * and Claude-as-judge. Tests realistic scenarios with transcription noise and
 * common beginner mistakes.
 *
 * Run with: npm run test:learner
 *
 * See: docs/10-testing.md section 4b
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  turnsPerConversation: 10, // 8-12 turns for realistic scene
  verbose: process.argv.includes('--verbose'),
  outputDir: resolve(__dirname, 'reports'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
};

if (!CONFIG.anthropicApiKey) {
  console.error('Error: ANTHROPIC_API_KEY not found in environment');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: CONFIG.anthropicApiKey });

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} LearnerPersona
 * @property {string} id
 * @property {string} level - 'A1' | 'A1+' | 'A2'
 * @property {string} nativeLanguage
 * @property {string[]} commonMistakes - Patterns like "uses voglio instead of vorrei"
 * @property {string[]} transcriptionNoise - Examples: "bone journal" → "buongiorno"
 * @property {string} behaviorDescription - How the learner behaves in conversation
 */

/**
 * @typedef {Object} ConversationTurn
 * @property {string} who - 'learner' | 'npc'
 * @property {string} transcript - What was actually said (with noise for learner)
 * @property {string} [understood] - What NPC understood (for NPC turns)
 * @property {string} [translation] - English translation
 * @property {Object} [raw] - Full turn output from NPC
 */

/**
 * @typedef {Object} JudgmentCriterion
 * @property {string} criterion - What's being judged
 * @property {number} score - 0-10
 * @property {string} reasoning - Why this score
 * @property {string[]} examples - Quotes from conversation
 */

/**
 * @typedef {Object} JudgmentResult
 * @property {string} conversationId
 * @property {number} overallScore - 0-10
 * @property {JudgmentCriterion[]} criteria
 * @property {string} summary - Overall assessment
 */

/**
 * @typedef {Object} TestRun
 * @property {LearnerPersona} persona
 * @property {string} sceneId
 * @property {string} characterId
 * @property {ConversationTurn[]} transcript
 * @property {JudgmentResult} judgment
 * @property {string} timestamp
 */

// ============================================================================
// Load Test Data
// ============================================================================

/**
 * TODO: Load learner personas from tests/personas/learner-personas.ts
 * For now, using inline example personas
 */
function loadPersonas() {
  // TODO: Import from tests/personas/learner-personas.ts once created
  return [
    {
      id: 'beginner-english',
      level: 'A1',
      nativeLanguage: 'English',
      commonMistakes: [
        'uses "voglio" instead of "vorrei" (too direct)',
        'mixes up article genders (il/la)',
        'forgets verb conjugations',
        'sometimes answers in English when stuck',
      ],
      transcriptionNoise: [
        '"bone journal" → buongiorno',
        '"quando costa" → quanto costa',
        '"cornetta" → cornetto',
        '"vorray" → vorrei',
      ],
      behaviorDescription: 'Enthusiastic but uncertain. Tries hard but makes typical A1 mistakes. Gets flustered when confused. Often starts sentences in Italian then switches to English.',
    },
    {
      id: 'shy-beginner',
      level: 'A1',
      nativeLanguage: 'English',
      commonMistakes: [
        'very short responses',
        'afraid to make mistakes',
        'uses same simple phrases repeatedly',
        'rarely volunteers new information',
      ],
      transcriptionNoise: [
        '"grazie-ay" → grazie',
        '"bwon jorno" → buongiorno',
      ],
      behaviorDescription: 'Quiet and careful. Gives minimal responses. Needs encouragement. Avoids complex sentences.',
    },
    {
      id: 'intermediate-english',
      level: 'A2',
      nativeLanguage: 'English',
      commonMistakes: [
        'struggles with passato prossimo vs imperfetto',
        'confuses prepositions (a/in/da)',
        'uses English word order in complex sentences',
      ],
      transcriptionNoise: [
        '"sono andato" sometimes comes out as "sun andato"',
        '"ho fatto" → "oh fatto"',
      ],
      behaviorDescription: 'More confident, attempts complex sentences. Makes intermediate-level errors. Can have a real conversation but needs corrections.',
    },
  ];
}

/**
 * TODO: Load test scenes from Roma city pantry
 * Focus on common situations: bar, market, etc.
 */
function loadTestScenes() {
  // TODO: Import actual scenes from content/it/cities/roma.ts
  // For now, using simplified scene descriptions
  return [
    {
      sceneId: 'test-bar-morning',
      characterId: 'giulia',
      placeId: 'bar-trastevere-giulia',
      description: 'Morning at Giulia\'s bar in Trastevere',
      goal: [
        'Greet Giulia',
        'Order a coffee and cornetto',
        'Ask the price',
        'Pay and say goodbye',
      ],
      setting: {
        place: 'Small neighborhood bar in Trastevere',
        timeOfDay: 'morning',
        description: 'Busy morning at the bar, regulars at the counter, espresso machine hissing',
      },
    },
    {
      sceneId: 'test-market',
      characterId: 'test-market-vendor',
      placeId: 'mercato-san-cosimato',
      description: 'Shopping at San Cosimato market',
      goal: [
        'Greet the vendor',
        'Ask about tomatoes',
        'Ask the price',
        'Buy some tomatoes',
      ],
      setting: {
        place: 'Fruit and vegetable stall at San Cosimato market',
        timeOfDay: 'morning',
        description: 'Busy market morning, colorful produce displays, vendor calling out prices',
      },
    },
  ];
}

/**
 * Load level rules for judging
 */
function loadLevelRules(level) {
  // TODO: Import from content/it/levels/
  // For now, returning simplified rules
  const rules = {
    'A1': {
      maxWordsPerSentence: 8,
      maxSentencesPerTurn: 3,
      newWordsPerTurn: 2,
      tensesAllowed: ['presente'],
      tensesAvoid: ['passato prossimo', 'imperfetto', 'futuro', 'condizionale', 'congiuntivo'],
    },
    'A1+': {
      maxWordsPerSentence: 10,
      maxSentencesPerTurn: 3,
      newWordsPerTurn: 2,
      tensesAllowed: ['presente', 'passato prossimo (simple)'],
      tensesAvoid: ['imperfetto', 'futuro', 'condizionale beyond vorrei/potrei', 'congiuntivo'],
    },
    'A2': {
      maxWordsPerSentence: 12,
      maxSentencesPerTurn: 4,
      newWordsPerTurn: 3,
      tensesAllowed: ['presente', 'passato prossimo', 'simple futuro'],
      tensesAvoid: ['congiuntivo', 'passato remoto', 'trapassato'],
    },
  };
  return rules[level] || rules['A1'];
}

/**
 * Load character sheet for the scene
 */
function loadCharacter(characterId) {
  // TODO: Import from content/it/characters/
  // For now, using Giulia as example
  if (characterId === 'giulia') {
    return {
      id: 'giulia',
      name: 'Giulia',
      role: 'barista',
      speech: {
        formality: 'tu',
        pace: 'quick',
        regionalisms: ['daje', 'anvedi', 'aò'],
        description: 'Fast-talking, informal, uses Roman slang sparingly at A1-A2',
      },
    };
  }

  // Generic market vendor for testing
  return {
    id: 'test-market-vendor',
    name: 'Enzo',
    role: 'market vendor',
    speech: {
      formality: 'tu',
      pace: 'normal',
      regionalisms: ['daje'],
      description: 'Friendly market vendor, theatrical, loves talking about produce',
    },
  };
}

// ============================================================================
// Simulated Learner (Claude plays the learner)
// ============================================================================

/**
 * Generate learner prompt
 */
function buildLearnerPrompt(persona, scene, transcript, npcLastLine) {
  const level = persona.level;

  let prompt = `You are playing the role of an Italian language learner in a realistic conversation simulation.

LEARNER PROFILE:
- Level: ${level}
- Native language: ${persona.nativeLanguage}
- Personality: ${persona.behaviorDescription}

COMMON MISTAKES YOU MAKE:
${persona.commonMistakes.map(m => `- ${m}`).join('\n')}

SPEECH RECOGNITION NOISE:
Your Italian is transcribed with errors like:
${persona.transcriptionNoise.map(n => `- ${n}`).join('\n')}

SCENE:
${scene.setting.description}
Goal: ${scene.goal.join(', ')}

INSTRUCTIONS:
1. Respond in Italian like a ${level} learner would
2. Make realistic mistakes from your profile
3. Add transcription noise occasionally (simulate what speech-to-text might produce)
4. Stay in character - you're learning, uncertain, but trying
5. Keep it natural - one turn at a time
6. If very stuck, you might mix in some English

CONVERSATION SO FAR:
${transcript.map(t => `${t.who === 'learner' ? 'You' : scene.characterId}: ${t.transcript}`).join('\n')}

${npcLastLine ? `\nThe character just said: "${npcLastLine}"\n` : '\nYou are starting the conversation.\n'}

Respond with ONLY your next line in Italian (with realistic mistakes and occasional transcription noise). No explanations, no meta-commentary.`;

  return prompt;
}

/**
 * Call Claude to generate learner response
 */
async function getLearnerResponse(persona, scene, transcript, npcLastLine) {
  const prompt = buildLearnerPrompt(persona, scene, transcript, npcLastLine);

  try {
    const message = await anthropic.messages.create({
      model: CONFIG.model,
      max_tokens: 200,
      temperature: 0.9, // Higher temperature for varied learner behavior
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const response = message.content[0].text.trim();

    if (CONFIG.verbose) {
      console.log(`  Learner says: ${response}`);
    }

    return response;
  } catch (error) {
    console.error('Error getting learner response:', error.message);
    throw error;
  }
}

// ============================================================================
// Simulated NPC (Claude plays the character)
// ============================================================================

/**
 * Build the full conversation prompt for NPC
 * This mimics what /api/turn will do in production
 */
function buildNPCPrompt(character, scene, levelRules, transcript, learnerLine) {
  // TODO: This should match the actual prompt structure from the conversation engine
  // See docs/04-conversation-engine.md for the layered prompt structure

  const prompt = `You are ${character.name}, a ${character.role} in Rome.

HOUSE RULES:
- Stay in Italian always (never switch to English unprompted)
- Forgive speech recognition noise (e.g. "bone journal" → understand as "buongiorno")
- Recast real grammar mistakes naturally in your response (don't lecture)
- Keep conversation flowing naturally
- You're a real person, not a teacher

LEVEL RULES (${levelRules.level || 'A1'}):
- Use ${levelRules.maxWordsPerSentence} words or fewer per sentence
- Maximum ${levelRules.maxSentencesPerTurn} sentences per turn
- Use only: ${levelRules.tensesAllowed.join(', ')}
- Avoid: ${levelRules.tensesAvoid.join(', ')}
- Introduce maximum ${levelRules.newWordsPerTurn} new words per turn

YOUR CHARACTER:
- Speech style: ${character.speech.formality}, ${character.speech.pace} pace
- How you talk: ${character.speech.description}

SCENE:
${scene.setting.description}
Goal: ${scene.goal.join(', ')}

CONVERSATION SO FAR:
${transcript.map(t => `${t.who === 'learner' ? 'Learner' : 'You'}: ${t.transcript}`).join('\n')}

LEARNER JUST SAID: "${learnerLine}"

Respond as ${character.name}. Return JSON with this exact structure:
{
  "understood": "what you understood them to say in Italian (reconstruct their intent)",
  "it": "your response in Italian",
  "en": "English translation of your response",
  "correction": null or { "said": "...", "better": "...", "why": "..." },
  "words": [ { "it": "word", "en": "translation" } ],
  "steps_done": [array of step indices completed, e.g. [0, 1]],
  "hint": null or "a phrase they could say next (Italian only)",
  "confused": false or true (only if genuinely couldn't understand),
  "scene_over": false or true (if conversation naturally concludes),
  "memory_notes": [ "facts worth remembering about the learner" ]
}

Return ONLY the JSON, no other text.`;

  return prompt;
}

/**
 * Call Claude to get NPC response
 */
async function getNPCResponse(character, scene, levelRules, transcript, learnerLine) {
  const prompt = buildNPCPrompt(character, scene, levelRules, transcript, learnerLine);

  try {
    const message = await anthropic.messages.create({
      model: CONFIG.model,
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].text.trim();

    // Extract JSON from response (might be wrapped in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in NPC response');
    }

    const turnOutput = JSON.parse(jsonMatch[0]);

    if (CONFIG.verbose) {
      console.log(`  ${character.name} says: ${turnOutput.it}`);
      if (turnOutput.correction) {
        console.log(`  [Correction: "${turnOutput.correction.said}" → "${turnOutput.correction.better}"]`);
      }
    }

    return turnOutput;
  } catch (error) {
    console.error('Error getting NPC response:', error.message);
    throw error;
  }
}

// ============================================================================
// Conversation Simulator
// ============================================================================

/**
 * Run a complete conversation between simulated learner and NPC
 */
async function runConversation(persona, scene, character) {
  console.log(`\n▶ Running conversation: ${persona.id} × ${scene.sceneId}`);

  const levelRules = loadLevelRules(persona.level);
  const transcript = [];
  let stepsDone = [];

  // NPC opens the conversation
  // TODO: In production, this would call the opening generation
  // For now, using a simple greeting
  const openingLine = scene.sceneId === 'test-bar-morning'
    ? 'Buongiorno! Cosa prendi stamattina?'
    : 'Buongiorno! Cosa ti serve oggi?';

  transcript.push({
    who: 'npc',
    transcript: openingLine,
    translation: scene.sceneId === 'test-bar-morning'
      ? 'Good morning! What will you have this morning?'
      : 'Good morning! What do you need today?',
  });

  if (CONFIG.verbose) {
    console.log(`  ${character.name} says: ${openingLine}`);
  }

  let lastNPCLine = openingLine;
  let sceneOver = false;
  let turnCount = 0;

  while (!sceneOver && turnCount < CONFIG.turnsPerConversation) {
    turnCount++;

    // Learner responds
    const learnerLine = await getLearnerResponse(persona, scene, transcript, lastNPCLine);

    transcript.push({
      who: 'learner',
      transcript: learnerLine,
    });

    // NPC responds
    const npcOutput = await getNPCResponse(character, scene, levelRules, transcript, learnerLine);

    transcript.push({
      who: 'npc',
      transcript: npcOutput.it,
      understood: npcOutput.understood,
      translation: npcOutput.en,
      raw: npcOutput,
    });

    lastNPCLine = npcOutput.it;
    sceneOver = npcOutput.scene_over;

    // Track progress
    if (npcOutput.steps_done && npcOutput.steps_done.length > 0) {
      stepsDone = [...new Set([...stepsDone, ...npcOutput.steps_done])];
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`  ✓ Completed ${turnCount} turns`);

  return {
    transcript,
    stepsDone,
    completed: sceneOver,
  };
}

// ============================================================================
// Judge (Claude evaluates the conversation)
// ============================================================================

/**
 * Build judge prompt
 */
function buildJudgePrompt(persona, scene, character, levelRules, transcript) {
  // TODO: Import judge rubric from tests/judge/

  const conversationText = transcript
    .map(t => `${t.who === 'learner' ? 'Learner' : character.name}: ${t.transcript}`)
    .join('\n');

  const prompt = `You are evaluating a language learning conversation for quality and pedagogical effectiveness.

LEARNER PROFILE:
- Level: ${persona.level}
- Native language: ${persona.nativeLanguage}
- Expected mistakes: ${persona.commonMistakes.join(', ')}
- Expected transcription noise: ${persona.transcriptionNoise.join('; ')}

CHARACTER: ${character.name} (${character.role})
Speech style: ${character.speech.description}

LEVEL RULES FOR ${persona.level}:
- Max words per sentence: ${levelRules.maxWordsPerSentence}
- Max sentences per turn: ${levelRules.maxSentencesPerTurn}
- Allowed tenses: ${levelRules.tensesAllowed.join(', ')}
- Must avoid: ${levelRules.tensesAvoid.join(', ')}

SCENE GOALS:
${scene.goal.map((g, i) => `${i}. ${g}`).join('\n')}

CONVERSATION:
${conversationText}

EVALUATION CRITERIA:

1. STAYED WITHIN LEVEL (0-10)
- Did NPC use appropriate sentence length?
- Did NPC stick to allowed tenses/grammar?
- Was vocabulary appropriate for ${persona.level}?

2. FORGIVENESS & CORRECTION (0-10)
- Did NPC forgive transcription noise (not treat as mistakes)?
- Did NPC recast real mistakes naturally (in character)?
- Were corrections helpful without being preachy?

3. STAYED IN CHARACTER (0-10)
- Did NPC stay in Italian throughout?
- Did NPC maintain character personality and speech style?
- Was the conversation natural and immersive?

4. SCAFFOLDING BALANCE (0-10)
- Did NPC provide help when needed?
- Did NPC avoid over-scaffolding (too many hints)?
- Was confusion/hint usage appropriate?

5. GOAL TRACKING (0-10)
- Were scene goals completed?
- Did progress feel natural (not forced)?
- Did conversation reach a natural conclusion?

Return JSON with this structure:
{
  "overallScore": 0-10,
  "criteria": [
    {
      "criterion": "Stayed within level",
      "score": 0-10,
      "reasoning": "why this score",
      "examples": ["quote from conversation", "another quote"]
    },
    // ... one object per criterion
  ],
  "summary": "2-3 sentence overall assessment"
}

Return ONLY the JSON, no other text.`;

  return prompt;
}

/**
 * Call Claude to judge the conversation
 */
async function judgeConversation(persona, scene, character, levelRules, transcript) {
  const prompt = buildJudgePrompt(persona, scene, character, levelRules, transcript);

  console.log('  ⚖ Judging conversation...');

  try {
    const message = await anthropic.messages.create({
      model: CONFIG.model,
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent evaluation
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].text.trim();

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in judge response');
    }

    const judgment = JSON.parse(jsonMatch[0]);

    console.log(`  ✓ Overall score: ${judgment.overallScore}/10`);

    return judgment;
  } catch (error) {
    console.error('Error judging conversation:', error.message);
    throw error;
  }
}

// ============================================================================
// Test Runner Main
// ============================================================================

/**
 * Run all test combinations
 */
async function runAllTests() {
  console.log('🧪 Simulated Learner Test Runner\n');
  console.log(`Model: ${CONFIG.model}`);
  console.log(`Turns per conversation: ${CONFIG.turnsPerConversation}`);
  console.log(`Verbose: ${CONFIG.verbose}\n`);

  const personas = loadPersonas();
  const scenes = loadTestScenes();

  console.log(`Loaded ${personas.length} personas and ${scenes.length} scenes`);
  console.log(`Total conversations to run: ${personas.length * scenes.length}\n`);

  const testRuns = [];

  for (const persona of personas) {
    for (const scene of scenes) {
      try {
        const character = loadCharacter(scene.characterId);
        const levelRules = loadLevelRules(persona.level);

        // Run the conversation
        const { transcript, stepsDone, completed } = await runConversation(
          persona,
          scene,
          character
        );

        // Judge the conversation
        const judgment = await judgeConversation(
          persona,
          scene,
          character,
          levelRules,
          transcript
        );

        // Store the test run
        testRuns.push({
          persona: persona.id,
          sceneId: scene.sceneId,
          characterId: scene.characterId,
          transcript,
          stepsDone,
          sceneCompleted: completed,
          judgment,
          timestamp: new Date().toISOString(),
        });

        // Rate limiting: wait between conversations
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`\n❌ Error in ${persona.id} × ${scene.sceneId}:`, error.message);
        testRuns.push({
          persona: persona.id,
          sceneId: scene.sceneId,
          characterId: scene.characterId,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return testRuns;
}

/**
 * Generate report from test runs
 */
function generateReport(testRuns) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = resolve(CONFIG.outputDir, `simulated-learner-${timestamp}.md`);

  // Ensure reports directory exists
  mkdirSync(CONFIG.outputDir, { recursive: true });

  let report = `# Simulated Learner Test Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Model: ${CONFIG.model}\n`;
  report += `Conversations: ${testRuns.length}\n\n`;

  // Summary statistics
  const successful = testRuns.filter(r => !r.error);
  const avgScore = successful.length > 0
    ? (successful.reduce((sum, r) => sum + r.judgment.overallScore, 0) / successful.length).toFixed(1)
    : 'N/A';

  report += `## Summary\n\n`;
  report += `- Successful: ${successful.length}/${testRuns.length}\n`;
  report += `- Average score: ${avgScore}/10\n\n`;

  // Detailed results
  report += `## Results by Conversation\n\n`;

  for (const run of testRuns) {
    report += `### ${run.persona} × ${run.sceneId}\n\n`;

    if (run.error) {
      report += `❌ Error: ${run.error}\n\n`;
      continue;
    }

    report += `**Overall Score:** ${run.judgment.overallScore}/10\n\n`;

    // Criteria breakdown
    report += `**Criteria:**\n\n`;
    for (const criterion of run.judgment.criteria) {
      report += `- **${criterion.criterion}:** ${criterion.score}/10\n`;
      report += `  - ${criterion.reasoning}\n`;
      if (criterion.examples && criterion.examples.length > 0) {
        report += `  - Examples: ${criterion.examples.map(e => `"${e}"`).join(', ')}\n`;
      }
    }

    report += `\n**Summary:** ${run.judgment.summary}\n\n`;

    // Show transcript excerpt if score is low
    if (run.judgment.overallScore < 6) {
      report += `**Transcript Excerpt (first 5 turns):**\n\n`;
      const excerpt = run.transcript.slice(0, 10); // 5 exchanges = 10 turns
      for (const turn of excerpt) {
        report += `- ${turn.who === 'learner' ? 'Learner' : run.characterId}: ${turn.transcript}\n`;
      }
      report += `\n`;
    }

    report += `---\n\n`;
  }

  // Save report
  writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 Report saved to: ${reportPath}`);

  return reportPath;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  try {
    const startTime = Date.now();

    const testRuns = await runAllTests();
    const reportPath = generateReport(testRuns);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Test run complete in ${duration}s`);
    console.log(`📊 Report: ${reportPath}\n`);

    // Exit with error code if any tests failed
    const hasErrors = testRuns.some(r => r.error);
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
