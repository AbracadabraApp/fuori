// Beginner level dialogue (lib/beginner.ts): the line and English come from the
// parts in order, empty parts are dropped, and the prompt fills every
// placeholder with the character, the place and the conversation. No API calls.
import { lineFromParts, tidyParts, buildBeginnerPrompt, withoutNames, type Part } from '@/lib/beginner';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

const parts: Part[] = [
  { kind: 'english', text: 'Welcome to the market!', en: '' },
  { kind: 'word', text: 'il pesce', en: 'the fish' },
  { kind: 'question', text: 'Le piace il pesce?', en: 'Do you like fish?' },
  { kind: 'answer', text: ' Mi piace il pesce. ', en: 'I like fish.' },
  { kind: 'answer', text: '  ', en: '' },
];
const tidy = tidyParts(parts);
check('empty parts dropped', tidy.length === 4, tidy.length);
check('parts trimmed', tidy[3].text === 'Mi piace il pesce.', tidy[3].text);
const { line, en } = lineFromParts(tidy);
check('line is what she says, in order: a word or the question, then its English; no answers', line === 'Welcome to the market! il pesce the fish Le piace il pesce? Do you like fish?', line);
check('en is the English of what she says', en === 'Welcome to the market! the fish Do you like fish?', en);

// Names are said once, in the language: not again in the English after it
check('vocative at the end', withoutNames('Nice to meet you, Joshua!', 'Piacere, Joshua!') === 'Nice to meet you!', withoutNames('Nice to meet you, Joshua!', 'Piacere, Joshua!'));
check('vocative at the start', withoutNames('Joshua, do you like Italian music?', 'Joshua, ti piace la musica italiana?') === 'Do you like Italian music?', withoutNames('Joshua, do you like Italian music?', 'Joshua, ti piace la musica italiana?'));
check('mid-sentence vocative', withoutNames('What would you like, Joshua?', 'Che cosa desidera, Joshua?') === 'What would you like?', withoutNames('What would you like, Joshua?', 'Che cosa desidera, Joshua?'));
check('other capitals kept', withoutNames('I would like a Nutella cone.', 'Vorrei un cono alla Nutella.') === 'I would like a Nutella cone.', withoutNames('I would like a Nutella cone.', 'Vorrei un cono alla Nutella.'));
check('a place name kept', withoutNames('London! What a beautiful city.', 'Londra! Che bella città.') === 'London! What a beautiful city.', withoutNames('London! What a beautiful city.', 'Londra! Che bella città.'));

const city = cities.find((c) => c.places.some((p) => p.characterId && characterForPlace(c, p)?.origin === 'generated'))!;
const place = city.places.find((p) => p.characterId && characterForPlace(city, p)?.origin === 'generated')!;
const character = characterForPlace(city, place)!;
const prompt = buildBeginnerPrompt({ character, transcript: [{ who: 'npc', transcript: 'Ciao!' }, { who: 'learner', transcript: 'Ciao' }, { who: 'learner', transcript: 'Vorrei' }], learnerSaid: 'un caffè' });
check('no placeholder left', !/\{[a-z]+\}/.test(prompt.system), prompt.system.match(/\{[a-z]+\}/g));
check('the character is named', prompt.system.includes(character.name));
check('the place is named', prompt.system.includes(place.name));
check('messages alternate, starting with the person', prompt.messages[0].role === 'user' && prompt.messages.every((m, i) => i === 0 || m.role !== prompt.messages[i - 1].role), prompt.messages.map((m) => m.role));
check('two learner lines in a row become one message', prompt.messages[2].content === 'Ciao\nVorrei\nun caffè', prompt.messages[2]?.content);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: Beginner dialogue parts make the line, the prompt fills (${pack.id})`);
