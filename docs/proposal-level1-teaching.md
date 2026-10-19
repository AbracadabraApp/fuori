# Proposal: At Level 1, Characters Teach Their Lines

2026-10-19 · Josh · **Proposed.** Revised the same day after the laptop session's review (its feedback and answers are folded in below). Nothing built or run yet.

## The problem

At level 1 the screen carries a lot of text: the character's Italian line, its English, and two reply buttons in Italian and English. Josh, testing: the English is distracting, and there's too much to read. Once English is on screen, the eye goes to it and the ear stops working.

## The proposal

At level 1 only, the character teaches the line the learner has to answer, out loud, in her own voice. Something like:

> Giulia: "Cosa prendi? *What would you like?* Puoi dire: vorrei un caffè."

In one turn she gives three things: the Italian question, what it means, and the frame to answer with. They're said aloud by a person instead of shown as captions.

This changes one rule. Today a character uses English only when the learner asks (CLAUDE.md: "English nobody asked for is the thing to avoid"). At level 1 she would offer it without being asked, on the key line only. It still fits "everyone teaches, always in role": a real barista with a newcomer who has no Italian does exactly this.

## Sample dialogue

Mission: order an orange juice at the bar. Giulia, Trastevere. Italics are the English she says aloud. The reply she suggests is always one of the two buttons.

**Level 1: she teaches the key line every turn**

> **Giulia:** Buongiorno! Cosa prendi? *What would you like?* Puoi dire: vorrei un caffè.
>
> Buttons: **Vorrei una spremuta, per favore** · I'd like an orange juice, please / **Vorrei un caffè, per favore** · I'd like a coffee, please
>
> *Learner taps the spremuta; the app says it aloud.*
>
> **Giulia:** Una spremuta, perfetto! Grande o piccola? *Big or small?* Dici: piccola, grazie.
>
> Buttons: **Piccola, grazie** · Small, thanks / **Grande, grazie** · Big, thanks
>
> *Learner taps "Piccola, grazie."*
>
> **Giulia:** Ecco qua. Tre euro. *Three euros.*
>
> *Done appears.*

**Level 2: no teaching**

Her line is Italian only, as now; level 2 already shows English on the character's line, so she doesn't need to teach.

> **Giulia:** Ciao! Cosa ti preparo?
>
> Buttons: **Vorrei una spremuta** / **Un caffè, per favore**
>
> *Learner taps "Vorrei una spremuta."*
>
> **Giulia:** Bravo. Con zucchero?

**Level 3 and up: today's rule, English only when asked**

> **Giulia:** Buongiorno! Cosa prendi?
>
> **Learner:** Vorrei una spremuta.
>
> **Giulia:** Subito. Con o senza zucchero?

**What to avoid at level 1: teaching everything**

> **Giulia:** Buongiorno! *Good morning!* Benvenuto al bar. *Welcome to the bar.* Oggi fa caldo, eh? *It's hot today, huh?* Cosa prendi? *What would you like?* In Italian, "prendere" means "to take", but at the bar it means "to have"…

That's a lesson, not a barista. Only the question the learner has to answer gets the English and a way to reply.

## How it would work

- **Only the key line.** She teaches the question you have to answer, not everything she says. The scene shouldn't turn into a lesson.
- **She stays herself.** She teaches the way she would, warm and a little teasing, not like a textbook. No "repeat after me."
- **Her suggestion is a button.** The reply she says aloud must be one of the two reply buttons, word for word, so the learner hears the line they can tap. The replies call (`lib/replies.ts`) already reads her last line; it should take her suggestion as one of the two. The test checks that they match.
- **The fade is simple.** Level 1: she teaches the key line every turn. Level 2 and up: she doesn't (no "teach on hesitation": with no timer, by Josh's rule, a character can't tell that you're hesitating). Level 3 and up keeps today's rule, English when you ask.
- **Less on screen.** With the English spoken, the English subtitle line goes at level 1, or it would appear twice. The Italian subtitle stays (an option, as everywhere).
- **English stays on the buttons.** Level 1 keeps English on the reply buttons, as in the levels table.
- **No new controls.** No tap-to-translate, replay, dictionary or other new chrome on the conversation screen (Josh, 2026-10-19). Help comes from the character, by voice; the screen doesn't grow.
- **It fits missions.** The mission card previews the frame ("Vorrei ___"). Hearing her say it just before you need it is the "meet it" step, with no extra staging.

## Where it would live

A new variant in both `content/es-mx/prompts/levels.md` and `content/it/prompts/levels.md`, not a change to `character.md`, so production is untouched until it's chosen. Possible wording, to trial:

```
They are just starting to learn {language} and understand almost none yet. When you ask them something, help them answer the way a kind {role} helps a newcomer: say your question, then what it means in English, then one short way they could answer in {language}. Only for the thing you've just asked; the rest stays in {language}. You're still yourself with them: your humour, your opinions, your place.
```

The reply stays `{ line, en }`. The English inside `line` is spoken by the {language} voice.

## How to test it

1. **Listen first, on the laptop.** The mixed-language voice is the biggest unknown and doesn't need the phone. Generate 5–10 mixed lines through `/v1/speak` with the current voices and listen for accent and pacing. Costs pennies. If it sounds wrong, decide on a second voice before anything else.
2. **Replay Mexico first.** Josh is a real beginner in Spanish and intermediate in Italian, and the level trial already runs on his Mexico learner. `COUNTRY=es-mx npm run test:replay -- --level=<this block>` (note the `--` so npm passes the flag through), against the current Beginner block on the usual 25 conversations. Then Italy.
3. **Run the "help in English" probe** from the core-behaviours test (round 18) on the new block, to check she teaches only the key line and doesn't slide into English throughout.
4. **Measure honestly.** The level judge counts English words as known, so mixed lines would score as easier without being easier. Judge only the Italian part of each line, and report words per line separately: teaching adds about 8–10.
5. **Watch for:**
   - Does she teach only the key line?
   - Does she stay in character, or start sounding like a teacher?
   - Is her suggestion one of the two buttons, word for word?
   - Does the frame she offers match the mission's frame?
6. Add a row to `docs/prompt-trials.md` with the result, kept or dropped.

## Questions, with the laptop session's answers

| Question | Answer (laptop review, 2026-10-19) | Josh |
|---|---|---|
| 1. Is unasked English all right at level 1? | Yes, at level 1 only. Choosing level 1 is effectively asking for it, and a real person does exactly this with a newcomer. | |
| 2. Drop the English subtitle line at level 1? | Yes, if she speaks the English; otherwise the English appears twice. | |
| 3. Level 2: teach on hesitation? | No. A character can't tell you're hesitating (no timer), and level 2 already shows English. Level 1 teaches, level 2 doesn't. | |
| 4. A second voice for the English? | Decide after the listening test (test step 1). A second voice is staging. | |
| 5. Overlap with Magda? | No. This is a person helping a newcomer in the moment. Magda runs lessons with a goal and a recap. | |
