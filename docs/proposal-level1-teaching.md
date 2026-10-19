# Proposal: At Level 1, Characters Teach Their Lines

2026-10-19 · Josh · **Proposed, for feedback.** Nothing here is built or decided.

## The problem

At level 1 the screen carries a lot of text: the character's Italian line, its English, and two reply buttons in Italian and English. Josh, testing: the English is distracting, and there's too much to read. Once English is on screen, the eye goes to it and the ear stops working.

## The proposal

At level 1 only, the character teaches the line the learner has to answer, out loud, in her own voice. Something like:

> Giulia: "Cosa prendi? *What would you like?* Puoi dire: vorrei un caffè."

In one turn she gives three things: the Italian question, what it means, and the frame to answer with. They're said aloud by a person instead of shown as captions.

This changes one rule. Today a character uses English only when the learner asks (CLAUDE.md: "English nobody asked for is the thing to avoid"). At level 1 she would offer it without being asked, on the key line only. It still fits "everyone teaches, always in role": a real barista with a newcomer who has no Italian does exactly this.

## Sample dialogue

Mission: order an orange juice at the bar. Giulia, Trastevere. Italics are the English she says aloud.

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

**Level 2: she teaches only when the learner asks**

> **Giulia:** Ciao! Cosa ti preparo?
>
> Buttons: **Vorrei una spremuta** / **Un caffè, per favore** / **Cosa vuol dire?**
>
> *Learner taps "Cosa vuol dire?"*
>
> **Giulia:** Ah! *What can I make you?* Un caffè, una spremuta…
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
- **It fades by level.**
  - Level 1: she teaches the key line every turn.
  - Level 2: only when the learner hesitates or asks.
  - Level 3 and up: back to today's rule, English only when asked.
- **Less on screen.** With the English spoken, the English subtitle line can go at level 1. The Italian subtitle stays (an option, as everywhere). English moves onto the reply buttons ("Vorrei un caffè · I'd like a coffee") or onto a tap of the subtitle.
- **It fits missions.** The mission card previews the frame ("Vorrei ___"). Hearing her say it just before you need it is the "meet it" step, with no extra staging.

## Where it would live

A new variant in `content/it/prompts/levels.md`, not a change to `character.md`, so production is untouched until it's chosen. Possible wording, to trial:

```
They are just starting to learn {language} and understand almost none yet. When you ask them something, help them answer the way a kind {role} helps a newcomer: say your question, then what it means in English, then one short way they could answer in {language}. Only for the thing you've just asked; the rest stays in {language}. You're still yourself with them: your humour, your opinions, your place.
```

The reply stays `{ line, en }`. The English inside `line` is spoken by the {language} voice, so check how ElevenLabs handles mixed lines (accent, pacing) before judging the idea on the phone.

## How to test it

- `npm run test:replay --level=<this block>` against the current Beginner block, on the usual 25 replayed conversations.
- Watch for:
  - Does she teach only the key line, or slide into English throughout?
  - Line length: teaching adds words. Is it still short?
  - Does she stay in character, or start sounding like a teacher?
  - Does the frame she offers match the mission's frame?
  - Do the reply buttons still make sense next to her suggestion?
- Then listen on the phone for how the mixed-language voice sounds.
- Add a row to `docs/prompt-trials.md` with the result, kept or dropped.

## Questions for feedback

1. Is it all right for a character to offer English unasked, at level 1 only?
2. Should the English subtitle line go at level 1 once she speaks the English?
3. Level 2: teach on hesitation, or not at all?
4. Does a spoken English phrase in an Italian voice sound right, or would the English need a second voice (more staging)?
5. Does this overlap with Magda's role (explicit teaching), or is it clearly "a person helping a newcomer"?
