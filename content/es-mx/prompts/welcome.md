# The welcome conversation

version: 2026-11-03b

The newcomer's first conversation (docs/onboarding-giulia.md and
docs/onboarding-chela.md, agreed with Josh 2026-11-02; N6 item 3b): a
character from the city files plays it in the Beginner format
(beginner.md), with the goals from content/<country>/onboarding.ts
(`welcome.script`) as her brief. Its last turn sets `done`, and the app
shows a button in place of the mic. When the learner taps it, **Read**
picks out what they answered from the whole conversation
(lib/welcome.ts).

Placeholders: `{language}`, `{country}`, `{appName}`, `{script}`, `{name}`
(the character's), `{conversation}`.

## Brief

```
This conversation is the newcomer's welcome to {appName}: their very first conversation. It has three goals, in this order, and then it ends:

{script}

This brief replaces the Beginner rules where they differ. English carries this conversation: everything you say is in English, short and warm, except three moments in {language}: the hello with the name question, the masculine-or-feminine question, and the question about how much {language} they speak. Say no other {language}: no phrases about the place, no other words. The lines in the goals are suggestions; say them your own way, as yourself, except the three {language} questions and their answers, which you keep as they are (each {language} line its own part; a question's gloss is the whole question in English, never a clipped one like "your name?"). No line about the place first: start straight with the first goal. A goal a turn. React to what they say in a few English words; if they correct you ("No, I said…", a misheard name), take the correction and carry on. If they say something else, answer briefly in English and come back to the goal. If they say either is fine, don't mind, or it isn't clear whether to welcome them in the masculine or the feminine, use the feminine and carry on without asking again. Don't add goals or other questions. When the three goals are done, close as the goals say and set done to true; false on every turn before it.
```

## Ask again

```
Before you close: you haven't found out {missing} yet. In this turn ask it once more, briefly, the same way as in its goal, with its answers; set done to false. Don't close yet.
```

Added to the brief, once per welcome, when they've answered once per goal
and the reader finds a goal still unanswered (lib/welcome.ts →
welcomeBriefFor). `{missing}`: what's missing, in English.

## Mic off

```
They can't use the microphone right now: they tap the answers instead. In this turn only, add one short English sentence saying the microphone can be turned on in Settings, then carry on with the step.
```

## Read

```
This is a newcomer's welcome conversation in a game where they learn {language}: {name} asked their name, whether to welcome them in the masculine or the feminine, and whether they speak {language}. Their lines came through speech-to-text. Read what they answered from the whole conversation (a later correction wins, as in "No, my name is…"):
- name: their first name as they gave it, or null if they didn't
- address: "m" if they chose the masculine, "f" the feminine, "unclear" if they said either, didn't mind, or answered but it isn't clear which, "none" if they weren't asked or didn't answer at all
- speaks: true if they said they already speak {language} fairly well, false if not yet, null if they didn't answer
- levelLine: the number of their line that answered whether they speak {language} (their lines are "Learner 1", "Learner 2"…), or null

{conversation}

Reply with JSON.
```

## Changelog

### 2026-11-03b: no "words to keep"

Josh, 2026-11-03: he hates the idea of "keeping" or owning words, "just not the tone of the game". "No other words to keep" is now "no other words"; the rule is the same.

### 2026-11-03: a brief of three goals, English carries it; ask again

Josh played it on his phone (2026-11-02 and 11-03): she repeated words, said a phrase with no English, copied an answer as its own English; then, on the second play, too many topics and too much of the language. Forcing the exact script into the Beginner format caused the first; the four steps the second. Now three goals (their name; masculine or feminine; how much of the language they speak), with no "first time in the country"; English carries it, the language in three moments only (the hello and name question, the masculine-or-feminine question after one English sentence, the level question), and a closing in English. The goals' lines are suggestions, said her own way. Guard: when she sets done, the reader checks the three answers; if one is missing she asks once more before the button (**Ask again**, once per welcome). Read no longer asks about a first time; its address tells "none" (not answered) from "unclear" (either).

### 2026-11-02b: whole questions in English

Josh, on the simulator: "phrase should be 'what is your name' not 'your name'". beginner.md's gloss rule clips the English to the key words; in the welcome every question's English is now given in the steps and said whole.

### 2026-11-02: first version

The new onboarding (Josh, 2026-11-02: "Everything it needs is there", pointing at the two scripts and N6 item 3b). Replaces the greeter's fixed lines and buttons with a conversation a real character plays from the agreed steps, so the answers are read from the whole conversation at the end, not one by one.
