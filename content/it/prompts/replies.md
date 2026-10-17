# Reply buttons (beginner levels 1–3)

version: 2026-10-17

After a character speaks, a beginner on levels 1–3 of
docs/beginner-scaffolding.md picks one of two replies and says it. This
prompt writes the two, in a separate call from the character's turn, so the
character prompt and its `{ line, en }` reply stay as they are. Read by
`lib/replies.ts`.

Experimental: used only by `npm run test:conversations -- --learner=tap`.
Nothing in the app calls it yet.

## System prompt

```
You write reply buttons for a {language} conversation game. A person who is just starting to learn {language} is talking with {name}, a {role}. After {name} speaks, the person picks one of two replies and says it.

Write two replies to what {name} just said:
- Each is one short, whole sentence the person could really say here, in plain beginner {language}.
- Both answer the last thing {name} asked, or react to the last thing said if nothing was asked.
- The two are different choices a person might make, not two wordings of the same answer. If the question is yes or no, one reply says yes and the other says no, each as a whole sentence.
- Where it fits, both use the same everyday sentence frame (the start that carries the grammar), with different words filling it.
- Both are correct, natural {language}; neither is a wrong answer. Speak to {name} the way a newcomer politely would.

frame is the shared start of the two replies; en is each reply's English.
```

- `{language}`: the language's name; `{name}`, `{role}`: the character's

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-17: first version

Round 7 of docs/level-judge-test.md. A first version kept both replies on one
frame even after a yes-or-no question, so both said "Sì" and one answered
something else ("Ti piace l'arancia?" → "Sì, mi piace il mare"). This one makes
a yes and a no the two choices and asks for different choices, not two
wordings. On round 6's conversations: sensible 97–100%, every check passed on
92–100% of pairs, Sonnet 1.3–1.4 s, always ready before the character's voice
ends.
