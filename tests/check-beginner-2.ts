// Beginner 2 behind the app's hidden switch (lib/beginner-2.ts, docs/beginner-2.md):
// the switch is read from the header, the setup is picked from cluster 1 and
// replays the same for a conversation, its line comes from the country's
// prompt file, the language-only rung hides the answers' English, the turn
// code takes the switch, and Beginner 2 turns don't move the Beginner 1 path.
import { readFileSync } from 'fs';
import { beginnerVersionFrom, pickSetup, setupText, shownParts, beginner2Version, CLUSTER_1 } from '@/lib/beginner-2';
import { stageInVersion } from '@/lib/conversation-record';
import type { Part } from '@/lib/beginner';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '2' })) === 2, 'the header switches Beginner 2 on');
check(beginnerVersionFrom(new Headers()) === 1 && beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '1' })) === 1, 'no header, or 1: Beginner 1');

const a = pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' });
check(pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' }).id === a.id, 'the same conversation and turn get the same setup');
const seen = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: 'conv-1', turn: i, characterId: 'luisa' }).id));
check(seen.size === CLUSTER_1.length, `over 40 turns every setup of cluster 1 comes up (got ${[...seen].join(', ')})`);
const day = new Date('2026-11-09T10:00:00Z');
check(pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id === pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id, 'an opening is seeded by learner, place and day');

for (const setup of CLUSTER_1) check(setupText(setup).startsWith('This turn,'), `${setup.block}: its line is read from beginner-2.md`);

const parts: Part[] = [{ kind: 'question', text: 'Un caffè?', en: 'A coffee?', gloss: '' }, { kind: 'answer', text: 'Sì, grazie.', en: 'Yes, thanks.', gloss: '' }];
check(shownParts(parts, CLUSTER_1.find((s) => !s.english)!)[1].en === '', 'the language-only rung hides the answers\' English');
check(shownParts(parts, CLUSTER_1.find((s) => s.english)!)[1].en === 'Yes, thanks.', 'the English rungs keep it');
check(shownParts(parts, CLUSTER_1.find((s) => !s.english)!)[0].en === 'A coffee?', 'her own parts are untouched');

const v = beginner2Version(CLUSTER_1[0]);
check(v.startsWith('beginner-2-') && !stageInVersion(v), `Beginner 2 turns carry no stage tag, so the Beginner 1 path doesn't count them (${v})`);

const route = readFileSync('app/v1/turn/route.ts', 'utf8');
const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/beginnerVersion: beginnerVersionFrom\(request\.headers\)/.test(route), 'the route passes the switch to the turn');
check(/p\.beginnerVersion === 2/.test(take) && /promptFile: BEGINNER_2_FILE/.test(take), 'the turn plays beginner-2.md only when the switch is on');
check(/: beginner && onPath\n\s+\? await runBeginnerTurn\(\{ character, transcript, learnerSaid, memory, addressedAs, laps: p\.laps, onText: p\.onText, canRetry: p\.canRetry, stageText: stageText\(onPath\.stage/.test(take), 'Beginner 1\'s turn is unchanged');

if (problems.length) {
  console.error(`check-beginner-2: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-beginner-2: ok');
