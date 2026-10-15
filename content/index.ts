/**
 * The active country pack. One codebase serves every country; each deployment
 * sets COUNTRY (Railway variable), and next.config.ts passes it to the browser
 * as NEXT_PUBLIC_COUNTRY at build time. Default: it.
 *
 * Code imports country content from here, never from content/<country>/
 * directly, so a second country is a new pack, not a code change.
 * Mexico: docs/mexico-version.md.
 */
import { pack as it } from './it/pack';
import { pack as esMx } from './es-mx/pack';

export const packs = { it, 'es-mx': esMx } as const;
export type CountryId = keyof typeof packs;

function activeCountry(): CountryId {
  const id = process.env.NEXT_PUBLIC_COUNTRY || process.env.COUNTRY || 'it';
  if (!(id in packs)) throw new Error(`COUNTRY "${id}" has no content pack (known: ${Object.keys(packs).join(', ')})`);
  return id as CountryId;
}

export const country: CountryId = activeCountry();
export const pack = packs[country];

export const language = pack.language;
export const cities = pack.cities;
export const anchors = pack.anchors;
export const tutor = pack.tutor;
export const voices = pack.voices;
export const elevenLabsVoiceFor = pack.elevenLabsVoiceFor;
export const browserVoiceFor = pack.browserVoiceFor;

/** Image addresses in Cloudflare R2, for the app's API (server only; content/images.ts) */
export { imageListFor } from './images';
