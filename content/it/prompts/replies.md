# Reply buttons (scaffolding)

version: 2026-10-22

After a character speaks, a learner in scaffolding
(docs/beginner-scaffolding.md, lib/scaffold.ts) picks one of two replies. This
prompt writes the two, in a separate call from the character's turn, so the
character prompt and its `{ line, en }` reply stay as they are. Read by
`lib/replies.ts`.

Used by POST /v1/replies: the System prompt for the tap and read stages,
the Choose prompt for the choose stage.

## System prompt

```
You write reply buttons for a {language} conversation game. A person who is just starting to learn {language} is talking with {name}, a {role}. After {name} speaks, the person picks one of two replies and says it.

Write two replies to what {name} just said:
- Each is one short, whole sentence the person could really say here, in plain beginner {language}.
- Both answer the last thing {name} asked, or react to the last thing said if nothing was asked.
- The two are different choices a person might make, not two wordings of the same answer. If the question is yes or no, one reply says yes and the other says no, each as a whole sentence. A no is a polite one that keeps the conversation going, the way a guest says no to a host.
- Where it fits, both use the same everyday sentence frame (the start that carries the grammar), with different words filling it.
- Both are correct, natural {language}; neither is a wrong answer. Speak to {name} the way a newcomer politely would.

frame is the shared start of the two replies; en is each reply's English.
```

- `{language}`: the language's name; `{name}`, `{role}`: the character's

## Choose prompt

```
You write reply buttons for a {language} conversation game. A person who is just starting to learn {language} is talking with {name}, a {role}. After {name} speaks, the person sees two replies, chooses the one that fits, and says it. To choose well, they have to understand what {name} just said.

Write two replies:
- fits: one short, whole sentence the person could really say here, in plain beginner {language}. It answers the last thing {name} asked, or reacts to the last thing said if nothing was asked. Speak to {name} the way a newcomer politely would.
- misfit: one short, whole sentence of the same length and level that could not be a reply here: it answers a different question than the one {name} asked (asked where you're from, it says what you'd like; asked what you'd like, it says where you're from). Don't make it a different choice to the same question, like another thing to buy: that could still fit. It is correct, natural {language}, an ordinary sentence a person says every day in another moment; never broken {language}, never rude, never silly.
- Both start the same way (the same greeting, if any, and the same politeness), and neither repeats a word from {name}'s line that the other lacks, so the choice rests on understanding {name}, not on matching words.

en is each reply's English.
```

For the third stage (choose, lib/scaffold.ts): only one of the two replies
fits, so the person has to understand the character to pick.

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-22: the Choose prompt

Josh, 2026-10-22: the stages go tap, read aloud, choose, in each of a new
learner's first three conversations. The third needs a pair where only one
reply fits; the wrong one is correct language that doesn't fit the moment,
never broken language, so the screen never models a mistake
(docs/beginner-scaffolding.md → stages B and C). The System prompt is
unchanged. Trial (tests/experiments/reply-choice.mts, 84 pairs per country):
a first version passed all checks on 70% (Italy) / 75% (Mexico), its wrong
reply often another fair choice (coffee at a market) or given away by a
different greeting; this one, the wrong reply answering a different
question, passes 92% / 85%, at about 5 s instead of 2.

### 2026-10-17b: a polite no

Round 7: the "no" reply could sour the moment ("No, no me gusta Oaxaca" to a
proud local, "No, non voglio un caffè" to a host). Now a no keeps the
conversation going: "No mucho todavía, pero me gusta la plaza.", "No, no me
gusta el queso, pero quiero probar el mole." Other checks unchanged (all
good 91–92%, sensible 100%, 1.4–1.5 s).

### 2026-10-17: first version

Round 7 of docs/level-judge-test.md. A first version kept both replies on one
frame even after a yes-or-no question, so both said "Sì" and one answered
something else ("Ti piace l'arancia?" → "Sì, mi piace il mare"). This one makes
a yes and a no the two choices and asks for different choices, not two
wordings. On round 6's conversations: sensible 97–100%, every check passed on
92–100% of pairs, Sonnet 1.3–1.4 s, always ready before the character's voice
ends.
