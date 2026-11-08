// C12's place-vocabulary count (tests/conversations/measure.ts): distinct words per conversation, accents and case
// ignored, a word tagged both ways counts as from the line, and the labels the report uses. No Claude calls: the judge
// that lists and tags the words is run in the pilot and its tags are read by hand.
import { vocabCounts, label, show, type VocabWord } from './conversations/measure';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const w = (word: string, source: 'line' | 'own'): VocabWord => ({ word, source, said: '' });

const c = vocabCounts([w('cazuela', 'line'), w('Cazuela', 'line'), w('bruñir', 'own'), w('esquites', 'own'), w('Esquítes', 'own'), w('piloncillo', 'line')]);
check(c.own === 2 && c.line === 2, `distinct words, accents and case ignored (own ${c.own}, line ${c.line})`);
const both = vocabCounts([w('tejuino', 'own'), w('tejuino', 'line')]);
check(both.own === 0 && both.line === 1, 'a word tagged both ways counts once, as from the line');
const none = vocabCounts([]);
check(none.own === 0 && none.line === 0, 'no words: zero, zero');
check(vocabCounts([w(' ', 'own')]).own === 0, 'a blank word is not counted');
check(label('vocabOwn') === 'Place words, her own' && label('vocabLine') === 'Place words, from the line', 'the report labels both counts');
check(show('vocabOwn', 3.456) === '3.5' && show('vocabLine', null) === '–', 'the report shows one decimal, or a dash');
check(label('repeats').length > 0 && label('culture') === 'Culture (one reader)', 'the other labels still work');

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('OK: place vocabulary counts distinct words, splits line from her own, and reports both');
