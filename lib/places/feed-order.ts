/**
 * Order a city's places for the feed: rotate through the neighbourhoods so the
 * first screen isn't all one area, and avoid repeating a kind of place (bar,
 * bakery…) within the last few cards. Deterministic, so the feed is stable.
 */
import type { CityPantry, Place } from '@/lib/types';

const RECENT_KINDS = 3;

export function feedOrder(city: CityPantry): Place[] {
  // One queue per neighbourhood, in file order; places in unlisted areas go last
  const areas = [...city.neighbourhoods];
  for (const p of city.places) if (!areas.includes(p.neighbourhood)) areas.push(p.neighbourhood);
  const queues = areas.map((a) => city.places.filter((p) => p.neighbourhood === a));

  const out: Place[] = [];
  const recent: string[] = [];
  let i = 0;

  while (queues.some((q) => q.length)) {
    const q = queues[i % queues.length];
    i++;
    if (!q.length) continue;
    // Prefer the first place here whose kind wasn't shown in the last few cards
    let pick = q.findIndex((p) => !recent.includes(p.kind));
    if (pick === -1) pick = 0;
    const [place] = q.splice(pick, 1);
    out.push(place);
    recent.push(place.kind);
    if (recent.length > RECENT_KINDS) recent.shift();
  }
  return out;
}
