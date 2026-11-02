# Leveling prototype

The Phase 2 prototype of [docs/research/leveling/05-designs.md](../../../docs/research/leveling/05-designs.md): designs A, B and C run side by side on the same simulated learners, in Italy and Mexico, scored by judges that don't know which design made a conversation.

## What it does

1. **The ladder** (`ladder.ts`, data only): four steps from the first Beginner stage to Intermediate. Josh's fading plan "1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3, then Intermediate" (docs/06-roadmap.md → Beginner level dialogue) is one step per group of five; each step plays its pattern in turn. Each stage is how the person talks, in CEFR terms (pace, repeat and rephrase, kind of question, English heard: `content/<country>/prompts/leveling.md` → Talk blocks, added to `beginner.md`), plus which supports are on (answers to say back: two, one, a frame; the English echo: all, new words; bubbles). The top step is Intermediate: `character.md` with the new **B1 block** (`levels.md` → "Intermediate: B1"). `RULES` holds every threshold.
2. **Simulated learners** (`learners.ts`), 15 conversations each: `improving-first` (starts at step 1), `improving-mid` (step 2), `early-b1` (step 3, placed one step low), `flat` (step 1, doesn't improve). Seeded rates pick each turn's kind (silent, English, help ask, saying back an offered answer, own words); the rates fall as they improve and rise when the talk is above them. Claude writes the words for own-words, English and help turns, honest about what they follow (as `tests/conversations/run.ts`'s learner); silence and saying back need no call. Every design gets the same characters and the same draws.
3. **The record** (`record.ts`), no extra call: learner turns, own words vs said back (compared with the answers the app showed, any language), English share, help asks, silent turns; "counted" with 3+ own-words turns.
4. **Controllers** (`controllers.ts`): A counts only; B adds the end-of-conversation speaking judge (`leveling.md` → Speaking judge, may say "not enough to tell"), required for the step into Intermediate; C is B plus a check on every character line (`Line check`) and one regenerate on a clear miss (`Say it again`). Up on 4 of the last 5 counted conversations easy; a support back on after 2 hard in a row (the step stays); the label never moves down; the window starts again after a move.
5. **Scoring** (`score.ts`), blind to the design: lines followable at the learner's step (`level.md`'s word judge, as `lib/level.ts`; 90%+ of the words known by the stage's listener), with and without help (the English echo, or a help ask whose next line was followable); liveliness (`quality.md`'s alive, as real play); seconds per line, seconds added, calls per line.
6. **Report**: `results/<date>-<design>.md`, both countries in one file, with a comparison table, each learner's ladder, traces per conversation, calls and cost, and sample conversations. The raw JSON sits beside it (gitignored, as are dry runs).

`check.mts` checks the logic without model calls (the record, A and B's moves, Josh's pattern, every prompt block fills): `npx tsx tests/experiments/leveling/check.mts` (and `COUNTRY=es-mx`).

## Run it (Josh's laptop)

```
npx tsx --env-file=.env.local tests/experiments/leveling/run.mts --design=all --country=all
```

Options: `--design=A|B|C|all`, `--country=it|es-mx|all`, `--learners=improving-first,flat` (default all four), `--conversations=15`, `--turns=6` (learner turns per conversation), `--parallel=4` (learner runs at once per country), `--no-score` (skip the scoring judges), `--dry` (stub, no key). `CHECK_MODEL=<model id>` runs design C's check on a faster model (thinking left at that model's default); `TURN_MODEL` and `CLAUDE_MODEL` work as everywhere (`lib/claude.ts`). A first, cheaper look: `--design=all --country=it --learners=improving-first,flat --conversations=8`.

Without a key: `npx tsx tests/experiments/leveling/run.mts --design=all --country=all --dry` runs the whole loop with canned replies in about 3 seconds. Its numbers only show the code works.

## Calls and cost

Counted by the dry run (the same loop, so the counts hold; regenerates vary), for 4 learners × 15 conversations × 6 learner turns, one country:

| Design | Character | Regenerate | Check | Speaking judge | Learner (simulator) | Level judge | Quality judge | Total |
|---|---|---|---|---|---|---|---|---|
| A | ~390 | 0 | 0 | 0 | ~290 | ~390 | 60 | ~1,140 |
| B | ~390 | 0 | 0 | 60 | ~290 | ~390 | 60 | ~1,200 |
| C | ~390 | ~40 | ~390 | 60 | ~290 | ~390 | 60 | ~1,630 |

So `--design=all --country=all` is about **7,900 calls**. Input is roughly 1M tokens per design and country (estimated from prompt lengths); output is small except the judges' thinking, which the estimate leaves out. At an assumed $3 / $15 per million tokens, about **$25 without thinking, probably $40–80 with it**; the report prints the measured tokens and cost after a real run (set `PRICE_IN` and `PRICE_OUT` to the model's current prices). Time: each learner's conversations run one after another (the ladder needs the previous one), so expect roughly 30–45 minutes for the full run at 4 in parallel per country.

## Reading it

Simulated learners are too competent and too even (research 02): the numbers compare designs; they don't predict real learners. The learner model's rates and `RULES` decide how fast anyone can climb, so check the traces before trusting a "climbs" column. Not built yet: replaying Josh's real conversations through the steps (the replay set stays on the laptop; `tests/conversations/replay.ts` already takes `--level=Intermediate: B1` for the B1 block on its own).
