# Test ideas

A running list of tests to run, kept by whichever Claude session is testing (Josh, 2026-10-17: "I don't want to be the bottleneck"; Claude designs and runs the tests, Josh adds ideas). Results go in [level-judge-test.md](level-judge-test.md); this file is only the queue. Tests never change production: experiments run through `--level` and scratch scripts until Josh decides.

How to work it: take the top item, run it, write the result in the test log, move the item to Done with one line and the commit, add any new ideas it raised. Reorder when a result changes what matters most.

## Up next

1. **Reply buttons, separate call** (running, round 7). A "clicks" prompt writes two whole-line replies on one frame after each character line; Haiku vs Sonnet; judged for sensible, same frame, beginner-readable, distinct, English right, correct, and ready before the character's voice ends. On round 6's "sometimes ask" conversations, both countries.
2. **Tap and answer.** Simulated learner at levels 1–3 who only taps one of the two replies; the character answers it as a normal turn. Does the character recast a line that was already right, go flat, or loop on the same frame? Needs a learner mode in `test:conversations`.
3. **Replies folded into the turn** (the other option in beginner-scaffolding.md → Writing the replies): the character's call returns the two replies too. Compare against item 1 for quality, the character's liveliness and reply time.
4. **"Ripeti?" on levels 4–5.** Replay is gone, so asking the character to repeat must work: is the repeat shorter, slower-sounding and simpler, or word for word, or a new sentence? Simulated learner asks now and then; judge the repeat.
5. **Mexico at 20 conversations** for the final Beginner pick against today's prompt, since 5 conversations wobble 6–10 points.
6. **Why Italy is flat.** Alive is about 5 in Italy for every prompt, today's included, against about 7 in Mexico. Separate the causes: the characters (swap a Mexico character's data style into Italy), Josh's replayed lines (simulated learners in Italy), or the judge (score the same lines translated).
7. **Does the alive judge mark down questions?** (running, round 8) Score the same conversations with the closing questions removed: from every character line, and from the last line only (which the learner never answers, so removing it leaves nothing unanswered).

## Later

- **Haiku for characters**, with a stronger level block in the newest message; speed is the other goal (1.6 s against about 3.4 s).
- **Question ladder for Intermediate and Advanced**: level blocks that get one-fact and open questions, measured with the question-kind count (`qtype.mjs`).
- **Learner-level evidence**: from saved conversations, does the scorecard's "lost" count plus Magda's Level line rank learners the way Josh would?
- **Frames chosen by the learner's Diario** rather than by the moment: give the clicks prompt the frames being practised; does it still sound natural?

## Done

- Rounds 1–4 (2026-10-16/17): level judge; Beginner prompt "still you". Round 5–6 (2026-10-17): questions; "still you, sometimes ask". See the test log.
