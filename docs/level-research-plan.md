# Language leveling: research and prototype plan

2026-11-02 · Draft by Claude at Josh's request · Not started; waiting on Josh's go and three answers (bottom).

## The problem (Josh)

Match the language of the material to the language of the learner, and move the match up or down as they progress. It isn't simple, and what we've tried so far shows it isn't well understood. Goal: a leveling system that is simple and elegant but effective, and builds on what exists.

## What exists to build on

- Three tiers, Beginner / Intermediate / Advanced (decided 2026-10-15), and the Beginner level dialogue with Josh's staged fading plan (not built).
- The syllabus: 69 units A1–C1 with frames, and a word list (`syllabus-words.csv`).
- Measures: "lines a beginner can follow" (`lib/level.ts`; baseline 10–25%, goal 90%), the question-kind count, the learner level check (`lib/learner-level.ts`, built but off).
- Test harnesses: `test:conversations`, simulated learners, the kept recordings (`replay:recordings`).
- Earlier research: [language-app-levels.md](research/language-app-levels.md), [llm-language-learning.md](research/llm-language-learning.md); every prompt tried, in [prompt-trials.md](prompt-trials.md).

## A working hypothesis to test, not assume

One scale for both sides: the syllabus. The learner's level is where they are in it (units they can use); the material's target is that point plus a small stretch. Placement, prompting, measuring and moving up would all speak the same unit. If the research kills this, fine; it gives the agents something to push against.

## How I'd run it

**Phase 0 · What we know (Claude, one session).** Read the docs, trials and judge rounds above; write one page: what's been tried, what worked, what failed and why (e.g. the tier in the prompt is ignored; characters drift up mid-conversation). Every later agent gets this page, so nobody repeats a dead end.

**Phase 1 · Research (four agents in parallel).** Each returns ranked ideas with evidence, cost and fit with Fuori's rules (any language, no phrase lists for predicting speech, short prompt):
1. **Learning science:** comprehensible input and "a little above", word coverage (95–98%), CEFR descriptors, fading support, what predicts readiness to move up.
2. **Products:** how Duolingo, LingQ, Lingvist, graded readers, Speak, Praktika and others place and adapt learners (adaptive testing, Elo/IRT, known-word counts).
3. **Controlling generated language:** what actually holds an LLM to a level: prompting, word lists, a rewrite pass, a judge-and-retry, few-shot examples; readability measures for Italian and Spanish; LLM judges of CEFR.
4. **Measuring the learner from speech:** complexity, accuracy and fluency measures, speaking rate, length of answers, asking for help, silence; which ones an LLM can score reliably.

**Phase 2 · Candidate designs (Claude).** Two or three whole loops, each covering place → speak at level → measure → move. Judged on one stored value, one prompt line, at most one extra call per conversation (not per turn), works in Italian and Spanish. Josh picks which go to prototype.

**Phase 3 · Prototypes (one agent per design, separate worktrees, offline only).** Each runs on the same inputs: simulated learners at A1, A2 and B1 who improve over 15 conversations, plus replays of real conversations. Scored by a separate judge agent that hasn't seen the designs:
- share of character lines at the learner's level (goal 90–95%)
- whether the level moves when the simulated learner improves, and doesn't when they don't
- added time per turn, cost, prompt length

**Phase 4 · Josh plays the winner** in both countries; then it's built properly.

## Answers needed from Josh

1. Scope: the whole range, or Beginner → Intermediate first (where most learners are and the gap is largest)?
2. Budget: Phase 1 is four agents; Phase 3 up to three prototypes with many simulated conversations. Fine, or narrower?
3. Go for Phase 0 and 1 now, with a stop to review before prototypes?
