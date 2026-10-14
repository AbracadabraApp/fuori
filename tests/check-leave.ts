// Every way out of a conversation must save it (Josh, 2026-10-14): leaving
// sends /api/conversation/end, which is when the character writes their notes
// and the learning notes are saved. Boarding at the station is a second exit;
// if it only navigated, the clerk would forget you and nobody would notice.
// Also checks the station's departure details (platform and time).
import { readFileSync } from 'fs';
import { leaveConversation, sendConversationEnd } from '@/lib/conversation/leave';
import { departureFor } from '@/lib/travel/departure';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

// The save message: right address, right conversation
const sent: { url: string; body: string }[] = [];
const beacon = (url: string, body: string) => { sent.push({ url, body }); return true; };
sendConversationEnd('conv-1', beacon);
check(sent[0]?.url === '/api/conversation/end', 'end beacon goes to /api/conversation/end');
check(JSON.parse(sent[0]?.body ?? '{}').conversationId === 'conv-1', 'end beacon carries the conversation id');
check(sendConversationEnd(null, beacon) === false && sent.length === 1, 'no beacon before the conversation has an id');

// Leaving: silence, save, then go; a silence that throws still saves and leaves
for (const failingSilence of [false, true]) {
  sent.length = 0;
  const steps: string[] = [];
  leaveConversation({
    silence: () => { steps.push('silence'); if (failingSilence) throw new Error('mic stuck'); },
    conversationId: 'conv-2',
    beacon: (u, b) => { steps.push('save'); return beacon(u, b); },
    then: () => steps.push('go'),
  });
  check(steps.join(',') === 'silence,save,go', `leave order${failingSilence ? ' (silence throws)' : ''}: got ${steps.join(',')}`);
}

// Both exits in the conversation screen go through leave(): the back link and Sali
const screen = readFileSync('app/components/ConversationScreen.tsx', 'utf8');
check(screen.includes('onClick={() => leave(onBack)}'), 'back link must call leave(onBack)');
check(screen.includes('onClick={() => leave(ticket.onBoard)}'), 'board button must call leave(ticket.onBoard)');
check(!/onClick=\{onBack\}|onClick=\{ticket\.onBoard\}/.test(screen), 'an exit calls onBack/onBoard directly, skipping the save');

// Departures: same route, same platform; next departure 8–38 minutes away
const at = new Date(2026, 9, 14, 14, 3);
const a = departureFor('roma', 'firenze', at);
const b = departureFor('roma', 'firenze', new Date(2026, 9, 14, 18, 40));
check(a.platform === b.platform && a.platform >= 1 && a.platform <= 12, 'platform is fixed per route, 1–12');
const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const wait = mins(a.time) - (14 * 60 + 3);
check(/^\d\d:\d\d$/.test(a.time) && wait >= 8 && wait < 38, `next departure 8–38 min away (got ${a.time})`);
check(departureFor('roma', 'firenze', new Date(2026, 9, 14, 23, 58)).time.startsWith('00:'), 'late at night the next departure wraps past midnight');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: back link and Sali both save the conversation (silence, end beacon, then leave); departures are consistent');
