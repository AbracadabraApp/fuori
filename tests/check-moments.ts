// The fixed moments (tests/experiments/moments.json) still point at real
// things: a place with someone there, a stage that exists, a lesson step that
// exists, a conversation that alternates, and a complaint it came from. A
// moment that breaks (a place renamed, Rome removed) fails here, not halfway
// through a paid test run. No API calls.
import { readFileSync } from 'node:fs';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { STAGES } from '@/lib/path';
import { findStep } from '@/lib/lesson';
import type { Moment } from './experiments/moments.mts';

const doc = JSON.parse(readFileSync('tests/experiments/moments.json', 'utf8')) as { moments: Moment[] };
const problems: string[] = [];
const ids = new Set<string>();
const mine = doc.moments.filter((m) => m.country === pack.id);

for (const m of doc.moments) {
  if (ids.has(m.id)) problems.push(`${m.id}: id used twice`);
  ids.add(m.id);
}
for (const m of mine) {
  const where = `${m.id}`;
  if (!m.watch?.trim() || !m.from?.date || !m.from?.who) problems.push(`${where}: says what to watch and who it came from, when`);
  if (m.kind === 'lesson') {
    if (!m.lesson || !findStep(m.lesson.stepId)) problems.push(`${where}: lesson step ${m.lesson?.stepId} doesn't exist`);
  } else if (!m.cityId || !m.placeId || !characterForVisit(m.cityId, m.placeId)) {
    problems.push(`${where}: nobody at ${m.cityId}/${m.placeId}`);
  }
  if (m.level === 'beginner' && m.kind !== 'lesson' && (!m.stage || !STAGES[m.stage])) problems.push(`${where}: Beginner moment needs a stage (S1…)`);
  if (m.transcript.some((t, i) => i > 0 && t.who === m.transcript[i - 1].who)) problems.push(`${where}: the conversation doesn't alternate`);
  const lastWho = m.transcript.at(-1)?.who;
  if (m.transcript.length && lastWho !== 'npc') problems.push(`${where}: the conversation should end with the character, before what the learner says`);
  if (m.transcript.length && !m.said) problems.push(`${where}: a moment after the opening needs what the learner said`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: ${mine.length} moments for ${pack.id} point at real places, stages and lessons`);
