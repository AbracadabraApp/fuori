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
    // From this neighbourhood on, take the first place whose kind wasn't shown
    // in the last few cards. If this area only has repeats left, move on to the
    // next area that has something different (Puebla and Guadalajara showed two
    // plazas in a row once schools and terminals were added); repeat a kind only
    // when no area has anything else.
    let q: Place[] | undefined;
    let pick = -1;
    for (let step = 0; step < queues.length && pick === -1; step++) {
      const candidate = queues[(i + step) % queues.length];
      const k = candidate.findIndex((p) => !recent.includes(p.kind));
      if (k !== -1) {
        q = candidate;
        pick = k;
        i += step;
      }
    }
    if (!q) {
      while (!queues[i % queues.length].length) i++;
      q = queues[i % queues.length];
      pick = 0;
    }
    i++;
    const [place] = q.splice(pick, 1);
    out.push(place);
    recent.push(place.kind);
    if (recent.length > RECENT_KINDS) recent.shift();
  }
  return out;
}
