# Orientation: a script to replace onboarding (draft)

2026-10-22 · Josh asked for it · revised 2026-10-23 (Josh: "more obviously English intro"; "Don't apply rules to onboarding"; the beats follow his list; "buttons for picking a level are fine"; "treat onboarding different in every way") · **Draft for Josh to edit; nothing decided or built.** Replaces today's onboarding ([onboarding-design.md](onboarding-design.md)) with a set-up-to-play tour led by the greeter. Italy shown; Mexico follows the same beats with its own lines.

**The idea:**
- **An English introduction.** She explains in English, as a friendly guide would before you go out.
- **The dialogue style (Josh, 2026-10-23):** she says in English how Italians say it, asks the question in Italian, you answer with the microphone, and she replies in Italian. "In Italian, you ask someone their name by saying *Come ti chiami?*" → *Come ti chiami?* → your name → *Piacere!* Each set-up question teaches a phrase you'll hear again.
- **Onboarding is its own thing** (Josh, 2026-10-23: "treat onboarding different in every way"). Buttons are fine for set-up choices: masculine or feminine, and the level. The name is said with the mic, so the mic is tried first. "Say it in English", the loop the game uses ([beginner-scaffolding.md](beginner-scaffolding.md)), is tried once in beat 9.
- **It covers, in Josh's order:** your level, the gender rules, how the game works, cities, places, the microphone, talking with characters, what to do when you don't know how to reply, and Learn. The microphone comes first in practice, since every answer needs it.
- **About two to three minutes. Skippable at every step, replayable from Settings → How Fuori works.** Explanation beats move on with **Next**; that's navigation, not an answer.
- **The game's rules don't apply here** (Josh, 2026-10-23). The immersion rules (Italian only, English only when asked, no AI notes) are for conversations in the world. This is set-up: she speaks English, talks about the app and names its parts.

**Mock-ups (2026-10-23):** canvas "Reply buttons", row H; pictures in `design/orientation/H1.png` to `H11.png`. Skip and "n of 11" sit in the bar; her full picture while she sets you up (1–4, 9, 11), then the app's own screens dimmed behind her card, with a small portrait of her on the card (5–8, 10); the circle and the Learn book are highlighted when she explains them.

**Built, steps 1–3 (laptop, 2026-10-23), with Josh's edits:** H1's note ends "Tap the green microphone to talk. Tap it again to send me your name." and her question reads "What's your name? Tap the mic" (onboarding keeps tap to talk, tap to send); H2's buttons are **Benvenuto** (Masculine) and **Benvenuta** (Feminine); H3 unchanged, and the level picked is the learner's level, shown and changed in Settings (`POST /v1/me/level`; the Settings picker is live). **No Skip and no "n of 11" in the bar** (Josh). With the mic off, step 1 offers to go on without a name. Lines in `content/<country>/onboarding.ts` → `orientation`; the app uses the tour when the server sends them, else today's onboarding. After step 3, Avanti goes to the city list until steps 4–11 are built.

**More of a mix (Josh, 2026-10-23: "Maybe more of a mix of Italian and English?"):** every card opens with one short Italian line and its English, then the explanation in English. The Italian lines are simple and come back in the game. Buttons to move on say *Avanti*. Lines on the mock-ups:

| Beat | Italian line | English |
|---|---|---|
| 1 | *Ciao! Benvenuti a Fuori.* … *Come ti chiami?* | Hi! Welcome to Fuori. … What's your name? |
| 2 | *Piacere, {name}!* | Nice to meet you! |
| 3 | *Grazie. Benvenuto/a, {name}!* … *Parli italiano?* | Thanks. Welcome! … Do you speak Italian? |
| 4 | *Perfetto! Fuori è un viaggio in Italia.* | Perfect! Fuori is a trip to Italy. |
| 5 | *Si comincia da Roma.* | You start in Rome. |
| 6 | *Scegli un posto.* | Pick a place. |
| 7 | *Tocca e parla.* | Tap and talk. |
| 8 | *Qui tutti parlano italiano.* (and *Può ripetere?*) | Everyone here speaks Italian. |
| 9 | *Non sai come si dice?* … *Perché sei in Italia?* | Don't know how to say it? … Why are you in Italy? |
| 10 | *E qui impari.* | And here's where you learn. |
| 11 | *Ecco tutto, {name}. Andiamo!* | That's everything. Let's go! |

Beat 1 uses *Benvenuti* (plural) because she doesn't know yet how to address the learner.

Each beat: what's on screen · what she says · what the learner does · what it sets.

---

## 1 · Your name

**Screen:** her portrait, large. The green circle at the bottom.
**She:** "Hi, welcome to Fuori. I'll show you how it works before you head out. It takes about two minutes. In Italian, you ask someone their name by saying *Come ti chiami?* Use the microphone to answer: tap the green circle, talk, and tap again when you're done."
**She:** *Come ti chiami?*
**Learner:** taps, says their name (*Mi chiamo…* or just the name), taps. The first tap brings up iOS's permission prompt. **Skip the tour** sits under the panel.
**She:** *Piacere, {name}!* "Nice to meet you."
**Sets:** the name, and that the mic works.

## 2 · Masculine or feminine

**She:** "In Italian, words can be masculine or feminine. Even when we welcome someone, we say *benvenuto* to men and *benvenuta* to women. How do you want to be greeted?"
**Learner:** taps **Masculine** or **Feminine**.
**She:** *Grazie. Benvenuto, {name}!* or *Grazie. Benvenuta, {name}!*
**Sets:** how every character addresses them.

## 3 · Your level

**She:** "In Italian, you ask if someone speaks Italian by saying *Parli italiano?* So: how much Italian do you speak?"
**She:** *Parli italiano?*
**Learner:** taps **Beginner**, **Intermediate** or **Advanced** (Josh, 2026-10-23: stick to the three levels; buttons are fine).
**She:** *Perfetto!* "I'll start you there. You can change it any time in Settings."
**Sets:** the level, with that level's settings.

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

**She:** "Here's the trick that makes Fuori work. If you don't know how to say something, say it in English. You'll get it back in Italian, and you read that out loud. Try it: tell me why you're in Italy."
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

- **Fixed lines,** except the Italian bubble in 9 (the "say it in English" call).
- **Her English** is spoken in an English voice for the tour, or her own voice if it handles English well.
- **Skip** at any step goes to the city list with what's been set; anything unset falls back as today.
- **Replay** from Settings → How Fuori works runs 4–11 (no name, level or address again).
- **Mexico:** the same beats; *contento / contenta*, *bienvenido / bienvenida* (the same Masculine and Feminine buttons), *el café*, *la tortilla*; the cities and places from its content; *¡Vámonos!*
- **Words in the learned language** (examples, sample places) come from country content, not Swift (CLAUDE.md).
- **Depends on** "say it in English" being built: the tour is made of it.
