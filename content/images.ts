/**
 * Each country's image list (content/<country>/images.json, written by npm run
 * images:upload): image id → file in Cloudflare R2. Kept out of the country
 * packs so the web page's bundle doesn't carry ~1,500 entries it never uses;
 * only the server reads it (lib/content-api.ts).
 */
import it from './it/images.json';
import esMx from './es-mx/images.json';
import type { CountryId } from './index';

export interface ImageList {
  base: string;
  images: Record<string, { key: string; src: string; bytes: number }>;
}

const lists: Record<CountryId, ImageList> = { it, 'es-mx': esMx };

export function imageListFor(country: CountryId): ImageList {
  return lists[country];
}
