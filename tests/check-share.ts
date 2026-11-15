// The rough share of the language in a line (lib/dialogue/share.ts), and the debug panel's wiring
//   npx tsx tests/check-share.ts
import { readFileSync, existsSync } from 'node:fs';
import { languageShare, languageWords } from '@/lib/dialogue/share';
import { RATINGS } from '@/lib/turn-ratings';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

check(languageShare([{ line: 'Come in, sit here.', en: 'Come in, sit here.' }]) === 0, 'an English line is 0%');
check(languageShare([{ line: 'Pase, siéntese aquí.', en: 'Come in, sit here.' }]) === 100, 'a line all in the language is 100%');
const mixed = languageWords('Pase, pase, come in, sit here.', 'Come in, sit here.');
check(mixed.inLanguage === 2 && mixed.all === 6, 'a mixed line counts the words that are not in its English');
check(languageShare([]) === null && languageShare([{ line: '', en: '' }]) === null, 'no words: null, not 0');
check(languageShare([{ line: 'Pase.', en: 'Come in.' }, { line: 'Come in.', en: 'Come in.' }]) === 33, 'the share over several lines is by words');

// The connection, not just the parts: the turn sends the debug facts, and the route the app calls exists
const route = readFileSync('app/v1/turn/route.ts', 'utf8');
check(/debug: result\.debug/.test(route), '/v1/turn sends the debug facts');
check(existsSync('app/v1/rate/route.ts') && /export async function POST/.test(readFileSync('app/v1/rate/route.ts', 'utf8')), '/v1/rate has POST');
check(/CREATE TABLE IF NOT EXISTS turn_ratings/.test(readFileSync('scripts/db-migrate.mjs', 'utf8')), 'the ratings table is in the migration');
check(RATINGS.join() === 'good,bad,bug', 'the three ratings');
const api = readFileSync('ios/FuoriKit/Sources/FuoriNetworking/APIClient.swift', 'utf8');
check(/"v1\/rate"/.test(api), 'the app calls /v1/rate');

if (problems.length) {
  console.error(`check-share: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-share: ok');
