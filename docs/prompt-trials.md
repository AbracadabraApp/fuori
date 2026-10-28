# Prompts: what exists and what's been tried

**Read this before writing a new prompt** (Josh, 2026-10-18: someone may reinvent a prompt for one purpose when an existing one is already better). First check whether an existing prompt does the job, or most of it; then check below whether the idea was already tried.

Each prompt's own changelog (bottom of its file) records the versions that shipped. This file adds what's easy to lose: what each prompt is for, and trials that didn't ship. Add a row in the same commit as the trial, even when it's dropped. The text of a deleted trial stays findable by its commit.

## What exists

All in `content/<country>/prompts/`, one copy per country.

| Prompt | What it does | Runs in production | Reuse it for |
|---|---|---|---|
| `character.md` | A character's next line, `{ line, en }` | Every turn | Anything a character says, including lines written outside a live conversation (a Diario card's line and answers) |
| `levels.md` | Level blocks appended to the character prompt | Josh's Mexico learner only (`LEVEL_TRIAL`) | Making any character line easier |
| `replies.md` | Two whole-line replies on one frame, answering the character's last line; its Choose prompt writes one that fits and one that doesn't (2026-10-22) | Yes: the reply buttons while scaffolding (`/v1/replies`) | Reply buttons, Diario card replies |
| `magda-teaching.md` | Magda's lessons | Conversations with Magda | Explicit teaching |
| `onboarding.md` | The greeter: follow-up, placement, send-off | Once per new learner | — |
| `say-it.md` | Say it in English: the one line in the language the learner reads out loud, the gist at their level | Yes, from 2026-10-23 (`/v1/say-it`) | Turning what a learner means into a line they can say |
| `name.md` | The learner's name out of their spoken answer ("My name is Josh" → Josh), any language | Once per new learner (`/v1/onboarding/name`) | Picking a name or short fact out of a spoken answer |
| `memory.md` | After a conversation: the character's notes, and review phrases, mistakes, missed, English | Every conversation | What the learner got wrong or needed (the Diario's frames start here) |
| `study-file.md` | The learner profile Magda reads | Every conversation | — |
| `quality.md` | Judges a conversation (alive, replies that don't follow, …) | Every conversation; also the replay judge | Judging dialogue |
| `learner-level.md` | The learner's level from their first conversations | No (`LEVEL_CHECK` off) | Placing a learner |
| `level.md` | Which words of a line a beginner knows | No (replay and experiments) | Measuring any line's level |
| `learn.md` (Italy only so far) | The Learn page for one conversation: corrections, words, good to know, as JSON | No (`tests/experiments/learn-page.mts`) | Reviewing a conversation for the learner |
| `lesson.md` (Italy only, trial) | A Learn lesson: one syllabus unit taught from the learner's study file and recent conversations, in five steps (your line, examples in the voices of people they know, notice, say it, take it to town), as JSON | No (`tests/experiments/lesson.mts`; first run 2026-10-27 for Josh, unit a1-15) | Teaching a syllabus unit outside the world |

Experiment prompts live inside `tests/experiments/*.mts` and are listed below when they're tried.

## Trials

Measures are only comparable within one block (same judge, replay set and history window). The block says what it was measured on.

### character.md

Measured on the replay, Italy, 28 conversations, whole-conversation history (from 2026-10-18). Goal of these trials: faster, shorter replies without losing the rest.

| Version or trial | Status | Text | Wait | Words | Beginner follows | 2+ questions | Garbled understood | Alive | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 2026-10-18 (long prompt), thinking | Replaced | 18bd99e | 3.4 s | 23 | 25% | 10% | 81% | 6.0 | Production before 18b |
| short, thinking | Tried | `character-short.md`, 5e20523 | 2.8 s | 16 | 39% | 8% | 88% | 5.1 | Became 18b |
| **short, no thinking = 2026-10-18b** | **Production** | `character.md` | **1.9 s** | 17 | 37% | 14% | 94% | 5.3 | Shipped (Josh: "take the best"), 55520dc |
| short2 ("Have a chat…", "Hello"), thinking | Dropped | `character-short2.md`, 03662a2 | 3.3 s | 20.5 | 41% | 9% | 84% | 5.3 | Longer than short |
| short2, no thinking | Dropped | same | 2.1 s | 22 | 40% | 23% | 91% | 5.4 | Longer; double questions |

Earlier, on the 6-message history (not comparable with the block above), 5e20523: short + Haiku 1.3 s but 21% double questions and broken replies (dropped); short + traits line 3.1 s, 20 words (dropped).

Core behaviours (round 18, `core-behaviours.mts`, 8 characters × 2 runs; goal: CLAUDE.md's behaviours hold on the short prompt):

| Version | "Say it in English" spoken in English | Mistake recast | How do I say / Come si dice / garbled / no unasked English |
|---|---|---|---|
| 2026-10-18, thinking | 0% / 0% (Italy / Mexico) | 31% / 44% | — |
| 2026-10-18b, no thinking (production) | 0% / 0% | 13% / 19% | 100% |
| 2026-10-18b, thinking | 0% / 0% | 19% / 13% | 94–100% |

English when asked, for dropping the English translation line (Josh, 2026-10-19). Goal: with no translation on screen, "what does that mean?" and "say it in English" get English in the spoken line, briefly; no English nobody asked for. Probes: `core-behaviours.mts` with `PROMPTS=`, 8 characters × 2 runs; real asks: `help-asks.mts` replaying Josh's real asks (Italy 23, Mexico 5–6, from the admin export; "wanting English" includes "how do I say X", where an answer in the language is right, so it understates).

| Trial | Status | Text | Say it in English (Italy / Mexico) | What does it mean | No unasked English | Real asks wanting English, spoken English | Decision |
|---|---|---|---|---|---|---|---|
| 2026-10-18b (production) | Production | `character.md` | 0% / 0% | 0–6% / 0% | 100% / 100% | 22% / 0% | — |
| + "They see no translation… tell them in English, briefly, then carry on" | Dropped | `character-english.md` | 0–13% / 0–6% | 0–13% / 13–19% | 100% / 100% | 48% / 20% | The JSON line still said `line` is "in {language}", so the English went into `en` |
| + same, and the JSON line: `"line": "what you say, out loud: {language}, and English only when they ask for it"` | **Best so far** | `character-english2.md` | **100% / 100%** | **94% / 63%** | 100% / 100% | 52% / 33% | Not yet: in long real conversations "what does X mean" is still often explained in the language; needs the replay gate before it ships |
| + "what something means, in English or in {language}" (CLAUDE.md: help comes in English either way) | Tried | `character-english3.md` | 100% / 100% | 88% / 81%; asked in the language 100% / 81% | 100% / 100% | 55% / 40% | "How do I say" fell to 69% Italy: "In English: you say 'Vorrei…'" |
| english3 + teaching: "When they get a word or a verb form wrong, use it the right way in your answer, in passing" | Tried | `character-teach.md` | 100% / 94–100% | 88% / 88%; in the language 94–100% / 88–100% | 100% / 100% | 50% / 60% | See teaching below |
| teach + "When they ask how to say something, just say it in {language}" | Tried | `character-teach2.md` | 100% / 100% | 75% / 88%; in the language 75% / 100% | 100% / 100% | 48% / 17% | Within noise of teach (16 samples swing about ±15%); replay gate decides |

Teaching in character (Josh, 2026-10-19: at all levels; vocabulary, gender or number, conjugation, dialect). Goal: characters pick up more of the learner's errors, in role, without lessons or longer lines. `teach-moments.mts` replays each chance the character missed in Josh's real conversations (Italy 78–79, Mexico 6–8: too few) and judges the new line; mistake probe from `core-behaviours.mts`.

| Prompt | Mistake probe (Italy / Mexico) | Missed chances now picked up, Italy (conjugation) | Sounds like a lesson | Words per line | Decision |
|---|---|---|---|---|---|
| 2026-10-18b (production) | 0% / 13% | 21% (17%) | 1 | 26.1 | — |
| `character-english3.md` | 6% / 31% | 23% (23%) | 6 | 26.6 | — |
| `character-teach.md` | 69–100% / 88% | 49% (37%) | 5 | 29.3 | Replay gate next |
| `character-teach2.md` | 81% / 75% | 42% (34%) | 3 | 28.5 | Replay gate next |
| `character-teach3.md`: english3 + "When they get a word or a verb form wrong and you know what they meant, use the right form in what you say next, in a statement, without pointing it out." | 56% / 81% | 35% (30%) | 6 | 27.5 | **Passes the gate within noise** (below). Written after reading teach's failures: recasts asked as questions ("Due caffè, allora? Oppure…?") and speech-to-text noise "corrected" ("Ettore, non attore") |

Replay gate, Italy, 25 conversations (Mexico has no replay set yet). Today's prompt run twice to show the noise.

| Prompt | Reply time | Words | 2+ questions | Garbled understood | Pulls back when lost | Alive | English unasked | Decision |
|---|---|---|---|---|---|---|---|---|
| 2026-10-18b, run 1 / run 2 | 2.0 / 2.0 s | 18 / 17 | 9% / 16% | 83% / 81% | 33% / 22% | 5.2 / 5.5 | 0 / 0 | — |
| `character-english3.md` | 2.1 s | 17 | 18% | 80% | 22% | 5.4 | 0.1 (two borderline: the learner had asked) | Within noise |
| `character-teach.md` | 2.3 s | 18 | **22%** | **69%** | 22% | 5.4 | ~0 | Fails |
| `character-teach2.md` | 2.4 s | 17 | **21%** | **74%** | 33% | 5.4 | 0 | Fails |
| **`character-teach3.md`** | 2.1 s | 18 | 9% | 82% | 44% | 5.3 | ~0 | **Candidate**; Josh decides |



### Reply buttons, choose stage (`replies.md` → Choose prompt, experiment `tests/experiments/reply-choice.mts`)

The third scaffolding stage (Josh, 2026-10-22): two replies, only one fits, the learner chooses and reads it aloud. The first three character lines of each of the 28 committed synthetic conversations per country (84 pairs each); a second model judges 7 checks (the one that fits is sensible; the other clearly doesn't fit here, is correct, isn't silly; picking needs understanding the line; beginner; English right). 2026-10-22.

| Version | Italy all checks | Mexico all checks | Misfit wrong here | Needs understanding | Median | Decision |
|---|---|---|---|---|---|---|
| v1: misfit answers another question, names the wrong thing, or belongs at another time; same frame | 70% | 75% | 87% / 87% | 90% / 89% | 1.7 s | Dropped: the misfit was often another fair choice (coffee at a market), or the greeting gave it away |
| v2 (shipped, 2026-10-22): misfit answers a *different question*, never another choice to the same one; both start the same; no word echoed from her line in one only | **92%** | **85%** | 99% / 99% | 95% / 94% | 4.5–5.1 s | **Kept.** Left: an occasional odd "per favore" on the misfit, the reply that fits echoing her words, some fitting replies above beginner (quisiera, he venido). Slower: still written while she speaks; watch whether it's ready in time |

### Learner's name (`name.md`, experiment `tests/experiments/name-from-heard.mts`)

Josh, 2026-10-22: onboarding said back "¡Mucho gusto, My name is Josh!". 16 fixed answers in six languages (whole sentences, a nickname, a surname, no name at all).

| Version | Italy | Mexico | Median | Decision |
|---|---|---|---|---|
| v1 (shipped, 2026-10-22) | 16/16 | 16/16 | 1.2–1.8 s | **Kept** |

### Say it in English (`say-it.md`, experiment `tests/experiments/say-it.mts`)

Josh, 2026-10-23: the learner says it in English, gets one line in the language back, reads it out loud. 35 lines per country: seven English requests (simple, two-part, rambling, "I didn't understand", "what does that mean", mixed, goodbye) against the opening lines of 10 synthetic conversations, beginners and intermediates; a judge checks 6 things. Some "fits" misses are the test's own (a coffee order at a flower stall).

| Version | Italy all checks | Mexico all checks | Meaning | Level | Median | Decision |
|---|---|---|---|---|---|---|
| v1 | 80% | 69% | 94% / 94% | 91% / 94% | 1.5 s | Two-part requests came back as two long sentences, too much to read aloud |
| v2 (2026-10-23b): the one thing that matters most, one short sentence (~8 words) for beginners, greeting only if they greeted | 69% | 60% | 80% / 86% | **100% / 100%** | 1.4–1.7 s | **Kept:** the judge marks the dropped half as lost meaning, which is the point (Josh: the gist at their level). Watch: it can invent a detail ("lo mismo de ayer" → *un café*) |
| v3 (2026-10-23c): first decide whether there's a line to write(`sendAsSaid`: already in the language, or too short/unclear) | 18 cases: Josh's 4 real Italian turns Whisper labelled English (Mohamed, 2026-10-23) and Spanish ones | | | | 1.2–4.0 s | **Kept:** all 4 of Josh's real lines and both Spanish ones go to the character as said; clear English and mixed requests still get a line; "Okay." and a misheard "C." no longer invent a request (v3 draft wrote *Sì, un tavolo per uno, grazie* and *Una canción, por favor* for them) |
| **v4 / v5 (2026-10-23d, e): a line only for clear English; and Whisper's English can be a translation** | Josh's real lines from Valeria, Rosa and Andrea (Mexico, Italy): garbled Spanish, Italian slips, Whisper's English translations of his Italian paired with the same recording heard as the language | | | | 1.0–2.5 s | **Kept:** "Perrin Ivar, Grat-grat-sius", "Gracias. Arrivederci.", "Il canto, señorita" go to the character; "I would like to eat a Nutella cone" + "Vorrei mangiare un cono alla Nutella" and "I'm going to go to the corner" + "Il cono" go to the character; real English (both versions English, since Whisper forced to the language writes English as English) still gets a line |

### Beginner level dialogue (`beginner.md`, trial; experiment `tests/experiments/beginner-dialogue.mts`)

Josh's goals (docs/beginner-scaffolding.md → Beginner level dialogue → Goals). Six of his real conversations replayed (Sergio, Andrea, Luisa; Valeria, Rosa, Ofelia), his lines as said, the reply as parts: English (heard), words, a question, answers to say back. Read by Josh side by side with what the character said that day.

| Version | What changed | Result | Decision |
|---|---|---|---|
| 2026-10-25-trial | First version from the goals | Shape right (one question a turn, answers offered, place and name first); English 36–54 words a turn against 7–18 in the language; praised and corrected ("Small fix: we say poca gente"); asked the name three times after Josh moved on; "Mi chiamo Anna" | Revised |
| **2026-10-25b-trial** | Two short English sentences at most; opener varied (history, culture; name only sometimes); follow the learner; no praise or corrections | English 14–29 words a turn, the language 8–19; Andrea let the name go ("your name can wait") when Josh chose flavours; one hard fact stated (Venice centre "around fifty thousand") | Josh: "not quite flowing but right direction" |
| **2026-10-25c-trial** | React first, the errand leads the questions, varied turn shape; opener can be country, region, city or weather; tested with a simulated beginner answering the character's own questions | Conversations run hello → name → choice → how served → extra → paying → goodbye (Andrea: pistachio, cone, honey, cream, card, arrivederci); 0.6–1.0 questions a turn; English 117–263 words over 9 turns per conversation, the language 98–140; the simulated beginner is tidy (mostly reads the offered answers) | Josh to read |
| **2026-10-27** (live) | The identity line takes the setting: the place's kind and the person's own line on why they're there (`here` in the city file), so nobody gets an invented job (Josh: a student sold him pizza, a woman in a square made coffee); no explaining how people talk ("that's how we ask it here"); in code, a phrase ending in "?" counts as the question | `tests/experiments/beginner-cast.mts` on Rome's 12 people, opener and a reply to "Ciao! Cosa fa qui?": every one in role (the barista works the counter, the student is between lectures, the sound engineer is off to set up a concert); none offered what they couldn't give | **Kept**
| **2026-10-27b** (live) | Answers about the learner that the character doesn't know (where from, job, how long here) leave the fact blank as …, like the name; never made up (Josh: "Sono di Londra is always the example") | `tests/experiments/beginner-blank.mts`, the turn after the name, 4 runs at four places: made up 7/7 (all London) → blank 8/8 | **Kept** |

### Diario cards (experiment, `tests/experiments/diario-cards.mts`)

Goal: cards worth reviewing, made from a real conversation. Round 17, admin export (Italy 28, Mexico 9 conversations).

| Version | Status | Pass 9 checks | Beginner follows line / replies | Decision |
|---|---|---|---|---|
| Today's stored review phrases (`memory.md`) as cards | — | 18–22% card-worthy | — | Not enough on their own |
| Card maker v1, one new prompt | Tried | 69% / 78% | 54% / 57% Italy, 38% / 35% Mexico | **Next: build from existing prompts instead** (`memory.md` picks frames, `character.md` + Beginner writes the line and answers, `replies.md` the replies), and compare |

### Noticing a conversation is over (experiment, `tests/experiments/end-detect.mts`)

Goal: the game knows when both have said goodbye, or the errand is paid and thanked (Josh, 2026-10-19), without ending anything early. Round 20, Italy, 26 real conversations, 153 character turns (Mexico: 1 conversation reached an end, too few). Truth: round 19's judge. Bar: ends early on 2% of turns or fewer, catches 90% of ended conversations.

| Way | Status | Ends early | Catches the end | Extra cost | Words per line | Decision |
|---|---|---|---|---|---|---|
| `over` on the character's reply (production `character.md`, trial schema) | Tried | 0% | 82% of 17 | none | 25.2 (25.6 without) | Recommended; changes `{ line, en }`, needs Josh |
| Separate judge after each line | Tried | 0% | 82% of 17 | a call, median 1.3 s, while the voice plays | unchanged | Same result for more cost |


### Learner gender (character.md 2026-10-21, experiment `tests/experiments/learner-address.mts`)

8 characters per country, 5 learner replies, a simulated learner who never shows their own gender; a judge lists every word for the learner that shows a gender. Right = agrees with the learner. 2026-10-21.

| Arm | Italy: right | Italy: conversations with a wrong one | Mexico: right | Mexico: conversations with a wrong one |
|---|---|---|---|---|
| Woman, gender unknown (today), first visit | 20% of 15 | 6 of 8 | 0% of 22 | 8 of 8 |
| Woman, unknown, returning | 10% of 10 | 6 of 8 | 0% of 13 | 5 of 8 |
| Woman, known (`{person}` line), first visit | 100% of 49 | 0 of 8 | 100% of 26 | 0 of 8 |
| Woman, known, returning | 100% of 29 | 0 of 8 | 100% of 25 | 0 of 8 |
| Man, unknown | 97% of 37 | 1 of 16 | 100% of 17 | 0 of 16 |
| Man, known | 97% of 31 | 1 of 16 | 100% of 38 | 0 of 16 |

**Kept.** Unknown, characters default to the masculine: benvenuto, bentornato, bravo, signore; bienvenido, mijo, amigo, cómodo. Told, they're right every time, and women get more gendered words, not fewer (49 against 15). The two wrong words with men are a stray "brava" and "l'ha mandata" (probably about someone else). The judge also counted the neutral "joven" as masculine, so Mexico's unknown-woman figures are a little low. The line is empty until the learner's gender is known, so today's prompt is unchanged; how it gets known (a pitch guess from the voice, their own corrections and agreement, Settings) is the next step.

### Learn page (`learn.md`, experiment `tests/experiments/learn-page.mts`)

Read by Josh, not scored: pages on his real conversations (Rosa, Franco, Sandro) and days of the modelled month.

| Version | What changed | Result | Decision |
|---|---|---|---|
| 2026-10-20 to 20j | Prose page: corrections with Repeat it, nouns and verbs tables with the character's line, how the language works, life here; then shorter, level, natural phrase, not formulaic, small slips small, the part that changes in bold | 369 words, then 125-153; small slips still sometimes got a full correction, and the mic repeated the whole sentence | Replaced by the simplified page |
| 2026-10-21 | JSON for the simplified sheet (docs/learn.md → The page): corrections { said, why, right }, words things / doing, goodToKnow | 6 pages: 0-3 corrections, 7-10 words, one point each; Josh's tu with strangers caught each time; the parts that change are short ("Sono pensione" → "Sono in pensione") | Shown to Josh before building |
| **2026-10-21, no thinking** (call setting, prompt unchanged; Mexico gets the same prompt as `es-mx/prompts/learn.md`, 2026-10-22) | The page written without the thinking step (`thinking: between_tools`, as the turn call), 2026-10-22 | Josh's Memo conversation (Mexico), 2 runs each: 8.4–9.5 s and ~1170 tokens with thinking, 4.7–5.0 s and ~600 without; the same three corrections (piano piano → poco a poco, hablo un poquito de español, mucho gusto), the same words and culture note | Kept (Josh: "both", with the page written ahead while the learner talks, `lib/learn-ahead.ts`) |

Seen on the 2026-10-21 pages, for later: a form sometimes carries a word with it ("torna pure", "resti pure"); a rare word slips in now and then (il filo, filare); two pages in a row had the same Good to know (supplì), which the Learn area's history could prevent.

### Learn page corrections (`learn.md` 2026-10-27, both countries; `tests/experiments/learn-one.mts`)

Josh's Salvatore page (Napoli, 2026-10-27) corrected fine Italian ("non parlo bene italiano", with an invented word-order rule and "molto" added) and lines speech-to-text had garbled. Same conversation, runs per version:

| Version | "non parlo bene italiano" | garbled "stessa punta" | garbled "giusto ragione" | "molto" added | other invented mistake | Decision |
|---|---|---|---|---|---|---|
| 2026-10-21 (before) | 3/3, invented rules | 3/3 | 2/3 | 1/3 | — | — |
| + never correct what's right; keep their meaning; nonsense was misheard | 3/3, invented rules | 2/3 | 0/3 | 1/3 | — | Not enough |
| **+ the why names exactly what was wrong, or no correction** | 4/4, now the article (l'italiano), a fair point; 1/4 still says "people usually" | 1/4 | 0/4 | 0/4 | 1/4 ("mi ha detto" → "mi ha detto Lei") | **Kept** |

### Say it: Italian taken for English in Beginner conversations (`say-it.md` 2026-10-27, both countries; `tests/experiments/say-it-two.mts`)

Josh's two Italian turns on 2026-10-27 that Whisper called English and translated, sent to say it with the real conversation before them (runs each):

| Version | Pignasecca ("Mi piace i limoni ma non ha un ragione…") to Salvatore as said | Da Gigi ("Pagokonlacar, tajarazzi") to Giorgia as said | Same lines with Italian-only context | English set (say-it.mts, it): lines written | Decision |
|---|---|---|---|---|---|
| 2026-10-23e (before) | 1/8 | 0/8 | 30/30 | — | Cause: the Beginner character speaks English too |
| + judge only their last line | 8/8 | 0/8 | — | — | Not enough |
| **+ run together or misspelled is still an attempt; English that doesn't fit was speech-to-text guessing** | **8/8** | **8/8** | — | 35/35 (the mixed "Sì, I want un caffè" goes as said, by design); all checks 63% (69% at v2, within noise) | **Kept** |

### Quality judge: how much each side speaks the language (`quality.md` 2026-10-27, both countries; `tests/experiments/judge-one.mts`)

Josh, 2026-10-27: both sides matter, character and speaker; for the character not a share but how many phrases in the language and how long. Beatrice (Siena, Beginner, 71 turns), judged:

| Version | englishUnasked | alive | Character phrases / words in the language / English words | Person lines in the language / English / mixed | Decision |
|---|---|---|---|---|---|
| 2026-10-16 (no Beginner block) | 36 ("a bilingual assistant") | 4 | — / 430 / 570 | 35 / 0 / 0 | Beginner English counted as a fault |
| **2026-10-27, Beginner block + words, two runs** | 0, 0 | 5, 5 | 105, 105 / 520, 360 / 470, 440 | 35 / 0 / 0, twice | **Kept.** Phrase and line counts steady; word counts swing (±20%), so Beginner phrases are also counted exactly in code from the saved parts (`phraseStats`, from 2026-10-27 on) |

