# learn.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../learn.md`.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

### 2026-10-20: first version
Josh's Learn idea (2026-10-20): a page over the conversation, from that conversation, corrections first, then vocabulary, then a little grammar and a culture note, no full conjugation tables. Starts from memory.md's learning notes, since they already pick out mistakes, words worth learning and what wasn't understood (Josh: "Magda may already have that").

### 2026-10-20b: shorter; nouns and verbs in tables with the whole line
Josh, after reading the first page on a real conversation (Rosa, Firenze): too long; separate nouns and verbs; a noun table of about 5 like the verb table he liked; instead of a column with the bare form, the character's whole sentence with a play button; and lines a learner can follow ("mi indichi pure quello che cerca, anche col dito" is too sophisticated). Corrections capped at 3, the life note at one or two lines.

### 2026-10-20c: speaking only on corrections
Josh: "your turn" only for corrections: "You said …, the right phrase is …, repeat it (mic)". The separate Your turn section is gone.

### 2026-10-20d: every mistake is a correction
Josh, on the page for Rosa: the learner's tu with a vendor (dimmi, scusa) was explained in the grammar section; "if I said it wrong, correct me", it belongs in Corrections with the mic. Corrections now take every kind of mistake, form of address included (3 or 4); the section on how the language works covers only what came up without being their mistake.

### 2026-10-20e: shorter again
Josh: "still pretty long". No introduction, 3 corrections with a one-line why, no notes under the tables, how the language works in two sentences and one line, life here in one line.

### 2026-10-20f: within reach, the natural phrase, correct models only
From the teacher's assessment of the Rosa page (Josh, 2026-10-20): "grazie per avermi aiutato" was B1 for an A1 learner, "è possibile spiegare…?" was the learner's sentence patched rather than what an Italian says ("cosa vuol dire…?"), and Rosa's own "cosa le servono" (for "cosa le serve") was used as a model. Now: pitch one step beyond the learner's own lines; the right phrase is the simplest natural one, a simple fixed phrase when the full form is beyond them; only correct lines as examples. Also "Italian" in the table columns is {language}, and the form-of-address example no longer names tu and Lei, so the prompt carries to another language.

### 2026-10-20g: about 100 to 200 words
Josh: the right length is probably 100 to 200 words, "not as a rule, but how much can a learner digest". The page was about 370 words. Now guidance toward 100 to 200, keeping only the most useful when there's more; the noun and verb tables are "up to 5", not "about 5".

### 2026-10-20h: not formulaic
Josh: "every page doesn't have to do everything it can. One might just correct mistakes. Another might just do nouns, or verbs... the review shouldn't be formulaic." The fixed five-section order is now a set of kinds, each with its format; the page chooses what the conversation most calls for, often one thing, sometimes two. Corrections still come first when they're there.

### 2026-10-20i: small slips stay small
Josh, on the Franco page: a full correction (you said, the right phrase, why, mic) for "questo" instead of "questa" is "a lot for something off by a letter". The full treatment is now for mistakes that matter (changed the meaning, or will recur); a small slip gets one light line without why or mic, or nothing if it happened once.

### 2026-10-20j: show the part that changes
Josh: "a small correction in a long sentence is hard to pick up the point". Corrections now show only the part that changes when the fix is local (the whole sentence only when the whole phrase is the lesson), with the change in bold, and the mic repeats that short part.

### 2026-10-21: the simplified page, as JSON
Josh and the cloud session walked through the Learn sheet on the canvas (board 3 "Simplified", docs/learn.md → The page, 2026-10-21): replaying text, not the mic. The page is now three parts the app lays out from JSON: corrections as { said, why, right } (tap to fix: you said, then why, then the right phrase in the character's voice), words as things { word, en, plural } and doing { infinitive, en, form }, about 6 to 8 with no example sentences or audio, and goodToKnow, always one cultural or practical point. Dropped: Repeat it and the mic, "How the language works", the character-line play marks, the introduction and the 100-200 word guide (the layout now sets the length). Kept from 20f-20j: one step beyond their level, the simplest natural phrase, only the part that changes, small slips left out. The word field is "word", not "it" as the handoff said, the way memory.md renamed its "it" to "phrase" so the fields don't name a language.

### 2026-10-22: Mexico
Josh: "is learn ready for mexico? it is great in italy". It wasn't: Afuera had no learn.md, so /v1/learn answered "Learn isn't ready for this country yet". This is Italy's 2026-10-21 prompt unchanged (it names no language), so Mexico starts from the version Josh likes.

### 2026-10-27: no correcting what's right, or what speech-to-text garbled (and the why names the mistake)
Josh's Learn page for Salvatore (Napoli, 2026-10-27) corrected "non parlo bene italiano", which is fine Italian (the page made up a rule about word order and added "molto"), and "corrected" lines speech-to-text had garbled ("questo non è la stessa punta", "non ha giusto ragione per comprare": Josh had just told Salvatore the system changed his sentence). Now: never correct what's already correct and natural; keep their meaning; a stretch that makes no sense as the language was most likely misheard, so leave it out. On that conversation, 3 runs before: "non parlo bene" corrected 3/3, the garbled lines 3/3 and 2/3. After the first change: the garbled lines 0/3 and 2/3, but "non parlo bene italiano" still 3/3, with invented reasons ("people usually put bene after the language") and once "molto" again; so the why must name exactly what was wrong, or there's no correction.

### 2026-10-29: a Spanish example
The example of showing only the part that changes was Italian; now Spanish. No change of rule; the examples were the other country's (whole-app scan, 2026-10-29).
