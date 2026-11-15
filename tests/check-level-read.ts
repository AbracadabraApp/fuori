// Josh, 2026-11-15: a failed read of the learner's level must show an error the app can retry, not fall through to
// the Intermediate prompt (a Beginner silently played at the wrong level; found by the state-machine review).
import { readFileSync } from 'fs';
const src = readFileSync('lib/conversation/take-turn.ts', 'utf8');
const caught = /onSoftError\('learner level'/.test(src);
const read = /learnerLevel = \(await onboardingState\(learnerId\)\)\.level;/.test(src);
if (caught || !read) { console.error('check-level-read: a failed level read is caught again (it would play the wrong level)'); process.exit(1); }
console.log('OK: a failed level read fails the turn (retryable), never plays the wrong level');
