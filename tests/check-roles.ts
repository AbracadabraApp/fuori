// Roles are shown on screen and used in the prompt, so they should be Italian.
// Some generated characters had English roles ("Fruit vendor").
import { cities } from '@/content';

const ENGLISH = /\b(vendor|owner|keeper|maker|seller|guide|baker|gardener|waiter|waitress|server|student|priest|nun|pharmacist|bartender|curator|historian|librarian|bookseller|florist|farmer|cook|master|manager|merchant|operator|conductor|agent|worker|musician|artist|performer|director|jeweler|goldsmith|photographer|roaster|specialist|expert|proprietor|fishmonger|friar|monk|resident|winemaker|producer|shopkeeper|chocolatier|dealer|artisan|ceramicist|gondolier)\b/i;

const bad: string[] = [];
for (const city of cities) {
  for (const c of city.characters ?? []) {
    if (ENGLISH.test(c.role)) bad.push(`${c.name} (${city.name}): "${c.role}"`);
  }
}
if (bad.length) {
  console.error(`${bad.length} English role(s):\n` + bad.slice(0, 20).join('\n'));
  process.exit(1);
}
console.log('OK: every character role is in Italian');
