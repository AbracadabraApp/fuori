// Checks for the leveling prototype's own logic, no model calls: the record,
// the controllers' moves, and that every prompt block the ladder names exists
// and fills (run for each country).
//   npx tsx tests/experiments/leveling/check.mts   (COUNTRY=es-mx for Mexico)
import { pack, language } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { decide, nextConversation, startAt, type Design, type LadderState } from './controllers';
import { LADDER, STAGES, TOP, type SpeakingVerdict } from './ladder';
import { feltLike, isSaidBack, recordOf, type LearnerTurn } from './record';

const failures: string[] = [];
const ok = (cond: boolean, what: string) => { if (!cond) failures.push(what); };

// Said back: the offered answer, near enough; a frame matches whatever fills the blank
ok(isSaidBack('Vorrei un caffè, per favore', ['Vorrei un caffè, per favore.', 'Un tè, grazie.']), 'exact answer is said back');
ok(isSaidBack('vorrei un caffe per favore', ['Vorrei un caffè, per favore.']), 'accents and punctuation ignored');
ok(isSaidBack('Mi chiamo Sam', ['Mi chiamo …']), 'a frame with its blank filled is said back');
ok(!isSaidBack('Ieri sono andato al mercato con mia sorella', ['Mi chiamo …']), 'own words are not said back');
ok(!isSaidBack('Sì', ['Sì, grazie, molto buono oggi']), 'a short own answer is not a say-back of a long one');

const turn = (said: string, extra: Partial<LearnerTurn> = {}): LearnerTurn => ({ said, lang: said ? 'target' : 'none', help: false, offered: [], ...extra });
const easy = recordOf([turn('uno due tre'), turn('quattro cinque'), turn('sei sette'), turn('otto nove'), turn('dieci'), turn('undici')]);
const hard = recordOf([turn('what?', { lang: 'english' }), turn('sorry', { lang: 'english', help: true }), turn(''), turn('again?', { help: true }), turn('help', { help: true }), turn('')]);
ok(easy.counted && easy.ownWords === 6, 'six own-words turns are counted');
ok(hard.helpAsks === 3 && hard.silent === 2 && hard.english === 2, 'hard record counts');
ok(feltLike(hard).felt === 'hard', 'lost on most turns is hard');
// One-word help asks are learning, not struggle: four own turns and two "what's panna?" is easy
const wordHelp = recordOf([turn('uno due'), turn('cosa è panna?', { help: true, helpKind: 'word' }), turn('tre quattro'), turn('cinque'), turn('che vuol dire contanti?', { help: true, helpKind: 'word' }), turn('sei sette')]);
ok(feltLike(wordHelp).felt === 'easy', `one-word help asks don't make it hard (got ${feltLike(wordHelp).felt}: ${feltLike(wordHelp).why})`);
ok(easy.words === 11 && easy.wordsOwn === 11 && easy.wordsTarget === 11, 'words spoken counted');

function play(design: Design, start: number, records: ReturnType<typeof recordOf>[], verdicts: SpeakingVerdict[] = []): { steps: number[]; states: LadderState[] } {
  let s = startAt(start);
  const steps: number[] = [], states: LadderState[] = [];
  records.forEach((r, i) => { s = decide(design, s, r, design === 'A' ? undefined : verdicts[i] ?? 'A2').next; steps.push(s.step); states.push(s); });
  return { steps, states };
}

// A: 4 easy of the last 5 counted moves up, and the window starts again after a move
const a = play('A', 1, [easy, easy, easy, easy, easy, easy, easy, easy]);
ok(a.steps[3] === 2 && a.steps[7] === 3, `A moves after 4 easy, then 4 more (got ${a.steps.join(',')})`);
// Never past the top, never down
ok(play('A', TOP, Array(10).fill(easy)).steps.every((x) => x === TOP), 'A stays at the top');
ok(play('A', 2, Array(10).fill(hard)).steps.every((x) => x === 2), 'hard conversations never move the label down');
// Supports back after 2 hard in a row; off again after 2 not hard
const back = play('A', 2, [hard, hard, easy, easy]).states;
ok(!back[0].supportsBack && back[1].supportsBack && back[2].supportsBack && !back[3].supportsBack, `supports back on after 2 hard, off after 2 not hard (got ${back.map((x) => x.supportsBack).join(',')})`);
ok(nextConversation(back[1]).supports.answers === STAGES['1'].supports.answers, 'support back at step 2 gives stage 1 supports');
// B: within Beginner it moves like A; into Intermediate the speaking judge must agree
const b = play('B', TOP - 1, Array(8).fill(easy), Array(8).fill('A1'));
ok(b.steps.every((x) => x === TOP - 1), `B holds at the last Beginner step when the judge says A1 (got ${b.steps.join(',')})`);
const bOk = play('B', TOP - 1, Array(4).fill(easy), ['A2', 'B1', 'A2', 'A2']);
ok(bOk.steps[3] === TOP, 'B moves into Intermediate when counts and judge agree');
const bUnsure = play('B', TOP - 1, Array(6).fill(easy), ['not enough to tell', 'A2', 'not enough to tell', 'A2', 'A2', 'A2']);
ok(bUnsure.steps[4] === TOP - 1 && bUnsure.steps[5] === TOP, `"not enough to tell" doesn't count either way (got ${bUnsure.steps.join(',')})`);
ok(play('B', 1, Array(4).fill(easy), Array(4).fill('pre-A1')).steps[3] === 2, 'B moves within Beginner on counts alone');
// Josh's pattern: the step plays its stages in turn
const pattern = LADDER[1].pattern.map((_, k) => nextConversation({ ...startAt(2), atStep: k }).stage.id);
ok(pattern.join(',') === '1,2,1,1,2', `step 2 plays 1,2,1,1,2 (got ${pattern.join(',')})`);

// Every block the ladder and harness name exists and fills, in this country
const f = readPromptFile('leveling.md');
for (const b of ['Talk: stage 1', 'Talk: stage 2', 'Talk: stage 3', 'Talk: support back', 'Language: 1', 'Language: 2', 'Language: 3', 'Language: 4', 'Answers: two', 'Answers: one', 'Answers: frame', 'Echo: new words', 'Echo: off', 'Say it again', 'Line check', 'Speaking judge', 'Speaking examples']) {
  try {
    const text = fill(f.block(b), { language: language.name, role: 'barista', line: 'x', talk: 'x', record: 'x', conversation: 'x', examples: 'x', n: '5', minOwn: '5' });
    ok(!/\{\w+\}/.test(text), `${b}: unfilled placeholder`);
  } catch (e) { failures.push(String(e)); }
}
for (const s of Object.values(STAGES)) for (const name of [s.talk, s.talkSupportBack].filter((x): x is string => !!x)) {
  try { (s.path === 'beginner' ? f : readPromptFile('levels.md')).block(name); } catch (e) { failures.push(String(e)); }
}

if (failures.length) { console.error(`[${pack.id}] FAIL\n${failures.join('\n')}`); process.exit(1); }
console.log(`[${pack.id}] OK: record, controllers A/B, ladder pattern and prompt blocks`);
