# Mexico: the trip map and the terminal

2026-11-11 · the cloud chat session's plan, at Josh's request ("spec out your plan for Mexico Map and Station changes"). Nothing here is built or decided by Josh yet, except where his words are quoted. Italy's version: docs/station-feature-decision.md → Board, map, city.

## Where Mexico stands

The station path is one piece of code for both countries, so Mexico already has it: terminal card → departures board → ticket sheet → city. Its words and colours come from content (`Andén`, `Destino`, `Súbete`, `Estás aquí`; the bus ticket's own colours). All ten cities have a terminal and trip facts for all 45 pairs.

What Mexico lacks is pictures. With no map, `/v1/content` sends `travelMap: null`, so the board's rows have no buildings and the ticket sheet shows the ticket alone at half height.

## What to make

**1. One map with no cities on it.** The app draws the names, the two ends of the trip and the route, so no name can be misspelled or misplaced (the lesson from Italy's first ten maps).

- **The part of Mexico to show:** the centre and south, from Jalisco to Yucatán, where all ten cities are. Leave out the north and Baja, as Italy left out Sardinia (Josh: "it has no role in game"), and put the title medallion in the Pacific, lower left. The whole country at phone width would squeeze the six highland cities into a thumbnail's width.
- **Shape:** landscape, 3:2. Mexico is wide where Italy is tall. The sheet takes any shape (`aspect` in `travel-map.json`); a wide map makes a shorter sheet, with the ticket lying across its lower edge as in Italy. On a phone that is about 358 × 239 pt.
- **Tight spots to expect:** Guanajuato and San Miguel de Allende are about 50 km apart, about 12 pt on this map; Ciudad de México and Puebla about 25 pt. A trip between two neighbours will have its two marks nearly touching. Italy has the same with Firenze, Siena and Lucca.
- **Look: two candidates, three tries of each, Josh picks by eye.** (a) Mexico's own: a bright mid-century illustrated tourist map in gouache, which fits Mexico's gouache portraits and Josh's "You are in Mexico - its fun and bright with rich cultures!! make it fun". (b) The same family as Italy: an antique engraved map on parchment, which he liked there. Claude's lean is (a). The names and route the app draws are brown and red with a pale glow, tuned on parchment; on a bright map they need a look, and perhaps a colour change in the tokens.

**2. Ten buildings**, one a city, for the board's rows, ink or paint on pure white so they sit on the white cards. In whichever look the map takes. One building alone, never a townscape: Napoli's castle on its rock kept coming out as a hill town. Suggested, mixing kinds so the board isn't ten churches:

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

Map, look (a), landscape 3:2:

> An illustrated mid-century tourist map of central and southern Mexico, from Jalisco in the west to the Yucatán peninsula in the east, painted in bright flat gouache: warm land in ochre, pink and green with the states lightly tinted, turquoise sea. Accurate coastlines of the Pacific coast, the Gulf of Mexico, the Isthmus of Tehuantepec and the Yucatán peninsula; the map ends at a ruled border north of Guanajuato, with no Baja California and no northern Mexico. Small painted volcanoes and mountain ranges, a few maguey and cactus plants, and two small boats at sea. An ornate round title medallion reading "MÉXICO" in the Pacific, lower left. Sea names in flowing script: "Océano Pacífico" and "Golfo de México". A compass rose, a simple ruled border. No cities, no buildings, no city names, no people, no other text.

Map, look (b): the same, opening "An antique engraved map of central and southern Mexico… on aged, stained parchment, in sepia ink with faint watercolor washes tinting each state", without the maguey and boats line's colours.

Building, look (a), square:

> A small gouache painting of [LANDMARK] in [CITY], Mexico, in bright flat colour with simple shapes, like an illustration on a mid-century tourist map. The building alone, seen from slightly above, centred, on a plain pure white background. No text, no people, no border, no ground beyond a small patch under the building.

Building, look (b): Italy's template ("A small antique engraving of… in sepia ink with fine cross-hatching…").

## Steps

1. **Mini:** six maps (three of each look) and, for one city, a building in each look, saved to `design/trip-map/mexico/` and pushed. Josh picks the look and the map.
2. **Mini:** the ten buildings in that look, pushed to the same folder.
3. **Cloud chat session:** looks at them (redo any that drift), measures the ten positions on the map and checks them on a plotted copy, turns the pictures into masters (`public/images/es-mx/travel/map.jpg`, `building-<city id>.jpg`, paper turned pure white, cropped close), fills in `content/es-mx/travel-map.json`, pushes.
4. **Mini:** `COUNTRY=es-mx npm run images:upload`, untrack, push, then release. No app build is needed: the map, the buildings and the positions all come from `/v1/content`.
5. **Josh:** plays a bus trip in Mexico.

## Station changes to look at when Josh plays Mexico (none built)

- **The board's header** is an arched iron station window, a railway shape. Mexico's are bus terminals; it may read wrong there. If so, the header's shape becomes a per-country setting.
- **The ticket sheet with a wide map** is shorter than Italy's, so the sheet may have empty space below the ticket.
- **Names and route on a bright map** (above).
- **Ten cities on the board**, all on the first screen, no "show more".
