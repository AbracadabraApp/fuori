# The visited badge

2026-10-29 · Josh · **Locked** (Josh: "keep the circle - its all locked"). Replaces today's green circle with a number on the place card. Mockup with every exploration: the "Visited Badges" artifact in the Claude app (https://claude.ai/artifact/7cDsHADmkNh6GwRsmsLt5U); the final, at phone-card size: [design/visited-badge/final.png](../design/visited-badge/final.png). Not built.

## The badge

- **Where:** pinned in the **top right corner of the place picture**, over the sky where most pictures are empty. Not on the edge between picture and caption, not in the caption (tested side by side; the corner adds to the scene and leaves the name clean).
- **What:** a **scontrino**, the till receipt every Italian bar hands you: off-white thermal paper (#fffdf7), a torn zigzag bottom edge, cut tight around its contents, a soft shadow (0, 3, 8, 25%), tilted a few degrees (about −4° and +4°, varying by card so a list doesn't look machine-stamped).
- **End of the roll:** a 7 pt stripe down its right edge, the warning a till roll shows when it's nearly out. **Green** (#7d8c46) for a first visit, **red** (#e2574c) for a regular. The stripe's colour isn't a real roll's; the point is that it matches the stage.
- **The stamp:** a round rubber stamp, **circle with a double ring**, about 76 pt, slightly rough edged, inked on the receipt. First visit: **olive** (#566330) *GIÀ VISTO*. Regular: **terracotta** (#c0603a) *DI CASA*, with a small underline curve.
- **The word:** under the stamp, in small caps (Alegreya Sans bold, about 12 pt, 0.1em spacing), in the stamp's ink: **Visited** or **Regular**.

## Stages

1. **Visited** after the first conversation there.
2. **Regular** after about five visits (the number is a proposal; Josh to confirm).

## Rules it has to follow

- The Italian words (*già visto*, *di casa*) and the English labels come from `/v1/content`, never from Swift: Mexico gets its own (e.g. *ya fuiste*, *de casa*).
- Text sizes from text styles, so the badge scales with Dynamic Type; VoiceOver reads "Visited" or "Regular".
- Explored and set aside (see the artifact): a seal across the edge (Josh's least favourite), the badge in the caption or the title, a paper tag, a ticket stub, other papers (kraft, pink and yellow carbon, stripes, city tints), other stamp shapes (rectangular timbro, marca da bollo, octagon).
