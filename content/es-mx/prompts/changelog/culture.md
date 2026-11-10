# culture.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../culture.md`.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

### 2026-11-06: the first turn says what it is

Josh, 2026-11-06: "In lessons the Palio isn't described well. Cultural lessons need to explain the topic clearly at the start". The Siena item opens "The prize of the Palio is not money but the drappellone" and the teller kept to it, so a newcomer never heard that the Palio is a horse race in the Campo. Across the set, a judge found the first turn said plainly what the topic was in 8 of 18 Italian and 12 of 20 Mexican lessons (tests/experiments/culture-opening.mts). The Story block now takes a first-turn instruction (Story: first turn): the first sentence is a topic sentence naming the topic and saying what it is (Josh, after a first try that opened with small talk and explained later: "the topic can be followed but there is no topic sentence"), then where and when, and what the story depends on, before the story.

### 2026-11-05b: alcohol isn't left out

Josh, 2026-11-05: "its fine if alcohol comes into the game (like the mezcaleria)"; wine bars are hidden only because enotecas make dull scenes. The 2026-11-04c line "Nothing about alcohol (wine, beer, spirits): the game is for all ages" rested on a reason Josh had already corrected (not age), so it's gone; items about wine or mezcal can be picked again. The items dropped then (ombra, ricciarelli with vin santo, mezcal) are not put back by this change.

### 2026-11-04: first version

Josh, 2026-11-03: "handle all the data and code work" for culture. From the other session's tested prompts (tests/experiments/archive/culture-lesson.mts; Rome: six items, all passed the fact judge, tipico; two played as lessons), made language-neutral (the language and the city come from the content), with a Fix and a Choose step for the bounded pass the doc decided (write, judge once, fix the failures, recheck once, drop what still fails), and two changes from the review of that trial: each turn is capped at three or four short sentences (the trial's Intermediate turns ran to about 90 words, a lot to follow by ear) and the teller keeps to the checked facts. Beginners hear the story in the Beginner format's English parts, with the words as word parts.

### 2026-11-04b: no "word worth keeping"

Josh, 2026-11-03: he hates the idea of "keeping" or owning words, "so weird and just not the tone of the game. Are you supposed to own Rome or Claudio too?" (it came up with flashcards too), and "this keep thing is not my creation". In the trial the last-turn line made tellers say it out loud ("Ti lascio una parola da ricordare", "that is the word worth keeping"). The words are now just the ones the story turns on, used the way the teller always would; the last turn ends the story without a takeaway. The learning is following the story in the language and answering.

### 2026-11-04c: recasts, more of the language for Beginners, no alcohol

Josh asked whether the lessons had the right shape and spirit, then "fix all the what's wrong". Every item in both sets, played through the real code (24 lessons), showed:
- **Intermediate mistakes went by without a recast** ("Sono molto interessante", "io voglio vedere lo", "ho la fretta"). The speaking part now says to use the right form as they react, the way a friend would, without pointing it out (CLAUDE.md: characters correct real errors by recasting in character).
- **Beginner lessons were about 80% English.** The Story brief opened with "the rules above about the conversation don't apply in it", which also switched off the Beginner rules (English at most two short sentences a turn, phrases in the language). That line is gone; the turn may be a little longer since they asked to listen. The Beginner part says the Beginner rules hold, the English carries the story in at most three short sentences, and every turn has one line of the story in the language as a word part.
- **The ombra item was about wine**, with the teller offering "la tua prima ombra"; wine bars are hidden as not appropriate for all ages (Josh, 2026-10-27). Pick and Choose now leave out alcohol; the ombra, ricciarelli-with-vin-santo and mezcal items were dropped from culture.json.
- **Dates and names a listener can't hold** (1325, the Madonna di Provenzano): the teller now leaves them out.

### 2026-11-05: corrections in dialogue.md

Josh's family's play, 2026-11-04 and 05: Magda coached Jennifer's "¿Owen me ayuda?" (a misheard "Joven, ¿me ayuda?") into "HO-ven", and met "Estoy en el barco de canzart" with "Almost! The word you want is cansado". Josh: fixes "are global improvements not local to lessons or conversations or one country"; "its ok not to get corrected all the time". Corrections and mishearings now have one rule for every conversation (dialogue.md, added to every system prompt), and the app tells the character whether an offered answer was said back (lib/dialogue/heard.ts); this file no longer has its own. Removed: the speaking part's recast line (dialogue.md has the same rule, for every conversation).
