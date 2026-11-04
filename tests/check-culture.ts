// Cultural lessons (lib/culture.ts, content/<country>/culture.json): every
// item has a shown teller at its place, a chip of at most four words, one or
// two words worth keeping, and checked facts; the set resolves; the story
// brief fills and ends on the third turn; a cultural lesson's plan and prompt
// version are what the app and the Learn page read. No network.
//   tsx tests/check-culture.ts (COUNTRY=es-mx for Mexico)
import { readFileSync } from 'fs';
import { cities, pack } from '@/content';
import { cultureSet, storyBrief, STORY_TURNS, type CultureItem } from '@/lib/culture';
import { lessonPlan, lessonVersion } from '@/lib/lesson';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const file = JSON.parse(readFileSync(`content/${pack.id}/culture.json`, 'utf8')) as { set: string[]; items: CultureItem[] };

check(new Set(file.items.map((i) => i.id)).size === file.items.length, 'item ids are unique');
for (const it of file.items) {
  const city = cities.find((c) => c.id === it.cityId);
  const place = city?.places.find((p) => p.id === it.placeId);
  check(!!city && !city.hidden, `${it.id}: city ${it.cityId} is shown`);
  check(!!place && !place.hidden && place.characterId === it.teller, `${it.id}: ${it.teller} is the shown person at ${it.placeId}`);
  check(it.chip.trim().split(/\s+/).length <= 4, `${it.id}: chip "${it.chip}" is at most four words`);
  check(it.words.length >= 1 && it.words.length <= 2 && it.words.every((w) => w.said && w.en), `${it.id}: one or two words worth keeping`);
  check(it.facts.length > 80, `${it.id}: has its checked facts`);
}
const set = cultureSet();
check(set.length >= 4 && set.length === file.set.length, `the set resolves (${set.length} of ${file.set.length})`);
check(new Set(set.map((i) => i.cityId)).size >= 3, 'the set spreads across cities');

const it = set[0];
const first = storyBrief(it, 0, false);
const last = storyBrief(it, STORY_TURNS, true);
check(!first.last && first.brief.includes(it.chip) && !first.brief.includes('{'), 'the first turn\'s brief fills and isn\'t the last');
check(last.last && last.brief.includes(it.words[0].said), 'the third turn is the last; the Beginner brief names the words');
const plan = lessonPlan(it.id, 'seed');
check(!!plan && (plan as { story?: boolean }).story === true && plan.practice.length === 0 && plan.magda.characterId === it.teller, 'a cultural lesson\'s plan is the teller\'s place, no practice');
check(lessonVersion('story', it.id).endsWith(`-story:${it.id}`), 'its prompt version names the item, so the Learn page sees it done');

if (problems.length) {
  console.error(`[${pack.id}] FAILED\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`[${pack.id}] OK: ${file.items.length} cultural items, a set of ${set.length} across ${new Set(set.map((i) => i.cityId)).size} cities; the story plays in three turns`);
