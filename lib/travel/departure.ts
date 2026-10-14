/**
 * The next departure from one city to another: platform and time, made by the
 * app (not the ticket seller) so the ticket and the clerk always agree
 * (docs/station-feature-decision.md). Deterministic: the same route always
 * uses the same platform and leaves at the same minutes past the hour.
 * Departures run every 30 minutes; the next one is at least 8 minutes away.
 */
export interface Departure {
  platform: number;
  /** 24-hour clock, "14:35" */
  time: string;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function departureFor(fromId: string, toId: string, now: Date = new Date()): Departure {
  const h = hash(`${fromId}>${toId}`);
  const platform = 1 + (h % 12);
  const offset = (h >>> 4) % 30; // minutes past the hour (and +30)
  const earliest = now.getHours() * 60 + now.getMinutes() + 8;
  let t = Math.floor(earliest / 30) * 30 + offset;
  while (t < earliest) t += 30;
  t %= 24 * 60;
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return { platform, time: `${hh}:${mm}` };
}
