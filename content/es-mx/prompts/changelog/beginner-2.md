# beginner-2.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../beginner-2.md`.

### 2026-11-09d: English on every turn
- **Changed:** the level line adds "Every turn has some English: the English for your key words, or a short line in English." The code also makes sure (lib/beginner-2.ts → withEnglish), and cluster 1 keeps only the two rungs with English under the answers.
- **Why:** Josh played Hugo (Puebla, Beginner 2, cluster 1): "almost no character dialogue in english"; four of seven turns had none after the opener, no phrase was glossed, and the Spanish-only answer came up on his second turn ("I didn't know what I was saying. There was no English on either side"). "Explain in English when it helps" let her decide it wasn't needed. English on every turn defines Beginner (Josh, 2026-11-09).
- **Prompted by:** Josh, 2026-11-09, playing on the phone.

### 2026-11-09c: the answer inside her line, set up by the code
- **Added:** a "Line: answer inside" block ("You could answer me with:"). For the reply ladder's rungs 4 and 6 she gives one answer as usual, and the code (lib/beginner-2.ts → insideSpeech) turns it into her speech: this line, then the answer in the language, with its English heard on rung 4.
- **Why:** card B2-S: asking her to put the answer inside her line worked 3 of 15 times; a look with the same wording as a prompt line (2026-11-09) dropped the English on rung 4 and once left the line empty. Structure in code holds where prompt rules don't.
- **Prompted by:** Josh, 2026-11-09: "why not implement the plan". Not tested as a card; Josh plays it.

### 2026-11-09b: the first turn says where you are; "short" made simple; setup lines in the file; in the game behind a switch
- **Changed:** the level line now says "When you first see them, say in English, the way a local would, something about where you are", and "Keep what you say … short" became "Keep your {language} simple". The reply setup lines (two answers, one answer, no answers, invite English) moved into this file as Setup blocks, read by lib/beginner-2.ts.
- **Why:** card B2-P (docs/prompt-trials.md): at half the words this prompt tied today's on role slips, questions and broken turns, but its openers dropped the scene (Luisa 5 of 5 "Buongiorno! Cosa le preparo?", where today's set Testaccio 10 of 10) and its turns had 36% fewer words in the language. B2-S: "gloss, no answers" is the same turn as "no answers" (Josh agreed to fold it), "inside what you say" didn't work (left out until a new line).
- **Prompted by:** Josh, 2026-11-09: fix the opener, put Beginner 2 behind the hidden Version panel, and he plays it against Beginner 1 ("this is too complicated"; no more test cards for now). Not tested as a card; Josh's play is the test.

### 2026-11-09a: first version
- **What:** Beginner 2's prompt (docs/beginner-2.md → The prompt), as the Italian one: who you are, take turns, the Beginner level line, the answer rules, the parts format.
