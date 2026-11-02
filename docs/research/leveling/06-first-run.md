# Leveling: first real run, read (2026-11-02)

Run: Italy, designs A/B/C, 2 learners × 8 conversations, ~$10 ([results](../../../tests/experiments/leveling/results/2026-11-02-19-51-all.md), commit a617b1b). Read by Claude.

## Headline numbers

| | Followable (no help) | With help | Added s/line | Lines regenerated |
|---|---|---|---|---|
| A | 16% | 32% | 0 | 0% |
| B | 14% | 24% | 0 | 0% |
| C | 19% | 35% | 4.3 | 89% |

No learner moved a step in 8 conversations. The flat learner got supports back, as it should.

## What they mean

1. **The main measure is wrong for the Beginner format, so the followable numbers can't be trusted yet.** Reading the conversations, the Italian is short and simple (*Vuole un cono o una coppetta?*). It fails because each line deliberately brings one new word with its English right after it (*coppetta*, *bicerin*, *scontrino*), and the judge counts that word as unknown. In a five-word line, one new word is 80%, under the 90% bar. The measure punishes exactly the teaching the format is built to do. "With help" only credits a line when every phrase has its echo, which is rarely the case.
2. **Design C is out.** The check flagged 89% of lines, so almost every line was regenerated, for +4.3 s on a ~2.8 s turn. It's measuring with the same flawed bar, so it chases the wrong target, at a cost the app can't carry.
3. **A and B can't be told apart at this size** (one improving learner each; 14% vs 16% is noise).
4. **The ladder rule looks reasonable.** The improving learner in A reached 3 easy of the last 4 by conversation 8; it would likely step up around conversation 9–10. Too early to tune.
5. **The simulated beginner is a fair test this time.** Early conversations are mostly English help requests, then real Italian by conversation 8 (*Sono americano, e sono nuovo a Torino. Abito qui da due settimane.*). Not the over-capable learner the research warned about, at least here.
6. **A small character bug:** answering a learner who said "is she asking…", the character spoke of herself in the third person ("She asks if you want to pay now"). Worth a look in the Beginner prompt.

## Next

1. **Fix the measure before comparing anything:** a word given with its English in the same line counts as known; score a conversation's Italian as a whole, not line by line (short lines make 90% a coin flip). Then re-score this run's saved conversations: no new character calls needed.
2. **Drop C.**
3. **Run A and B for real:** 15 conversations, all four learners, both countries.

## Re-scored (2026-11-02, later)

With the measure fixed (a word said with its English counts as known; each conversation also scored as a whole), the same saved conversations: 94–96% of a conversation's words known with the echo, 64–67% without, 74–83% of lines followable. Read in [07-model.md](07-model.md), which also records the model Josh and Claude settled on and why the ladder comparison is no longer the main test.
