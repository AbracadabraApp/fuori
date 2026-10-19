# Syllabus Research: What a Learner Knows, Level by Level

2026-10-19 · Josh · From textbooks and guides Josh provided. Summaries are in our own words; only short everyday phrases are quoted. The books' text, dialogues and pictures are not in the repo and must not go into the app.

## Sources

| Source | Level | Used for |
|---|---|---|
| *Nuovissimo Progetto italiano 1a* (Edilingua), student book + workbook | A1 | `a1-progetto-1a.md`, A1 words, A1 cards |
| *Nuovissimo Progetto italiano 1B* | A2 | `a2-progetto-1b.md`, A2 words, A2 cards |
| *Nuovissimo Progetto italiano 2*, workbook | B1–B2 | `b1-b2-progetto-2.md` |
| *Nuovissimo Progetto italiano 3*, workbook answer key and audio transcripts | C1 | C1 grammar topics (in `b1-b2-progetto-2.md`); transcripts are known-C1 speech for checking the level judge |
| *Italian Grammar You Really Need to Know* (Proudfoot) | all | `functions-grammar.md`: 22 functions, the grammar each needs, CEFR level |
| *Beginner's Guide to Italian*, *English Grammar for Students of Italian*, *Le preposizioni italiane* (Italiano al caffè) | A1 and reference | Notes below; material for Magda's explanations |
| *Must-Know Italian Slang Words & Phrases* (ItalianPod101) | — | Notes below |

The three Progetto books are scans; they were read with OCR, so a few pages (crosswords, picture matching) were unreadable. Each file says where.

## Files

- **`a1-progetto-1a.md`, `a2-progetto-1b.md`, `b1-b2-progetto-2.md`:** per unit, what the learner can do, key frames, grammar in order, vocabulary themes, settings; then the order and pacing.
- **`functions-grammar.md`:** each communicative function (personal information, location, prices, the past, opinions…) with its grammar and level, and a newcomer's first-week order.
- **`chips-vs-syllabus.md`:** Fuori's 10 beginner chips checked against A1–A2.
- **`level-words-it.csv`:** 1,479 everyday lemmas (`lemma,pos,level,unit,theme`), each at the level and unit where a learner first meets it (A1: 786, A2: 693). For measuring what a beginner can follow, in place of Kelly (`docs/level-judge-test.md`: Kelly's levels are newspaper frequency). Spot check: *frigorifero* A2, *pranzo* A1, *cognome* A1, *scontrino* A1; *regolamento*, *provvedimento* absent.
- **`prepositions.md`:** di, a, da, in, con, su, per, tra/fra: uses with examples, the articulated forms, the classic beginner confusions (a vs in with places, da), what A1 needs first. From *Le preposizioni italiane*.
- **`grammar-terms.md`:** 52 grammar points by level (A1–B2), each explained through English with the trap for English speakers, plus the 10 questions a beginner asks most with one-line answers for Learn. From *English Grammar for Students of Italian* (Adorni & Primorac).
- **`anki-a1-a2.csv`:** 187 A1–A2 phrase cards (Italian, English, tags), importable into Anki; Josh's own study.

## The progression in one table

| Level | Book units | Grammar milestones | Everyday situations |
|---|---|---|---|
| A1 | 1a intro–5 | present tense, essere/avere, articles, prepositions, modals, c'è; **passato prossimo** (Unit 4, half-way); future (Unit 5) | greetings, introductions, *tu / Lei*, free time, home, times and prices, the bar (Unit 4), train tickets, weather |
| A2 | 1B 6–11 | possessives, **imperfetto**, object pronouns, *ne*, reflexives, **imperative**, **conditional**, impersonal *si* | restaurant meal, supermarket and deli (etti, chili), clothes shopping, directions, TV, music, opinions |
| B1 | 2, Units 1–5 | combined pronouns, relatives, comparisons, *passato remoto*, **subjunctive** (Unit 5) | exams, money and work, travel, history, health |
| B2 | 2, Units 6–11 | *Lei* imperative, imperfect/pluperfect subjunctive, **hypotheticals** (Unit 8), **passive** (9), **reported speech** (10), gerund/participle | country life, technology, art, social problems, reading |
| C1 | 3 | 30 short units; see `b1-b2-progetto-2.md` | — |

## What it means for Fuori

- **A word list for "can a beginner follow this line?"** `level-words-it.csv` gives a fixed, everyday-weighted list per level, so the measure can be a count instead of a judgement. Next: compare its verdicts with the `level.md` judge on the replay set.
- **Grammar per level for the levels block.** A beginner character should stay mostly in the present, with the past (*ho fatto*) as the first stretch; the imperfect, imperative, conditional and *ne* are A2. Characters will still use some (directions, "Quanto ne vuole?"), so keep those lines short and guessable.
- **Chips.** Eight of the ten beginner chips are A1. *Buy at the market* is A2 (quantities, *ne*); *Ask for directions* is A1 to ask but A2 to understand. A1 also covers likes and free time, where you live, what you did, and the weather, which have no chip yet. See `chips-vs-syllabus.md`.
- **The phrase cards are Diario material** (Josh, 2026-10-19): `anki-a1-a2.csv`'s 187 A1–A2 phrases, with English and topic tags, are close to what the Diario's chips need. They can seed each chip before the learner has phrases of their own, and check that the beginner chips cover A1–A2. The learner's own phrases come first.
- **Rejected: bring your own textbook** (Josh, 2026-10-19: "hate this idea"). No learner-supplied course material seeds the Diario or Learn.
- **Order differs where the game needs it.** The books delay ordering at a bar to Unit 4; Fuori's world starts there. *Vorrei* as a fixed phrase is how both handle it.
- **Fluency first, correction later** (the books' teacher notes) matches recasts in character and corrections in the review.

## The smaller books

**Beginner's Guide to Italian.** A grammar primer in English; nothing new for the syllabus. Its *tu / Lei* table (Scusa / Scusi, Come ti chiami? / Come si chiama?, Dove abiti? / Dove abita?) is a handy check that characters keep `{formality}` consistent, a drift seen in the trials.

**English Grammar for Students of Italian** and **Le preposizioni italiane.** Explanations in English of what each grammar point is, and a clear guide to prepositions: material for Magda's lessons and Settings → About, not the game world.

**Must-Know Italian Slang Words & Phrases.** Mostly young people's slang (*scialla, raga, tranqui, che pizza, uffa*), one lesson on Rome (*bella* as hi and bye, *famo*, *come butta?*), food idioms, and vulgar word charts. Slang belongs to who a character is (a young Roman barista), not to a level, and to advanced learners where dialect grows with level. Treat it with care: several entries are niche or doubtful (*pollege, brenso, jamairo*), and some glosses are wrong (*cavolo* is a mild "darn", not the swear word given). Check any slang with the judge or a native speaker before using it.

## Where the full texts are

The full extracted text of every source (OCR for the three Progetto scans) and the working files are on Josh's laptop at `~/fuori/books-private/`, excluded from git via `.git/info/exclude`. Use them for further analysis; never commit them or put their text in the app.
