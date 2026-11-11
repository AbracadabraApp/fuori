// The connection test for the intro (lib/intro.ts, intro.md 2026-11-11a): the exact call take-turn makes on an opening,
// for a few characters, first visit (Beginner 2: with answers) and a return visit (with notes), printed to read.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/intro-live.mts [--characters=3]
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runIntro } from '@/lib/intro';
const howMany = Number(process.argv.find((a) => a.startsWith('--characters='))?.split('=')[1] ?? '3');
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
let n = 0, sentences = 0, wordsTotal = 0, endsOnQuestion = 0, twoAnswers = 0, ms = 0;
const show = (label: string, r: Awaited<ReturnType<typeof runIntro>>, t0: number) => {
  const took = Math.round(performance.now() - t0);
  n++; sentences += r.intro!.length; wordsTotal += words(r.line); ms += took;
  if (/\?["'»”’)]*$/.test(r.intro!.at(-1)!.text)) endsOnQuestion++;
  if ((r.parts ?? []).length === 2) twoAnswers++;
  console.log(`\n## ${label} · ${r.intro!.length} sentences, ${words(r.line)} words, ${took} ms`);
  for (const s of r.intro!) console.log(`${s.text}\n    ${s.en}`);
  if (r.parts?.length) console.log(`answers: ${r.parts.map((a) => `${a.text} (${a.en})`).join(' | ')}`);
};
for (const { city, place } of chosen) {
  const character = characterForVisit(city.id, place.id)!;
  let t0 = performance.now();
  show(`${character.name}, ${place.name} · first visit, Beginner 2`, await runIntro({ character, answers: true }), t0);
  t0 = performance.now();
  const yesterday = new Date(Date.now() - 86_400_000);
  show(`${character.name} · return visit, Intermediate`, await runIntro({ character, answers: false, memory: { visits: 1, lastVisit: yesterday, notes: [`Had what the place is known for`, `Asked how it's made`] } }), t0);
}
console.log(`\n${language.name}: ${n} intros, ${(sentences / n).toFixed(1)} sentences and ${(wordsTotal / n).toFixed(0)} words each, ends on a question ${endsOnQuestion} of ${n}, two answers ${twoAnswers} of ${chosen.length}, ${Math.round(ms / n)} ms each`);
