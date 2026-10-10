// Example usage of the report generator
// Run this to see a sample report: npx tsx tests/report/example-usage.ts

import { reportGenerator, TestRun } from './generate-report';

// Sample test data
const sampleResults: TestRun[] = [
  {
    id: 'test-1',
    timestamp: new Date(),
    personaId: 'a1-english-speaker',
    personaName: 'A1 English Speaker',
    characterId: 'giulia',
    characterName: 'Giulia',
    sceneId: 'roma-bar-day1',
    sceneName: 'Roma Bar - Day 1',
    transcript: [
      { who: 'npc', text: 'Buongiorno! Cosa vuoi?' },
      { who: 'learner', text: 'bone journal' },
      { who: 'npc', text: 'Buongiorno! Allora, cosa prendi?' },
      { who: 'learner', text: 'vorrei un cappuccino' },
      { who: 'npc', text: 'Un cappuccino, certo! Subito.' },
    ],
    scores: {
      stayedWithinLevel: {
        pass: true,
        value: 9,
        evidence: 'All responses used A1-A2 vocabulary and simple present tense.',
      },
      recastMistakes: {
        pass: true,
        value: 10,
        evidence: 'Correctly reconstructed "bone journal" as "buongiorno" without explicit correction.',
        snippet: 'Learner: "bone journal"\nGiulia: "Buongiorno! Allora, cosa prendi?"',
      },
      stayedInItalian: {
        pass: true,
        value: 10,
        evidence: 'Character never switched to English.',
      },
      maintainedFormality: {
        pass: true,
        value: 10,
        evidence: 'Used "tu" (vuoi, prendi) as specified in character sheet.',
      },
      goalsTrackedCorrectly: {
        pass: true,
        value: 10,
        evidence: 'Goal step (ordering item) correctly marked done after learner ordered.',
      },
      confusedUsedSparingly: {
        pass: true,
        value: 10,
        evidence: 'No confused flag used - conversation flowed naturally.',
      },
      hintsUsedSparingly: {
        pass: true,
        value: 10,
        evidence: 'No hints needed - learner succeeded without scaffolding.',
      },
      stayedInCharacter: {
        pass: true,
        value: 9,
        evidence: 'Giulia maintained quick, friendly pace. Used "Allora" as typical.',
      },
    },
  },
  {
    id: 'test-2',
    timestamp: new Date(),
    personaId: 'a1-english-speaker',
    personaName: 'A1 English Speaker',
    characterId: 'rita',
    characterName: 'Rita',
    sceneId: 'napoli-market',
    sceneName: 'Napoli Market',
    transcript: [
      { who: 'npc', text: 'Buongiorno! You need help?' },
      { who: 'learner', text: 'quanto costa' },
      { who: 'npc', text: 'The tomatoes are two euro per kilo. Very fresh!' },
    ],
    scores: {
      stayedWithinLevel: {
        pass: false,
        value: 5,
        evidence: 'Sentence complexity appropriate but switched to English.',
      },
      recastMistakes: {
        pass: true,
        value: 8,
        evidence: 'No mistakes to recast in this brief exchange.',
      },
      stayedInItalian: {
        pass: false,
        value: 2,
        evidence: 'Character switched to English unprompted. Should have stayed in Italian.',
        snippet: 'Rita: "You need help?"\nRita: "The tomatoes are two euro per kilo. Very fresh!"',
      },
      maintainedFormality: {
        pass: true,
        value: 10,
        evidence: 'Brief exchange, but no formality errors.',
      },
      goalsTrackedCorrectly: {
        pass: true,
        value: 10,
        evidence: 'Price inquiry goal tracked correctly.',
      },
      confusedUsedSparingly: {
        pass: true,
        value: 10,
        evidence: 'No confused flag used.',
      },
      hintsUsedSparingly: {
        pass: true,
        value: 10,
        evidence: 'No hints given.',
      },
      stayedInCharacter: {
        pass: false,
        value: 4,
        evidence: 'Rita should speak slowly and patiently in Italian, not switch to English.',
      },
    },
  },
  {
    id: 'test-3',
    timestamp: new Date(),
    personaId: 'a2-spanish-speaker',
    personaName: 'A2 Spanish Speaker',
    characterId: 'giulia',
    characterName: 'Giulia',
    sceneId: 'roma-bar-day2',
    sceneName: 'Roma Bar - Day 2',
    transcript: [
      { who: 'npc', text: 'Ciao! Bentornato!' },
      { who: 'learner', text: 'ciao giulia come stai' },
      { who: 'npc', text: 'Bene grazie! E tu?' },
      { who: 'learner', text: 'bene anche io vorrei un cornetto' },
      { who: 'npc', text: 'Un cornetto, certo! Al cioccolato?' },
    ],
    scores: {
      stayedWithinLevel: {
        pass: true,
        value: 9,
        evidence: 'Appropriate level, good conversational flow.',
      },
      recastMistakes: {
        pass: true,
        value: 10,
        evidence: 'No errors to correct - learner spoke well.',
      },
      stayedInItalian: {
        pass: true,
        value: 10,
        evidence: 'Entire conversation in Italian.',
      },
      maintainedFormality: {
        pass: true,
        value: 10,
        evidence: 'Correctly used "tu" throughout.',
      },
      goalsTrackedCorrectly: {
        pass: true,
        value: 10,
        evidence: 'Ordering goal tracked correctly.',
      },
      confusedUsedSparingly: {
        pass: true,
        value: 10,
        evidence: 'No confusion - smooth exchange.',
      },
      hintsUsedSparingly: {
        pass: true,
        value: 10,
        evidence: 'No hints needed.',
      },
      stayedInCharacter: {
        pass: true,
        value: 10,
        evidence: 'Giulia maintained friendly, quick personality. Remembered learner with "Bentornato!"',
      },
    },
  },
];

// Generate and print report
async function main() {
  console.log('Generating sample test report...\n');

  // Generate markdown
  const markdown = reportGenerator.generate(sampleResults);
  console.log(markdown);

  // Save to file
  const filepath = await reportGenerator.save(sampleResults);
  console.log(`\n\nReport saved to: ${filepath}`);
}

main().catch(console.error);
