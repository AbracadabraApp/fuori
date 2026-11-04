# Culture

2026-11-03 · Josh · Draft for review: ideas from a brainstorm with Josh, nothing built yet. What's decided is marked (Josh); everything else is a proposal.

**Culture is an overall goal for both countries (Josh, 2026-11-03).** The learner should come away knowing what makes each city itself: its food and why it's made that way, its history, its traditions and legends, its art, and what it thinks of the next town. This doc covers both Italy and Mexico; the examples are mostly Italian because Italy was audited first.

Two ideas carry it:
- **Local pride** (the main one, most of this doc): every character cares about one part of their city's culture and is proud of it.
- **Weather** (separate, below): the city's real weather, which is always happening wherever the learner is.

## Culture comes from the settings (Josh, 2026-11-04)

**The lesson: "increase culture by increasing cultural settings."** Not by adding to every character's prompt. Measured in Rome on 2026-11-04 (laptop session; simulated learners, the real turn code):
- **A pride line for everyone** ("What you care about: …", 14 Rome people, fact-judged) barely raised culture in ordinary visits (5–7% of character lines to 7–17%) and took from the errand (about 68% to 59–61%); the forced lines were at errand places (Pasolini dropped into a correction at the tabaccheria). Written as a situation, it was played as today: Luisa announced yesterday's derby and once invented the score. Rewritten as standing facts, the invented news went (0 of 16) but it still added little. **Dropped** (Josh: "I think pride is a dead idea").
- **`knows`** (three planted pairs, and "X has mentioned them to you"): in 38 conversations no character mentioned anyone they knew. **Dropped** (Josh: "take it out").
- What worked was already there: `here`, the scene the character is in. The best lines put the culture inside the work (Dario's pizza bianca cut with scissors, Mirella's hand-shaved ice).

**Places, in three kinds** (Rome sorted 2026-11-04; Josh moved the trattoria to cultural):
- **Transactional** (5 in Rome: two bars, the tabaccheria, the pharmacy, Termini): the errand leads; culture in passing, as their `here` lines already do.
- **Cultural** (6: Trattoria Da Nino, the Pantheon, Il Gesù, the forno, Volpetti, the grattachecca kiosk): the place is particular to the city, and its `here` says what's particular about it. A place that serves or makes the city's own food, the way it's done there, counts.
- **Open** (3: Villa Borghese, the tram stop, the Sapienza steps): no errand, so the story can lead. These get the thickest `here`: the character pursues a cultural interest of their own (history, art, music, food, travel, folklore), not tied to the spot, and gets talking about it ("When someone sits down on your bench, you get talking about the park and its history"). Josh: "I want the culture to come up".

**The test for a `here` line** (Josh, 2026-11-04): something very particular to Italy (or Mexico) that a local would talk about: its folklore, religious traditions, food, history, art. Not just day-to-day or material detail (a ticket to validate, a list of products), and not atmosphere. Standing facts only, never "tonight" or "today"; checked by the fact judge (`content/<country>/prompts/facts.md`, `scripts/fact-check.mts`).

**Mexico: evaluate before changing anything** (Josh, 2026-11-04: "Mexico's characters already do a good job with cultural topics - we should evaluate the differences before changing here in Mexico"). Rome's rewrite is not a template for Mexico; compare first.

**More cultural and open places** carry the rest: the four drafted from old Rome (all cultural or open), and the particular places listed below under "Showing the places that carry the most culture".

## Decisions (Josh, 2026-11-03, with the cloud session)

- **No new rules in the character prompt.** Characters get facts, not instructions. How and when they bring their pride up is left to them, as the prompt's principle says ("describe the situation, not how to talk").
- ~~**Each character gets a pride field**~~ (dropped 2026-11-04, see above), reusing `caresAbout` (empty and unread today; see Open questions for what uses it). It holds:
    - what they care about and why;
    - the one or two words it turns on;
    - who else in the city knows something ("Gino at the salumeria: mortadella"). Proposed: this becomes `knows` (below), one list of people for both.
- **The rest comes from what exists, or from code:**
    - Memory: the end-of-conversation notes (`content/it/prompts/memory.md`) record what the learner asked about and anything promised, so a character can pick a topic up next time. What the character *told* the learner isn't on the memory prompt's list; check this in a test before relying on it.
- ~~**Pride items are written from each city's unused lists**~~ (dropped with pride; the lists also proved generic) (`food`, `customs`, `localTouches`) and checked by judges, including a fact judge; no human proofreading.
- **Rome first.**

## Local pride

Every character cares about one part of their city's culture and is proud of it: a dish and why it's made that way, a legend, a painting, a festa, or the town down the road that gets it all wrong. The learner learns a city's culture from the people who care about it, one person at a time, in the language.

It answers Josh's ask to "thicken the game's awareness of culture, tradition, geography: what makes each city unique". It follows the existing rules: characters teach in role, never like a teacher with a lesson plan ([CLAUDE.md](../CLAUDE.md)); nothing scripted, the character only knows what it cares about and the conversation goes where it goes.

**What the learner learns** (the goal is to learn the country, its language and its culture: Josh, 2026-11-04):
- **The country itself, enough to talk about it**: why mortadella has pistachios, what the hypogeum was, why there's no salt in Tuscan bread, what goes into a mole. Something to bring up with the next person ("Hai visto i mosaici?").
- **The map**: what grows where, which towns are rivals, what the sea, the lakes or the mountains do to a city.
- **The language that comes with it**: dish and ingredient names, local words (*daje*, *babbo*; *chido*, *padre* in Mexico), weather words that belong to a region (scirocco, bora, nebbia), and the grammar these talks need (comparatives from campanilismo, the imperative from a recipe, the past from legends and history).

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

Teaching wins, and a Beginner can't follow a story in the language. Beginner characters already speak in parts: a sentence or two of spoken English to set the scene, then the words that matter in the language ([CLAUDE.md](../CLAUDE.md), `lib/beginner.ts`). The culture goes in those parts: the story in English (why mortadella has pistachios), then the word it turns on in the language (*la sfoglia*). Intermediate and Advanced hear it in the language.

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

**Mexico (2026-11-03):** 5 cities, 60 shown people, every one with a line (the 5 language schools are Magda's and hidden from the app since 2026-10-27). Rivalries to draw on: chilangos, regios and tapatíos; Puebla and its mole poblano against Oaxaca's seven moles.

**Quality (Claude's reading of all 60, 2026-11-03, laptop session):**
- **Strong, about 22:** a specific thing with a story. Pancho Villa's bullet hole at La Ópera; the tamalero's recorded call and the guajolota; birote, "the only bread for tortas ahogadas"; the tumbagón that tells if your partner is faithful; La Alborada in San Miguel; the sinking cathedral; mezcal with sal de gusano; the cempasúchil on a Día de Muertos altar.
- **A menu, about 5:** Doña Chuy, Doña Chelo, the Puebla dulcería, Doña Lupe's quesadillas.
- **A job, little culture, about 33:** all five bus-ticket sellers (routes and times only); the baristas of Condesa, Guadalajara and San Miguel; the dog walker, the taxi driver, the student, the corner shops, a sacristana, two of the three boleros.
- **By topic:** food even more dominant than in Italy; history 3 (the cathedral, La Ópera, the Alameda), folklore 4–5, art and craft 4, campanilismo 1 (Puebla's Doña Tere: "Puebla is where mole was born"; Oaxaca's Doña Tere has the seven moles, and neither knows the other).
- **Repeats:** café de olla in four cities' cafés, the generic "Mexican café" line. Two places are both "Fonda Doña Tere" (Oaxaca and Puebla).
- **Missing reasons that would make good lines:** Puebla's tacos árabes came with Lebanese families (and led to al pastor); each ticket seller could be proud of one trip from their city (Tequila from Guadalajara; the Guelaguetza is already in Oaxaca's).

**Names (Josh, 2026-11-03: "unique full names - parts can repeat"; done, 33c519f):** every shown person in Mexico has a given name and a surname, in the form players know (Don Nacho Vásquez, Vale Ortiz, Chuy Haddad at the tacos árabes); ids kept, so portraits and memories carry over; `npm run test:names` checks it. About 20 are nicknames (Chema for José María, Toño, Memo, Nacho, Chucho and Chuy, Lalo, Chela, Chelo, Concha, Cuca, Lupe, Tere, Beto, Vale), but no line says the given name behind one. Characters already use diminutives on their own (about one line in five: *ahorita, poquito, calientito, picosita*); vendors call the learner *güerita* (real market talk, but it assumes how the learner looks). Italy isn't checked yet: Mirella, Nonna Assunta, Rosaria, Gennaro, Totò and Andrea have no surname, and Sandro Pieri and Dario Ferri are in both Romes.

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

## Showing the places that carry the most culture (Josh, 2026-11-03: add them all)

Each city's file has 30–40 places but the app shows about 10 (`content/it/showcase.ts`); many of the hidden ones are the city's strongest local pride, with a person already written. **Add them, don't swap** (Josh). Each still needs a pride line, the fact judge, and a picture in the city's current style. Left out: people guiding tourists, places with nobody there, and the kinds hidden on purpose (bakeries, wine bars, language schools).

**Storytellers first, not salespeople (Josh).** In Florence the jeweller and the leather craftsman were "lame experiences because they acted just like a vegetable salesperson" ("how often do you buy jewelry or leather goods?"). Their prompt put them in a shop, so the learner became a customer. These characters are storytellers first, and not hawkers of the city's stereotypes. Done with facts, not rules:
- **Their `here` line says they're working, not selling**: at the bench resizing a ring, stitching, painting a mask; people come in to watch and talk, nobody's expected to buy.
- **Their pride is a story, not the stereotype**: the jeweller tells why the Medici put goldsmiths on the Ponte Vecchio in place of the butchers, not "Florence is famous for gold".
- **Played before done**: a conversation that opens with "Cosa desidera?" or a price fails.

**Tipico, not stereotypical (Josh).** *Tipico* is what people there live (the sfoglina making Sunday's tortellini, lampredotto at lunch); a stereotype is what a visitor expects to find (Florentine leather, Venetian masks). A better storyteller doesn't fix a stereotype. Test: would a local go there, or talk about it, in an ordinary week, and would they be proud of it or roll their eyes? Must-see landmarks fail it too (Josh: "that's what I don't love about needing the Duomo or Lucca's walls"). Dropped for this: the Ponte Vecchio jeweller, the Scuola del Cuoio, the Venetian mask maker, the Capuchin catacombs, Juliet's house. Borderline places stay unless there's a strong substitute (Josh).

**First-screen cities** (6 places, plus Rome's four drafted):

| City | Add | Who |
|---|---|---|
| Bologna | Sfoglia Rina | the sfoglina |
| Bologna | Le Due Torri | the historian |
| Napoli | Via San Gregorio Armeno | the nativity-scene craftsman |
| Palermo | Cappella Palatina | the art historian |
| Siena | Antica Drogheria Manganelli | the owner (panforte) |
| Matera | Casa Grotta di Vico Solitario | the museum guide |
| Roma | Piazza Navona, Piazza Santa Maria in Trastevere, the basilica, the Colosseo | drafted (see Rome) |

**Cities after "Mostra altro"** (12 places): Lecce, Museo Faggiano (the owner who found the city under his house); Taormina, Ceramiche Siciliane d'Arte (the *teste di moro*); Siracusa, Antica Giudecca (the historian); Genova, Focacceria Genovese (a city specialty, like the pastry shops kept) and La Lanterna (the keeper); Milano, the Duomo (the priest); Assisi, the Basilica di San Francesco (the friar); Bergamo, Teatro Donizetti (the conductor); Torino, Museo dell'Automobile (the curator); Lucca, the Duomo (the Volto Santo); Orvieto, the Duomo (the priest); Mantova, Palazzo Te (the art historian).

**More hidden places, of kinds left out above** (markets, parks; Josh: add): Siracusa, Parco Archeologico della Neapolis (an archaeologist: the Greek theatre); Firenze, Giardino di Boboli (the head gardener: the Medici gardens); Matera, Parco della Murgia (the ranger: the cave churches facing the Sassi); Palermo, Mercato del Capo (the cheese seller: a working neighbourhood market, in place of the Vucciria, now mostly nightlife); Assisi, Frantoio Assisi (the olive-oil maker: the November harvest); Torino, Mercato del Balon (the antiques dealer: the old flea market).

**Hidden places whose person is a tour guide** (Josh: fine to change): recast as someone who lives or works there, the way the Colosseo got Serena: the Arena di Verona, the Teatro Antico in Taormina, Castel dell'Ovo, the Belvedere dei Sassi in Matera, the Mole Antonelliana. A preference, not a rule: Rome's Matteo is a part-time guide (Josh's wording) and works; the learner isn't a tourist, and a guide's job is to treat them as one.

**Famous places with nobody there** (the Duomo in Florence, San Marco, the Martorana, Palermo's cathedral, Brera): dropped, must-sees (Josh).

**Waiting (Josh): important things not in the files at all**: a contrada in Siena, a glass furnace on Murano, the Maradona mural in Naples (Lucca's walls and La Scala dropped as must-sees); in Mexico, Rivera's murals at the Palacio Nacional, mariachi in Guadalajara, lucha libre at the Arena México.

**Mexico** shows nearly everything already; two hidden places add culture: Panadería El Trigal (Oaxaca) and La Gran Fama on Calle de los Dulces (Puebla).

## In an ordinary visit the errand leads (Josh)

"The weather and the culture shouldn't dominate getting a slice of pizza." In an ordinary visit the errand is the conversation; culture and weather are at most a passing line. Only a cultural lesson puts the story first.

## Tests (2026-11-03)

**Cultural items and lessons** (`tests/experiments/culture-lesson.mts`): one call, with no city lists, picked six items for Rome from its shown people, each with its teller; all six passed the fact judge, and they were tipico (the quinto quarto, gnocchi on Thursday, Il Gesù's ceiling, romanisti and laziali, the Festa de' Noantri, the Palazzaccio; the last is the weakest). Two played as lessons: the personal questions work ("Hai mai mangiato la trippa?"), the Beginner version works (story in English, *Palazzaccio* said back), but the turns were too long for Intermediate (80–90 words, dates). Shop business stayed in the background (2 of 17 sentences). Next: four or five shorter turns, dates only when they're the point.

**Ordinary visits with an errand** (`tests/experiments/errand-leads.mts`): 6 Rome characters × 4 versions of their setting × 2 simulated learners, real turn code, Intermediate path only.

| Character's prompt | Errand | Culture | Weather | Errand done |
|---|---|---|---|---|
| Today's | 65% | 14% | 0% | 10/12 |
| + pride line | 56% | 19% | 3% | 11/12 |
| + weather line (heavy rain) | 60% | 8% | 8% | 11/12 |
| + both | 54% | 14% | 16% | 10/12 |

- The errand leads in every version.
- Pride barely changes ordinary visits: characters mostly ignore it (Sandro never raised football); most culture came from the curious A2 learner asking, as it does today.
- Weather is in all 24 openers with the line ("Entra pure, che fuori diluvia"): natural each time, but everyone says it. The two filters fix it: on a rainy day in this sample only Mirella's kiosk is outdoors.
- Limits: Beginner dialogue not tested; 6 characters; the A2 learner is written to ask about the neighbourhood.

**Transcripts:** [Rome's cultural items and two lessons](research/culture/2026-11-03-rome-cultural-lessons.md), [48 ordinary visits](research/culture/2026-11-03-rome-ordinary-visits.md) (simulated learners only).

**The two prompts the build would start from** (word for word from `culture-lesson.mts`; `{city}` and the like are filled in by the script):

The item picker, one call per city, given the city's shown people (id, name, age, role, where):
```
You help make a language-learning game set in today's {city}. A newcomer who has come to live there learns its culture from its people. Below are the people the newcomer can meet. Pick 6 cultural items for the city, each told by one of these people, spread across food, history, folklore and traditions, art, and rivalry with other towns or neighbourhoods (campanilismo).

Each item is one particular thing, small enough to tell in two minutes: one story, one reason. It must be tipico, not a stereotype: something people who live here would talk about in an ordinary week and be proud of, not what a visitor expects (no "Rome is famous for…", no must-see landmarks for their own sake). Only well-known facts you're sure of. Pick the teller it fits: their place, their role, their age.

For each item: chip (its name, at most four English words, that fits only this thing), teller (the person's id), topic, facts (three or four sentences: the story and the reason, in English), words (one or two Italian words worth keeping, with their English).
```

The teller's brief for a cultural lesson:
```
You are {name}, a {age}-year-old {role} in {city}, at {where}. A newcomer who now lives in {city} and is learning Italian has asked you about "{chip}". What you know about it: {facts}
Beginner: They're a Beginner: tell the story in simple spoken English, and say the Italian words ({words}) in Italian as they come up, so they can say them back.
Intermediate: They're an Intermediate learner: tell it in simple Italian they can follow.
Tell it in three short turns, the way someone who loves it would. End each of the first two turns with a personal question about their own experience, like "Have you ever…?", never a quiz. The third turn finishes the story with the word worth keeping and says goodbye, with no question.
Respond with JSON: { "line": what you say, "en": English translation }
```
Not yet language-neutral: "Italian" and "Rome is famous for…" are written in; a shipped version takes them from `content/<country>/language.ts` (`npm run test:language`).

**What it suggests (proposals):** pride first in cultural lessons, not in ordinary visits (keeping `here` as it is there); items generated by Claude per city in one call, with no city lists (the lists are generic, written by the city generator on 2026-10-10), then judged; the weather line only with both filters.

## Proposals

*Superseded on 2026-11-04 by "Culture comes from the settings" above: pride is dropped; 2, 3 and 5 live on as thicker `here` lines for open and cultural places.*

1. **Every shown character owns one or two things,** in their pride field (decided above): a specific thing from one topic, the reason behind it, and the words it turns on. `here` stays what it is: why they're at that place. Each item has one owner in the city, so topics spread across people and the learner has reasons to visit different ones.
2. **Raise the weak lines to that standard**, menus and job-only lines first, starting with Rome.
3. **Give the weak roles campanilismo** (Josh): pharmacists, baristas, people at stops, pensioners; between cities everywhere, between neighbourhoods in Rome, Siena and Venice.
4. **Use the city lists** (decided): write each city's pride items from its `food`, `customs` and `localTouches`, so the material in the files reaches the characters.
5. **Balance the topics per city**: today it's mostly food; aim for every city to have someone for history, traditions, art and campanilismo among its shown places.
6. **Facts are checked by a judge**, not a person (Josh: no human proofreading, as for lessons, [lesson-judges.md](lesson-judges.md)): a narrow fact judge on the lesson judges' pattern that fails any claim it can't confirm. Standard: well-known facts only. Same bounded pass: write, judge once, fix failed lines, recheck once, drop what still fails.
7. **Both countries the same way** (Josh: culture is a goal for both): local pride is data, not code, and the prompt only gains the pride facts (no new rules). Mexico's five cities get the same pass; their lines are already nearly complete, so it's a quality and topic-balance pass, not a fill.

## Cultural lessons (brainstorm, 2026-11-03)

Lessons about a piece of culture, not about the language, in Learn. Learn's lessons are national, so this is one set per country; an ordinary character teaches each one as a conversation (no Magda). Shaped with another session; Josh's corrections below.

**Size (Josh):** "opera" or "neorealism" is too global for a 2–4 minute session; it comes out as a summary. Each chip is one particular thing. **Work backwards from the chip's name:** if it can't be named in about three words that fit only that thing, it's too broad. One story, one reason.

**Who teaches:**
- **A thing with a home city** → the shown character there whose pride it is (opera arrives as Verona's candles, not as "opera").
- **A thing that's particular but national** (la scarpetta, Ferragosto) → a shown retired character (Josh: "if retired characters are accessible they can teach"). Shown today: Italy, Ettore and Franca (Roma), Lorenzo (Firenze), Alberto (Matera, Siracusa), the nonna on Spaccanapoli (Napoli); Mexico, the retired doña on the Alameda (CDMX), the retired dons on Oaxaca's Zócalo and in Parque Juárez (San Miguel), the abuela in the Jardín del Carmen (Puebla).

**How it plays: mostly listening** (Josh: "not passing back and forth as much"). The character tells the story in two or three turns, and each turn ends with a personal question along the way (Josh): "Sei mai stato all'opera?", "Hai mai mangiato il guanciale?" Not a quiz: the questions a person telling you about their city would ask. The learner answers, the character carries on; the last turn ends the story, with no word to remember and nothing summed up (Josh: no "keeping" words, 2026-11-03). About 2–3 learner turns, 2–3 minutes. It uses the conversation screen as it is (the mic opens after each question), so nothing changes in the app.

**A fresh conversation each time, held to the facts** (not a fixed script: over-scripting has failed in good conversations). Beginners: mostly English, with the word or two in the language. Checked by the fact judge before it ships. About five chips per set, in their own tint, outside the lesson sets so they never block progress (from the other session).

**The chips (Josh, 2026-11-03: option B; mockup: canvas "Learn area" → G1 and G2, https://claude.ai/artifact/W9EnaGyLAU8TEh67LH6vHk):** sprinkled among the lesson chips in the areas of the gold Lessons field (Josh, 2026-11-03: "no separate culture section - I don't really care what section they fall into"), each with a faceted gem before its name. No Culture header or section, no count of their own. To do: pale teal (#e4f0ef, teal border #8cbfbf, dark teal text #12393d). Done: deep teal (#1d5c63, white text and gem), so a finished culture chip reads differently from a finished lesson (olive). Not counted in "N of M". Build notes: the teal pair becomes design tokens; the gem is an inline icon, hidden from VoiceOver, and the chip's label says "Culture: …".

**Candidate chips, Italy:**

| Chip | Topic | Teacher |
|---|---|---|
| Never spaghetti bolognese | food | Matteo, chef, Bologna |
| Cavour's table | history | Stefano, maître at Del Cambio, Torino |
| Coffee for a stranger | traditions | Carmine, Bar Nilo, Napoli (caffè sospeso) |
| Candles at the Arena | art | Moussa, violinist in Piazza Bra, Verona |
| Arancina, not arancino | campanilismo | Filippo, chef, Palermo |
| Venice's ombra | food | Marta, Al Timon, Venezia |
| Aperitivo hour | food | Antonio, Casa del Vermouth, Torino |
| One hand gesture | traditions | Carmine or the nonna, Napoli |
| The Befana | traditions | Tommaso, Piazza Navona, Roma (if Navona comes over) |
| The moka pot, la scarpetta, Ferragosto | national | a retired character |

**Candidate chips, Mexico** (teachers are shown; these stories aren't in their lines yet):

| Chip | Topic | Teacher |
|---|---|---|
| Chocolate on the stone | food | the molinera at Chocolate Mayordomo, Oaxaca |
| Nixtamal | food | the molinera or the tlayudera, Oaxaca |
| Allende's town / the Grito | history | the retired don in Parque Juárez, San Miguel |
| Radish night | traditions | the retired don on the Zócalo, Oaxaca |
| The Guelaguetza | traditions | the retired don on the Zócalo, Oaxaca |
| Talavera blue | art | Mateo, Café Cielo Rojo, Puebla |
| Alebrijes | art | Oaxaca (no shown maker yet) |
| Chilangos | campanilismo | Nacho, taquero, Guadalajara |
| Pan de muerto, lotería cards | national | a retired character |

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

## Other fields (brainstorm, 2026-11-03)

Prompted by `outdoors`: other facts on places and people that could matter. **The test (Josh): over-scripting has failed in good conversations.** A field describes who someone is or where they are; it doesn't script what they say.

**Candidates:**

| Field | On | What it is | What it teaches |
|---|---|---|---|
| `outdoors` | place | open air or inside | the weather line (above) |
| `from` | character | hometown when it isn't this city (today buried in `here`: "Your background: from Tirana") | campanilismo from inside: a Neapolitan vendor in Milan comparing the two |
| `formality` | character | tu or Lei for this person; exists, always "formal" today | the learner hears both: Lei from the pharmacist, tu from the student |
| `regionalisms` | character | how much local speech they use; exists, always empty | Gina speaks Roman and explains it; the pharmacist speaks standard Italian |
| neighbourhood line | place | one sentence about the quartiere | campanilismo inside a city |
| `nearby` | place | the places next door | directions vocabulary, a reason to walk on |
| `english` | character | how much English they really have | real people differ; would touch the rule that characters help in English when asked |

### `knows`: characters who know each other

*Built and measured in Rome on 2026-11-04 and dropped (see "Culture comes from the settings"): no character ever mentioned anyone they knew.*

**Why it matters (Josh):** most characters never mention other characters. Each one is alone in its prompt: Sandro's has Sandro, his bar and the learner, so as far as he knows nobody else in Rome exists.

**What it is:** one or two real people from the same city's file, each with a relationship and a line. Merged with the pride field's "who else knows something", so one list carries both:
- Sandro → Gina Proietti, Trastevere: "my late wife's sister; never stops talking"
- Gina → Don Paolo: "says Mass too fast"
- Mohamed → Claudio at Volpetti: "where the trattoria buys its guanciale"

**What the learner learns:** talking about other people: third-person verbs (*lui è, lei fa*), describing someone, gender agreement (*simpatico, simpatica*); relationship words (*cugino, vicina, cognata, un cliente*); directions when someone says where to find a person.

**What the game gets:** the city joins up; referrals come from people, giving reasons to go somewhere new; arriving at Gina's having heard of her from Sandro ("Sandro mi ha parlato di Lei") is what being a newcomer who belongs feels like.

**How:** links come from the city files, real characters only, and go both ways (if Sandro knows Gina, Gina knows Sandro). Generated, then judged for consistency, like the pride items. Facts, not rules: the character decides whether to mention anyone.

**Who mentioned you (Josh, 2026-11-03):** `knows` is the conduit. When the learner meets someone, the prompt adds a fact for each person on that character's `knows` list the learner has already talked to: "Sandro at Bar Angolo has mentioned you." Who, not what: no name, nothing the learner said. Worked out when the prompt is built from the visits already recorded (`character_memories`), so no shared memory is needed. The character decides whether to say "Sandro mi ha parlato di te".

**Not taken:** a general memory every character reads (name, where you live, how long you've been here, words you're learning, what's going on in your life). Josh: most of these break the game's rules or were tried before. Gender (`learners.addressed_as`) stays the only thing every character knows.

**Dropped:** `menu` (real items and prices): it scripts the conversation, and characters already get roughly right what their place sells. `pace` (quick counter or slow chat) leans the same way.

## Dropped in the brainstorm

- **Day trips: parked, nothing to do now (Josh).** Every city file has a `dayTrips` list (Bologna to Modena for balsamic vinegar, Napoli to Pompei) that no code reads. A character offering to take the learner there would be a day out of the city; left for later.
- a city calendar of feast days (Josh: "you have to be at the right place at the right time"), time of day and day of the week (Josh: "not going to hit most users"), anything in the Diario (it isn't built).

## Open questions

- ~~**Does local pride stay in `here`, or move to `caresAbout`?**~~ Moot: pride was dropped on 2026-11-04 and `caresAbout` stays unused. (Was decided: `caresAbout`, as the pride field.) What uses it today: `caresAbout` is free to use (checked 2026-11-03): it's on the character sheet (`lib/types.ts`), every city character gets it empty (`lib/characters/for-place.ts`), only Magda's two sheets fill it, no prompt reads it, and `tests/check-content-api.ts` keeps it out of what's sent to the app (`tests/check-turn-request.ts` uses it empty as test data). Using it means a small change to how the prompt is built, and gives tests and suggestions one place to look. The other option (from a review): a new `pride` field, so the fact judge and tests check it apart from the setting. Either way it's a separate field; the choice is the name.
- ~~**How the pride field reaches the prompt:**~~ (dropped with pride; built and removed 2026-11-04) one line of facts in the character prompt (a placeholder filled from `caresAbout`), with a version bump and changelog entry as `character.md` requires. Left out when empty, so characters without pride are unchanged.
- ~~**How it comes up**~~ Decided: no rules; the character has the facts and decides.
- **How the learner finds who knows what:** partly decided: characters know who else in the city knows something (`knows`), and lessons pick partners by topic. Daily suggestions could point at it too ("Ask the sfoglina how she rolls the dough").
- **Geography** beyond food and weather (the sea, the lakes, the mountains; day trips are parked): part of local pride, or its own topic?
- **Craft and sport** (football especially): topics of their own, or inside traditions and campanilismo?
- **The learner's route** for campanilismo between cities: the cities are in the conversation records; wiring them into the prompt is the open part.
- **How we'd know it works:** a judge in `npm run test:conversations` for "the learner heard something specific about this city", and that they followed it in the language and answered, alongside the existing scores.
- **Prompt length:** whichever field holds it, the culture reaches the prompt as one line, not a new block.
