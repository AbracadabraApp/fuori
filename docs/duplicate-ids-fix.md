# Fix: repeated place and character ids in the Italian pack

Found 2026-10-12 by `npm run test:pack`. Not fixed yet; this is the plan (roadmap → Now).

## The problem

Ids are meant to be unique across the whole pack, but **26 ids are used 70 times**: 15 place ids and 11 character ids, each in 2 to 12 cities. Everything keyed by id collides:

- **Images:** one file per id, so every repeat shows the first city's picture. `farmacia-centrale` is one image for 12 cities.
- **Memory:** `character_memories` is keyed by learner and character id, so a repeated character **shares memory across cities**: talk to Padre Giovanni in Firenze and the one in Venezia remembers you.
- **Voices:** the voice comes from a hash of the id, so a repeated character has the same voice in every city.
- **Recorded conversations and scores:** `character_id` / `place_id` can't tell the cities apart (only `city_id` can).

| Kind | Id | Cities |
|---|---|---|
| Place | farmacia-centrale | matera, taormina, lecce, milano, siena, napoli, verona, assisi, palermo, bergamo, torino, orvieto |
| Place | mercato-coperto | siena, assisi, orvieto, mantova |
| Place | mercato-contadino | matera, lecce, orvieto |
| Place | stazione-centrale | napoli, bologna, palermo |
| Place | basilica-santa-croce | firenze, lecce |
| Place | caffe-duomo | taormina, assisi |
| Place | villa-comunale | taormina, lecce |
| Place | giardini-pubblici | venezia, orvieto |
| Place | enoteca-italiana | siena, bologna |
| Place | mercato-erbe | bologna, mantova |
| Place | bar-centrale | bergamo, orvieto |
| Place | enoteca-bacco | torino, siracusa |
| Place | orto-botanico | siracusa, lucca |
| Place | palazzo-ducale | genova, mantova |
| Place | bar-duomo | lucca, orvieto |
| Character | padre-giovanni | firenze, venezia, assisi |
| Character | suor-teresa | firenze, milano, palermo |
| Character | suor-margherita | matera, genova, lucca |
| Character | dottoressa-martini | milano, assisi, orvieto |
| Character | padre-leonardo | matera, palermo |
| Character | andrea-colombo | milano, genova |
| Character | beatrice-libri | verona, siracusa |
| Character | don-giuseppe | bologna, mantova |
| Character | suor-maria | assisi, mantova |
| Character | elena-marchetti | assisi, lucca |
| Character | dottoressa-carla | torino, genova |

## The fix

Keep each id in the **first city that uses it** (feed order), so its image, voice and any memory stay put. Rename every later use to `<id>-<city>` (`farmacia-centrale-taormina`, `padre-giovanni-venezia`). That's 44 renames, and each renamed place or person gets its own image.

1. **Rename script** `scripts/fix-duplicate-ids.mjs` (dry run by default, `--write` to apply): finds repeats in the active pack, prints the rename map, and rewrites the city files: `place.id`, `place.characterId`, `character.id`, `character.placeId`. A person's name doesn't change; two different nuns can both be called Suor Teresa.
2. **Images:** `npm run images -- --city <id>` for each affected city generates the 44 missing images (the script skips files that already exist). Then `npm run test:images` reports 0 missing.
3. **Data:** the script's `--db` step checks Postgres for rows using a renamed id: `conversations` rows are matched by `city_id` and updated to the new id; `character_memories` for a repeated character is moved to the new id when that learner's conversations with it were in the renamed city. With one learner today this is likely zero rows; it reports what it changed. Run on Railway with `railway run`.
4. **Prevent it:** the generation scripts check the whole pack before choosing an id and add `-<city>` on a clash, and `test:pack` **fails** on any repeat (today it only counts them).

**Done when:** `test:pack` and `test:images` pass with no repeats, and two same-named characters in different cities have separate memory.

**Effort:** about 2 hours of Claude Code work, plus the image run (44 images). Needs the xAI key, so the image step runs on the laptop.

**Not doing:** prefixing every id with its city. It would rename all ~600 images and every existing memory for one rule, when renaming the 44 repeats fixes the collisions.
