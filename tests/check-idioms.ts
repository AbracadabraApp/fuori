// D13 (docs/dialogue-plan.md; docs/mix.md → Idioms; Josh, 2026-11-14): an idiom at Beginner, about one visit in three:
// code picks it and the turn, the character says it, its words in English, and asks what it means; the next turn says
// whether they got it. Checks the pick, the turn, the prompt blocks, and that the idiom is saved and read back.
import { readFileSync } from 'fs';
import { cities, tutor } from '@/content';
import { idioms, beginnerWeight, pickIdiom, idiomTurn, IDIOM_TURN, usedIdiom, idiomSaidNote } from '@/lib/idioms';
import { IDIOM, setupLine, lineWithAnswers, CLUSTER_1, withIdiomFirst } from '@/lib/beginner-2';
import { exchangeTurns } from '@/lib/recording';
import { parseTurnRequest } from '@/lib/turn-request';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const all = idioms();
check(all.length >= 100 && all.every((i) => i.text && i.picture && i.meaning), `the store loads with picture and meaning (${all.length})`);
check(all.every((i) => !/^B2|^C/.test(i.level ?? '') || beginnerWeight(i) === 0), 'B2 and above are never picked at Beginner');
const first = pickIdiom('conv-a', new Set())!;
check(!!first && pickIdiom('conv-a', new Set())!.text === first.text, 'the pick is seeded by the conversation (a retried turn picks the same)');
check(pickIdiom('conv-a', new Set([first.text]))!.text !== first.text, 'an idiom the learner met lately is left out');
check(pickIdiom('conv-a', new Set(all.map((i) => i.text))) === null, 'none left: no idiom');
const visits = Array.from({ length: 300 }, (_, k) => `c${k}`);
const share = visits.filter((c) => idiomTurn(c, IDIOM_TURN)).length / visits.length;
check(share > 0.25 && share < 0.42, `about one visit in three (got ${share.toFixed(2)})`);
check(visits.every((c) => !idiomTurn(c, IDIOM_TURN + 1) && !idiomTurn(c, 0)) && !idiomTurn(null, IDIOM_TURN), 'only on its turn, and only in a saved conversation');
check(usedIdiom('Aquí tiene. Dando y dando, pajarito volando, giving and giving.', { text: 'dando y dando, pajarito volando', picture: '', meaning: '' }) && !usedIdiom('Aquí tiene su tlayuda.', { text: 'dando y dando, pajarito volando', picture: '', meaning: '' }), 'the idiom counts as said only when its words are in the line');
const line = setupLine({ ...IDIOM, vars: { idiom: first.text, picture: first.picture, meaning: first.meaning } });
check(line.includes(first.text) && line.includes(first.picture) && !line.includes('{'), 'the idiom turn names the one idiom, its picture and meaning, filled');
check((idiomSaidNote(first.text) ?? '').includes(first.text) && idiomSaidNote('not an idiom') === undefined, 'the next turn is told what it meant');

const turn = lineWithAnswers({ line: 'Cada loco con su tema, everyone has their own obsession. ¿Qué cree que quiere decir?', en: 'Everyone has their own obsession. What do you think it means?', answers: [{ text: 'Cada uno tiene su cosa.', en: 'Each has their thing.' }] }, { ...IDIOM, vars: { idiom: 'cada loco con su tema', picture: '', meaning: '' } }, CLUSTER_1);
check(turn.question?.text === 'Cada loco con su tema, ¿qué cree que quiere decir?' && turn.question?.en === 'What do you think it means?', `the printed question opens with the saying (Josh, 2026-11-14) (got ${JSON.stringify(turn.question)})`);
check(withIdiomFirst({ text: '¿Qué significa «la chancla de mamá»?', en: '' }, 'la chancla (de mamá)').text === '¿Qué significa «la chancla de mamá»?' && withIdiomFirst({ text: '¿Qué quiere decir?', en: '' }, 'al buen entendedor, pocas palabras (bastan)').text === 'Al buen entendedor, pocas palabras, ¿qué quiere decir?', 'not added twice; the bracketed words left out');
const saved = exchangeTurns({ learnerSaid: 'Sí', reply: { line: 'Dando y dando…', en: 'Giving and giving…', idiom: first.text } }, new Date().toISOString());
check((saved[1] as { idiom?: string }).idiom === first.text, 'the turn is saved with its idiom');
const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id))!;
const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id)!;
const req = parseTurnRequest({ cityId: city.id, placeId: place.id, learnerSaid: 'Sí', transcript: [{ who: 'npc', transcript: 'Hola', idiom: first.text }] });
check(req.ok && req.transcript[0].idiom === first.text, 'a request keeps the idiom on the character turn');
const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(take.includes('idiomTurn(conversationId, npcTurns)') && take.includes('recentIdioms(learnerId)') && take.includes('usedIdiom(reply.line, idiom)') && take.includes('idiomSaidNote(lastNpc.idiom)'), 'the turn picks the idiom, saves it when said, and the next turn follows it up');
check(readFileSync('lib/recording.ts', 'utf8').includes('...(t.idiom ? { idiom: t.idiom } : {})') && /hard, idiom \}\) =>/.test(readFileSync('app/v1/turn/route.ts', 'utf8')), 'loading a conversation reads the idiom back, and /v1/turn passes it on');

if (problems.length) { console.error(`check-idioms: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log(`OK: an idiom about one visit in three (${share.toFixed(2)}), picked by code, said, saved and followed up`);
