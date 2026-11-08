// The counts shared by real play's scorecard and the conversation test
// (lib/dialogue-stats.ts; Josh, 2026-11-08: one set of measures): the learner's
// share and words per line, and repeats from an earlier visit. A sentence said
// again counts; the same topic in new words, or a short greeting, doesn't.
import { learnerStats, repeatsFromEarlier } from '@/lib/dialogue-stats';
import { scoreConversation, type Judge } from '@/lib/quality';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const l = learnerStats([{ who: 'npc', text: 'uno dos tres cuatro cinco seis' }, { who: 'learner', text: 'uno dos' }, { who: 'npc', text: 'uno dos' }, { who: 'learner', text: 'uno dos tres cuatro' }]);
check(l.share === 0.43 && l.wordsPerLine === 3, `learner share and words per line (got ${JSON.stringify(l)})`);

const earlier = ['¡Buenas tardes! Yo nací aquí, cuando San Miguel era un pueblito tranquilo, y este atardecer no se me ha hecho viejo nunca.'];
const replay = repeatsFromEarlier(earlier, ['¡Buenas tardes! Yo nací aquí, cuando San Miguel era un pueblito muy tranquilo.']);
check(replay.length === 1, `the same story told again counts (got ${replay.length})`);
check(repeatsFromEarlier(earlier, ['¡Buenas tardes! ¿Fue por fin a ver los churros que le dije la otra vez?']).length === 0, 'a greeting and a new sentence on an old topic don\'t count');
check(repeatsFromEarlier([], ['Yo nací aquí, cuando San Miguel era un pueblito tranquilo.']).length === 0, 'no earlier visit, nothing to repeat');

const judge: Judge = async () => ({ pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, incoherent: 0, alive: 7, note: 'None' });
const character = { name: 'Don Ramón', age: 74, role: 'jubilado', city: 'San Miguel de Allende' };
const turns = [{ who: 'npc' as const, text: 'Yo nací aquí, cuando San Miguel era un pueblito tranquilo.' }, { who: 'learner' as const, text: 'Qué bonito.' }];
async function main() {
const first = await scoreConversation(character, turns, judge);
const again = await scoreConversation(character, turns, judge, { earlier });
check(first.repeats === undefined && !!first.learner, 'a first visit is scored with learner counts and no repeats count');
check(again.repeats?.length === 1, `a return visit carries its repeats (got ${again.repeats?.length})`);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: learner share, learner words per line and repeats from earlier visits are counted and saved with the score');
}
main();
