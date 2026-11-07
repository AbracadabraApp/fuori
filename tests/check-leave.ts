// Every way out of a conversation must save it (Josh, 2026-10-14): leaving
// sends /api/conversation/end, which is when the character writes their notes
// and the learning notes are saved. Boarding at the station is a second exit;
// if it only navigated, the clerk would forget you and nobody would notice.
// Also checks the station's departure details (platform and time).
import { readFileSync } from 'fs';
import { leaveConversation, sendConversationEnd } from '@/lib/conversation/leave';
import { clerkSetting, departureFor, tripFacts } from '@/lib/travel/departure';
import { cities } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';

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
check(screen.includes('onBoard={() => leave(ticket.onBoard)}'), 'the ticket\'s board button must go through leave(ticket.onBoard)');
check(!/onClick=\{onBack\}|onClick=\{ticket\.onBoard\}/.test(screen), 'an exit calls onBack/onBoard directly, skipping the save');

// Departures: same route, same platform and seat; no time on the ticket (Josh, 2026-10-14)
const a = departureFor('roma-nuova', 'firenze');
const b = departureFor('roma-nuova', 'firenze');
check(a.platform === b.platform && a.seat === b.seat, 'platform and seat are fixed per route');
check(a.platform >= 1 && a.platform <= 12 && a.seat >= 11 && a.seat <= 88, `platform 1–12, seat 11–88 (got ${a.platform}, ${a.seat})`);
check(!('time' in a), 'no departure time: it could contradict the ticket seller');
// The seller is told the trip as something already said, so they don't open by asking
// where you're going (they did with "is buying a ticket to", 2026-10-14)
const said = clerkSetting('Stazione Termini, Esquilino', 'Firenze', a.platform);
check(said.includes('Firenze') && said.includes(`platform ${a.platform}`), `seller knows destination and platform: ${said}`);
check(/just said: "A ticket to Firenze/.test(said), 'the destination is the person\'s own words, already said (sellers asked again otherwise)');
check(!clerkSetting('At the station.', 'Firenze', 3).includes('..'), 'no doubled full stop after a setting that ends with one');
// The seller knows the trip (content/<country>/stations.json): what the destination
// is known for and how long it takes, for every pair of shown cities, either way round
const shown = cities.filter((c) => !c.hidden);
for (const from of shown) for (const to of shown) if (from.id !== to.id) {
  const f = tripFacts(from.id, to.id, to.name);
  if (!f.includes('known for') || !f.includes('takes')) { problems.push(`no trip facts for ${from.id} → ${to.id}: "${f}"`); break; }
}
const station = shown.flatMap((c) => c.places.filter((p) => !p.hidden && p.characterId && /station|terminal/.test(p.kind)).map((p) => ({ c, p })))[0];
const other = shown.find((c) => c.id !== station?.c.id);
const seller = station && other ? characterForVisit(station.c.id, station.p.id, other.id) : undefined;
check(!!seller?.appearance?.setting?.includes('takes'), `the seller's setting carries the trip facts: ${seller?.appearance?.setting}`);
// The seller's setting is built from ids (page and server alike) in for-visit.ts; the page passes the trip
check(readFileSync('lib/characters/for-visit.ts', 'utf8').includes('clerkSetting('), 'the seller\'s setting is built with clerkSetting (lib/characters/for-visit.ts)');
check(readFileSync('app/page.tsx', 'utf8').includes('characterForVisit(selectedCity, selectedPlace, trip?.to)'), 'the station screen passes the trip to characterForVisit');
const ticket = readFileSync('app/components/Ticket.tsx', 'utf8');
check(ticket.includes('onClick={onBoard}'), 'the ticket\'s board button calls onBoard');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: back link and Sali both save the conversation (silence, end beacon, then leave); ticket platform and seat are consistent');
