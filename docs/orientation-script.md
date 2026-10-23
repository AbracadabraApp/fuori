# Orientation: a script to replace onboarding (draft)

2026-10-22 · Josh asked for it · revised 2026-10-23 (Josh: "more obviously English intro") · **Draft for Josh to edit; nothing decided or built.** Replaces today's onboarding ([onboarding-design.md](onboarding-design.md)) with a set-up-to-play tour led by the greeter. Italy shown; Mexico follows the same beats with its own lines.

**The idea:**
- **An English introduction.** She talks to you in English, as a friendly guide would before you go out. Italian appears only where you try it: a word or two to hear, and three short practice turns with her. Then the game itself is Italian.
- **You learn by doing.** The reply bubbles, the mic and "say it in English" are tried with her once, so the first real conversation isn't the first time.
- **It still sets you up:** your name, how you're addressed, and a first guess at your level.
- **About two to three minutes. Skippable at every step, replayable from Settings → How Fuori works.**

Each beat: what's on screen · what she says · what the learner does · what it sets. Spoken English is plain; Italian is in italics with its English.

---

## 1 · Hello

**Screen:** her portrait, large. The panel at the bottom.

**She:** "Hi, welcome to Fuori. I'm going to show you how it works before you head out. It takes about two minutes. What's your name?"

**Learner:** taps the mic and says their name (or **Skip the tour** under the panel).
**Sets:** the name.

## 2 · How should people greet you?

**She:** "Nice to meet you, {name}. One thing about Italian: words change depending on who you are. When people welcome you, should they say *benvenuta* or *benvenuto*?"

**Learner:** taps **Benvenuta** (female) or **Benvenuto** (male).
**She:** "Great. *Benvenuta, {name}!* That's how everyone will greet you."
**Sets:** how every character addresses them.

## 3 · How talking works

**She:** "In Fuori you talk to people, out loud. They speak Italian. When it's your turn, the button at the bottom goes green: tap it, talk, and tap again when you're done. Let's try. I'll ask you how you are."
**She:** *Come stai?* (How are you?)

**Screen:** her line in the bubble on the left. Two answers in speech bubbles on the right, with English under them:
- *Bene, grazie!* · Fine, thanks!
- *Così così.* · So-so.

**Panel:** "Read one out loud: tap the green mic, say it, tap again."
**Learner:** reads one aloud.
**She:** "Perfect, that's exactly it."
**Sets:** that the mic works (the iOS permission prompt comes with this first tap).

## 4 · Say it your way

**She:** "You won't always want the answers I give you. You can say what you mean in English, and you'll get it back in Italian to say. Try it: why are you in Italy?"

**Panel:** "Say your answer in English. Then read the Italian out loud."
**Learner:** says it in English (for example, "I'm staying for a few months to learn Italian"). An Italian bubble comes back with the English: *Resto qualche mese per imparare l'italiano.* They read it aloud.
**She** responds in English to what they said ("A few months, lovely. You'll pick up a lot.").
**Sets:** what brings them here (for the characters' memory), and a first level signal.

## 5 · Try it in Italian

**She:** "Last one. This time, try it in Italian if you can. If not, English is fine. What do you like about Italy?"

**Learner:** answers however they like.
**She:** "Thank you. That helps me know where to start you."
**Sets:** a first guess at their level, from answers 4 and 5 (the level judge, as today). The first conversations keep checking it, so it's a starting point, not a test.

## 6 · Places and people

**Screen:** the city list behind her, slightly blurred.
**She:** "Here's how it works. Pick a city, then a place: a bar, a market, a piazza. Whoever's there will talk to you, in Italian. They remember you, so go back and they'll know you."

**Learner:** **Next**.

## 7 · When you're stuck

**She:** "If you don't understand, ask. In English is fine, or try this: *Può ripetere, per favore?* It means 'Could you say that again, please?' Everyone you meet will help you."

**Learner:** **Next**.

## 8 · Learn

**Screen:** the conversation screen behind her, with the book at the bottom right glowing.
**She:** "After a few turns, a book appears here. Tap it to see what you said, a better way to say it, and the words from that conversation."

**Learner:** **Next**.

## 9 · Off you go

**She:** "To start, you'll get help with every answer. When you're ready, I'll ask if you want to try with less, and you can always go back. That's it. *Andiamo!* Let's go!"

**Learner:** **Let's go** → the city list.

---

## Notes for the build (when decided)

- **Fixed lines,** except her responses in 4 and 5 and the Italian bubble in 4; those use calls the game already has (the replies call, the "say it in English" line, the level judge).
- **Her English** is spoken in the English voice from the pool for the tour only, or by her own voice if it handles English well; the characters in the game stay Italian.
- **Skip** at every step goes to the city list with what's been set so far; anything unset falls back as today (no name, address unset, no level counts as new).
- **Replay** from Settings → How Fuori works runs beats 3 and 6–9 (no name, address or level again).
- **Mexico:** the same beats in English; *bienvenida / bienvenido*; *¿Cómo estás?* with *Bien, gracias* / *Más o menos*; "why are you in Mexico?"; *¿Me lo puede repetir, por favor?*; *¡Vámonos!*
- **Needs Josh's call:** her speaking English (today's onboarding rule says she never does); CLAUDE.md's "no AI notes in the game" rule; whether "say it in English" (beat 4) is built before the tour, since the tour teaches it.
