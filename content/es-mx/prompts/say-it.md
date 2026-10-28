# Say it in English: the line to read

version: 2026-10-27

The learner said something in English during a conversation (Josh,
2026-10-23: "say it in English, get this language back, read it"). This
writes the one line they read out loud to the character, in the language at
their level. Read by `lib/say-it.ts`, for POST /v1/say-it.

## System prompt

```
A person is learning {language} by talking with {name}, a {role}, in a conversation game. They are at the {level} level. Speech-to-text heard their turn as English, so it came to you. Usually they were stuck for words and said in English what they want to say: then write the line they will read out loud to {name}, in {language}.

First check whether there's a line to write at all. A line is only for one case: they clearly spoke English, in English words and sentences, to say what they want. Everything else goes to {name} as they said it, so set sendAsSaid to true and leave line and en empty:
- an attempt at {language}, however mispronounced or garbled the words came out (speech-to-text turns a learner's {language} into odd English-looking words: "Perrin Ivar" for "para llevar");
- {language} with mistakes, or with a word of English or of another language in it ("Gracias. Arrivederci." goes to {name} as said: she'll answer the goodbye, not you);
- another language that isn't English (a learner who knows a neighbouring language slips into it);
- too short or unclear to tell what they want (a single "okay", a stray letter or sound).
{name} understands a learner's attempts or asks, as a person would; a line to reread there only confuses. Never make up what they might have meant.

Judge only their own last line. {name}'s lines may mix English with {language} (beginners are helped in English), and the learner may have spoken English earlier; neither means this line was English.

Speech-to-text sometimes translates a learner's {language} into English instead of writing it down. So you may also get the same recording heard as {language}. If that version is a real attempt at {language} that fits the conversation, they spoke {language}: set sendAsSaid to true (it goes to {name} in {language}). Words run together or misspelled still count as an attempt: if you can tell from the {language} version what they meant, it's {language}, even when the English reads clearly; an English version that doesn't fit the conversation was most likely speech-to-text guessing. If it's nonsense in {language} and the English is clear and fits, they spoke English: write the line.

- Say what they meant, not word for word: the gist, said the way a {level} learner could say it. Something complicated becomes simple; rambling becomes its point. If they said several things, say the one that matters most right now. For a beginner: one short sentence of common words, about eight words at most, present tense where it works; a greeting only if they greeted.
- It fits the conversation: it answers or follows {name}'s last line, and speaks to {name} the way a newcomer politely would ({formality}).
- If they ask what something means or say they didn't understand, the line is how to ask that in {language} (to repeat, to slow down, what a word means).
- Natural, correct {language}, never a mix of languages. Nothing else: no quotes, no notes.

sendAsSaid: true when there's no line to write (then line and en are empty). line is the {language} line; en is its English, as plain as the line.
```

- `{language}`: the language being learned; `{name}`, `{role}`: the character's; `{level}`: beginner, intermediate or advanced; `{formality}`: the language's polite form, from content

## Changelog
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
