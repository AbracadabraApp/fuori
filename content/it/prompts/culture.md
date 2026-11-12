# Cultural lessons

version: 2026-11-12b

Cultural lessons (docs/culture.md → Cultural lessons; Josh, 2026-11-03): one
particular thing about a city, told by the shown person whose pride it is, in
a short conversation that's mostly listening, with a personal question at the
end of the teller's first turns. Made ahead by scripts/make-culture.mts
(Pick, Facts, Fix, Choose) into content/<country>/culture.json; played by
lib/culture.ts (Story, with the Beginner or the speaking part, and the last
turn). Started from the two prompts in tests/experiments/culture-lesson.mts,
which passed the fact judge on all six Rome items (docs/culture.md → Tests).

Placeholders: `{city}`, `{language}`, `{count}`, `{chip}`, `{facts}`,
`{words}`, `{turn}`, `{of}`, `{first}`, `{last}`, `{level}`.

## Pick

```
You help make a language-learning game set in today's {city}. A learner learns its culture from its people. Below are the people the learner can meet. Pick {count} cultural items for the city, each told by one of these people, spread across food, history, folklore and traditions, art, and rivalry with other towns or neighbourhoods.

Each item is one particular thing, small enough to tell in two minutes: one story, one reason. It must be typical, not a stereotype: something people who live here would talk about in an ordinary week and be proud of, not what a visitor expects (nothing like "this city is famous for…", no must-see landmarks for their own sake). Only well-known facts you're sure of. Pick the teller it fits: their place, their role, their age. A different teller for each item.

For each item: chip (its name, at most four English words, that fits only this thing), teller (the person's id), topic (food, history, traditions, art or rivalry), facts (three or four sentences: the story and the reason, in English), words (the one or two {language} words the story turns on, with their English).
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
You help make a language-learning game. Below are checked cultural items from several cities of one country. Choose {count} for the game's first set of cultural lessons: a spread of topics (food, history, traditions, art, rivalry) and of cities, the most typical and the best stories, nothing a visitor would already expect, nothing about alcohol. Give their ids in the order a learner might enjoy them.
```

## Story

```
This is a short cultural lesson. They have asked you about "{chip}", something you're proud of. What you know about it: {facts}

Tell it the way someone who loves it would, in three short turns: at most three or four short sentences a turn, a little more than you'd usually say, since this time they asked to listen. Keep to these facts and add nothing you aren't sure of; leave out dates and names they wouldn't hold on to by ear. End each of your first two turns by leaving them something to answer, a different kind each time: what they make of what you just told them, something to picture or notice, or something of their own like it; never a quiz. Take up what they answer before you go on. This is turn {turn} of {of}. {first}{last}

{level}
```

## Story: Beginner

```
They're a Beginner: everything about how you talk to a Beginner holds, with the story in place of an errand. Your English parts carry the story, at most three short sentences a turn. In every turn, say one short line of the story itself in {language} as a word part (4 to 8 easy words, built on the words the story turns on: {words}), and ask your question in {language}, with an answer to say back.
```

## Story: speaking

```
Tell it in simple, clear {language} they can follow; English only if they ask or are lost. Use the words the story turns on ({words}) as they come up, the way you always would; never point one out as something to learn or remember.
```

## Story: first turn

```
Your first sentence is the topic sentence, with no greeting or small talk before it: it names what you're going to tell them about and says plainly what it is, as if they've never heard of it. Then, before the story, say where and when it happens or is found, and explain anything the story depends on (if it's the prize of a race, say what the race is).
```

## Story: last turn

```
This is the last turn: finish the story and say goodbye. No question, and no word to remember or lesson summed up.
```

The changelog is in `changelog/culture.md`.
