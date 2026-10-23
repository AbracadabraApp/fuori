// Scaffolding stages (lib/scaffold.ts): new learners (Beginner or no level
// yet), never with Magda; each of the first 3 conversations steps through
// read, choose, one turn each, then the mic alone (Josh, 2026-10-22: tap-only went)
import { scaffoldStage, STAGES, SCAFFOLD_CONVERSATIONS } from '@/lib/scaffold';

const failures: string[] = [];
const base = { level: 'beginner' as const, conversationsBefore: 0, learnerTurns: 0, isTutor: false };
const expect = (what: string, got: unknown, want: unknown) => { if (got !== want) failures.push(`${what}: expected ${want}, got ${got}`); };

expect('first turn', scaffoldStage(base), 'read');
expect('second turn', scaffoldStage({ ...base, learnerTurns: 1 }), 'choose');
expect('third turn: the mic', scaffoldStage({ ...base, learnerTurns: 2 }), null);
expect('later turns: the mic', scaffoldStage({ ...base, learnerTurns: 20 }), null);
expect('no level yet counts as new', scaffoldStage({ ...base, level: null }), 'read');
expect('intermediate', scaffoldStage({ ...base, level: 'intermediate' }), null);
expect('advanced', scaffoldStage({ ...base, level: 'advanced' }), null);
expect('Magda', scaffoldStage({ ...base, isTutor: true }), null);
expect('third conversation repeats', scaffoldStage({ ...base, conversationsBefore: 2, learnerTurns: 1 }), 'choose');
expect('fourth conversation: the mic', scaffoldStage({ ...base, conversationsBefore: SCAFFOLD_CONVERSATIONS }), null);
expect('no level, fourth conversation: the mic', scaffoldStage({ ...base, level: null, conversationsBefore: 3 }), null);
expect('two stages, in order', STAGES.join(','), 'read,choose');
expect('three conversations', SCAFFOLD_CONVERSATIONS, 3);

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('OK: read, choose in each of the first 3 conversations, then the mic');
