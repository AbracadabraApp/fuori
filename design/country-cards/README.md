# Country cards

The pictures for choosing Italy or Mexico when the app starts (one app, two countries: docs/12-native-app.md decision 1; onboarding in docs/language-levels-plan.md#onboarding). Picked by Josh, 2026-10-15.

- **Style:** the Mexico City place style (bright daylight photography), so the two cards match.
- **Content:** evocative of the country, not one real place (Josh: "the image doesn't have to be real as much as evocative of the country"). Both are a sunny street with one person, so the cards pair in shape while colour and details tell them apart.
- Tried and not picked: a market stall and a plaza for Mexico, a café bar and a table under the vines for Italy; also folk (naive, amate) and Romantic (oil, watercolour) versions.
- Not yet on R2: upload with the app's images when the country choice is built.

## Greeters (onboarding)

Josh, 2026-10-15: the woman in the country picture you tap does your onboarding. She exists only in onboarding (not a character in the world, no home city), and afterwards you land on the country's city list as usual.

- `it-greeter.jpg`: the grandmother waving from her window. `es-mx-greeter.jpg`: the young woman holding her bouquet with both hands (she keeps her bag).
- Made with xAI's image edit (`POST /v1/images/edits`, the country card as the reference image, 2:3), so face, clothes, light and setting match the card. Prompt: reframe as a closer vertical portrait looking at the camera, "keep it the same photograph: the same woman (same face, age, hair and clothes), the same place, the same bright sunny light", "exactly two arms and two hands". Check hands before using any image of people: one Mexico try had three.

## Prompts (xAI grok-imagine-image-2.0, 1:1, 2k, resized to 1200×1200 JPEG)

`es-mx.jpg`:
```
Bright photorealistic photograph, eye level, crisp detail, true-to-life saturated colour, bright late-morning sun and dappled light; no haze, no deep dark shadows. Evocative rather than documentary: it should feel unmistakably like this country at a glance. The scene: Mexico: a sunlit street of brightly painted houses in rosa mexicano, cobalt and marigold, bougainvillea spilling over a wall, Talavera tiles around a doorway, papel picado strung across the street, a woman walking with an armful of flowers, a church dome against a deep blue sky. Contemporary everyday life, today's clothes; no costumes, no sombreros, no skulls, no gondolas, no clichés. No text, no lettering, no signs. Keep the main subject in the centre. Square format.
```

`it.jpg`:
```
Bright photorealistic photograph, eye level, crisp detail, true-to-life saturated colour, bright late-morning sun and dappled light; no haze, no deep dark shadows. Evocative rather than documentary: it should feel unmistakably like this country at a glance. The scene: Italy: a narrow sunlit lane of ochre and terracotta houses with green shutters, washing on a line between balconies, pots of geraniums and basil on a windowsill, an older woman chatting from her window to a neighbour below, a scooter, a glimpse of blue sea at the end of the lane. Contemporary everyday life, today's clothes; no costumes, no sombreros, no skulls, no gondolas, no clichés. No text, no lettering, no signs. Keep the main subject in the centre. Square format.
```
