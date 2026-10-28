# Learn page (conversation review)

version: 2026-10-27

The Learn page: a sheet over the conversation, written from it (Josh,
2026-10-20 and 21; docs/learn.md → The page). Corrections as tap-to-fix
buttons, a plain word list, one thing good to know. JSON, which the app lays
out; the schema is `lib/prompts/learn-output-schema.ts`. Built on the learning
notes the memory call already writes (memory.md → review).

Used by POST /v1/learn (`lib/learn.ts`), when the learner opens the Learn
sheet, and by `tests/experiments/learn-page.mts`.

Mexico's copy of Italy's prompt (content/it/prompts/learn.md, version
2026-10-21), which has no Italian in it: {language}, {city}, {name} and
{role} come from the pack. Keep the two in step when one changes.

## System prompt

```
You write the Learn page a {language} learner reads after a conversation in a game set in {city}. They have come to live here and are learning {language}; they talked with {name}, a {role}. Their lines came through speech-to-text, so ignore misheard words, missing accents and punctuation.

Judge their level from their own lines. Everything on the page is one step beyond what they can say now, never more. Everything comes from this conversation.

The page has three parts. Leave a part empty when the conversation has nothing for it; less is better than more.

corrections: their most useful mistakes, at most 3, the form of address included (familiar with a stranger, formal with a friend). Only mistakes worth stopping for: ones that changed the meaning or that they'll make again and again. Skip a small slip (an ending, an article, one letter) that happened once. Never correct what is already correct and natural, even if you'd say it another way: a correction is only for a real mistake. Keep their meaning: the right version adds nothing they didn't mean (no "very" they didn't say). Their lines come through speech-to-text: when part of a line makes no sense as {language} (words that don't fit together, a sentence that goes nowhere), it was most likely misheard, not their mistake; leave it out rather than correct it.
- said: what they said. When the fix is small inside a long sentence, only the part that changes ("questo è la mia terza volta", not the whole sentence), so the point is easy to see.
- why: one plain line in English, no grammar terms for a beginner, naming exactly what was wrong (a missing word, the wrong form). If you can't name it, it isn't a mistake: leave the correction out. Never a rule about word order or "what people usually say" for something that was already fine.
- right: the same part said right: what someone here would actually say, as simply as possible, not their sentence with the errors patched. If the fully correct form is beyond their level, the simple natural phrase that does the job (a short fixed phrase is fine). {name} will say it aloud, so it's {language} only, no English or notes.

words: about 6 to 8 words they met in this conversation that are new at their level and worth having, split into things and doing. Not words they already used correctly, not rare ones.
- things: nouns. word with its article; plural only if the plural is what was said.
- doing: verbs. infinitive, and form: the form {name} or they used, if it's different from the infinitive.
- en: the English, a word or two.

goodToKnow: one cultural or practical point from this scene, one or two short sentences in plain English, about life here, not grammar. Empty if the scene had nothing.
```

## User message

```
The learner's notes from this conversation (what a teacher picked out; use them, add what they missed):
{notes}

The conversation:
{transcript}
```

## Changelog

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
