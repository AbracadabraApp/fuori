// The connection test for the English frame (scaffolding.md "Level: 1" 2026-11-10q): real Beginner 2 turns through the
// real pieces (the prompt, the setup, shapeParts, lineFromParts), printed as what is spoken, what is shown as bubbles
// (the word parts, the language only) and the answers. Not a card: Josh judged the lines on a list (frame-mix.mts).
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/b2-frame-live.mts [--characters=4]
import { cities } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runBeginnerTurn } from '@/lib/beginner';
import { BEGINNER_2_FILE, CLUSTER_1, OPENER, RUNGS, levelText, setupLine, shapeParts, flowingLine } from '@/lib/beginner-2';
import type { Turn } from '@/lib/types';
const howMany = Number(process.argv.find((a) => a.startsWith('--characters='))?.split('=')[1] ?? '4');
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
let spoken = 0, inLanguage = 0;
for (const { city, place } of chosen) {
  const character = characterForVisit(city.id, place.id)!;
  const transcript: Turn[] = [];
  let learnerSaid: string | undefined;
  for (const [turn, setup] of [OPENER, RUNGS[0]].entries()) {
    const t0 = performance.now();
    const r = await runBeginnerTurn({ character, transcript, learnerSaid, promptFile: BEGINNER_2_FILE, stageText: levelText(CLUSTER_1), turnNote: setupLine(setup), maxAnswers: setup.maxAnswers, withDone: true });
    const { parts, fixes } = shapeParts(r.parts, setup, CLUSTER_1);
    const line = flowingLine(parts).line;
    const shown = parts.filter((x) => x.kind === 'word' || x.kind === 'question').map((x) => x.text);
    spoken += words(line); inLanguage += shown.reduce((n, t) => n + words(t), 0);
    console.log(`\n## ${character.name} t${turn} (${setup.id}) ${Math.round(performance.now() - t0)} ms, fixes: ${fixes.join(', ') || 'none'}`);
    console.log('SPOKEN: ' + line);
    console.log('SHOWN:  ' + shown.join(' · '));
    console.log('ANSWERS: ' + parts.filter((x) => x.kind === 'answer').map((x) => `${x.text} (${x.en})`).join(' · '));
    if (learnerSaid) transcript.push({ who: 'learner', transcript: learnerSaid });
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    learnerSaid = parts.find((x) => x.kind === 'answer')?.text ?? 'Sí, gracias.';
  }
}
console.log(`\nwords in the language, of what's spoken: ${(100 * inLanguage / spoken).toFixed(0)}%`);
