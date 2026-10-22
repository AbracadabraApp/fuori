// Reply buttons for beginners (lib/scaffold.ts): at Beginner or no level yet, never with
// Magda, for the first N turns of a conversation, N shrinking to none
import { offerReplies, tapTurns, TAP_SCHEDULE } from '@/lib/scaffold';

const failures: string[] = [];
const base = { level: 'beginner' as const, conversationsBefore: 0, learnerTurns: 0, isTutor: false };

if (!offerReplies(base)) failures.push('a new beginner should tap their first turn');
if (offerReplies({ ...base, level: 'intermediate' })) failures.push('intermediate: no buttons');
if (offerReplies({ ...base, level: 'advanced' })) failures.push('advanced: no buttons');
if (!offerReplies({ ...base, level: null })) failures.push('no level yet (not onboarded): a new learner, so buttons');
if (offerReplies({ ...base, level: null, conversationsBefore: TAP_SCHEDULE.length })) failures.push('no level, after the schedule: no taps');
if (offerReplies({ ...base, isTutor: true })) failures.push('Magda: no buttons');
if (!offerReplies({ ...base, learnerTurns: 3 })) failures.push('first conversation: the 4th turn is still a tap');
if (offerReplies({ ...base, learnerTurns: 4 })) failures.push('first conversation: the 5th turn is spoken');
if (tapTurns(3) !== 3 || tapTurns(6) !== 2 || tapTurns(9) !== 1) failures.push(`schedule should be 4,4,4,3,3,3,2,2,2,1,1,1, got ${TAP_SCHEDULE}`);
if (offerReplies({ ...base, conversationsBefore: TAP_SCHEDULE.length })) failures.push('after the schedule: no more taps');
if (offerReplies({ ...base, conversationsBefore: 1000 })) failures.push('long after: no taps');
for (let i = 1; i < TAP_SCHEDULE.length; i++) if (TAP_SCHEDULE[i] > TAP_SCHEDULE[i - 1]) failures.push('taps should never grow');

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('OK: reply buttons for beginners, first turns of each conversation, running out');
