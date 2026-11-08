// The card lock (tests/experiments/card.mts): a card's design lines are fixed by its stamped review, a run needs
// the test designer's read afterwards, and startTest refuses an unreviewed or changed card. Fixtures first, then
// every stamped card in the real log (older cards without a stamp are left alone).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cardHash, cardSection, cardProblems, stampReviewed, reviewedHash, cardRefusal } from './experiments/card.mjs';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const card = `### T9 (2026-11-09): a fixture
- Serves: 3
- Type: moment
- Unit: x
- Variable: A: today. B: shorter
- Held constant: all else
- Measure: words
- Fact or judgment: fact
- Hypothesis: B shorter by 4
- Other outcomes: none
- Size: 2 x 5
- Time: about 3 minutes
- Reviewed: test designer, 2026-11-09: pass
- Script: tests/experiments/x.mts`;
const log = `intro\n\n${card}\n\n### T10 other\n- Serves: 1`;
const title = 'T9 (2026-11-09)';

// Stamping records the hash; changing a design line breaks it; changing a result or approval line does not
const stamped = stampReviewed(log, title);
const sec = () => cardSection(stamped, title)!;
check(reviewedHash(sec()) === cardHash(sec()), 'a stamped card matches its own hash');
check(cardProblems(sec()).length === 0, 'a freshly stamped card has no problems');
check(stampReviewed(stamped, title) === stamped, 'stamping twice changes nothing');
check(cardProblems(sec().replace('B shorter by 4', 'B shorter by 2')).some((p) => p.includes('changed since the review')), 'a changed hypothesis is caught');
check(cardProblems(sec().replace('- Size: 2 x 5', '- Size: 2 x 3')).length > 0, 'a changed size is caught');
check(cardProblems(sec().replace('about 3 minutes', 'about 3 minutes; Josh: yes')).length === 0, "Josh's yes after the review is allowed");
check(cardProblems(`${sec()}\n- Decision: keep`).length === 0, 'a decision line does not change the hash');
check(cardProblems(`${sec()}\n- Run (2026-11-09): B won`).some((p) => p.includes('Checked after')), 'a run without the test designer reading it afterwards is caught');
check(cardProblems(`${sec()}\n- Run (2026-11-09): B won\n- Checked after: test designer, 2026-11-09: result follows the rule`).length === 0, 'a run read afterwards passes');
check(cardProblems(card).length === 0, 'an unstamped (older) card is left alone');
let refused = false;
try { stampReviewed(log.replace('test designer, 2026-11-09: pass', 'pending'), title); } catch { refused = true; }
check(refused, 'a card still pending review cannot be stamped');

// The gate startTest uses: refuses an unstamped card, a card changed after its review, and a long test without Josh's yes
check(cardRefusal(log, title)?.includes('review not recorded') === true, 'an unstamped card is refused');
check(cardRefusal(stamped, title) === null, 'a stamped, unchanged card may run');
check(cardRefusal(stamped.replace('B shorter by 4', 'B shorter by 2'), title)?.includes('changed since its review') === true, 'a hypothesis changed after the review is refused');
check(cardRefusal(stamped.replace('Reviewed: test designer, 2026-11-09: pass', 'Reviewed: pending'), title)?.includes('not reviewed') === true, 'a card pending review is refused');
check(cardRefusal(stamped.replace('- Measure: words\n', ''), title)?.includes('missing Measure') === true, 'a card missing a line is refused');
check(cardRefusal(stamped, 'T99') === 'no card in docs/prompt-trials.md', 'no card: refused');
const long = stampReviewed(log.replace('about 3 minutes', 'about 8 minutes'), title);
check(cardRefusal(long, title)?.includes('needs Josh: yes') === true, 'over 5 minutes without Josh: yes is refused');
check(cardRefusal(long.replace('about 8 minutes', 'about 8 minutes; Josh: yes'), title) === null, "Josh's yes after the review lets a long test run");

// The real log: every stamped card still matches its review
const real = readFileSync(join(process.cwd(), 'docs', 'prompt-trials.md'), 'utf8').split('\n### ').slice(1);
let stampedCards = 0;
for (const s of real) {
  if (!reviewedHash(s)) continue;
  stampedCards++;
  for (const p of cardProblems(s)) problems.push(`${s.split('\n')[0].slice(0, 60)}: ${p}`);
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: a card's design lines are locked to its review, a run needs the designer's read afterwards (${stampedCards} stamped cards in the log)`);
