// Josh, 2026-11-15: "ok" to "onboarding sets your starting step, and the level up takes you on from there". The
// speaker path stored startStep 3 for a Beginner who answered in their own words, but the new Beginner reads only
// learners.step, so they played step 1. finishOnboarding now writes the step (and starts the level-up count over).
import { readFileSync } from 'fs';
import { startingStep } from '@/lib/onboarding';
const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
check(startingStep('beginner', { startStep: 3 }) === 3, 'a speaker placed at step 3 starts at step 3');
check(startingStep('beginner', {}) === 1 && startingStep('beginner', { startStep: 9 }) === 1 && startingStep('beginner', { startStep: 'x' }) === 1, 'otherwise, or out of range, step 1');
check(startingStep('intermediate', { startStep: 3 }) === null && startingStep('advanced', {}) === null, 'above Beginner, no step is set');
const src = readFileSync('lib/onboarding.ts', 'utf8');
check(/UPDATE learners SET step = \$2, step_since = now\(\), level_up_asked_at = NULL/.test(src) && src.includes('startingStep(level, record)'), 'finishing onboarding writes the step and starts the count over');
if (problems.length) { console.error(`check-starting-step: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log('OK: onboarding sets the starting step (3 for a speaker judged Beginner, 1 otherwise)');
