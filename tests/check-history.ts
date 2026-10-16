// How the conversation so far reaches Claude (lib/prompts/build-turn-prompt.ts):
// valid back-and-forth messages that keep the learner's earlier lines (their
// name) when old turns drop. The old `document` mode was removed 2026-10-16
// (Josh): prompt 2026-10-12h had taken the conversation out of it, so it sent
// only the last line, and this test's document check failed from then on.
import { buildTurnPrompt, RECENT_TURNS } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content';
import type { Turn } from '@/lib/types';

const failures: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) failures.push(msg); };

const roma = cities.find((c) => c.id === 'roma')!;
const character = roma.places.map((p) => characterForPlace(roma, p)).find(Boolean)!;

const lines: Turn[] = [{ who: 'npc', transcript: 'Buongiorno! Cosa ti preparo?', translation: 'Good morning!' }];
for (let i = 1; i <= 8; i++) {
  lines.push({ who: 'learner', transcript: i === 1 ? 'Mi chiamo Josh' : `riga ${i}` });
  lines.push({ who: 'npc', transcript: `risposta ${i}`, translation: `reply ${i}` });
}

// First turn: the opening situation only
const first = buildTurnPrompt({ character, transcript: [] });
check(first.messages.length === 1 && first.messages[0].content === 'Someone has just walked up to you.', 'first turn: the opening situation only');

// Recent: alternating, starts and ends with the user, only the last few turns
const rec = buildTurnPrompt({ character, transcript: lines, learnerSaid: 'ultima' });
const roles = rec.messages.map((m) => m.role);
check(roles[0] === 'user' && roles[roles.length - 1] === 'user', 'the conversation should start and end with a user message');
check(roles.every((r, i) => i === 0 || r !== roles[i - 1]), 'the conversation should alternate user and assistant');
check(rec.messages.length <= RECENT_TURNS + 1, `the conversation should keep at most ${RECENT_TURNS} turns plus the new line (got ${rec.messages.length})`);
check(rec.messages[rec.messages.length - 1].content === 'ultima', 'the conversation should end with what they just said');
check(rec.messages[0].content.includes('Earlier in this conversation they said') && rec.messages[0].content.includes('"Mi chiamo Josh"'), 'the conversation should keep the learner\'s earlier lines (their name)');
check(!rec.messages.some((m) => m.content.includes('risposta 1"')), 'the conversation should drop the character\'s old lines');
const assistant = rec.messages.find((m) => m.role === 'assistant');
check(!!assistant && JSON.parse(assistant.content).line.startsWith('risposta'), 'character lines go as the same JSON it answers in');

// Short conversation: nothing dropped, no "earlier" line
const short = buildTurnPrompt({ character, transcript: lines.slice(0, 3), learnerSaid: 'ciao' });
check(!short.messages[0].content.includes('Earlier'), 'nothing dropped, so no "earlier" line');
check(short.messages[0].content === 'Someone has just walked up to you.', 'short conversation keeps the opening situation');

// Two character lines in a row merge instead of breaking the alternation
const doubled: Turn[] = [...lines.slice(0, 3), { who: 'npc', transcript: 'di nuovo', translation: 'again' }];
const merged = buildTurnPrompt({ character, transcript: doubled, learnerSaid: 'ok' }).messages.map((m) => m.role);
check(merged.every((r, i) => i === 0 || r !== merged[i - 1]), 'two lines from the same side should merge into one message');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`OK: the conversation goes as alternating messages, keeping the last ${RECENT_TURNS} turns and the learner's earlier lines`);
