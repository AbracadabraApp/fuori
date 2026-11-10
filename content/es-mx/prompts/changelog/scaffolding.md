# scaffolding.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../scaffolding.md` (called beginner-2.md until 2026-11-10b).

### 2026-11-10e (code, no prompt change): questions with their English in Level 1
- lib/beginner-2.ts → questionEcho: in clusters 1–2 every question in the language has its English right next to it, spoken: an English piece after it, unless an English question comes just before it (Josh, 2026-11-09: "questions should be spanish then english - near same is fine"; "it could go english-spanish or spanish english"; "it's hard to answer a spanish question with no english"). Added as a spoken English piece, not a gloss, because with answers shown a question's gloss isn't spoken (the 2026-11-05 coffee fix, mirrored by the app).

### 2026-11-10e: Level 1 is English with echoes in the language
- **Changed:** "Level: 1" (clusters 1–2) is now English-led: the character speaks English and puts the language right after the English that says it (the words worth keeping, a short phrase, the question), an echo, so the learner always knows what it means. Replaces S1's text, including its "your English never says what your {language} then says".
- **Why:** Josh played Doña Chayo (Puebla, cluster 1, 2026-11-09): every turn was an English block, then a block in the language that said something else, no glosses ("English intro - all Spanish… had to look to answers for context… this is not bilingual helper"); "English with Spanish gloss might be a better beginner approach than all Spanish a little English". That's the ramp from the plan (English leads → the language leads → English only sets the scene). The rule against saying the same thing in both languages was written for "cafe, coffee, cafe", which Josh says was the voice reading something meant only for the screen; the code fixed that on 2026-11-05, so the rule only kept the two languages apart.
- **Added:** "Line: invite English" ("You can answer me in English."), added by the code on an invited-English turn (lib/beginner-2.ts → invited), with the question's English: twice live the character asked a plain yes/no question instead.

### 2026-11-10d: two questions to ask, as a reply setup
- **Added:** "Setup: two questions to ask": two short questions the learner could ask the character, shown as answer bubbles with their English.
- **Why:** Josh, 2026-11-09: "I'm not fine with a cluster 1 surrender". Play feedback had left cluster 1 one reply type (two answers), the same shape every turn. Cluster 1 now mixes two answers, two questions to ask the character and an invited English answer, the three where the learner always knows what they're saying.
- **Also:** the two setup lines say this turn is different from the usual question ("don't ask them anything"; "instead of a yes-or-no or this-or-that question"): with Level 1 being S1 word for word ("ask only yes-or-no or this-or-that questions"), a first look had the questions to ask half right and the invitation to answer in English not happening; after the change, 3 of 3 each (Hugo, Mexico).

### 2026-11-10c: Level 1 is Beginner 1's S1 word for word
- **Changed:** "Level: 1" (clusters 1–2) is now Beginner 1's S1 blocks unedited: leveling.md "Talk: stage 1" (with its "yes-or-no or this-or-that questions") and beginner.md "English: brief", "Language: what to keep" and "Language: phrases". The 2026-11-10a edits to them (question rule cut, examples cut, merged) are undone.
- **Why:** Josh, 2026-11-09: "Beginner 1 has English and glossing working near perfect for S1". The this-or-that question is where the glossing works (the options glossed in the question, the answers mirroring them: "Do you like blue (piace blu) or yellow (piace giallo)?" → "Mi piace blu / Mi piace giallo"); cutting it, and the edits, made S1 worse. The code's whole-phrase glossing (glossAll, Claude's idea) is removed with it.

### 2026-11-10b: split from the dialogue; renamed scaffolding.md
- **Changed:** beginner-2.md became scaffolding.md and lost its dialogue blocks ("Who: you", "Talk: turns"): the dialogue is now the Intermediate prompt itself (character.md with dialogue.md, the here line and the memory notes), built by the same code as Intermediate's, minus its one-line reply format. This file keeps who the learner is at this level, the answer rules, the parts format, the Level blocks and the Setup blocks. The learner line no longer repeats character.md's "living in {country}" or the formality.
- **Why:** Josh, 2026-11-09: "I want to be able to adjust scaffolding without touching the dialogue"; agreed that separate files don't mean separate effects, so scaffolding changes are still played ("this seems like a benefit not a caveat").

### 2026-11-10a: the levels taken from Beginner 1's stages; the added English lines removed
- **Removed:** the three English lines added on 2026-11-09 ("explain in English when it helps…", "when you first see them, say in English… where you are", "every turn has some English"). Rules about how much English, added one per play, were the bloat that grew beginner.md.
- **Added:** "Level: 1–3" blocks, one passed in by the code per cluster with the setup (lib/beginner-2.ts): copied from what works in Beginner 1 and edited down: Level 1 = leveling.md "Talk: stage 1" + beginner.md "English: brief" and "Language: phrases" (S1's English, which worked); Level 2 = "Talk: stage 2" + "Language: 2"; Level 3 = "Talk: stage 3". Edits: the question-kind rules cut ("only yes-or-no or this-or-that": 46 of the real turns ended in either/or), examples in parentheses cut, answer counts left to the code's setups. The learner line now carries beginner.md's "If they ask for help in English, help as you would anyway".
- **Why:** Josh, 2026-11-09: separate rules/scaffolding, levels and dialogue; don't bloat the prompt; "start with Beginner 1 for the others - edit it hard for changes but don't reinvent what works. S1 English in Beg 1 worked well. S2 is working well with corrections, recasting, letting close slide, listening to my english and replying, help." Recasting and letting misheard lines slide come from the shared dialogue.md, which Beginner 2 already reads.

### 2026-11-09d: English on every turn
- **Changed:** the level line adds "Every turn has some English: the English for your key words, or a short line in English." The code also makes sure (lib/beginner-2.ts → withEnglish), and cluster 1 keeps only the two rungs with English under the answers.
- **Why:** Josh played Hugo (Puebla, Beginner 2, cluster 1): "almost no character dialogue in english"; four of seven turns had none after the opener, no phrase was glossed, and the Spanish-only answer came up on his second turn ("I didn't know what I was saying. There was no English on either side"). "Explain in English when it helps" let the character decide it wasn't needed. English on every turn defines Beginner (Josh, 2026-11-09).
- **Prompted by:** Josh, 2026-11-09, playing on the phone.

### 2026-11-09c: the answer inside the character's line, set up by the code
- **Added:** a "Line: answer inside" block ("You could answer me with:"). For the reply ladder's rungs 4 and 6 the character gives one answer as usual, and the code (lib/beginner-2.ts → insideSpeech) turns it into the character's speech: this line, then the answer in the language, with its English heard on rung 4.
- **Why:** card B2-S: asking the character to put the answer inside their line worked 3 of 15 times; a look with the same wording as a prompt line (2026-11-09) dropped the English on rung 4 and once left the line empty. Structure in code holds where prompt rules don't.
- **Prompted by:** Josh, 2026-11-09: "why not implement the plan". Not tested as a card; Josh plays it.

### 2026-11-09b: the first turn says where you are; "short" made simple; setup lines in the file; in the game behind a switch
- **Changed:** the level line now says "When you first see them, say in English, the way a local would, something about where you are", and "Keep what you say … short" became "Keep your {language} simple". The reply setup lines (two answers, one answer, no answers, invite English) moved into this file as Setup blocks, read by lib/beginner-2.ts.
- **Why:** card B2-P (docs/prompt-trials.md): at half the words this prompt tied today's on role slips, questions and broken turns, but its openers dropped the scene (Luisa 5 of 5 "Buongiorno! Cosa le preparo?", where today's set Testaccio 10 of 10) and its turns had 36% fewer words in the language. B2-S: "gloss, no answers" is the same turn as "no answers" (Josh agreed to fold it), "inside what you say" didn't work (left out until a new line).
- **Prompted by:** Josh, 2026-11-09: fix the opener, put Beginner 2 behind the hidden Version panel, and he plays it against Beginner 1 ("this is too complicated"; no more test cards for now). Not tested as a card; Josh's play is the test.

### 2026-11-09a: first version
- **What:** Beginner 2's prompt (docs/beginner-2.md → The prompt), as the Italian one: who you are, take turns, the Beginner level line, the answer rules, the parts format.
