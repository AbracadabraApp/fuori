# Cultural lessons

version: 2026-11-04

Cultural lessons (docs/culture.md → Cultural lessons; Josh, 2026-11-03): one
particular thing about a city, told by the shown person whose pride it is, in
a short conversation that's mostly listening, with a personal question at the
end of the teller's first turns. Made ahead by scripts/make-culture.mts
(Pick, Facts, Fix, Choose) into content/<country>/culture.json; played by
lib/culture.ts (Story, with the Beginner or the speaking part, and the last
turn). Started from the two prompts in tests/experiments/culture-lesson.mts,
which passed the fact judge on all six Rome items (docs/culture.md → Tests).

Placeholders: `{city}`, `{language}`, `{count}`, `{chip}`, `{facts}`,
`{words}`, `{turn}`, `{of}`, `{last}`, `{level}`.

## Pick

```
You help make a language-learning game set in today's {city}. A newcomer who has come to live there learns its culture from its people. Below are the people the newcomer can meet. Pick {count} cultural items for the city, each told by one of these people, spread across food, history, folklore and traditions, art, and rivalry with other towns or neighbourhoods.

Each item is one particular thing, small enough to tell in two minutes: one story, one reason. It must be typical, not a stereotype: something people who live here would talk about in an ordinary week and be proud of, not what a visitor expects (nothing like "this city is famous for…", no must-see landmarks for their own sake). Only well-known facts you're sure of. Pick the teller it fits: their place, their role, their age. A different teller for each item.

For each item: chip (its name, at most four English words, that fits only this thing), teller (the person's id), topic (food, history, traditions, art or rivalry), facts (three or four sentences: the story and the reason, in English), words (one or two {language} words worth keeping, with their English).
```

## Facts

```
You check facts for a language-learning game. For each item, list every factual claim in it and mark each one confirmed only if it is well known and you are certain of it; anything doubtful, disputed or that you can't confirm is not confirmed. An item passes only if every claim is confirmed. Legends count as confirmed when they are told as legends. For each item give: chip, pass, and doubts (the claims not confirmed, word for word).
```

## Fix

```
These cultural items failed a fact check. For each, rewrite only the facts so every doubtful claim is removed or stated as tradition or legend, keeping the story and the reason; change nothing else. If an item can't stand without the doubtful claim, return its facts unchanged (it will be dropped).
```

## Choose

```
You help make a language-learning game. Below are checked cultural items from several cities of one country. Choose {count} for the game's first set of cultural lessons: a spread of topics (food, history, traditions, art, rivalry) and of cities, the most typical and the best stories, nothing a visitor would already expect. Give their ids in the order a newcomer might enjoy them.
```

## Story

```
This is a short cultural lesson, and the rules above about the conversation don't apply in it. The newcomer has asked you about "{chip}", something you're proud of. What you know about it: {facts}

Tell it the way someone who loves it would, in three short turns: at most three or four short sentences a turn. Keep to these facts; add nothing you aren't sure of. End each of your first two turns with a personal question about their own experience, like "Have you ever…?", never a quiz; react briefly to what they answer before you go on. This is turn {turn} of {of}. {last}

{level}
```

## Story: Beginner

```
They're a Beginner: the story goes in your English parts, short and simple; the words worth keeping ({words}) are your {language} word parts, offered as answers to say back when they fit.
```

## Story: speaking

```
Tell it in simple, clear {language} they can follow; English only if they ask or are lost. Bring in the words worth keeping ({words}) as they come up.
```

## Story: last turn

```
This is the last turn: finish the story with the word worth keeping and say goodbye. No question.
```

## Changelog

### 2026-11-04: first version

Josh, 2026-11-03: "handle all the data and code work" for culture. From the other session's tested prompts (tests/experiments/culture-lesson.mts; Rome: six items, all passed the fact judge, tipico; two played as lessons), made language-neutral (the language and the city come from the content), with a Fix and a Choose step for the bounded pass the doc decided (write, judge once, fix the failures, recheck once, drop what still fails), and two changes from the review of that trial: each turn is capped at three or four short sentences (the trial's Intermediate turns ran to about 90 words, a lot to follow by ear) and the teller keeps to the checked facts. Beginners hear the story in the Beginner format's English parts, with the words as word parts.
