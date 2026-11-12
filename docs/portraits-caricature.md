# Italy's portraits: caricature, posing and lettering

2026-11-11 · Josh and the cloud chat session, from Josh's screenshot of Filippo Basile (Palermo) and a look at all 217 Italian portraits on contact sheets.

## The rule (Josh)

"The reason things are stereotypes is because they are widely true - but when stacked - happy chef in whites and toque - big rolly mustache laughing and waving - we have not a stereotype but a caricature." And: "we shouldn't wipe out mustaches or grey hair - but we should avoid caricature."

So, for a portrait prompt:
- Any one or two true traits stay (a moustache, grey hair, an apron, a uniform).
- Never stack costume, build, facial hair, a big mood and a prop on one person.
- Nobody performs for the viewer: no waving, presenting or holding things up. People are caught doing their own thing.
- No labels that ask for a type: "classic", "typical", "robust market vendor", "larger than life", "jovial".
- Give an age and a particular face, and say what the person is doing.

The image model exaggerates by itself (Gennaro's prompt said "folding a small pizza in four"; the picture presents a whole pizza to the viewer), so prompts are half of it: new portraits are looked at before they're kept.

## What changed

- `content/it/generation.json` → `portraitRules`, added to every Italian portrait prompt by `scripts/generate-images.mjs`: unposed, one particular person, no words anywhere in the picture.
- 17 prompts rewritten (`content/it/cities/`). Caricature or posing (9): sergio-rialto, dante-mori, marco-chen, gennaro-pizzaiolo, bruno-simoni, vito-abbate, filippo-basile, giovanni-repetto, ezio-ruffini. Borderline (8; Josh: "caricature and borderline redo"): carlo-gondoliere, carmela-todaro, toto-meusaro, salvatore-leone, bruno-albertini, leonardo-marchesi, gianni-bigliettaio-orvieto, mario-benedetti.

## For the mini

`npm run images -- --type portrait --force --only sergio-rialto,dante-mori,marco-chen,gennaro-pizzaiolo,bruno-simoni,vito-abbate,filippo-basile,giovanni-repetto,ezio-ruffini,carlo-gondoliere,carmela-todaro,toto-meusaro,salvatore-leone,bruno-albertini,leonardo-marchesi,gianni-bigliettaio-orvieto,mario-benedetti`, then `npm run images:upload`, `scripts/image-masters.mjs --untrack`, commit, push. The cloud chat session then looks at the 17 from R2 and names any to redo.

## Not done

- **Colour: skipped (Josh: "skip color").** Measured on the pictures: 63 of 217 have no colour at all and 36 only a faint wash; Roma has none without colour, Matera 7 of 11. The prompts ask for a "minimal watercolor wash" and the model often gives none.
- **Lettering: not decided.** About 36 more portraits have English or invented words drawn in ("Keeper of Tradition", "Master Roaster", "Ticket Office", "Michelin", quotes, name tags): chiara-castellani, leonardo-conti, franco-stazione, marco-terzi, chef-matteo-ricci, conductor-davide, grazia-salamone, alberto-marino, beatrice-amato, elena-giardini, giuseppe-taurino, lucio-faggiano, carlo-ferraro, maestro-orlando, francesco-bra, paolo-stazione, vittorio-cerea, beatrice-castelli, michele-pezzotta, elena-guida, teresa-libraio, marco-cioccolataio, alberto-piazza, roberto-stazione, stefano-raggi, alessio-martinelli, paolo-montanucci, alberto-santini, matteo-galeotti, giorgio-bar, marcello-guida, marco-bigliettaio, antonio-gelataio, federico-salumiere, roberto-albano. `portraitRules` now forbids words, so a redraw with `--force --only` those ids would clear them. Read at thumbnail size; a few may be wrong.
- Mexico's 120 portraits were not looked at.
