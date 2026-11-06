// Made-up weather (lib/weather.ts; Josh, 2026-11-05): one entry per city per
// local day, the same all day for everyone, and every shown city has all
// twelve months in content/<country>/weather.json. No API calls.
import { cities, language, pack } from '@/content';
import { weatherData, weatherToday, weatherLine } from '@/lib/weather';
import { withToday } from '@/lib/today';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };
const tz = language.timeZone;

// Every shown city has all 12 months, each with at least one entry
const data = weatherData();
for (const c of cities.filter((x) => !x.hidden)) {
  for (let m = 1; m <= 12; m++) check(`${c.id} has month ${m}`, Array.isArray(data[c.id]?.[String(m)]) && data[c.id][String(m)].length > 0);
}

// Same city, same local day: same weather, morning and night
const fake = { town: { '11': ['fog', 'rain', 'sun', '', 'wind', 'grey', 'cold'] }, still: { '11': [''] } };
const morning = new Date('2026-11-05T07:00:00Z'), night = new Date('2026-11-05T21:00:00Z');
check('same day, same weather', weatherToday('town', morning, 'Europe/Rome', fake) === weatherToday('town', night, 'Europe/Rome', fake));
// Different days can differ: across two weeks, more than one kind of day
const seen = new Set(Array.from({ length: 14 }, (_, i) => weatherToday('town', new Date(Date.UTC(2026, 10, 1 + i, 12)), 'Europe/Rome', fake)));
check('different days can differ', seen.size > 1, [...seen]);
// The day turns over by the local clock: 23:30 UTC is already tomorrow in Rome
check('local day', weatherToday('town', new Date('2026-11-05T23:30:00Z'), 'Europe/Rome', fake) === weatherToday('town', new Date('2026-11-06T10:00:00Z'), 'Europe/Rome', fake));
// An empty entry adds nothing
check('empty entry is nothing', weatherToday('still', morning, 'Europe/Rome', fake) === '');
check('unknown city adds nothing', weatherLine('nowhere', morning) === '');
check('no city adds nothing', withToday('At the bar.', morning) === withToday('At the bar.', morning, undefined) && !withToday('At the bar.', morning).includes('weather'));
// A real city on a weather day gets the line after the day, in the setting
const city = cities.find((c) => !c.hidden && data[c.id])!;
const day = Array.from({ length: 60 }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i * 6, 12))).find((d) => weatherToday(city.id, d, tz) !== '');
check(`${city.id} has a weather day`, !!day);
if (day) {
  const s = withToday('At the bar.', day, city.id);
  check('weather follows the day line', /^At the bar\. It's \w+, in \w+\. Today's weather: [^.]+\.$/.test(s), s);
}

if (problems.length) { console.error(`FAIL (${pack.id}):\n${problems.slice(0, 20).join('\n')}`); process.exit(1); }
console.log(`OK (${pack.id}): weather for ${cities.filter((x) => !x.hidden).length} shown cities, 12 months each, one pick per city per local day`);
