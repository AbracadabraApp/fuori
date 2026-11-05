# Cultural lessons

version: 2026-11-05

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

Each item is one particular thing, small enough to tell in two minutes: one story, one reason. It must be typical, not a stereotype: something people who live here would talk about in an ordinary week and be proud of, not what a visitor expects (nothing like "this city is famous for…", no must-see landmarks for their own sake). Nothing about alcohol (wine, beer, spirits): the game is for all ages. Only well-known facts you're sure of. Pick the teller it fits: their place, their role, their age. A different teller for each item.

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
You help make a language-learning game. Below are checked cultural items from several cities of one country. Choose {count} for the game's first set of cultural lessons: a spread of topics (food, history, traditions, art, rivalry) and of cities, the most typical and the best stories, nothing a visitor would already expect, nothing about alcohol. Give their ids in the order a newcomer might enjoy them.
```

## Story

```
This is a short cultural lesson. The newcomer has asked you about "{chip}", something you're proud of. What you know about it: {facts}

Tell it the way someone who loves it would, in three short turns: at most three or four short sentences a turn, a little more than you'd usually say, since this time they asked to listen. Keep to these facts and add nothing you aren't sure of; leave out dates and names they wouldn't hold on to by ear. End each of your first two turns with a personal question about their own experience, like "Have you ever…?", never a quiz; react briefly to what they answer before you go on. This is turn {turn} of {of}. {last}

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

## Story: last turn

```
This is the last turn: finish the story and say goodbye. No question, and no word to remember or lesson summed up.
```

## Changelog

### 2026-11-04: first version

Josh, 2026-11-03: "handle all the data and code work" for culture. From the other session's tested prompts (tests/experiments/culture-lesson.mts; Rome: six items, all passed the fact judge, tipico; two played as lessons), made language-neutral (the language and the city come from the content), with a Fix and a Choose step for the bounded pass the doc decided (write, judge once, fix the failures, recheck once, drop what still fails), and two changes from the review of that trial: each turn is capped at three or four short sentences (the trial's Intermediate turns ran to about 90 words, a lot to follow by ear) and the teller keeps to the checked facts. Beginners hear the story in the Beginner format's English parts, with the words as word parts.

### 2026-11-04b: no "word worth keeping"

Josh, 2026-11-03: he hates the idea of "keeping" or owning words, "so weird and just not the tone of the game. Are you supposed to own Rome or Claudio too?" (it came up with flashcards too), and "this keep thing is not my creation". In the trial the last-turn line made tellers say it out loud ("Ti lascio una parola da ricordare", "that is the word worth keeping"). The words are now just the ones the story turns on, used the way the teller always would; the last turn ends the story without a takeaway. The learning is following the story in the language and answering.

### 2026-11-04c: recasts, more of the language for Beginners, no alcohol

Josh asked whether the lessons had the right shape and spirit, then "fix all the what's wrong". Every item in both sets, played through the real code (24 lessons), showed:
- **Intermediate mistakes went by without a recast** ("Sono molto interessante", "io voglio vedere lo", "ho la fretta"). The speaking part now says to use the right form as they react, the way a friend would, without pointing it out (CLAUDE.md: characters correct real errors by recasting in character).
- **Beginner lessons were about 80% English.** The Story brief opened with "the rules above about the conversation don't apply in it", which also switched off the Beginner rules (English at most two short sentences a turn, phrases in the language). That line is gone; the turn may be a little longer since they asked to listen. The Beginner part says the Beginner rules hold, the English carries the story in at most three short sentences, and every turn has one line of the story in the language as a word part.
- **The ombra item was about wine**, with the teller offering "la tua prima ombra"; wine bars are hidden as not appropriate for all ages (Josh, 2026-10-27). Pick and Choose now leave out alcohol; the ombra, ricciarelli-with-vin-santo and mezcal items were dropped from culture.json.
- **Dates and names a listener can't hold** (1325, the Madonna di Provenzano): the teller now leaves them out.

### 2026-11-05: corrections in dialogue.md

Josh's family's play, 2026-11-04 and 05: Magda coached Jennifer's "¿Owen me ayuda?" (a misheard "Joven, ¿me ayuda?") into "HO-ven", and met "Estoy en el barco de canzart" with "Almost! The word you want is cansado". Josh: fixes "are global improvements not local to lessons or conversations or one country"; "its ok not to get corrected all the time". Corrections and mishearings now have one rule for every conversation (dialogue.md, added to every system prompt), and the app tells the character whether an offered answer was said back (lib/dialogue/heard.ts); this file no longer has its own. Removed: the speaking part's recast line (dialogue.md has the same rule, for every conversation).
