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
