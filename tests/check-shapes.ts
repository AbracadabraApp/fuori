// The shape table (lib/shapes.ts): signals and notes (the intro and its beats were removed 2026-11-15)
// and leaves out. Run in both countries: npm run test:shapes
import { readFileSync } from 'node:fs';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { pickShape, pickShapes, shapeNote, noteOf, shapeIds, ANSWER_FIRST, askedSomething } from '@/lib/shapes';
import { GOODBYE_AFTER, pickSetup } from '@/lib/beginner-2';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

// Signals: a question by punctuation, in any language; nothing otherwise
check(askedSomething('¿Y por qué desde arriba?') && askedSomething('Perché?') && !askedSomething('Sí, por favor.') && !askedSomething(undefined), 'a question is punctuation (? or ¿), nothing else');
check(pickShape({ learnerSaid: 'Cosa sono quelle?' })?.id === 'answer-first', 'they asked something: answer first');
check(pickShape({ learnerSaid: 'Un caffè, per favore.' }) === null && pickShape({}) === null, 'no signal: no shape, the character writes the turn by habit');
// After the intro: no note unless a signal fires (the quiet default, restored 2026-11-11d)
check(shapeIds(pickShapes({ learnerSaid: 'Sí.' })) === undefined && shapeIds(pickShapes({ learnerSaid: '¿Por qué?' })) === 'answer-first' && shapeIds([]) === undefined, 'after the intro a turn carries no note unless they asked');
check(!/Shape: close/.test(['it', 'es-mx'].map((c) => readFileSync(`content/${c}/prompts/shapes.md`, 'utf8')).join('')) && !/beatFor|goodbyeAt/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'no close shape and no goodbye by the beat count');

// Notes: the shape's line, joined before the setup line; nothing when neither
check(/^Answer what they asked first/.test(shapeNote(ANSWER_FIRST)) && !/\{/.test(shapeNote(ANSWER_FIRST)), 'the answer-first line comes from shapes.md, filled');
check(noteOf(ANSWER_FIRST, 'This turn, ask about X.') === `${shapeNote(ANSWER_FIRST)} This turn, ask about X.`, 'shape and setup lines join into one note');
check(noteOf(null, 'This turn, ask about X.') === 'This turn, ask about X.' && noteOf(null) === undefined && noteOf(null, '') === undefined, 'the setup alone, or no note at all');

// The goodbye: once, on the 7th turn (Josh, 2026-11-12)
check(pickSetup({ conversationId: 'c', turn: GOODBYE_AFTER, characterId: 'x' }).id === 'goodbye' && pickSetup({ conversationId: 'c', turn: GOODBYE_AFTER + 1, characterId: 'x' }).id !== 'goodbye', 'the goodbye is offered once');
check(GOODBYE_AFTER === 7, 'the goodbye is offered on the 7th turn');

// The turn wiring: shapes on both paths, Beginner 1 untouched
const tt = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/const shaped = !isTutor && !p\.lesson && !welcome && \(setup !== null \|\| !isBeginner\)/.test(tt), 'shapes: ordinary visits only, at Beginner or above (never the welcome, lessons or Magda)');
check(/brief: frameBrief\(cluster\), note: noteOf\(shape, setupLine\(setup\)\)/.test(tt) && !/turnNote: noteOf/.test(tt) && /note: noteOf\(shape(, closing \? closeNote\(\) : undefined|, endingNote)?\),/.test(tt) && !/beats|runIntro/.test(tt), 'the shape note reaches the Beginner reply (every step, the one-line reply) and the Intermediate reply; nothing of the intro or of the Beginner parts branch is left in the turn');

if (problems.length) {
  console.error(`check-shapes: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-shapes: ok');
