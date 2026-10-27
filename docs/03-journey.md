# Cities and people

Fuori is open-ended: Claude creates places and people as you go. This document holds the **ingredients** Claude cooks with, not scripts. Each city gets a pantry (neighbourhoods, places, food, customs, expressions) and a few hand-written anchor characters. Everything else is generated during play.

## Suggested route (inspiration only)

Nothing is locked; the learner can go anywhere. This is the route Claude leans on when suggesting where to go next.

| Where | Kind | Feel |
|---|---|---|
| **Roma**, Trastevere | Stay (start here) | Settling in: your bar, your market, your neighbours |
| Orvieto | Day trip from Roma | The train, a hill town, lunch with a view |
| **Firenze**, Oltrarno | Stay | Artisans, art, opinions |
| Siena | Day trip from Firenze | The Palio, contrade, pride of place |
| **Bologna** | Stay | Food, the university, the portici |
| **Napoli** | Stay | Noise, warmth, gesture, coffee culture |
| Pompei or Procida | Day trip from Napoli | |

## Roma (first city)

### Anchors (hand-written)

| Character | Who | Speech |
|---|---|---|
| **Signora Rita** | Your host: rented room above a courtyard in Trastevere. 70, widowed, kind, nosy | Slow, clear, warm; *Lei* at first, *tu* once she knows you |
| **Giulia** | Barista at the bar on your street, 30s, quick and funny | Fast, informal, *tu* from the start, the odd Roman word |

These two exist from day one. Everyone else is generated when you meet them.

### Seed characters (examples, not scripts)

Sketched during design; Claude may use them as templates or generate others like them:

- **Enzo**, 60s, fruit and veg stall at the Mercato di San Cosimato; theatrical, compliments, haggles for fun, *Lei*.
- **Franco**, 50s, tabaccaio; gruff but helpful, warms up slowly.
- **Davide**, 25, Rita's grandson, a student; curious about where you're from and why Italy.
- **Nonna Franca**, a neighbour on the courtyard bench; lots of questions about your family.
- **Matteo**, owns a tiny wine bar; insists you taste and give an opinion.
- **Sofia**, art student sketching in Piazza di Santa Maria; asks what you find beautiful.

### Pantry

Full pantry in `content/it/cities/roma.ts` with 24 places, regional food, customs, and local expressions.

**City Pantry Formula:** rewritten 2026-10-27 (Josh: the cities felt alike, two bars and a wine bar everywhere, a bakery in almost every city). The one copy is `placeKinds` in `content/<country>/generation.json`, read by `scripts/generate-city-content.mjs` and `scripts/generate-cities-batch.mjs`. In short: 10–12 places; at most 2 bars and 1 gelateria, no bakeries; one each of market, local eating place, landmark, church, piazza or park, errand and station; 2–3 places only this city has or where something is happening, with at least one person with something to show; staff at businesses, customers and passers-by only in public places; every person has a reason to be there (`here`). Ideas behind it: [adventures.md](adventures.md).

### A first week, for reference

How a Roma week might go, to sanity-check the director's suggestions. Not a script.

- **Day 1:** arrive at Rita's (keys, the room) · first coffee at Giulia's · a neighbour on the courtyard bench in the evening.
- **Day 2:** Giulia half-remembers you · the market (fruit, prices, quantities) · a bus ticket at the tabaccheria · dinner with Rita and Davide.
- **Day 3:** "il solito?" · ask Rita for a trattoria · a reading moment at Santa Maria · an evening at a wine bar.
- **Day 4:** tell Giulia about your week · Enzo asks how you cooked his tomatoes · "cambia aria": Davide suggests Orvieto.

## Later cities

Each city gets the same shape: 1–2 anchors (host, maybe a bar), a pantry, a few seed characters. Seeds already sketched:

- **Luca**, a train conductor on a break; football and the best supplì. On the way to Firenze.
- **Don Paolo**, a parish priest in Firenze; the history of his church, curious about your family.
- **Chiara**, a nurse in Bologna coming off a night shift; tired, funny, wants a coffee and small talk.

People from earlier cities can reappear (Davide visits Bologna for a concert).
