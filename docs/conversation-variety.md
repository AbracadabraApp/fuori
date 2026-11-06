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

Four pieces: A (prompt, every place, both countries), C, E and F (content). B and D were considered and dropped. Strategy "arrive with a reason" (a mission from Magda or a neighbour) is out (Josh, 2026-11-06: "6 no").

### A. The errand stops leading (prompt)

- `beginner.md` (both countries): replace "let it lead: what they'd like, how much, how it's served, paying, goodbye" with: the purchase, if there is one, is a turn or two inside a conversation about something else; the conversation is about the place, the town and you.
- The same line in the shared `dialogue.md`, so Intermediate and Advanced follow it too (fixes are global).
- Keep what works: react first, one question, answers to say back, never invent an errand where there isn't one.

### B. Dropped: a pride line

Tried 2026-11-04 (`docs/prompt-trials.md`, `character.md` pride line): culture 7% → 17%, but forced lines and the errand barely moved (68% → 59%). Josh: "I think pride is a dead idea"; "increase culture by increasing cultural settings". Culture goes in the `here` line instead (docs/culture.md → Culture comes from the settings), which is what C does.

### C. Richer `here` lines, with Nino's moment (content)

- Every shown character's `here` line is rewritten, the way Nino's was: a cultural setting only this place has (its history, its product and why the town cares about it, its regulars), and, for many, a moment when nothing can be sold (before opening, the kitchen closed after lunch, a delivery being unpacked, stocking up for a festival). The moment is part of the line, not a separate field or a draw.
- No national clichés in `here` lines (Josh, 2026-11-06: "Watch out for cappuccinos in the morning"). Shown today: Luisa (Testaccio), Sandro (Monti), Bar Rita (Milan) and Pasticceria Marchesi (Milan) all carry cappuccino-in-the-morning, and city `customs` lists repeat it (Rome, Milan). Each such custom appears at one place in the country at most, where it's that person's own thing (Sandro's kind grumble), and is cut from the rest. Same for pay first, standing is cheaper, coffee at the counter. The replay judge counts them.
- **Planted lines echo** (Josh, 2026-11-06: "the cappuccino line is also a warning about how these planted lines echo"). Whatever `here` says gets said nearly every visit: the weather line went into 24 of 24 openers; Nino's closed kitchen will be closed on the third visit too. So C waits for the baseline to measure the echo: for each shown character, the share of visits that use their planted line, first visit and third. Then compare, on a few characters, one strong hook against three or four smaller threads, and, on repeat visits, telling the character what they already told this learner (their memory notes, `lib/remember.ts`). C's shape follows the numbers.
- **Threads drawn with odds, like the weather** (Josh, 2026-11-06: "Note how weather creates odds of mention"). A drawn line is mentioned almost every time it's given (weather: 8 of 8), so the odds of the draw set how often it comes up (`lib/weather.ts`, `WEATHER_ODDS` 1 in 4, seeded by character and local date). So `here` becomes a core that's always there (who, where, what they do: no talking points) plus a few threads (Nino's closed kitchen, a delivery being unpacked, the place's history, Sandro's cappuccino grumble), each drawn per character per day with its own odds, the same hash as the weather. Most visits get none or one. Measured: each thread's mention rate should track its odds.
- Generated drafts against the city file, a fact judge (`facts.md`), then played: two cities first (Florence and Mexico City), measured, then the rest.
- No new prompt rule: facts in the setting work, rules don't (culture.md).

### D. Dropped: a generated situation for each visit

Josh, 2026-11-06: skeptical. The evidence agrees: the pride line written as a situation became invented news (Luisa's made-up derby score), and a weather line in the setting made all 24 openers talk about the weather (`docs/prompt-trials.md`, 2026-11-03 and 04). A situation per visit would likely do both.

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
- **A shop or market has to prove it's better than the alternatives** (Josh, 2026-11-06: "Any store/market in the swap needs to prove value"; "the test is why is the shop better than a cultural focus, open space, role with limited transaction (Nino in Rome)"). The bar isn't the place it replaces but the best of a cultural place (a landmark, a basilica), an open space (a piazza, a park) and a role with little to sell (Nino). Those are in the variety gate as reference points. What only a shop gives is the language of buying (asking, how much, how many, how it's served), and learners need it in small doses. So a shop is shown only if it comes close to the references on something particular to the town and on told again, and adds a turn or two of buying without the buying taking over. Otherwise the city gets the landmark or the open space. Landmarks and open spaces only need the usual play before they're shown.

### F. Mexico's own places (content, new)

- Almost nothing is hidden in Mexico, so new places are needed, one or two per city, in place of a repeated type. Examples:
  - Oaxaca: a mezcal palenque
  - Puebla: a talavera workshop
  - Guadalajara: Plaza de los Mariachis
  - Mexico City: a lucha libre arena
- Same process as the other new places: place, person, picture prompts, Josh approves the pictures.

### Also, smaller

- **Talk to a customer** (strategy 5): at some bars the person you meet is a regular at the counter, not the barista. That's content, a character whose role isn't the job, and needs no other change. Try it at one or two bars after E.
- **Cultural items in ordinary visits** (strategy 7): `content/<country>/culture.json` stories already belong to places; a place's `here` line can carry its story's setting.

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

1. Baseline replay (no change to the game), with the echo of planted lines over first and third visits.
2. A, the errand stops leading: a prompt change, measured.
3. C, richer `here` lines, in Florence and Mexico City first, measured, then everyone.
4. E, Italy's showcase swaps, after Josh approves the list.
5. F, Mexico's new places.

Each step: smoke:live in both countries before it's called done; `progress.md` updated.

## Decisions for Josh

- **E:** the swap list per city, sent before anything changes.
