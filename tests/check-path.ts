// The leveling model v0 (lib/path.ts) and each conversation's record
// (lib/conversation-record.ts), without the database or Claude: the stages
// each step plays, moving up on 4 easy of the last 5 counted, a support back
// after 2 hard, the step never down; the counts and easy/hard from labelled
// lines; the stage read back from a prompt version. Run for each country (the
// leveling.md blocks must exist in both).
import { pack } from '@/content';
import { decide, INTERMEDIATE_STEP, placement, STAGES, STEPS, stageFor, stageTag, stageText, startAt, type PathState } from '@/lib/path';
import { countsOf, feltOf, isSaidBack, stageInVersion, type LabelledLine } from '@/lib/conversation-record';

const failures: string[] = [];
const expect = (what: string, got: unknown, want: unknown) => { if (JSON.stringify(got) !== JSON.stringify(want)) failures.push(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

// Josh's fading plan within the steps, then S4
expect('step 1 plays S1 five times', STEPS[0], ['S1', 'S1', 'S1', 'S1', 'S1']);
expect('step 2 plays 1,2,1,1,2', [0, 1, 2, 3, 4].map((k) => stageFor({ ...startAt(2), atStep: k }).stage.id), ['S1', 'S2', 'S1', 'S1', 'S2']);
expect('step 3 plays 2,2,2,3,3', [0, 1, 2, 3, 4].map((k) => stageFor({ ...startAt(3), atStep: k }).stage.id), ['S2', 'S2', 'S2', 'S3', 'S3']);
expect('step 4 is the character prompt with a Beginner block', [stageFor(startAt(4)).stage.path, stageFor(startAt(4)).stage.level], ['character', 'Beginner: still you, ask']);
expect('past step 4 is Intermediate', INTERMEDIATE_STEP, 5);

// Moving up, supports back, never down
const play = (start: PathState, felts: ('easy' | 'hard' | 'neither')[], counted = true) => felts.reduce<{ s: PathState; steps: number[] }>((a, f) => { const s = decide(a.s, f, counted).next; return { s, steps: [...a.steps, s.step] }; }, { s: start, steps: [] });
expect('up after 4 easy', play(startAt(1), ['easy', 'easy', 'easy', 'easy']).steps, [1, 1, 1, 2]);
expect('4 of the last 5', play(startAt(1), ['easy', 'hard', 'easy', 'easy', 'easy']).steps, [1, 1, 1, 1, 2]);
expect('not counted: no move', play(startAt(1), ['easy', 'easy', 'easy', 'easy', 'easy'], false).steps, [1, 1, 1, 1, 1]);
expect('never down', play(startAt(3), Array(6).fill('hard')).steps, [3, 3, 3, 3, 3, 3]);
expect('to Intermediate from step 4', play(startAt(4), ['easy', 'easy', 'easy', 'easy']).steps, [4, 4, 4, 5]);
const back = play(startAt(3), ['hard', 'hard']).s;
expect('a support back after 2 hard', back.supportsBack, true);
expect('with a support back, S2 plays S1', stageFor({ ...back, atStep: 1 }).stage.id, 'S1');
expect('with a support back, S1 adds the support-back talk', stageFor({ ...startAt(1), supportsBack: true }).stage.blocks.includes('Talk: support back'), true);
expect('the support goes after 2 not hard', play(back, ['neither', 'neither']).s.supportsBack, false);

// Placement by onboarding: fairly well → Intermediate; not yet → step 1, or step 3 in their own words
expect('fairly well', placement({ speaks: true, ownWords: true }), { level: 'intermediate', startStep: 5 });
expect('not yet, said back', placement({ speaks: false, ownWords: false }), { level: 'beginner', startStep: 1 });
expect('not yet, own words', placement({ speaks: false, ownWords: true }), { level: 'beginner', startStep: 3 });

// The stage in the prompt version, both ways
expect('stage tag read back', stageInVersion(`beginner-2026-10-29${stageTag(STAGES.S2, true)}`), { stage: 'S2', supportBack: true });
expect('no stage', stageInVersion('2026-10-21'), null);

// The blocks exist and fill in this country
for (const s of Object.values(STAGES)) {
  try { if (/\{\w+\}/.test(stageText(s, 'barista'))) failures.push(`${s.id}: unfilled placeholder`); } catch (e) { failures.push(`${s.id}: ${e}`); }
}

// Counts and easy/hard from labelled lines
const line = (said: string, extra: Partial<LabelledLine> = {}): LabelledLine => ({ said, lang: 'language', help: 'none', offered: [], ...extra });
expect('said back', isSaidBack('vorrei un caffe per favore', ['Vorrei un caffè, per favore.']), true);
const c = countsOf([
  line('Vorrei un caffè, per favore', { offered: ['Vorrei un caffè, per favore.'] }),
  line('Sono di Boston e abito qui'),
  line('What does panna mean?', { lang: 'english', help: 'word' }),
  line('Sorry, I did not understand', { lang: 'english', help: 'whole' }),
  line('I want to sit outside', { lang: 'english' }),
  line('Grazie mille, a domani'),
]);
expect('counts', [c.learnerTurns, c.saidBack, c.ownTurns, c.helpWord, c.helpWhole, c.english], [6, 1, 2, 1, 1, 1]);
expect('words', [c.words, c.wordsLanguage, c.wordsOwn], [29, 15, 10]);
expect('2 lost of 6 is not hard', feltOf(c).felt, 'neither');
const easy = countsOf([line('Uno due tre'), line('cosa è panna?', { help: 'word' }), line('quattro cinque'), line('sei'), line('che vuol dire contanti?', { help: 'word' }), line('sette otto')]);
expect('one-word help asks are learning: easy', feltOf(easy).felt, 'easy');
const hard = countsOf([line('What?', { lang: 'english', help: 'whole' }), line('I like it', { lang: 'english' }), line('Again please', { lang: 'english', help: 'whole' }), line('Sì')]);
expect('lost on 3 of 4 is hard', feltOf(hard).felt, 'hard');

if (failures.length) { console.error(`[${pack.id}] FAIL\n${failures.join('\n')}`); process.exit(1); }
console.log(`[${pack.id}] OK: the path's steps and stages, moving up, supports back, the record's counts`);
