# The mix: code-switching with glosses

A draft, not decided (2026-11-13). Josh: "I want to try and formalize this mix use - because it is going to be the model ffor all beginner levels, replace into, and may be used in intermediate." Everything below that isn't quoted is Claude's proposal.

## The name

What bilinguals do when they talk to someone who doesn't share their language: they speak English, slip in a phrase of their own language because it carries the meaning, the feeling or the place, and **gloss** it (say what it means in English). Linguists call it **code-switching** (within a sentence, **code-mixing**); the wider view is **translanguaging**. Josh's research, 2026-11-13: idioms and culturally loaded phrases are said in the language and then glossed; ordinary ideas are said straight in English.

That is the Beginner turn already: a bilingual local talking to a visitor. Proposed words for the glossary:
- **the mix**: a turn in English with pieces of the language in it.
- **the character's question** (Josh, 2026-11-13): "How much English does this learner need to follow me?" Every level is an answer to it.
- **piece**: a word, phrase or short sentence in the language.
- **gloss**: a piece's English, right beside it.
- **echo**: a whole sentence in the language, then the same sentence in English (Josh, 2026-11-13: "echo 50/50 can be easier than mix 70/30").
- **unsupported run**: a piece the learner gets no English for.

## What it's for

The learner understands every line, and hears the language in pieces small enough to catch and say back. Josh, 2026-11-13: "I bigger issue is the runs of spanish without English support"; "5-10% less sspanish is hard for a non spanish speaker to pick out". So the measure is support, not the amount.

## One rule, every level

**Every piece the learner doesn't already know has its gloss.** The only language without one is what they already know: what they said themselves, what was glossed earlier in the visit, and greetings.

## The dials (by level)

Josh: "Could level prompts be as easy as saying not much, a bit more, more".

| | Step 1 | Step 2 | Step 3 | Intermediate |
|---|---|---|---|---|
| How much | not much | a bit more | more | mostly the language |
| Piece size | a word or phrase | a phrase | a short sentence | sentences |
| Which pieces get a gloss | all | new ones | new ones | when asked |
| Patterns | mix | mix, echo | mix, echo | — |

Patterns can be combined in a turn: Josh, 2026-11-13: "pastiche of mixed then echo - then mix".

## Where it's used

- **All Beginner steps:** the table above.
- **The first turn of a visit:** Josh, 2026-11-13: "I'd cut the intro as it is now and just start as before in the charracters conversation". The visit opens on an ordinary turn of the character's conversation, in the mix like every other turn; no sheet, no subtitles. (Not built; the intro is still live.) The feature idea that remains (Josh, 2026-11-13): "with the intro gone, enrich the content in the first turrn". With it, his earlier words: a first turn that "should offer something that iss a break from getting quizzed, but in character mode", and on return visits "less about job or weather, more about the culture or family or something else".
- **Intermediate: the same model, less English** (Josh, 2026-11-13): "i think this one \"mixed model\" coulld expand to intermediate. Our intermediate is HARD. so a mixed model still has a role there. I think the mental model of the character should be \"How muuch english does this learrner need to follow me\" an intermediaatte speaker needs a lot less, but if the charactter wants to start using more complicated verb tenses or talking about more partticular vocab, mixed would help". So one question for every character at every level; Intermediate's line is mostly the language, with the hard bits (a new tense, a particular word) marked and glossed in the same shape (Claude: "Le radici {scendono | come down} dai rami"). Fits B13 (Nunzio's "corteccia", "scendono"). Also when the learner asks for help.
- **The other way round (an idea):** the character asks the learner a favour, "come si dice in inglese?" (dialogue-ideas.md, 2026-11-13).

## What the numbers say (2026-11-13)

Turns with a run of 3+ words in the language and no English (`tests/experiments/unsupported-runs.mts`, a judge; the replays are `tests/experiments/b2-turn-length.mts` on five of Josh's 11-12 visits, 40 turns):

| | Unsupported runs | Spanish |
|---|---|---|
| Josh's real turns, 11-12 evening (100) | 62% | ~50% |
| Step 1 as it was (12i), replayed | 63% | 45% |
| Step 1 on main (13a), replayed | 46% | 32% |
| 13a told "each with its English right after it, like an echo: never {language} on its own", replayed | 41% | 28% |

The wording moves it, but not to zero: what's left is mostly stock phrases ("que le vaya muy bien", "qué bueno, joven", "fue un gusto") and a sentence the character adds of its own.

## How to get it to zero (proposal)

Prompt wording asks for the rule; structure would guarantee it. The character writes its turn as pieces, each piece in the language with its gloss, and English in between; the code puts the line together, so an unsupported run can't happen, and the level's dials (how many pieces, which get a gloss, echo or not) become settings in code rather than sentences in a prompt (dialogue-model.md, "Content and display are separate", 2026-11-07).

History to know: Beginner step 1 used a parts reply until 2026-11-10q and was moved to one line, after Josh called a phrase repeated around its English a "sandwich" ("weird"; tests/check-beginner-2.ts). The proposal isn't the sandwich: each piece is said once, with its gloss once.

## Research (2026-11-13; Josh: "I like the proposal but lets research a bit more")

**Teaching methods that already do this:**
- **The diglot weave** (Robert Blair, Power-Glide courses): words and phrases of the target language woven into a text mostly in the learner's own language, more of them as the learner goes; also called the substitution method or "sandwich stories". The closest match to the steps. Claims of large vocabulary gains come mostly from companies that sell it; a caution from the Open University: it can teach a habit of mixing, and it gets harder with more and harder words.
- **Dodson's bilingual method** (1967) and its **sandwich technique**: the teacher says a phrase in the target language, its meaning in the learner's language, then the phrase again, so the learner can say it back. Revived by Butzkamm & Caldwell (2009); some classroom studies supported it. It's the echo with the phrase said again at the end. (The step-1 check bans a "sandwich repeat" Josh called "weird", tests/check-beginner-2.ts.)
- **Research on learners and code-switching** is mostly about advanced learners reading or hearing it (e.g. Treadway, Higdon & Valdés Kroff, Isogloss 2025, eye-tracking with L2 Spanish learners); nothing found on glossing by an AI for beginners.

**Outside design input (an AI answer Josh passed on), against Fuori:**
- *Fits:* the language for what carries meaning or culture (idioms, set phrases, the local thing), English for the rest; a short conversational gloss, not a dictionary one; switches at phrase boundaries; density as a dial; staged generation (plan, insert, gloss), which is the structure proposed above; a check after generation that every piece has its gloss (`unsupported-runs.mts` is that check, run offline).
- *Different here:* it's written for a bilingual voice talking to an English speaker; Fuori's learner is learning, so what goes in the language should also be what they can catch and say back, and grow with the level (the diglot weave's point).
- *Open (Josh's call):* a bank of local phrases per city with glosses (its "idiom memory") would be pantry content, which CLAUDE.md allows; few-shot examples against "keep the prompt short".

## Idioms (Josh, 2026-11-13)

Josh: "I know italian better than Spanish - in Italy idioms are a major part of daily speech and an imporrtant way of showwingnig fluency -- i saw a note about city based idioms (which can exists especially in places like Palermo, Rome, Venezia, Napoli) where dialect is strong -- but 98% of idioms are national. The using phrases you've \"heard\" seems importanrt, but so much of what you hear doesnt really register. Idioms stick".

Claude's proposals from it, not decided:
- Idioms at every level, glossed in two parts, the picture then the meaning, so the picture is the hook: {in bocca al lupo | into the wolf's mouth: good luck}.
- Layer C (the outside design's "idiom memory") as a store per language, with a few local ones for dialect cities, not a phrasebook per city.
- Recycling: the idioms a learner has met come back from other characters (the conversation record already keeps what they met).
- One idiom a visit, where it fits, not one a turn: what's in the prompt gets copied (the "Mire" lesson: 72% of turns at 12h, 33% at 12i once the example went).
- **Where the idioms come from** (Josh, 2026-11-13: "the syllaabi may be a good source - maybe they are easy to come by"): the syllabi are data already, checked by a second teacher. Italian: b2-13 "Colloquial Italian among friends" and c1-13 "How Italians really talk" (about 10 each: sono al verde, quattro gatti, ce l'ho messa tutta, daje); Mexico: c1-11 "Sayings and idioms" (about 10: ¡échale ganas!, la regué, ponte las pilas, camarón que se duerme…). Each with its gloss, situations and culture note; the unit's level gives a first importance. Small, and only at B2–C1, so: (1) those units, (2) idioms tagged from the other units' key phrases (about 610 a language) with their unit's level, (3) common national idioms the syllabi lack, written by a model and checked (Josh for Italian, a native speaker for Mexico).
- **Short and common** (Josh, 2026-11-13: "we might favor shotter and common"): the first stores (books-private/syllabus-working/shortlist-it.md, shortlist-mx.md, 100 each) take very common or common idioms of 2 to 7 words, ranked by how common, then shorter, then found in more sources; a short idiom is easier to catch and say back. Sources read 2026-11-13: for Italy, the slang book, Zullo, 1001 phrases, Les 800 expressions, four modi di dire collections and Un tesoro di lingua (842 merged); for Mexico, Seven Keys, Word Power, the Compendio temático, Iribarren's El porqué de los dichos, refranes lists, food dichos and two web pages (5,555 merged, 3,258 said in Mexico); biblical sayings for both (Josh: "i included the bible idioms intentionally"). The Academia Mexicana's Refranero mexicano was not collected: its robots.txt bars AI crawlers (a reference for a person checking).
- **Weighting (Josh, 2026-11-13):** "the game will sound crazy if people just echo the idiom over and over. I know it goes against some of the rules - but weighting can help with variety - the most important idioms (+) and how recently it was used (-)". Code picks one idiom and gives it to the character (no list in the prompt to copy), as Beginner setups are already picked by weight (lib/beginner-2.ts pickSetup). Claude's refinement: two recencies, the game's (not twice from one character or in one evening) and the learner's (the spacing effect: an idiom met before comes back when due, after a growing gap): score ≈ importance × due for this learner − heard just now. The rule it touched: CLAUDE.md limited hand-written content to city pantries, Magda and level rules; **an idiom store per language is allowed (Josh, 2026-11-13: "3 yes"), and CLAUDE.md now says so**; it isn't a phrase list in "no phrase lists" (that rule is about predicting what people say).

## From the walk-through of the outside design (2026-11-13)

Josh and Claude went through its five layers (A the model, B the brief, C a phrase store, D the chooser, E the editor). What it added to this draft, not decided:
- **Three bins, not two**, sorted by "how much English does this learner need": known (the language, no gloss), new and worth catching (the language with its gloss), too hard now (English). The ladder is the first bin growing. Josh's example: Nunzio's "le radici scendono dai rami" (67edfe03) belonged in the second bin, for the words and for the thing itself (roots that come down); it was played as the first, and the help came only after he asked twice.
- **Code sets the budget, the model spends it** (layer D): code decides how many pieces, whether there's an idiom and which, gloss all or only new; the character picks the words. No thinking pass or separate chooser: both cost the wait before the voice.
- **One record of the learner** (what they met, said and missed; the visit summaries already keep most of it) feeds the bins, the idiom spacing and a check after each visit of what was left unglossed for them.
- **The learner's signals count:** asking for help moves things into the second bin for the rest of the visit (B13).
- **Editing** (layer E): live, the braces and the code check (assemblePieces); afterwards, the model judge (unsupported-runs.mts). No live rewrite: Josh: "speed" (the voice starts on the first sentence).
- **No fine-tuning** (layer A): the model writes the mix well; the fixes are in the brief and the code around it.

## Measures

The amount of the language, unsupported runs, turn length; and Josh's ear, which decides.
