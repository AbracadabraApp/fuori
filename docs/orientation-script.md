# Orientation: a script to replace onboarding (draft)

2026-10-22 · Josh asked for it · revised 2026-10-23 (Josh: "more obviously English intro"; "Don't apply rules to onboarding"; the beats follow his list; "say it in English becomes the sitewide onboarding. No clicks to answer.") · **Draft for Josh to edit; nothing decided or built.** Replaces today's onboarding ([onboarding-design.md](onboarding-design.md)) with a set-up-to-play tour led by the greeter. Italy shown; Mexico follows the same beats with its own lines.

**The idea:**
- **An English introduction.** She explains in English, as a friendly guide would before you go out.
- **Every answer is spoken, never tapped** (Josh: "No clicks to answer"). From the second question on, the learner answers the way beginners will play: **say it in English → the Italian line comes back → read it out loud.** The tour is practice in the loop the whole game uses ([beginner-scaffolding.md](beginner-scaffolding.md)).
- **It covers, in Josh's order:** your level, the gender rules, how the game works, cities, places, the microphone, talking with characters, what to do when you don't know how to reply, and Learn. The microphone comes first in practice, since every answer needs it.
- **About two to three minutes. Skippable at every step, replayable from Settings → How Fuori works.** Explanation beats move on with **Next**; that's navigation, not an answer.
- **The game's rules don't apply here** (Josh, 2026-10-23). The immersion rules (Italian only, English only when asked, no AI notes) are for conversations in the world. This is set-up: she speaks English, talks about the app and names its parts.

Each beat: what's on screen · what she says · what the learner does · what it sets.

---

## 1 · Hello, and the microphone

**Screen:** her portrait, large. The green circle at the bottom.
**She:** "Hi, welcome to Fuori. I'll show you how it works before you head out. It takes about two minutes. You talk out loud here: tap the green circle, talk, and tap again when you're done. What's your name?"
**Learner:** taps, says their name, taps (the first tap brings up iOS's permission prompt). **Skip the tour** sits under the panel.
**Sets:** the name, and that the mic works.

## 2 · Your level, and saying it in English

**She:** "Nice to meet you, {name}. Here's the trick that makes Fuori work: if you don't know how to say something, say it in English. You'll get it back in Italian, and you read that out loud. Let's try. Is your Italian beginner, intermediate or advanced?"
**Learner:** says one in English. An Italian bubble comes back with the English (*Sono principiante.* · I'm a beginner. / *Sono di livello intermedio.* / *Sono di livello avanzato.*). They read it aloud.
**She:** "Perfect, that's the whole trick. I'll start you there."
**Sets:** the level they said: Beginner, Intermediate or Advanced (Josh, 2026-10-23: stick to the three levels), with that level's settings. Anyone who answers in Italian skips the bubble.

## 3 · Gender rules

**She:** "One thing about Italian: words change for men and women. A man is *contento*, a woman is *contenta*. When people welcome you, it's *benvenuto* or *benvenuta*. Things have a gender too: *il caffè*, *la pizza*. You'll pick it up as you go. Which should people say to you: *benvenuto* or *benvenuta*?"
**Learner:** says one (or says it in English: "a woman", "a man").
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

## 7 · The circle

**Screen:** the circle alone, then its two colours.
**She:** "You've been using it already. Green is your turn: tap, talk, tap again. Orange means she's answering; tap it if you want to cut in. If you'd rather not tap at all, Hands-free is in Settings."

## 8 · Talking with characters

**She:** "People speak Italian with you. If you don't understand, ask, in English if you need to, and they'll help, then go back to Italian. Asking them to repeat is always fine."

## 9 · When you don't know how to reply

**She:** "And whenever you're stuck, do what you did with me: say it in English, read the Italian out loud. One more: tell me why you're in Italy."
**Learner:** says it in English ("I'm here for a few months to learn Italian"), gets *Sono qui per qualche mese per imparare l'italiano.*, reads it aloud.
**Sets:** what brings them here (for the characters' memory).

## 10 · Learn

**Screen:** the conversation screen behind her, the book at the bottom right glowing.
**She:** "After a few turns, a book appears here. That's Learn: what you said, a better way to say it, the new words, and a teacher you can ask anything, in English."

## 11 · Off you go

**She:** "That's everything. *Andiamo!* Let's go."
**Learner:** **Let's go** → the city list.

---

## Notes for the build (when decided)

- **Fixed lines,** except the Italian bubbles (the "say it in English" call) and a small call reading the level (2) and the address (3) from what was said. No buttons for either.
- **Her English** is spoken in an English voice for the tour, or her own voice if it handles English well.
- **Skip** at any step goes to the city list with what's been set; anything unset falls back as today.
- **Replay** from Settings → How Fuori works runs 4–11 (no name, level or address again).
- **Under VoiceOver or with the mic off:** a text field stands in for the voice (the one exception to no tapping, for access).
- **Mexico:** the same beats; *contento / contenta*, *bienvenido / bienvenida*, *el café*, *la tortilla*; the cities and places from its content; *¡Vámonos!*
- **Words in the learned language** (examples, sample places) come from country content, not Swift (CLAUDE.md).
- **Depends on** "say it in English" being built: the tour is made of it.
