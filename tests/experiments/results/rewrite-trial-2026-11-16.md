# Rewrite trial, 2026-11-16 (direction, not a test)

Today's shared prompts (A, main at ee7ebdbc) against the rewrite (B, branch trial/prompt-rewrite). 4 characters a country, steps 1 and 4, one visit leaving after the 4th turn and one running to the close: 16 visits, 112 turns a version a country. Script: tests/experiments/rewrite-trial.mts. Raw turns: rewrite-trial-<country>-<a|b>-2026-11-16.json beside this file. 'Long visit closes by the 8th turn' is miscounted: every long visit closed on the 9th character turn (the learner's 8th), as designed.

## es-mx
```
                                                   today  |  rewrite
step 1 · language share, mean (spread)             28% (±3, 22–33)  |  31% (±5, 23–41)
step 1 · words a turn                              36  |  43
step 1 · turns with 2+ questions (English)         1/56  |  0/56
step 1 · question last (turns meant to ask)        31/34  |  26/30
step 4 · language share, mean (spread)             53% (±4, 48–60)  |  55% (±3, 52–61)
step 4 · words a turn                              37  |  48
step 4 · turns with 2+ questions (English)         0/56  |  0/56
step 4 · question last (turns meant to ask)        32/38  |  31/38
endings · goodbye ends the visit at once           8/8  |  8/8
endings · the goodbye back asks nothing            8/8  |  8/8
endings · long visit closes by the 8th turn        0/8 (turns: 9 9 9 9 9 9 9 9)  |  0/8 (turns: 9 9 9 9 9 9 9 9)
plumbing · turns that failed                       0/112  |  0/112
plumbing · format kept (all in braces)             106/112  |  105/112
plumbing · two answers where the turn offers them  88/88  |  86/86
culture · things taught a long visit (judge)       13.1  |  14.1
```

## it
```
                                                   today  |  rewrite
step 1 · language share, mean (spread)             29% (±2, 26–34)  |  30% (±3, 26–34)
step 1 · words a turn                              33  |  43
step 1 · turns with 2+ questions (English)         0/56  |  0/56
step 1 · question last (turns meant to ask)        33/37  |  29/34
step 4 · language share, mean (spread)             56% (±5, 51–66)  |  59% (±6, 52–70)
step 4 · words a turn                              33  |  41
step 4 · turns with 2+ questions (English)         0/56  |  0/56
step 4 · question last (turns meant to ask)        36/41  |  34/41
endings · goodbye ends the visit at once           8/8  |  8/8
endings · the goodbye back asks nothing            8/8  |  8/8
endings · long visit closes by the 8th turn        0/8 (turns: 9 9 9 9 9 9 9 9)  |  0/8 (turns: 9 9 9 9 9 9 9 9)
plumbing · turns that failed                       0/112  |  0/112
plumbing · format kept (all in braces)             107/112  |  105/112
plumbing · two answers where the turn offers them  85/85  |  88/88
culture · things taught a long visit (judge)       16.3  |  14.6
```
