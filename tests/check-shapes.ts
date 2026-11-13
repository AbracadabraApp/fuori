// The shape table (lib/shapes.ts) and the intro prompt (lib/intro.ts): signals, notes, what the intro's prompt holds
// and leaves out. Run in both countries: npm run test:shapes
import { readFileSync } from 'node:fs';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { pickShape, pickShapes, shapeNote, noteOf, shapeIds, beatsBrief, ANSWER_FIRST, askedSomething } from '@/lib/shapes';
import { buildIntroPrompt, introLine, IntroWatcher } from '@/lib/intro';
import { GOODBYE_AFTER, pickSetup } from '@/lib/beginner-2';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

// Signals: a question by punctuation, in any language; nothing otherwise
check(askedSomething('¿Y por qué desde arriba?') && askedSomething('Perché?') && !askedSomething('Sí, por favor.') && !askedSomething(undefined), 'a question is punctuation (? or ¿), nothing else');
check(pickShape({ learnerSaid: 'Cosa sono quelle?' })?.id === 'answer-first', 'they asked something: answer first');
check(pickShape({ learnerSaid: 'Un caffè, per favore.' }) === null && pickShape({}) === null, 'no signal: no shape, the character writes the turn by habit');
// After the intro: no note unless a signal fires (the quiet default, restored 2026-11-11d)
check(shapeIds(pickShapes({ learnerSaid: 'Sí.' })) === undefined && shapeIds(pickShapes({ learnerSaid: '¿Por qué?' })) === 'answer-first' && shapeIds([]) === undefined, 'after the intro a turn carries no note unless they asked');
// The intro's beats go to the character once; no close by the beat count (Josh, 2026-11-12: the goodbye on the 7th turn)
const beats = ['la piña', 'el borde crujiente', 'el día seco'];
check(/la piña; el borde crujiente; el día seco/.test(beatsBrief(beats)) && /not a list to work through/.test(beatsBrief(beats)) && !/\{\w+\}/.test(beatsBrief(beats)) && beatsBrief(undefined) === '', 'the beats go to the character once, as what was set out, not a list');
check(!/Shape: close/.test(['it', 'es-mx'].map((c) => readFileSync(`content/${c}/prompts/shapes.md`, 'utf8')).join('')) && !/beatFor|goodbyeAt/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'no close shape and no goodbye by the beat count');

// Notes: the shape's line, joined before the setup line; nothing when neither
check(/^Answer what they asked first/.test(shapeNote(ANSWER_FIRST)) && !/\{/.test(shapeNote(ANSWER_FIRST)), 'the answer-first line comes from shapes.md, filled');
check(noteOf(ANSWER_FIRST, 'This turn, ask about X.') === `${shapeNote(ANSWER_FIRST)} This turn, ask about X.`, 'shape and setup lines join into one note');
check(noteOf(null, 'This turn, ask about X.') === 'This turn, ask about X.' && noteOf(null) === undefined && noteOf(null, '') === undefined, 'the setup alone, or no note at all');

// The goodbye: once, on the 7th turn (Josh, 2026-11-12)
check(pickSetup({ conversationId: 'c', turn: GOODBYE_AFTER, characterId: 'x' }).id === 'goodbye' && pickSetup({ conversationId: 'c', turn: GOODBYE_AFTER + 1, characterId: 'x' }).id !== 'goodbye', 'the goodbye is offered once');
check(GOODBYE_AFTER === 7, 'the goodbye is offered on the 7th turn');

// The intro prompt: the character and the place, the brief, no turn rules; answers only when asked for
const city = cities[0];
const place = city.places.find((pl) => characterForPlace(city, pl))!;
const c = characterForPlace(city, place)!;
const plain = buildIntroPrompt({ character: c, answers: false });
const withAnswers = buildIntroPrompt({ character: c, answers: true, addressedAs: 'f', memory: { visits: 1, lastVisit: new Date(), notes: ['Had a coffee', 'Asked about the market'] } });
check(plain.system.includes(c.name) && plain.system.includes(place.name), `the intro prompt names ${c.name} and ${place.name}`);
check(/four or five short sentences/.test(plain.system) && /greet them as someone you know/.test(plain.system) && /something other than your work/.test(plain.system) && /"beats"/.test(plain.system), 'the brief and the beats format are in the system prompt');
check(!/No more words after a question mark/.test(plain.system) && !/speech-to-text/.test(plain.system) && !/Respond with JSON:\s*\{ "line"/.test(plain.system), 'no turn rules, no dialogue rules, no line format: the intro has its own prompt');
check(!/\{\w+\}/.test(plain.system) && !/\{\w+\}/.test(withAnswers.system), `every placeholder filled (got ${[...(plain.system + withAnswers.system).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).join(', ') || 'none'})`);
check(!/"answers"/.test(plain.system) && /"answers"/.test(withAnswers.system), 'the answers format only when answers are asked for (Beginner 2)');
check(/The person in front of you is a woman/.test(withAnswers.system) && /Had a coffee/.test(withAnswers.system) && !/The person in front of you/.test(plain.system), 'who is in front of them and what they remember, when known');
check(plain.messages.length === 1 && plain.messages[0].role === 'user' && plain.messages[0].content.length > 0, "the first turn's message opens the visit");
check(new RegExp(`"${language.formality[c.speech.formality]}"`).test(plain.system), 'the register comes from the character sheet');

// The line from the sentences, and the watcher's first sentence
const sentences = [{ text: 'Buenas tardes.', en: 'Good afternoon.' }, { text: '¿Quiere un lechero?', en: 'Do you want a lechero?' }];
check(introLine(sentences).line === 'Buenas tardes. ¿Quiere un lechero?' && introLine(sentences).en === 'Good afternoon. Do you want a lechero?', 'the line is the sentences joined');
{
  let got: string | undefined;
  const w = new IntroWatcher((first) => { got = first; });
  w.feed('{"sentences": [{"text": "Buenas tardes, pase.", "en": "Good after');
  check(got === undefined, 'the watcher waits for a complete first sentence');
  w.feed('{"sentences": [{"text": "Buenas tardes, pase.", "en": "Good afternoon, come in."}');
  check(got === undefined, 'and for the second to start');
  w.feed('{"sentences": [{"text": "Buenas tardes, pase.", "en": "Good afternoon, come in."}, {"text": "Aqu');
  check(got === 'Buenas tardes, pase. ', `then passes the first sentence with a space (got ${JSON.stringify(got)})`);
  w.feed('{"sentences": [{"text": "Other.", "en": "x"}, {"text": "y"');
  check(got === 'Buenas tardes, pase. ', 'only once');
}

// The turn wiring: the intro on an opening, shapes on both paths, Beginner 1 untouched
const tt = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/const shaped = !isTutor && !p\.lesson && !welcome && \(setup !== null \|\| onPath === null\)/.test(tt), 'shapes and the intro: ordinary visits at Intermediate or Beginner 2 only');
check(/brief: withBeats\(frameBrief\(cluster\)\), note: noteOf\(shape, setupLine\(setup\)\)/.test(tt) && /stageText: withBeats\(levelText\(cluster\)\), turnNote: noteOf\(shape, setupLine\(setup\)\)/.test(tt) && /note: noteOf\(shape\),/.test(tt) && /brief: beatsText/.test(tt), 'the shape note and the beats brief reach the frame clusters, the parts clusters and the Intermediate reply');

if (problems.length) {
  console.error(`check-shapes: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-shapes: ok');
