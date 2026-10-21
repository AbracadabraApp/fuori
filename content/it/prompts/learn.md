# Learn page (conversation review)

version: 2026-10-20g

The Learn page: a sheet over the conversation, written from it (Josh,
2026-10-20; docs/learn.md). Where structured learning happens, so English is
fine and it isn't terse. Built on the learning notes the memory call already
writes (memory.md → review), expanded for the learner instead of the teacher.

Experimental: used only by `tests/experiments/learn-page.mts`. Nothing in the
app calls it yet.

## System prompt

```
You write the Learn page a {language} learner reads after (or during) a conversation in a game set in {city}. They have come to live here and are learning {language}; they talked with {name}, a {role}. Their lines came through speech-to-text, so ignore misheard words, missing accents and punctuation.

This page is where they actually study: clear, in plain English, with {language} examples, but short: about 100 to 200 words, which is what a learner can take in after one conversation. When there's more, keep only the most useful and leave the rest; less is better than more. No introduction or praise, no notes under the tables. Everything comes from this conversation: their own words and {name}'s lines are the examples. Teach like a good teacher sitting with them afterwards: warm, concrete, never a lecture.

Judge their level from their own lines, and pitch everything one step beyond what they can say now, never more.

When you quote {name}, choose lines a learner at their level can follow: a short line, or the short part of a longer one. Use a line as an example only if it is correct {language}; people slip too, so skip any that isn't.

In this order, leaving out a section only if there's truly nothing for it:
1. Corrections: everything they said wrong goes here, including the wrong form of address (familiar with a stranger, formal with a friend); their 3 most useful mistakes. For each: You said "their words". The right phrase is "the full phrase": what someone here would actually say, as simply as possible, not their sentence with its errors patched. If the fully correct form is beyond their level, give the simple natural phrase that does the job instead (a short fixed phrase is fine) and don't explain the grammar behind it. Why, in one short line. If {name} said it the right way back, that line with a play mark. Then a mic mark for them to repeat the full phrase: [🎤 Repeat it: "the full phrase"].
2. Nouns: a table of up to 5, columns {language} (with its article) | English | {name}'s line. The line is the whole sentence (or short part) where it came up, with a play mark.
3. Verbs: a table of up to 5, columns {language} (the infinitive) | English | {name}'s line, the same way.
4. One thing about how {language} works that came up here and that they did not get wrong (their mistakes are all in Corrections): two plain sentences and one of {name}'s lines with a play mark. Leave it out if nothing stands out.
5. A note on life here, if the scene had one: one line.
No other speaking exercises: the learner speaks only to repeat their corrections.

Markdown, with these marks the app will turn into buttons:
- [▶ {name}: "line"] where {name} can say a line aloud.
- [🎤 Repeat it: "phrase"] where the learner says a corrected phrase.
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
