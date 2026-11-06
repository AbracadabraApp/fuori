/**
 * What day it is for the characters: the day of the week and the month in
 * the country's own time zone (content/<country>/language.ts → timeZone),
 * never the date itself (Josh, 2026-11-05: "Thursday, November, not 11/9").
 * Added to the character's setting, a fact like the place, not a rule.
 */
import { language } from '@/content';
import { weatherLine } from '@/lib/weather';

export function todayLine(now: Date = new Date(), timeZone: string = language.timeZone): string {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(now);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone }).format(now);
  return `It's ${weekday}, in ${month}.`;
}

/** The setting, then the day and, when the city has some today, the weather (lib/weather.ts):
 *  "Bar Angolo, a bar in Testaccio. It's Thursday, in November. Today's weather: fog." */
export function withToday(setting: string, now: Date = new Date(), cityId?: string): string {
  const s = setting.trim();
  const day = [todayLine(now), weatherLine(cityId, now)].filter(Boolean).join(' ');
  if (!s) return day;
  return `${/[.!?]$/.test(s) ? s : `${s}.`} ${day}`;
}
