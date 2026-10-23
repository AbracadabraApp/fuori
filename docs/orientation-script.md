# Orientation: a script to replace onboarding (draft)

2026-10-22 · Josh asked for it · **Draft for Josh to edit; nothing decided or built.** Replaces today's onboarding ([onboarding-design.md](onboarding-design.md)) with a set-up-to-play tour led by the greeter, in mixed English and Italian. Italy shown; Mexico follows the same beats with its own lines.

**What changes from today's onboarding:**
- **Mixed language, on purpose.** She speaks short Italian, and explains how the game works in English (spoken, with the subtitles). Today's rule ("she always speaks the learned language; English only as subtitles") gives way here, because this is set-up, not immersion. Characters in the game stay Italian.
- **You learn by doing.** The reply bubbles, the mic and "say it in English" are tried with her once, so the first real conversation isn't the first time.
- **It still sets you up:** your name, how you're addressed, and a first guess at your level.
- **About two to three minutes. Skippable at every step, replayable from Settings → How Fuori works.**

Each beat: what's on screen · what she says (Italian, then English) · what the learner does · what it sets.

---

## 1 · Hello

**Screen:** her portrait, large. The panel at the bottom.

**She:** *Ciao! Benvenuto a Fuori… anzi, aspetta.* (Hi! Welcome to Fuori… wait.)
**She (English):** "I'm going to show you how this works. It takes two minutes. First, what's your name?"

**Learner:** taps the mic and says their name (or **Skip the tour** under the panel).
**Sets:** the name.

## 2 · How should I say welcome?

**She:** *Piacere, {name}!* (Nice to meet you, {name}!)
**She (English):** "In Italian, words change with who you are. Should I say *benvenuta* or *benvenuto* to you?"

**Learner:** taps **Benvenuta!** or **Benvenuto!**
**She:** *Benvenuta, {name}!* / *Benvenuto, {name}!*
**Sets:** how every character addresses them.

## 3 · How talking works

**She (English):** "In Fuori you talk to people. I'll say something in Italian. When it's your turn, the button goes green: tap it, talk, tap it again when you're done."
**She:** *Allora, {name}: come stai?* (So, {name}: how are you?)

**Screen:** her line in the bubble on the left. Two answers in speech bubbles on the right, with English under them:
- *Bene, grazie!* · Fine, thanks!
- *Così così.* · So-so.

**Panel:** "Read one out loud: tap the green mic, say it, tap again."
**Learner:** reads one aloud.
**She:** *Bene!* / *Mi dispiace… un caffè aiuta sempre!* (Good! / Sorry… a coffee always helps!)
**Sets:** that the mic works (the iOS permission prompt comes with this first tap).

## 4 · Say it your way

**She (English):** "You won't always want my answers. You can say what you mean in English, and I'll give it back to you in Italian to say."
**She:** *Perché sei in Italia?* (Why are you in Italy?)

**Panel:** "Say your answer in English. Then read the Italian out loud."
**Learner:** says it in English (for example, "I'm staying for a few months to learn Italian"). An Italian bubble comes back with the English: *Resto qualche mese per imparare l'italiano.* They read it aloud.
**She** reacts to what they said, in Italian, with the English under it.
**Sets:** what brings them here (for the characters' memory), and their first level signal.

## 5 · Your level

**She (English):** "One more, and this time try it in Italian if you can. If not, English is fine."
**She:** *E cosa ti piace dell'Italia?* (And what do you like about Italy?)

**Learner:** answers however they like.
**Sets:** a first guess at their level, from answers 4 and 5 (the level judge, as today). The game keeps checking in the first conversations, so this is a starting point, not a test.

## 6 · Places and people

**Screen:** the city list behind her, slightly blurred.
**She (English):** "Pick a city, then a place: a bar, the market, a piazza. Whoever's there will talk to you. They remember you, so go back, and they'll know you."
**She:** *Il barista si ricorderà di te.* (The barista will remember you.)

**Learner:** **Next**.

## 7 · When you're stuck

**She (English):** "If you don't understand, just ask them, in Italian or English. Everyone here helps."
**She:** *Può ripetere, per favore?* (Could you say that again, please?)
**She (English):** "That one's worth knowing."

**Learner:** **Next**.

## 8 · Learn

**Screen:** the conversation screen behind her, with the book at the bottom right glowing.
**She (English):** "After a few turns, a book appears here. Tap it to see what you said, the better way to say it, and the words from that conversation."

**Learner:** **Next**.

## 9 · Off you go

**She (English):** "You'll get help with every answer to start. When you're ready, I'll ask if you want to try with less. You can always go back."
**She:** *Allora, {name}… andiamo!* (So, {name}… let's go!)

**Learner:** **Andiamo!** → the city list.

---

## Notes for the build (when decided)

- **Fixed lines,** except 4 and 5 (her reaction to what they said) and the Italian bubble in 4; those use the calls the game already has (the replies call, the "say it in English" line, the level judge).
- **Skip** at every step goes to the city list with what's been set so far; anything unset falls back as today (no name, address unset, no level counts as new).
- **Replay** from Settings → How Fuori works runs beats 3–9 only (no name or level again).
- **Mexico:** the same beats; her lines in Mexican Spanish; *Bienvenida / Bienvenido*; *¿Por qué estás en México?*; *¿Qué te gusta de México?*; *¿Me lo puede repetir, por favor?*
- **Needs Josh's call:** spoken English from her (beats 1–9); CLAUDE.md's "no AI notes in the game" rule; whether beat 4 ("say it in English") is built before the tour, since the tour teaches it.
