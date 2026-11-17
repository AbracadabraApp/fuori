# Recipe: check and ship the level up page and the new cards

2026-11-16 · written by the cloud session for a laptop session (the mini), on Josh's word ("all good - write any recipe you need"). The cloud session has no Swift toolchain, no simulator and no image key, so three pieces of app work were written blind and rest on CI. This is what is left for a Mac. Do the steps in order; stop and tell Josh where a step says so.

## What was built (all on `main`, none released)

| Bug | What | Where |
|---|---|---|
| B42 | The level up page, redrawn: "Checking in!" band, the welcome's character, their question in the speech bubble, a bar of steps, Stay and Next | `LevelUpView.swift`, `lib/level-up.ts` (`asker`, `bar`), `levelUp` words in both `language.ts` |
| B38 | Cards as polaroids with a curled-corner shadow, tighter names, the visited stamp beside the name | `PolaroidCard.swift`, `VisitStamp.swift` (`.ink`), `PlaceListView.swift`, `CityListView.swift` |
| B43 | The level up page waits while a conversation is on screen | `AppModel.swift`, `RootView.swift` |
| B37 | The Mexico ticket sheet fits ticket, map and key on one screen | `TripSheet.swift` |
| B44 | Nino Ferretti plays Italy's welcome | `content/it/onboarding.ts` |

The agreed pictures of B42 and B38 are on the card studies canvas (https://claude.ai/artifact/AHEGUxWKMoCVqPSHeCkGvy): board 8 for the level up page, board 7 for the card. Josh's words for every decision are in `docs/bugs.md` under each number.

## 1. Build

`git pull --rebase origin main`, then `cd ios && make build`. CI passed on each commit, so a failure here is a local matter.

## 2. One look at each screen (this is the "new or changed screen" look; one screenshot each, then close the simulator)

`npm run dev:sim -- es-mx beginner`, launch with `-FuoriServer http://localhost:3100 -FuoriMute YES`.

**The level up page:** add `-FuoriLevelUp YES`. Compare with board 8. It should show, top to bottom: a tan band reading "Checking in!" with "Doña Chela Martínez" under it; her portrait; a parchment speech bubble on the left with the question, its second sentence bold; a bar of six rounded segments, the first grey with "Now" under it and the second yellow with a white ring and "Next" under it, "More English" and "All Spanish" above the ends; two raised buttons side by side, grey "Stay" with a pause sign on its left and yellow "Next" with a play sign on its right; all on teal. Then the same in Italy (`npm run dev:sim -- it beginner`): Nino Ferretti, "All Italian", on terracotta.

Fix on sight, without asking: anything cut off, overlapping or unreadable; the band's top padding if the sheet's grabber crowds it; the portrait's height if the buttons fall below the fold on a small phone (it is `aspectRatio(390 / 380)` in `LevelUpView`). Ask Josh before changing: words, colours, the order of things.

**A place list and the city list:** open a city with at least one visited place. Compare with board 7. Each card should be a white-framed square picture with the name below; under the two lower corners the shadow should deepen and lift, and fade in the middle; a two-line name should read as one name, the lines close; the round stamp should sit to the right of the name, tilted a little, with nothing over the picture. Check one card with a chalk menu: the dishes must still sit on the picture's blank board (the overlay is now inset by the frame).

Known risks to look for: the curled shadow showing as two dark bars (then the bars are not hidden behind the card: check `CurledCorners` sits in `.background`); names still loose (then `.lineHeight(.multiple(factor: 1.0))` is a multiple of the font's own line height, not its point size: use a fixed height of about the point size, scaled, and say so in B38); the stamp squeezing long names to three lines (then shrink `stampInk` in `design/tokens.json` and run `npm run tokens`).

Send Josh the screenshots. He judges the look; the simulator passing is not approval (CLAUDE.md → Testing a screen).

## 3. Housekeeping from earlier work

- The Mexico map master is still tracked in git (`public/images/es-mx/travel/map.jpg`): `npm run images:upload`, then `node scripts/image-masters.mjs --untrack`, commit.
- Luisa Cocco's portrait (B44): Josh said skip. Leave it.

## 4. Release, only on Josh's word

A release goes with a new build on his phone or TestFlight. When he says so: `npm run release` from `~/fuori` (it runs `smoke:live` in both countries), read `railway logs`, then install the build after his yes. Don't run the welcome or onboarding as a test without his approval.

## 5. What Josh then checks on his phone (each closes its bug only when he has seen it)

- B37: Mexico's ticket sheet shows the numbered key without scrolling.
- B43: a level up offer never opens over a conversation.
- B42: the page as above, after the third counted conversation at a step; Stay asks again three conversations later, Next moves a step.
- B38: the cards.
- B44: Nino only shows in the welcome, so only for a learner who restarts onboarding in Settings.

## Not built, and why

- The character does not say the level up question aloud (not decided).
- The earlier level up page's words and its two example lines are still sent, so older builds keep working; the rewrite call behind them can be removed once the new build is on every phone.
- What each step is said to change (Josh: "we need to nail down what changes by level") is open; the page no longer says it. Today's steps are listed in B42.
