# quality.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../quality.md`.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

### 2026-10-29: Spanish examples
- The examples of a correction and of being lost were Italian; now Spanish. No change of rule; the examples were the other country's (whole-app scan, 2026-10-29).

### 2026-10-27: how much each side speaks the language; Beginner English isn't a fault
- **Added** `words`: the character's phrases in the language (how many; their average length is words ÷ phrases: Josh, "the length of phrase and number of phrases per dialogue"), its words in the language and in English (totals), the person's words, and the person's lines that were mostly the language, mostly English or mixed.
- **Changed:** a Beginner conversation gets the `## Beginner` block: the scene-setting English is by design, so `englishUnasked` counts only English beyond it.
- **Prompted by:** Josh, 2026-10-27: "do we have a concept of how much Italian is spoken?", then "both are important, character and speaker", and "for character it shouldn't be share but total words". The judge had scored Beatrice (Beginner, 36 replies) at 36 "unasked English" lines and called her a bilingual assistant, for doing what the Beginner level asks.

### 2026-10-16: coherence and "alive"
- **Added** `incoherent` (lines that don't follow from the conversation) and `alive` (1–10, a real person in that place, as in `npm run test:conversations`).
- **Why:** both go on the dialogue scorecard so the replay gate checks them; until now coherence was noticed only by reading, and "alive" only graded in the simulated-conversation test.
- **Prompted by:** Josh, 2026-10-15: add coherence and feels alive to the scorecard.

### 2026-10-12: first version
- Counts the judged items on the scorecard: pronunciation corrections, corrections asked for and unprompted, garbled lines missed, pulling back when the person is lost, English nobody asked for, and the biggest problem.
- Teaching isn't a failure: corrections the person asks for are counted separately, and one or two unprompted corrections a conversation is fine (Josh, 2026-10-12: they help). Being asked "are you a tourist?" isn't counted at all: it's what happens to an American ordering coffee.
- **Prompted by:** the dialogue quality plan (docs/10-testing.md), after the first analysis of Josh's real conversations.
