/**
 * Platform and seat for a trip from one city to another, made by the app so the
 * ticket and the ticket seller agree (docs/station-feature-decision.md).
 * Deterministic: the same route always uses the same platform. No departure
 * time on the ticket (Josh, 2026-10-14): the seller is free to talk times.
 */
import { country, stationsFor, type Stations } from '@/content';

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

/** The trip facts the seller knows (content/<country>/stations.json): what the destination is known for, how long it takes */
export function tripFacts(fromId: string, toId: string, destination: string, stations: Stations = stationsFor(country)): string {
  const known = stations.cities[toId];
  const trip = stations.trips[[fromId, toId].sort().join('|')];
  return [known && `${destination} is known for ${known}.`, trip && `The trip from here takes ${trip}.`].filter(Boolean).join(' ');
}

/**
 * The ticket seller's setting once a destination is chosen: the person's own
 * words, quoted, so the seller opens on the trip ("Per Napoli, eh?"). "Has just
 * told you they want a ticket to X" had worked (2026-10-14) but by 2026-11-05
 * sellers asked "Dove va oggi?" 15 of 18 times; the quoted words, 0 of 18
 * (docs/prompt-trials.md). Then the trip facts, as facts like the place, not a rule.
 */
export function clerkSetting(setting: string, destination: string, platform: number, facts = ''): string {
  return `${setting.trim().replace(/[.!?]$/, '')}. They've just said: "A ticket to ${destination}, please." It leaves from platform ${platform}.${facts ? ` ${facts}` : ''}`;
}
