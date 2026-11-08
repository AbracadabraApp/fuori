# say-it.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../say-it.md`.

### 2026-11-05: only what they said

Josh, 2026-11-05, Florence: Lorenzo asked "è la prima volta in Italia?"; Josh's Italian came back from Whisper as English ("The city is a little bit like London…") and the line to read began "Sì, è la prima volta", which he hadn't said ("corrected to say something I didn't want to say"). The cause was the line "It fits the conversation: it answers or follows {name}'s last line". Now the line is only what they said, never an answer to her question. Also from today: the line is for Beginners only (app/v1/say-it; Josh: "corrections bubbles are beginner only").

### 2026-10-29: an Italian example

The example of speech-to-text turning a learner's language into English-looking words was Spanish ("Perrin Ivar" for "para llevar"); now Italian ("Pair for ray" for "per favore"). No change of rule; the examples were the other country's (whole-app scan, 2026-10-29).
### 2026-10-27: judge only their last line, not the conversation's English
Josh's Beginner conversations on 2026-10-27: his Italian, which Whisper called English and translated, was rewritten into a line to read instead of going to the character: at Pizzeria Da Gigi ("Pagokonlacar, tajarazzi" became "Pago con la carta, grazie") and at the Pignasecca ("Mi piace i limoni ma non ha un ragione adesso per usa. Scusa, mi non parla italiano bene" became "Mi piacciono i limoni, ma non parlo bene italiano", dropping what he meant about not buying; then his reading and his complaint went to Salvatore as one turn). With Italian-only context the same lines went to the character 30/30; with the real Beginner conversation, where the character speaks English too, 1/8 and 0/8. Now: judge only their last line; the character's English, or English the learner spoke earlier, doesn't make this line English. Then a second rule for the pizza case, whose language version was run together ("Pagokonlacar") while the English ("I'm going to go to the next one") was clear but unrelated: words run together or misspelled are an attempt if you can tell what they meant, and English that doesn't fit the conversation was speech-to-text guessing.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-23e: Whisper's English can be a translation

Josh played Andrea (Italy, 2026-10-23): his Italian came back from Whisper
as English translations, "I would like to eat a Nutella cone" and "I'm going
to go to the corner" (he said cono), so say it gave him lines close to what
he'd said, and one that made no sense (Vado all'angolo). When Whisper calls a
turn English, /v1/transcribe now also hears it as the learned language, and
this call gets both: a real attempt in the language goes to the character.

### 2026-10-23d: a line only for clear English

Josh played Valeria (Mexico, 2026-10-23): two of his Spanish attempts came
back as lines to reread, "Perrin Ivar, Grat-grat-grat-sius" (para llevar,
gracias) and "Gracias. Arrivederci." (an Italian slip). Josh: "it's a bit
confusing to reread - the character should have intercepted". Now a line is
written only when they clearly spoke English sentences; attempts at the
language however garbled, mistakes, a stray word of English or another
language, another language altogether, and unclear sounds all go to the
character as said.

### 2026-10-23c: Italian labelled English goes to the character

Josh played Mohamed (Roma, 2026-10-23) with the debug panel: his own Italian
came back labelled English in 4 of 5 turns ("Si, ho domandato un tavolo tre
volte e tu non pensi niente", "Allora, non mi responde"), so each became a
correction to read instead of reaching the character. The words were heard
right; only Whisper's language label was wrong. Now the first thing this call
decides is whether there's a line to write: if the text is already in the
language (mistakes, misheard words or a stray English word included), or too
short or unclear to tell (the trial had "Okay." become "Sì, un tavolo per uno,
grazie" and a misheard "C." become "Una canción, por favor"), sendAsSaid and
the app sends it to the character as said. Only clear, mostly-English turns
get a line. When in doubt, the character.

### 2026-10-23b: one short line for beginners

Trial round 1 (tests/experiments/say-it.mts, 35 lines per country): all
checks 80% Italy / 69% Mexico, never wrong or mixed language, 1.5 s. A
two-part request ("the same as yesterday but smaller, and is the place on
the corner open on Sundays?") came back as two long sentences, too much for
a beginner to read aloud. Now: the one thing that matters most, one short
sentence, about eight words, no greeting unless they greeted.

### 2026-10-23: first version

Josh, 2026-10-23: inside the game, scaffolding becomes one loop: say it in
English, get the line back in the language, read it out loud
(docs/beginner-scaffolding.md → Say it in English). The line is the gist at
the learner's level, not a translation (Josh: someone who says something C1
gets beginner Italian; babble gets the point). Trial:
tests/experiments/say-it.mts (docs/prompt-trials.md).
