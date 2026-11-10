import { cities } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runBeginnerTurn, lineFromParts } from '@/lib/beginner';
import { BEGINNER_2_FILE, CLUSTER_1, OPENER, RUNGS, levelText, setupLine, stretchesOf, writeSummaries, shapeParts } from '@/lib/beginner-2';
import type { Turn } from '@/lib/types';
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p }))).slice(0, 2);
for (const { city, place } of people) {
  const character = characterForVisit(city.id, place.id)!;
  const transcript: Turn[] = [];
  let learnerSaid: string | undefined;
  for (const [turn, setup] of [OPENER, RUNGS[0]].entries()) {
    const t0 = performance.now();
    const r = await runBeginnerTurn({ character, transcript, learnerSaid, promptFile: BEGINNER_2_FILE, stageText: levelText(CLUSTER_1), turnNote: setupLine(setup), maxAnswers: setup.maxAnswers, withDone: true });
    const t1 = performance.now();
    const st = stretchesOf(r.parts);
    let summaries: string[] = [];
    try { summaries = await writeSummaries(character, r.parts, st); } catch (e) { console.log('summary failed:', String(e).slice(0, 120)); }
    const t2 = performance.now();
    const { parts, fixes } = shapeParts(r.parts, setup, CLUSTER_1, summaries.length ? { stretches: st, summaries } : null);
    console.log(`\n## ${character.name} t${turn} (${setup.id}) reply ${Math.round(t1 - t0)} ms, summary ${Math.round(t2 - t1)} ms, stretches ${st.length}, fixes ${fixes.join(', ')}`);
    console.log('SPOKEN: ' + lineFromParts(parts).line);
    console.log('BUBBLES: ' + parts.filter((x) => x.kind === 'answer').map((x) => `${x.text} (${x.en})`).join(' · '));
    if (learnerSaid) transcript.push({ who: 'learner', transcript: learnerSaid });
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    learnerSaid = parts.find((x) => x.kind === 'answer')?.text ?? 'Sí, gracias.';
  }
}
