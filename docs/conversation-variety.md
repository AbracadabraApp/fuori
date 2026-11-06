# Conversation variety: every shop the same conversation

Draft plan, 2026-11-06. Nothing here is built yet; each step waits for Josh's go.

## The goal

Every visit should give the learner something of this town and this person to talk about, so they learn the country (its food, customs, history and pride), not the same purchase again in every city. A visit to a bar in Siena and a bar in Milan should not be interchangeable.

## What's wrong

Josh, 2026-11-06: "The game is basically broken for all the places that have commerce as their focus: all conversations follow the same pattern, and places that are the same, like a bar or a restaurant, all fall into exactly the same pattern." "It's just not interesting to go to a pharmacy in every town and have the same conversation with every pharmacist." "It's also the same with markets, tobacco shops, any kind of specialty vendor, where the whole thing falls down into a transaction. How much you pay, do you want to pay with credit card or cash? Thank you, bye."

Why it happens:

- **The prompt scripts the transaction.** `content/*/prompts/beginner.md`: "If your job has an errand (selling, serving), let it lead: what they'd like, how much, how it's served, paying, goodbye." That is the pattern Josh describes.
- **A place differs from another of its kind by one sentence**, the character's `here` line ("You run the counter of this bar on the canal…"). Nothing else gives the conversation a subject, so the errand fills it.
- **Nothing changes from visit to visit.** The setting gets the weekday, the month and sometimes the weather (`lib/today.ts`), but no event, no news, nothing going on.
- **Characters don't know what the learner has already heard elsewhere**, so every bar tells them to pay first and that cappuccino is for the morning (Tommaso, Florence, 2026-11-06: "perché ogni bar ha detto le stesse cose?").
- **The same shop types repeat in every city.** Italy shows ~10 places per city; almost every city shows two bars, a market and a restaurant, 10 of 20 a pharmacy, 10 a gelateria. Mexico: every city has a café, a market stall, a fonda and a church, four of five a cantina.

What has worked: **Nino** (Osteria da Nino, Rome). His `here` line puts him in the quiet hour after lunch with the kitchen closed, so he can't take an order and tells about the menu instead. Josh had said the osteria "just turns into a regular ordering experience… It should be let me tell you about the menu".

## The plan

Six pieces. A to D change the shared layer and reach every place in both countries; E and F are content, city by city. Strategy "arrive with a reason" (a mission from Magda or a neighbour) is out (Josh, 2026-11-06: "6 no").

### A. The errand stops leading (prompt)

- `beginner.md` (both countries): replace "let it lead: what they'd like, how much, how it's served, paying, goodbye" with: the purchase, if there is one, is a turn or two inside a conversation about something else; the conversation is about the place, the town and you.
- The same line in the shared `dialogue.md`, so Intermediate and Advanced follow it too (fixes are global).
- Keep what works: react first, one question, answers to say back, never invent an errand where there isn't one.

### B. What the town is proud of (content, one line per character)

- A new field on the character, `pride`: one sentence of what their place or their product says about the town, with its history or its story. Examples:
  - Florence's tripe stand: the family stand, and why Florentines eat lampredotto.
  - Mantua's café: sbrisolona, Mantua's crumbly almond cake.
  - Puebla's sweet shop: the convents where the sweets began.
- Written for every shown character in both countries, about 250. A draft is generated, and a fact check (a judge with the city file) flags doubtful ones. Hand-written content stays data in `content/<country>/`.
- The prompt says: this is what you'd love to tell a newcomer, when it fits; not all of it at once.
- Not every visit opens with it (see D), so a second visit isn't the same speech.

### C. A moment when the transaction can't happen (Nino's pattern)

- Many characters get a `moment` alongside `here`, a time when nothing can be sold. Examples:
  - before opening
  - the delivery is late
  - lunch break
  - the stall is closing
  - stocking up for a festival
- Not every character, and not every visit. A moment comes up on some visits, picked the way the weather line is picked now (`weatherLine(cityId, now, characterId)`).
- The prompt line is the same as Nino's: you can't sell right now, so you talk.

### D. Something going on today, fresh for each visit (generated)

The open world rule: Claude generates scenes during play.

- When a conversation starts, one short call (Haiku-class, through `lib/claude.ts`) writes one or two sentences of what's going on for this person today. It draws on:
  - the character, `here`, `pride` and `moment`
  - the city and its customs
  - the day and the weather
  - **what this learner already heard at places of the same kind**, from the character turns of their last few conversations at that kind (the `conversations` table has place and turns)

  It is told to choose something different from those. Examples:
  - a regular who's late
  - tonight's match
  - the first artichokes of the season
  - a daughter's wedding
  - the Palio next week
- It goes into the setting like the weather does (`withToday`), as a fact, not a rule.
- Stored on the conversation, so a replay or a debug view can see it.
- Time added: one small call before the first turn. Measure it. If it adds noticeable wait, generate it while the place picture loads, or ahead for the shown places.
- No new tools: one conversation per person stays (Josh, 2026-11-06).

### E. Show the distinctive places already written (content, Italy)

- `content/it/showcase.ts`, city by city:
  - one bar per city;
  - the pharmacy kept in one or two cities only;
  - one or two places only that city has, brought out. Most are already written with their people, for example:
    - Naples: Via San Gregorio Armeno, Friggitoria del Vico
    - Florence: Il Trippaio, Officina di Santa Maria Novella, Scuola del Cuoio
    - Venice: Atelier della Maschera
    - Palermo: Ke Palle, the catacombs
    - Matera: Casa Grotta
    - Orvieto: Pozzo di San Patrizio
    - Mantua: Palazzo Te
    - Verona: Acetaia Veneta
    - Bergamo: the funicular
- A list of swaps per city goes to Josh first. Each place brought back is played (Beginner and Intermediate) before it's shown, since most have never been played.
- Pull before touching `showcase.ts` (other sessions edit it).

### F. Mexico's own places (content, new)

- Almost nothing is hidden in Mexico, so new places are needed, one or two per city, in place of a repeated type. Examples:
  - Oaxaca: a mezcal palenque
  - Puebla: a talavera workshop
  - Guadalajara: Plaza de los Mariachis
  - Mexico City: a lucha libre arena
- Same process as the other new places: place, person, picture prompts, Josh approves the pictures.

### Also, smaller

- **Talk to a customer** (strategy 5): at some bars the person you meet is a regular at the counter, not the barista. That's content, a character whose role isn't the job, and fits B to D unchanged. Try it at one or two bars after E.
- **Cultural items in ordinary visits** (strategy 7): `content/<country>/culture.json` stories already belong to places. D can draw one in as today's subject, once per learner, never repeated.

## How we'll know

A replay set, `tests/experiments/variety.mts`:

- **The places:** the opening and four turns at:
  - three bars, two pharmacies and two markets in different Italian cities;
  - three cafés, two market stalls and two fondas in Mexico.
- **The learner:** a simulated Beginner and Intermediate who goes along with whatever the character starts.
- **Judge 1 (variety):** shown two conversations at the same kind of place in different cities, "could one have happened at the other?" Want no.
- **Judge 2 (transaction):** "is most of this conversation the purchase (what, how much, how to pay)?" Want under one in five.
- **Judge 3 (learning):** "does the learner hear something true and particular about this town?"
- **Repeats:** a second and third visit to the same place, judged against the first.
- **The baseline:** run before A, then after each piece. Rows in `docs/prompt-trials.md`.

Then Josh plays it on the phone: a bar, a pharmacy and a market in two cities.

## Order

1. Baseline replay (no change to the game).
2. A, the errand stops leading: a prompt change, measured.
3. C and B for the shown characters in two cities first (Florence and Mexico City), measured, then everyone.
4. D, today's situation, with what the learner already heard.
5. E, Italy's showcase swaps, after Josh approves the list.
6. F, Mexico's new places.

Each step: smoke:live in both countries before it's called done; `progress.md` updated.

## Decisions for Josh

- **E:** the swap list per city, sent before anything changes.
- **B:** whether `pride` facts are generated and fact-checked, or each one approved.
- **D:** whether waiting a moment longer at the start of a visit is fine, or the situation must be ready before you tap the place.
