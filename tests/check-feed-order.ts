// Place feeds: every place appears exactly once, and the first 10 cards mix
// neighbourhoods and kinds instead of clustering (Roma's first 10 used to be
// all Trastevere).
import { cities } from '@/content/it/cities';
import { feedOrder } from '@/lib/places/feed-order';

const problems: string[] = [];
for (const city of cities) {
  const order = feedOrder(city);
  const ids = order.map((p) => p.id);
  if (ids.length !== city.places.length || new Set(ids).size !== ids.length) {
    problems.push(`${city.name}: places lost or duplicated`);
  }
  const first = order.slice(0, 10);
  const areas = new Set(first.map((p) => p.neighbourhood)).size;
  const wantAreas = Math.min(city.neighbourhoods.length, 3);
  if (areas < wantAreas) problems.push(`${city.name}: first 10 cover only ${areas} neighbourhood(s)`);
  for (let i = 1; i < first.length; i++) {
    if (first[i].kind === first[i - 1].kind) problems.push(`${city.name}: two ${first[i].kind}s in a row in the first 10`);
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: every city feed mixes neighbourhoods and kinds');
