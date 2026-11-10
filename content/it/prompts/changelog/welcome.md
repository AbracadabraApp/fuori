# welcome.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../welcome.md`.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

### 2026-11-05: three steps, all in English, everyone starts at Beginner S1

Trial (tests/experiments/archive/welcome-trial.mts, 4 newcomers in each country): English only, the buttons, done and the tap all right; three fixes before shipping: she named all 20 Italian cities (now two or three), refused "how do you say thank you" by mentioning her notes (now she tells them), and Chela said "mijo, mijita" before they'd chosen (now she doesn't guess).

Josh, 2026-11-05: "we need to rewrite the onboarding too, just have a simple assignment. Explain a bit about the country, places, and capture masculine/feminine — the whole thing about benvenuto is confusing, we just need to know which gender to use — we could use the microphone to let people ask questions? still needs done button"; "say masculine or feminine, explain it's part of the language"; "maybe just do you have any questions or are you ready to go". The three goals (name, masculine or feminine, how much they speak), the three moments in the language, Ask again and Read are gone: the name was never given to a character, and everyone now starts at Beginner S1. The steps are counted in code (lib/welcome.ts), not left to her, so the buttons and the done button come at the right turn. The goals script in content/<country>/onboarding.ts is gone with them; the cities come from the city files.

### 2026-11-03b: no "words to keep"

Josh, 2026-11-03: he hates the idea of "keeping" or owning words, "just not the tone of the game". "No other words to keep" is now "no other words"; the rule is the same.

### 2026-11-03: a brief of three goals, English carries it; ask again

Josh played it on his phone (2026-11-02 and 11-03): she repeated words, said a phrase with no English, copied an answer as its own English; then, on the second play, too many topics and too much of the language. Forcing the exact script into the Beginner format caused the first; the four steps the second. Now three goals (their name; masculine or feminine; how much of the language they speak), with no "first time in the country"; English carries it, the language in three moments only (the hello and name question, the masculine-or-feminine question after one English sentence, the level question), and a closing in English. The goals' lines are suggestions, said her own way. Guard: when she sets done, the reader checks the three answers; if one is missing she asks once more before the button (**Ask again**, once per welcome). Read no longer asks about a first time; its address tells "none" (not answered) from "unclear" (either).

### 2026-11-02b: whole questions in English

Josh, on the simulator: "phrase should be 'what is your name' not 'your name'". beginner.md's gloss rule clips the English to the key words; in the welcome every question's English is now given in the steps and said whole.

### 2026-11-02: first version

The new onboarding (Josh, 2026-11-02: "Everything it needs is there", pointing at the two scripts and N6 item 3b). Replaces the greeter's fixed lines and buttons with a conversation a real character plays from the agreed steps, so the answers are read from the whole conversation at the end, not one by one.
