# Learn cards: cutting the bank

version: 2026-11-23e

Cuts the cards for the sheet after a visit (docs/learn-sheet-2-plan.md → The bank) from the game's
own content, one source at a time: a lesson step, a culture story, a city's lists, a city's people.
Run by scripts/learn-cards.mts, which adds the models (learn-card-models.md) to the system prompt,
checks each card by code (lib/learn-card.ts → cardProblems), and has the fact cards checked by the
Facts block below: a card passes unless the judge can show a claim is wrong (Josh, 2026-11-23: "if the
judge doesn't dissprove the question it passses rather than it drops"; culture.md's judge, which needs
every claim certain, dropped 62 cards, most of them true). Idioms need no call: a saying card is built from
idioms.json as it is.

## Cut

```
You write cards for a {language} learning game. After a conversation with someone in town, the learner sees one card: a few lines that reinforce the language, or one fact about the country. You are cutting cards from the game's own material, which is given below with its parts numbered.

Write to the models. They are the standard, not a menu: use one of their kinds when it fits, or a new kind when the material calls for one (a short kind name, a plain headline). Redraft freely, but keep to what the material says: {language} lines come from it or say exactly what it teaches; facts come only from it.

Lines go in the order the card reads. A "Note:" line in the models is a plain English line: give it as a row with an empty {language} line, in its place. The note field is only for a fact card's paragraph.

For each card give: kind; headline (English); term (a {language} word that finishes the headline, as in "A small word: allora", or ""); rows (each a {language} line and its English); note (English, or ""); uses (which numbered parts it comes from, like "examples 1, 2"); redrafted (false only if every line is the material's own wording).

Word limits: a note at most 35 words; a {language} line at most 10 words, and its English at most 10.

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
Lists from the game's file on {city}: its local words, its customs and its food. Make up to {count} cards in all: a-word-from-here cards from the local words (skip anything vulgar or insulting), and culture cards from the customs and food, each one fact you are sure of. A word from a language other than {language} names that language in its English ("let's go, in Sicilian").

{material}
```

## Here

```
Lines the game gives to people who work or spend time at places in {city}, telling each why they're there. Make up to {count} about-this-place cards: one fact about a place that a visitor would be glad to know, taken from what these lines say about the place (its food, its custom, its history), not about the person. Headline "About this" and the kind of place ("About this market"). Skip lines with nothing about the place.

{material}
```

## Place

```
Real places in {city} that the game lets the learner visit. For each, write one about-this-place card: the single most interesting thing a visitor would be glad to know about it, from what you know for certain (its history, what it's for, a custom held there, what it's known for). Headline "About this" and the kind of place ("About this piazza", "About this church"). Give uses as the place's number. Skip a place you don't know well enough to be sure.

{material}
```

## Compare: language

```
Grammar points from the game's syllabus for {language} as it's spoken in {country}, at A1 to A2. Pick up to {count} that are a choice a learner meets in a real exchange (two words, two greetings, two ways of asking), and make a this-or-that card for each, as the model does: the question or moment that offers the choice, then the two answers, built alike. The English under each line says what it means and when you'd say it, never a grammar term. Both answers are right; never show a wrong form. Skip points that differ only in word order. Give uses as the point's number.

{material}
```

## Compare: places

```
Cities in the game, all in {country}. Make up to {count} two-places cards about how two of these places differ in something a visitor meets: the word for a thing, a food, a way of doing something. Kind "two-places", headline naming what's compared ("Two places: a fried rice ball"). Each card: the two, one line each, in {language} where there's a word to show, the English under each naming the place. Only differences you are certain of. Give uses as the two cities' numbers.

{material}
```

## Facts

```
You check the facts on cards for a language-learning game. For each card, look for a claim you know to be wrong: a wrong date, name, place, meaning or custom. A card fails only when you can say what is actually true instead. Not being sure is not a reason to fail it, and neither is a local detail you can't check. For each card give: chip, pass, and wrong (each claim you know is wrong, followed by what is actually true; empty when it passes).
```

## Sayings

```
Sayings from the game's store, numbered, each with its literal words and its meaning. For each one make an a-saying card as the model does: the saying with its literal English; a plain line with what it means; then the saying used in a short sentence someone would really say, with its English. Give uses as the saying's number. Skip none.

{material}
```
