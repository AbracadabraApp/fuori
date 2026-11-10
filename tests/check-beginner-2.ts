// Beginner 2 behind the app's hidden switch (lib/beginner-2.ts, docs/beginner-2.md):
// the switch is read from the header, the setup is picked from cluster 1 and
// replays the same for a conversation, its line comes from the country's
// prompt file, the language-only rung hides the answers' English, the turn
// code takes the switch, and Beginner 2 turns don't move the Beginner 1 path.
import { readFileSync } from 'fs';
import { beginnerVersionFrom, pickSetup, setupText, levelText, setupLine, fullerGlosses, shownParts, beginner2Version, glossAll, questionEcho, GOODBYE, CLUSTER_1, CLUSTERS, RUNGS, clusterFrom } from '@/lib/beginner-2';
import { stageInVersion } from '@/lib/conversation-record';
import { lineFromParts, type Part } from '@/lib/beginner';
import { buildBeginnerPrompt, SCAFFOLDING_FILE, dialogueWithoutFormat } from '@/lib/beginner';
import { exchangeTurns } from '@/lib/recording';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '2' })) === 2, 'the header switches Beginner 2 on');
check(beginnerVersionFrom(new Headers()) === 1 && beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '1' })) === 1, 'no header, or 1: Beginner 1');

const a = pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' });
check(pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' }).id === a.id, 'the same conversation and turn get the same setup');
const seen = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: `conv-${i}`, turn: i % 8, characterId: 'luisa' }).id));
check(seen.size === CLUSTER_1.length && [...seen].every((id) => CLUSTER_1.some((s) => s.id === id)), `over 40 turns every setup of cluster 1 comes up (got ${[...seen].join(', ')})`);
const day = new Date('2026-11-09T10:00:00Z');
check(pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id === pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id, 'an opening is seeded by learner, place and day');

for (const setup of RUNGS) check(setupText(setup).includes('This turn,') && !/\{\w+\}/.test(setupText(setup)), `${setup.block}: its line is read from scaffolding.md, filled`);
check(setupText(CLUSTER_1[0], CLUSTER_1).startsWith("They're at the very start") && setupText(CLUSTERS[2][0], CLUSTERS[2]).startsWith('Where they are now: they know a little') && setupText(CLUSTERS[5][0], CLUSTERS[5]).startsWith('Where they are now: finding their feet'), 'each cluster gets its level text (S1, S2, S3) before the setup');
check(!/Every turn has some English|When you first see them|explain something in English when it helps/.test(readFileSync(`content/${process.env.COUNTRY ?? 'it'}/prompts/scaffolding.md`, 'utf8')), 'the English lines added one per play are gone from the prompt');
check(CLUSTERS.length === 6, 'six clusters');
check(CLUSTERS.flat().filter((r) => !r.inside).every((r) => r.maxAnswers === 0 || (r.maxAnswers === 2 && r.english)), 'bubbles are two, always with English (Josh: reading Spanish you don\'t understand is coercive; one answer feels weird)');
check(['two-en', 'ask-en', 'invite-en'].every((id) => CLUSTER_1.some((r) => r.id === id)), 'cluster 1 mixes two answers, two questions to ask and an invited English answer (Josh: no cluster 1 surrender)');
check(!CLUSTERS.flat().some((r) => r.inside), 'no cluster plays the answer inside the character\'s line until it has a screen design');
check(clusterFrom(new Headers({ 'x-fuori-cluster': '4' })) === CLUSTERS[3] && clusterFrom(new Headers()) === CLUSTER_1 && clusterFrom(new Headers({ 'x-fuori-cluster': '9' })) === CLUSTER_1, 'the cluster header picks clusters 1-6, cluster 1 otherwise');
const seen6 = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: `c-${i}`, turn: i % 8, characterId: 'x' }, CLUSTERS[5]).id));
check(seen6.size === 2 && seen6.has('free') && seen6.has('invite-en'), `cluster 6 plays its own three rungs (got ${[...seen6].join(', ')})`);

const parts: Part[] = [{ kind: 'question', text: 'Un caffè?', en: 'A coffee?', gloss: '' }, { kind: 'answer', text: 'Sì, grazie.', en: 'Yes, thanks.', gloss: '' }];
check(shownParts(parts, RUNGS.find((r) => r.id === 'two-en')!).find((x) => x.kind === 'answer')!.en === 'Yes, thanks.', 'bubbles keep their English');


const bare: Part[] = [{ kind: 'word', text: 'Qué bueno.', en: 'Great.', gloss: '' }, { kind: 'question', text: '¿Cuál le gusta más?', en: 'Which do you like best?', gloss: '' }, { kind: 'answer', text: 'Me gusta el de allá.', en: 'I like that one.', gloss: '' }];
const fixed = shownParts(bare, CLUSTER_1[0], CLUSTERS[2]);
check(fixed.find((x) => x.kind === 'question')!.gloss === 'Which do you like best?', 'a turn with no English gets its question\'s English as a gloss (Hugo, 2026-11-09)');
const glossed: Part[] = [{ kind: 'question', text: '¿Le gustan?', en: 'Do you like them?', gloss: 'like them?' }];
check(shownParts(glossed, CLUSTER_1[0], CLUSTERS[3])[0].gloss === 'like them?', 'later clusters: a turn that already has English is left alone');
check(shownParts(glossed, CLUSTER_1[0], CLUSTER_1)[1]?.text === 'Do you like them?', 'Level 1: a glossed question gets its full English as the spoken piece after it');
const para: Part[] = [{ kind: 'english', text: 'Welcome to the barrio.', en: '', gloss: '' }, { kind: 'word', text: 'Aquí pinto todos los días.', en: 'I paint here every day.', gloss: '' }, { kind: 'word', text: 'Bienvenido al barrio.', en: 'Welcome to the barrio.', gloss: '' }, { kind: 'question', text: '¿Le gustan los murales?', en: 'Do you like the murals?', gloss: '' }];
const g1 = glossAll(para);
check(g1[1].gloss === 'I paint here every day.' && g1[3].gloss === 'Do you like the murals?', 'glossAll (off for now): every phrase gets its English');
check(g1[2].gloss === '', 'glossAll: not when the turn\'s own English already said it');
check(shownParts(para, CLUSTER_1[0], CLUSTER_1)[1].gloss === 'I paint here every day.' && shownParts(para, CLUSTERS[1][0], CLUSTERS[1])[1].gloss === '', 'cluster 1: each sentence then its English (B); cluster 2: as little as needed (C)');
check(/each is followed by what it means/.test(setupText(CLUSTER_1[0], CLUSTER_1)) && /as little as needed/.test(setupText(CLUSTERS[1][0], CLUSTERS[1])), 'Level 1 is B, Level 1b (cluster 2) is C');
const inv = shownParts([{ kind: 'english', text: 'Sit anywhere.', en: '', gloss: '' }, { kind: 'question', text: '¿Es su primera vez en Puebla?', en: 'Is it your first time in Puebla?', gloss: '' }], RUNGS.find((r) => r.id === 'invite-en')!, CLUSTER_1);
{ const qi = inv.findIndex((x) => x.kind === 'question'); check(inv[qi + 1]?.text === 'Is it your first time in Puebla?' && inv[inv.length - 1].kind === 'english' && /ask me in English or/.test(inv[inv.length - 1].text), 'the invitation to ask is said, in code'); }
check(shownParts(para, CLUSTERS[3][0], CLUSTERS[3])[1].gloss === '', 'later clusters leave glossing to the character');
const qs: Part[] = [{ kind: 'english', text: 'Welcome!', en: '', gloss: '' }, { kind: 'question', text: '¿Quiere probar el mole?', en: 'Do you want to try the mole?', gloss: '' }, { kind: 'answer', text: 'Sí, por favor.', en: 'Yes, please.', gloss: '' }, { kind: 'answer', text: 'No, gracias.', en: 'No, thanks.', gloss: '' }];
const q1 = shownParts(qs, RUNGS.find((r) => r.id === 'two-en')!, CLUSTER_1);
const qi = q1.findIndex((x) => x.kind === 'question');
check(q1[qi + 1]?.kind === 'english' && q1[qi + 1].text === 'Do you want to try the mole?', 'Level 1: the question, then its English as a spoken piece (Josh: "spanish then english")');
check(lineFromParts(q1).line.includes('¿Quiere probar el mole? Do you want to try the mole?'), 'the English is spoken right after the question, with answers shown');
check(shownParts(qs, RUNGS.find((r) => r.id === 'two-en')!, CLUSTERS[3]).every((x) => x.kind !== 'english' || x.text === 'Welcome!'), 'later clusters: no question echo');
const pre: Part[] = [{ kind: 'english', text: 'What can I get you?', en: '', gloss: '' }, { kind: 'question', text: '¿Qué le sirvo?', en: 'What can I serve you?', gloss: '' }];
check(shownParts(pre, RUNGS.find((r) => r.id === 'invite-en')!, CLUSTERS[3]).length >= 2 && !lineFromParts(questionEcho(pre)).line.includes('What can I serve you?'), 'an English question just before is enough: no echo after (nothing said three times)');
check(questionEcho([{ kind: 'question', text: '¿Le gusta?', en: 'Do you like it?', gloss: 'you can answer in English' }])[1].text === 'Do you like it?', 'the echo is the question\'s full English, not whatever is in its gloss');
const twice = shownParts([{ kind: 'question', text: '¿Quiere saber algo del barrio? You can ask me anything.', en: 'Do you want to know anything about the barrio? You can ask me anything.', gloss: '' }], RUNGS.find((r) => r.id === 'invite-en')!, CLUSTER_1);
check(!twice.some((x) => x.kind === 'english' && /^You can ask me in English or/.test(x.text)), 'the invitation isn\'t added when the character already gave it');
check(pickSetup({ conversationId: 'c', turn: 8, characterId: 'x' }).id === 'goodbye' && pickSetup({ conversationId: 'c', turn: 7, characterId: 'x' }).id !== 'goodbye', 'from the 8th turn the goodbye is offered');
check(setupText(GOODBYE).includes('goodbye'), 'the goodbye setup line comes from scaffolding.md');
const noAsk = shownParts([{ kind: 'question', text: '¿De dónde es usted?', en: 'Where are you from?', gloss: '' }], RUNGS.find((r) => r.id === 'ask-en')!, CLUSTER_1);
check(noAsk.some((x) => x.kind === 'english' && /ask me in English or/.test(x.text)), 'questions to ask with none given becomes an invitation to ask');
// The four of 2026-11-09 evening
check(pickSetup({ conversationId: null, turn: 0, learnerId: 'L', characterId: 'x' }, CLUSTER_1).id === 'two-en', 'the opener is two answers to read');
const thin: Part[] = [{ kind: 'word', text: 'Estoy preparando las velas.', en: "I'm preparing the candles.", gloss: 'candles' }, { kind: 'word', text: 'La iglesia.', en: 'The church.', gloss: 'church' }];
const fuller = fullerGlosses(thin);
check(fuller[0].gloss === "I'm preparing the candles." && fuller[1].gloss === 'church', 'Level 1: a one-word gloss on a longer phrase becomes its English; a short phrase keeps its word (Lupita)');
{
  const city0 = cities.find((c) => c.places.some((p) => p.characterId))!;
  const ch0 = characterForPlace(city0, city0.places.find((p) => p.characterId)!)!;
  const built = buildBeginnerPrompt({ character: ch0, transcript: [{ who: 'npc', transcript: 'Hola.' }], learnerSaid: 'Hola', promptFile: SCAFFOLDING_FILE, stageText: levelText(CLUSTER_1), turnNote: setupLine(RUNGS[0]) });
  check(built.messages[built.messages.length - 1].content.endsWith(`(${setupLine(RUNGS[0])})`) && !built.system.includes(setupLine(RUNGS[0])), 'the setup line is said next to the latest message, not in the system prompt');
  check(built.system.includes(levelText(CLUSTER_1)), 'the level text stays in the system prompt');
}
check(/turnNote: setupLine\(setup\)/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'the game puts the setup next to the latest message');
const stored = exchangeTurns({ reply: { line: 'x', en: 'y', parts: [{ kind: 'word', text: 'Preparo las velas.', en: 'I prepare the candles.', gloss: 'preparing the candles' }] } } as never, new Date().toISOString());
check((stored[0] as { parts?: { gloss?: string; en?: string }[] }).parts?.[0].gloss === 'preparing the candles' && (stored[0] as { parts?: { en?: string }[] }).parts?.[0].en === 'I prepare the candles.', 'stored parts keep their gloss and English');
check(glossAll([{ kind: 'word', text: 'Vengo al Zócalo cada tarde.', en: 'I come to the Zócalo every afternoon.', gloss: 'every afternoon' }])[0].gloss === 'I come to the Zócalo every afternoon.', 'pattern B: a clipped gloss becomes the full English');
check(glossAll([{ kind: 'word', text: 'Buenas tardes.', en: 'Good afternoon.', gloss: 'Good afternoon.' }])[0].gloss === 'Good afternoon.', 'pattern B: a full gloss is kept');
// The setup mix (Renata, 2026-11-10)
{
  const picks = Array.from({ length: 400 }, (_, i) => pickSetup({ conversationId: `mix-${i}`, turn: 1 + (i % 7), characterId: 'x' }, CLUSTER_1).id);
  const share = (id: string) => picks.filter((x) => x === id).length / picks.length;
  check(share('two-en') > 0.5 && share('ask-en') < 0.25 && share('invite-en') < 0.25, `two answers most of the time, invitations now and then (two ${share('two-en').toFixed(2)}, ask ${share('ask-en').toFixed(2)}, invite ${share('invite-en').toFixed(2)})`);
  let twice = 0;
  for (let c = 0; c < 200; c++) for (let t = 2; t < 8; t++) {
    const a = pickSetup({ conversationId: `run-${c}`, turn: t - 1, characterId: 'x' }, CLUSTER_1).id, b = pickSetup({ conversationId: `run-${c}`, turn: t, characterId: 'x' }, CLUSTER_1).id;
    if (['ask-en', 'invite-en'].includes(a) && ['ask-en', 'invite-en'].includes(b)) twice++;
  }
  check(twice === 0, `never an invitation twice running (got ${twice})`);
  const afterQ = Array.from({ length: 100 }, (_, i) => pickSetup({ conversationId: `q-${i}`, turn: 3, characterId: 'x', learnerSaid: '¿Cuántos años lleva aquí?' }, CLUSTER_1).id);
  check(!afterQ.some((x) => ['ask-en', 'invite-en'].includes(x)), 'no invitation right after the learner\'s own question');
}
const ann = shownParts([{ kind: 'english', text: 'Great question. You could ask me one of these:', en: '', gloss: '' }, { kind: 'answer', text: '¿Qué pinta?', en: 'What do you paint?', gloss: '' }, { kind: 'answer', text: '¿Desde cuándo?', en: 'Since when?', gloss: '' }], RUNGS.find((r) => r.id === 'ask-en')!, CLUSTERS[3]);
check(ann[0].kind === 'english' && ann[0].text === 'Great question.', 'an announcing sentence ending in a colon before the bubbles is dropped');
check(/p\.promptFile === SCAFFOLDING_FILE && !p\.retried/.test(readFileSync('lib/beginner.ts', 'utf8')), 'Beginner 2 retries once when a reply runs past the limit (Beginner 1 unchanged)');
const inside = shownParts(parts, RUNGS.find((r) => r.id === 'inside-en')!);
check(!inside.some((x) => x.kind === 'answer') && inside.some((x) => x.kind === 'word' && x.text === 'Sì, grazie.' && x.gloss === 'Yes, thanks.'), 'rung 4: the answer is in her speech with its English heard, no bubble');
check(shownParts(parts, RUNGS.find((r) => r.id === 'inside')!).some((x) => x.kind === 'word' && x.text === 'Sì, grazie.' && !x.gloss), 'rung 6: the answer in her speech, no English');
check(inside.some((x) => x.kind === 'english' && x.text.length > 0), 'the lead line before the answer comes from scaffolding.md');
const v = beginner2Version(CLUSTERS[2]);
check(v.endsWith('+C3'), `the version names the cluster (${v})`);
check(v.startsWith('beginner-2-') && !stageInVersion(v), `Beginner 2 turns carry no stage tag, so the Beginner 1 path doesn't count them (${v})`);

const route = readFileSync('app/v1/turn/route.ts', 'utf8');
const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/lineFromParts\(parts\)/.test(take) && /promptFile: BEGINNER_2_FILE/.test(take) && !/canRetry: p\.canRetry, promptFile: BEGINNER_2_FILE[^\n]*onText/.test(take), 'the spoken line is rebuilt from the rewritten parts, and the voice waits for them');
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
