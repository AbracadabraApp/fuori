/**
 * What each country's ticket seller knows about a trip (content/<country>/
 * stations.json, written by the cloud session): what the destination is known
 * for, and how long the trip takes from here. Keyed by city id; trips by the two
 * ids in alphabetical order, "a|b". Read by the seller's setting
 * (lib/travel/departure.ts → clerkSetting).
 */
import it from './it/stations.json';
import esMx from './es-mx/stations.json';
import type { CountryId } from './index';

export interface Stations {
  cities: Record<string, string>;
  trips: Record<string, string>;
}

const lists: Record<CountryId, Stations> = { it, 'es-mx': esMx };

export function stationsFor(country: CountryId): Stations {
  return lists[country];
}
