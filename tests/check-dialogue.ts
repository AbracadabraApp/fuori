// The shared dialogue layer (lib/dialogue; docs/dialogue-model.md → How the code
// is organised): the rules in content/<country>/prompts/dialogue.md reach every
// kind of conversation's prompt, and the said-back check reads real lines from
// play the right way. Would have caught Magda coaching Jennifer's misheard
// "¿Owen me ayuda?" (2026-11-04). No API calls.
import { buildBeginnerPrompt } from '@/lib/beginner';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { readPromptFile } from '@/lib/prompts/template';
import { readHeard } from '@/lib/dialogue/heard';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

// Said back: close counts (speech-to-text bends words); a different sentence doesn't
const heard: [string, string[], 'said-back' | 'other' | null][] = [
  ['¿Owen me ayuda?', ['Joven, ¿me ayuda?'], 'said-back'],
  ['Si, vorrei la ribaletta.', ['Sì, vorrei la ribollita.'], 'said-back'],
  ['Sono di Seattle', ['Sono di …'], 'said-back'],
  ['Estoy un poco cansado.', ['Estoy un poco cansado.'], 'said-back'],
  ['Estoy en el barco de canzart.', ['Estoy un poco cansado.'], 'other'],
  ['Vorrei un caffè', ['Un cappuccino, per favore.'], 'other'],
  ['Vorrei un caffè', [], null],
];
for (const [said, offered, want] of heard) check(`heard "${said}" against ${JSON.stringify(offered)} is ${want}`, readHeard(said, offered) === want, readHeard(said, offered));

// The shared rules are in every kind's prompt
const rules = readPromptFile('dialogue.md').block('Every conversation');
const city = cities.find((c) => c.places.some((pl) => pl.characterId && c.characters?.some((x) => x.id === pl.characterId)))!;
const place = city.places.find((pl) => pl.characterId && city.characters?.some((x) => x.id === pl.characterId))!;
const character = characterForPlace(city, place)!;
const flow = readPromptFile('lesson-flow.md');
const culture = readPromptFile('culture.md');
const kinds: [string, string][] = [
  ['town, Beginner', buildBeginnerPrompt({ character, transcript: [] }).system],
  ['Magda, Beginner lesson', buildBeginnerPrompt({ character, transcript: [], stageText: flow.block('Teach') }).system],
  ['cultural story, Beginner', buildBeginnerPrompt({ character, transcript: [], stageText: culture.block('Story') }).system],
  ['welcome', buildBeginnerPrompt({ character, transcript: [], stageText: readPromptFile('welcome.md').block('Brief') }).system],
  ['town, Intermediate', buildTurnPrompt({ character, transcript: [] }).system],
  ['Magda, Intermediate lesson', buildTurnPrompt({ character, transcript: [], brief: flow.block('Teach, speaking') }).system],
  ['cultural story, Intermediate', buildTurnPrompt({ character, transcript: [], brief: culture.block('Story: speaking') }).system],
  ['Magda at her school', buildTurnPrompt({ character, transcript: [], system: 'You are Magda.' }).system],
];
for (const [kind, system] of kinds) check(`${kind}: the shared dialogue rules are in the prompt`, system.includes(rules));

// The said-back note follows the learner's line when she offered answers
const msgs = buildBeginnerPrompt({
  character,
  transcript: [{ who: 'npc', transcript: 'Joven, ¿me ayuda? young man, can you help me?', offered: ['Joven, ¿me ayuda?'] }],
  learnerSaid: '¿Owen me ayuda?',
}).messages;
const last = msgs[msgs.length - 1].content;
check('the note says they said it back', last.startsWith('¿Owen me ayuda?') && last.includes(readPromptFile('dialogue.md').block('Heard: said back')), last);
const none = buildBeginnerPrompt({ character, transcript: [{ who: 'npc', transcript: 'Ciao!' }], learnerSaid: 'Ciao' }).messages;
check('no note when nothing was offered', none[none.length - 1].content === 'Ciao', none[none.length - 1].content);

if (problems.length) {
  console.error(`FAIL (${pack.id}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK (${pack.id}): the said-back check reads ${heard.length} real lines right, the shared dialogue rules are in all ${kinds.length} kinds' prompts, and the said-back note follows the learner's line`);
