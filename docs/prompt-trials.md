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
| `leveling.md` (2026-11-02, trial) | The leveling prototype's prompts: talk per Beginner stage, language and support blocks, design C's line check and regenerate, design B's speaking judge | Partly: the path's stages S1–S3 (`lib/path.ts`, 2026-11-02d); the rest in `tests/experiments/leveling/` |
| `record.md` (2026-11-02) | Labels a finished conversation's learner lines by language and help kind, for its record | Yes (`lib/conversation-record.ts`) |
| `lesson-flow.md` (2026-11-02) | A lesson on the conversation screen: Magda teaches, practice briefs, her review | Yes (`lib/lesson.ts`, the next build) |
| `dialogue.md` (2026-11-05) | The rules every conversation follows (corrections, mishearings), added to every system prompt by `lib/dialogue/rules.ts`; two notes telling the character whether an offered answer was said back (`lib/dialogue/heard.ts`) | Every turn | Any rule about how characters treat what the learner said: change it here, not in a kind's prompt (docs/dialogue-model.md) |
| `welcome.md` (2026-11-02) | The welcome conversation's brief around the agreed steps, and reading the answers at the end | Yes, when the app opens the welcome (`lib/welcome.ts`, build 10) | Saying how a person talks at a level; checking a line before it plays; judging a learner's speaking from one conversation |
| `learn.md` (Italy only so far) | The Learn page for one conversation: corrections, words, good to know, as JSON | No (`tests/experiments/learn-page.mts`) | Reviewing a conversation for the learner |
| `lesson.md` (Italy only, trial) | A Learn lesson: one syllabus unit taught from the learner's study file and recent conversations, in five steps (your line, examples in the voices of people they know, notice, say it, take it to town), as JSON | No (`tests/experiments/lesson.mts`; first run 2026-10-27 for Josh, unit a1-15) | Teaching a syllabus unit outside the world |
| `lesson-steps.md` (Italy, 2026-10-28) | One syllabus unit → its lessons, one per step, made ahead: title, how to, intro, examples by role and place, notice, one line of context from the unit's culture note, 3 practice questions with model answers, a mission (place, goal, phrase, what to listen for); only the unit's own content | No (`scripts/make-lessons.mts` → `content/it/lessons.json`, for review; first slice: a1-01 to a1-05, 21 lessons) | Teaching a syllabus step (2026-10-29c: Magda uses tu, context as what people do, one step per teaching point; 21 lessons, no Lei questions, no warnings);  replaces `lesson.md`'s improvised lessons |
| `lesson-steps.md` 2026-11-02 (Italy) | Kept | One point per lesson; practice questions at the unit's level, never handing over their answer; American English, no bracketed notes; plus an Intermediate (B1) system prompt. From the five lesson judges on the 21 A1 lessons: 1 grammar, 7 naturalness, 9 level, 25 teaching, 27 translation failures, clustered in practice questions and lesson scope. Not yet regenerated with it: A1 lines fixed in place instead (ids, roles, places unchanged, so the laptop's lesson flow is unaffected). | |
| `lesson-steps.md` 2026-11-03 (Italy) | Kept | Practice is new: each model answer the step's pattern in a new sentence, never an example repeated or reordered; at least two examples by someone other than the newcomer; for B1, nothing above B1 in the grammar list (impersonal *si*) and learner lines without gendered forms where possible. From the judges on the rewrites: 31 of 46 Intermediate teaching failures and 2 of 5 Beginner ones were practice answers copying examples. Not yet run through `make-lessons.mts`; both rewrites were written by agents from this file's rules and fixed in place. | |

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


### A reason to be there for Mexico's people (experiment `tests/experiments/mexico-here-trial.mts`, 2026-10-30)
Josh: "run tests on Mexico getting here lines". 50 shown Mexico people without a `here` line; a candidate line written for each with Italy's instruction (cast-rebalance.mts, adapted to Mexico); each person played with and without it at Beginner and Intermediate (opening, then "Hola. ¿Qué haces aquí?"); a blind judge (random A/B) per pair.

| Version | Invented a job or reason | Something specific to talk about | Judge's pick |
|---|---|---|---|
| Without (today) | 0 | 31 of 50 | 16 |
| With a reason to be there | 1 (Don Rubén "in Xochimilco": the judge took it for Mexico City's; it is also a barrio of Oaxaca, so likely not a fault) | 38 of 50 | **34** |

By city, with/without: Mexico City 9/1, Guadalajara 7/3, Oaxaca 7/3, Puebla 6/4, San Miguel 5/5. **Applied (Josh, 2026-10-30: "so lets add it?")**, after a rewrite into Italy's form (English, said to the character, no advice to the learner; the drafts came back in three styles, a third in Spanish) and dropping facts that couldn't be confirmed (CAPU's and La Fábrica La Aurora's neighbourhoods, La Pasita's barrio, cazuelas at La Fuente, pulque at La Cucaracha, callejoneadas in San Miguel). Without a line nobody invented a job (Mexico's cast was generated with "at a business, someone who works there"), so the gain is something to talk about, not a fix. The judge's "without" picks were mostly the without version happening to name a place detail anyway, or the with version's Beginner reply repeating the name question.

### Leveling prototype (`leveling.md` and `levels.md` → Intermediate blocks, 2026-11-02, both countries; `tests/experiments/leveling/`)

Prompts written for the Phase 2 prototype (docs/research/leveling/05-designs.md). Checked before writing: `levels.md` had only Beginner blocks (no Intermediate block ever existed); `learner-level.md` judges beginner/intermediate/advanced from several conversations with onboarding and has no "not enough to tell", so design B's judge is new (its holistic, "lean lower" approach reused, as 04 §3 recommends); `level.md` and `quality.md` are reused unchanged as the scoring judges; the simulated learner reuses run.ts's honest-learner instruction. **None of these has been run against Claude yet** (written in a cloud session without an API key; `--dry` ran the loop around them).

| Prompt | Status | What it is | Result | Decision |
|---|---|---|---|---|
| `levels.md` → Intermediate: B1 | Trial | The person in CEFR B1 terms (clear standard speech at a normal pace, repeats or rephrases now and then, open questions fine, English only if asked), "still you" form | Not run | — |
| `levels.md` → Intermediate: B1, support back | Trial | B1 plus slowing down and saying it again after 2 hard conversations | Not run | — |
| `leveling.md` → Talk: stage 1–3, Talk: support back | Trial | How the person talks at each Beginner stage, added to beginner.md (A1 very slow, repeats unasked, yes/no or this-or-that, English sets the scene → A2 rephrase in the language first, one fact and simple open questions, English when asked) | Not run | — |
| `leveling.md` → Answers: two / one / frame, Echo: new words / off | Trial | Supports from Josh's fading plan; code also trims answers and clears glosses | Not run | — |
| `leveling.md` → Line check | Dropped | Design C: fits / clear miss / unsure for one line against the stage's talk text (`CHECK_MODEL` for a faster model) | First run (2026-11-02-19-51, Italy): "clear miss" on 89% of lines, +4.3 s a line | Dropped with design C (cloud session's notes, 2026-11-02): even working, it adds a call to every turn |
| `leveling.md` → Say it again | Dropped | Design C: one regenerate with the missed line, "more simply… repeat or rephrase… stay yourself" | Ran on 89% of lines in the first run | Dropped with design C |
| `leveling.md` → Speaking judge | Replaced | Design B: CEFR pre-A1–B1 from one conversation with the speaking record; said-back, English, help and silent lines marked; "not enough to tell" | First run: "not enough to tell" on every conversation of the improving learner (one to four own-words lines each) | Replaced by 2026-11-02b |
| `leveling.md` → Speaking judge 2026-11-02b, Speaking examples | Trial | Reads the last five conversations together, needs five own-words lines; told speech-to-text tidies errors and beginners sound more able than they are; one rated example per level in the language | Not run | — |
| `leveling.md` → Talk: stage 2, 3, support back (measured) | Trial | As above | dials.mts (Italy, 10 people): no change in the Italian against stage 1 (within ±3 points of words known); beginner.md's own rules win | Not a dial: replaced by the Language blocks for the test (07-model.md) |
| `leveling.md` → Language: 1–4 (2026-11-02c) | Trial | How much of the turn is in the language and how hard, in numbers (phrases, words per sentence, new words a turn, tenses), replacing beginner.md's guidance on it | dials.mts: share in the language 34% → 52% → 54% → 70%; words per line 7.7 → 18.6; known without the echo unchanged (55–62%, Intermediate 43%) | Keeps the amount dial; difficulty of the words doesn't move inside beginner.md |
| `leveling.md` 2026-11-02d (path stages S1–S3 in the app) | In the app | Talk 1–3, Language 2 and 4, Answers, Echo: new words, used by lib/path.ts for the Beginner path; no block's text changed | dials.mts, Italy and Mexico: every step from stage 1 to Intermediate moves (07-model.md) | Josh, 2026-11-02: "go" |
| `record.md` (2026-11-02, new) | In the app | Labels each learner line of an ended conversation: language (language / English / mixed) and help (one word / the whole line / none), for the record's counts | check-path.ts checks the counts from labels; the call itself first runs live | — |
| `welcome.md` (2026-11-02, new) | Trial | The welcome conversation: beginner.md plus a Brief wrapping the agreed steps (content/<country>/onboarding.ts → welcome.script), a done flag on the last turn, Mic off, and Read (name, masculine or feminine, first time, speaks, which line answered the level question) | tests/experiments/welcome-trial.mts, 4 personas × 2 countries: first run 8/8 on every check, but she opened with a line about the place and asked again after "either is fine"; brief told to start with step 1 and use the feminine when unclear: 8/8, matching the script | In the app with build 10 |
| `welcome.md` 2026-11-02b | Trial | Every question's English given in the steps and said whole as its gloss | Josh on the simulator: "what is your name", not "your name". Welcome trial, 8 runs: 23 of 24 question glosses whole (one "first time in Mexico?"); every other check 8/8 | In the app with build 10 |
| `welcome.md` 2026-11-03 | Kept (laptop trial, 2026-11-03): `welcome-trial.mts`, 5 personas × 2 countries (Mexico run three times). Name, address, level, start step, ask-again and ending right in every persona. The "three moments" check fails only for dodges-level: she asks the level question a second time in the language after the dodge, as the brief says, and the check counts it as a fourth moment. One Mexico crash in three runs: an all-English closing came with its words in `en` and `text` empty, so the turn had no parts; fixed in `tidyParts` (code, not the prompt). | A brief of three goals (name; masculine or feminine; how much of the language), English carries it with the language in three moments only, a closing in English; no "first time"; the goals' lines are suggestions. Guard: once they've answered once per goal, the reader checks the three answers and a missing one gets **Ask again** (once per welcome, stored as `askedAgain`); Read's address tells "none" from "unclear" | Josh's two plays on the phone (2026-11-02, 11-03): repeats, a phrase with no English, too many topics, too much of the language. Trial to run: welcome-trial.mts, now 5 personas (adds dodges-level) with checks for at most three turns in the language and asking again; needs an API key (not in the cloud session) | Pending the trial and Josh's play |
| `beginner.md` 2026-11-03 | Kept (laptop trial, 2026-11-03): `beginner-dialogue.mts` on Josh's replayed conversations, before and after: answers to say back 4.5 → 3.6 words on average (Italy 13 → 5 answers, Mexico 20 → 5: small, the runs stopped early on a known model fault, endless blank lines in an `en`, before and after alike). E.g. *La quiero con carne, por favor* → *Con carne, por favor*. | One idea per answer to say back: the shortest whole sentence that answers, nothing added ("Estoy cansado", not "Estoy un poco cansado, pero contento"); two choices are two short sentences | Josh, 2026-11-03, Don Nacho in Mexico. To measure with tests/experiments/beginner-dialogue.mts: words per answer and answers joining two ideas (pero, y, ma, e), before and after; needs an API key (not in the cloud session) | Pending the trial and Josh's play |
| `lesson-flow.md` (2026-11-02, new) | Trial | A lesson in three parts, each beginner.md plus a brief: Magda teaches one step of lessons.json in 2–3 turns (intro, examples said back, notice; done when she sends them off), practice scenes say what's practised and "turn N of 3" (code ends them), her review is one thing right, one fix, say it once more (code ends it). Checked first: `lesson.md` (an improvised lesson, trial), `lesson-steps.md` (writes lessons.json), `magda-teaching.md` (her free lesson) don't do this | tests/experiments/lesson-trial.mts (a1-01-1 both countries, a1-04-3 Italy): every part ended where it should. First run: Magda opened "Welcome to Matera!", introduced herself in the review, and the review fixed things off the step (*mi chiamo*, *mucho gusto*) after practice partners asked names; 2026-11-02b: straight into the lesson, scenes and review keep to the step: reviews then on the step in both countries | In the app with the next build |
| `lesson-flow.md` 2026-11-03 (speaking mode) | Kept (laptop trial, 2026-11-03): `lesson-trial.mts` on six Intermediate lessons (b1-sort-1, b1-sort-4, b1-people-3, b1-story-2, b1-opinions-1 twice): every part ends where it should (teaching 3 learner turns, practice 4 each, review 1); Magda teaches in Italian with a one-line reason (e.g. the subjunctive after *penso che*, recasting *trova* → *trovi*), partners give chances to use it in the learner's own words, the review fixes the learner's real slip (*credo che fa*). One run had a character write *c'Ú* for *c'è* in two scenes (not seen again in four more lessons, nor in 200 recent production conversations): watch. | Josh, 2026-11-03: "an intermediate mode for intermediate lessons". The character prompt with new ", speaking" briefs for the Intermediate lessons; the Beginner blocks unchanged. |
| `culture.md` 2026-11-04 (new) | Kept (laptop, 2026-11-04): `make-culture.mts` on the first-screen cities, 4 items each: Italy 29 of 32 kept (5 fixed once, 3 dropped), Mexico 18 of 20 (4 fixed, 2 dropped); 7 chips over four words shortened by hand (the maker now enforces it). `culture-story-trial.mts`, 2 items × 2 levels × 2 countries through the server's code: every lesson ends on the third turn; teller turns 44–79 words (about 62), down from about 90 in the first trial; natural, the story riding on a real exchange (ordering pani ca' meusa, pápalo on the cemita). | Josh, 2026-11-03: handle the culture data and code. From the other session's tested prompts (tests/experiments/culture-lesson.mts), language-neutral, with Fix and Choose steps, a three-or-four-sentence cap and "keep to these facts". Beginners in the Beginner format. |
| `character.md` 2026-11-04 (pride line; `knows` and "has mentioned you" lines) | Dropped (laptop, 2026-11-04, not shipped) | Rome, 8 errands × 2 learners × 5 turns (`pride-knows-burden`, then `pride-burden`): pride raised culture 7% → 17% and lowered the errand 68% → 59%, 3 forced lines vs 1, ~90 more prompt tokens; written as a situation it became today's news (Luisa's invented derby score). Rewritten as standing facts: culture 5% → 7%, errand 67% → 61%, no invented news. `knows`: no character mentioned anyone they knew in 38 conversations, even when told the person had mentioned the learner. | Josh: "take it out" (knows), "I think pride is a dead idea"; "the lesson too is increase culture by increasing cultural settings". The scripts and data were removed; the findings are in docs/culture.md → Culture comes from the settings. |
| `pride.md` 2026-11-04 / 2026-11-04b (new) | Dropped with pride | Made Rome's 14 pride items (fact judge: 13 passed, 1 fixed) and 3 `knows` pairs; b added "standing facts, never today's news". Its fact judge lives on as `facts.md`. | Josh, as above. |
| Simulated learner (in `tests/experiments/leveling/learners.ts`) | Trial | Turn kind chosen by seeded rates (silent, English, help, say back, own words); Claude writes own-words, English and help turns at the learner's level, honest about what they follow | First run: fair (English help early, real Italian by conversation 8), but it spoke about the character in the third person ("is she asking…") and she answered the same way | 2026-11-02: speaks to the person directly, and says whether a help ask is about one word or the whole line (for the new "hard" rule) |

| Cultural items + cultural lesson (in `tests/experiments/culture-lesson.mts`, 2026-11-03) | Trial | One call picks a city's cultural items from its shown people (no city lists), tipico not stereotypical, chip names of at most four words; a narrow fact judge; two items played as lessons (three turns, a personal question ending each) against a simulated learner | Rome: 6 items, all passed the fact judge (quinto quarto, gnocchi on Thursday, Il Gesù's ceiling, romanisti and laziali, Noantri, the Palazzaccio); the personal questions work; turns too long for Intermediate (80–90 words, dates). Next: shorter turns. See docs/culture.md |
| Pride and weather lines in ordinary visits (in `tests/experiments/errand-leads.mts`, 2026-11-03) | Trial, not kept | A pride line and/or a weather line ("heavy rain, 12°C") added to the setting of six Rome characters; visits with an errand, real turn code, two simulated learners | Errand lines 65% (today) → 56% (pride) / 60% (weather) / 54% (both); errand done ~the same. Pride barely used in visits. Weather in all 24 openers ("Entri, che fuori diluvia"): everyone talks about the weather, as Josh feared. See docs/culture.md |
| No "word worth keeping" (`content/*/prompts/culture.md` 2026-11-04b, `welcome.md` 2026-11-03b) | Kept | Josh, 2026-11-03: hates "keeping" or owning words ("just not the tone of the game. Are you supposed to own Rome or Claudio too?"). The item's words are now the ones the story turns on, used naturally, never pointed out; the last turn ends the story with no word to remember or lesson summed up | Every item in both sets played through the real code (`storyBrief` with `runTurn` / `runBeginnerTurn`), Intermediate and Beginner, a simulated learner: 24 lessons, none ends on a word to remember (before: both trial lessons did, "Ti lascio una parola da ricordare", "that is the word worth keeping"). A few still close with "Now you know…", milder; left |
| Cultural lessons: recasts, more of the language for Beginners, no alcohol (`content/*/prompts/culture.md` 2026-11-04c) | Kept | The Story brief no longer says "the rules above don't apply" (it switched off the Beginner rules); the speaking part recasts mistakes the way a friend would; the Beginner part keeps the Beginner rules, at most three short English sentences a turn and one line of the story in the language; dates and names a listener can't hold left out; Pick and Choose leave out alcohol (ombra, ricciarelli with vin santo, mezcal dropped; Venice's Sior Rioba chosen for Italy's set) | `tests/experiments/culture-check.mts`, all 24 lessons in both countries: Intermediate mistakes recast 20 of 24 (none pointed out; before, the Italian ones mostly went by); every Beginner turn has a line of the story in the language plus the question and an answer to say back (language 19% of the words, not counting answers); no takeaway endings, no alcohol. Run with another session's uncommitted pride changes in the working tree |
| Shared dialogue rules and the said-back note (`dialogue.md` 2026-11-05, new; `beginner.md`, `lesson-flow.md`, `culture.md` 2026-11-05 lose their own correction and mishearing lines; `say-it.md` 2026-11-05) | Kept (laptop, 2026-11-05) | `tests/experiments/heard-replay.mts`, 4 runs each, `origin/main` against the change: Magda coached the misheard line in Jennifer's "¿Owen me ayuda?" 4 of 4 → 0 of 4 and in "Estoy en el barco de canzart" 4 of 4 → 0 of 4 (before: "Almost! The word is 'Joven', like 'HOH-ven'"); Ardit's "ribaletta" 0 of 4 both (production's recast didn't reproduce); say it on Lorenzo's "prima volta" 0 of 5 both, English alone and with the Italian hearing (production's line didn't reproduce: the cause, "it answers or follows {name}'s last line", is removed but not measured). First run leaked the note into Magda's words ("Whether it was cansado or something else"): "never mention speech-to-text, the app or these notes" added. smoke:live on a local server, Italy and Mexico: all pass except `/v1/speak` (the laptop's ElevenLabs key is out of date; production's differs and logs no errors). | Josh's family's play 2026-11-04/05; Josh: fixes "are global improvements not local to lessons or conversations or one country" |
| The welcome in three counted steps (`welcome.md` 2026-11-05) | Kept (laptop, 2026-11-05) | Josh's redo of the welcome: all English; Opening (a little about the country and two or three cities, masculine or feminine explained as part of the language, answered with two buttons), Questions ("do you have any questions, or are you ready to go?", the done button beside the mic), Answers (until they're ready; done). The steps are counted in lib/welcome.ts, not left to her; Ask again and Read are gone, the tap gives masculine or feminine and everyone starts at Beginner S1 | `tests/experiments/welcome-trial.mts`, 4 newcomers × 2 countries (ready at once, two questions, a question in the language, mic off): first run all checks passed, but she named all 20 Italian cities, refused "how do you say thank you" by mentioning her notes ("I can't slip any Italian in here") and Chela said "mijo, mijita" before they'd chosen. Brief changed (two or three cities; tell them when asked; don't guess before they choose): 8/8 on every check, Luisa answered "Grazie… Prego", Chela "Gracias… Muchas gracias" |
| Answers as short as a local says them; English names a local thing (`beginner.md` 2026-11-05b, `leveling.md` 2026-11-05, `replies.md` 2026-11-05) | Kept (laptop, 2026-11-05) | Josh on Doña Chela's "Quiero probar un chapulín, por favor." / "I want to try the quesillo, please.": "reply is too long replies. One translation doesn't translate the subject." The answer rules asked for "a whole sentence" (beginner.md, leveling.md stages 1–2, replies.md); now the fewest words a local would use (often the thing and a please), a full sentence only when that's how people answer, and an answer's English says what a local thing is in a few words | `tests/experiments/answer-length.mts` (new), opening turns at S1 and S2, eight shown places, 2 runs each, before → after. Italy: mean 3.4 → 2.9 words, answers of 5+ words 5/47 → 0/46, a local word unexplained 1/32 → 0/32 turns. Mexico: 4.0 → 3.1 words, 16/48 → 2/48, unexplained 5/32 → 2/32 (both Lupe's "cemita"; "Una torta, por favor." → "A torta (Mexican sandwich), please.") |
| Day of the week and month in the setting (2026-11-05) | Not yet run | Every character's `{setting}` (character prompt and Beginner prompt) ends with "It's Thursday, in November." in the country's time zone (`lib/today.ts`, `language.timeZone`); no date numbers. Josh: "Characters should know day of week and month". A fact, not a rule (culture.md: facts in the setting work, rules don't). Earlier dropped as "not going to hit most users"; Josh brought it back. To check in `test:conversations`: no invented events for the day, not mentioned every time. | |
| Say each thing once (`beginner.md` 2026-11-05c, `leveling.md` 2026-11-05b), a sentence break after every spoken piece and no question echo when answers are shown (`lib/beginner.ts` → lineFromParts) | Kept (laptop, 2026-11-05) | Josh, hearing Luisa's and Doña Chela's openings: "totally incoherent, repetitive with no pauses", "cafe, coffee, cafe", "incoherent dialogue". The English said what the language then said, the gloss said it again, a name was given in both languages, stage 1 said the key word twice, and glosses ran into the next phrase with no full stop. Now the English never says what the language says, no gloss for what the English already said or words that are the same in English, a name once, no doubled key word; the code ends every piece on a sentence break | `tests/experiments/replay-set.mts` (new: Luisa and Chela openings, Jennifer's Magda lesson, two more S1 openings per country, 4 runs, a judge on the spoken line). First round: Italy repeats 12/12 → 3/12, Mexico 15/16 → 10/16; the judge's reasons showed Mexico still greeted in English then Spanish (6 turns) and echoed her question in English right after it (6). Second round adds: greet in one language only (prompt), and her question's English isn't said when answers are shown, since their English says it (lineFromParts; Josh, "cafe, coffee, cafe"). Final: Italy repeats 12/12 → 2/12, run-on 4/12 → 1/12; Mexico repeats 15/16 → 0/16, run-on 9/16 → 0/16. Luisa, Chela and Magda 0/4 each |
| Station seller: the trip quoted and its facts (`lib/travel/departure.ts` clerkSetting, 2026-11-05) | Kept | The seller's setting quotes the person: They've just said: "A ticket to X, please." (was "The person has just told you they want a ticket to X"), then the trip facts from `content/<country>/stations.json`: what X is known for, how long the trip takes | Three framings, 9 openers each per country, a judge for "asks where they're going": "just told you" 15/18 asked, "came up to your window and asked" 16/18, the quoted words 0/18 ("Per Napoli, eh? Allora, da Matera non c'è un treno diretto…"). Trip facts used naturally ("A Oaxaca son unas seis horas"). Alcohol taken out of four city lines (ombra, aperitivo, mezcal, tequila) |
| Alcohol not left out of cultural items (`content/*/prompts/culture.md` 2026-11-05b) | Kept (laptop, 2026-11-05) | Josh: "its fine if alcohol comes into the game (like the mezcaleria)"; wine bars are hidden only because enotecas make dull scenes. The 2026-11-04c line leaving out alcohol "for all ages" is removed | Not run: the line only took items out; the Choose prompt now picks from all checked items again |
| Cultural lessons open with a topic sentence (`content/*/prompts/culture.md` 2026-11-06, Story: first turn; `lib/culture.ts` {first}) | Kept (laptop, 2026-11-06) | Josh: "In lessons the Palio isn't described well. Cultural lessons need to explain the topic clearly at the start", then "the topic can be followed but there is no topic sentence". `tests/experiments/culture-opening.mts` plays every item's first turn, Beginner and Intermediate, and a judge asks whether a newcomer would know what the topic is and whether the first sentence names it and says what it is. Before: clear 8/18 Italy, 12/20 Mexico. "Say plainly what it is first": clear 16/18, 18/20, but turns still opened with small talk. Topic sentence first, no greeting before it: clear 17/18, 19/20; topic sentence first 16/18, 19/20. The Palio item now opens "The drappellone is the big painted banner that is the prize of the Palio, the famous horse race run here in the Campo…". |
| Nino's `here` line: the quiet hour after lunch, kitchen closed, he tells about the menu (`content/it/cities/roma-nuova.ts`) | Kept (cloud, 2026-11-06; live probes at Beginner and Intermediate after 1878f5c: kitchen closed, he names the board and explains gricia → amatriciana → carbonara; "vorrei ordinare" gets "Marco makes it tonight", "il conto" gets "you haven't eaten, the coffee's on me"; one slip, "il gnocchi") | Josh: the osteria "just turns into a regular ordering experience… It should be let me tell you about the menu. Not do you want carbonara or artichokes". Live probe before: Nino asked "Preferisce la carbonara o la cacio e pepe?", took the order for Marco and offered artichokes on the side, though the line said Marco takes orders. Facts, not rules: no orders until dinner, so the menu is something to tell about. |
| Their goodbye ends it (`content/*/prompts/dialogue.md` 2026-11-06; `done` on ordinary replies, `lib/prompts/turn-output-schema.ts` doneField) | Kept (laptop, 2026-11-06) | Josh played Beto the taxi driver in San Miguel (Beginner, S2): five goodbyes, and each time Beto said goodbye back and started something new (mariachis, "¿De dónde es?"). Decided 2026-10-25 (beginner-scaffolding 11b) but only the welcome could end. `tests/experiments/goodbye-done.mts` replays his conversation: done on his goodbye 5/5 Beginner and 5/5 Intermediate, on ordinary lines 0/10 and 0/10; goodbye replies starting something new 0/5 and 0/5 ("Adiós, Joshua. Buen paseo."). The app closes the screen 1.5 s after the goodbye is said. |
| Stay within your job (`content/*/prompts/dialogue.md` 2026-11-06) | Kept (laptop, 2026-11-06) | Josh, Beto the taxi driver: "¿Quiere la torta con queso o con jamón?"; "And the torta". `tests/experiments/job-drift.mts` replays his conversation at "I'm very hungry" and "Torta por favor": served food 2/10 Beginner, 1/10 Intermediate before; "never serve, sell or take an order… never ask how they'd like it" 1/10, 0/10; "tell them where to get it, and ask nothing about it (not which one, not how they'd like it): your next question is about your own job or your talk" 0/20, 0/20. In the shared rules, so every level and both countries. |
| In order, and your own place's ways (`content/*/prompts/dialogue.md` 2026-11-06b); five busy counter bars' `here` now say the customer arrives with the scontrino | Kept (laptop, 2026-11-06) | Josh played Tommaso at Ditta Artigianale, Florence (Beginner S1): Tommaso made the macchiato, then said pay at the till first, asked for a receipt Josh never got, and served anyway; Josh: "perché ogni bar ha detto le stesse cose?". `tests/experiments/bar-errand.mts`: Italy Beginner: steps out of order 2/20 before, 0/20 after; a generic custom told as this bar's (pay first, cappuccino hours) 7/20 before, 3/20 after (the three left: paying at this counter, what a macchiato is). Intermediate 0/20 and 1/20 before, 0/20 and 0/20 after. Mexico (Café de la Calzada) 1/20 and 1/20 before, all 0/20 after. Josh: "We should have cashiers or customers with receipts", then "Each user has one conversation per person currently", so no cashier hand-off: at Testaccio, Monti, Bar Nilo, Bar Rita and Bar Alba whoever is at the counter has already paid. Played: at Intermediate Luisa and Carmine ask for the scontrino in 6/6 openings or second turns; first wording ("come to your counter with the scontrino") sent the learner to the till 2/12, the second ("already paid… you never send them to pay") 0/12. Beginner Luisa still never mentions it. |

## Conversation variety gate (docs/conversation-variety.md)

Josh, 2026-11-06: shops "all fall into exactly the same pattern… How much you pay, credit card or cash? Thank you, bye". `tests/experiments/variety.mts`: shops of the same kind in different cities (Italy: 3 bars, 2 pharmacies, 2 markets, Nino; Mexico: 3 cafés, 2 market stalls, 2 fondas), 3 visits each with memory carried, Beginner (S2) and Intermediate, simulated learner going along. Today's code run twice to show the noise; each step is one more row, judged the same way. Reply time is the turn call alone, 6 conversations at once and four runs sharing the laptop: compare rows, not the app. Swappable pairs: the judge compares beats, ignoring local nouns, and still rarely says swappable; read it as weak. Reports in `tests/experiments/out/variety-*`.

| Version | Country · level | Reply time, median / 90th | Words a line | Purchase lines | Visits with a cliché | Something particular to the town | Planted idea, visit 1 / 3 | Told again (per character) | Swappable | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| Baseline, run 1 / run 2 (beginner.md 2026-11-05c, dialogue.md 2026-11-06b, character.md 2026-10-21; commit 7a334b5) | Italy · Beginner | 2.5 / 2.9 s · 2.5 / 3.0 s | 19 · 19 | 70% · 65% | 6/24 · 5/24 | 2/24 · 5/24 | 7/8, 5/8 · 8/8, 6/8 | 2.5 · 2.0 | 1/5 · 2/5 | — |
| | Italy · Intermediate | 2.7 / 3.3 s · 2.5 / 3.4 s | 31 · 31 | 53% · 51% | 7/24 · 6/24 | 16/24 · 16/24 | 8/8, 7/8 · 8/8, 8/8 | 0.8 · 0.9 | 1/5 · 0/5 | — |
| | Mexico · Beginner | 2.7 / 3.1 s · 2.7 / 3.2 s | 21 · 22 | 79% · 79% | 0/21 · 1/21 | 4/21 · 7/21 | 7/7, 6/7 · 7/7, 7/7 | 1.3 · 1.1 | 0/5 · 0/5 | — |
| | Mexico · Intermediate | 2.6 / 3.3 s · 2.6 / 3.3 s | 31 · 34 | 44% · 50% | 1/21 · 0/21 | 15/21 · 19/21 | 7/7, 7/7 · 7/7, 7/7 | 0.4 · 0.6 | 1/5 · 1/5 | — |
| A: beginner.md 2026-11-06, the errand is a turn or two (commit after 7bd3ac2) | Italy · Beginner | 2.7 / 3.2 s | 20 | **51%** | 5/24 | **7/24** | 7/8, 6/8 | 2.0 | 2/5 | **Kept**: purchase down beyond noise, town up |
| | Mexico · Beginner | 2.7 / 3.2 s | 22 | **60%** | 2/21 | **11/21** | 7/7, 7/7 | **2.6** | 1/5 | Kept; told again up beyond noise (the planted idea fills the visit: C) |
| C: `here` core + threads drawn at 3 in 10 a day (`lib/today.ts` threadsToday), 14 gate characters (Nino unchanged); visits now on different days | Italy · Beginner (vs A) | 2.7 / 3.2 s | 21 | 45% | 6/24 | **15/24** | — | 1.6 | 1/5 | Better than A on town content |
| | Italy · Intermediate (vs baseline) | 2.6 / 3.5 s | 33 | 53% | 7/24 | 17/24 | — | 1.4 | 1/5 | Within noise; told again a little up |
| | Mexico · Beginner (vs A) | 2.7 / 3.2 s | 23 | 62% | 1/21 | 8/21 | — | 2.0 | 2/5 | Within noise of A |
| | Mexico · Intermediate (vs baseline) | 2.6 / 3.2 s | 33 | 53% | 0/21 | **12/21** | — | **1.0** | 0/5 | Town down, told again up: held, not pushed |

C's threads: mentioned on 55–65% of the days they're drawn (Italy 18/33 Beginner, 19/33 Intermediate; Mexico 20/31, 17/31) and 4–10% of the days they're not (2/51, 4/51; 3/53, 5/53, from memory). So the odds set how often a thread comes up. The planted-idea column no longer measures anything (the core line is the place itself). What's still told again on later visits is mostly not the threads: the character's own offers (molotes, cough syrup, a concha) and things the learner's memory notes carry.
| Italy like Mexico: four `here` lines rewritten to name the place's own product and why it's local (Ditta, Bar Rita, both pharmacies), Bar Nilo without "talk football"; no threads; Mexico unchanged (Josh: "why not look to Mexico to improve Italy") | Italy · Beginner (vs A) | 2.6 / 3.1 s | 21 | 44% | 5/24 | 11/24 | 8/8, 7/8 | 2.0 | 2/5 | Purchase down, town up, told again same; threads (C) gave more town (15/24) |
| | Italy · Intermediate (vs baseline) | 2.6 / 3.4 s | 32 | **47%** | 5/24 | 15/24 | 8/8, 7/8 | 0.8 | 1/5 | Purchase a little down, told again back to baseline (C: 1.4); town same, still below Mexico's 15–19/21 |

Nino, the limited-transaction reference, in this run: purchase 0–17% of his lines, but told again 4 (Beginner) and 2 (Intermediate): the menu, dish by dish, on every visit. Even the role that works repeats itself.

References (`PLACES=ref`): the bar a shop has to beat (Josh: "why is the shop better than a cultural focus, open space, role with limited transaction (nino in rome)"). Italy: the Colosseum, the Pantheon, Piazza del Campo, Santa Maria in Trastevere's fountain steps, Nino; Mexico: the Catedral Metropolitana, the Parroquia in San Miguel, the Zócalo in Oaxaca, the Jardín del Carmen in Puebla. Commit 9dca7b6.

| References | Country · level | Reply time | Words a line | Purchase lines | Visits with a cliché | Something particular to the town | Told again |
|---|---|---|---|---|---|---|---|
| | Italy · Beginner | 2.8 / 3.2 s | 26 | 11% | 1/15 | 10/15 | 3.0 |
| | Italy · Intermediate | 3.0 / 3.7 s | 44 | 3% | 0/15 | 14/15 | 1.0 |
| | Mexico · Beginner | 2.8 / 3.3 s | 27 | 4% | 1/12 | 9/12 | 0.5 |
| | Mexico · Intermediate | 3.1 / 3.7 s | 45 | 0% | 0/12 | 11/12 | 1.3 |

The references talk about the town in 67–93% of visits against shops' 8–33% (Beginner) and 63–90% (Intermediate), with almost no purchase; their lines are longer (26 and 44 words against 20 and 32) and replies about 0.2–0.4 s slower. They repeat as much as shops (Italy Beginner 3.0): repeats are a memory problem, not a place problem.

Threads (C) dropped, 2026-11-06: planting with dice (Josh: "is planting ideas the right approach"); the code was removed before merging.

| Nothing to buy where nothing is sold (`dialogue.md` 2026-11-06c, long; and "Stay in your role." alone; and two other approaches) | **Dropped** (laptop, 2026-11-06) | Josh: "this drift is a app wide problem". The drift wasn't there once measured properly. One fixed moment, 10 runs each, Beginner: the Teatro Massimo costume maker's return-visit opening, 0/10 tickets under the live rule, the long rule and a one-sentence rule (the earlier "Hai già il biglietto?" came from the simulated learner asking for a ticket on visit 1, kept in memory); Carla's coffee 0/10 under all four approaches (a one-off); Beto after "I'm very hungry": never sold the torta in any version; he pointed to the stands, offered a ride, and asked "¿Quiere tacos o pizza?", which a judge counted as an errand (live rule 8/10, "Stay in your role." 9–10/10, a fact "The only thing you sell is taxi rides." 1/10, cutting the "Vuole…?" line from beginner.md 4/10). Josh: "he didn't change roles", so that question is in role and the live rule holds. Three "you don't sell or check tickets" sentences in here lines removed (instructions, local). Lessons: free-running visits with a simulated learner who buys can't show invented errands; test one fixed moment; read every line before trusting a judge's count (Josh: "every experiment should maximize learning, not results"). |
| No speed of speech (`leveling.md` 2026-11-06, both countries; Ximena's here line; three personalities) | **Josh's decision, no test** (2026-11-06) | "Speed of speech doesn't belong in a character prompt": written words can't slow the voice (its speed is the app's, 0.9). Removed "Speak very slowly and carefully" (stage 1), "Speak slowly and clearly" (stages 2, 3), "Slow down even more" (support back), "explaining the menu slowly" (Ximena), "fast-talking" (three characters in Mexico City, Florence, Palermo); kept what writing can do: one idea at a time, short sentences, the key thing twice. |

## Unit tests (docs/prompt-testing.md: one card per test)

**Decision from T1 and T1b (2026-11-06):** a `here` line says who the person is and what the place is, with no "you like telling…" or "you love talking about…": a named topic is said on every visit (15/15) and cutting it lost no local talk. Applies to Italy's new batch 1–2 lines (this session, after a card on one Italian place) and Mexico's lines (the other session).

### T1: does a topic named in a `here` line get told on every visit?

- **Date:** 2026-11-06
- **Unit:** B1 (the setting: the person's `here` line)
- **Hypothesis:** naming a topic in the `here` line makes the character bring it up on almost every visit; if the counts come out the same, the topic comes from the place, not the line, and cutting topics won't fix repeats.
- **Variable:** Ximena's `here` line (Café Amapola, Mexico City), with or without its last sentence, "You love talking about café de olla, the traditional Mexican coffee with cinnamon and piloncillo, and about how you take your own coffee." Everything else the same.
- **Result measured:** visits where one of her lines mentions café de olla, counted in code ("olla" in her line).
- **Setup:** Beginner, stage 2, Mexico; 5 sets of 3 visits on different days, memory carried between visits as in the game; 4 learner turns a visit; the simulated learner never brings up drinks or the menu. Script: `tests/experiments/here-topic.mts` (`VARIANT=A|B`).
- **Result:** A (with the sentence) 15/15 visits (5/5 on visit 1, 2 and 3); B (without) 0/15.
- **Learned:** the line causes the repeat; the place alone doesn't (a Mexican café never brought up café de olla without it). Seen in the lines, not measured: without the topic she repeats the learner's last order instead ("¿Quiere un café con leche otra vez?" on most return visits), from memory; the weather ("Hoy hace mucho frío") opens many visits either way (unit C1).
- **Decision:** a topic named in a `here` line is a repeat. Next questions: (1) does the same hold for a different kind of planted line (a story, not a topic)? (2) the "otra vez" repeat is memory (C3).
- **Commit:** the one this entry is in.

### T1b: without the planted topic, does she bring up other local things on her own?

- **Date:** 2026-11-06
- **Unit:** B1 (Ximena's `here` line), same variable as T1.
- **Hypothesis:** cutting the planted topic also cuts what's particular to the place.
- **Variable:** as T1, with or without "You love talking about café de olla…" (the line no longer has "slowly", Josh's decision the same day, in both versions).
- **Result measured:** visits where she mentions anything in a set S fixed before reading, café de olla excluded: foods and drinks (pan dulce, conchas, tamales, chilaquiles, churros), places (Condesa, Parque México, Roma, Reforma, Zócalo), customs (Día de Muertos, posadas, quinceañeras), words (qué padre, ahorita, chilango); and those where she brings it up herself (the learner didn't say it in that visit). Counted in code on the full transcripts, then every line read.
- **Setup:** T1 rerun with every line kept (T1 printed only first lines; Josh: "just read her answers"): `tests/experiments/here-topic.mts`, outputs `tests/experiments/out/here-topic-A-1794010664030.md`, `here-topic-B-1794010657046.md`. T1's own result reproduced: café de olla 15/15 with the sentence, 0/15 without.
- **Result:** any S item: A 14/15, B 15/15. Brought up by her: A 4/15, B 10/15 (B: pan dulce 5, Parque México 6, ahorita 2; also Parque España, the curved streets around the park, coffee from Oaxaca and Chiapas, her dog Mole "like the sauce").
- **Learned (measured):** the hypothesis is rejected: cutting the topic didn't cut local talk (any S item 14/15 with it, 15/15 without). The customs in S came up 0 times in either version. **Leads, not findings:** that the topic crowds out other local talk (S items she brought up herself 4/15 vs 10/15: one character, one run each, noise unknown; "herself" only means the learner didn't say it in that visit, order not checked; the learner prompt names Condesa); that there's no culture beyond the neighbourhood (read, not measured, apart from the customs). Seen in the lines: both versions repeat the last order on return visits.
- **Decision:** cutting a planted topic didn't lose local talk at this café. To confirm "crowds out": the same test run again, and a second character. Open: where deeper culture should come from; the order repeat (memory, C3).

### T3 (2026-11-06): does T1 hold for a different character and kind of planted line?
- Unit: here line, Efrén Martínez at Monte Albán (Oaxaca). Card shown to Josh before running (docs/prompt-testing.md).
- Variable: ", and you like explaining the Gran Plaza, the ball court and the carved stones called the Danzantes." (A: present, B: removed; B's line then ends without a full stop). Held: the rest of the line, Beginner stage 2, harness of T1 (tests/experiments/here-topic.mts, now parameterised; T1's values are the defaults).
- Measure: visits where his lines match /danzante|juego de pelota|ball ?court/ (code), out of 15.
- Hypothesis: A ≥ 10/15 and B ≤ 5/15. Result: **A 13/15 (5/5 · 5/5 · 3/5 by visit), B 0/15. Met.**
- Read: all lines (tests/experiments/out/here-topic-T3-A/B-*.md). With the sentence, Monte Albán is the conversation (the Gran Plaza, the Danzantes as the region's oldest carvings, the ball court, his village in the valley) and it repeats ("¿Quiere ver los Danzantes o el juego de pelota?" on visit after visit). Without it, no repeat, but almost nothing particular to the place (weather, shade, benches, where the learner lives); in one set he serves the learner a coffee.
- Gap in the card: no guard for culture. Unlike T1b (Ximena kept her local talk), at a cultural place the planted line is the culture. Reading only, not counted.
- Decision: not the card's (cut every "you like explaining…"). Keep the lines; the repeat is a memory problem. Next: T4, a memory line ("you've already told them about…") on return visits, with a culture count fixed before the run. Card to Josh first.

### T4 (2026-11-06): does telling the character what they already told stop the repeat, and keep the culture?
- Unit: memory notes on a return visit (lib/remember.ts → the relationship line). Efrén Martínez at Monte Albán, his here line as written (with the Danzantes sentence). Card shown to Josh first.
- Variable: one note, "Already told them about the Danzantes and the ball court." (A: without, B: with). Held: the other notes, the date, Beginner stage 2, the learner's line.
- Moments (fixed, from T3's real visits): M1 the return visit's opener; M2 his reply after a fixed opener and "Bien, gracias. Estudio mucho español esta semana."
- Size: 2 moments × 5 runs × 2 versions (the method's smallest size; T3 had been larger than needed). Harness tests/experiments/memory-told.mts.
- Measures (code): repeat /danzante|juego de pelota|ball ?court/; culture from a list fixed before the run, leaving out every word in his line.
- Hypothesis: B repeats ≤ 3/10, culture at least half of A's. Result: **repeat A 7/10 (M1 4/5, M2 3/5), B 0/10. Met.** Culture 0/10 both: uninformative, since A's culture is the repeated cluster itself (a flaw in the card). Words per reply 29 vs 26.
- Read: all 20 lines. With the note he stops re-offering the Danzantes and the ball court, but nothing new comes: sun, shade, the view, twice "en mi casa hablamos zapoteco". One cluster to tell, and once it's told he runs dry.
- Decision: the memory step is worth building (record what was told; carry it to the next visit). The repeats are partly thin material: cultural places need more than one thing to draw on, as facts, not "you like…". Next: T5, a fuller line with the same note. Card to Josh first.
