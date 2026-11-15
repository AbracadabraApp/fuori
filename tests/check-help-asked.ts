// D12 (docs/dialogue-plan.md; docs/bugs.md B13): once the learner asks for help or says it's hard, every later
// turn of the visit carries dialogue.md's Help asked note. Nunzio (67edfe03) kept it simple for two turns after
// "io non posso capire tutto", then went back to new words with no English. The connection is checked end to end
// without Claude: the reply's hard flag is saved on the character's turn, read back from a request, and the note
// reaches the turn on every ordinary path (Intermediate, Beginner steps 1-3, Beginner steps 4-6).
import { readFileSync } from 'fs';
import { cities, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { exchangeTurns } from '@/lib/recording';
import { parseTurnRequest } from '@/lib/turn-request';
import { helpNote } from '@/lib/dialogue/rules';
import { buildBeginnerPrompt } from '@/lib/beginner';
import { hardField, turnOutputWithDoneJsonSchema, turnOutputWithAnswersJsonSchema } from '@/lib/prompts/turn-output-schema';
import { partsWithDoneJsonSchema } from '@/lib/beginner';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(helpNote().length > 40 && !helpNote().includes('{'), 'dialogue.md has a filled Help asked note');
for (const [name, s] of [['ordinary', turnOutputWithDoneJsonSchema], ['answers', turnOutputWithAnswersJsonSchema], ['parts', partsWithDoneJsonSchema]] as const) {
  check((s.properties as Record<string, unknown>).hard === hardField && (s.required as string[]).includes('hard'), `the ${name} reply asks whether they asked for help`);
}

const saved = exchangeTurns({ learnerSaid: 'Non capisco tutto, più facile per favore', reply: { line: 'Va bene, parlo più semplice.', en: 'All right.', hard: true } }, new Date().toISOString());
check((saved[1] as { hard?: boolean }).hard === true, 'a reply to a learner asking for help is saved with hard');
const plain = exchangeTurns({ learnerSaid: 'Sì', reply: { line: 'Bene.', en: 'Good.' } }, new Date().toISOString());
check(!('hard' in plain[1]), 'an ordinary reply is saved without hard');

const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id))!;
const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id)!;
const req = parseTurnRequest({ cityId: city.id, placeId: place.id, learnerSaid: 'Sì', transcript: [{ who: 'npc', transcript: 'Ciao', hard: true }] });
check(req.ok && req.transcript[0].hard === true, 'a request keeps hard on the character turn');

const ch = characterForPlace(city, place)!;
const built = buildBeginnerPrompt({ character: ch, transcript: [{ who: 'npc', transcript: 'Hola.', hard: true }], learnerSaid: 'Sí', turnNote: 'SETUP', help: helpNote() });
check(built.messages[built.messages.length - 1].content.endsWith(`(${helpNote()} SETUP)`), 'the Beginner turn says the help note next to the latest message, before the setup');

const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/transcript\.some\(\(t\) => t\.who === 'npc' && t\.hard\) \? helpNote\(\)/.test(take), 'the turn looks for a character turn saved with hard');
check((take.match(/help: helped/g) ?? []).length === 3, 'the help note goes to all three ordinary paths (Intermediate, Beginner steps 1-3, steps 4-6)');
check(readFileSync('lib/recording.ts', 'utf8').includes("...(t.hard ? { hard: true } : {})"), 'loading a conversation reads hard back');
check(/offered, hard[,}]/.test(readFileSync('app/v1/turn/route.ts', 'utf8')), '/v1/turn passes hard from the stored transcript');
check(/buildTurnPrompt\(\{ \.\.\.params, note: \[params\.help, params\.note\]/.test(readFileSync('lib/turn.ts', 'utf8')), 'runTurn says the help note with the turn note');

if (problems.length) { console.error(`check-help-asked: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log('OK: asking for help is saved with the reply, read back, and the Help asked note reaches every later ordinary turn');
