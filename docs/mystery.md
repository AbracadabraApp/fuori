# Mystery notes

2026-10-30 · Josh and Claude, in conversation · Ideas, not decided. Builds on [adventures.md](adventures.md) → A mystery to solve.

## Two modes (Josh)

- **Scooby-Doo mode:** a light mystery in town (the fountains ran red last night). You ask around; clues sit with people you already visit; it ends in a cheerful unmasking: someone ordinary with a reason. Teaches asking questions (*chi, dove, quando, hai visto…?*), the past tense, and retelling what someone said. Suits Beginner and low Intermediate.
- **Le Carré mode:** quiet spycraft. Pick something up, pass on a phrase, notice who's at the bar, sound like a local. Teaches close listening, register (*tu* or *Lei* is your cover), set phrases said exactly, remembering who said what. Suits Intermediate and Advanced.
- Both are homages to the genres: no borrowed names or characters. Both are generated, not scripted: a tone and a goal, not scenes.

## It runs alongside the game (Josh)

The mystery runs in parallel to play. Neither the game nor Claude knows when a player will pick up a thread.

## Josh's version: a rumour

Each conversation has a 1 in 3 chance that you're told the water in the fountains turned red last night. If you go asking others, the story builds.

Notes on it:
- Stop rolling once you've heard it, or every third person repeats the news.
- Without anything telling characters about the rumour, they'd still play along when asked, but each would invent a different cause and it would never lead anywhere. Real gossip is like that; what's lost is the sense that asking gets you somewhere.
- A light fix: the prompt carries what's been said so far ("people are talking about {rumour}; so far you've heard {…}; if asked, add something you'd know as a {role}"), and what each character adds is saved when you leave. After 4–5 details, the line becomes "you know how it ends".

## Josh's question: less scripted, but always in mode

Could Claude compose the story, with characters just taking part naturally, and still keep it unmistakably a Scooby-Doo mystery?

Claude's sketch: **a showrunner.**
- One Claude call that knows the genre's rules: something eerie, a few suspects from people you know, a red herring, clues around town, an unmasking.
- It decides the truth at the start and keeps it secret, in private notes stored with the learner.
- It gives a handful of characters a short "on your mind" line: what they know, suspect or saw, not dialogue. Characters get it the way Italy's cast gets its `here` line, and improvise from it.
- It reads what happened and bends the story toward the learner if they asked around; if they didn't, the story still moves a step.
- The genre lives in one place, the showrunner's instructions. Nobody's lines are written, but everyone's mood is.

**Tied to conversations, not days (Josh, 2026-10-30: days and weeks are "an unneeded complication"):** the showrunner runs after each conversation, in the leave function; the ending comes after a set number of conversations.

New pieces: the showrunner call, its private notes, one line in the character prompt. The same slot could later carry a Le Carré story, a festival or a strike.

## Pros and cons of the showrunner

**For**
- The town has something on its mind; places feel alive.
- Little code; the rest of the game is untouched.
- A reason to come back to the same people.
- Real teaching: unscripted questions, unpredictable answers, retelling (past tense, reported speech).
- Works in any language: no phrase lists.

**Against**
- Can crowd out the scene or a lesson: touch only some characters, and none during lesson practice.
- Hard to follow at A1 unless it uses the Beginner format's English framing.
- The showrunner can drift: forget its truth, contradict itself, never reach the ending. Private notes and a fixed length help.
- One more Claude call per conversation; a failure must not be silent.
- Some learners won't want it: likely needs a way to opt out.
- Testing: `smoke:live` running ten conversations in a row.

## Open
- Rumour or showrunner, or the rumour as the showrunner's first move.
- Which level first.
- How many conversations a mystery lasts.
