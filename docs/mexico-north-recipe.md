# Mexico: the map and the northern cities — recipe card

2026-11-13 · the cloud chat session, at Josh's request ("recipe card for the mini to build", then "include the new northern cities - limit 10 places per city - follow current norms for types of people and places", then "you can build all that you don't need the mini to do"). Earlier thinking: docs/mexico-trip-map.md. Italy's version of the map: docs/station-feature-decision.md → Board, map, city.

**The words are built. The pictures are not.** Everything that is text is written, checked and on `main`. What is left needs the image key (xAI, in `~/fuori/.env.local`) and, for the last step, the R2 keys on a Mac. Any session with those can run the steps below; nothing in them needs a decision from Claude, and each stop for Josh is marked **Josh**.

## What is built

**Four cities, hidden until their pictures exist** (`hidden: true` in each file): **Tijuana, Zacatecas, Monterrey, Mazatlán**, in that order after San Cristóbal. Each has 10 places, 10 people, a bus terminal, food, customs and local words. Mexico is now 14 cities; with these shown it is 160 places and 161 people.

| City | The place only it has | Also |
|---|---|---|
| Tijuana | Caesar's, where the salad is made at the table | the fence into the sea at Playas, the CECUT, Mercado Hidalgo, a taco stand, a print workshop in Pasaje Rodríguez, musicians for hire in Plaza Santa Cecilia, the casino's minaret at Agua Caliente, chess in Parque Teniente Guerrero |
| Monterrey | Horno 3, the blast furnace in Parque Fundidora | the Macroplaza, Paseo Santa Lucía, a record stall in the Barrio Antiguo, the Obispado, cabrito, the Basílica del Roble, a cantina split between Rayados and Tigres, breakfast tacos |
| Mazatlán | a pulmonía at Olas Altas | Plazuela Machado, Teatro Ángela Peralta, the lighthouse climb, the changueras selling shrimp, a seafood cart, a banda on the beach, the Carnival float workshop, the cathedral |
| Zacatecas | the cable car over the roofs | the cathedral, La Bufa, Museo Rafael Coronel, a tamborazo in the Plaza de Armas, gorditas, Las Quince Letras, the aqueduct, the Morismas at Bracho |

**The norms followed** (Josh, 2026-11-09 to 11-11, as the five cities before were written): thick with local qualities; little commerce and at most two food vendors a city; plazas, monuments, music and ritual; one place no other city has; one bus terminal; everyone at their place for their own reason, not as an explainer; one person with something to show; unique full names; a voice from the pool for their age; gouache portraits, unposed, one or two true traits and no stacking; place pictures of Mexico today. Mazatlán is Mexico's first beach city (Josh: resort towns are where learners will really speak Spanish).

**Also built**
- `content/es-mx/stations.json`: what each new city is known for, and trip facts for all 91 pairs of the 14 cities (46 new, approximate, "about").
- `content/es-mx/weather.json`: weather for the four new cities, and for the five cities shown since 2026-11-11, which had none (`test:weather` was failing on `main`).
- `content/es-mx/generation.json`: a picture style and a city card prompt for each new city, proposed and untested; the four cities in its list; `beach`, `park` and `street market` drawn without a sign; a new `travel` section with the map and building prompts.
- `scripts/generate-travel-pictures.mjs`: draws the candidate maps and the buildings from that `travel` section into `design/trip-map/mexico/`. Italy's were made by hand; this makes Mexico's one command.

**Checked** (2026-11-13, cloud): `tsc`; with the four shown, `test:names` (160 people), `test:feed`, `test:weather` (14 cities), `test:voices`, `test:roles`; ids unique across Mexico and not shared with Italy; every place has its person and a listed neighbourhood; `--dry` prints all 84 picture prompts and all map and building prompts. Five claims checked against sources (the Morismas, the cathedral windows of Mazatlán, the Virgen del Roble, Las Quince Letras, the Combate Naval); two lines were corrected. **Not verified:** no picture drawn, no conversation played, the fact judge not run (step 1), `smoke:live` not run. `test:images` fails for the four cities until step 5, as it did for the last five.

## Open, Josh's

1. **Which cities.** Only "Tijuana is a yes" is his. Zacatecas, Monterrey and Mazatlán are the cloud session's three other yeses from 2026-11-11, built here on "include the new northern cities". A city he doesn't want stays hidden or is deleted; one he'd add (Chihuahua with Creel, a Baja town, Puerto Vallarta, Cancún) is the same recipe again.
2. **The map's look**, picked by eye at step 2.
3. **Fourteen cities and the sheet.** The layout he steered to has a key strip of ten city panels down the left; fourteen don't fit it as sketched. Either some cities go under "more" (his rule: one that sits close to another; San Miguel, then Puebla), or the strip is rethought. The board already handles more than ten rows.

## The recipe

From `~/fuori` after `git pull`, or its own worktree. 110 pictures in all: 8 maps, 4 sample buildings, 14 buildings, 4 city cards, 40 places, 40 portraits.

**1. Fact judge** (needs the Anthropic key)

```
COUNTRY=es-mx npx tsx scripts/here-lines.mts tijuana,monterrey,mazatlan,zacatecas > /tmp/lines.json
COUNTRY=es-mx npx tsx --env-file=.env.local scripts/fact-check.mts /tmp/lines.json > docs/mexico-north-cities.facts.txt
```

Commit the .txt. Fix what fails as a claim about the world; a person's own situation ("today you are mending your uniform") is not a fact to check. Bar: low to medium, as before (Josh, 2026-11-11).

**2. Maps, in four looks** (needs the image key)

```
COUNTRY=es-mx node --env-file=.env.local scripts/generate-travel-pictures.mjs --maps 2
```

Two maps each in `soft-flat`, `travel-poster`, `flat-graphic` and `atlas`, landscape 3:2, the whole country, no cities; and the Palacio de Bellas Artes once in each look. Before showing them, throw out any map with a city name, a dot for a town, a wrong outline (no Baja, no Yucatán) or misspelled lettering, and redraw it (`--look <id> --force`). Commit `design/trip-map/mexico/`. **Josh picks the look and the map.**

**3. Fourteen buildings in that look**

```
COUNTRY=es-mx node --env-file=.env.local scripts/generate-travel-pictures.mjs --buildings --look <id>
```

Look at every one. One building alone on white: redo any that came out as a townscape, a hill town or with lettering. Where a second landmark is given (Veracruz, Tijuana, Zacatecas, Monterrey, Mazatlán), `--only <city> --alt --force` draws it. Commit.

**4. One picture per new city, to judge its style**

```
COUNTRY=es-mx npm run images -- --type city --city tijuana,monterrey,mazatlan,zacatecas
COUNTRY=es-mx npm run images -- --type place --only plaza-santa-cecilia,macroplaza,paseo-de-olas-altas,catedral-de-zacatecas
```

**Josh judges the four styles.** A style he rejects changes in `generation.json` → `placeStyles` (and the same words at the start of that city's `cityCards` prompt), then `--force` on those ids.

**5. The rest of the pictures**

```
COUNTRY=es-mx npm run images -- --type place --city tijuana,monterrey,mazatlan,zacatecas
COUNTRY=es-mx npm run images -- --type portrait --city tijuana,monterrey,mazatlan,zacatecas
```

Look at the 40 portraits for caricature and posing (docs/portraits-caricature.md) and the 40 places for forbidding or empty scenes (San Cristóbal's lesson); redo by id with `--force`.

**6. The map into the app**
- The chosen map → `public/images/es-mx/travel/map.jpg`. Each building → `public/images/es-mx/travel/building-<city id>.jpg`, its paper turned pure white and cropped close, as Italy's were.
- `content/es-mx/travel-map.json`: `aspect` is the map's width divided by its height; `cities` is each of the 14 cities' spot on that picture, x across and y down as fractions from the top left, measured on the picture and checked on a plotted copy. Nudge close neighbours apart by a few points (Guanajuato and San Miguel, Ciudad de México and Puebla): "the locations don't need to be correct - just not plainly wrong". `anchors`, the names that always show: Tijuana, Monterrey, Guadalajara, Ciudad de México, Oaxaca, Mérida.
- `COUNTRY=es-mx npm run test:content-api` checks the spots.

**7. Upload** (a Mac with the R2 keys; the cloud and the laptop's Linux shell can't reach R2)

```
COUNTRY=es-mx npm run images:upload
node --env-file=.env.local scripts/image-masters.mjs --untrack
```

Commit `content/es-mx/images.json` and push. Then `COUNTRY=es-mx npm run test:images` and `npm run test:image-list` pass.

**8. Show them**
- **Josh looks**, then `hidden: true` comes out of the four city files (one line each).
- `npm run release` when Josh says "release". No app build is needed: cities, the map, the buildings and the positions all come from `/v1/content`.
- **Josh plays** a bus trip to a northern city and one conversation there. That is the real check.

## To look at when Josh plays (none built)

Carried from docs/mexico-trip-map.md: the board's header is a railway window and Mexico's are bus terminals; the sheet with a wide map is shorter than Italy's; the app's brown-and-red names and route were tuned on parchment and may need Mexico's own colours on a bright map; and now fourteen rows on the board.

## Not done here, on purpose

- **The hard side of places** (Josh: "you are still missing the narco towns"): agreed, and waiting on test K1. Tijuana's people know the border as a fact of daily life and nothing more is written in.
- **San Miguel under "more"**: suggested 2026-11-11, not decided, not done.
- **Cultural items and lessons for the new cities** (`culture.json` has a set across five cities): not extended.
