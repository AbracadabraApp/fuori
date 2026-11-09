import { existsSync } from 'fs';
import { join } from 'path';
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
  // As a key, not a value: the cultural chips carry topic "food" (lib/culture.ts)
  check(!text.includes(`"${field}":`), `content must not include "${field}"`);
}

const base = /^https:\/\/[^/]+\/.+\.webp$/;
const shownCities = cities.filter((x) => !x.hidden);
check(c.cities.length === shownCities.length && c.cities.length > 0, `expected ${shownCities.length} shown cities, got ${c.cities.length}`);
// The syllabus lessons for Learn (lib/lessons.ts), without their missions (out of lessons for now)
{
  const lessons = (c as unknown as { lessons?: { id: string; steps: { id: string; practice: unknown[]; mission?: unknown }[] }[] }).lessons;
  check(Array.isArray(lessons), 'content should have a lessons list (empty where a country has none yet)');
  if (existsSync(join(process.cwd(), 'content', pack.id, 'lessons.json'))) {
    check(!!lessons?.length && lessons.every((u) => u.steps.length > 0), 'lessons.json exists but no lessons are served');
    check(!!lessons?.every((u) => u.steps.every((st) => st.practice.length > 0 && st.mission === undefined)), 'each lesson needs practice, and no mission');
  }
}
// Cinemas (lib/cinema.ts): the cinema place carries its films, each with a poster on R2 and a video to play first
if (existsSync(join(process.cwd(), 'content', pack.id, 'cinema.json'))) {
  type Film = { tmdbId: number; title: string; poster: string | null; videos: { youtube: string }[] };
  const withFilms = c.cities.flatMap((x) => x.places as unknown as { id: string; films?: Film[] }[]).filter((p) => p.films);
  check(withFilms.length > 0, 'cinema.json exists but no place carries films');
  for (const p of withFilms) {
    check(!!p.films?.length, `cinema ${p.id} has no films`);
    for (const f of p.films ?? []) {
      check(base.test(f.poster ?? ''), `cinema ${p.id}: ${f.title} has no poster on R2 (scripts/cinema-posters.mjs, then images:upload)`);
      check(f.videos.length > 0 && /^[\w-]{11}$/.test(f.videos[0].youtube), `cinema ${p.id}: ${f.title} has no YouTube video to play first`);
    }
  }
}
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

// A place's menu or board is served as written, and only where it has one (Osteria da Nino, the Sorbetteria)
for (const city of cities) for (const place of city.places) {
  const served = c.cities.find((x) => x.id === city.id)?.places.find((p) => p.id === place.id);
  if (served) check(JSON.stringify(served.menu ?? []) === JSON.stringify(place.menu ?? []), `${place.id}: menu not served as written`);
}

// Open spaces (Josh, 2026-11-08): the app puts one in the first few cards of a
// city's daily order, so each flag follows the pack's openKinds, every listed
// kind exists (a typo would silently flag nothing), and each first-screen city has one
{
  const allKinds = new Set(cities.flatMap((x) => x.places.map((p) => p.kind)));
  for (const k of pack.openKinds) check(allKinds.has(k), `openKinds lists "${k}", which no place has`);
  for (const city of c.cities) {
    for (const p of city.places) check(p.open === pack.openKinds.includes(p.kind), `${p.id}: open is ${p.open} but its kind is "${p.kind}"`);
    if (!city.more) check(city.places.some((p) => p.open), `${city.id} has no open space or landmark for the first cards`);
  }
}

if (problems.length) {
  console.error(`FAIL (${country}): ${problems.length} problem(s)\n- ${problems.slice(0, 30).join('\n- ')}`);
  process.exit(1);
}
console.log(`OK (${country}): /v1/content has ${c.cities.length} cities, ${c.cities.reduce((n, x) => n + x.places.length, 0)} places, ${Object.keys(c.characters).length} people, all with R2 images and no prompts`);
