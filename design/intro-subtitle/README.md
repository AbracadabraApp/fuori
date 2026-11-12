# Intro subtitle: a charcoal band

2026-11-11 · Josh and the cloud chat session · decided from mockups on Josh's own screenshot. Not built.

`before.png` is the intro as it is on Josh's phone; `charcoal-band.png` is the agreed look at the same size (1206 × 2622 px, 3 px to the point). In the mockup, the pale wash over the bottom of the picture and a few specks along the band's edge are left over from the screenshot; they are not part of the design.

## Why

Josh: "not a fan of subtitle font". The intro's English (`IntroSubtitle` in `PersonView.swift`) is the system font, semibold, white, on a dark fade over the portrait. Italy's portraits are ink on white paper, so the first line has almost nothing dark behind it and the fade greys the drawing.

## What was tried

- A paper band with dark words, the picture dissolving into it like smoke (Josh: "thought they could all use a smoke fade/shadow row"). Then Josh: "show me the band as charcoal or similar", and of the charcoal one with the fade: "the placement is weird though. give the band a harder edge minimal shadow and drop the text 1 line height wise".
- Typefaces on the band: Alegreya (serif), Alegreya Sans, Alegreya Sans italic. The mockups Josh went on with use Alegreya Sans.

## The design

- **Band:** solid charcoal (`Tokens.Colors.flapTile`, the departures board's tile), full width, at the bottom of the portrait and on under the home indicator. A hard top edge. A minimal shadow on the picture just above the edge (about 6 pt tall, light). No fade.
- **Words:** `Tokens.Colors.flapInk` in Alegreya Sans medium, 21 pt scaled with the text size, left-aligned, 16 pt from each side, line height about 1.28.
- **Height and placement:** room for three lines above the home indicator. In the mockup the band is 145 pt tall on Josh's phone including the 34 pt home-indicator area, and the first line starts about 30 pt below the band's top edge (one line lower than "against the top"). Claude's suggestion, not yet answered by Josh: centre the text block in the band, so one line doesn't float high and three lines still fit; for two lines that lands where the mockup has it.
- **Fixed height:** the band does not change size as sentences change.
- **Behaviour unchanged:** English only, one sentence at a time, each replacing the last with the short fade there is now. The chat's bubble still takes over on the first question, in its own type.

## How it sits with the conventions (from Josh's question)

Broadcast and streaming subtitles are pale sans-serif words on a dark ground, two lines as a rule (three at most), about 37 to 42 characters a line, each one replacing the last ("pop-on"), changing on sentence or phrase boundaries, and staying up about a second at least. At 21 pt Josh's phone fits about 44 characters a line. Apple gives no subtitle size; what matters there is that the text scales with the person's text size, which this does. Film centres its subtitles; ours stay left-aligned because they sit in a band, like a caption.

## Open

- Centre the block in the band (above).
- A cap at two lines, splitting a longer sentence into two subtitles: Claude's suggestion from the conventions, not decided. It would make the band shorter. It needs the sentence split where the intro's subtitles are timed (`ConversationModel.introSubtitle`), so it is not part of this change.
- The handover on the first question (dark band out, cream bubble and name band in) can only be judged in motion, on the phone.
