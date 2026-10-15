/**
 * Building a place image prompt from a city style, the place's scene and its
 * sign (docs/mexico-place-images-plan.md). Shared by generate-images.mjs and
 * style-test.mjs so the test and production can't drift apart.
 *
 * Lessons from the 2026-10-14 style test: lettering made the old images look
 * dated (the word "today" was painted as HOY; signs added neighbourhood and
 * city names, slogans and brand logos), so the sign is given word for word
 * and is the only lettering.
 */

/** The scene alone: drops an old style opening, ", today", colour and format lines */
export function cleanScene(prompt) {
  let p = prompt.replace(/\\'/g, "'");
  p = p.replace(/^.*?in bright colou?r, of /i, '');
  p = p.replace(/,\s*today\./i, '.');
  p = p.replace(/\s*Bold colou?r:[^.]*\.\s*/i, ' ');
  p = p.replace(/\s*Square format[^.]*\.?\s*$/i, '');
  return p.trim();
}

/** The full prompt: style, scene, the sign word for word, then the rules */
export function buildPlacePrompt({ style, scene, sign, rules }) {
  const signLine = sign
    ? `The sign reads "${sign}", and that sign is the only lettering in the picture.`
    : 'No lettering anywhere in the picture.';
  return `${style}. The scene: ${scene} ${signLine} ${rules} Square format.`;
}
