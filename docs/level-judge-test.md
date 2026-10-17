# Level judge test (temporary)

Started 2026-10-16 with Josh. Question: can Claude tell the CEFR level of Italian it reads, well enough to measure whether characters speak at the learner's level ([language-levels-plan.md](language-levels-plan.md), target: 90% of a character's words at the learner's level)?

Temporary: the scripts and samples live in the laptop session's scratchpad, not the repo (the samples are copied from published exam papers). This file keeps the design and the results so the next session can repeat or extend them.

## Ground truth

- **Sentences:** 48 Italian lines, 12 per level A1–B2, copied exactly from official exam material: CILS (Università per Stranieri di Siena) and PLIDA (Società Dante Alighieri) sample papers, mostly listening transcripts. Two sources per level. No free CELI or AIL material was found.
  - Caveat: the level is the whole paper's, not a rating of each line, so some lines in an A2 paper are really A1. 100% exact is impossible.
  - Caveat: A1 PLIDA Juniores items are text messages; B2 CILS items are quoted speech in a reading text.
  - Most PDFs are on a third-party mirror (languageadvisor.net) with the official headers.
- **Words** (Josh, 2026-10-16): 399 words, about 61 nouns and 38 verbs per level, from the Kelly project's Italian list (Kilgarriff et al. 2014, `it_m3.xls`). Question: do single words score differently from phrases?
  - Caveat, and it turned out to dominate: Kelly's levels are frequency bands from a web corpus (itWaC), about 1,000 lemmas each, not judgements of what learners know. No downloadable expert-judged list (Profilo della lingua italiana, Siena, Perugia) was found.

## Rules of the test

- Claude sees one item at a time with no context: no source, no examples, no level hint.
- Model: `claude-sonnet-5-5` (the characters' model), thinking left on as in the app. Three runs per item, to see how steady it is.
- Reported per approach: exact match, within one level, average bias in levels (+ = rates too hard), items with the same answer every run, and a table of source level against Claude's answer.
- The same prompt wording for words and sentences, so they're comparable.

## Approaches

| # | Approach | Status |
|---|---|---|
| L | **Letters:** "Grade this Italian by the speaking level a learner needs to understand it when it's spoken to them: A (easiest), B, C or D (hardest)." (Josh's version: no scale named) | Run on sentences |
| C | **CEFR named:** "What CEFR level of Italian does a learner need to understand this when it's spoken to them? A1, A2, B1 or B2." | Run on sentences |
| 1 | **Levels described, not named:** four plain descriptions of a listener; which would understand it? Separates "CEFR is a defined ruler" from "Claude recognises the exam sentence" | Run |
| 2 | **Pairwise:** which of two is harder; rank all, compare with the source order | Later |
| 3 | **Examples first:** two labelled lines per level from one source, grade the other source | Later |
| 4 | **Mark the hard words:** list the words a learner at level X wouldn't know; share of known words per line (the 90% measure itself) | Run |
| 5 | **Imagined learner:** "you've studied Italian for 3 months; would you understand this? yes / mostly / no" | Run |
| 6 | **Model comparison:** best approach on Haiku, Sonnet, Opus (cost of a judge on every conversation) | Run (CEFR prompt) |
| 7 | **Sentence length alone, no Claude:** the control any approach must beat | Run |
| W | **Words vs sentences:** approaches L and C on single nouns and verbs (Josh) | Run; ground truth unsound |

Known leak (Josh): naming CEFR may let Claude recognise published exam sentences instead of judging the Italian. Checks: compare C with 1 and L; compare exam papers with other sources; lightly reworded lines that keep their level.

## Results

### 2026-10-16: sentences, approaches L and C (48 × 3)

| | Exact | Within one | Bias | Same every run |
|---|---|---|---|---|
| L, letters | 33% | 78% | −0.88 (too easy) | 44/48 |
| C, CEFR named | 60% | 100% | +0.10 | 43/48 |

- **Letters:** never said D; B2 lines mostly B. The order was right (harder lines got higher letters), but with no defined scale "A to D" had no fixed meaning.
- **CEFR:** never more than one level off, nearly unbiased; A1 lines rated A2 about two times in three.
- Open: is C better because CEFR is a ruler or because of recall? Approach 1 decides.

### 2026-10-16: single words, approaches L and C (399 × 3)

| | Exact | Within one | Bias | Same every run |
|---|---|---|---|---|
| L, letters | 32% | 70% | −0.80 | 330/399 |
| C, CEFR named | 33% | 71% | +0.25 | 340/399 |

Nouns and verbs alike (CEFR: nouns 33% exact, verbs 34%; verbs rated a bit harder, +0.48).

- With CEFR named, words score far worse than sentences (33% against 60% exact). Letters stay too easy, as with sentences.
- **But the disagreements say more about Kelly than Claude.** Kelly A1 that Claude calls B2: ambito, esigenza, provvedimento, regolamento, dichiarazione, riforma, fenomeno, stabilire, derivare. Kelly B2 that Claude calls A1: frigorifero, pranzo, pasto, neve, barca, moneta, cognome, ciliegia, automobile. Claude's answers look like a learner's reality; Kelly's look like newspaper frequency. Josh agrees (2026-10-16): Claude is closer than Kelly on these.
- So this run can't answer "do words score differently from phrases?": it needs words graded by experts, not by frequency.
- It does say something about the word-list idea: a frequency list from a web corpus ranks bureaucratic words as basic and everyday food and home words as advanced. A coverage measure built on it would mark a barista's "pranzo" as hard. If a list is ever used, it has to come from speech (subtitles) or learner material, and be checked like this first.

| 8 | **No prompt, rules only** (Josh): words per sentence, hardest verb tense (a tagger such as Stanza, ~70 languages), share of words outside a frequency list; level = the highest any signal reaches. Kelly is a poor list for it (above) | Run (length and tense; no list) |

### 2026-10-16: round 2, every approach on the 48 sentences (3 runs; rho = rank correlation with the source level)

| Approach | Exact | Within one | Bias | rho | Same every run |
|---|---|---|---|---|---|
| C, CEFR named, Haiku | **66%** | 100% | +0.05 | **0.89** | 37/48 |
| C, CEFR named, Sonnet | 60% | 100% | +0.10 | 0.85 | 43/48 |
| C, CEFR named, Opus | 40% | 98% | −0.17 | 0.74 | 44/48 |
| C, Sonnet, altered copies (leak check) | 57% | 100% | +0.18 | 0.86 | 45/48 |
| 1, levels described, Sonnet | 50% | 94% | −0.02 | 0.69 | 37/48 |
| 4, hard words (first listener who knows 90%), Sonnet | 42% | 96% | +0.30 | 0.76 | 40/48 |
| 5, imagined learners, Sonnet | 43% | 96% | +0.39 | 0.77 | 43/48 |
| L, letters, Sonnet | 33% | 78% | −0.88 | 0.79 | 44/48 |
| 7, length only (no Claude) | 44% | 83% | +0.23 | 0.46 | 48/48 |
| 8, length + hardest tense (no Claude, Stanza) | 44% | 83% | +0.35 | 0.50 | 48/48 |
| tense only (no Claude) | 38% | 69% | −0.79 | 0.25 | 48/48 |

- **No recall leak.** Copies with names, numbers, places and one noun changed (grammar untouched) grade the same as the originals. Naming CEFR wins because Claude knows that scale well, not because it remembers the papers.
- **No prompt, rules only, loses clearly** (rho 0.5 against 0.7–0.9). Tense alone is weak: short exam lines stay in the present even at B2.
- **Haiku is as good as Sonnet or better, Opus worse.** 48 items is a small set, so Haiku vs Sonnet is a tie; the cheap model is enough for a judge on every conversation. Haiku is less steady run to run (37/48), so average several runs or several lines.
- Every Claude approach ranks well (rho ≥ 0.69); the differences are mostly calibration (bias), which examples or a correction can fix.

### 2026-10-16: today's characters (60 lines from the 2026-10-15/16 replays, no answer key)

| Judge | A1 | A2 | B1 | B2 | C1–C2 |
|---|---|---|---|---|---|
| CEFR A1–C2, Haiku | 10% | 54% | 31% | 5% | 0% |
| CEFR A1–C2, Sonnet | 9% | 68% | 19% | 3% | 0% |
| Hard words: first listener who knows 90% (Sonnet) | 0% | 24% | 74% | 2% | |

- Line by line, the overall CEFR judge puts today's characters at A2–B1, not the B2+ Josh's teacher heard. Possible reasons: the teacher heard speed, a whole conversation and an older, longer prompt (replies were ~60 words then, ~20 now); a text judge can't hear speed.
- **The 90% word measure is stricter:** no line passes for a learner who arrived a few weeks ago, and three in four need the "about a year" listener. That is the gap the Beginner target has to close, and it's the measure to put on the scorecard.

## Notes from Josh (2026-10-16)

- **Learners and characters may be levelled differently.** A character's line is judged for listening (would this learner understand it?); a learner's speech is production, transcribed by Whisper, short and full of errors. Ground truth for learner speech would be learner language graded by examiners (e.g. a learner corpus), not exam listening scripts.
- **Use existing reading-level resources.** Graded readers by level (Italian publishers' series) and easy-read news are large, already levelled, and include C1, which the exam lines lack. Next ground truth, and a source of examples for a few-shot judge (approach 3).

## Ideas to keep (Josh, 2026-10-16)

Words per level, used without being deterministic, loosest first:
1. Measure only: the judge marks hard words after the line is written (approach 4); nothing goes in the prompt.
2. Say the budget, not the words: "mostly everyday words; a harder one, say it and its English" in the prompt; approach 4 checks it.
3. The learner's own words: what they've said or been taught in their conversations counts as known. A record, not a prediction; any language; soft hint in the prompt and a per-learner coverage score.
4. Fixed lists per level in the prompt: deterministic, one language only, and the research found it backfired. Kept out.
