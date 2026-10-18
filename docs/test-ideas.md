# Test ideas

A running list of tests to run, kept by whichever Claude session is testing (Josh, 2026-10-17: "I don't want to be the bottleneck"; Claude designs and runs the tests, Josh adds ideas). Results go in [level-judge-test.md](level-judge-test.md); this file is only the queue. Tests never change production: experiments run through `--level` and scratch scripts until Josh decides.

How to work it: take the top item, run it, write the result in the test log, move the item to Done with one line and the commit, add any new ideas it raised. Reorder when a result changes what matters most.

## Up next

1. **Live with lookahead** (from round 11). While the character speaks: write the two replies, then the character's answer to each, in parallel, so a tap gets an instant answer with no shared joins. Measure whether it's ready in time, and the cost (two turns per turn).
2. **A plan for the visit.** One short call at the start writes an arc (arrive → order → small talk → leave) that live turns follow: the script's shape without its joins, and less of the order form ("Vuoi X o Y?" on 43% of Italy's turns, round 9).
3. **"Ripeti?" on levels 4–5.** Replay is gone, so asking the character to repeat must work: is the repeat shorter, slower-sounding and simpler, or word for word, or a new sentence? Simulated learner asks now and then; judge the repeat.
4. **Level check after the first conversations, built behind a setting** (from round 14): at the end of each of a learner's first 3 conversations, the level judge reads onboarding and the conversations and updates `learners.level`; off by default. Then the same on real conversations: rerun it on saved ones and compare with what Josh would say.
5. **Mexico at 20 conversations** for the final Beginner pick against today's prompt, since 5 conversations wobble 6–10 points.
6. **Characters feel flat in both countries** (alive Italy 5.0, Mexico 6.8 on the shared judge, target 7). Plan and order in the roadmap → 2, "Characters alive and on level": level on the scorecard (done), real conversations sorted by problem, a concrete detail per character, then the prompt change, one at a time through the replay gate.
7. **Replies folded into the turn** (the other option in beginner-scaffolding.md → Writing the replies): the character's call returns the two replies too. Lower priority now that the separate call is fast enough.

## On hold

- **A scripted, smaller world for beginners** (Josh, 2026-10-18: hold until there's a better spec). Its items and the parked tests are in the roadmap → 4b.

## Later

- **Haiku for characters**, with a stronger level block in the newest message; speed is the other goal (1.6 s against about 3.4 s).
- **Question ladder for Intermediate and Advanced**: level blocks that get one-fact and open questions, measured with the question-kind count (`qtype.mjs`).
- **Learner-level evidence**: from saved conversations, does the scorecard's "lost" count plus Magda's Level line rank learners the way Josh would?
- **Reply buttons that sometimes ask back** ("E lei?", "Lei è di qui?"): one of the two replies turns a question back to the character, so the learner takes part in the conversation instead of only answering.
- **Quality judge cut off on long conversations:** it hit 4000 tokens on a 14-line transcript. Count how many real conversations have no score (`conversations` table), and raise the limit if any do.
- **Move the scratch scripts into the repo** (`replies.mjs`, `qtype.mjs`, `grade-runs.mjs`, `judge-md.mts` live in the laptop scratchpad): a cloud session can't run them.
- **Frames chosen by the learner's Diario** rather than by the moment: give the clicks prompt the frames being practised; does it still sound natural?

## Done

- Round 14 (2026-10-18): onboarding placement right when learners answer as themselves, wrong every time for a friend answering or a shy learner answering in English; one conversation corrects it in every run (47/47). Found the onboarding send-off max_tokens bug (2577809).

- Round 13 (2026-10-17): choices at the joins and a stricter checker made scripts worse (72–74% of lines "X o Y?", alive and A1 down, joins no better); branching scripts with joins dropped.

- Round 12 (2026-10-17): scripted beginner world for Trastevere and Mexico City: 86–92% pass the checker after rewrites and it's the easiest dialogue yet, but the independent judge still finds the joins ignore a no.

- Round 11 (2026-10-17): scripts written in one call match live dialogue on level and liveliness, with a better arc, but the joins ignore the learner's choice and a script takes 24 s.

- Reply buttons, polite no (2026-10-17): v3 adopted as replies.md 2026-10-17b.

- Round 10 (2026-10-17): "sometimes ask, about you" no better; liveliness lives in the character prompt and data, not the level block.

- Round 9 (2026-10-17): tapping a reply works (no corrections of tapped lines, alive unchanged); found the order-form pattern.
- Round 7 (2026-10-17): reply buttons from a separate call; v2 (yes and no as the choices) picked, Sonnet, 1.3–1.4 s.

- Round 8 (2026-10-17): the alive judge doesn't mark down questions; Italy's "flat" was a different judge.

- Rounds 1–4 (2026-10-16/17): level judge; Beginner prompt "still you". Round 5–6 (2026-10-17): questions; "still you, sometimes ask". See the test log.
