# quality.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../quality.md`.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-11-10r: the grade restructured (quality only, one-sided Character)
- **Changed:** `extraGoodbyes` (a count the code can make exactly from the recorded setups) became `keepsClosing`, a yes or no for a conversation that won't end. A reply that offers answers now ends with "[Answers shown on screen: …]" in the transcript the judge reads.
- **Added:** a separate Character call (`## Character`), which sees only the character's lines and grades how much he comes across as a real local, 1–10, so the learner cannot affect it.
- **Why:** Josh, 2026-11-10: the grade is conversation quality, one-sided for the character; instrument readings (the goodbye turn count, heard, followable) are reported by code and not graded. The judge had been faulting "here are two things you could ask me" followed by nothing in 8 of 20 conversations, because the stored text left out the answers.
- **Not run yet:** card Q1 (`docs/prompt-trials.md`).

### 2026-11-10q: five counts for the one grade (lib/grade.ts)
- **Added** `unanswered`, `cutOffByGoodbye`, `extraGoodbyes`, `placeFacts`, `newcomerAssumed`. They feed the Responsive, Content, Ending and In role variables of the one 1–10 grade per conversation. Optional in the saved score, so older scores still read and the grade leaves out what they can't measure.
- **Why:** the scorecard had no way to see how a conversation ends or whether the learner learned anything real: the Chuy conversation at the Plaza de los Mariachis (2026-11-10 17:40 UTC) closed over the learner's question about charro suits, then said goodbye eight more times, and scored 33.5-word replies, 0 problems.
- **Prompted by:** Josh, 2026-11-10: "Improve or create a scorecard that scores every conversation on several variables and one total score… 1-10… all variables are important but not equal."
- **Not run yet:** the card in `docs/prompt-trials.md` (Q1) tests these counts against Josh's own grades before this ships.

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
