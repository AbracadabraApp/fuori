// Josh, 2026-11-15: "we arent ready for downlevelling yet". The record writer (lib/conversation-record.ts) moved an
// Intermediate back to Beginner after two hard visits in a row; with the level up the learner's choice, that undid a
// chosen Intermediate and the next visits offered it again. Keeps the writer from ever setting a learner to Beginner.
import { readFileSync } from 'fs';
const src = readFileSync('lib/conversation-record.ts', 'utf8');
const ok = !/setLevel\([^)]*'beginner'\)/.test(src) && /moved: false, state: \{ \.\.\.before, hardRun \}/.test(src);
if (!ok) { console.error('check-no-downlevel: the record writer can move a learner back to Beginner again'); process.exit(1); }
console.log('OK: no level is ever moved down by a conversation record');
