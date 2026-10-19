# Experiments

Scripts behind the level and dialogue tests (results in [docs/level-judge-test.md](../../docs/level-judge-test.md), queue in [docs/test-ideas.md](../../docs/test-ideas.md)). Moved here from the laptop session's scratchpad on 2026-10-18 so any session can rerun them. They aren't checks that pass or fail: each prints numbers to compare between arms.

Run from the repo root with the API key: `npx tsx --env-file=.env.local tests/experiments/<script>.mts …`, with `COUNTRY=es-mx` for Mexico. Outputs go to `tests/experiments/out/`, which is gitignored because several quote Josh's real lines. Every Claude call goes through `lib/claude.ts`, so the models are the app's.

**Committed test conversations:** `tests/conversations/synthetic-set/<country>.json` (28 per country, simulated learners: beginner, hesitant, improving, asks what things mean, verb mistakes, errand then leave, chatty then leave), same shape as the admin export, so pass it wherever a script takes `out/admin.json`. Made by `tests/conversations/synthetic-set.ts` with the production prompt (version in each row). Synthetic learners are tidier than real ones (round 19: 82% said goodbye against 54% in Josh's conversations), so confirm findings on the real export on the laptop.

| Script | What it measures | Input | Rounds |
|---|---|---|---|
| `question-kinds.mts` | What each character line asks (none, yes/no, choice, one fact, open) and whether a beginner could answer | report `.md` files, `label=path` | 5–6, 15 |
| `line-level.mts` | Lines a beginner can follow (the scorecard's level judge, `lib/level.ts`), early and late in the conversation | report `.md` files | 1–14 (as `grade-runs.mjs`) |
| `judge-report.mts` | The replay's quality judge (alive, replies that don't follow) on any report, twice per conversation; `--notes` prints why | report `.md` files | 8–13 |
| `reply-buttons.mts` | The reply buttons (`lib/replies.ts`) for every character line, judged in 8 checks, and whether they're ready before the line ends | report `.md` files | 7 |
| `real-conversations.mts` | Real conversations from the admin export, re-judged, written as a report (lowest first) for the scripts above | admin export, prompt version | 15 |
| `placement.mts` | Onboarding's level against a known level, and a level judge after each of 3 conversations | — | 14 |
| `repeats.mts` | Character lines that repeat themselves or re-ask, on the longest replay scripts; `TURN_RECENT_TURNS` sets the history window | replay set | 15 |
| `reply-tokens.mts` | Output tokens per character reply with a high cap (how close replies come to `max_tokens`) | replay set (Italy) or simulated learners | 16 |
| `learner-levels.mts` | The level check (`lib/learner-level.ts`) on each real learner's first conversations, for Josh to compare with his own judgement | admin export | 14 |
| `diario-cards.mts` | Diario cards from real conversations: today's stored review phrases against a draft card maker, 9 checks plus the level judge | admin export | 17 |
| `core-behaviours.mts` | CLAUDE.md's core behaviours (help when asked, what does it mean, garbled speech, recasting a mistake, no unasked English), one probe each, thinking off and on; `PROBES=` picks probes, `CHARACTER_PROMPT=` a trial prompt, `PROMPTS=a.md,b.md` one arm per prompt | — | 18 |
| `conversation-ends.mts` | Real conversations from the admin export: where each was first naturally over (errand done and closed, or both said goodbye), what happened after, and whether the learner said goodbye; reads `ended_at`, which includes idle time, so the seconds are rough; also writes JSON for end-detect | — | 19 |
| `end-detect.mts` | Two ways to notice a conversation is over, scored against conversation-ends' judge: an `over` flag on the character's reply (trial schema, line regenerated) and a separate judge after each real line (timed) | — | 20 |
| `help-asks.mts` | Real conversations: every learner turn asking for help, and whether the next character line carried English in the spoken line, helped in the language only, or ignored it (before dropping the English translation line) ; `PROMPTS=` replays each ask with each prompt file | — | 21 |
| `teach-moments.mts` | Real conversations: the character's teaching moments by kind (vocabulary, gender or number, conjugation, dialect or local), how (recast, in the language, in English), whether it sounds like a lesson, and missed chances | — | 22 |
| `word-list-level.py` + `word-list-level.mts` | "Lines a beginner can follow" by a fixed word list (the syllabus's `level-words-it.csv`, lemmas from spaCy's large Italian model; needs a venv, see the script) against the level.md judge run three times | — | 23 |
| `voice-speed.mts` | Speed of speech in (Groq Whisper, ElevenLabs Scribe) and speech out (ElevenLabs models, whole file and first streamed byte), short to long lines, both languages; laptop network | — | voice 1 |
| `on-hold/smaller-world.mts` | Scripted two-visit conversations per character in one neighbourhood, checked and rewritten. On hold until the smaller world has a spec | — | 12–13 |

Reports come from `npm run test:conversations` and `npm run test:replay` (`tests/conversations/reports/`); the replay set from `npm run test:replay -- --refresh`.

Not moved: the early level-judge scripts of rounds 1–4 (the exam-sample ground truth) and round 8's one-off check; their results are in the test log.
