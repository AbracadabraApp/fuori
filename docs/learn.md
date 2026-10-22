# Learn

2026-10-20 · Josh · Notes for an idea still forming: precision and measurement wait until it has shape (Josh). Learn replaces Magda and the Diario; those areas go away once it's built.

**One home (Josh, 2026-10-21):** Magda, the scuole (the schools for foreigners on the map), the Diario and missions all fall into Learn, reached from the book icon in the nav bar next to Settings. In docs and talk, "Learn" is the one name for teaching outside the world; tutor, school, study file, Diario, chips and missions are older names for parts of it.

Learn is a part of the app like Settings, not a character. It has two parts:

- **The Learn agent**, the "co-pilot" of each conversation (Josh, 2026-10-21): reviews that one conversation, on the conversation screen, and writes its page. Reached from the conversation (the Learn link), not the book.
- **The Learn area**, the "home" for structured, scripted, comprehensive learning (Josh, 2026-10-21): what Italian learners need, in course order, aware of the learner's whole history. The book icon next to Settings.

Always say which: "Learn" alone has meant both, which is how the review first ended up behind the book. If one had to go, the agent stays (Josh: "I'd get rid of the nav bar area, but I'm not sure why we'd have to"), so it's built first and the area grows from its pages.

Each page the agent writes feeds the area.

## Provisional notes (2026-10-20, still baking)

Not requirements; ideas Josh wants to let sit (Josh: "we have to be provisional and let ideas bake"). What's clear so far:

- **Schools go away, and Magda is no longer an in-game character** (Josh, 2026-10-20). Whether Learn has a teacher or is just content is open; Josh leans toward no person. What Magda's code does that Learn would keep without her: the learning notes after every conversation and the study file (today stored as Magda's memory row; it would become the learner's own record).
- **Learn is not the game. It's spell check** (Josh): a tool you reach for, precise and useful, no ceremony. No rituals, no time or calendar (the game has none).
- **The Done and Learn links are just ideas** (Josh, 2026-10-20). If there is a Learn link, not every conversation needs one (Josh): it appears only when there's something worth reviewing. The conversation's learning notes still reach the area when it ends.
- **The agent is for review** of one conversation; **the area has more latitude for lessons**, including what may never come up in conversation (seasons, prepositions).
- **Lessons draw on the learner's own conversations, always**, but not necessarily in aggregate: one good line they heard, not a count.
- **The people you know illustrating lessons** (portraits, voices, lines) fits the vision; an idea, not a requirement.
- **A lesson might run:** get ready, notice (examples first, then the rule), say it. A suggestion.
- **Missions stay** (Josh: they were never "in the world"): constructed teaching paths for drilling (Meet → Tap → Build → Say → Stretch), separate from the open game.
- **Being recast:** the Diario's chip wall, Magda's lessons and the study file, and the syllabus as one structure in the area (a chip with its lesson and its missions; colour for met, studied, solid). Not settled.

## How Learn teaches

The principles behind both parts. They come from Josh's reactions to the first pages (2026-10-20) and from how *Nuovissimo Progetto italiano 1a* teaches (its own introduction and unit structure; the unit-by-unit summary is in [research/syllabus/a1-progetto-1a.md](research/syllabus/a1-progetto-1a.md)).

1. **At the learner's level.** Everything sits one step above where they are, never three. Their level comes from their own lines, and later from their history. The course's order is the guide to what's within reach: at A1, *quanto costano* and *tu / Lei* are early; the past infinitive (*grazie per avermi aiutato*) isn't in A1 at all.
2. **Choose like a teacher.** First what blocked understanding, then what they'll need again constantly, then what keeps coming back. Skip rare words, advanced structures and speech-to-text noise.
3. **Examples first, then the rule.** Show the character's lines, then "notice that…". The course does this throughout: look at the examples, then finish the rule yourself.
4. **Plain words.** One sentence of explanation; no grammar terms for beginners ("*quanto* never changes"). Grammar words come in as the learner advances.
5. **Light tables.** Only the forms needed now; the full table a tap away, the way the course moved its full tables to an appendix (Josh: the full conjugation is too much).
6. **Hear it, then say it.** The character's voice plays the line, the learner repeats it (the course's "listen and repeat"). A slow version for a first listen lowers the anxiety that blocks learning.
7. **The same people, over time.** The course keeps the same characters across units for continuity; Learn's examples come from the people the learner keeps meeting.
8. **Words come back.** Vocabulary returns in a spiral, across conversations and between the page and the area.
9. **Can-do goals.** Say what the learner can now do ("Today you asked for fruit and paid at the market"), as each course unit opens with what you'll learn to do.
10. **Life here.** A short culture note when the scene has one, as each unit has its culture page.
11. **Check at set points.** The course tests after each unit and recaps every three. Learn recaps every few conversations, in the area.
12. **Only correct models.** A character's line is an example only if it's right; characters slip too ("cosa le servono" for *cosa le serve*).

## The Learn agent: one conversation

**Where:** on the conversation screen. One idea (Josh: the Done and Learn links are just ideas): after a few turns a Learn link appears; tapping it pauses the scene and raises a scrollable sheet over the conversation. Close it and you're back in the scene.

**What it reads:** the whole conversation, the learner's lines and the character's alike, plus the learning notes the memory call already writes after every conversation (mistakes, words worth learning, what wasn't understood, English fallbacks; Josh: "Magda may already have that"). Later, the learner's history from the area, so it can notice progress (principle 8 and below).

**The page (Josh, 2026-10-21; replaces the 2026-10-20 order).** Walked through with Josh on the "Learn sheet" canvas (https://claude.ai/artifact/TvFT7hHqsKb1uHW5cbcD4Z, board 3 "Simplified"). Replaying text, not the mic: nothing on the page asks the learner to speak.

- **Top:** the book symbol filled in (the Learn toolbar icon, selected), the character's name and the place, Close. No "Learn" title, no summary or praise line, no section label for corrections.
1. **Say it this way: corrections**, each one a single button, in this order:
   - Closed: *you said "…"* and "Tap to fix". Seeing their own line first gives the learner a moment to fix it themselves.
   - Tapped: it opens to the why (one plain line), then the right phrase (the simplest natural one, as before), which plays at once **in the character's voice**. Tapping again replays it. No Play icon (it plays by itself), no separate box with the character's line, no Repeat it.
2. **The character's words ("<name>'s words"): a plain word list, not about speech.** One card, "Things" then "Doing": Italian on the left (nouns with their article, the plural if that's what was said; verbs as the infinitive with the form the character used, in small grey, *prendere · prende*), English on the right. No audio, no example sentences. About 6–8 words met in this conversation that are new at the learner's level.
3. **Good to know: always one cultural or practical point** from the scene (paying at the *cassa* first). No grammar lesson here: the "How the language works" section is gone; language points live in the corrections.

**Idea, not decided: the Learn checkpoint (Josh, 2026-10-21).** After a number of turns (Josh's example: turn 20; Claude suggests starting near 8–10 of the learner's lines and stretching it with level) the mic gives way to the Learn link for one turn: the conversation stops for a moment so the learner goes over it while it's fresh. Counted, not judged. Never a trap: a way to keep talking is always there, and the count restarts after; the next sheet covers what's new. The bottom-right Learn link stays for looking early. **The Done link is tabled** (Josh, 2026-10-21), so the checkpoint doesn't lean on it.

**Idea, not decided: the page as units (Josh, 2026-10-21: "the learn page doesn't always have to look the same or try to be complete").** Instead of the same sections every time, the page picks a few units, chosen by what happened in the conversation. At most three a page, corrections first when there are any, never an empty unit ("no corrections!" doesn't show). Each unit could be its own small output, so each can be trialled alone. Candidates:

| Unit | Shows when | What it is |
|---|---|---|
| Say it this way | Mistakes worth fixing | The tap-to-fix corrections above |
| The word you were missing | The learner fell back on English or stalled | "You said *receipt*: **lo scontrino**." |
| What she meant | The learner asked for a repeat or didn't follow | Her line, the English, tap to hear it again slowly |
| A phrase to steal | She used a chunk the learner can reuse | *Lo prende al banco?* → *Lo prendo al banco.* |
| Numbers she said | Prices, times, quantities came up | *un euro e venti* = €1.20 |
| Her words | New words came up | The plain word list above |
| Two ways to say it | A contrast came up (*tu/Lei*; Spain vs Mexico, *¿me regala…?*) | Two lines side by side, one sentence on when |
| You got it | Something hard last time went right (needs history) | "Last time *quanto costano* tripped you; today you said it." |
| Next time, try | Almost always | One thing to say on the next visit; the character can listen for it |
| Good to know | A cultural or practical moment | One paragraph |
| The character's own thing | A running bit (Don Chucho's song) | One line of flavour |

Claude's favourites: The word you were missing, What she meant, Next time try (straight from where the learner struggled, short, and the last ties Learn back to the game).

**Length:** short; a page read in a minute or two. No introduction or praise, no notes under the tables (Josh: "still pretty long" until these cuts). For scale: the Rosa conversation was 796 words and its page 369.

**Still to add (direction, 2026-10-20):** a can-do line at the top (principle 9); examples before the rule (3); simplest natural phrase and the level check on every correction (1); only correct character lines (12).

**Later:** notice progress from the learner's history ("last time *quanto costano* was hard; today you said it right"), bring back words from earlier pages, stop correcting what they've mastered.

**Rating it (proposal):** correct first: every quote really said, every "You said" really theirs, the words they asked about on the page (code can check these); right for the learner: Josh's reading, and in the app one tap (useful / so-so / not for me) and "I knew this" on a word; does it stick: in later real conversations, the corrected phrase used and the mistake gone. A real teacher's picks on a few conversations are the best reference for "would a teacher choose these".

**Kept simple for now (Josh, 2026-10-21: "simplify these"):**
1. The page is corrections, words, good to know, and nothing else; that's the page with good content and its own length limit.
2. A page is practically never empty (a clean conversation still has words and a good-to-know), so no fill-in sections (words you might hear, more about Italy, the person) unless empty pages show up.
3. The same page mid-conversation and at the end: always the conversation so far.
4. The Learn link appears after four learner lines (Josh: "I'd probably try 4 turns, not 2"), in the bottom-right corner where Pause would be (in tap-to-talk there's no Pause; Resume takes the corner while paused; in Hands-free it sits above Pause). Nothing smarter (material, winding down) yet. The aggressive version, the mic turning into Learn at around turn 20 of a long conversation, is an idea for later.
5. Closing returns to the scene; the back arrow is the way out. Learn as the way out waits, like Done.

**Wired up (2026-10-21; on for everyone since Josh said no test flags while it's him and family):** in a conversation, once the learner has sent four lines, the **Learn link** appears bottom right, above Pause (Josh: the nav-bar book is the Learn area, not the sheet). Tapping it pauses the scene and opens the **Learn sheet**, which calls POST /v1/learn (the **Learn agent**: `lib/learn.ts`, the prompt below) for the conversation so far; corrections say `right` through /v1/speak in the character's voice. Closing leaves the scene paused. Italy only: a country without `prompts/learn.md` gets "Learn isn't ready for this country yet". The memory call's learning notes aren't passed yet (they're written when the conversation ends; mid-conversation the prompt gets "(none)"). The Learn area (the book in the nav bar) isn't built.

**First try:** `content/it/prompts/learn.md`, run by `tests/experiments/learn-page.mts` on the modelled month and on one of Josh's conversations (pages in `tests/experiments/out/`, off git).

## The Learn area: the learner's history

**Where:** the icon next to Settings, on every screen; it opens like Settings.

**What it holds**, all grown from the learner's own conversations:

- **Conversations:** most recent first, each with the character's portrait and its page.
- **Phrases and words:** everything the pages taught, each remembering who said it and where, with the character's voice. They come back for review in a spiral (principle 8), not all at once. The Diario's chip ideas and the A1–A2 phrase cards can seed it before the learner has phrases of their own.
- **Corrections over time:** what's been corrected, what's fixed, what keeps coming back.
- **Grammar met:** each point illustrated by the characters' real lines, with the full table here (principle 5).
- **Recaps:** every few conversations, a short check of what came up (principle 11): hear a line, say a phrase.
- **Lessons:** sitting down with something on purpose (Magda's idea), in the course's order (principle 1), with English freely.
- **Can-do:** what the learner can now do, gathered from the pages' can-do lines (principle 9).

The study file (Magda's record of the learner, updated after every conversation) is the natural store for the area's memory of the learner; the pages are its content.

## Shelved

- A RAG over the full texts of the course books (Josh, 2026-10-19: shelved, low value for now).

## Earlier draft (2026-10-19), superseded

Learn as a teacher with a name, portrait and voice, next to the Diario: Ask ("what did the barista mean?") and Lesson (from the study file, ending with one thing to try in town), English both ways (`/v1/transcribe` with `mode: "any"`), the school leaving the map, `pack.tutor` becoming that teacher, and prototype steps L1–L3. The recast keeps Learn outside the world but makes it a part of the app, not a character, and centres it on reviewing each conversation. Why it started: characters now teach in passing (teach3), and the school was hard to reach (4 of 106 conversations; schools in 11 of 20 Italian cities).
