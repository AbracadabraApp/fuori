/**
 * Each country's trip map (content/<country>/travel-map.json): where every
 * city sits on the painted map shown after boarding at a station, and which
 * city names always show for orientation. The picture has no cities on it;
 * the app draws the names, the two buildings and the route, so a name can't be
 * misspelled or on the wrong coast (Josh, 2026-11-11, after ten generated maps
 * each got the boot or the twenty cities right, never both).
 * Read by /v1/content (lib/content-api.ts → travelMap).
 */
import it from './it/travel-map.json';
import esMx from './es-mx/travel-map.json';
import type { CountryId } from './index';

export interface TravelMap {
  /** The picture's width divided by its height */
  aspect: number;
  /** A city's spot on the picture, as fractions from the top left */
  cities: Record<string, { x: number; y: number }>;
  /** Cities whose names show on every trip, for orientation */
  anchors: string[];
}

const maps: Record<CountryId, TravelMap> = { it, 'es-mx': esMx };

export function travelMapFor(country: CountryId): TravelMap {
  return maps[country];
}
