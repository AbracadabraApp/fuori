# Testing map

One page: every kind of testing in Fuori, what it is for, which one decides what, and what is retired. Written 2026-11-08 from the repo, `package.json`, the trials log and `docs/10-testing.md`, and updated the same day for the rebuilt conversation test and the split between tests and experiments; for Josh's review, so the decisions in "Open decisions" are his. Details stay in the docs linked from each layer.

## Tests and experiments

| | Tests | Experiments |
|---|---|---|
| Question | Is it still working? Did it get worse? | Is this change better? |
| Lifespan | Standing: run again and again | One-off: ends in a decision |
| Output | Pass or fail, or numbers against a baseline | A result logged under its card |
| Card | No | Always (`startTest` refuses without one) |
| Examples | `check-*`, `tsc`, `smoke:live`, the real-play scorecard, `test:conversations` run plain | C5b, C9, C10 |

`npm run test:conversations` is the instrument for both: run plain it's a test (how conversations are doing, logged over time); run with `--card` and `--variant` it's an experiment. An experiment's path: the card in `docs/prompt-trials.md`, a `test:conversations` run, the result logged under the card, then once the change ships the same measure checked in real play (layer 3). `tests/experiments/` keeps only what the instrument can't do yet (moments, interviews); no new one-off script when the instrument can do the job (Claude's proposal, 2026-11-08, Josh reviewing).

## The layers

| # | Layer | What it checks | Where | Runs | Decides |
|---|---|---|---|---|---|
| 1 | **Code correctness** | Types, content, contracts: pack, language, model IDs, schema, memory, silence, leave, tokens, images, voices (79 `check-*` scripts, 2026-11-17) | `tests/check-*.ts`, `npm run test:*`, `npx tsc --noEmit` | seconds, free | Whether code is done |
| 1b | **iOS** | FuoriKit Swift tests (Core, Audio, Networking, Features), tokens check, build | `ios/FuoriKit/Tests`, `.github/workflows/ios.yml` | CI on push | Whether a Swift change builds |
| 2 | **Live end to end** | The deployed server in both countries, the way a learner uses it | `npm run smoke:live`, run by `npm run release`; for a change to what characters say, the walk (`scripts/walk-live.mjs`, both countries, after the release; CLAUDE.md); then `railway logs` | minutes | Whether work is live ("done means used") |
| 3 | **Real-play scorecard** | Every real conversation scored when it ends: reply time, coherence, feels alive, level, and from 2026-11-08 the learner's share of words and words per line and repeats from the learner's earlier visits with that character; kept per prompt version. The one definition of each measure: the conversation test uses the same code | `lib/quality.ts`, `lib/scorecard.ts`, `/api/admin/conversations?format=scorecard`; the replay test `npm run test:replay` (Josh's real lines) and `gate()` | scoring is live in the app (`lib/remember.ts`); the last replay report is 2026-11-06. Real play's reply time (the server's time per reply, saved with each turn) and level (3 lines sampled per conversation) were blank until 2026-11-08; both fill after the next release | Built to decide prompt changes (`docs/10-testing.md`, 2026-10-12); since 2026-11-16 read for direction only, never deciding (CLAUDE.md → Testing); `gate()` is called only by its own checks |
| 3b | **Conversation test** | Simulated conversations through the game's own turn code, measured by the scorecard's counted rows with the scorecard's own code (reply length, opener, replies with 2+ questions, the learner's share of words and words per line, repeats from earlier visits) plus one reader's culture count; A against B (a here line or prompt text swapped), return visits with the game's memory, A against A for noise; the learner is Claude, Grok or tapping; a Grok read-through of every transcript is opt-in (`--audit`; off by default after its first runs misread facts, Josh 2026-11-08) | `npm run test:conversations` (`tests/conversations/run.ts`, `measure.ts`, `record.ts`); every run kept in `tests/conversations/runs/` with prompt versions, numbers in `runs/log.jsonl`; real play gets the same numbers from the scorecard | about 1–2 minutes for 10 characters × 3 visits on the Mac mini | The instrument for experiments (with a card) and a standing measure (without); the simulated learner matches real play on place characters (learner 8.7 vs 8.5 words per line, share 0.21 vs 0.21) |
| 4 | **Prompt experiments** | One change to one prompt part, on a stored moment, a visit series or an interview | the card, then `test:conversations --card` for visits; `tests/experiments/` (76 one-off scripts and 80 result files, 2026-11-17) for moments and interviews until the instrument does them, cards and log in `docs/prompt-trials.md`, method in `docs/prompt-testing.md` | 1–5 minutes each, `startTest` refuses without a reviewed card | Direction on a true unknown a quick count can't answer; whether a change stays is Josh's play (2026-11-16). A change Josh asks for from play takes no card |
| 5 | **Judges** | Soft questions: in role, local, level, recast correct, remembers | Claude and Grok on the same question (rule 5d); narrow judges for level, lessons and culture facts (`lib/level.ts`, `docs/lesson-judges.md`) | inside layers 3 and 4 | Counts only; none is calibrated yet (F1, Q2) |
| 6 | **People** | Voice, mic, flow, look, whether it's a good game | Josh on his iPhone, family players (Sophia, Jenn), the teacher's assessment (2026-10-21), Magda | when Josh plays | The real test; nothing ships as "good" without it |

## Layer 4's methods

| Method | Job | Not for |
|---|---|---|
| Moment (one fixed turn) | A problem that shows in one turn | Anything that builds across visits |
| Visit test (`test:conversations --visits=3`, real memory) | Repeats, local talk, memory | Single-turn problems |
| Interview (fixed questions, no simulator) | What a character teaches in a first meeting | Across visits |
| Leave-one-out (A1, not run) | Whether each prompt part does anything | Parts that cover for each other (A1b) |
| Historical (real conversations from the admin export) | Finding and counting a problem before choosing a test | Testing a change |
| Variety gate (invented learners, `variety.mts`; `test:conversations` run plain does the same job) | A free-play check once a change is kept | Testing a change |

## The npm scripts, by area

Every script in `package.json` (2026-11-17), by name; each runs one file in `tests/` or `scripts/`, and every one of those files exists. The grouping is by name, for finding one; it isn't a rule about when to run them.

- **Repo-wide checks:** `lint`, `test:language` (nothing country-specific in code), `test:prompt` (a prompt change has its changelog entry), `test:schema`, `test:models`, `test:pack`, `test:content-api`; plus `npx tsc --noEmit`.
- **The turn and what characters say:** `test:dialogue`, `test:beginner-2`, `test:beginner`, `test:shapes`, `test:share`, `test:prompt-parts`, `test:parts-off`, `test:moments`, `test:reply`, `test:replies-prompt`, `test:replies-route`, `test:reply-ranks`, `test:reply-deadline`, `test:draft`, `test:help-asked`, `test:idioms`, `test:say-it`, `test:turn-request`, `test:in-flight`, `test:claude-limits`, `test:mojibake`, `test:names`, `test:culture`, `test:roles`.
- **Levels and steps:** `test:level-up`, `test:level-count`, `test:level-move`, `test:level-writers`, `test:level-read`, `test:level`, `test:learner-level`, `test:level-prompt`, `test:level-trial`, `test:starting-step`, `test:no-downlevel`, `test:scaffold`, `test:path`.
- **Memory, records and onboarding:** `test:memory`, `test:memory-gender`, `test:history`, `test:leave`, `test:save-later`, `test:onboarding`, `test:welcome`, `test:stats`, `test:sweep`.
- **Voice and recordings:** `test:transcribe`, `test:recording`, `test:keep-recording`, `test:hear-recording`, `test:silence`, `test:audio`, `test:early-voice`, `test:reveal`, `test:voice-outcomes`, `test:voices`, `voices`, `voices:assign`, `voice:failures`, `replay:recordings`.
- **Scoring (read for direction, layer 3):** `test:quality`, `test:scorecard`, `test:grade`, `test:real-play-scores`, `test:repeats`.
- **Learn, Magda, flashcards, culture:** `test:learn-route`, `test:learn-ahead`, `test:magda`, `test:lesson-areas`, `test:flashcards`, `test:cards`, `card:review`, `test:vocab`, `test:study-export`.
- **World and pictures:** `test:feed`, `test:today`, `test:weather`, `test:images`, `test:image-list`, `test:image-prompts`, `test:country-card`, `images`, `images:upload`, `style-test`.
- **App and server plumbing:** `test:proxy`, `test:app-log`, `test:app-version`, `test:tokens`, `tokens`, `hig`.
- **Conversations (layer 2 and 4):** `test:conversations`, `test:replay`.
- **Live and timing:** `smoke:live`, `release`, `deploy:wait`, `measure:turn`, `bench`; the walk is `node scripts/walk-live.mjs`.
- **Running locally:** `dev`, `build`, `start`, `dev:sim`.

## Retired or old

- The first simulated-learner suite: `tests/archive/`.
- `npm run test:conversations`'s 1–10 grades and recommendations: replaced by counts on 2026-11-08 (layer 3b).
- The simulated learner Sam on Grok inside one-off scripts (C4–C10): replaced by the conversation test's learner.
- `docs/test-ideas.md` and `docs/archive/level-judge-test.md`: the 2026-10 queue and results, before the card method.

## What isn't tested

- **Whether the learner learns.** Every card is a proxy; a doc on measuring learning is still to come (`docs/prompt-testing.md`).
- **Native-speaker review** of the language. Judges are models.
- **Voice quality and speech recognition as used**, beyond `transcription-models.mts` and Josh's ears.
- **Huge text sizes, VoiceOver and the non-mic path**: deliberately skipped (Josh, 2026-11-06).

## Gaps between the layers

- Layer 4 winners are never checked against real conversations (layer 3). `docs/10-testing.md` planned "confirm in the next ~10 real conversations"; the 11-07 method doesn't mention it. The conversation test and real play now share one set of measures, the scorecard's (Josh, 2026-11-08), so the check is possible once the new rows are live (next release).
- Josh's complaints from play don't automatically become stored moments (rule 20 is proposed, not in force).
- Nobody has shown that a moment result predicts a whole conversation (V1, V2 not run).
- The simulated learner and the judges share blind spots (Claude judging Claude). The conversation test replaces verdict judges with counts, and its learner is checked against real play by the same counts; the transcripts are kept for reading.
- Three generations of conversation testing (scorecard, simulated suites, cards) have no statement of which one decides.

## Open decisions (Josh's)

1. ~~Does layer 3 come back as the check on a kept prompt change?~~ Settled by CLAUDE.md → Testing (2026-11-16): counts on real or replayed turns, read side by side for direction, then Josh plays; no gate.
2. Which docs are the source of truth: this map for what exists, `docs/prompt-testing.md` for layer 4, `docs/10-testing.md` trimmed to layers 1–3?
3. Whether the rule 17 learning guard and the rule 20 moments-from-play go into force.
4. How learning gets measured, since no layer does.
5. ~~Targets for the new scorecard rows~~ Settled 2026-11-16: no targets or thresholds; the rows are read for direction. (Was: targets for the new scorecard rows: learner share and learner words per line have none yet (real place characters: about 0.21 and 8.5); repeats from earlier visits has 0.)
6. The tests/experiments split and the experiment path above.
