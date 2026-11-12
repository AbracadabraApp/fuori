// The intro's question at Beginner: how long, in the language and its English (Josh, 2026-11-12: "the amount of words
// is broken"; Raymundo's and Isidro's were 15 words, about 35 with the English). First visits with answers, spread
// across the cities, each question printed with its answers and the counts at the end. A product check, not a card.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/intro-question-length.mts [--characters=6]
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runIntro } from '@/lib/intro';
const howMany = Number(process.argv.find((a) => a.startsWith('--characters='))?.split('=')[1] ?? '6');
const people = cities.filter((c) => !c.hidden).flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const counts = await Promise.all(chosen.map(async ({ city, place }) => {
  const character = characterForVisit(city.id, place.id)!;
  const r = await runIntro({ character, answers: true });
  const q = r.intro!.at(-1)!;
  console.log(`\n${character.name} (${city.name}): ${q.text}\n    ${q.en}\n    answers: ${(r.parts ?? []).map((a) => a.text).join(' | ')}`);
  return { lang: words(q.text), en: words(q.en), question: /\?["'»”’)]*$/.test(q.text) };
}));
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log(`\n${language.name}: ${counts.length} intro questions, median ${median(counts.map((c) => c.lang))} words (longest ${Math.max(...counts.map((c) => c.lang))}), English median ${median(counts.map((c) => c.en))}; a question ${counts.filter((c) => c.question).length} of ${counts.length}`);
