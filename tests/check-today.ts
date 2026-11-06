// Characters know the day of the week and the month in the country's own
// time zone (lib/today.ts), and it reaches the setting of both prompts. No API calls.
import { todayLine, withToday, threadsToday, THREAD_ODDS } from '@/lib/today';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { language, pack } from '@/content';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

// 23:30 UTC on Thursday 5 November 2026: already Friday in Rome, still Thursday in Mexico City
const late = new Date('2026-11-05T23:30:00Z');
check('Rome is past midnight', todayLine(late, 'Europe/Rome') === "It's Friday, in November.", todayLine(late, 'Europe/Rome'));
check('Mexico City is not', todayLine(late, 'America/Mexico_City') === "It's Thursday, in November.", todayLine(late, 'America/Mexico_City'));
check('month turns over by the local clock', todayLine(new Date('2026-11-30T23:30:00Z'), 'Europe/Rome') === "It's Tuesday, in December.", todayLine(new Date('2026-11-30T23:30:00Z'), 'Europe/Rome'));
check('no date numbers', !/\d/.test(todayLine(late)), todayLine(late));
check('the country has a time zone', typeof language.timeZone === 'string' && language.timeZone.includes('/'), language.timeZone);
check('added after the setting', withToday('Bar Angolo, a bar in Testaccio', late).startsWith('Bar Angolo, a bar in Testaccio. It'), withToday('Bar Angolo, a bar in Testaccio', late));
check('no doubled full stop', !withToday('At the market.', late).includes('..'), withToday('At the market.', late));
check('empty setting still gets the day', withToday('', late) === todayLine(late), withToday('', late));

// Threads (docs/conversation-variety.md → C): drawn per character per local day, at about THREAD_ODDS each
const threads = ['one', 'two', 'three', 'four'];
check('a thread draw holds all day', JSON.stringify(threadsToday('x', threads, new Date('2026-11-05T08:00:00Z'), 'UTC')) === JSON.stringify(threadsToday('x', threads, new Date('2026-11-05T20:00:00Z'), 'UTC')));
const days = Array.from({ length: 400 }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)));
const share = days.reduce((n, d) => n + threadsToday('tommaso-bini', threads, d, 'UTC').length, 0) / (days.length * threads.length);
check(`threads drawn at about ${THREAD_ODDS}`, Math.abs(share - THREAD_ODDS) < 0.06, share);
check('different days draw differently', new Set(days.slice(0, 30).map((d) => threadsToday('tommaso-bini', threads, d, 'UTC').join('|'))).size > 3);
check('no threads, nothing added', threadsToday('x', undefined) .length === 0 && threadsToday(undefined, threads).length === 0);
const drawnDay = days.find((d) => threadsToday('x', threads, d).length)!;
check('drawn threads reach the setting', threadsToday('x', threads, drawnDay).every((t) => withToday('At the bar.', drawnDay, undefined, 'x', threads).includes(t)));
// Every character with threads carries them to the sheet both prompts read
for (const c of cities) for (const p of c.places) {
  const person = c.characters?.find((x) => x.id === p.characterId);
  if (!person?.threads?.length) continue;
  check(`${person.id}: threads reach the character sheet`, JSON.stringify(characterForPlace(c, p)?.appearance.threads) === JSON.stringify(person.threads));
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: characters know the day and the month (${pack.id}, ${language.timeZone})`);
