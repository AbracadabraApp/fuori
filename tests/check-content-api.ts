// What the app downloads (GET /v1/content, lib/content-api.ts): every shown
// city, place and person has an R2 image address, every place's person is in
// the people list, hidden cities and places are left out, and nothing the
// server keeps to itself (prompts, personalities, image prompts, voices)
// leaks into it. Run for both countries (COUNTRY=es-mx).
import { cities, country, pack } from '@/content';
import { buildContent } from '@/lib/content-api';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const c = buildContent();
const text = JSON.stringify(c);

for (const field of ['imagePrompt', 'portraitPrompt', 'personality', 'traits', 'caresAbout', 'speech', 'voice', 'prompt', 'appearance', 'food', 'customs']) {
  check(!text.includes(`"${field}"`), `content must not include "${field}"`);
}

const base = /^https:\/\/[^/]+\/.+\.webp$/;
const shownCities = cities.filter((x) => !x.hidden);
check(c.cities.length === shownCities.length && c.cities.length > 0, `expected ${shownCities.length} shown cities, got ${c.cities.length}`);
check(Object.values(c.characters).some((x) => x.tutor && base.test(x.portrait ?? '')), 'Magda (the tutor) should be in characters with her portrait, for Learn');
for (const city of c.cities) {
  check(!city.places.some((p) => p.characterId === pack.tutor.id), `city ${city.id} still shows a language school`);
  const source = cities.find((x) => x.id === city.id)!;
  check(!source.hidden, `hidden city ${city.id} is in the content`);
  check(base.test(city.image ?? ''), `city ${city.id} has no image address`);
  // Language schools are left out (Josh, 2026-10-27: Magda is in Learn)
  const shownPlaces = source.places.filter((p) => !p.hidden && p.characterId !== pack.tutor.id).map((p) => p.id).sort();
  check(JSON.stringify(city.places.map((p) => p.id).sort()) === JSON.stringify(shownPlaces), `city ${city.id}: places don't match the shown places`);
  check(city.places.some((p) => p.station), `city ${city.id} has no station`);
  for (const place of city.places) {
    check(base.test(place.image ?? ''), `place ${place.id} has no image address`);
    if (place.characterId) check(!!c.characters[place.characterId], `place ${place.id}: ${place.characterId} missing from characters`);
  }
}
for (const person of Object.values(c.characters)) {
  check(base.test(person.portrait ?? ''), `${person.id} has no portrait address`);
  check(!!person.name && !!person.role, `${person.id} lacks a name or role`);
}
check(Object.values(c.characters).filter((p) => p.tutor).length === 1, 'exactly one tutor (Magda) expected');
check(!!c.language.ui.showMore && !!c.language.ui.ticket.board && !!c.language.speechLang, 'language words missing');
check(/^[0-9a-f]{12}$/.test(c.version) && buildContent().version === c.version, 'version must be stable for the same content');

if (problems.length) {
  console.error(`FAIL (${country}): ${problems.length} problem(s)\n- ${problems.slice(0, 30).join('\n- ')}`);
  process.exit(1);
}
console.log(`OK (${country}): /v1/content has ${c.cities.length} cities, ${c.cities.reduce((n, x) => n + x.places.length, 0)} places, ${Object.keys(c.characters).length} people, all with R2 images and no prompts`);
