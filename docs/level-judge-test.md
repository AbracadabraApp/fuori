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

### 2026-10-16: graded readers, A1–C1 (60 lines, CEFR A1–C2 prompt, 3 runs)

Second answer key: 12 lines per level from publishers' graded readers and coursebook samples (ALMA Italiano Facile, Edilingua; B2 and C1 partly coursebooks; Il Sosia labelled C1–C2, counted C1).

| Judge | Exact | Within one | Bias | rho | Same every run |
|---|---|---|---|---|---|
| Haiku | 47% | 92% | −0.32 | 0.84 | 44/60 |
| Sonnet | 42% | 94% | −0.35 | 0.86 | 54/60 |

- The order holds on different material (rho 0.84–0.86, as on the exam lines).
- **But it rates too easy, more so the higher it goes:** C1 lines mostly called B2 (Haiku said C1 6 times in 36), B1 often A2. Fits what Josh found in play: lines the judge calls A2–B1 were only followable by a native speaker. So the judge's labels are lenient for listening; use it to compare (before and after a prompt change, tier against tier), and set the Beginner target from the rewrites' grade, not from the label "A2".

### 2026-10-16: sampling, not a test: real lines rewritten for a beginner (Josh)

12 character lines from the replays, Sonnet asked to make each one followable by a real beginner with a free hand (cut, drop, change words, split). Haiku's CEFR grade before → after: mostly A2/B1 → A1. What it did: one idea per sentence, present tense, idioms swapped for plain words ("sei di passaggio … o abiti da queste parti?" → "Sei in vacanza? O abiti a Trastevere?"), conditions and asides dropped ("se ti viene voglia basta un cenno"). What it lost:
- **The persona:** "Sei turista?", "Sei in vacanza?" — the learner is a newcomer staying a while, not a tourist.
- **Teaching in role:** Roberto's "assaggiare significa provare un piccolo pezzo" (the word Josh asked about) was cut.
- **Place:** Fonte Aretusa, Ortigia, the lungomare gone.
- **Voice:** "Io sono Elena. Sono una guida." reads like a textbook, not a person.
- **Length:** Rita's 50-word line only came down to 32; it kept every idea, just in smaller pieces. Fewer ideas, not smaller words, is what shortens a line.

Then, at Josh's request, **three whole conversation openings** (Giulia, Rosa, Rita; three character turns each, with Josh's lines) rewritten in context. Much better than lone lines: each reply still answered Josh, the teaching moment stayed (Rita's "assaggiare" explanation even grew, 26 → 28 words, in simpler pieces), and nobody became a tourist (Rosa just dropped "è in visita"). Ordinary turns roughly halved (17 → 8, 22 → 10, 25 → 11, 23 → 13). One slip: Rosa mixed Lei and tu. Lesson: simplify with the conversation in view, and let a teaching moment be longer if it's simpler.

### 2026-10-16: Beginner blocks in the prompt (replay, testing only)

Two blocks from `content/<country>/prompts/levels.md` added to the end of the character prompt (`--level`), against today's prompt. Italy: `test:replay` (Josh's real lines, 3 own + 4 sample characters). Mexico: `test:conversations --seed=7` (simulated learners). Character lines graded by `grade-runs.mjs` (scratchpad): Haiku CEFR per line, and the share of each line's words a beginner (listeners 1–2) knows.

| Arm | Lines | Words (median) | CEFR A1 / A2 / B1+ | Beginner knows (median) | Lines at 90%+ | Alive |
|---|---|---|---|---|---|---|
| Italy today | 43 | 22 | 16 / 40 / 44% | 84% | 23% | 5.2 |
| Italy situation | 43 | 10 | 58 / 42 / 0% | 100% | **68%** | 4.4 |
| Italy shape | 43 | 13 | 26 / 72 / 2% | 92% | 60% | 4.8 |
| Mexico today | 35 | 25 | 3 / 40 / 57% | 85% | 26% | 8.0 |
| Mexico situation | 35 | 13 | 40 / 57 / 3% | 93% | **66%** | 6.4 |
| Mexico shape | 35 | 16 | 14 / 83 / 3% | 91% | 59% | 6.4 |

(Alive: Italy from the replay judge, 1–10, 3–6 scored conversations per arm; Mexico from test:conversations' grader, a different scale. Small samples.)

- **The short "situation" block wins in both countries.** One sentence describing the learner beat the list of how to talk. That fits character.md's principle (describe the situation, not how to talk).
- **The cost is life:** characters get plainer and more generic (Giulia: "Un caffè lungo, subito! Preparo la macchina."; Sofía "a generic, friendly dispenser of simple lines"). Next: the same sentence plus one asking them to stay themselves ("situation, still you").
- They still pull back well when lost (Sofía: "¡Claro, Jake! Despacio. Es gratis. No pagas. Es para ti.") and still answer "come si dice" in role.
- Found on the way: the quality judge was cutting off about one conversation in four (fixed, 0e3fb30).

### 2026-10-17 (overnight): round 3, bigger samples and repeats

Italy: `test:replay --others=9` (12 conversations, Josh's lines). Mexico: `test:conversations --count=9 --seed=11` (only 5 conversations: one character per city). "Lines at 90%+" = lines where a beginner knows 90% of the words. Alive: Italy from the replay judge (1–10), Mexico from test:conversations' grader (its own scale).

| Arm | Italy words | Italy at 90%+ | Italy alive | Mexico words | Mexico at 90%+ | Mexico alive |
|---|---|---|---|---|---|---|
| today | 24 | 25% | 5.4 | 26 | 51% | 7.6 |
| today (repeat) | 23 | 27% | 5.3 | 24 | 45% | 7.4 |
| situation | 12 | 59% | 4.4 | 13 | 79% | 6.6 |
| **still you** | 16 | **63%** | 5.0 | 14 | **77%** | 7.2 |
| **still you (repeat)** | 15 | **60%** | 4.9 | 15 | **86%** | 7.4 |
| still you, in the newest message | 15 | 61% | **5.6** | 15 | 71% | 6.8 |
| still you, with subtitles | 13.5 | 55% | 5.3 | 13 | 91% | 6.8 |
| still you, Haiku replies | 15.5 | 43% | 4.3 | 15 | 59% | 7.0 |

Reply time (Italy, median): 3.1–3.5 s on Sonnet, **1.6 s on Haiku**.

- **Noise:** repeats agree within about 3 points on level and 0.1 on alive in Italy (12 conversations); Mexico (5) wobbles more, 6–9 points. Differences smaller than that aren't real.
- **"Still you" is the pick.** As simple as "situation" in both countries (Italy 60–63% against 59%), livelier (Italy 4.9–5.0 against 4.4; Mexico 7.2–7.4 against 6.6, close to today's 7.4–7.6), and steady across a conversation (Italy early 66–69% → late 61–64%). Today's prompt is 25–27% in Italy.
- **Placement:** in the newest message Italy was livelier (5.6, above today's) but Mexico less (6.8); mixed, so keep the simpler system-prompt placement for now and retest with more Mexico conversations.
- **Subtitles line:** best in Mexico (91%), worst of the level arms in Italy (55%); inconclusive.
- **Haiku:** half the wait (1.6 s), but holds the level less well (Italy 43%), understands garbled lines less (72% against 77–93%) and is flatter in Italy (4.3). Not yet; worth another try with a stronger level block, since speed is the other goal.
- Italy's alive scores are low for every arm, today's included (target 7): that's a separate problem from levels. **Correction (round 8):** mostly not. Italy's alive comes from the replay's judge (`quality.md`), Mexico's from `test:conversations`' own grader, a different prompt. Scored by the same judge (`quality.md`), round 6's Mexico conversations get 5.6 against Italy's 5.2.

**Follow-up (round 4):**

| Arm | Words | At 90%+ (early → late) | Alive | Reply time |
|---|---|---|---|---|
| Italy, Haiku, block in newest message | 13 | 57% (61 → 54%) | 4.4 | 1.7 s |
| Mexico seed 11, Haiku, newest message | 18 | 57% (87 → 27%) | 7.2 | |
| Mexico seed 12, today | 24 | 24% | 7.6 | |
| Mexico seed 12, still you | 15 | 66% | 7.4 | |
| Mexico seed 12, still you, newest message | 15 | 77% | 7.2 | |

- **Haiku does better with the block in the newest message** (Italy 43% → 57%, near Sonnet's 60–63%) at 1.7 s, but it still misreads garbled lines (69%) and is flat in Italy (4.4), and in Mexico it slid back late in the conversation (87% → 27%). Speed is real; Haiku isn't ready for characters yet.
- **Placement on Sonnet stays a tie:** across two Mexico seeds, newest message 71% and 77%, system prompt 77–86% and 66%. Keep the system prompt.
- Today's prompt on new characters (seed 12): 24%, like Italy. The Beginner block roughly triples it everywhere.

**Questions (round 5, 2026-10-17).** Josh asked whether question asking had been considered. It hadn't been measured. A beginner needs something to answer, and reply buttons work best after a yes/no or a "this or that". New measure (`qtype.mjs`, Sonnet): the kind of question each character turn leaves (none, yes/no, choice, one fact, open) and whether a learner a few weeks in could answer it in a word or two. It rates the question alone, so it flatters hard turns that end on an easy question.

Round 3 recounted: the Beginner blocks cut questions. Turns a beginner can answer fell from 80–88% to 76–78% in Italy and from 80–83% to 43% in Mexico, and choice questions went from 11–18% to 0%.

| Arm | Italy at 90%+ | Italy answerable | Italy alive | Mexico at 90%+ | Mexico answerable | Mexico alive |
|---|---|---|---|---|---|---|
| still you (control) | 66% | 79% (choice 1%) | 5.1 | 60% | 54% (choice 0%) | 7.8 |
| still you, can answer | 59% | 99% (choice 30%) | 4.8 | 80% | 74% (choice 34%) | 6.4 |
| still you, ask | 66% | **100%** (choice 46%) | 4.7 | 77% | **97%** (choice 43%) | 6.8 |

- **"Ask" brings back questions without costing the level,** but overshoots: every turn ends on a question, often a tacked-on "sì o no?" ("Ti piace la ciliegia, sì o no?"). It reads as an interrogation, and alive drops (Mexico 7.8 → 6.8).
- **Next (round 6):** "still you, sometimes ask", which asks for an easy question only "now and then, when it comes naturally". Two runs to check the noise.

**Round 6:**

| Arm | Italy at 90%+ | Italy answerable | Italy alive | Mexico at 90%+ | Mexico answerable | Mexico alive |
|---|---|---|---|---|---|---|
| still you, sometimes ask | 68% | 100% (choice 41%) | 4.9 | 91% | 89% (choice 31%) | 6.8 |
| still you, sometimes ask (repeat) | 62% | 97% (choice 34%) | 5.0 | 80% | 77% (choice 31%) | 7.0 |

The share of turns ending on a tacked-on "sì o no?" / "¿sí o no?" was checked by hand as a diagnostic, not a filter: still you 0–3%, sometimes ask 0–9%, ask 17–18%.

- **"Now and then" doesn't make questions rarer:** Italy still asks on nearly every turn. But the questions come from the moment more than with "ask" ("Con zucchero o senza?" rather than "Ti piace, sì o no?"), forced tags are half as frequent, and alive is between "ask" and "still you".
- **The level holds** (Italy 62–68%, Mexico 80–91%, against "still you" at 60–66% and 60–86%).
- **The new pick is "sometimes ask"**: answerable turns go from about 54–79% to 77–100%, and choice questions come back for the reply buttons. It costs a little life on the judge (Mexico 7.8 → 6.8–7.0 against this round's control, which is high: round 3 had 7.2–7.4), so Josh's ear decides.
- The alive judge may itself mark down a turn for ending on a question; checked in round 8: it doesn't.

**Round 7: reply buttons, written by a separate call (2026-10-17).** For levels 1–3 of [beginner-scaffolding.md](beginner-scaffolding.md): after each character line in round 6's "sometimes ask" conversations, a "clicks" prompt writes two whole-line replies on one frame, given the conversation so far (`replies.mjs`, prompt v1). Sonnet judges each pair (sensible answer to the last line, same frame, whole sentence, beginner-readable, distinct, English right, correct). "Ready" means written before the character's line finishes at beginner speed (about 2.3 words a second).

| Writer | Pairs | All good | Sensible | Distinct | Correct | Median time | Ready before the voice ends |
|---|---|---|---|---|---|---|---|
| Haiku, Italy | 76/76 | 89% | 93% | 97% | 97% | 2.4 s | 100% |
| Haiku, Mexico | 35/35 | 80% | 89% | 97% | 100% | 2.2 s | 100% |
| Sonnet, Italy | 72/76 | 90% | 96% | 96% | 97% | 1.4 s | 100% |
| Sonnet, Mexico | 33/35 | 91% | 97% | 97% | 97% | 1.3 s | 100% |

- **A separate call works, and time isn't a problem:** both writers finish well before the character stops speaking. Sonnet was faster than Haiku here (Haiku thinks longer); Sonnet's 6 misses were replies that weren't JSON, which structured output fixes.
- **The main failure is the yes-or-no trap:** keeping both replies on one frame after a yes/no question gives "Sì, vorrei un cornetto" and "Sì, vorrei un bicchiere d'acqua", or "Sì, mi piace il mare" to "Ti piace l'arancia?". Next: one reply yes and one no. Also some near-duplicates ("piove molto" / "piove spesso") and replies answering an earlier question rather than the last one.

v2 (one reply yes and one no; different choices, not two wordings; answer the last thing asked):

| Writer | Pairs | All good | Sensible | Same frame | Distinct | Median time | Ready |
|---|---|---|---|---|---|---|---|
| Haiku, Italy | 76/76 | 93% | 100% | 96% | 100% | 2.2 s | 99% |
| Haiku, Mexico | 35/35 | 94% | 97% | 97% | 100% | 2.7 s | 100% |
| Sonnet, Italy | 73/76 | 92% | 100% | 93% | 100% | 1.4 s | 100% |
| Sonnet, Mexico | 33/35 | 100% | 100% | 100% | 100% | 1.3 s | 100% |

- **Fixed:** "Anche un cornetto?" → "Sì, voglio anche un cornetto, grazie." / "No, solo il caffè, grazie."; "¿Le gusta el picante?" → "Sí, me gusta mucho el picante." / "No, no me gusta mucho el picante." What's left is mostly the judge being strict about the frame ("Con zucchero" isn't "Il caffè con…").
- **Pick: Sonnet, v2,** with structured output (it's faster than Haiku here). Now in `content/<country>/prompts/replies.md` and `lib/replies.ts`, used only by `test:conversations -- --learner=tap`.
- **Seen, not yet fixed:** a "no" can be blunt or sour the moment ("No, no me gusta Oaxaca" to a proud local; "No, non voglio un caffè" to a host). A polite no that keeps the conversation going is the next prompt tweak.

**Round 8: does the alive judge mark down questions?** Round 6's conversations judged as they are and with the closing question removed from each character line (`quality.md` judge, 3 runs each).

| | With questions | Without |
|---|---|---|
| Italy, every line | 5.22 | 5.14 |
| Italy, last line only (never answered) | 5.33 | 5.25 |
| Mexico, every line | 5.60 | 5.33 |

- **No:** removing questions doesn't raise alive, so "sometimes ask"'s small alive cost isn't the judge penalising questions.
- **Italy isn't flatter than Mexico on the same judge** (5.2 against 5.6). The gap in earlier rounds came from two different judges. On `quality.md` both countries sit around 5, below the target of 7; that's the liveliness problem, in both countries.

## Notes from Josh (2026-10-16)

- **Learners and characters may be levelled differently.** A character's line is judged for listening (would this learner understand it?); a learner's speech is production, transcribed by Whisper, short and full of errors. Ground truth for learner speech would be learner language graded by examiners (e.g. a learner corpus), not exam listening scripts.
- **Use existing reading-level resources.** Graded readers by level (Italian publishers' series) and easy-read news are large, already levelled, and include C1, which the exam lines lack. Next ground truth, and a source of examples for a few-shot judge (approach 3).

## Ideas to keep (Josh, 2026-10-16)

Words per level, used without being deterministic, loosest first:
1. Measure only: the judge marks hard words after the line is written (approach 4); nothing goes in the prompt.
2. Say the budget, not the words: "mostly everyday words; a harder one, say it and its English" in the prompt; approach 4 checks it.
3. The learner's own words: what they've said or been taught in their conversations counts as known. A record, not a prediction; any language; soft hint in the prompt and a per-learner coverage score.
4. Fixed lists per level in the prompt: deterministic, one language only, and the research found it backfired. Kept out.
