/**
 * What day it is for the characters: the day of the week and the month in
 * the country's own time zone (content/<country>/language.ts → timeZone),
 * never the date itself (Josh, 2026-11-05: "Thursday, November, not 11/9").
 * Added to the character's setting, a fact like the place, not a rule.
 */
import { language } from '@/content';
import { weatherLine, hash, localDay } from '@/lib/weather';

export function todayLine(now: Date = new Date(), timeZone: string = language.timeZone): string {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(now);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone }).format(now);
  return `It's ${weekday}, in ${month}.`;
}

/**
 * The odds that each of a character's threads is in their setting today. A
 * line in the setting is said almost every time it's given (the weather, 8 of
 * 8), so 3 in 10 a thread, with three or four threads, gives most visits one
 * thing to bring up, often none, and a different one another day.
 */
export const THREAD_ODDS = 0.3;

/** The threads this character drew today: seeded by them, the thread and the local date, so they hold all day */
export function threadsToday(characterId: string | undefined, threads: string[] | undefined, now: Date = new Date(), timeZone: string = language.timeZone): string[] {
  if (!characterId || !threads?.length) return [];
  const { date } = localDay(now, timeZone);
  return threads.filter((_, i) => hash(`${characterId}:thread${i}:${date}`) % 1000 < THREAD_ODDS * 1000);
}

/** The setting, then the day, the threads the character drew today and, if they drew it, the city's weather (lib/weather.ts):
 *  "Bar Angolo, a bar in Testaccio. It's Thursday, in November. Today's weather: fog." */
export function withToday(setting: string, now: Date = new Date(), cityId?: string, characterId?: string, threads?: string[]): string {
  const s = setting.trim();
  const day = [todayLine(now), ...threadsToday(characterId, threads, now), weatherLine(cityId, now, characterId)].filter(Boolean).join(' ');
  if (!s) return day;
  return `${/[.!?]$/.test(s) ? s : `${s}.`} ${day}`;
}
