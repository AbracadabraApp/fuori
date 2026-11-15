// What is left of the leveling model v0 (lib/path.ts) and each conversation's record
// (lib/conversation-record.ts), without the database or Claude: onboarding's placement, the counts and easy/hard
// from labelled lines, a record rewritten when a conversation goes on, the stage read back from an old prompt
// version. The path itself (the stages each step played, moving up on 4 easy of 5, a support back after 2 hard)
// went with the old Beginner 2026-11-15, and its checks with it; the stages' leveling.md blocks are still read by
// experiments (tests/experiments/stages.ts), so they're still checked in each country.
import { readFileSync } from 'fs';
import { pack } from '@/content';
import { INTERMEDIATE_STEP, placement, startAt } from '@/lib/path';
import * as path from '@/lib/path';
import { STAGES, stageText } from '@/tests/experiments/stages';
import * as record from '@/lib/conversation-record';
import { countsOf, feltOf, isSaidBack, recordAction, stageInVersion, type LabelledLine } from '@/lib/conversation-record';

const failures: string[] = [];
const expect = (what: string, got: unknown, want: unknown) => { if (JSON.stringify(got) !== JSON.stringify(want)) failures.push(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

// The old path is gone from the server: no stages, no moving by counts, no path state read for a turn
expect('the step past the old path, kept with Intermediate records', INTERMEDIATE_STEP, 5);
expect('a state starts clean', startAt(5), { step: 5, atStep: 0, window: [], supportsBack: false, hardRun: 0, notHardRun: 0 });
for (const gone of ['STAGES', 'STEPS', 'stageFor', 'stageText', 'stageTag', 'decide']) expect(`lib/path.ts no longer has ${gone}`, gone in path, false);
expect('no path state is read any more', 'pathState' in record, false);
expect('a record never moves a level (the level up does, by the learner\'s choice)', /setLevel|decide\(/.test(readFileSync('lib/conversation-record.ts', 'utf8')), false);

// Placement by onboarding: fairly well → Intermediate; not yet → step 1, or step 3 in their own words
expect('fairly well', placement({ speaks: true, ownWords: true }), { level: 'intermediate', startStep: 5 });
expect('not yet, said back', placement({ speaks: false, ownWords: false }), { level: 'beginner', startStep: 1 });
expect('not yet, own words', placement({ speaks: false, ownWords: true }), { level: 'beginner', startStep: 3 });

// A conversation ended early (phone locked) and went on: its record is rewritten, once per
// conversation on the path (Josh's Elira, 2026-11-08: 18 turns, recorded at 4 and never counted)
expect('no record yet: write', recordAction(null, 4), 'write');
expect('went on after an early end: rewrite', recordAction({ learnerTurns: 4, moved: false, latest: true }, 18), 'rewrite');
expect('ended again, nothing new: keep', recordAction({ learnerTurns: 18, moved: false, latest: true }, 18), 'keep');
expect('the first record moved the level: keep', recordAction({ learnerTurns: 4, moved: true, latest: true }, 18), 'keep');
expect('a later conversation built on it: keep', recordAction({ learnerTurns: 4, moved: false, latest: false }, 18), 'keep');

// The stage in an old conversation's prompt version
expect('an old stage tag read back', stageInVersion('beginner-2026-10-29+S2+back'), { stage: 'S2', supportBack: true });
expect('no stage', stageInVersion('2026-10-21'), null);

// The stages' blocks exist and fill in this country (experiments only)
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
console.log(`[${pack.id}] OK: placement, the record's counts and how it felt, old stage tags read back; no path left on the server`);
