// POST /v1/learn (the Learn sheet): the parts that need no network or
// database. A page is only written once the learner has said something, empty
// rows the model leaves are dropped, the route reads the conversation from the
// database and needs the learner token, and the prompt fills its placeholders.
import { readFileSync } from 'fs';
import { cities, tutor } from '@/content';
import { buildLearnPrompt, cannotWriteLearnPage, learnAvailable, tidyLearnPage } from '@/lib/learn';
import { parseTurnRequest } from '@/lib/turn-request';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

// Only once the learner has spoken
check(cannotWriteLearnPage([]) !== null, 'no page before anyone has spoken');
check(cannotWriteLearnPage([{ who: 'npc', transcript: 'Buongiorno!' }]) !== null, 'no page when only the character has spoken');
check(cannotWriteLearnPage([{ who: 'npc', transcript: 'Buongiorno!' }, { who: 'learner', transcript: 'Un caffè' }]) === null, 'a page once the learner has spoken');

// Blank rows never reach the app
const tidy = tidyLearnPage({
  corrections: [{ said: 'x', why: 'y', right: 'z' }, { said: '', why: '', right: '' }],
  words: { things: [{ word: ' ', en: '', plural: '' }, { word: 'il banco', en: 'counter', plural: '' }], doing: [{ infinitive: '', en: '', form: '' }] },
  goodToKnow: '  ',
});
check(tidy.corrections.length === 1, 'an empty correction is dropped');
check(tidy.words.things.length === 1 && tidy.words.doing.length === 0, 'empty words are dropped');
check(tidy.goodToKnow === '', 'a blank Good to know becomes empty');

// The route exists, reads the transcript from the database, and never takes one from the app
const route = readFileSync('app/v1/learn/route.ts', 'utf8');
check(route.includes('loadConversationTurns'), 'the route reads the conversation from the database');
check(!/transcript:\s*z\./.test(route), 'the route must not accept a transcript from the app');
check(route.includes('withLearner'), 'the route needs the learner token');
check(route.includes('learnAvailable'), 'the route says when a country has no Learn prompt');

// Where the country has a Learn prompt, it fills every placeholder
if (learnAvailable()) {
  const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id))!;
  const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id)!;
  const found = parseTurnRequest({ cityId: city.id, placeId: place.id });
  check(found.ok, `${city.id}/${place.id} should find a character`);
  if (found.ok) {
    const p = buildLearnPrompt(found.character, city.name, [{ who: 'npc', transcript: 'Ciao' }, { who: 'learner', transcript: 'Ciao' }]);
    check(!/\{\w+\}/.test(p.system + p.user), 'no {placeholder} left in the Learn prompt');
    check(p.user.includes(found.character.name), "the transcript names the character");
  }
}

if (problems.length) {
  console.error(`check-learn-route: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-learn-route: ok');
