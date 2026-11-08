# Testing map

One page: every kind of testing in Fuori, what it is for, which one decides what, and what is retired. Written 2026-11-08 from the repo, `package.json`, the trials log and `docs/10-testing.md`; for Josh's review, so the decisions in "Open decisions" are his. Details stay in the docs linked from each layer.

## The layers

| # | Layer | What it checks | Where | Runs | Decides |
|---|---|---|---|---|---|
| 1 | **Code correctness** | Types, content, contracts: pack, language, model IDs, schema, memory, silence, leave, tokens, images, voices (about 70 `check-*` scripts) | `tests/check-*.ts`, `npm run test:*`, `npx tsc --noEmit` | seconds, free | Whether code is done |
| 1b | **iOS** | FuoriKit Swift tests (Core, Audio, Networking, Features), tokens check, build | `ios/FuoriKit/Tests`, `.github/workflows/ios.yml` | CI on push | Whether a Swift change builds |
| 2 | **Live end to end** | The deployed server in both countries, the way a learner uses it | `npm run smoke:live`, run by `npm run release`; then `railway logs` | minutes | Whether work is live ("done means used") |
| 3 | **Real-play scorecard** | Every real conversation scored when it ends: reply time, coherence, feels alive, level; kept per prompt version | `lib/quality.ts`, `lib/scorecard.ts`, `/api/admin/conversations?format=scorecard`; the replay test `npm run test:replay` (Josh's real lines) and `gate()` | scoring is live in the app (`lib/remember.ts`); the last replay report is 2026-11-06 | Built to decide prompt changes (`docs/10-testing.md`, 2026-10-12); not used by the 11-07 and 11-08 experiments |
| 4 | **Prompt experiments** | One change to one prompt part, on a stored moment, a visit series or an interview | `tests/experiments/` (about 75 scripts, 79 result files), cards and log in `docs/prompt-trials.md`, method in `docs/prompt-testing.md` | 1–5 minutes each, `startTest` refuses without a reviewed card | Whether a prompt change is kept (then Josh at release) |
| 5 | **Judges** | Soft questions: in role, local, level, recast correct, remembers | Claude and Grok on the same question (rule 5d); narrow judges for level, lessons and culture facts (`lib/level.ts`, `docs/lesson-judges.md`) | inside layers 3 and 4 | Counts only; none is calibrated yet (F1, Q2) |
| 6 | **People** | Voice, mic, flow, look, whether it's a good game | Josh on his iPhone, family players (Sophia, Jenn), the teacher's assessment (2026-10-21), Magda | when Josh plays | The real test; nothing ships as "good" without it |

## Layer 4's methods

| Method | Job | Not for |
|---|---|---|
| Moment (one fixed turn) | A problem that shows in one turn | Anything that builds across visits |
| Visit test (several visits, real memory, Sam on Grok as the learner) | Repeats, local talk, memory | Single-turn problems; Sam is thin (F2 not built) |
| Interview (fixed questions, no simulator) | What a character teaches in a first meeting | Across visits |
| Leave-one-out (A1, not run) | Whether each prompt part does anything | Parts that cover for each other (A1b) |
| Historical (real conversations from the admin export) | Finding and counting a problem before choosing a test | Testing a change |
| Variety gate (invented learners, `variety.mts`) | A free-play check once a change is kept | Testing a change |

## Retired or old

- The first simulated-learner suite: `tests/archive/`.
- `npm run test:conversations` (scripted learners, graded 1–10): kept for exploring only; its framing is from 2026-10 and uses Italian-only characters.
- `docs/test-ideas.md` and `docs/level-judge-test.md`: the 2026-10 queue and results, before the card method.

## What isn't tested

- **Whether the learner learns.** Every card is a proxy; a doc on measuring learning is still to come (`docs/prompt-testing.md`).
- **Native-speaker review** of the language. Judges are models.
- **Voice quality and speech recognition as used**, beyond `transcription-models.mts` and Josh's ears.
- **Huge text sizes, VoiceOver and the non-mic path**: deliberately skipped (Josh, 2026-11-06).

## Gaps between the layers

- Layer 4 winners are never checked against real conversations (layer 3). `docs/10-testing.md` planned "confirm in the next ~10 real conversations"; the 11-07 method doesn't mention it.
- Josh's complaints from play don't automatically become stored moments (rule 20 is proposed, not in force).
- Nobody has shown that a moment result predicts a whole conversation (V1, V2 not run).
- The simulated learner and the judges share blind spots (Sam's short, generic lines; Claude judging Claude).
- Three generations of conversation testing (scorecard, simulated suites, cards) have no statement of which one decides.

## Open decisions (Josh's)

1. Does layer 3 come back as the check on a kept prompt change (a replay or the next ~10 real conversations), or is it retired?
2. Which docs are the source of truth: this map for what exists, `docs/prompt-testing.md` for layer 4, `docs/10-testing.md` trimmed to layers 1–3?
3. Whether the rule 17 learning guard and the rule 20 moments-from-play go into force.
4. How learning gets measured, since no layer does.
