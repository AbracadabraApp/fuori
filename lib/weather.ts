/**
 * Today's weather for a city, made up, not fetched (Josh, 2026-11-05: "weather
 * could just be made up, doesn't need to be complicated"). content/<country>/
 * weather.json holds a short list of plausible days per city and month; one is
 * picked per city per local day (language.timeZone, as in lib/today.ts), seeded
 * by the city and the date, so everyone in a city agrees all day. Repeats
 * weight the pick; an empty entry is an ordinary day with nothing to say.
 * Nothing to fetch, nothing that can fail.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cities, language, pack } from '@/content';
import type { CharacterSheet } from '@/lib/types';

type Weather = Record<string, Record<string, string[]>>;
let cached: Weather | undefined;
export function weatherData(): Weather {
  if (cached) return cached;
  const path = join(process.cwd(), 'content', pack.id, 'weather.json');
  cached = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Weather) : {};
  return cached;
}

/** The local date, 2026-11-05, and month, 11, on the country's clock */
export function localDay(now: Date, timeZone: string) {
  const date = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(now);
  return { date, month: String(Number(date.slice(5, 7))) };
}

/** FNV-1a: a small stable hash, the same on every server */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h;
}

/** Today's entry for the city: "fog", or '' for an ordinary day */
export function weatherToday(cityId: string, now: Date = new Date(), timeZone: string = language.timeZone, data: Weather = weatherData()): string {
  const { date, month } = localDay(now, timeZone);
  const days = data[cityId]?.[month] ?? [];
  return days.length ? days[hash(`${cityId}:${date}`) % days.length].trim() : '';
}

/**
 * The odds that a character is given the day's weather (Josh, 2026-11-05: "just
 * set the odds - a bar can talk about the weather, a market can ignore it").
 * Given the line, characters bring it up almost every time (test:conversations,
 * 8 of 8 on a weather day), so 1 in 4 aims at about one conversation in four.
 */
export const WEATHER_ODDS = 0.25;

/** Whether this character is given the weather today: seeded by them and the local date, so it holds all day */
export function hasWeather(characterId: string, now: Date = new Date(), timeZone: string = language.timeZone): boolean {
  return hash(`${characterId}:${localDay(now, timeZone).date}`) % 1000 < WEATHER_ODDS * 1000;
}

/** "Today's weather: fog." or '': only for a character who drew it today */
export function weatherLine(cityId: string | undefined, now: Date = new Date(), characterId?: string): string {
  const w = cityId && characterId && hasWeather(characterId, now) ? weatherToday(cityId, now) : '';
  return w ? `Today's weather: ${w.replace(/[.!?]$/, '')}.` : '';
}

/** The character's city id, from their place (or the city's name) */
export function cityIdFor(character: Pick<CharacterSheet, 'placeId' | 'city'>): string | undefined {
  return (cities.find((c) => c.places.some((pl) => pl.id === character.placeId)) ?? cities.find((c) => c.name === character.city))?.id;
}
