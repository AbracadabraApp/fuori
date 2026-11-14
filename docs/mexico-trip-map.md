# Mexico: the trip map and the terminal

2026-11-11 · the cloud chat session's plan, at Josh's request ("spec out your plan for Mexico Map and Station changes"). Nothing here is built or decided by Josh yet, except where his words are quoted. Italy's version: docs/station-feature-decision.md → Board, map, city.

## Where Mexico stands

The station path is one piece of code for both countries, so Mexico already has it: terminal card → departures board → ticket sheet → city. Its words and colours come from content (`Andén`, `Destino`, `Súbete`, `Estás aquí`; the bus ticket's own colours). All ten cities have a terminal and trip facts for all 45 pairs.

What Mexico lacks is pictures. With no map, `/v1/content` sends `travelMap: null`, so the board's rows have no buildings and the ticket sheet shows the ticket alone at half height.

## What to make

**1. One map with no cities on it.** The app draws the names, the two ends of the trip and the route, so no name can be misspelled or misplaced (the lesson from Italy's first ten maps).

- **The whole country** (changed after Josh sent eight reference maps, 2026-11-11: every one shows all of Mexico, Baja and the north included). The outline is what makes it read as Mexico, the way the boot does for Italy; the first plan, cropping to the centre and south, loses it.
- **Look: open.** Josh on his references: "just some ideas - no rules". So step 1 is a spread of looks for him to pick from by eye, not one look. The soft flat one below is one of them: a modern illustrated tourist map, cream and soft-coloured land with the states lightly tinted in different colours, a clear blue sea, a few small landscape drawings (volcanoes, cactus, a pyramid, boats, a whale). He sent the soft flat "tourist map" one twice. Not from the references: the mariachi in a sombrero, lucha masks, sugar skulls and food piled on the land; that is the stacking Josh called caricature the same evening.
- **Shape:** landscape, 3:2. The sheet takes any shape (`aspect` in `travel-map.json`); a wide map makes a shorter sheet, with the ticket lying across its lower edge as in Italy. On a phone that is about 358 × 239 pt.
- **The cost of the whole country:** the six highland cities sit in a patch about 60 pt wide. Guanajuato and San Miguel de Allende are about 6 pt apart, Ciudad de México and Puebla about 12 pt. Josh's standard for Italy applies ("the locations don't need to be correct - just not plainly wrong"): nudge close neighbours apart by a few points when placing them. If trips between neighbours still look cramped on the phone, the next step is the sheet zooming in on the two cities; not planned yet.
- **The app's own marks:** names and route are brown and red with a pale glow, tuned on Italy's parchment. On a bright map they need a look, and perhaps Mexico's own colours.

**2. Ten buildings**, one a city, for the board's rows, ink or paint on pure white so they sit on the white cards. In the map's look. One building alone, never a townscape: Napoli's castle on its rock kept coming out as a hill town. Suggested, mixing kinds so the board isn't ten churches:

| City id | Landmark |
|---|---|
| ciudad-de-mexico | Palacio de Bellas Artes |
| oaxaca | Templo de Santo Domingo de Guzmán |
| guadalajara | the Cathedral, with its two yellow-tiled spires |
| san-miguel-de-allende | the Parroquia de San Miguel Arcángel |
| puebla | the Cathedral, with its two tall towers |
| guanajuato | Teatro Juárez |
| veracruz | the fortress of San Juan de Ulúa (if it drifts into a townscape: the Palacio Municipal with its tower) |
| patzcuaro | Basílica de Nuestra Señora de la Salud |
| merida | Monumento a la Patria |
| san-cristobal-de-las-casas | the Arco del Carmen |

**3. City positions and the always-named cities**, in `content/es-mx/travel-map.json`. Measured on the chosen picture, as in Italy. Always named, for orientation: Guadalajara, Ciudad de México, Veracruz, Oaxaca, Mérida.

## Prompts

Map, landscape 3:2:

> A modern illustrated tourist map of the whole of Mexico in a soft, flat, hand-drawn style with bright, friendly colours. Accurate outline of the country: the Baja California peninsula, the Pacific coast, the Gulf of Mexico, the narrow Isthmus of Tehuantepec and the Yucatán peninsula. Cream and pastel land with each state lightly tinted a different colour and thin state borders, a clear blue sea with a few small waves. A few small drawings of landscape only: two snow-capped volcanoes in the centre, cactus and agave in the north, jungle and a stepped pyramid in the Yucatán, two sailing boats and a whale at sea. The neighbouring countries in plain pale grey. A simple title banner reading "MÉXICO" at the top, sea names in neat lettering: "Océano Pacífico" and "Golfo de México", a small compass rose, a thin border. No cities, no city names, no buildings in the cities, no people, no food, no other text.

Building, square:

> A small illustration of [LANDMARK] in [CITY], Mexico, in a soft, flat, hand-drawn style with bright, friendly colours, like a landmark on a modern illustrated tourist map. The building alone, seen from slightly above, centred, on a plain pure white background. No text, no people, no border, no ground beyond a small patch under the building.

## Steps

1. **Mini:** six maps, landscape 3:2, in three looks, two of each (the looks follow Josh's second set of references, 2026-11-11; still "ideas - no rules"). Each uses the map prompt below with its first sentence swapped:
   - **Vintage travel poster:** "A 1940s travel-poster map of the whole of Mexico, painted in gouache: warm yellow and cream land, a deep blue sea with paler shallows near the coast."
   - **Modern flat graphic:** "A modern flat graphic map of the whole of Mexico in a limited palette: off-white land, a teal sea, accents in mustard, coral and dark green, crisp simple shapes."
   - **Atlas map:** "A classic atlas map of the whole of Mexico: each state tinted a different soft colour with thin borders, a pale blue sea with darker depths, clean and calm." For this one drop the landscape drawings.
   One building, Palacio de Bellas Artes, in each look. Saved to `design/trip-map/mexico/` and pushed. Josh picks the look.
2. **Mini:** the ten buildings in the chosen look, pushed to the same folder.
3. **Cloud chat session:** looks at them (redo any that drift), measures the ten positions on the map and checks them on a plotted copy, turns the pictures into masters (`public/images/es-mx/travel/map.jpg`, `building-<city id>.jpg`, paper turned pure white, cropped close), fills in `content/es-mx/travel-map.json`, pushes.
4. **Mini:** `COUNTRY=es-mx npm run images:upload`, untrack, push, then release. No app build is needed: the map, the buildings and the positions all come from `/v1/content`.
5. **Josh:** plays a bus trip in Mexico.

## Station changes to look at when Josh plays Mexico (none built)

- **The board's header** is an arched iron station window, a railway shape. Mexico's are bus terminals; it may read wrong there. If so, the header's shape becomes a per-country setting.
- **The ticket sheet with a wide map** is shorter than Italy's, so the sheet may have empty space below the ticket.
- **Names and route on a bright map** (above).
- **Ten cities on the board**, all on the first screen, no "show more".

## After the first sketches (2026-11-11, later the same evening)

Rough sketches only; nothing here is made. Josh's words are quoted; the rest is the cloud chat session's suggestion.

**Sheet layout Josh steered to.** He liked the picture panels round the border of a 1930s pictorial map ("I thought the key on the border here was interesting"). From there: "layout 10 down the left and the full size ticket under the map", the ticket "full-size - under map - right of the key-strip". So: a key strip of ten city panels (a number and the city's building) down the left for the sheet's full height; on the right a tall map with numbered dots, and under it the full-size ticket. His last word on the sketch was "correct placement - still smushed ticket"; the ticket then got taller with larger type and the route on two lines, which he hasn't judged. This replaces "landscape, 3:2" above: the map becomes tall, either the whole country or zoomed to where the cities are.

**No cities in the north** (Josh: "do we really have zero cities in the North?"). True: nothing north of Guanajuato and Mérida, nothing in Baja or on the Pacific coast. He raised the Pueblos Mágicos ("there is a designation of cultural towns in Mexico"); Pátzcuaro and San Cristóbal are already on that list. Suggested, not decided: **Monterrey, Mazatlán, Chihuahua with Creel (El Chepe starts there, a real train trip), and one of Tijuana or Ensenada.** Passed over: Zacatecas (a second silver city after Guanajuato), Durango, Puerto Vallarta (a resort), Acapulco (later, perhaps), Álamos, Todos Santos, Cuatro Ciénegas, Real de Catorce (the best picture, but tiny). With a real north the whole-country map is the right one. Add or swap is open (Josh asked "add or swap"): the suggestion is to add, and if one goes, San Miguel de Allende, which sits 6 pt from Guanajuato on the map and is the most expat of the ten. More than ten cities means the key strip needs rethinking.

**The hard side of places** (Josh: "you are still missing the narco towns", "Michocan", and "agree" to this). Pátzcuaro is already in cartel country and its file is all lake, plaza, crafts and Day of the Dead. Characters there should know what a local knows, so it can come up as it does in life, without being a topic or a scene. A prompt and pantry change, so it waits on a test: K1 in docs/prompt-testing.md → The queue.

**Decided by Josh, 2026-11-11:** "Tijuana is a yes." And on swapping: "swaps should probably consider location to others", so a city that goes is one sitting close to another. By that rule the candidates are San Miguel de Allende (about 75 km from Guanajuato) and then Puebla (about 130 km from Ciudad de México); everything else stands well apart. Suggested, not decided: Tijuana in and San Miguel under "more", which keeps ten cities and the ten-panel key strip.

**Where the city talk stopped (2026-11-11, late; Josh: "lets stop", and for tonight only).** Only two things are Josh's: "Tijuana is a yes", and swaps go by nearness. Everything else is the cloud session's view or a list he offered ("im just making suggestions. You are the critic"):
- Lists he brought: big northern cities, Baja, the Pacific coast, the Pueblos Mágicos, a travel writer's 34 places, the ten UNESCO city centres, and the four silver-road neighbours (Guanajuato, San Luis Potosí, Zacatecas, Aguascalientes).
- The cloud session's yeses, given late and only when pressed: Tijuana, Zacatecas, Monterrey, Mazatlán. Nearest existing city to each: Zacatecas about 240 km (Guanajuato), Mazatlán 425, Monterrey 525, Tijuana 1,900; none crowds. Of the last five added, only Guanajuato crowds (55 km from San Miguel).
- A correction to carry forward (Josh: "you are sort of in snob mode"): the "would a local go there" test was turned into a taste test. Resort and expat towns are where learners will really speak Spanish, and people live in them: Cancún or Playa del Carmen and Puerto Vallarta belong in the conversation, and San Miguel isn't a flaw. The game has big cities and cultural towns and none of the beach places everyone visits.
- How it went wrong, for the next session: deciding too fast, then grading each suggestion down, then agreeing to nothing. Next time, build on the places he names.

## 2026-11-13: the northern cities are written, and the recipe is in docs/mexico-north-recipe.md

Josh asked for the recipe card for the map and the cities, with the northern cities included at 10 places each, and said to build what could be built. Built and on `main` (hidden until their pictures exist): **Tijuana, Zacatecas, Monterrey, Mazatlán**; trip facts for all 14 cities; the map and building prompts in `content/es-mx/generation.json` → `travel`; and `scripts/generate-travel-pictures.mjs`, which draws the candidate maps and the buildings from them. Only Tijuana is Josh's yes; the other three are the cloud session's yeses from 2026-11-11.

What that changes above:
- **Fourteen buildings**, not ten. Added: Tijuana, the CECUT's sphere (or the arch on Avenida Revolución); Zacatecas, the Cathedral (or the Acueducto El Cubo); Monterrey, the Horno 3 blast furnace (or the Palacio del Obispado); Mazatlán, the lighthouse on its hill (or the Teatro Ángela Peralta).
- **Four looks**, not three: the soft flat tourist map Josh sent twice is in the spread with the travel poster, the flat graphic and the atlas.
- **The whole country, landscape 3:2**, for the candidates: with Tijuana, Monterrey, Mazatlán and Zacatecas the north is no longer empty. The tall map with a key strip is still his last steer on the sheet; ten panels were sketched and there are now fourteen cities, so the strip is open again (the recipe → Open, Josh's).
- **Always named:** Tijuana, Monterrey, Guadalajara, Ciudad de México, Oaxaca, Mérida.
- "Steps" above is replaced by the recipe's steps.


## 2026-11-13, later: the sheet Josh steered to on the mock-ups, and a later idea

From the Mac mini session, with Josh on his phone. Mock-ups only (a private page, https://claude.ai/artifact/RjpxotaXdNJ8rg84UEbsDF); nothing is built in the app. Josh's words are quoted; the rest is Claude's.

**What was drawn first.** Recipe steps 1 and 2 were run: the fact judge's output (`docs/mexico-north-cities.facts.txt`, claims not yet sorted) and the eight candidate maps with a sample building in each look (`design/trip-map/mexico/`). Josh has not picked a look.

**The sheet, top to bottom (this replaces the key strip of building panels above):**
1. **The ticket on top** ("Show me ticket on top"; before that, "I'd flip the city list and ticket - let the ticket be clear from/to"). It is the app's own ticket (`TicketStrip`), not a new drawing: "I'd copy the style of the Italy ticket (or improve - now it is a tall manila rectangle)" was said of the mock-up's stand-in.
2. **The map**, full width, with a numbered dot for every city and the trip's two cities in red. Dots stay plain ("I wouldn't change dot colors").
3. **The key: numbers and names only**, two columns under the map, names at a readable size ("on the key I'd lose the team colors - just numbers and names").

**How it got there, so it isn't retried:**
- Key down the left against across the top and bottom: across gives the map the full width.
- **Buildings in the key: no.** "the token bldgs are all nearly identical"; "I doubt the bldgs will work - they are all similar and small". Six of the fourteen are a church with a dome or two towers, and the four looks drew one building almost the same way.
- **A blast furnace for Monterrey: no** ("a blast furnace is not going to work"). If Monterrey needs a picture anywhere, Claude's suggestion is the Cerro de la Silla.
- **Soccer team colours** (Josh's idea): "the colors kind of work but not that well - the biggest issue is probably size of city name". Dropped from the key. Four of the fourteen cities have no well-known team of their own.
- City names inside 48-point panels can't be larger than about 7 points; that, not the picture, is what sank the panels.

**Open**
- The map's look. With numbered dots the land has to be clear: the atlas look works as drawn; the other three have a cactus, volcanoes and a pyramid where cities go and would need a redraw without them.
- The fourteen buildings (recipe step 3): the key no longer uses them. Whether the departures board wants them is Josh's; not drawn.
- Italy: the sheet is one piece of code for both countries, and Italy's has names on the map, the ticket under it and no key. Same layout for both, or different, is Josh's.
- The boarding arrow is now at the top of the sheet; to be judged on a phone.
- Not seen on a phone at real size; about 530 points tall by sums.

**Later, "when we are ready to get fancy" (Josh):** "we add sound effects and a timer to the page so it auto advances". The sheet becomes a short scene that moves on by itself; Cancel stays. This changes his earlier word for the sheet ("no timer, nothing rises or animates"), which is his to change. **No animated route line:** "the only piece I might skip is the animated line - lots of cities would barely show it". It could join the earlier idea of a voice over the map about the city you're going to, the timer being the length of that voice (Claude's suggestion).

**ElevenLabs sound effects, looked into at Josh's request (2026-11-13; nothing generated):**
- It is a text-to-sound call on the service the game already uses for voices: `POST https://api.elevenlabs.io/v1/sound-generation`, with `text` (a description of the sound), optional `duration_seconds` (0.5 to 30; left out, the length is guessed), `prompt_influence` (0 to 1, default 0.3), `loop` (a seamless loop, for ambience) and `model_id` (`eleven_text_to_sound_v2` by default; a v3 is listed). It returns an audio file, MP3 by default.
- **Cost is unclear:** ElevenLabs' own pages give 40, 20 and 11 credits a second with a set length, and 100 or 200 a generation without. Check the account's usage after one trial sound before relying on any figure. Either way a handful of sounds is small.
- **How it would fit:** these are a few fixed sounds per country (a terminal announcement tone, a bus door and engine; a station chime and a train), so they are made once, listened to by Josh, and stored with the other media in R2, not generated during play. The app would play a file; no new call from the phone, no key on the phone. The existing key in `.env.local` should work for the call; not tried.
- **Limits to expect:** spoken announcements come out as gibberish from a sound model, so a real announcement would be a voice line (the existing voice path) over a sound. Results vary run to run, so each sound wants a few takes to pick from.
- **Kept simple (Josh, same day):** "we could keep it simple..train noise, bus noise. I imagine the screen is up 3-5 seconds". So one sound a country, a train for Italy and a bus for Mexico, 3 to 5 seconds, and the sheet stays up for that long. No announcement, no voice line, no ambience loop.
- **Next step when Josh says:** a few takes of each of the two sounds, for his ear.

Sources: https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert · https://elevenlabs.io/docs/overview/capabilities/sound-effects

## 2026-11-13, evening: the map is chosen, and three of the open items are closed

**The map (Josh: "Lets go with L"):** `design/trip-map/mexico/map-soft-flat-cropped-banner-2-clean.png`, 2192×1904. How it was made, in order, so it can be made again:
1. The soft flat look drawn at 4:3 (`scripts/generate-travel-pictures.mjs --maps 2 --look soft-flat --aspect 4:3`; the image service refuses 5:4). Map 1 of the two; map 2 misspelled "Pacífico" and drew the pyramid over the Yucatán.
2. Cropped to Josh's framing ("I want as much map. Not more sea"; he sent a screenshot): left edge through northern Baja, right edge through the pyramid, bottom under Chiapas (`map-soft-flat-cropped-source.png`).
3. Three image edits (xAI `/v1/images/edits`, the picture sent with a prompt asking for one change), each in two takes because the edit sometimes damages the map (one take wiped the states): the land cleared and the decorations moved to the empty corners ("Redeploy decorations to fill empty spots"); a ribbon "MÉXICO" banner like the 4:3 map 2's, the smaller of two takes; the scraps of "Océano Pacífico" the crop left at the left edge removed.

**Known about this map, accepted or still to judge:** Tijuana is at the very top-left corner ("Tijuana could be close enough or tweak"); the volcanoes are gone; the pyramid stands where the Yucatán begins, so Mérida's dot sits beside it; the banner's left tail just touches the top of Chihuahua.

**Closed by Josh the same evening:**
- **Buildings: none.** "yes - skip the buildings - just the written key". Recipe step 3 (the fourteen buildings) is not run.
- **Italy: "italy is done".** Italy's sheet stays as it is. The new layout is Mexico's only, so the sheet's one piece of code has to lay out by country.
- **Order: "stub at top, map, key".** The ticket, then the map, then the key.

**Next:** Josh checks the fourteen dots on a mock-up (spots placed by eye; Guanajuato and San Miguel nudged apart so both numbers read). Then `content/es-mx/travel-map.json`, the sheet's Mexico layout in Swift, and the upload, which waits for his word.

## 2026-11-13, night: Bahía de Banderas, towns as places, and an American in Sayulita (talk only; nothing built)

Josh, from his phone, to the cloud chat session. Ideas, not decisions; nothing is written into content.

- **Josh:** "what do you say of cities like saint john of the cross, san pancho, or bucerias". Read as La Cruz de Huanacaxtle, San Pancho and Bucerías, on the Bay of Banderas north of Puerto Vallarta; he hasn't confirmed the first.
- **Claude's answer:** one city, not three. Each alone is thin for ten places; together, as **Bahía de Banderas** with the towns as its neighbourhoods, they are the small-town coast where foreigners and locals share the same streets, a different thing from Mazatlán, a working port with a beach. Named from memory and unchecked: Bucerías's oyster divers and its January feast with the boats blessed; La Cruz's fish market at the marina and Sunday market; San Pancho as Echeverría's model town of the 1970s, its community centre and turtle volunteers.
- **Josh:** "In the Bahía de Banderas towns could sometimes be places". A town can be one card on the city's list: one person with a reason to be there, and the whole town is what you talk about. It is how people there speak ("voy a San Pancho"). It lets a small town in without inventing three spots for it, and lets in the inland side (Valle de Banderas, the old municipal seat, a farming town). What it would take: a place kind "town", drawn wide with no sign, and a person who can carry a town. Pátzcuaro's lake villages have the same shape.
- **Josh:** "sayulita could fit there with a hippie american surfer running a smoothie shop". The first non-Mexican in Afuera (Rome has its immigrant communities). Claude's points: she is the learner's future self, someone who learned Spanish as an adult; by Josh's caricature rule, keep the smoothie shop and one trait and make her particular, not all four stacked; she is a non-native model of Spanish, which is a choice; and the voice pool is all Mexican, so she needs a Spanish voice with an American accent, found and heard first.
- **Wrinkles:** no bus terminal (a plane to Puerto Vallarta and a combi up the highway, so the "terminal" is a highway stop and the trip line says plane); and the honest version includes the squeeze on rents, which belongs with the hard side of places (waits on test K1).

