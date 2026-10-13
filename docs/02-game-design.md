# Game design

## Core idea

You are living in Italy for a while. You can go almost anywhere and meet whoever is there; Claude creates the places, the people and what happens. Nothing is scripted, but you are never left without an idea of what to do: every day Claude suggests a few things, and one of them is always a change of scenery.

## Core loop

```
Viaggio: pick a city (or stay where you are)
  → Oggi: Claude suggests 3–4 things to do today
          + one "cambia aria" option (new neighbourhood, day trip, new city)
          + "vai dove vuoi" (say where you want to go)
  → each choice opens a conversation with someone at that place
  → Diario: review the day, plan tomorrow
```

Days are **game days, not calendar days**. A player can do one a night or three on a Sunday. Characters may say "ci vediamo domani", but nothing is locked behind real time.

## Suggestions

Each morning Claude, acting as the director, proposes **3–4 things to do**, built from:

- **What you need to practise:** recurring mistakes and stale words from the quaderno. If you keep saying *voglio*, today includes situations that call for *vorrei*.
- **People you know:** "Enzo said the artichokes arrive today", "Rita wants help carrying the shopping".
- **The city:** its neighbourhoods, food, customs and landmarks ("you still haven't tried *cacio e pepe*").
- **Your level:** harder situations as you improve (see [Levelling up](#levelling-up)).

Plus, always:
- **Cambia aria:** a new neighbourhood, a day trip, or moving to a new city.
- **Vai dove vuoi:** you say where you want to go ("voglio andare in una libreria") and Claude creates it.

Suggestions come in the order Claude thinks fits the day (morning bar first, evening conversation last), but you may pick any of them. Each has a light goal (2–4 steps) where it makes sense; evening conversations have none.

## People

- **A few anchors per city:** where you're staying (your host) and maybe your local bar. They give each city a home base and continuity.
- **Everyone else is generated** the first time you meet them, from the city, the place and a role, and then **saved**. Go back and they remember you.
- **Your regulars are whoever you keep going back to.** If you return to the same bar every morning, that barista becomes your Giulia.
- **Familiarity grows** with each meeting (sconosciuto → cliente → habitué → amico), changing greetings, topics and how informally they speak (Lei → tu).
- **People stay where you met them.** Return to Roma after Firenze and Giulia says "Sei tornato!".
- **People you've left keep in touch:** postcards and short messages from Rita or Matteo, which double as light reading practice.

## Changing scenery

At three sizes, always one of the day's options:

1. **Same city, new neighbourhood:** Monti instead of Trastevere. Offered when you've stayed in the same few spots a while.
2. **Day trip:** out in the morning, back at night. Getting there is part of it (the ticket, the train, a stranger on board).
3. **Moving on:** you ask ("voglio andare a Napoli"); Claude suggests it when the timing feels right (time spent, conversations getting easy); or it comes through a person ("Davide va a Bologna per un concerto, vieni?").

No city is locked. [Cities and people](03-journey.md) suggests a route as inspiration only.

## Evening conversations

The last suggestion of the day is usually an open conversation with someone new: a nonna on a bench, a wine bar owner, a student sketching in the piazza. No checklist; the character has a hidden topic and leads with questions so a beginner can keep up. See [Conversation engine → Open conversations](04-conversation-engine.md#open-conversations).

## Who teaches

Everyone teaches, always in role (Josh, 2026-10-12/13; see [Vision, principle 7](01-vision.md#principles)). Locals help the way a real person in their role helps a struggling American: slowing down, repeating, rephrasing, offering a word and its English, recasting a mistake. What no in-world character does is step out of role and sound like a language teacher with a lesson plan. Three places where teaching is the point, each a different relationship to time and task:

- **The school for foreigners (scuola per stranieri)**, planned, one per city: one-on-one with a tutor. You say what you want to work on, or the tutor suggests something. Here an explicit lesson is honest, because you've sat down to be taught. It doesn't need the learner profile.
- **People with time on their hands** (someone on a park bench, at a newsstand): no transaction and no clock, so their in-role help can stretch: asking how the Italian is going, talking at the level you say you're working on. Still a person, not a tutor.
- **Magda**, outside the game (below).

## Magda, your teacher in Seattle

Decided 2026-10-13 (Josh); replaces the earlier "teacher from the Veneto who coaches you remotely".
- **Your real Italian teacher back in Seattle,** outside the game world. She has no place on the map and isn't part of the trip.
- **Reaches you by message:** a note when it's time to read and reply, possibly a video call. Her timing matters: a note after a session lands well; mid-conversation would pull you out of Italy.
- **Uses English and Italian freely,** as a teacher does; no in-world rules apply to her.
- **Gets the complete learner profile** (see below) and does real teacher work with it between sessions: summarises your mistakes, decides what to correct and how, builds vocabulary lists. She can be as detailed and exacting as she likes.
- **Bridge to real lessons:** what she sends can go to a real lesson with the real teacher.

### The learner profile is Magda's

A profile built by analysing transcripts after each conversation: what you get wrong, words you don't seem to know, tenses you don't produce yet, registers you avoid (formal *Lei*). It grows from the review log (M1) into a profile that travels across conversations (M2).
- **Magda gets all of it.** A human-style teacher is the one reader who can use the full, messy picture well.
- **Nothing in the world needs it.** Characters teach in role without it; the school tutor works from what you ask for. This keeps the analysis from shaping or slowing conversations.
- **Maybe later, not now:** quietly using it to aim in-world help (the nun happens to offer a word you've been missing rather than a random one). Easy to over-invest in; keep on the shelf.

Inspired by the creator's real teacher. Use her first name only, and check she's happy with it before Fuori is shown to anyone else.

## Diario: end of day

A short screen, also voiced, that closes the day:
- The 2–3 corrections that mattered most, with the better phrasing to say aloud.
- New words and phrases, added to the quaderno.
- One or two "try tomorrow" goals pulled from your mistakes. These feed tomorrow's suggestions.
- A one-line note from the evening's character, in Italian.

## Levelling up

Levels follow the **CEFR** (A1, A2, B1…), with Italian specifics from the *Profilo della lingua italiana*. Two dials move separately:

- **What you hear:** speed, sentence length, vocabulary, tenses, how much regional dialect.
- **What situations ask of you:** ordering → describing → telling what happened → giving opinions → handling problems.

**How the game knows you're ready** (from conversations, no tests): how often you need hints, "Come si dice?", slow replay or English; how many corrections; whether old mistakes stop recurring; the words and tenses you actually use. The diario updates your profile; changes need consistent evidence across several days, so one good or bad day doesn't move you.

**Small steps:**

| Step | You can… | Characters… |
|---|---|---|
| A1 | Order, ask prices, introduce yourself | Present tense, short sentences, slow, English support on |
| A1+ | Say what you did ("Ieri ho mangiato…") | Add *passato prossimo* |
| A2 | Describe people and places, how things were | Add *imperfetto*, normal speed, English off by default |
| A2+ | Give opinions, handle small problems | Add future and conditional, complications |
| B1 | Tell stories, explain, persuade | Regional speech, group conversations |

**Harder situations** are where levelling up shows: the shop is out of what you want, the train is cancelled, a phone call with no picture, a fast talker, a debate about football.

**Dialect grows with level:** at A1–A2 at most one local touch per conversation (*daje*, *aò*); more at higher levels, with Magda explaining it.

**What you see:** no XP or level numbers on screen. Characters notice ("Ma parli molto meglio!"), the diario marks firsts ("Prima volta: hai raccontato una storia al passato"), and new kinds of people and places start appearing. A manual "più facile / più difficile" control is available.

## Help and safety nets

Help comes in layers, starting with the conversation itself:

1. **Natural character help** (always): characters offer options ("Un caffè? O un cappuccino?"), rephrase, simplify.
2. **"Come si dice…?"** (you ask): say it in English, get the Italian to repeat, without leaving the scene.
3. **Hints** (rare): only when the character is genuinely confused or you're stuck twice in a row.

Always available: **Ripeti / Piano** (replay slower), an **English toggle** (on by default at A1), and **graceful exits** (any scene can end; the character closes naturally).

## Interface

Instagram-like and phone-first. Original mockups: [Fuori mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx) (note: mockups predate the scrolling card interface and show a 2x2 tile grid).

- **Viaggio:** cities as large square tiles; the current city is highlighted with your days there and the people you know.
- **Oggi:** today's suggestions as **vertically scrolling full-width image cards** (watercolour illustrations), with captions overlaid on the bottom. Plus "cambia aria" and "vai dove vuoi" cards. Tap one to go there.
- **Conversazione:** like a video call. Large portrait with the character's mood, transcript and quiet correction notes below, a big mic button, "Come si dice?" and "Piano · Ripeti".
- **Diario** and **Tu** (your journal: places, food and people as a grid).
- Bottom tabs: Oggi · Viaggio · Diario · Tu. No likes, no infinite feed, no streaks.

## Out of scope for now

Pronunciation scoring, multiplayer, other languages. See [Ideas](ideas.md) for parked ideas.
