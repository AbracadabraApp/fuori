# Learn

2026-10-20 · Josh · Notes for an idea still forming: precision and measurement wait until it has shape (Josh). Learn replaces Magda and the Diario; those areas go away once it's built.

Learn is a part of the app like Settings, not a character. It has two parts:

- **The Learn agent** reviews one conversation, on the conversation screen, and writes its page.
- **The Learn area** (the icon next to Settings) holds the learner's history across all conversations: the structured side.

Each page the agent writes feeds the area.

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

**Where:** on the conversation screen. After a few turns (Done is set aside for now) a Learn link appears; tapping it pauses the scene and raises a scrollable sheet over the conversation. Close it and you're back in the scene.

**What it reads:** the whole conversation, the learner's lines and the character's alike, plus the learning notes the memory call already writes after every conversation (mistakes, words worth learning, what wasn't understood, English fallbacks; Josh: "Magda may already have that"). Later, the learner's history from the area, so it can notice progress (principle 8 and below).

**The page, in this order (Josh, 2026-10-20):**

1. **Corrections first.** Every mistake the learner made goes here, the form of address included (*scusa / dimmi* to a stranger); their 3 most useful. Each one:
   - You said "…". The right phrase is "…": the simplest natural phrase an Italian would say, not their sentence patched. When the full fix is beyond their level, the simple version (*Grazie dell'aiuto!*).
   - Why, in one plain line.
   - The character's line saying it right, with a play button, if there is one.
   - 🎤 Repeat it. This is the only speaking on the page.
2. **Nouns:** a table of about 5. Italian (with its article) · English · the character's whole sentence where it came up, with a play button. A short line a learner can follow, or the short part of a longer one.
3. **Verbs:** a table of about 5, the same way, with the infinitive.
4. **How the language works:** one thing that came up and that they didn't get wrong (their mistakes are all in Corrections). Two plain sentences and one of the character's lines.
5. **Life here:** one line, if the scene had something.

**Length:** short; a page read in a minute or two. No introduction or praise, no notes under the tables (Josh: "still pretty long" until these cuts). For scale: the Rosa conversation was 796 words and its page 369.

**Still to add (direction, 2026-10-20):** a can-do line at the top (principle 9); examples before the rule (3); simplest natural phrase and the level check on every correction (1); only correct character lines (12).

**Later:** notice progress from the learner's history ("last time *quanto costano* was hard; today you said it right"), bring back words from earlier pages, stop correcting what they've mastered.

**Rating it (proposal):** correct first: every quote really said, every "You said" really theirs, the words they asked about on the page (code can check these); right for the learner: Josh's reading, and in the app one tap (useful / so-so / not for me) and "I knew this" on a word; does it stick: in later real conversations, the corrected phrase used and the mistake gone. A real teacher's picks on a few conversations are the best reference for "would a teacher choose these".

**First try:** `content/it/prompts/learn.md` (experimental; nothing in the app calls it), run by `tests/experiments/learn-page.mts` on the modelled month and on one of Josh's conversations (pages in `tests/experiments/out/`, off git).

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
