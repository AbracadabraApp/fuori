# Check: levels work as designed

A prompt for a fresh session or agent, to rerun after any change to levels, steps or the level up (Josh, 2026-11-15: "write a good prompt to make sure levels are working as designed"). Self-contained; paste it as is.

```
Verify that Fuori's levels work as designed, end to end, in both countries (Italy and Mexico).
Report what passes and what doesn't, with evidence. Fix nothing without asking Josh first.

Read first (the design, in this order):
- CLAUDE.md (rules: no release unless Josh says "release"; never change a test without his yes;
  never install on his phone without his yes; no simulator unless needed to debug something seen)
- docs/glossary.md → Level, Step, Level up
- docs/dialogue-model.md → the question's English ladder (2026-11-12)
- docs/dialogue-plan.md → To do: D10 (steps 4–6), D34/D35 (level moves), D7, D25, D40
- content/es-mx/prompts/scaffolding.md (Level and Setup blocks) and its changelog
- lib/beginner-2.ts (CLUSTERS, LEVEL_OF_CLUSTER, QUESTION_ECHO_FRAME, QUESTION_PRINTED,
  pickSetup, lineWithAnswers) and lib/level-up.ts

"As designed" means all of these hold:
1. Beginner has 6 steps, one screen at every step. What each step gives:
   - steps 1–3: the question's English said and printed; two answers, each with its English
   - steps 4–5: the English said, not printed; two answers, each with its English
   - step 6: no answers, a Spanish/Italian question only
   - every step can open a visit (step 6 crashed on opening until 2026-11-15)
2. Each step's turns match its Level text: step 1 mostly English with the language slotted in;
   step 4 mostly the language with English asides; steps 5–6 the language, English only when asked.
3. Level up: after 3 counted conversations at a step (3+ learner replies each), the app offers the
   next step. The learner chooses (yes / "Not yet"); "Not yet" asks again after 3 more.
   - only ordinary visits at the learner's level count: at Beginner, visits played at their stored step;
     not lessons, Magda, the welcome, the old Beginner, or visits at another step or level (Josh, 2026-11-16: "no")
   - a learner with no step start (from before steps existed) starts counting from their first visit after this
     change, not from every conversation ever (Josh, 2026-11-16: "Yes" to starting fresh)
   - at step 6 the offer is Intermediate; at Intermediate it's Advanced; Advanced gets none
   - a yes changes the stored step or level, and the next visit plays at it
   - the offer's preview line is the character's last line rewritten at the next step or level
     (this call failed at max_tokens until 2026-11-15)
4. The hidden stepper (x-fuori-cluster 2–6) overrides the stored step for that request only.
5. Both countries behave the same; nothing language-specific in code.

How to check (in this order; say what you ran):
a. Suites: npx tsc --noEmit, test:beginner-2, test:level-up, test:level-move, test:idioms,
   test:help-asked, test:prompt; smoke:live and COUNTRY=es-mx smoke:live.
b. Every step against the live code: for each step 1–6 and each country, run a few real
   openings and replies through POST /v1/turn (app/v1/turn/route.ts called directly, local
   test DB at postgresql://localhost/fuori_test, a test learner, x-fuori-cluster set). For each
   turn record what's said, what's printed (question.text / question.en), and the bubbles
   (parts). Check against point 1. Read the lines for point 2; don't trust a keyword count.
c. The level-up path on a local test learner: play 3 counted conversations, call
   GET /v1/level-up?conversationId=…, check the offer and its preview, POST yes, check the
   stored step and that the next turn plays at it. Repeat at step 6 (→ Intermediate) and at
   Intermediate (→ Advanced). Check "Not yet".
d. Production, read-only: in railway logs (both services) look for errors in v1 turn and
   v1 level-up; through `railway ssh --service Afuera -- node -e '…'` read learners.step,
   step_since, level_up_asked_at and level for the family's learners. Report who has been
   offered what. Write nothing.
e. The app: build 16 is the first with the level-up screen and the reply-bubble speaker.
   Don't install anything. Ask Josh to finish a visit and say what he saw, then read the logs
   for that request.

Known edges to look at and report on (not to fix unasked):
- (decided 2026-11-16, built) a learner whose step_since was null counted every conversation ever; the count now
  starts fresh for them
- the older rule in lib/conversation-record.ts that moves an Intermediate back to Beginner
  after hard conversations: does it bounce with the step-6 → Intermediate offer?
- (decided 2026-11-16, built) lessons and other visits don't count toward the offer
- the old Beginner (x-fuori-beginner: 1) gets no step offers, by design

Report:
- a table: each point 1–5, per country, pass/fail, with the conversation id or command output
- example turns per step (said / printed / bubbles), 2 per step per country
- bugs found, added to docs/bugs.md with evidence (not fixed)
- anything that needs Josh's decision, as plain questions
Keep it short and plain; no codes in the summary.
```

Keep it current: when the design changes (a step's ladder, the count, a new level), change the "as designed" list here in the same commit.
