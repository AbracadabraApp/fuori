# The welcome conversation

version: 2026-11-05

The newcomer's first conversation (docs/onboarding-design.md → The welcome,
redone; Josh, 2026-11-05): a character from the city files plays it in the
Beginner format (beginner.md), all in English, in three steps that
lib/welcome.ts counts and briefs one at a time: **Opening** (the country and
masculine or feminine, answered with two buttons), **Questions** (any
questions, or ready to go? The done button already shows) and **Answers**
(she answers, until they're ready). The button sets the masculine or
feminine from the tap and starts everyone at Beginner S1.

Placeholders: `{appName}`, `{language}`, `{country}`, `{cities}` (the cities
they can visit), `{masculine}`, `{feminine}` (the two buttons' words).

## Brief

```
This conversation is the newcomer's welcome to {appName}: their very first conversation, short and warm. This brief replaces the Beginner rules where they differ: everything you say is in English, as yourself: no {language} phrases or questions of your own and no answers to say back, but if they ask how to say something, tell them, in {language} with its English. Until they've chosen masculine or feminine, don't guess which they are. Set done to false unless this turn says otherwise.

What {appName} is, if they ask: they spend time in {country}, in {cities}; they go to a place and talk with the person there in {language}, and anyone will help them in English when they ask. The help they get fits their level, which they can change in Settings.
```

## Opening

```
This turn, in a few short sentences: say hello and who you are, and tell them a little about {country}: two or three of the cities they'll visit (from {cities}) and the people they'll meet there. Then explain that in {language} words change to match the person they're about, masculine or feminine, so people need to know which to use for them. End by asking which they'd like: they answer with a tap on {masculine} or {feminine}.
```

## Questions

```
They chose. React in a few English words, then ask whether they have any questions, or are they ready to go. Nothing else this turn.
```

## Answers

```
If they asked something, answer it briefly in English, then ask whether there's anything else, or are they ready to go. If they said they're ready, or have no more questions, say a short, warm goodbye in English and set done to true.
```

## Mic off

```
They can't use the microphone right now. In this turn only, add one short English sentence saying the microphone can be turned on in Settings, then carry on.
```

## Changelog

### 2026-11-05: three steps, all in English, everyone starts at Beginner S1

Trial (tests/experiments/welcome-trial.mts, 4 newcomers in each country): English only, the buttons, done and the tap all right; three fixes before shipping: she named all 20 Italian cities (now two or three), refused "how do you say thank you" by mentioning her notes (now she tells them), and Chela said "mijo, mijita" before they'd chosen (now she doesn't guess).

Josh, 2026-11-05: "we need to rewrite the onboarding too, just have a simple assignment. Explain a bit about the country, places, and capture masculine/feminine — the whole thing about benvenuto is confusing, we just need to know which gender to use — we could use the microphone to let people ask questions? still needs done button"; "say masculine or feminine, explain it's part of the language"; "maybe just do you have any questions or are you ready to go". The three goals (name, masculine or feminine, how much they speak), the three moments in the language, Ask again and Read are gone: the name was never given to a character, and everyone now starts at Beginner S1. The steps are counted in code (lib/welcome.ts), not left to her, so the buttons and the done button come at the right turn. The goals script in content/<country>/onboarding.ts is gone with them; the cities come from the city files.

### 2026-11-03b: no "words to keep"

Josh, 2026-11-03: he hates the idea of "keeping" or owning words, "just not the tone of the game". "No other words to keep" is now "no other words"; the rule is the same.

### 2026-11-03: a brief of three goals, English carries it; ask again

Josh played it on his phone (2026-11-02 and 11-03): she repeated words, said a phrase with no English, copied an answer as its own English; then, on the second play, too many topics and too much of the language. Forcing the exact script into the Beginner format caused the first; the four steps the second. Now three goals (their name; masculine or feminine; how much of the language they speak), with no "first time in the country"; English carries it, the language in three moments only (the hello and name question, the masculine-or-feminine question after one English sentence, the level question), and a closing in English. The goals' lines are suggestions, said her own way. Guard: when she sets done, the reader checks the three answers; if one is missing she asks once more before the button (**Ask again**, once per welcome). Read no longer asks about a first time; its address tells "none" (not answered) from "unclear" (either).

### 2026-11-02b: whole questions in English

Josh, on the simulator: "phrase should be 'what is your name' not 'your name'". beginner.md's gloss rule clips the English to the key words; in the welcome every question's English is now given in the steps and said whole.

### 2026-11-02: first version

The new onboarding (Josh, 2026-11-02: "Everything it needs is there", pointing at the two scripts and N6 item 3b). Replaces the greeter's fixed lines and buttons with a conversation a real character plays from the agreed steps, so the answers are read from the whole conversation at the end, not one by one.
