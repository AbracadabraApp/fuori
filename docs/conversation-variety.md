# Dialogue variety

## Context

Josh, 2026-11-06: conversations at shops all go "how much, card or cash, thank you, bye", and the same kinds of place repeat in every town. Then: "the issue is not just transactions - we should frame it for all dialogue -- the easiest way to correct commerce is correct the places where it happens"; "is planting ideas the right approach"; "I honestly can't tell your plans". This plan was approved by Josh on 2026-11-06 and replaces the earlier versions below; it doesn't change without his say.

**Goal:** every conversation gives the learner something true and particular to this town and this person, and a second visit isn't a rerun of the first.

**What we know** (variety gate, `tests/experiments/variety.mts`, results in `docs/prompt-trials.md`):
- About two-thirds of the places a learner can visit are shops (Italy 5–9 of ~10 per city, Mexico 7–9 of 12–14).
- Mexico was better than Italy on culture, because its `here` lines say what the place is and why it's local (café de olla, the seven moles, Talavera, the marigolds).
- But whatever is in a `here` line gets said on every visit, Mexico's included (Josh: "even Mexico here drives repeats (cafe de olla)": Café Amapola's café de olla and piloncillo on visits 1, 2 and 3; the marigolds; Talavera). Planted talking points are the same, worse: ignored, forced, invented news, or said every visit (cappuccino, Nino's menu, the weather in 24 of 24 openings).
- So better lines bring culture, not variety. Repeats come from the character not knowing what they already told this learner, whatever the line says (Nino repeats his menu too). That needs memory, and it applies to every place in both countries, so it comes before the lines.

## The approach: three levers, each for its own problem, no planting

1. **Places → too much buying.** Fewer shops, more of each city's own places (Josh: "the easiest way to correct commerce is correct the places where it happens"). Which places change is Josh's decision, not yet made. My draft, for him to change or reject: one bar per city (two in Rome, Venice, Naples, Taormina and Turin), pharmacies out except Rome's, and the city's landmarks and open spaces in (already written, hidden by `content/it/showcase.ts`). Josh's rule, decided: a shop brought in has to prove it beats a cultural place, an open space and a role like Nino's on the gate. **Mexico, decided (Josh): add 2 cultural or open places to each Mexican city** (5 cities, 10 places). Mexico has almost nothing hidden, so these are new: place, person, a `here` line written the Mexican way, fact-checked, and pictures in the Mexico style (`docs/mexico-version.md` → Visual style), which Josh approves.
2. **Memory → repeats.** After a visit, the memory notes also record what the character told the learner (`content/*/prompts/memory.md`; notes are free lines, no new column). The character and Beginner prompts say: you've already told them about these; don't tell them again; ask how it went, or tell something new. Every place, both countries.
3. **Lines → too little culture (Italy).** Shown Italian characters' `here` lines written the Mexican way: what this place is and why it's local, the culture inside the work; for open places, the person's own interest with one example. No talking points, no national clichés (cappuccino hours, pay first). Lines don't fix repeats; memory does.

Dropped: threads drawn with odds (planting with dice), the pride line, a generated situation for each visit, missions.

## Steps

Each step is measured on the gate (purchase lines, something particular to the town, clichés, told again, reply time, words a line) against the baseline, and needs Josh's go.

0. **Tidy up (no change to the game).** Let the reference run finish and record it (it's the bar for shops). On the `variety-threads` branch, remove the threads code (`lib/today.ts` threadsToday, `lib/types.ts` threads, `lib/characters/for-place.ts`, the two prompt builders, the `test:today` thread checks); keep the gate test, the docs and Italy's four Mexican-style lines (tested: purchase down at both levels, no extra repeats). Merge that into `main`, push, smoke:live both countries.
1. **Swap list: not approved.** Josh goes through the draft list (in the conversation, not written into any file as decided) and changes, approves or rejects it city by city. Nothing in `showcase.ts` changes before that. Then: landmarks and open spaces he approves go in after a play at both levels and a picture check; any shop he approves goes through the gate and comes in only if it passes the bar from step 0.
1b. **Mexico's new places.** I bring Josh a draft pair per city to change or approve before anything is written, for example (my suggestions, not decided):
   - Ciudad de México: the Casa Azul (Frida Kahlo's house, Coyoacán); the embarcadero at Xochimilco (trajineras).
   - Oaxaca: Monte Albán; the Andador Macedonio Alcalá (the walking street up to Santo Domingo).
   - Guadalajara: the Hospicio Cabañas (Orozco's murals); the Plaza de los Mariachis.
   - San Miguel de Allende: the Casa de Allende museum; El Charco del Ingenio (the botanical garden and canyon).
   - Puebla: the Biblioteca Palafoxiana; the Callejón de los Sapos.
   Then for each approved place: the person and line, fact check, played at both levels, pictures for Josh's approval, then shown.
2. **Memory.** `memory.md`, `character.md` and `beginner.md` changes (version bump, changelog, trials row), gated at both levels in both countries on today's content. Success: told again on a later visit well below the baseline (Italy 2.0–2.5 Beginner, Mexico 1.1–1.3; Café Amapola's café de olla no longer on every visit), culture and purchase no worse.
3. **Lines.** Rewrite the remaining shown Italian lines the Mexican way, a few cities at a time, fact-checked (`scripts/fact-check.mts`), gated. Mexico's lines stay; its duplicate "Fonda Doña Tere" (Oaxaca and Puebla) gets fixed.
4. **Josh plays it on the phone:** a bar, a market and a landmark in two cities, after his yes to install.

Later, not in this plan: new Mexican shops (a palenque, a talavera workshop), which would have to pass the shop bar.

## Italy swap list: approved (Josh, 2026-11-06: "looks good")

Josh's decisions so far (2026-11-06): cut 2–5 businesses per city; only generic ones go (second bars, pharmacies, tabaccherie, ordinary bookshops and gelaterie), never a business unique to its city; no Florence shops (no Officina, no Scuola del Cuoio); Siena gets a mum with kids, not the Drogheria; Genoa no focacceria (generic); Mantua's Palazzo Te not an art historian with a cheesy name; people named after their place get real local surnames. 🛒 = a shop, which must pass the gate. Shops = businesses shown, now → after. Every new role and fact is fact-checked before it's written. Venice, Naples, Bologna and Turin drop by less than 2: what's left there is unique.

| City | Shops | Hide | Add | Person |
|---|---|---|---|---|
| Rome | 8 → 6 | Farmacia Prati, Tabaccheria Zhou | — | — |
| Matera | 7 → 4 | Bar Vitantonio, Libreria Matera, Gelateria I Vizi degli Angeli | Casa Grotta | Teresa Morelli, 47: knowledgeable local, grew up in the Sassi |
| Florence | 5 → 3 | Farmacia Molteni, Tabaccheria Nesi | Giardino di Boboli · Piazza della Signoria | Giuseppe Bardini, 63: head gardener who talks to his plants · Carlo Medici, 35: meets his friends under the Loggia every evening |
| Siena | 9 → 6 | Caffè Fiorella, Libreria Senese, Gelateria Brivido | Orto de' Pecci | a Sienese mum, ~38, kids playing, talks about their contrada (new person) |
| Venice | 6 → 5 | Farmacia Morelli | — | — |
| Naples | 9 → 9 | Libreria Dante & Descartes | 🛒 Via San Gregorio Armeno | Maestro Ferrigno, 70: master nativity maker |
| Bologna | 5 → 4 | Ristorante I Carracci | — | — |
| Palermo | 7 → 4 | Caffè del Kassaro, Libreria del Mare, Osteria Ballarò | Cappella Palatina | Giuseppe Randazzo, 56: restorer of the mosaics |
| Taormina | 8 → 5 | Farmacia Centrale, Gelateria Il Paradiso, Salumeria Sicilia | Teatro Antico | Dario Storia (rename), 53: actor in the summer season |
| Lecce | 7 → 5 | Bar della Vittoria, Farmacia Centrale, Gelateria Natale | 🛒 Rusticceria Santa Croce · Basilica di Santa Croce | Giuseppe Taurino, 33: fry cook · Padre Roberto, 56: knows every carved figure on the façade |
| Milan | 7 → 5 | Farmacia Centrale, Gelateria della Conca | Duomo | Padre Stefano, 67: has watched the cathedral's restorations |
| Verona | 7 → 5 | Bar ai Scalzi, Farmacia Centrale, Gelateria Ponte Pietra | Arena · 🛒 Acetaia Veneta | Silvia Arena (rename), 29: chorus singer · Ornella Acetaia (rename), 51: ages vinegar for decades |
| Assisi | 7 → 4 | Bar Senso, Farmacia Centrale, Tabaccheria del Centro, Gelateria Santa Maria | Basilica di San Francesco · 🛒 Laboratorio Ceramiche | Padre Giovanni, 67: Franciscan friar · Marco Angelini, 37: potter |
| Bergamo | 6 → 4 | Bar Donizetti, Farmacia Centrale | Funicolare · Cappella Colleoni | Michele Pezzotta, 51: funicular driver, doesn't sell tickets · Anna Santoro, 41: violinist at the chapel's concerts |
| Turin | 7 → 7 | — | — | — |
| Syracuse | 8 → 5 | Caffè Archimede, Farmacia Apollo, Gelateria Nettuno | Giudecca · Fonte Aretusa | Davide Levi, 64: historian of the Jewish quarter · Elena Ragusa, 29: fisherman's daughter from Ortigia |
| Genoa | 8 → 5 | Caffè degli Specchi, Farmacia Europa, Gelateria Profumo | Piazzetta di Boccadasse · Lanterna | Diego Vento (rename, e.g. Parodi), 71: fisherman · Andrea Colombo (rename), 55: lighthouse keeper |
| Lucca | 7 → 4 | Bar Il Fortino, Farmacia Massei, Libreria Baroni | Torre Guinigi · Duomo di San Martino | Alessio Martinelli, 26: looks after the oaks on the roof · Padre Augusto, 68: parish priest |
| Orvieto | 6 → 4 | Bar Duomo, Libreria del Duomo | Pozzo di San Patrizio | Matteo Galeotti, 28: runs the well's 248 steps every morning |
| Mantua | 7 → 5 | Bar delle Erbe, Farmacia Gonzaga | Palazzo Te · Palazzo Ducale | a Festivaletteratura volunteer (new person; police officer as fallback) · Marcello Andreoli, 43: custodian who opens the rooms each morning |

### Also added, to bring every city to 10–15 places (approved with the list; Rome stays at 17)

Josh: "the cuts are fine - we should rationalize what we are adding -- how many places per city total? 10-15 range"; "rome is fine - looks good". From the good hidden places only, all non-shops; left out: Casa di Giulietta (tourist cliché), the Capuchin catacombs (heavy), Orvieto's funicular and Taormina's cable car (ticket sellers), Sant'Andrea in Mantua (nobody written). These were already wanted on 2026-11-03 (docs/culture.md → Showing the places that carry the most culture: "add them, don't swap").

| City | After the swap list | Add | Total |
|---|---|---|---|
| Rome | 17 | — | 17 |
| Matera | 9 | Belvedere dei Sassi · Parco della Murgia | 11 |
| Florence | 10 | Ponte Vecchio (the jeweller as storyteller) | 11 |
| Siena | 11 | Torre del Mangia | 12 |
| Venice | 10 | Ponte di Rialto | 11 |
| Naples | 13 | Castel dell'Ovo | 14 |
| Bologna | 10 | Le Due Torri · Archiginnasio | 12 |
| Palermo | 9 | Teatro Massimo · Quattro Canti | 11 |
| Taormina | 8 | Villa Comunale · Terrazza dei Poeti | 10 |
| Lecce | 8 | Museo Faggiano · Anfiteatro Romano | 10 |
| Milan | 9 | Galleria Vittorio Emanuele II | 10 |
| Verona | 8 | Teatro Romano · Piazza dei Signori | 10 |
| Assisi | 7 | Eremo delle Carceri · Rocca Maggiore · Piazza San Rufino | 10 |
| Bergamo | 9 | Teatro Donizetti | 10 |
| Turin | 10 | Mole Antonelliana · Parco del Valentino | 12 |
| Syracuse | 9 | Neapolis archaeological park | 10 |
| Genoa | 9 | Via Garibaldi, the Palazzi dei Rolli | 10 |
| Lucca | 8 | Piazza San Michele · Orto Botanico | 10 |
| Orvieto | 8 | the Duomo · Teatro Mancinelli | 10 |
| Mantua | 9 | Parco di Palazzo Te | 10 |

Every person on an added place is recast where their role is generic (guide, gardener, priest, curator): someone who lives or works there, with a real local surname, a `here` line written the Mexican way, fact-checked, played at both levels before it's shown; shops (🛒) also pass the gate.

### Applied to `showcase.ts` (2026-11-06, not yet released)

All non-shop adds from both tables, and San Gregorio Armeno (the one shop already played: buying 6–11% of lines, like the landmarks). Kept shown after all, because each hosts a cultural lesson (Josh: "leave them"): Ristorante I Carracci (Bologna, ragù), Libreria del Mare and Osteria Ballarò (Palermo), Farmacia Prati (Rome), Libreria Matera, Tabaccheria Nesi (Florence). The Rusticceria Santa Croce and the Laboratorio Ceramiche went in after 5 Beginner openings each, none of which started selling. The Acetaia Veneta stays hidden: vinegar isn't Verona's (balsamic is Modena's). The park beside Palazzo Te went in after all (Josh: "seems uptight"). Every new person's line is fact-checked; batch 1–2 lines rewritten without their stories the same day (Josh: "just use what we have", the T1 decision).

## Where things stand

- Live on `main`: A (Beginner errand is a turn or two), the bar rules (order, own place's ways), receipts at five bars, and Italy's four Mexican-style lines (Ditta Artigianale, Bar Rita, Farmacia Molteni, Farmacia Centrale Verona; Bar Nilo without "talk football").
- Step 0 done: the reference gate recorded (`docs/prompt-trials.md`); the threads code removed, never merged.
- Next: step 1 (Josh's call on the swap list) and step 1b (a draft pair of new places per Mexican city for Josh).

## Verification

- The gate (`COUNTRY=it|es-mx npx tsx --env-file=.env.local tests/experiments/variety.mts <label>`, `PLACES=ref` for the references, `LEVELS=Beginner` for Beginner-only changes): a step is kept only if no level falls below the baseline noise and its target measure moves beyond it; a row in `docs/prompt-trials.md` each time.
- `npx tsc --noEmit`, `npm run test:today`, `test:prompt`, `test:weather` after code changes.
- After each push: `node scripts/deploy-wait.mjs <sha>` from `~/fuori`, then `npm run smoke:live` and `COUNTRY=es-mx npm run smoke:live`.
- Josh's play on the phone is the last check.

---

# Earlier versions (the record)

## The first plan (2026-11-06, morning)


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
