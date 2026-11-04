# Culture

2026-11-03 · Josh · Draft for review: ideas from a brainstorm with Josh, nothing built yet. What's decided is marked (Josh); everything else is a proposal.

**Culture is an overall goal for both countries (Josh, 2026-11-03).** The learner should come away knowing what makes each city itself: its food and why it's made that way, its history, its traditions and legends, its art, and what it thinks of the next town. This doc covers both Italy and Mexico; the examples are mostly Italian because Italy was audited first.

Two ideas carry it:
- **Local pride** (the main one, most of this doc): every character cares about one part of their city's culture and is proud of it.
- **Weather** (separate, below): the city's real weather, which is always happening wherever the learner is.

## Decisions (Josh, 2026-11-03, with the cloud session)

- **No new rules in the character prompt.** Characters get facts, not instructions. How and when they bring their pride up is left to them, as the prompt's principle says ("describe the situation, not how to talk").
- **Each character gets a pride field**, reusing `caresAbout` (empty and unread today; see Open questions for what uses it). It holds:
    - what they care about and why;
    - one or two words worth keeping;
    - who else in the city knows something ("Gino at the salumeria: mortadella").
- **The rest comes from what exists, or from code:**
    - Memory: the end-of-conversation notes (`content/it/prompts/memory.md`) record what the learner asked about and anything promised, so a character can pick a topic up next time. What the character *told* the learner isn't on the memory prompt's list; check this in a test before relying on it.
    - Lessons pick practice partners by pride topic (code).
- **Pride items are written from each city's unused lists** (`food`, `customs`, `localTouches`) and checked by judges, including a fact judge; no human proofreading.
- **Rome first.**

## Local pride

Every character cares about one part of their city's culture and is proud of it: a dish and why it's made that way, a legend, a painting, a festa, or the town down the road that gets it all wrong. The learner learns a city's culture from the people who care about it, one person at a time, in the language.

It answers Josh's ask to "thicken the game's awareness of culture, tradition, geography: what makes each city unique". It follows the existing rules: characters teach in role, never like a teacher with a lesson plan ([CLAUDE.md](../CLAUDE.md)); nothing scripted, the character only knows what it cares about and the conversation goes where it goes.

**What the learner learns:**
- **Culture they can talk about**: why mortadella has pistachios, what the hypogeum was, why there's no salt in Tuscan bread, what goes into a mole. Something to bring up with the next person ("Hai visto i mosaici?").
- **Words that come with a place**: dish and ingredient names, local words (*daje*, *babbo*; *chido*, *padre* in Mexico), weather words that belong to a region (scirocco, bora, nebbia).
- **Grammar that comes up by itself**: comparatives and superlatives from campanilismo (*più buono di, meglio, il migliore*), the imperative from someone teaching a recipe (*taglia, metti, mescola*), the past from legends and history.
- **The map**: what grows where, which towns are rivals, what the sea, the lakes or the mountains do to a city.

### The five topics (Josh)

| Topic | What it covers | Who naturally owns it |
|---|---|---|
| **Food** | local dishes and their "why", eating rules, what's in season, where ingredients come from | bars, bakeries, markets, trattorie, gelaterie, delis, specialty shops (over half of all places) |
| **History** | the city's past, its buildings, what happened here | historians, custodians, archaeologists, librarians, students |
| **Folklore and traditions** | festas, patron saints, legends, customs, the passeggiata | priests, nuns, older locals, pilgrim guides, street musicians |
| **Art** | painting and architecture, and in the wide sense books, music and film (Josh: bookshops and libraries are "broadly cultural, not about books but what books are about") | curators, painters, craftspeople, priests (frescoes, mosaics), booksellers, librarians |
| **Campanilismo** | rivalry with the next town, and between neighbourhoods inside a city | the weak roles: the pharmacist, the barista, the person at the tram stop, the pensioner (Josh) |

Dropped: "stories" as a sixth topic (Josh: "dubious"); writers, songs and films sit under art.

#### Campanilismo

- **Between cities:** Bologna and Modena (*La secchia rapita*, the bucket Modena took in 1325), Siena and Firenze (Montaperti, 1260), Palermo and Catania (arancina or arancino), Lucca and Pisa, Verona and the rest of the Veneto (the old rhyme *"Veneziani gran signori, Padovani gran dotori, Vicentini magnagati, Veronesi tuti mati"*, in dialect: something a character quotes and explains, not words for the learner to pick up), Torino and Milano, north and south. Mexico: chilangos, regios and tapatíos.
- **Inside a city (Josh):** Rome's quartieri (Trastevere's *noantri*, Roma and Lazio), Siena's contrade (each has its rival), Venice's sestieri (Castellani and Nicolotti, who fought on the bridges).
- **Who:** characters whose role gives them little to say (Josh: "pharmacist, bar, person at bus stop") become the ones with opinions.
- **When:** leaving ("A Firenze? Portati il sale, il pane non ce l'hanno!"), arriving (where have you come from?), and any time the learner mentions another city or neighbourhood. Reacting to the learner's route needs the cities they've lived in: every conversation already stores its city, but no prompt reads it (and `citiesVisited` on `JourneyState` is never filled).
- **Tone:** teasing and affectionate, never mean.

#### Food

- **All food is local, and comes with some education** (Josh). Characters talk about their city's dishes, not generic Italian food, and say why.
- **Eating customs, as what people do**, never a correction of the learner (the lessons' rule: customs are described as what people do, with no warnings): the barista who stops making cappuccino after eleven and says why, the cook who never puts Parmesan on fish. The custom is the character's own habit and its reason.
- **Food is geography**: butter and rice in the north, olive oil in the south; pistachios from Bronte, buffalo mozzarella from Campania.
- **What's in season** at the market: the vendor says what's good this week and how to cook it.
- **Cooking**: a nonna or a cook teaches a dish step by step; the imperative in real use.

#### Beginners (from a review)

Teaching wins, and a Beginner can't follow a story in the language. Beginner characters already speak in parts: a sentence or two of spoken English to set the scene, then the words worth keeping in the language ([CLAUDE.md](../CLAUDE.md), `lib/beginner.ts`). The culture goes in those parts: the story in English (why mortadella has pistachios), then the one word worth keeping in the language (*la sfoglia*). Intermediate and Advanced hear it in the language.

## What exists today

### The `here` line is the only culture characters get

Each city character can have a `here` line (`lib/types.ts`, `CityCharacter.here`). `lib/characters/for-place.ts` adds it to the place's name and kind, and the result fills `{setting}` in the character prompt ("where I am"; `content/it/prompts/character.md`) and the Beginner prompt (`lib/beginner.ts`). Nothing else cultural reaches a character.

**Coverage, Italy (2026-11-03):** every shown place has one except Magda's 8 language schools (203 of 211). Across all characters, shown or not, 199 of 672 have one; the hidden ones have none.

**Quality (Claude's reading of all 199):** most are good and already local pride. The best give a specific local thing, its reason, and something the character would say:
- Palermo's meusaro: *"schietta o maritata?"*
- Torino: the bicerin *"must never be stirred"*
- Genova: *"pesto never goes near a blender"*
- Palermo's chef: *"arancine (with an e, here in Palermo)"*, correcting anyone who says arancini
- Venezia: why a coffee at a table at Florian costs more than at the bar
- Napoli: the caffè sospeso and the Maradona shrine at Bar Nilo

Weaker kinds:
- **A menu, not pride**: "You cook X: a, b, c" with no story (the chefs of Taormina, Lucca, Mantova, Orvieto).
- **A job, little culture**: some pharmacists, gardeners and station staff, whose lines are only logistics; in Rome, Ettore's bench by the lake and Daniele's concert.

**By topic:**

| Topic | Coverage in today's lines |
|---|---|
| Food | dominant: most lines |
| Folklore and traditions | decent: Festa della Bruna, Calendimaggio, the Palio, Santa Lucia, Sant'Oronzo, the passeggiata |
| History | some: Prati and 1871, Siena's university (1240), the Cassaro's Arabic name |
| Art | thin: Il Gesù's ceiling, Signorelli in Orvieto, Monteverdi in Mantova, Brunelleschi |
| Campanilismo | almost none: arancine against arancini is the only real rivalry |

**Mexico (2026-11-03):** 5 cities; every shown place has a line (60 of 65; the 5 without are the language schools), and 61 of 65 characters overall. Not yet read for quality; first impressions are local and specific (the tejuino cart by San Juan de Dios, mezcal with sal de gusano, Talavera cups in Puebla). Rivalries: chilangos, regios and tapatíos; Puebla and its mole poblano against Oaxaca's seven moles.

### City lists nobody reads

In both countries every city file has `food` (~15–29 dishes), `customs` (~7–15), `localTouches` (~5–15) and `dayTrips`. No code reads them. Bologna's, for example: *tirare la sfoglia*, "la dotta, la grassa, la rossa", the towers as symbols of medieval family power, the Portico di San Luca. They're the material local pride would draw from.

### Places and roles

21 Italian cities, 30–40 places each in the files, ~10 shown. Every city has nearly the same base (bars 122, bakeries 64, markets 62, landmarks 40, piazzas 36, churches 34, trattorie/osterie/ristoranti ~70, bookshops 21, pharmacies 21, stations 22), plus a few places only it has.

**Places only one city has** (in the files; most are hidden today):

| City | Places |
|---|---|
| Napoli | Via San Gregorio Armeno (nativity scenes), friggitoria, mozzarella shop, pizza a portafoglio, Spaccanapoli |
| Palermo | Capuchin catacombs, arancina shop, pani ca' meusa at Ballarò, focacceria, Cappella Palatina |
| Venezia | Squero San Trovaso (gondolas), mask maker, bacaro, spice merchant |
| Firenze | tripe and lampredotto stalls, the leather school, a goldsmith, the Santa Maria Novella pharmacy |
| Bologna | the sfoglina, the two towers, the Portico di San Luca, the Archiginnasio, Museo Morandi |
| Lecce | cartapesta workshop, rusticceria, the Roman amphitheatre |
| Torino | vermouth, chocolate, the car museum |
| Matera | the cave house, the cucù whistle maker, the view over the Sassi |
| Siracusa | papyrus workshop, the Giudecca, Fonte Aretusa |
| Genova | focacceria, the Lanterna, the Palazzi dei Rolli |
| Assisi | the Basilica of San Francesco, the Eremo delle Carceri, the olive mill |

Thinner (Siena has no contrada, Lucca's walls are only in bar names, Milano and Bergamo miss their best-known things): Josh, 2026-11-03: they don't need more right now.

**Example, Bologna's lists mapped to its people:** sfoglina → *tirare la sfoglia*; casaro → Parmigiano-Reggiano; salumiere → mortadella; storico → the towers; guida dei pellegrini → San Luca; sacerdote → San Petronio; studentessa → the oldest university; torrefattore → coffee standing at the bar; curatrice → nothing in the lists (art is thin).

### Rome (Josh, 2026-11-03)

- **Roma nuova is the only Rome.** The original `roma.ts` is retired: already hidden (no showcase list), kept in the data so memories survive.
- **Four places come over from it** (Josh): Piazza Navona and the street painter (art), Piazza Santa Maria in Trastevere and the nonna (traditions, Roman words), the Basilica di Santa Maria in Trastevere and the parish priest (mosaics, history), and the Colosseo with someone who isn't guiding tourists (history).
- **Drafted, not committed** (stopped for this review): the four places with the same ids (portraits and memory carry over) and new scenes; Serena Lupi, 36, archaeologist, at the Colosseo in place of the tour guide; `here` lines for all four in the local-pride style; campanilismo added to Ettore (a lifelong romanista from Testaccio), Daniele (friends who moved to Milan) and Marco (Pigneto against the centro). Place images and Serena's portrait not yet drawn.

## Proposals

1. **Every shown character owns one or two things,** in their pride field (decided above): a specific thing from one topic, the reason behind it, and the words worth keeping. `here` stays what it is: why they're at that place. Each item has one owner in the city, so topics spread across people and the learner has reasons to visit different ones.
2. **Raise the weak lines to that standard**, menus and job-only lines first, starting with Rome.
3. **Give the weak roles campanilismo** (Josh): pharmacists, baristas, people at stops, pensioners; between cities everywhere, between neighbourhoods in Rome, Siena and Venice.
4. **Use the city lists** (decided): write each city's pride items from its `food`, `customs` and `localTouches`, so the material in the files reaches the characters.
5. **Balance the topics per city**: today it's mostly food; aim for every city to have someone for history, traditions, art and campanilismo among its shown places.
6. **Facts are checked by a judge**, not a person (Josh: no human proofreading, as for lessons, [lesson-judges.md](lesson-judges.md)): a narrow fact judge on the lesson judges' pattern that fails any claim it can't confirm. Standard: well-known facts only. Same bounded pass: write, judge once, fix failed lines, recheck once, drop what still fails.
7. **Both countries the same way** (Josh: culture is a goal for both): local pride is data, not code, and the prompt only gains the pride facts (no new rules). Mexico's five cities get the same pass; their lines are already nearly complete, so it's a quality and topic-balance pass, not a fill.

## Weather

Kept (Josh: "weather is always happening wherever you are"). **People talk about it; nothing on screen** (cloud session, 2026-11-03): no overlay, no card, nothing added to the iPhone app. Weather matters only if it gets the learner talking.

**What the learner learns:** the weather words textbooks teach early (*fa caldo, piove, c'è nebbia, tira vento*), heard again and again in real use, and a region's own words (scirocco in Sicily, nebbia in the Po valley).

**How it would work:**
1. **Once a day per city** the server fetches the forecast from Open-Meteo (free, no key, free tier for non-commercial use) and keeps it for the day.
2. **One line goes into the setting of the characters it touches**: "Today in Bologna: rain, high of 14°C, wind from the northeast." A fact, not an instruction, so no rule about bringing it up. Two filters in code, so not everyone talks about the weather (Josh's worry, 2026-11-03: "everyone will talk about the weather"):
    - **Only weather worth mentioning:** rain, a storm, fog, heat, the first cold day, a strong wind. Mild ordinary weather gets no line, so on many days nobody hears about it. Decided from the forecast's numbers (rain, wind, temperature against the season's normal), which works in any language.
    - **Only characters the weather touches:** people who work outdoors or on the street (the market, the gelateria, the tram stop, a kiosk, a piazza or a park). Inside a pharmacy or a church nobody gets the line; the learner can still bring it up.
    - **What that means in Rome** (counted 2026-11-03): 6 of the 14 shown places are outdoors (the grattachecca kiosk, the Sapienza steps, the Pantheon's fountain steps, Il Gesù's steps, Villa Borghese, the tram stop); with the four drafted places, 9 or 10 of 18. Rome's new cast leans to open places, so on a notable day about half of Rome could mention it. Notable weather does most of the filtering; the replay measure decides whether that's too many.
    - **A place's kind doesn't say who's outdoors:** Franca's place is a church, but she stands on its steps. Proposed: an `outdoors: true` flag on each place in the city files, set when the place is written.
    - **Open:** whether to narrow it further (for example to the most exposed of those people) or wait for the replay.
3. **Characters mention it when it fits.** Regional words come from them reading the real weather for their city.
4. **The next day:** memory notes save plans, promises and personal things, not the weather, so "yesterday's storm" only carries over when it became part of the conversation (getting soaked, a plan rained off). Check in a test.
5. **If the fetch fails** the line is left out and the failure is logged; characters never guess the weather.
6. **Measure before shipping:** replay real conversations with the weather line and count how often it comes up; aim for about one conversation in four on a day with notable weather. Too often → tighten the filters, never the prompt.

If weather is ever shown on screen, it would go in the city's daily suggestions ("Rainy today: a good day for the bookshop"). Those aren't built: `Suggestion` exists only as a type in `lib/types.ts`, and the app shows no daily suggestions today.

## Dropped in the brainstorm

- a city calendar of feast days (Josh: "you have to be at the right place at the right time"), time of day and day of the week (Josh: "not going to hit most users"), anything in the Diario (it isn't built).

## Open questions

- ~~**Does local pride stay in `here`, or move to `caresAbout`?**~~ Decided: `caresAbout`, as the pride field. What uses it today: `caresAbout` is free to use (checked 2026-11-03): it's on the character sheet (`lib/types.ts`), every city character gets it empty (`lib/characters/for-place.ts`), only Magda's two sheets fill it, no prompt reads it, and `tests/check-content-api.ts` keeps it out of what's sent to the app (`tests/check-turn-request.ts` uses it empty as test data). Using it means a small change to how the prompt is built, and gives tests and suggestions one place to look. The other option (from a review): a new `pride` field, so the fact judge and tests check it apart from the setting. Either way it's a separate field; the choice is the name.
- **How the pride field reaches the prompt:** one line of facts in the character prompt (a placeholder filled from `caresAbout`), with a version bump and changelog entry as `character.md` requires. Left out when empty, so characters without pride are unchanged.
- ~~**How it comes up**~~ Decided: no rules; the character has the facts and decides.
- **How the learner finds who knows what:** partly decided: characters know who else in the city knows something (the pride field), and lessons pick partners by topic. Daily suggestions could point at it too ("Ask the sfoglina how she rolls the dough").
- **Geography** beyond food and weather (the sea, the lakes, the mountains, `dayTrips`): part of local pride, or its own topic?
- **Craft and sport** (football especially): topics of their own, or inside traditions and campanilismo?
- **The learner's route** for campanilismo between cities: the cities are in the conversation records; wiring them into the prompt is the open part.
- **How we'd know it works:** a judge in `npm run test:conversations` for "the learner heard something specific about this city", and that the learner kept a word from it (a language goal, not trivia), alongside the existing scores.
- **Prompt length:** whichever field holds it, the culture reaches the prompt as one line, not a new block.
