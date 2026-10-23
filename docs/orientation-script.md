# Orientation: a script to replace onboarding (draft)

2026-10-22 · Josh asked for it · revised 2026-10-23 (Josh: "more obviously English intro"; "Don't apply rules to onboarding"; the beats follow his list) · **Draft for Josh to edit; nothing decided or built.** Replaces today's onboarding ([onboarding-design.md](onboarding-design.md)) with a set-up-to-play tour led by the greeter. Italy shown; Mexico follows the same beats with its own lines.

**The idea:**
- **An English introduction.** She explains in English, as a friendly guide would before you go out. Italian appears only in examples and where you try something.
- **It covers, in order (Josh):** your level, the gender rules, how the game works, cities, places, the microphone, talking with characters, what to do when you don't know how to reply, and Learn.
- **You try the two things that matter:** the microphone, and saying it in English to get the Italian line back to read.
- **About two to three minutes. Skippable at every step, replayable from Settings → How Fuori works.**
- **The game's rules don't apply here** (Josh, 2026-10-23). The immersion rules (Italian only, English only when asked, no AI notes) are for conversations in the world. This is set-up: she speaks English, talks about the app and names its parts.

Each beat: what's on screen · what she says · what the learner does · what it sets.

---

## 1 · Hello

**Screen:** her portrait, large. The panel at the bottom.
**She:** "Hi, welcome to Fuori. I'll show you how it works before you head out. It takes about two minutes. What's your name?"
**Learner:** types it, or says it (the mic's first tap brings up iOS's permission prompt). **Skip the tour** sits under the panel.
**Sets:** the name.

## 2 · Your level

**She:** "How much Italian do you have?"
**Learner:** taps one:
- **Just starting**: a few words, or none
- **Some**: I can get by in simple conversations
- **Comfortable**: I can talk, I want to get better

**She:** "Good, I'll start you there. You can change it any time in Settings."
**Sets:** the level, with today's settings for each (beginner: English on, slower speech, help with every answer; some: English off; comfortable: English off, full speed). The first conversations can still adjust it.

## 3 · Gender rules

**She:** "One thing about Italian: words change for men and women. A man is *contento*, a woman is *contenta*. When people welcome you, it's *benvenuto* or *benvenuta*. Things have a gender too: *il caffè*, *la pizza*. You'll pick it up as you go. How should people talk to you?"
**Learner:** taps **Benvenuta** (as a woman) or **Benvenuto** (as a man).
**She:** "*Benvenuta, {name}!* That's how everyone will greet you."
**Sets:** how every character addresses them.

## 4 · How the game works

**She:** "Fuori is a trip to Italy. You stay a while, go out and talk to people. There are no lessons and no scores: you learn by talking, and people help you the way they'd help any newcomer."

## 5 · Cities

**Screen:** the city list behind her.
**She:** "You start in Rome. Other cities open up: Matera, Bergamo and more. Each one has its own places and people. To travel, go to the station."

## 6 · Places

**Screen:** a city's places.
**She:** "In each city, pick a place: a bar, a trattoria, a piazza, a pharmacy. Someone is always there. They remember you, so go back and they'll know you."

## 7 · The microphone

**Screen:** the green circle at the bottom, alone.
**She:** "You talk out loud. When it's your turn, the circle is green. Tap it, talk, and tap again when you're done. While she answers, it turns orange. Try it now: say *Ciao!*"
**Learner:** taps, says *Ciao*, taps.
**She:** "*Ciao!* Perfect."
**Sets:** that the mic works. (Hands-free is mentioned here as a setting.)

## 8 · Talking with characters

**She:** "People speak Italian with you. If you don't understand, ask, in English if you need to, and they'll help, then go back to Italian. Asking them to repeat is always fine."

## 9 · When you don't know how to reply

**She:** "Sometimes you'll know what you want to say but not how. Just say it in English. You'll get it back in Italian, and you read it out loud. Try it: tell me why you're in Italy."
**Learner:** says it in English (for example, "I'm here for a few months to learn Italian"). An Italian bubble comes back with the English: *Sono qui per qualche mese per imparare l'italiano.* They read it aloud.
**She:** "That's it. Use it whenever you're stuck."
**Sets:** what brings them here (for the characters' memory).

## 10 · Learn

**Screen:** the conversation screen behind her, the book at the bottom right glowing.
**She:** "After a few turns, a book appears here. That's Learn: what you said, a better way to say it, the new words, and a teacher you can ask anything, in English."

## 11 · Off you go

**She:** "That's everything. *Andiamo!* Let's go."
**Learner:** **Let's go** → the city list.

---

## Notes for the build (when decided)

- **Fixed lines,** except the Italian bubble in 9 (the "say it in English" call). No level judge: the level is asked (2).
- **Her English** is spoken in an English voice for the tour, or her own voice if it handles English well.
- **Next** moves on after each explanation beat (4, 5, 6, 8, 10); she never waits on a timer.
- **Skip** at any step goes to the city list with what's been set; anything unset falls back as today.
- **Replay** from Settings → How Fuori works runs 4–11 (no name, level or gender again).
- **Mexico:** the same beats; *contento / contenta*, *bienvenido / bienvenida*, *el café*, *la tortilla*; the cities and places from its content; *¡Vámonos!*
- **Words in the learned language** (examples, the mic test word, the sample places) come from country content, not Swift (CLAUDE.md).
- **Needs Josh's call:** whether "say it in English" (9) is built before the tour, since the tour teaches it.
