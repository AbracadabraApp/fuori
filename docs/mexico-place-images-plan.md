# Mexico place images: regenerate in each city's style, and clean up

Written 2026-10-14 after the style test (Josh). Decisions are in [mexico-version.md → Place styles per city](mexico-version.md).

## The five styles

Each city's places get their own look, so arriving somewhere new feels new and people enjoy the art instead of critiquing a repeated style (Josh's hypothesis). The exact style lines are the winners in `content/es-mx/style-test.json`.

| City | Style | From the test |
|---|---|---|
| Ciudad de México | Daytime street photography: eye level, 35mm, close in, foreground blur, low afternoon sun, film grain. The neighbourhood and architecture come from each place's scene (Condesa's Art Deco for Condesa places, colonial stone for the Centro) | `condesa-street`, generalised |
| Guadalajara | Linocut: bold carved black lines, wood grain, bright colour | the current linocut, lettering fixed |
| Oaxaca | Shadow-box diorama painted as naive folk art: tiny clay figures, alebrije patterns | `folk-shadow-box` |
| Puebla | Hand-painted Talavera tile panel with a tile border | city card style |
| San Miguel de Allende | Mexican mural: flat fresco, simplified forms, plaster texture, earth colours | city card style |

People's portraits don't change.

## Rules every place prompt follows

Learned from the test, where most of the "dated, touristy" look came from lettering, not style:
- **The sign is given word for word and is the only lettering:** `The sign reads "Café Pocito".` Nothing else written anywhere: no "HOY" (the word "today" in prompts was painted as HOY), no neighbourhood or city names (still leaking in round 3: "Café · Condesa", "Xochimilco, Oaxaca"), no slogans, dates or prices.
- No brand names or logos (Coca-Cola, Fanta appeared).
- Contemporary Mexico: today's clothes and objects; no sombreros, cacti, skulls, rebozos or costumes.
- Main scene centred; nothing important near the edges. Square, 1200 × 1200.

## Steps

1. **Style lines in the country settings.** `content/es-mx/generation.json` gets `placeStyles` keyed by city id, with the five winning lines copied from the test. Italy has none, so Italy is unchanged.
2. **Scene-only place descriptions.** Rewrite each Mexican place's `imagePrompt` to the scene alone: drop the old "Linocut print… of" opening, ", today", the colour line and any words that describe signage. The place's name becomes the sign. One script does this; the diff is reviewed before committing.
3. **One prompt builder.** Move the composition the test used (style + scene + sign + rules) into `scripts/lib/place-prompt.mjs`, used by both `generate-images.mjs` and `style-test.mjs`, so the test and production can't drift apart. `generate-images.mjs` gets `--force` (regenerate even if the file exists) and `--only <ids>`.
4. **Regenerate on the laptop** (image key): all 65 Mexican places (13 per city, including schools and bus terminals). About $2.
5. **Review.** A contact sheet of all 65, city by city (the cloud session fetches them from the laptop and builds it). Flag any with stray lettering, costumes or a muddled scene; regenerate only those with `--only`.
6. **Clean up** (below).

## Clean-up

Found 2026-10-14:
- **39 image files nothing uses (about 24 MB).** Italy: 29 old city-card variants (`*-backup`, `*-atmospheric`, `*-no-hints`), 4 places (`assisi.jpg`, `scuola.jpg`, `stazione.jpg`, `bar-trastevere-giulia-pastel.jpg`), 4 portraits (`luca-barista`, `maria-vendor`, `magda-italian`, `ticket-seller-italian`). Mexico: `places/escuela.jpg`, `places/terminal.jpg`, `portraits/magda-mexican.jpg`, `portraits/ticket-seller-mexican.jpg`. No code refers to any of them (checked). Delete; git keeps them.
- **Oversized files.** Mexican places average about 1 MB each at 1200 × 1200, and 6 are still 1024 × 1024. Resizing only works on a Mac today (`sips`). Use `sharp` (already installed with Next) to resize and save at JPEG quality ~82 everywhere: roughly half the size, no visible loss at phone size. Apply to the regenerated Mexican places; Italy's 1,300 images (750 MB) can follow separately.
- **Manifest.** Reset the Mexican place entries in `scripts/image-generation-manifest.es-mx.json` so it matches what was regenerated.
- **Style-test leftovers.** Delete the laptop's `style-test/` folder once the regeneration is approved (not in git). Keep `style-test.mjs` and its config as the record of what was tried.
- **Stop it piling up again.** Extend `npm run test:images` to fail on image files no city, place or person uses.

## Status (2026-10-14)

Steps 1–3 and the clean-up are done (cloud session); see progress.md. Deleted 40 unused files (23 MB); the new check also found Afuera's Magda portrait saved under the wrong name, now fixed. **Next: step 4 on the laptop:**

```
git pull && COUNTRY=es-mx npm run images -- --type place --force
```

Preview the prompts without generating: add `--dry`. Redo single places: `--only id,id`.

## Done when

- All 65 Mexican places are in their city's style, with clean signs.
- `test:images` passes, including the new unused-file check; image folders hold only images in use.
- Josh browses all five cities on the phone and they feel clearly different.
- Not verified until the deploy is checked on the live Afuera site.
