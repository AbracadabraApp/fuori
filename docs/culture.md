# Culture

2026-11-03 · Josh · Draft for review: ideas from a brainstorm with Josh, nothing built yet. What's decided is marked (Josh); everything else is a proposal.

**Culture is an overall goal for both countries (Josh, 2026-11-03).** The learner should come away knowing what makes each city itself: its food and why it's made that way, its history, its traditions and legends, its art, and what it thinks of the next town. This doc covers both Italy and Mexico; the examples are mostly Italian because Italy was audited first.

Two ideas carry it:
- **Local pride** (the main one, most of this doc): every character cares about one part of their city's culture and is proud of it.
- **Weather** (separate, below): the city's real weather, which is always happening wherever the learner is.

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

- **Between cities:** Bologna and Modena (*La secchia rapita*, the bucket Modena took in 1325), Siena and Firenze (Montaperti, 1260), Palermo and Catania (arancina or arancino), Lucca and Pisa, Verona and the rest of the Veneto (*"Veneziani gran signori, Padovani gran dotori, Vicentini magnagati, Veronesi tuti mati"*), Torino and Milano, north and south. Mexico: chilangos, regios and tapatíos.
- **Inside a city (Josh):** Rome's quartieri (Trastevere's *noantri*, Roma and Lazio), Siena's contrade (each has its rival), Venice's sestieri (Castellani and Nicolotti, who fought on the bridges).
- **Who:** characters whose role gives them little to say (Josh: "pharmacist, bar, person at bus stop") become the ones with opinions.
- **When:** leaving ("A Firenze? Portati il sale, il pane non ce l'hanno!"), arriving (where have you come from?), and any time the learner mentions another city or neighbourhood. Reacting to the learner's route needs the cities they've lived in; today characters don't know it.
- **Tone:** teasing and affectionate, never mean.

#### Food

- **All food is local, and comes with some education** (Josh). Characters talk about their city's dishes, not generic Italian food, and say why.
- **Eating rules, corrected in character**, the way language mistakes are recast: no cappuccino after lunch, no Parmesan on fish, don't cut the spaghetti ("Ma no! Il cappuccino a quest'ora?!"), with the reason.
- **Food is geography**: butter and rice in the north, olive oil in the south; pistachios from Bronte, buffalo mozzarella from Campania.
- **What's in season** at the market: the vendor says what's good this week and how to cook it.
- **Cooking**: a nonna or a cook teaches a dish step by step; the imperative in real use.

## What exists today

### The `here` line is the only culture characters get

Each city character can have a `here` line (`lib/types.ts`, `CityCharacter.here`). `lib/characters/for-place.ts` adds it to the place's name and kind, and the result fills `{setting}` in the character prompt ("where I am"; `content/it/prompts/character.md`) and the Beginner prompt (`lib/beginner.ts`). Nothing else cultural reaches a character.

**Coverage, Italy (2026-11-03):** every shown place has one: 203 of 211, the 8 without are Magda's language schools. Across all characters, shown or not, 199 of 672 have one; the hidden ones have none.

**Quality (Claude's reading of all 199):** most are good and already local pride. The best give a specific local thing, its reason, and something the character would say:
- Palermo's meusaro: *"schietta o maritata?"*
- Torino: the bicerin *"must never be stirred"*
- Genova: *"pesto never goes near a blender"*
- Palermo's chef: arancina *"with an e, here in Palermo"*
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
| Campanilismo | almost none: arancina "with an e" is the only real rivalry |

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

1. **Every shown character owns one or two things.** Written into their `here` line: a specific thing from one topic, the reason behind it, and the line they'd say. Each item has one owner in the city, so topics spread across people and the learner has reasons to visit different ones.
2. **Raise the weak lines to that standard**, menus and job-only lines first, starting with Rome.
3. **Give the weak roles campanilismo** (Josh): pharmacists, baristas, people at stops, pensioners; between cities everywhere, between neighbourhoods in Rome, Siena and Venice.
4. **Use the city lists**: write each city's `here` lines from its `food`, `customs` and `localTouches`, so the material in the files reaches the characters.
5. **Balance the topics per city**: today it's mostly food; aim for every city to have someone for history, traditions, art and campanilismo among its shown places.
6. **Facts are checked** before they ship: lines are generated, someone who knows the place (Josh, or a native speaker) reads them once. Well-known facts only.
7. **Both countries the same way** (Josh: culture is a goal for both): local pride is data, not code, so nothing changes in the prompts. Mexico's five cities get the same pass; their lines are already nearly complete, so it's a quality and topic-balance pass, not a fill.

## Weather

- **Kept** (Josh: "weather is always happening wherever you are"): the city's real weather as one line in the prompt; characters bring it up, remember it the next day, and use the region's weather words. Free source: Open-Meteo, server-side. Its own doc when built.

## Dropped in the brainstorm

- a city calendar of feast days (Josh: "you have to be at the right place at the right time"), time of day and day of the week (Josh: "not going to hit most users"), anything in the Diario (it isn't built).

## Open questions

- **Does local pride stay in `here`,** or get its own field (`pride`, or the empty `caresAbout` on the character sheet; check what uses it first)? A separate field would let tests and suggestions see it.
- **How it comes up:** does the character bring their topic up unprompted, or only when it fits? The character prompt says "describe the situation, not how to talk", so the line describes what they care about and leaves the rest to them.
- **How the learner finds who knows what:** daily suggestions could point at it ("Ask the sfoglina how she rolls the dough").
- **Geography** beyond food and weather (the sea, the lakes, the mountains, `dayTrips`): part of local pride, or its own topic?
- **Craft and sport** (football especially): topics of their own, or inside traditions and campanilismo?
- **The learner's route** for campanilismo between cities: characters would need the cities the learner has lived in.
- **How we'd know it works:** a judge in `npm run test:conversations` for "the learner heard something specific about this city", alongside the existing scores.
