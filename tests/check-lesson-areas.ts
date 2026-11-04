// The Learn page's lesson chips (content/<country>/lesson-areas.json; Josh,
// 2026-11-03): every live lesson has exactly one chip, every chip a lesson,
// four areas; and a review's prompt version names its step, which is how the
// Learn page knows a lesson is done (lib/lesson.ts → lessonsDone).
//   tsx tests/check-lesson-areas.ts (COUNTRY=es-mx for Mexico)
import { readFileSync } from 'fs';
import { pack } from '@/content';
import { lessonUnits, lessonAreas } from '@/lib/lessons';
import { lessonVersion } from '@/lib/lesson';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const steps = lessonUnits().flatMap((u) => u.steps.map((s) => s.id));
const file = JSON.parse(readFileSync(`content/${pack.id}/lesson-areas.json`, 'utf8')) as { areas: { name: string; chips: { step: string; name: string }[] }[] };
const chips = file.areas.flatMap((a) => a.chips);
check(file.areas.length === 4, `four areas, not ${file.areas.length}`);
for (const s of steps) check(chips.filter((c) => c.step === s).length === 1, `lesson ${s} needs exactly one chip`);
for (const c of chips) check(steps.includes(c.step), `chip "${c.name}" names ${c.step}, which isn't a lesson`);
check(new Set(chips.map((c) => c.name)).size === chips.length, 'chip names are all different');
check(lessonAreas().flatMap((a) => a.chips).length === steps.length, 'served chips cover every lesson');

check(lessonVersion('review', 'a1-01-1').endsWith('-review:a1-01-1'), `review version names its step: ${lessonVersion('review', 'a1-01-1')}`);
check(!lessonVersion('practice', 'a1-01-1').includes(':'), 'practice versions name no step');

if (problems.length) {
  console.error(`[${pack.id}] FAILED\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`[${pack.id}] OK: ${steps.length} lessons, one chip each in ${file.areas.length} areas; the review names its step`);
