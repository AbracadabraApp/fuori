// Beginner 2 behind the app's hidden switch (lib/beginner-2.ts, docs/beginner-2.md):
// the switch is read from the header, the setup is picked from cluster 1 and
// replays the same for a conversation, its line comes from the country's
// prompt file, the language-only rung hides the answers' English, the turn
// code takes the switch, and Beginner 2 turns don't move the Beginner 1 path.
import { readFileSync } from 'fs';
import { beginnerVersionFrom, pickSetup, GOODBYE_AFTER, setupText, levelText, setupLine, fullerGlosses, shownParts, shapeParts, turnSteps, beginner2Version, questionEcho, GOODBYE, OPENER, CLUSTER_1, CLUSTERS, RUNGS, clusterFrom, flowingLine, withQuestionEnglish, cluster1Brief, frameBrief, onFrame, lineWithAnswers, questionOf } from '@/lib/beginner-2';
import { stageInVersion } from '@/lib/conversation-record';
import { lineFromParts, type Part } from '@/lib/beginner';
import { buildBeginnerPrompt, SCAFFOLDING_FILE, dialogueWithoutFormat } from '@/lib/beginner';
import { exchangeTurns } from '@/lib/recording';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

// Cluster 1 on the one-line reply: the question's English said after it (Josh: "Final Question always gets English echo")
check(withQuestionEnglish('Suba a la silla, climb up. ¿Quiere una boleada?', 'Climb up on the chair. Do you want a shine?') === 'Suba a la silla, climb up. ¿Quiere una boleada? Do you want a shine?', 'the English question follows hers');
check(withQuestionEnglish('Cosa ti preparo? (What can I make for you?)', 'What can I make for you?') === 'Cosa ti preparo? (What can I make for you?)', 'not when she put it in brackets herself');
check(withQuestionEnglish('What can I get you? Cosa prendi?', 'What can I get you? What will you have?') === 'What can I get you? Cosa prendi?', 'not when the English question is already right before hers');
check(withQuestionEnglish('Ecco il cornetto, still warm.', 'Here is the cornetto, still warm.') === 'Ecco il cornetto, still warm.', 'no question, nothing added');

// The spoken line for the English frame: a phrase inside an English sentence is joined with commas, a sentence with full stops
{
  const frame: Part[] = [{ kind: 'english', text: "I'm just flipping the first picadas on", en: '', gloss: '' }, { kind: 'word', text: 'el comal', en: 'the griddle', gloss: 'the griddle' }, { kind: 'english', text: "and they're hot right now.", en: '', gloss: '' }, { kind: 'question', text: '¿Quiere una?', en: 'Want one?', gloss: '' }];
  check(flowingLine(frame).line === "I'm just flipping the first picadas on el comal, the griddle, and they're hot right now. ¿Quiere una?", `flowingLine: a phrase inside a sentence joined with spaces, its gloss set off by commas, a full stop at the sentence's end (got "${flowingLine(frame).line}")`);
  const bare: Part[] = [{ kind: 'english', text: "I'm mixing a fresh batch of", en: '', gloss: '' }, { kind: 'word', text: 'tejuino', en: 'tejuino', gloss: '' }, { kind: 'english', text: 'here, nice and cold.', en: '', gloss: '' }];
  check(flowingLine(bare).line === "I'm mixing a fresh batch of tejuino here, nice and cold.", `flowingLine: no gloss, no commas (got "${flowingLine(bare).line}")`);
  const twice: Part[] = [{ kind: 'english', text: 'I put it on el comal, the griddle, first.', en: '', gloss: '' }, { kind: 'word', text: 'el comal.', en: 'the griddle', gloss: '' }, { kind: 'question', text: '¿Quiere una?', en: 'Want one?', gloss: '' }];
  check(flowingLine(twice).line === 'I put it on el comal, the griddle, first. ¿Quiere una?', `a phrase already said inside the English isn't said again (got "${flowingLine(twice).line}")`);
  const echoed: Part[] = [{ kind: 'english', text: "I'm making a fresh batch of", en: '', gloss: '' }, { kind: 'word', text: 'tejuino', en: 'tejuino', gloss: '' }, { kind: 'english', text: 'here.', en: '', gloss: '' }, { kind: 'question', text: '¿Quiere probar un tejuino?', en: 'Do you want to try a tejuino?', gloss: '' }, { kind: 'english', text: 'Do you want to try a tejuino?', en: '', gloss: '' }];
  check(/batch of tejuino here\./.test(flowingLine(echoed).line), `the question's echo doesn't count as having said her phrase (got "${flowingLine(echoed).line}")`);
  const sentences: Part[] = [{ kind: 'word', text: 'Aquí está la silla.', en: 'Here is the chair.', gloss: 'the chair' }, { kind: 'english', text: 'You climb up.', en: '', gloss: '' }];
  check(flowingLine(sentences).line === 'Aquí está la silla. the chair. You climb up.', `flowingLine: a gloss before a new sentence closes with a full stop (got "${flowingLine(sentences).line}")`);
  check(flowingLine([{ kind: 'question', text: '¿Un café?', en: 'A coffee?', gloss: 'a coffee?' }, { kind: 'answer', text: 'Sí.', en: 'Yes.', gloss: '' }]).line === '¿Un café?', 'flowingLine: with answers shown the question\'s gloss is not said, as lineFromParts');
}

// No cluster adds English by code since 2026-11-10q (the Level 1 frame carries its own); the summary side call was removed 2026-11-12 (Josh: dead code)

// The cut-over (Josh, 2026-11-12): the new Beginner by default; the old one only when the app asks for it
check(beginnerVersionFrom(new Headers()) === 2 && beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '2' })) === 2, 'no header, or 2: the new Beginner');
check(beginnerVersionFrom(new Headers({ 'x-fuori-beginner': '1' })) === 1, 'header 1: the old Beginner');

const a = pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' });
check(pickSetup({ conversationId: 'conv-1', turn: 3, characterId: 'luisa' }).id === a.id, 'the same conversation and turn get the same setup');
const seen = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: `conv-${i}`, turn: 1 + (i % (GOODBYE_AFTER - 1)), characterId: 'luisa' }).id));
check(seen.size === CLUSTER_1.length && [...seen].every((id) => CLUSTER_1.some((s) => s.id === id)), `over 40 turns every setup of cluster 1 comes up (got ${[...seen].join(', ')})`);
const day = new Date('2026-11-09T10:00:00Z');
check(pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id === pickSetup({ turn: 0, learnerId: 'L', characterId: 'luisa', now: day }).id, 'an opening is seeded by learner, place and day');

for (const setup of RUNGS) check(setupText(setup).includes('This turn,') && !/\{\w+\}/.test(setupText(setup)), `${setup.block}: its line is read from scaffolding.md, filled`);
check(setupText(CLUSTER_1[0], CLUSTER_1).startsWith("They have no") && setupText(CLUSTERS[2][0], CLUSTERS[2]).startsWith('They can follow simple') && setupText(CLUSTERS[5][0], CLUSTERS[5]).startsWith('Where they are now: finding their feet'), 'each cluster gets its level text (S1, S2, S3) before the setup');
check(!/Every turn has some English|When you first see them|explain something in English when it helps/.test(readFileSync(`content/${process.env.COUNTRY ?? 'it'}/prompts/scaffolding.md`, 'utf8')), 'the English lines added one per play are gone from the prompt');
check(CLUSTERS.length === 6, 'six clusters');
check(CLUSTERS.flat().every((r) => r.maxAnswers === 0 || (r.maxAnswers === 2 && r.english)), 'bubbles are two, always with English (Josh: reading Spanish you don\'t understand is coercive; one answer feels weird)');
check(['two-en', 'ask-en'].every((id) => CLUSTER_1.some((r) => r.id === id)) && !CLUSTER_1.some((r) => r.id === 'free') && !CLUSTERS.flat().some((r) => r.id === 'invite-en'), 'cluster 1 mixes two answers and questions to ask, no open question (Josh: difficult for this level); no cluster invites a question');
{
  // Never the same setup twice running (2026-11-11c)
  let runs = 0;
  const seq: string[] = [];
  for (let t = 1; t <= 60; t++) { const id = pickSetup({ conversationId: 'rot', turn: t, characterId: 'x' }).id; seq.push(id); if (seq.length >= 3 && seq.slice(-3).every((x) => x === id)) runs++; }
  check(runs === 0 && new Set(seq.filter((x) => x !== 'goodbye')).size === 2, `no setup three times running over 60 turns, both kinds played (got ${runs} runs of three, kinds ${[...new Set(seq)].join(', ')})`);
  const q = questionOf('Suba a la silla, climb up. ¿Quiere una boleada?', 'Climb up on the chair. Do you want a shine?');
  check(q?.text === '¿Quiere una boleada?' && q?.en === 'Do you want a shine?', `questionOf: the last question with its English (got ${JSON.stringify(q)})`);
  check(questionOf('Ecco il cornetto.', 'Here is the cornetto.') === undefined, 'questionOf: nothing when the line ends on a statement');
  check(lineWithAnswers({ line: 'Mire. ¿Quiere ver?', en: 'Look. Do you want to see?', answers: [] }, RUNGS.find((x) => x.id === 'free')!).question?.text === '¿Quiere ver?', 'lineWithAnswers carries the question');
}
check(clusterFrom(new Headers({ 'x-fuori-cluster': '4' })) === CLUSTERS[3] && clusterFrom(new Headers()) === CLUSTER_1 && clusterFrom(new Headers({ 'x-fuori-cluster': '9' })) === CLUSTER_1, 'the cluster header picks clusters 1-6, cluster 1 otherwise');
const seen6 = new Set(Array.from({ length: 40 }, (_, i) => pickSetup({ conversationId: `c-${i}`, turn: 1 + (i % (GOODBYE_AFTER - 1)), characterId: 'x' }, CLUSTERS[5]).id));
check(seen6.size === 1 && seen6.has('free'), `cluster 6 plays its own three rungs (got ${[...seen6].join(', ')})`);

const parts: Part[] = [{ kind: 'question', text: 'Un caffè?', en: 'A coffee?', gloss: '' }, { kind: 'answer', text: 'Sì, grazie.', en: 'Yes, thanks.', gloss: '' }];
check(shownParts(parts, RUNGS.find((r) => r.id === 'two-en')!).find((x) => x.kind === 'answer')!.en === 'Yes, thanks.', 'bubbles keep their English');


const bare: Part[] = [{ kind: 'word', text: 'Qué bueno.', en: 'Great.', gloss: '' }, { kind: 'question', text: '¿Cuál le gusta más?', en: 'Which do you like best?', gloss: '' }, { kind: 'answer', text: 'Me gusta el de allá.', en: 'I like that one.', gloss: '' }];
const fixed = shownParts(bare, CLUSTER_1[0], CLUSTERS[2]);
check(fixed.find((x) => x.kind === 'question')!.gloss === 'Which do you like best?', 'a turn with no English gets its question\'s English as a gloss (Hugo, 2026-11-09)');
const glossed: Part[] = [{ kind: 'question', text: '¿Le gustan?', en: 'Do you like them?', gloss: 'like them?' }];
check(shownParts(glossed, CLUSTER_1[0], CLUSTERS[3])[0].gloss === 'like them?', 'later clusters: a turn that already has English is left alone');
check(shownParts(glossed, CLUSTER_1[0], CLUSTER_1)[1]?.text === 'Do you like them?', 'Level 1: a glossed question gets its full English as the spoken piece after it');
const para: Part[] = [{ kind: 'english', text: 'Welcome to the barrio.', en: '', gloss: '' }, { kind: 'word', text: 'Aquí pinto todos los días.', en: 'I paint here every day.', gloss: '' }, { kind: 'word', text: 'Bienvenido al barrio.', en: 'Welcome to the barrio.', gloss: '' }, { kind: 'question', text: '¿Le gustan los murales?', en: 'Do you like the murals?', gloss: '' }];
check(shownParts(para, CLUSTER_1[0], CLUSTER_1)[1].gloss === '' && shownParts(para, CLUSTERS[1][0], CLUSTERS[1])[1].gloss === '', 'no cluster adds the literal English after each phrase by code (2026-11-10q: the frame carries it)');
check(/talk mostly in English/.test(setupText(CLUSTER_1[0], CLUSTER_1)) && /with its English beside it/.test(setupText(CLUSTER_1[0], CLUSTER_1)) && !/word part/.test(levelText(CLUSTER_1)) && !/say it again/.test(setupText(CLUSTER_1[0], CLUSTER_1)), 'Level 1 is the frame brief as the list used it: one line, no parts, each phrase with its English, no sandwich repeat (Josh: weird)');
check(/setup && onFrame\(cluster\)\n\s*\?[\s\S]*?runTurn\(\{[^\n]*brief: withBeats\(frameBrief\(cluster\)\), note: noteOf\(shape, setupLine\(setup\)\), answers: setup\.maxAnswers > 0/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'clusters 1-3 run on the Intermediate reply with the cluster\'s brief, the setup line (with any shape and beat) on the newest message and the answers asked for (2026-11-11d)');
check(onFrame(CLUSTER_1) && onFrame(CLUSTERS[2]) && !onFrame(CLUSTERS[3]) && frameBrief(CLUSTERS[1]).startsWith(levelText(CLUSTERS[1])) && /only the first time they hear it/.test(levelText(CLUSTERS[1])) && /half in English/.test(levelText(CLUSTERS[2])), 'steps 2 and 3: the frame minus the English heard before, then half and half, on the one-line reply; the parts format from cluster 4');
check(lineWithAnswers({ line: 'Mire. ¿Quiere ver?', en: 'Look. Do you want to see?', answers: [] }, RUNGS.find((x) => x.id === 'two-en')!, CLUSTERS[2]).line === 'Mire. ¿Quiere ver?' && /Do you want to see\?$/.test(lineWithAnswers({ line: 'Mire. ¿Quiere ver?', en: 'Look. Do you want to see?', answers: [] }, RUNGS.find((x) => x.id === 'two-en')!, CLUSTERS[1]).line), 'the question\'s English is said after it in clusters 1-2, not from cluster 3');
// Cluster 1's brief: the frame, the answer rules and the one-line format with answers; the setup line is not in it (it goes on the newest message)
check(cluster1Brief().startsWith(levelText(CLUSTER_1)) && /When you offer answers/.test(cluster1Brief()) && /"answers"/.test(cluster1Brief()) && !/This turn/.test(cluster1Brief()) && !/\{language\}/.test(cluster1Brief()), 'cluster 1 brief: the Level 1 frame, then the answer rules and the line-and-answers format, every placeholder filled');
// The one-line reply's answers become answer parts: capped at the setup's count, blank ones dropped, the question's English after the line
{
  const r = { line: 'Suba a la silla, climb up. ¿Quiere una boleada?', en: 'Climb up on the chair. Do you want a shine?', done: false, answers: [{ text: 'Sí, por favor.', en: 'Yes, please.' }, { text: '  ', en: '' }, { text: 'No, gracias.', en: 'No, thanks.' }, { text: 'Otra.', en: 'Another.' }] };
  const out = lineWithAnswers(r, RUNGS.find((x) => x.id === 'two-en')!);
  check(out.parts.length === 2 && out.parts.every((x) => x.kind === 'answer' && x.gloss === '') && out.parts[1].text === 'No, gracias.', `lineWithAnswers: two answer parts, blank dropped, extras cut (got ${JSON.stringify(out.parts)})`);
  check(out.line.endsWith('¿Quiere una boleada? Do you want a shine?') && out.en === r.en && out.done === false, 'lineWithAnswers: the question\'s English after the line, en and done kept');
  check(lineWithAnswers({ line: 'Ecco.', en: 'Here.' }, RUNGS.find((x) => x.id === 'free')!).parts.length === 0, 'lineWithAnswers: a setup with no answers gives none');
}
check(/only the first time they hear it/.test(setupText(CLUSTERS[1][0], CLUSTERS[1])), 'Level 1b (cluster 2) is step 2: the frame minus the English heard before (2026-11-11d)');
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
check(pickSetup({ conversationId: 'c', turn: 7, characterId: 'x' }).id === 'goodbye' && pickSetup({ conversationId: 'c', turn: 6, characterId: 'x' }).id !== 'goodbye' && pickSetup({ conversationId: 'c', turn: 8, characterId: 'x' }).id !== 'goodbye' && pickSetup({ conversationId: 'c', turn: 12, characterId: 'x' }).id !== 'goodbye', 'the goodbye is offered once, on the 7th turn (Josh, 2026-11-12), not on every turn after it (Chuy)');
check(setupText(GOODBYE).includes('goodbye'), 'the goodbye setup line comes from scaffolding.md');
const noAsk = shownParts([{ kind: 'question', text: '¿De dónde es usted?', en: 'Where are you from?', gloss: '' }], RUNGS.find((r) => r.id === 'ask-en')!, CLUSTER_1);
check(noAsk.some((x) => x.kind === 'english' && /ask me in English or/.test(x.text)), 'questions to ask with none given becomes an invitation to ask');
// The four of 2026-11-09 evening
check(pickSetup({ conversationId: null, turn: 0, learnerId: 'L', characterId: 'x' }, CLUSTER_1).id === 'opener' && setupLine(OPENER).includes('not about them'), 'the opener: two answers, about the place, not the person');
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
check(/turnNote: noteOf\(shape, setupLine\(setup\)\)/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'the game puts the setup (with any shape) next to the latest message');
const stored = exchangeTurns({ reply: { line: 'x', en: 'y', parts: [{ kind: 'word', text: 'Preparo las velas.', en: 'I prepare the candles.', gloss: 'preparing the candles' }] } } as never, new Date().toISOString());
check((stored[0] as { parts?: { gloss?: string; en?: string }[] }).parts?.[0].gloss === 'preparing the candles' && (stored[0] as { parts?: { en?: string }[] }).parts?.[0].en === 'I prepare the candles.', 'stored parts keep their gloss and English');
// The setup mix (Renata, 2026-11-10)
{
  const picks = Array.from({ length: 400 }, (_, i) => pickSetup({ conversationId: `mix-${i}`, turn: 1 + (i % (GOODBYE_AFTER - 1)), characterId: 'x' }, CLUSTER_1).id);
  const share = (id: string) => picks.filter((x) => x === id).length / picks.length;
  check(share('two-en') > 0.5 && share('ask-en') < 0.35, `two answers most of the time, questions to ask now and then (2026-11-11c: never three of a kind running) (two ${share('two-en').toFixed(2)}, ask ${share('ask-en').toFixed(2)}, invite ${share('invite-en').toFixed(2)})`);
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
{
  const city0 = cities.find((c) => c.places.some((p) => p.characterId))!;
  const ch0 = characterForPlace(city0, city0.places.find((p) => p.characterId)!)!;
  const said = buildBeginnerPrompt({ character: ch0, transcript: [{ who: 'npc', transcript: '¿Café?', offered: ['Un café, por favor.', 'Un té, por favor.'] }], learnerSaid: 'Un café, por favor.', promptFile: SCAFFOLDING_FILE, stageText: levelText(CLUSTER_1), turnNote: setupLine(RUNGS[0]) });
  const own = buildBeginnerPrompt({ character: ch0, transcript: [{ who: 'npc', transcript: '¿Café?', offered: ['Un café, por favor.', 'Un té, por favor.'] }], learnerSaid: 'Prefiero agua fría hoy.', promptFile: SCAFFOLDING_FILE, stageText: levelText(CLUSTER_1), turnNote: setupLine(RUNGS[0]) });
  const last = (b: typeof said) => b.messages[b.messages.length - 1].content;
  check(last(said) !== last(own) && last(said).length > 'Un café, por favor.'.length + 5, 'Beginner 2: the heard note tells said-back from own words');
}
const v = beginner2Version(CLUSTERS[2]);
check(v.endsWith('+C3'), `the version names the cluster (${v})`);
check(v.startsWith('beginner-2-') && !stageInVersion(v), `Beginner 2 turns carry no stage tag, so the Beginner 1 path doesn't count them (${v})`);

const route = readFileSync('app/v1/turn/route.ts', 'utf8');
const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/flowingLine\(parts\)/.test(take) && /promptFile: BEGINNER_2_FILE/.test(take) && !/canRetry: p\.canRetry, promptFile: BEGINNER_2_FILE[^\n]*onText/.test(take), 'the spoken line is rebuilt from the rewritten parts, and the voice waits for them');
check(/beginnerVersion: beginnerVersionFrom\(request\.headers\)/.test(route) && /beginnerCluster: clusterHeaderFrom\(request\.headers\)/.test(route), 'the route passes the switch and the cluster to the turn');
check(/const newBeginner = p\.beginnerVersion !== 1;/.test(take) && /promptFile: BEGINNER_2_FILE/.test(take), 'the turn plays the new Beginner unless the old one is asked for');
check(/onPath !== null && \(newBeginner \|\| onPath\.stage\.path === 'beginner'\)/.test(take) && /!newBeginner && onPath\?\.stage\.path === 'character'/.test(take), 'a learner past the old stage 3 plays the new Beginner too, not the character prompt with a Beginner block');
check(/: beginner && onPath\n\s+\? \/\/ Beginner 1 as it has always run[^\n]*\n\s+await runBeginnerTurn\(\{ character, transcript: transcript\.map\(\(\{ offered: _offered, \.\.\.t \}\) => t\), learnerSaid, memory, addressedAs, laps: p\.laps, onText: p\.onText, canRetry: p\.canRetry, stageText: stageText\(onPath\.stage/.test(take), 'Beginner 1\'s turn is unchanged: same stage text, and still without the offered answers (no heard note)');
check(/promptFile: BEGINNER_2_FILE/.test(take) && !/setup[\s\S]{0,40}transcript\.map\(\(\{ offered/.test(take.slice(take.indexOf('beginner && onPath && setup'), take.indexOf(': beginner && onPath\n'))), 'Beginner 2 keeps the offered answers, so its heard note works');

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

// Each turn records which shaping steps changed Claude's parts (logged and saved with the turn)
{
  const two = RUNGS.find((r) => r.id === 'two-en')!;
  const raw: Part[] = [
    { kind: 'word', text: 'Estoy preparando las velas.', en: "I'm preparing the candles.", gloss: 'candles' },
    { kind: 'question', text: '¿Le gustan?', en: 'Do you like them?', gloss: '' },
    { kind: 'english', text: 'You could say:', en: '', gloss: '' },
    { kind: 'answer', text: 'Sí, mucho.', en: 'Yes, a lot.', gloss: '' },
    { kind: 'answer', text: 'No mucho.', en: 'Not much.', gloss: '' },
  ];
  const { parts, fixes } = shapeParts(raw, two, CLUSTER_1);
  check(JSON.stringify(parts) === JSON.stringify(shownParts(raw, two, CLUSTER_1)), 'shapeParts shows the same parts as shownParts');
  check(['withoutAnnouncing', 'questionEcho'].every((f) => fixes.includes(f)) && !fixes.includes('glossAll'), `the fixes that changed something are named, glossAll not among them (got ${fixes.join(', ')})`);
  const clean: Part[] = [{ kind: 'english', text: 'Good afternoon.', en: '', gloss: '' }, { kind: 'word', text: 'Buenas tardes.', en: 'Good afternoon.', gloss: '' }];
  check(shapeParts(clean, RUNGS.find((r) => r.id === 'free')!, CLUSTERS[5]).fixes.length === 0, 'a turn the code leaves alone records no fixes');
  const steps = turnSteps(raw, two, CLUSTER_1, fixes);
  check(steps.setup === 'two-en' && steps.cluster === 1 && steps.claudeParts === raw, "the steps keep the setup, the cluster and Claude's parts when fixed");
  check(!('claudeParts' in turnSteps(clean, two, CLUSTERS[5], [])) && turnSteps(clean, two, CLUSTERS[5], []).cluster === 6, "no fixes: Claude's parts aren't kept twice");
  const saved = exchangeTurns({ learnerSaid: 'hola', reply: { line: 'x', en: 'x', parts }, replyMs: 900, steps }, 'now');
  check(JSON.stringify((saved[1] as { steps?: unknown }).steps) === JSON.stringify(steps), 'the steps are saved with the reply');
  check(!('steps' in exchangeTurns({ reply: { line: 'x', en: 'x' } }, 'now')[0]), 'a turn without steps (Beginner 1, Intermediate) saves as before');
}

if (problems.length) {
  console.error(`check-beginner-2: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-beginner-2: ok');
