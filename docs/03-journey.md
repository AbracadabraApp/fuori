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

**City Pantry Formula** (applied to all cities, 25-30 places each):

**Daily Routine (repeat across neighborhoods):**
- 3 bars/cafés - morning coffee, daily touchpoint
- 2 bakeries - bread, pastries, morning routine

**Food & Shopping (vocabulary contexts):**
- 2-3 markets - produce, local food, vendors
- 2 restaurants - sit-down, regional dishes
- 1-2 specialty food - city-specific (pizzeria in Naples, piadina in Bologna, etc.)

**Cultural/Landmark (2-4 places):**
- 1 major landmark (iconic)
- 1-2 churches/cultural sites
- 1 park or public garden
- 1-2 piazzas (social gathering)

**Social/Evening (1-2 each):**
- Wine bars or aperitivo spots (regional: enoteca, bacaro, osteria)
- Bookshop or cultural shop

**Practical (1-2 total):**
- Pharmacy, market, neighborhood shop
- Transportation hub

**City Character (2-3 unique):**
Examples - Milan: design shop, fashion atelier, Navigli aperitivo | Venice: gondola workshop, mask shop, bacaro | Naples: sfogliatella shop, pizzeria fritta | Florence: leather workshop, Oltrarno artisan | Bologna: tortellini shop, university bookshop | Palermo: street food stand, Arab market

This formula ensures vocabulary consistency while giving each city unique character.

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
