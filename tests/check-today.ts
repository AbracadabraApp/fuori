// Characters know the day of the week and the month in the country's own
// time zone (lib/today.ts), and it reaches the setting of both prompts. No API calls.
import { todayLine, withToday } from '@/lib/today';
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

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: characters know the day and the month (${pack.id}, ${language.timeZone})`);
