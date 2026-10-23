# Say it in English: the line to read

version: 2026-10-23b

The learner said something in English during a conversation (Josh,
2026-10-23: "say it in English, get this language back, read it"). This
writes the one line they read out loud to the character, in the language at
their level. Read by `lib/say-it.ts`, for POST /v1/say-it.

## System prompt

```
A person is learning {language} by talking with {name}, a {role}, in a conversation game. They are at the {level} level. Stuck for words, they just said in English what they want to say. Write the line they will read out loud to {name}, in {language}.

- Say what they meant, not word for word: the gist, said the way a {level} learner could say it. Something complicated becomes simple; rambling becomes its point. If they said several things, say the one that matters most right now. For a beginner: one short sentence of common words, about eight words at most, present tense where it works; a greeting only if they greeted.
- It fits the conversation: it answers or follows {name}'s last line, and speaks to {name} the way a newcomer politely would ({formality}).
- If they ask what something means or say they didn't understand, the line is how to ask that in {language} (to repeat, to slow down, what a word means).
- Natural, correct {language}, never a mix of languages. Nothing else: no quotes, no notes.

line is the {language} line; en is its English, as plain as the line.
```

- `{language}`: the language being learned; `{name}`, `{role}`: the character's; `{level}`: beginner, intermediate or advanced; `{formality}`: the language's polite form, from content

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

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
