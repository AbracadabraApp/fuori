# intro.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../intro.md`.

### 2026-11-11e: the beats given to the character once, not one a turn
- **Added:** "Beats": one line in the system prompt of every turn after the intro, at every level: what was set out, to come back to when the talk gives a reason, in any order, "not a list to work through". Replaces the per-turn "say one more thing about {beat}" note (shapes.md 11c, removed in 11d).
- **Why:** the cloud session's point, agreed by Josh ("go"): a note on every turn makes every turn the same turn, and a prescribed topic makes it worse; a character writing by habit varies (Nunzio), one following a per-turn instruction performs it. The beats stay, as material the character has, not as orders.

### 2026-11-11d: the intro names its beats
- **Added:** both reply formats return `beats`: the three or four things the intro set out, each named in a few words of {language}, in order. Stored with the opening turn; each later turn's thread note names the next one ("say one more thing about {beat}"), the goodbye is offered after the last, and at the end of the visit they're written into the character's notes as what was told, so the next intro picks something new (the told-ledger).
- **Why:** Josh, 2026-11-11: the intro sets the scene and the turns discuss it ("Lets do that"): the thread note alone was a nudge, not material; the turns circled the first thing or reached for new ones.

### 2026-11-11c: who they are first, and shorter
- **Changed:** "six to eight short sentences, all about the thing your place is known for" → "first who you are, in one short sentence (your name, what you do here), then four or five short sentences about the thing your place is known for". Nothing else.
- **Why:** Josh, 2026-11-11, after playing the live intros in Palermo: "Everything is basically too long"; "The character doesn't often introduce themselves". The intros ran 100–115 words; a learner met Elena for a whole visit without her name until the goodbye.

### 2026-11-11b: the question comes out of the content, never about them
- **Changed:** the Brief's last-question line: "End on one question that comes straight out of what you just told them: which of the two they'd like, whether they want to see or try the thing in front of them, what they make of it; a word or two answers it. Never a question about them: not whether they're visiting, where they're from, whether it's their first time." Was "one question about what's here that they can answer in a word or two".
- **Why:** Josh, 2026-11-11, hypothesizing before playing the first build ("no - just hypothesizing"): "after a long intro, the question should be very tied to content, or engaging. 'Are you visiting' after a cultural intro is a stinker." Six fresh Mexico intros on this version all ended on a content question (which polish, with or without the sauce, the drawings or the house). The tourist question is the one the Relationship block already forbids for the chat; the intro's own brief now says it too, and says what the question should be instead.

### 2026-11-11a: the first version
- **Added:** the Brief (six to eight short sentences in {language} about the thing the place is known for: what's done, how, why, as done at this place; the person only in one clause where it explains the custom; one question at the end answerable in a word or two; a return visit picks up where it left off, then something new) and two reply formats (sentences with their English; the same with two answers for Beginner 2). `lib/intro.ts` builds the prompt from character.md's "Who: you", "Who: the learner" and "Relationship" blocks plus these, without the turn rules or dialogue.md; `/v1/turn` plays it on the opening of every ordinary visit at Intermediate and Beginner 2.
- **Why:** Josh's design (2026-11-11, docs/dialogue-structure-reference.md § 0): "culturally rich and personally engaging in the native language, English subtitles run below, the narration leads to the first question said in language and echoed in English, subtitle UX drops out and we are in chat". On content: "I'd prioritize explaining the cultural points; if that needs 30 seconds fine, but we don't need to make it 45 by adding too much biography." On the prompt: "if the intro requires something more prescriptive to content, if not so burdened by character.md idiosyncrasies". Not a prompt trial: a new kind of turn Josh asked for; checked by reading intros in both countries (tests/experiments/intro-live.mts), then played.
