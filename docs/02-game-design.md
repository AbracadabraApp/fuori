# Game design

## Core loop

The game is a season in Italy told as a sequence of **days**. Each day is a short play session in one place.

```
Choose today (continue stay / day trip / travel on)
  → Colazione: the anchor character (your barista)
  → One or two errands with rotating shopkeepers and neighbours
  → Sera: an unscripted conversation with someone new
  → Diario: review the day, plan tomorrow
```

Days are **game days, not calendar days**. A player can do one a night or three on a Sunday. The game may suggest "Giulia is expecting you tomorrow" but never locks content behind real time.

## Stays and day trips

- **Stays** (2–5 days) are the backbone. You have lodging, a local bar, a market, neighbours. The same characters recur and remember you, so vocabulary and phrases repeat naturally in a story rather than in drills.
- **Day trips** (1 day) leave from a stay and return the same evening. They bring novelty: a new town, new vocabulary, a little time pressure (the last train back).
- **Travel days** move you between stays and are themselves scenes: buying a ticket, a conversation on the train, arriving and finding your lodging.

## Who you meet

### The cast of a stay
Each stay has a cast of **4–8 named characters**, counting the evening conversations. That is enough variety to keep days fresh and few enough that you really get to know them. Day trips have 2–3 characters of their own.

### At most four conversations a day
A day has **up to four conversations** and never the same four twice:

| Slot | Who | Changes day to day? |
|---|---|---|
| Colazione | The **anchor**: your barista, every morning of the stay | Same person, new conversation each day |
| Errand 1 | A shopkeeper or neighbour from the cast | Rotates |
| Errand 2 (optional) | Another cast member, or a one-off (pharmacist, tabaccaio) | Rotates; some days skip it |
| Sera | An **open-ended** conversation with someone new | A different person every evening |

Rules for building a day:
- The anchor appears every day of a stay. Their conversation grows with familiarity (sconosciuto → cliente → habitué → amico), so they are the clearest measure of progress.
- Errand characters return every 1–2 days, not every day, so each return feels like a reunion and recycles that character's vocabulary.
- The evening person is never repeated within a stay. A few may reappear in a later city.
- Shorter days are fine: three conversations on a travel day, two on a day trip's return evening.

## The daily rhythm

### Colazione: the anchor (structured, light)
A short conversation with your barista, with 1–3 checkable steps. Day 1 is ordering and paying. By day 3 it's "il solito?", small talk, and news about the neighbourhood that sets up the day ("Enzo has the first artichokes today").

### Errands: shopkeepers and neighbours (structured)
A concrete goal with 2–4 steps, like the prototype scenes: buy food at the market, a bus ticket at the tabaccheria, something at the pharmacy, book a table, help your host with something. Steps change on repeat visits (Enzo asks how you cooked his tomatoes).

### Sera: open conversation (unscripted)
Each evening you meet someone new for an open conversation: a nonna on a bench, the owner of a wine bar, a student sketching in the piazza. No goal checklist. See [Conversation engine → Encounters](04-conversation-engine.md#encounters) for how this stays workable at A1–A2.

### Diario: end-of-day review
A short screen, also voiced, that closes the day:
- The 2–3 corrections that mattered most today, with the better phrasing to say aloud.
- New words and phrases, added to the quaderno.
- One or two "try tomorrow" goals pulled from your mistakes (e.g. "Use *vorrei* instead of *voglio*").
- A one-line note from the evening's character, in Italian, with their portrait.

The diario feeds the next day: the next morning's characters are told what to recycle.

## Progression

- **Language level** rises slowly from evidence in conversations (vocabulary used, accuracy, how often hints are needed). Characters' speech constraints follow the level.
- **Relationships**: each recurring character has a familiarity level (sconosciuto → cliente → habitué → amico). It changes greetings, topics and how informally they speak (Lei → tu).
- **Quaderno**: every word and phrase met, with when you last used it. Words not used for a while are deliberately worked into future scenes (spaced repetition by story).
- **The map**: places visited, stays completed, people met.

No streak guilt, no hearts, no lives. Rewards are recognition: a character remembering you, a new friend, a stamp in the passport-style journal.

## Help and safety nets

The game is dialogue-focused with minimal typing. Help comes in layers, starting with natural conversation:

**Level 1: Natural character help** (always available, in character)
- Characters offer options: "Vuoi un caffè? O un cappuccino?"
- They rephrase: "Piano piano, cosa vuoi ordinare?"
- They simplify questions when the learner struggles

**Level 2: "Come si dice…?" button** (user-triggered)
- Press the button, say what you want in English
- Get the Italian phrase back
- Repeat it to continue the conversation
- The character waits patiently, stays in character

**Level 3: UI hints** (only when genuinely stuck)
- Appear only when the character is confused OR after repeated failed attempts
- Most turns have no hints - the conversation flows naturally
- Trust Claude's reconstruction of imperfect transcription silently

**Always available:**
- **Ripeti / Piano**: replay the last line, slower
- **English toggle** for translations under each line, on by default at A1 and off by default from A2
- **Graceful exits**: any scene can be ended; the character closes naturally

The goal is immersion: you're talking to someone, not doing a drill.

## Out of scope for now

Pronunciation scoring, multiplayer, grammar lessons, non-Italian languages.
