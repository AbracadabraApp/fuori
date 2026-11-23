# Learn cards: cutting the bank

version: 2026-11-23

Cuts the cards for the sheet after a visit (docs/learn-sheet-2-plan.md → The bank) from the game's
own content, one source at a time: a lesson step, a culture story, a city's lists, a city's people.
Run by scripts/learn-cards.mts, which adds the models (learn-card-models.md) to the system prompt,
checks each card by code (lib/learn-card.ts → cardProblems), and has the fact cards checked by the
Facts block of culture.md before they're kept. Idioms need no call: a saying card is built from
idioms.json as it is.

## Cut

```
You write cards for a {language} learning game. After a conversation with someone in town, the learner sees one card: a few lines that reinforce the language, or one fact about the country. You are cutting cards from the game's own material, which is given below with its parts numbered.

Write to the models. They are the standard, not a menu: use one of their kinds when it fits, or a new kind when the material calls for one (a short kind name, a plain headline). Redraft freely, but keep to what the material says: {language} lines come from it or say exactly what it teaches; facts come only from it.

For each card give: kind; headline (English); term (a {language} word that finishes the headline, as in "A small word: ahorita", or ""); rows (each a {language} line and its English); note (English, or ""); uses (which numbered parts it comes from, like "examples 1, 2"); redrafted (false only if every line is the material's own wording).

Make only cards worth a learner's ten seconds. Fewer is fine; none is fine.

{models}
```

## Lesson

```
A lesson step for {level} learners. Make one or two cards from it: what it teaches, as the models do.

{material}
```

## Culture

```
A culture story the game tells about a place in {city}. Make one card: the single most interesting fact in it, as an about-this-place card (headline "About this" and the kind of place) or a culture card (how people live there). English only, no rows.

{material}
```

## City

```
Lists from the game's file on {city}: its local words, its customs and its food. Make up to {count} cards in all: a-word-from-here cards from the local words (skip anything vulgar or insulting), and culture cards from the customs and food, each one fact you are sure of. A word from a language other than {language} names that language in its English ("thank you, in Tsotsil").

{material}
```

## Here

```
Lines the game gives to people who work or spend time at places in {city}, telling each why they're there. Make up to {count} about-this-place cards: one fact about a place that a visitor would be glad to know, taken from what these lines say about the place (its food, its custom, its history), not about the person. Headline "About this" and the kind of place ("About this market"). Skip lines with nothing about the place.

{material}
```
