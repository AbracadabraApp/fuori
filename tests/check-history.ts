// How the conversation so far reaches Claude (lib/prompts/build-turn-prompt.ts).
// `document` must stay exactly as before; `recent` must send valid back-and-forth
// messages that keep the learner's earlier lines (their name) when old turns drop.
import { buildTurnPrompt, RECENT_TURNS } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content/it/cities';
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

// Default: one user message with the whole conversation, as before
const doc = buildTurnPrompt({ character, transcript: lines, learnerSaid: 'ultima', history: 'document' });
check(doc.messages.length === 1 && doc.messages[0].content === doc.user, 'document mode should send one user message');
check(doc.user.includes('Them: Mi chiamo Josh') && doc.user.includes('They just said: "ultima"'), 'document mode should carry the whole conversation');

// First turn is the same in both modes
const first = buildTurnPrompt({ character, transcript: [], history: 'recent' });
check(first.messages.length === 1 && first.messages[0].content === 'Someone has just walked up to you.', 'recent mode, first turn: the opening situation only');

// Recent: alternating, starts and ends with the user, only the last few turns
const rec = buildTurnPrompt({ character, transcript: lines, learnerSaid: 'ultima', history: 'recent' });
const roles = rec.messages.map((m) => m.role);
check(roles[0] === 'user' && roles[roles.length - 1] === 'user', 'recent mode should start and end with a user message');
check(roles.every((r, i) => i === 0 || r !== roles[i - 1]), 'recent mode should alternate user and assistant');
check(rec.messages.length <= RECENT_TURNS + 1, `recent mode should keep at most ${RECENT_TURNS} turns plus the new line (got ${rec.messages.length})`);
check(rec.messages[rec.messages.length - 1].content === 'ultima', 'recent mode should end with what they just said');
check(rec.messages[0].content.includes('Earlier in this conversation they said') && rec.messages[0].content.includes('"Mi chiamo Josh"'), 'recent mode should keep the learner\'s earlier lines (their name)');
check(!rec.messages.some((m) => m.content.includes('risposta 1"')), 'recent mode should drop the character\'s old lines');
const assistant = rec.messages.find((m) => m.role === 'assistant');
check(!!assistant && JSON.parse(assistant.content).it.startsWith('risposta'), 'character lines go as the same JSON it answers in');

// Short conversation: nothing dropped, no "earlier" line
const short = buildTurnPrompt({ character, transcript: lines.slice(0, 3), learnerSaid: 'ciao', history: 'recent' });
check(!short.messages[0].content.includes('Earlier'), 'nothing dropped, so no "earlier" line');
check(short.messages[0].content === 'Someone has just walked up to you.', 'short conversation keeps the opening situation');

// Two character lines in a row merge instead of breaking the alternation
const doubled: Turn[] = [...lines.slice(0, 3), { who: 'npc', transcript: 'di nuovo', translation: 'again' }];
const merged = buildTurnPrompt({ character, transcript: doubled, learnerSaid: 'ok', history: 'recent' }).messages.map((m) => m.role);
check(merged.every((r, i) => i === 0 || r !== merged[i - 1]), 'two lines from the same side should merge into one message');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`OK: document mode unchanged; recent mode alternates, keeps the last ${RECENT_TURNS} turns and the learner's earlier lines`);
