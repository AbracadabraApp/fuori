# The polaroid card (spec)

The feed card for cities and places, as Josh approved it on 2026-11-16 (B38). The picture of record is **board 7, "Together"**, on the card studies canvas (https://claude.ai/artifact/AHEGUxWKMoCVqPSHeCkGvy). The numbers below are taken from that board. Where this file and the board disagree, the board wins; fix this file.

Josh's words: "polaroid - but with a different shadow"; "i think curled corners on poloroids"; "I think stamp in namespace"; "tighter still on leading" (2026-11-16).

Code: `ios/FuoriKit/Sources/FuoriDesign/PolaroidCard.swift`, the stamp in `VisitStamp.swift` (`.ink`), used by `PlaceListView.swift` and `CityListView.swift`. Sizes and colours come from `design/tokens.json`.

## The card (at 390 pt screen width)

| Part | Board 7 | Token |
|---|---|---|
| Card | white `#ffffff`, the screen width less the 16 pt gutters (358 pt) | `card`, `gutter` |
| Corners | 3 pt | `radius.polaroid` |
| Frame | 12 pt white on all four sides of the picture | `space.polaroidFrame` |
| Picture | square (334 × 334 pt), cropped to fill, no corners of its own | |
| Card's own shadow | `0 1 3 rgba(0,0,0,0.22)`, **on the white card only** | `shadow.polaroid` |
| Gap between cards | 24 pt | |

## The caption

| Part | Board 7 | Token |
|---|---|---|
| Padding under the picture | 14 pt top, 4 pt sides, 18 pt bottom (plus the 12 pt frame) | |
| Name | Alegreya bold 32 pt, black, line height 1.0 (a two-line name reads as one name) | `cardTitle`, `ink` |
| Line under it | Alegreya Sans 17 pt, `#595959` | `cardSubtitle` |
| Gap name to line | 6 pt | |
| Text shadow | **none**: no letter casts a shadow | |

## The curled corners

The print's two lower corners lift. Shown only by a shadow: two bars hidden behind the card, never seen themselves.

| Part | Board 7 |
|---|---|
| Each bar | 46% of the card's width, 24 pt tall |
| Position | 10 pt in from the left and right edges, its bottom 14 pt above the card's bottom |
| Tilt | left bar −4°, right bar +4° (so the shadow is deepest at the outer corners and fades toward the middle) |
| Shadow | `0 16 14 rgba(0,0,0,0.45)` (`shadow.curl`), as dark as that: the bar casting it is solid, not see-through |
| Layer | behind the card, inside the card's outline, so only the shadow below the bottom edge shows |

## The visited stamp

Beside the name in the caption, top-aligned with it, 10 pt to its right (2 pt down); nothing on the picture. A round stamp 60 pt across (`size.stampInk`), turned −6°: two rings, the word along the top arc, a check mark. Green `#566330` for visited ("YA FUISTE"), terracotta `#c0603a` for a regular ("DE CASA"); the words from `/v1/content`. A long name wraps beside it rather than running under it.

## Checking it

Before calling it done, look at the built card next to board 7 (a screenshot of the simulator or Josh's phone beside the board, same width):
- no shadow on any letter;
- two corner shadows under the card, darker at the outer corners, lighter in the middle; not one even band;
- the frame even on three sides and deeper below the caption;
- a two-line name with its lines close;
- the stamp to the right of the name, nothing over the picture.

## Where the build differs (2026-11-17)

- **Fixed on main, not yet in a build** (5510136): the shadow on every letter, and the curl too faint (see-through bars).
- **Still off:** the caption's bottom padding is 6 pt (board 7: 18 pt); the gap between cards is 20 pt (`cardGap`; board 7: 24 pt); the line under the name is `muted` `#666666` (board 7: `#595959`).
- **Not the card:** a place whose neighbourhood is its own name prints it twice ("Karim Benali, guida turistica · Piazza del Campo").
