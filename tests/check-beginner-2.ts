// Beginner 2 behind the app's hidden switch (lib/beginner-2.ts, docs/beginner-2.md):
// the switch is read from the header, the setup is picked from cluster 1 and
// replays the same for a conversation, its line comes from the country's
// prompt file, the language-only rung hides the answers' English, the turn
// code takes the switch, and Beginner 2 turns don't move the Beginner 1 path.
import { readFileSync } from 'fs';
import { beginnerVersionFrom, pickSetup, setupText, shownParts, beginner2Version, CLUSTER_1, CLUSTERS, RUNGS, clusterFrom } from '@/lib/beginner-2';
import { stageInVersion } from '@/lib/conversation-record';
import type { Part } from '@/lib/beginner';
import { buildBeginnerPrompt, SCAFFOLDING_FILE, dialogueWithoutFormat } from '@/lib/beginner';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '2' })) === 2, 'the header switches Beginner 2 on');
check(beginnerVersionFrom(new Headers()) === 1 && beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '1' })) === 1, 'no header, or 1: Beginner 1');

const a = pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' });
check(pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' }).id === a.id, 'the same conversation and turn get the same setup');
const seen = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: 'conv-1', turn: i, characterId: 'luisa' }).id));
check(seen.size === CLUSTER_1.length && [...seen].every((id) => CLUSTER_1.some((s) => s.id === id)), `over 40 turns every setup of cluster 1 comes up (got ${[...seen].join(', ')})`);
const day = new Date('2026-11-09T10:00:00Z');
check(pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id === pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id, 'an opening is seeded by learner, place and day');

for (const setup of RUNGS) check(setupText(setup).includes('This turn,') && !/\{\w+\}/.test(setupText(setup)), `${setup.block}: its line is read from scaffolding.md, filled`);
check(setupText(CLUSTER_1[0], CLUSTER_1).startsWith('Where they are now: at the very start') && setupText(CLUSTERS[2][0], CLUSTERS[2]).startsWith('Where they are now: they know a little') && setupText(CLUSTERS[5][0], CLUSTERS[5]).startsWith('Where they are now: finding their feet'), 'each cluster gets its level text (S1, S2, S3) before the setup');
check(!/Every turn has some English|When you first see them|explain something in English when it helps/.test(readFileSync(`content/${process.env.COUNTRY ?? 'it'}/prompts/scaffolding.md`, 'utf8')), 'the English lines added one per play are gone from the prompt');
check(CLUSTERS.length === 6 && CLUSTERS[0].length === 2 && CLUSTERS.slice(1).every((c) => c.length === 3), 'six clusters: the first of two rungs, the rest of three');
check(CLUSTER_1.every((s) => s.english && !s.inside), 'cluster 1 always shows English under the answers');
check(CLUSTERS.every((c, i) => i < 2 || c[0] === CLUSTERS[i - 1][1]), 'from cluster 2, each drops the lowest rung and adds the next');
check(clusterFrom(new Headers({ 'x-fuori-cluster': '4' })) === CLUSTERS[3] && clusterFrom(new Headers()) === CLUSTER_1 && clusterFrom(new Headers({ 'x-fuori-cluster': '9' })) === CLUSTER_1, 'the cluster header picks clusters 1-6, cluster 1 otherwise');
const seen6 = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: 'c', turn: i, characterId: 'x' }, CLUSTERS[5]).id));
check(seen6.size === 3 && seen6.has('free'), `cluster 6 plays its own three rungs (got ${[...seen6].join(', ')})`);

const parts: Part[] = [{ kind: 'question', text: 'Un caffè?', en: 'A coffee?', gloss: '' }, { kind: 'answer', text: 'Sì, grazie.', en: 'Yes, thanks.', gloss: '' }];
check(shownParts(parts, RUNGS.find((r) => r.id === 'one')!)[1].en === '', 'the language-only rung hides the answers\' English');
check(shownParts(parts, RUNGS.find((r) => r.id === 'one-en')!)[1].en === 'Yes, thanks.', 'the English rungs keep it');
check(shownParts(parts, RUNGS.find((r) => r.id === 'one')!)[0].en === 'A coffee?', 'her own parts are untouched');

const bare: Part[] = [{ kind: 'word', text: 'Qué bueno.', en: 'Great.', gloss: '' }, { kind: 'question', text: '¿Cuál le gusta más?', en: 'Which do you like best?', gloss: '' }, { kind: 'answer', text: 'Me gusta el de allá.', en: 'I like that one.', gloss: '' }];
const fixed = shownParts(bare, CLUSTER_1[0]);
check(fixed.find((x) => x.kind === 'question')!.gloss === 'Which do you like best?', 'a turn with no English gets its question\'s English as a gloss (Hugo, 2026-11-09)');
const glossed: Part[] = [{ kind: 'question', text: '¿Le gustan?', en: 'Do you like them?', gloss: 'like them?' }];
check(shownParts(glossed, CLUSTER_1[0])[0].gloss === 'like them?', 'a turn that already has English is left alone');
const inside = shownParts(parts, RUNGS.find((r) => r.id === 'inside-en')!);
check(!inside.some((x) => x.kind === 'answer') && inside.some((x) => x.kind === 'word' && x.text === 'Sì, grazie.' && x.gloss === 'Yes, thanks.'), 'rung 4: the answer is in her speech with its English heard, no bubble');
check(shownParts(parts, RUNGS.find((r) => r.id === 'inside')!).some((x) => x.kind === 'word' && x.text === 'Sì, grazie.' && !x.gloss), 'rung 6: the answer in her speech, no English');
check(inside.some((x) => x.kind === 'english' && x.text.length > 0), 'the lead line before the answer comes from scaffolding.md');
const v = beginner2Version(CLUSTERS[2]);
check(v.endsWith('+C3'), `the version names the cluster (${v})`);
check(v.startsWith('beginner-2-') && !stageInVersion(v), `Beginner 2 turns carry no stage tag, so the Beginner 1 path doesn't count them (${v})`);

const route = readFileSync('app/v1/turn/route.ts', 'utf8');
const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/beginnerVersion: beginnerVersionFrom\(request\.headers\)/.test(route) && /beginnerCluster: clusterFrom\(request\.headers\)/.test(route), 'the route passes the switch and the cluster to the turn');
check(/p\.beginnerVersion === 2/.test(take) && /promptFile: BEGINNER_2_FILE/.test(take), 'the turn plays the scaffolding only when the switch is on');
check(/: beginner && onPath\n\s+\? await runBeginnerTurn\(\{ character, transcript, learnerSaid, memory, addressedAs, laps: p\.laps, onText: p\.onText, canRetry: p\.canRetry, stageText: stageText\(onPath\.stage/.test(take), 'Beginner 1\'s turn is unchanged');

// The split (Josh, 2026-11-09): the dialogue is the Intermediate prompt itself, then the scaffolding
{
  const city = cities.find((c) => c.places.some((p) => p.characterId))!;
  const ch = characterForPlace(city, city.places.find((p) => p.characterId)!)!;
  const b2 = buildBeginnerPrompt({ character: ch, transcript: [], promptFile: SCAFFOLDING_FILE, stageText: setupText(CLUSTER_1[0]) }).system;
  const inter = dialogueWithoutFormat(buildTurnPrompt({ character: ch, transcript: [] }).system);
  check(b2.startsWith(inter), 'Beginner 2 starts with the Intermediate prompt exactly (character.md, dialogue.md, the here line)');
  check(!/Respond with JSON:\s*\{\s*"line"/.test(b2) && /Reply with JSON: parts/.test(b2), 'the one-line reply format is replaced by the parts format');
  check(!/\{\w+\}/.test(b2), 'no placeholder left unfilled');
}

if (problems.length) {
  console.error(`check-beginner-2: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-beginner-2: ok');
