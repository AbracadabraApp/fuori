// Beginner level dialogue (lib/beginner.ts): the line and English come from the
// parts in order, empty parts are dropped, and the prompt fills every
// placeholder with the character, the place and the conversation. No API calls.
import { lineFromParts, tidyParts, buildBeginnerPrompt, withoutNames, PartsWatcher, type Part } from '@/lib/beginner';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

const parts: Part[] = [
  { kind: 'english', text: 'Welcome to the market!', en: '' },
  { kind: 'word', text: 'il pesce', en: 'the fish', gloss: 'fish' },
  { kind: 'question', text: 'Le piace il pesce?', en: 'Do you like fish?', gloss: 'do you like it?' },
  { kind: 'word', text: 'Ciao!', en: 'Hi!', gloss: '' },
  { kind: 'answer', text: ' Mi piace il pesce. ', en: 'I like fish.' },
  { kind: 'answer', text: '  ', en: '' },
];
const tidy = tidyParts(parts);
check('empty parts dropped', tidy.length === 5, tidy.length);
check('parts trimmed', tidy[4].text === 'Mi piace il pesce.', tidy[4].text);
const { line, en } = lineFromParts(tidy);
check('line is what she says, in order: each phrase then its gloss (none when empty); no answers', line === 'Welcome to the market! il pesce fish Le piace il pesce? do you like it? Ciao!', line);
check('a gloss loses the name', tidyParts([{ kind: 'word', text: 'Piacere, Joshua!', en: 'Nice to meet you, Joshua!', gloss: 'nice to meet you, Joshua' }])[0].gloss === 'nice to meet you', tidyParts([{ kind: 'word', text: 'Piacere, Joshua!', en: 'Nice to meet you, Joshua!', gloss: 'nice to meet you, Joshua' }])[0].gloss);
check('en is the English of what she says', en === 'Welcome to the market! the fish Do you like fish? Hi!', en);

// Streamed: the first parts start the voice, and are exactly how the line begins
const streamed: Part[] = [
  { kind: 'english', text: 'Welcome to the market, the oldest in town!', en: '', gloss: '' },
  { kind: 'word', text: 'Il pesce è freschissimo.', en: 'The fish is very fresh.', gloss: 'very fresh fish' },
  { kind: 'question', text: 'Che cosa desidera?', en: 'What would you like?', gloss: 'what would you like?' },
  { kind: 'answer', text: 'Vorrei il pesce.', en: 'I would like the fish.', gloss: '' },
];
const json = JSON.stringify({ parts: streamed });
let firstSaid: string | undefined;
let firstParts: Part[] = [];
const pw = new PartsWatcher((f, ps) => { if (firstSaid === undefined) { firstSaid = f; firstParts = ps; } });
for (let n = 1; n <= json.length; n++) pw.feed(json.slice(0, n));
const whole = lineFromParts(tidyParts(streamed)).line;
check('streamed: a first piece is sent', firstSaid !== undefined);
check('streamed: the line starts with it', !!firstSaid && whole.startsWith(firstSaid), `${firstSaid} | ${whole}`);
check('streamed: it stops before the question', !!firstSaid && !firstSaid.includes('Che cosa'), firstSaid);
check('streamed: its parts come with it, and say exactly it', firstParts.length > 0 && lineFromParts(firstParts).line + ' ' === firstSaid, firstParts.map((p) => p.kind));

// Unicode escapes the model leaves in its text are decoded
const escaped = tidyParts([{ kind: 'question', text: '\\u00bfPaga en efectivo?', en: 'Cash?', gloss: 'cash?' }, { kind: 'word', text: 'Que tenga un lindo d\\u00eda.', en: 'Have a nice day.', gloss: '' }]);
check('escapes decoded', escaped[0].text === '¿Paga en efectivo?' && escaped[1].text === 'Que tenga un lindo día.', escaped.map((p) => p.text));

// One question a turn: the last kept, the others dropped
const two = tidyParts([
  { kind: 'question', text: 'Prende un caffè?', en: 'Having a coffee?', gloss: 'coffee?' },
  { kind: 'question', text: 'Vuole un caffè o un cappuccino?', en: 'Coffee or cappuccino?', gloss: 'coffee or cappuccino?' },
  { kind: 'answer', text: 'Un caffè, grazie.', en: 'A coffee, thanks.' },
]);
check('two questions: only the last kept', two.filter((p) => p.kind === 'question').map((p) => p.text).join('|') === 'Vuole un caffè o un cappuccino?', two.map((p) => p.text));

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
