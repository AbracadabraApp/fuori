// The level trial (lib/conversation/level-trial.ts): off unless both settings
// are set, only for listed learners, and the block reaches the prompt and the
// recorded version. Run for each country (COUNTRY=es-mx).
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildTurnPrompt, promptVersion } from '@/lib/prompts/build-turn-prompt';
import { readPromptFile } from '@/lib/prompts/template';
import { trialLevel } from '@/lib/conversation/level-trial';

const failures: string[] = [];
const BLOCK = 'Beginner: still you, sometimes ask';
const ME = '25d15e1d-1e28-4a8a-95c0-6e74f2c61b78';
const on = { LEVEL_TRIAL: BLOCK, LEVEL_TRIAL_LEARNERS: ` other-id, ${ME} ` };

if (trialLevel(ME, {}) !== undefined) failures.push('nothing set: should be off (today\'s prompt)');
if (trialLevel(ME, { LEVEL_TRIAL_LEARNERS: ME }) !== undefined) failures.push('no block named: should be off');
if (trialLevel(ME, { LEVEL_TRIAL: BLOCK }) !== undefined) failures.push('no learners listed: should be off for everyone');
if (trialLevel('someone-else', on) !== undefined) failures.push('a learner not listed should get today\'s prompt');
if (trialLevel(null, on) !== undefined) failures.push('no learner id (no database) should get today\'s prompt');
if (trialLevel(ME, on) !== BLOCK) failures.push('a listed learner should get the block');
let threw = false;
try { trialLevel(ME, { ...on, LEVEL_TRIAL: 'Beginner: no such block' }); } catch { threw = true; }
if (!threw) failures.push('a misspelt block name should fail loudly, not run today\'s prompt');

const city = cities[0];
const place = city.places.find((p) => characterForPlace(city, p))!;
const character = characterForPlace(city, place)!;
const plain = buildTurnPrompt({ character, transcript: [] });
const trial = buildTurnPrompt({ character, transcript: [], level: trialLevel(ME, on) });
const blockText = readPromptFile('levels.md').block(BLOCK).split('\n')[0].replace(/\{\w+\}.*/, '').trim();
if (!trial.system.includes(blockText)) failures.push('the block should be in the listed learner\'s system prompt');
if (plain.system.includes(blockText)) failures.push('the block should not be in today\'s prompt');
if (trial.version !== promptVersion(BLOCK) || promptVersion(BLOCK) !== `${promptVersion()}+${BLOCK}`) failures.push(`recorded version should be "<version>+block", got ${trial.version}`);

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: level trial off by default, on only for listed learners (${pack.id})`);
