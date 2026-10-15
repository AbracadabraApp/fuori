/**
 * Platform and seat for a trip from one city to another, made by the app so the
 * ticket and the ticket seller agree (docs/station-feature-decision.md).
 * Deterministic: the same route always uses the same platform. No departure
 * time on the ticket (Josh, 2026-10-14): the seller is free to talk times.
 */
export interface Departure {
  platform: number;
  seat: number;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function departureFor(fromId: string, toId: string): Departure {
  const h = hash(`${fromId}>${toId}`);
  return { platform: 1 + (h % 12), seat: 11 + ((h >>> 5) % 78) };
}

/**
 * The ticket seller's setting once a destination is chosen. Framed as something
 * the person has just said, so the seller opens on the trip ("Per Firenze?")
 * rather than asking where they're going: "is buying a ticket to X" alone got
 * "Dove va oggi?" in both countries (live check, 2026-10-14).
 */
export function clerkSetting(setting: string, destination: string, platform: number): string {
  return `${setting}. The person has just told you they want a ticket to ${destination}; it leaves from platform ${platform}.`;
}
