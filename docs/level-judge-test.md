# Level judge test (temporary)

Started 2026-10-16 with Josh. Question: can Claude tell the CEFR level of Italian it reads, well enough to measure whether characters speak at the learner's level ([language-levels-plan.md](language-levels-plan.md), target: 90% of a character's words at the learner's level)?

Temporary: the scripts and samples live in the laptop session's scratchpad, not the repo (the samples are copied from published exam papers). This file keeps the design and the results so the next session can repeat or extend them.

## Ground truth

- **Sentences:** 48 Italian lines, 12 per level A1–B2, copied exactly from official exam material: CILS (Università per Stranieri di Siena) and PLIDA (Società Dante Alighieri) sample papers, mostly listening transcripts. Two sources per level. No free CELI or AIL material was found.
  - Caveat: the level is the whole paper's, not a rating of each line, so some lines in an A2 paper are really A1. 100% exact is impossible.
  - Caveat: A1 PLIDA Juniores items are text messages; B2 CILS items are quoted speech in a reading text.
  - Most PDFs are on a third-party mirror (languageadvisor.net) with the official headers.
- **Words** (Josh, 2026-10-16): 50+ nouns and 30 verbs per level, from a CEFR-tagged source (being gathered). Question: do single words score differently from phrases?

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
| 1 | **Levels described, not named:** four plain descriptions of a listener; which would understand it? Separates "CEFR is a defined ruler" from "Claude recognises the exam sentence" | Proposed |
| 2 | **Pairwise:** which of two is harder; rank all, compare with the source order | Later |
| 3 | **Examples first:** two labelled lines per level from one source, grade the other source | Later |
| 4 | **Mark the hard words:** list the words a learner at level X wouldn't know; share of known words per line (the 90% measure itself) | Proposed |
| 5 | **Imagined learner:** "you've studied Italian for 3 months; would you understand this? yes / mostly / no" | Proposed |
| 6 | **Model comparison:** best approach on Haiku, Sonnet, Opus (cost of a judge on every conversation) | Later |
| 7 | **Sentence length alone, no Claude:** the control any approach must beat | Proposed |
| W | **Words vs sentences:** approaches L and C on single nouns and verbs (Josh) | Words being gathered |

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

## Ideas to keep (Josh, 2026-10-16)

Words per level, used without being deterministic, loosest first:
1. Measure only: the judge marks hard words after the line is written (approach 4); nothing goes in the prompt.
2. Say the budget, not the words: "mostly everyday words; a harder one, say it and its English" in the prompt; approach 4 checks it.
3. The learner's own words: what they've said or been taught in their conversations counts as known. A record, not a prediction; any language; soft hint in the prompt and a per-learner coverage score.
4. Fixed lists per level in the prompt: deterministic, one language only, and the research found it backfired. Kept out.
