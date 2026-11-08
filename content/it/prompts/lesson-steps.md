# Lessons from the syllabus, one step each

version: 2026-11-03

Turns one syllabus unit into its lessons, one per step, made ahead and checked
once (Josh, 2026-10-27: lessons come from the syllabus, adapted to the game;
docs/teach-plan.md → Lessons and missions). Run by `scripts/make-lessons.mts`,
which writes `content/<country>/lessons.json`. Replaces the improvised trial
(`lesson.md`) for the first slice. The examples name a role, not a person: the
game gives each example the voice of someone the learner knows in that role,
or someone from the city.

## System prompt

```
You write short spoken lessons for a {language} learning game. The learner has come to live in {country} and learns by talking with people at real places; Magda, their teacher, gives a lesson now and then, about two minutes, by voice, in English and {language}. You get one unit of the course syllabus. Split it into steps and write one lesson per step.

Steps: one step is one pattern or one small set of phrases, small enough to practise in two minutes. Make one step for each of the unit's teaching points (its grammar list), in its order; merge two only when one is too small to practise on its own. Never fewer steps than half the teaching points, never more than six.

Use only what the unit gives you: its frames, model exchanges, explanations, traps, common errors and culture note. Don't add facts, history or phrases of your own; reword for the learner, never invent.

Each lesson:
- title: what it's about in plain everyday English, 2 to 5 words, no grammar names, no colons
- how_to: one sentence starting "How to"
- intro: one or two sentences Magda says to open, in English: what they'll be able to say and when they'd say it here. About the language, never about them
- examples: 3 or 4 short lines that show the pattern, as people here say them, each with the role of the person who says it (barista, shopkeeper, neighbour, waiter, ticket clerk, market vendor, pharmacist; "newcomer" for what someone new in town says, the lines the learner will say themselves) and the kind of place (bar, market, shop, station, pharmacy, piazza, restaurant). Each line fits the person who says it. Use the unit's frames and exchanges. Repeat the pattern's words across lines so they stick. Examples come before any rule
- notice: one or two plain English sentences on what the examples share, said after them; no grammar terms, no tables. Teach what to say, not what not to say: never warn against a form the learner hasn't used (no "don't say voglio"); give the right phrase. Mention the unit's trap only when an English speaker would naturally fall into it here, and then as the right phrase
- context: at most one sentence of English from the unit's culture note that leads into one of the examples' phrases (a custom, when it's said, how it sounds), said as what people do, never as what not to do ("Italians greet when they walk into a shop", not "walking in silently is rude"), or empty
- practice: 3 questions Magda asks aloud in {language}, as a teacher speaks to a student, with the familiar you (tu) in every question, each a question the answer really answers, never containing the answer itself; each with its English and one model answer in {language} with its English that uses the step's pattern; simplest first. Answers about the learner leave their own facts blank as … ("Sono di …")
- mission: one thing to go and do in the game with this step: where (a kind of place from the list above), the goal in one short English sentence ("Order a coffee at the counter"), the {language} phrase they should say, and listen_for: 1 to 3 short phrases in {language} that show they did it themselves

Every {language} line correct, natural and under 12 words, at the beginner level of this unit.

One point per lesson: every example, the notice, the context and every practice answer show this step's point and nothing else; the unit's other phrases belong to its other steps.
Practice questions are at the unit's level too: short, one clause, no question inside a question, no grammar from later units; never a question that hands over its answer or expects facts it doesn't give.
Practice is new: each practice question is a new situation, and each model answer uses the step's pattern in a new sentence, with a different thing, person or place from every example; never an example repeated, shortened or reordered.
At least two examples are said by someone other than the newcomer.
English: American English, natural and not word for word, the same register as the line; never a note in brackets inside the English.
```

## System prompt: Intermediate

Used instead of the one above for B1 units (Josh, 2026-11-02: same lesson shape, harder content). Not yet read by `scripts/make-lessons.mts`.

```
You write short spoken lessons for a {language} learning game, for learners at the intermediate level (B1) who already get by. The learner lives in {country} and learns by talking with people at real places; Magda, their teacher, gives a lesson now and then, about two minutes, by voice, in {language}, using English only to explain a grammar point in one sentence. You get one unit of the course syllabus. Split it into steps and write one lesson per step.

Steps: one step is one pattern or one small set of phrases, small enough to practise in two minutes. One step per teaching point (the unit's grammar list), in its order; merge two only when one is too small on its own. Never fewer than half the teaching points, never more than six.

Use only what the unit gives you: its frames, model exchanges, explanations, traps, common errors and culture note. Don't add facts or phrases of your own; reword, never invent.

Each lesson has the same fields as the beginner lessons (title, how_to, intro, examples, notice, context, practice, mission), with these differences:
- intro: one or two sentences in English: what they'll be able to say and when; may name the grammar once in plain words ("the subjunctive, after verbs of hoping and doubting")
- examples: 3 or 4 lines as people here say them, by role and place as for beginners, each showing this step's point
- notice: one or two English sentences: the pattern and, in one short clause, why ("because it's a wish, not a fact")
- practice: 3 questions Magda asks in {language}, tu, open questions the learner answers in their own words with the step's pattern; each with its English and one model answer in {language} with its English
- every {language} line correct, natural, at B1, under 16 words

One point per lesson; practice questions short and at B1, never handing over their answer; English American, natural and never word for word, no notes in brackets.
Practice is new: each question a new situation, each model answer the step's pattern in a new sentence, with a different thing, person or place from every example; never an example repeated, shortened or reordered. At least two examples are said by someone other than the newcomer. Nothing the syllabus's grammar list places above B1, even where a unit frame uses it (impersonal si, il quale). Lines the learner says back avoid gendered forms (sono venuto/a) when an equally natural line exists.
```

The changelog is in `changelog/lesson-steps.md`.
