// The Beginner level (lib/beginner-2.ts, docs/beginner-2.md; called Beginner 2 while the old Beginner played beside
// it): the setup is picked from the learner's cluster and replays the same for a conversation, its line comes from the
// country's prompt file, every step plays on the one-line reply, and nothing of the old Beginner, its stages or its
// Old/New switch is left in the turn (removed 2026-11-15). The parts-format shaping it used to play
// (tests/experiments/parts-shaping.ts, for experiments only) is still checked here.
import { SETTINGS, saySentence, saySentences, englishOf, wayOf, seedOf } from '@/lib/dialogue/pieces';
import { readFileSync } from 'fs';
import { pickSetup, GOODBYE_AFTER, CLOSE_AT, CLOSE, setupText, levelText, setupLine, turnSteps, beginner2Version, GOODBYE, OPENER, CLUSTER_1, CLUSTERS, RUNGS, clusterFrom, withQuestionEnglish, cluster1Brief, frameBrief, lineWithAnswers, questionOf, QUESTION_ECHO_FRAME } from '@/lib/beginner-2';
import { fullerGlosses, shownParts, shapeParts, questionEcho } from './experiments/parts-shaping';
import { stageInVersion } from '@/lib/conversation-record';
import { lineFromParts, type Part } from '@/lib/beginner';
import { buildBeginnerPrompt, SCAFFOLDING_FILE, dialogueWithoutFormat } from '@/lib/beginner';
import { exchangeTurns } from '@/lib/recording';
import { assemblePieces } from '@/lib/dialogue/pieces';
import { turnOutputWithAnswersJsonSchema, doneField } from '@/lib/prompts/turn-output-schema';
import { partialLine, LineWatcher } from '@/lib/voice/early-voice';
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

// No cluster adds English by code since 2026-11-10q (the Level 1 frame carries its own); the summary side call was removed 2026-11-12 (Josh: dead code)

const para: Part[] = [{ kind: 'english', text: 'Welcome to the barrio.', en: '', gloss: '' }, { kind: 'word', text: 'Aquí pinto todos los días.', en: 'I paint here every day.', gloss: '' }, { kind: 'word', text: 'Bienvenido al barrio.', en: 'Welcome to the barrio.', gloss: '' }, { kind: 'question', text: '¿Le gustan los murales?', en: 'Do you like the murals?', gloss: '' }];
check(shownParts(para, CLUSTER_1[0], CLUSTER_1)[1].gloss === '' && shownParts(para, CLUSTERS[1][0], CLUSTERS[1])[1].gloss === '', 'no cluster adds the literal English after each phrase by code (2026-11-10q: the frame carries it)');
check(/each sentence in braces with its English after a bar/.test(levelText(CLUSTER_1)) && !/word part/.test(levelText(CLUSTER_1)) && !/say it again/.test(setupText(CLUSTER_1[0], CLUSTER_1)), 'Level 1 is the frame brief as the list used it: one line, no parts, each phrase with its English, no sandwich repeat (Josh: weird)');
check(/: beginner && setup\n\s*\?[\s\S]*?runTurn\(\{[^\n]*brief: frameBrief\(cluster\), note: noteOf\(shape, setupLine\(setup\)\), answers: setup\.maxAnswers > 0/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'every step runs on the Intermediate reply with the cluster\'s brief, the setup line (with any shape and beat) on the newest message and the answers asked for (2026-11-11d)');
check(frameBrief(CLUSTERS[1]).startsWith(levelText(CLUSTERS[1])) && !/only the first time|new kind of question|only when it's new/.test(levelText(CLUSTERS[1]) + levelText(CLUSTERS[2])) && levelText(CLUSTERS[2]) === levelText(CLUSTER_1), 'steps 2 to 6 on the one-line reply (D10, Josh 2026-11-14: one screen at every step; was the parts format from step 4), with no "English only the first time" or "only for a new kind of question" (Josh, 2026-11-12: removed)');
check([CLUSTERS[1], CLUSTERS[2]].every((c) => /Do you want to see\?$/.test(lineWithAnswers({ line: 'Mire. ¿Quiere ver?', en: 'Look. Do you want to see?', answers: [] }, RUNGS.find((x) => x.id === 'two-en')!, c).line)), 'the question\'s English is said after it at steps 2 and 3, as at step 1 (the ladder: spoken through step 3 on the one-line reply; was steps 1-2 only before 2026-11-12)');
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
check(levelText(CLUSTERS[1]) === levelText(CLUSTER_1) && levelText(CLUSTERS[5]) === levelText(CLUSTER_1), 'every step shares step 1\'s level text (2026-11-15a: code says how much of each sentence is in the language)');
{
  const raw = '{Ese es *el comal*. | That is *the griddle*.} {Hoy hay *mole*. | Today there is *mole*.} {Está *caliente*. | It is *hot*.} {¿Le pongo *salsa*? | Do you want *salsa*?}';
  const english = (line: string) => line.split(/\s+/).filter((w) => /^(that|is|the|griddle|today|there|it|hot|do|you|want)$/i.test(w.replace(/[^\p{L}]/gu, ''))).length;
  const counts = SETTINGS.map((setting) => english(saySentences(raw, setting!, 0.42)));
  check(SETTINGS.length === 6 && counts.every((n, i) => i === 0 || n <= counts[i - 1]) && counts[5] === 0 && counts[2] < counts[1] && counts[4] < counts[3], `no step says more English of the same turn than the one before; step 3 says less than step 2, step 5 less than step 4, step 6 none (steps 3 and 4 can be level; got ${counts.join(', ')})`);
  check(saySentences(raw, SETTINGS[4]!, 0.42).endsWith('¿Le pongo salsa? Do you want salsa?') && saySentences(raw, SETTINGS[5]!, 0.42).endsWith('¿Le pongo salsa?'), 'the question keeps its English up to step 5 and loses it at step 6');
}
{
  const c = RUNGS.find((x) => x.id === 'comment')!;
  const r = lineWithAnswers({ line: 'Suba, suba. Yo boleo aquí desde hace cuarenta años.', en: "Come up. I've been shining shoes here for forty years.", answers: [{ text: 'Cuarenta años es mucho.', en: 'Forty years is a lot.' }, { text: '¿Le gusta su trabajo?', en: 'Do you like your work?' }] }, c, CLUSTER_1);
  check(r.question?.text === 'Yo boleo aquí desde hace cuarenta años.' && r.question?.en === "I've been shining shoes here for forty years." && r.line.endsWith("I've been shining shoes here for forty years."), `a comment turn's last line is printed with its English and its English is said after it at step 1, as a question's is (D7) (got ${JSON.stringify(r.question)} / ${r.line})`);
  const r4 = lineWithAnswers({ line: 'Yo boleo aquí desde hace cuarenta años.', en: "I've been shining shoes here for forty years.", answers: [{ text: 'Es mucho.', en: "That's a lot." }] }, c, CLUSTERS[3]);
  check(r4.question?.en === '' && r4.line.endsWith('forty years.'), 'at step 4 the comment is printed without its English, and its English is said (the ladder)');
  const joined = lineWithAnswers({ line: "Muy bien, very good. Yo llevo veinte años por estas piedras, I've driven these stones for twenty years.", en: "Very good. I've driven these stones for twenty years.", answers: [{ text: 'Veinte años.', en: 'Twenty years.' }] }, c, CLUSTER_1);
  check(joined.question?.text === 'Yo llevo veinte años por estas piedras.' && joined.question?.en === "I've driven these stones for twenty years." && !joined.line.endsWith("years. I've driven these stones for twenty years."), `step 1 joins a piece and its English in one sentence: the comment is printed without the English tail, and the English isn't said twice (got ${JSON.stringify(joined.question)})`);
  // B36: since the steps became settings, the turn's last sentence is echoed at steps 1–5, so the said line ends on its
  // English; the comment before the echo is printed (Mexico 04dcfd55 and Italy 6c1b1f37, the levels check, 2026-11-15)
  for (const [raw, text, en] of [
    ['{Aquí cantamos todas las noches. | We sing here every night.} {Para mí, este teatro es *como una casa*. | For me, this theatre is *like a home*.}', 'Para mí, este teatro es como una casa.', 'For me, this theatre is like a home.'],
    ["{Benvenuto! | Welcome!} {A Bologna l'espresso si beve *al banco*, in piedi, in un minuto. | In Bologna espresso is drunk *at the bar*, standing, in a minute.}", "A Bologna l'espresso si beve al banco, in piedi, in un minuto.", 'In Bologna espresso is drunk at the bar, standing, in a minute.'],
  ] as const) {
    for (const step of [1, 2, 3, 4]) {
      const echoed = lineWithAnswers({ line: saySentences(raw, SETTINGS[step - 1]!, 0.42), en: englishOf(raw), answers: [{ text: 'Sí.', en: 'Yes.' }] }, c, CLUSTERS[step - 1]);
      check(echoed.question?.text === text && echoed.question?.en === (step <= 3 ? en : '') && echoed.line.endsWith(`${text} ${en}`), `B36: an echoed comment is printed at step ${step} (got ${JSON.stringify(echoed.question)} / ${echoed.line})`);
    }
  }
  check(CLUSTERS.slice(0, 5).every((cl) => cl.some((x) => x.id === 'comment')) && !CLUSTERS[5].some((x) => x.id === 'comment'), 'the comment turn is in steps 1–5 (it gives answers), not step 6');
}
check(CLUSTERS.every((cl) => { try { return !!pickSetup({ conversationId: null, turn: 0, learnerId: 'l', characterId: 'c' }, cl).id && !!pickSetup({ conversationId: 'v', turn: 0, characterId: 'c' }, cl).id; } catch { return false; } }) && pickSetup({ conversationId: null, turn: 0, learnerId: 'l', characterId: 'c' }, CLUSTERS[5]).maxAnswers === 0, 'every step can open a visit; step 6 opens on its own no-answers turn (2026-11-15: step 6 had no turn 0, every visit failed to open)');
check(QUESTION_ECHO_FRAME.slice(0, 5).every(Boolean) && !QUESTION_ECHO_FRAME[5], 'the question\'s English is said at steps 1–5 and not at 6, added by code when the character left it out (the ladder, Josh 2026-11-12; steps 4–6 since D10, 2026-11-14)');
{
  const r = { line: 'Mire el comal. ¿Le pongo salsa?', en: 'Look at the griddle. Do you want salsa?', answers: [{ text: 'Sí, por favor.', en: 'Yes, please.' }, { text: 'No, gracias.', en: 'No, thanks.' }] };
  const two = RUNGS.find((x) => x.id === 'two-en')!;
  const at = (n: number) => lineWithAnswers(r, two, CLUSTERS[n - 1]);
  check(at(3).question?.en === 'Do you want salsa?' && at(4).question?.en === '' && at(5).question?.en === '' && at(6).question?.en === '', "the question's English is printed at steps 1–3 only (the ladder)");
  check(at(4).line.endsWith('Do you want salsa?') && at(5).line.endsWith('Do you want salsa?') && !at(6).line.endsWith('Do you want salsa?'), "and said at steps 4–5, not at 6");
  check([3, 4, 5].every((n) => at(n).parts.every((x) => x.kind !== 'answer' || x.en)), 'the answers keep their English at every step (Josh, 2026-11-09)');
  check(CLUSTERS[5].every((x) => x.maxAnswers === 0), 'step 6 offers no answers: their own words');
}
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
check(/note: noteOf\(shape, setupLine\(setup\)\)/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'the game puts the setup (with any shape) next to the latest message');
const stored = exchangeTurns({ reply: { line: 'x', en: 'y', parts: [{ kind: 'word', text: 'Preparo las velas.', en: 'I prepare the candles.', gloss: 'preparing the candles' }] } } as never, new Date().toISOString());
check((stored[0] as { parts?: { gloss?: string; en?: string }[] }).parts?.[0].gloss === 'preparing the candles' && (stored[0] as { parts?: { en?: string }[] }).parts?.[0].en === 'I prepare the candles.', 'stored parts keep their gloss and English');
// The setup mix (Renata, 2026-11-10)
{
  const picks = Array.from({ length: 400 }, (_, i) => pickSetup({ conversationId: `mix-${i}`, turn: 1 + (i % (GOODBYE_AFTER - 1)), characterId: 'x' }, CLUSTER_1).id);
  const share = (id: string) => picks.filter((x) => x === id).length / picks.length;
  check(share('two-en') > share('notice') && share('notice') > 0.1 && share('ask-en') < 0.35, `two answers the most, Notice and questions to ask now and then (2026-11-12f; 2026-11-11c: never three of a kind running) (notice ${share('notice').toFixed(2)}) (two ${share('two-en').toFixed(2)}, ask ${share('ask-en').toFixed(2)}, invite ${share('invite-en').toFixed(2)})`);
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
// The old Beginner is gone from the turn (Josh, 2026-11-15: switch off "the old Beginner and its Old/New switch … then
// the stages, paths and parts format"): the header older apps still send is read nowhere, a Beginner is decided from
// the level alone, and an ordinary Beginner visit has one way to play, the one-line reply
check(/beginnerCluster: clusterHeaderFrom\(request\.headers\)/.test(route), 'the route passes the app\'s cluster to the turn');
{
  const levelUpRoute = readFileSync('app/v1/level-up/route.ts', 'utf8');
  const levelUp = readFileSync('lib/level-up.ts', 'utf8');
  const lib2 = readFileSync('lib/beginner-2.ts', 'utf8');
  const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
  for (const [name, src] of [['the turn route', route], ['the turn', take], ['the level-up route', levelUpRoute], ['the level up', levelUp], ['lib/beginner-2.ts', lib2]] as const) {
    check(!/x-fuori-beginner|beginnerVersion|newBeginner/.test(code(src)), `${name} no longer reads the Old/New Beginner switch (x-fuori-beginner)`);
  }
  check(/isBeginner = learnerLevel === 'beginner' \|\| learnerLevel === null;/.test(take) && /const beginner = !welcome && isBeginner;/.test(take), 'a Beginner is decided from the level alone: Beginner, or no level yet');
  check(/const drawn = beginner && !p\.lesson\n\s*\? pickSetup\(/.test(take), 'every Beginner\'s ordinary visit draws a setup (the Beginner level of lib/beginner-2.ts)');
  check(!/onPath|pathState|stageFor|stageText\(|stageTag|pathLevel|lib\/path/.test(code(take)), 'no path or stage is left in the turn');
  check(!/promptFile|shapeParts|flowingLine|onFrame/.test(code(take)), 'no parts-format Beginner visit is left in the turn (the welcome and lessons keep the parts format)');
  // The parts format is still there for the welcome and lessons
  check((code(take).match(/runBeginnerTurn\(/g) ?? []).length === 2 && /stageText: lessonBriefed\.brief/.test(take) && /stageText: welcomeBrief\(/.test(take), 'runBeginnerTurn is called twice: for a lesson and for the welcome');
  check(!/transcript\.map\(\(\{ offered/.test(take), 'a Beginner turn keeps the offered answers, so its heard note works');
  // The app: no Old/New picker, no header, no intro handling (removed with the server's, 2026-11-15)
  const swift = ['FuoriNetworking/APIClient.swift', 'FuoriFeatures/Settings/Settings.swift', 'FuoriFeatures/Conversation/ConversationModel.swift', 'FuoriFeatures/Conversation/CharacterBubble.swift', 'FuoriFeatures/Person/PersonView.swift'].map((f) => readFileSync(`ios/FuoriKit/Sources/${f}`, 'utf8')).join('\n');
  check(!/x-fuori-beginner|oldBeginner/.test(swift), 'the app has no Old/New Beginner switch and sends no x-fuori-beginner header');
  check(!/inIntro|introHead|skipIntro|IntroSheet|introSubtitle/.test(swift) && /public var question: IntroSentence\?/.test(swift), 'the app has no intro handling left; the question of a Beginner turn stays');
}

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

// The mix in a fixed shape (docs/mix.md, 2026-11-13): {piece | English} becomes the piece, then its English
check(assemblePieces('{Pase, pase | come in}, sit here. {¿Le pongo salsa? | Do you want salsa?}') === 'Pase, pase, come in, sit here. ¿Le pongo salsa? Do you want salsa?', 'pieces: the piece then its English; a question then its English after a space');
check(assemblePieces('That is {Cecina | cecina}, grilled.') === 'That is Cecina, grilled.', 'pieces: English that only repeats the piece (a name) is dropped');
check(assemblePieces('Look, {el comal}.') === 'Look, el comal.', 'pieces: a piece with no English is said alone');
check(assemblePieces('Sit here. {Ese es el co') === 'Sit here. Ese es el co' && assemblePieces('Sit here. {Ese es el co', true) === 'Sit here. ', 'pieces: a brace still open is held back while streaming');
check(assemblePieces('Sit here, {el comal | the griddle and more') === 'Sit here, el comal | the griddle and more', 'pieces: a stray brace on a whole line is dropped, nothing lost');
check(assemblePieces('No braces at all.') === 'No braces at all.', 'pieces: a line without braces is unchanged');
// The voice starts on the streamed line: it must never get a brace (the connection, not just the function)
const streamed = '{"line":"{Pase, pase | come in}, sit here. Look at {el co';
check(partialLine(streamed)?.text === 'Pase, pase, come in, sit here. Look at ', 'pieces: the streamed line is put together, an open piece held back');
let firstHeard = '';
let lineHeard = '';
const w = new LineWatcher({ split: true, onFirst: (f) => { firstHeard = f; }, onLine: (l) => { lineHeard = l; } });
w.feed(streamed);
w.feed('{"line":"{Pase, pase | come in}, sit here. Look at {el comal | the griddle}. {¿Le gusta? | Do you like it?}","en":"');
check(firstHeard === 'Pase, pase, come in, sit here. ' && lineHeard === 'Pase, pase, come in, sit here. Look at el comal, the griddle. ¿Le gusta? Do you like it?' && lineHeard.startsWith(firstHeard), 'pieces: the voice gets the first sentence and the whole line put together, the first a prefix of the line');

// Visits that end (2026-11-13, bugs.md B3): the goodbye on the 7th turn, the close from the 8th; Intermediate closes on the 15th (take-turn)
check(CLOSE_AT === 8 && pickSetup({ conversationId: 'c', turn: CLOSE_AT, characterId: 'x' }).id === 'close' && pickSetup({ conversationId: 'c', turn: CLOSE_AT + 2, characterId: 'x' }).id === 'close', 'Beginner: goodbye offered on the 7th turn, the close from the 8th (Josh: "8 for begginer")');
check(setupText(CLOSE).includes('goodbye') && CLOSE.maxAnswers === 0, 'the close says goodbye itself and offers no answers');
// Notice once a visit (2026-11-13, Josh: "everyone likes to say, lo veo, lo ve")
{
  let twice = 0;
  for (let c = 0; c < 300; c++) { const seq = Array.from({ length: 12 }, (_, t) => pickSetup({ conversationId: `n-${c}`, turn: t + 1, characterId: 'x' }).id); if (seq.filter((x) => x === 'notice').length > 1) twice++; }
  check(twice === 0, `Notice at most once a visit (got ${twice} visits with two)`);
}
// The reply format (2026-11-13, bugs.md B1, B3): answers required when asked; leaving counts as goodbye
{
  const ans = (turnOutputWithAnswersJsonSchema.properties as { answers: { minItems?: number; description: string } }).answers;
  check(ans.minItems === 1 && !/empty/i.test(ans.description), 'answers: at least one when the turn asks for them, no "empty" option');
  check(/have to go|want to stop/.test(doneField.description), 'done: leaving in any words counts, not only a goodbye');
}
// Whether a reply ended the visit is saved with the turn
check((exchangeTurns({ learnerSaid: 'Adiós', reply: { line: 'Adiós', en: 'Bye', done: true } }, 'now').at(-1) as { done?: boolean }).done === true, 'a reply that ends the visit is saved with done');

// The steps as settings (lib/dialogue/pieces.ts, 2026-11-15a): a sentence written in both languages, said four ways
{
  const [es, en] = ['Y lo envuelvo *en hoja de maíz*.', 'And I wrap it *in corn husk*.'];
  check(saySentence(es, en, 'english') === 'And I wrap it in corn husk.', 'a sentence said in English');
  check(saySentence(es, en, 'mix') === 'And I wrap it en hoja de maíz, in corn husk.', `a sentence mixed: the English with the marked phrase in the language, then its English (got ${saySentence(es, en, 'mix')})`);
  check(saySentence(es, en, 'echo') === 'Y lo envuelvo en hoja de maíz. And I wrap it in corn husk.', 'a sentence echoed');
  check(saySentence(es, en, 'bare') === 'Y lo envuelvo en hoja de maíz.', 'a sentence bare');
  check(saySentence('Y lo envuelvo.', 'And I wrap it.', 'mix') === 'Y lo envuelvo. And I wrap it.', 'no phrase marked: mixed falls back to the echo, so the language keeps its English');
  check(saySentence('Cantamos en *el Jardín de la Unión*.', 'We sing in *the Jardín de la Unión*.', 'mix') === 'We sing in el Jardín de la Unión.', 'a name is not glossed with itself, article or not (B29)');
  check(saySentence('*Una canción alegre*, perfecto.', '*A happy song*, perfect.', 'mix') === 'Una canción alegre, a happy song, perfect.', 'a phrase that opens the sentence takes the capital');
  check(saySentence('Guanajuato.', 'Guanajuato.', 'echo') === 'Guanajuato.', 'English that only repeats the sentence is said once');
  const raw = '{*Pase, pase*, siéntese aquí. | *Come in*, sit here.} {Ese es *el comal*. | That\'s *the griddle*.} {Hoy hay *mole*. | Today there is *mole*.} {¿Le pongo *salsa*? | Do you want *salsa*?}';
  const share = (line: string) => line.split(/\s+/).filter((w) => /pase|siéntese|aquí|ese|es|el|comal|hoy|hay|le|pongo/i.test(w.replace(/[^\p{L}]/gu, ''))).length;
  const said = SETTINGS.slice(0, 3).map((setting) => saySentences(raw, setting!, 0.42));
  check(said.every((line) => line.endsWith('¿Le pongo salsa? Do you want salsa?')), 'the question is echoed at steps 1 to 3');
  check(said.every((line) => !/[{}*|]/.test(line)), 'no braces, bars or asterisks are said');
  check(share(said[0]) < share(said[1]) && share(said[0]) < share(said[2]) && /el comal, the griddle/.test(said[0]) && said[1].endsWith('¿Le pongo salsa? Do you want salsa?'), `step 1 has the least of the language and mixes a phrase into its English; step 2 echoes everything (got ${said.map(share).join(', ')})`);
  check(saySentence('Y lo envuelvo *en hoja de maíz*.', 'And I wrap it *in corn husk*.', 'gloss') === 'Y lo envuelvo en hoja de maíz, in corn husk.', `the mix the other way round: the sentence in the language, its phrase glossed (got ${saySentence('Y lo envuelvo *en hoja de maíz*.', 'And I wrap it *in corn husk*.', 'gloss')})`);
  check(saySentence('Hoy hay *mole*.', 'Today there is *mole*.', 'gloss') === 'Hoy hay mole.' && saySentence('Hoy hay mole.', 'Today there is mole.', 'gloss') === 'Hoy hay mole. Today there is mole.', 'glossed: a name is not repeated; with no phrase marked the sentence is echoed');
  {
    const english3 = said[2].split(/\s+/).filter((w) => /^(come|in|sit|here|that's|the|griddle|today|there|is|do|you|want)$/i.test(w.replace(/[^\p{L}']/gu, ''))).length;
    const english2 = said[1].split(/\s+/).filter((w) => /^(come|in|sit|here|that's|the|griddle|today|there|is|do|you|want)$/i.test(w.replace(/[^\p{L}']/gu, ''))).length;
    check(english3 < english2, `step 3 says less English of the same turn than step 2 (got ${english3} and ${english2})`);
  }
  check(said[1] === 'Pase, pase, siéntese aquí. Come in, sit here. Ese es el comal. That\'s the griddle. Hoy hay mole. Today there is mole. ¿Le pongo salsa? Do you want salsa?', 'step 2 echoes every sentence');
  // The early voice reads the line as it's written: what it has said must open the whole line
  for (const setting of SETTINGS.slice(0, 3)) {
    const whole = saySentences(raw, setting!, 0.42);
    for (const cut of [30, 61, 62, 90, 120]) {
      const part = saySentences(raw.slice(0, cut), setting!, 0.42, true);
      const firstSentence = part.split(/(?<=[.!?])\s+/)[0] ?? '';
      check(!/[{}*|]/.test(part) && whole.startsWith(firstSentence), `a line still being written is said as the whole line will be (cut at ${cut}: "${part}")`);
    }
  }
  check(englishOf(raw) === "Come in, sit here. That's the griddle. Today there is mole. Do you want salsa?", 'the turn\'s English is each sentence\'s own');
  check(wayOf(SETTINGS[1]!, 0.1, 0) === 'echo' && seedOf('a:1') === seedOf('a:1') && seedOf('a:1') !== seedOf('a:2'), 'the way is the same every time for a turn');
  const tt = readFileSync('lib/conversation/take-turn.ts', 'utf8');
  check(/p\.onAssemble\?\.\(assemble\)/.test(tt) && /line: assemble\(r\.line, false\)/.test(tt) && /onAssemble: \(assemble\) => \{ watcher\.assemble = assemble; \}/.test(readFileSync('app/v1/turn/route.ts', 'utf8')), 'the turn hands the same way of saying the line to the early voice and the whole line');
}

// A country's own setting for a step replaces the shared one (content/<country>/language.ts → stepSettings): Italy's step 4
check(process.env.COUNTRY === 'es-mx' ? SETTINGS[3]!.ways.bare === 0.5 : SETTINGS[3]!.ways.bare === 0.7, `step 4 says half its sentences bare on the shared setting and seven in ten in Italy (got ${JSON.stringify(SETTINGS[3])})`);

if (problems.length) {
  console.error(`check-beginner-2: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-beginner-2: ok');
