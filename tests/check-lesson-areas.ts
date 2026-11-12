// The Learn page's lesson chips (content/<country>/lesson-areas.json; Josh,
// 2026-11-03): every served lesson has exactly one chip, every chip a lesson;
// sets numbered from 1, each of two or four areas; the set shown is the first
// not all done, from set 2 at Intermediate; and a review's prompt version
// names its step, which is how the Learn page knows a lesson is done
// (lib/lesson.ts → lessonsDone).
//   tsx tests/check-lesson-areas.ts (COUNTRY=es-mx for Mexico)
import { readFileSync } from 'fs';
import { pack } from '@/content';
import { lessonUnits, lessonAreas, currentLessonSet } from '@/lib/lessons';
import { lessonVersion, lessonPlan, exampleLine, isLearnerRole } from '@/lib/lesson';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const steps = lessonUnits().flatMap((u) => u.steps.map((s) => s.id));
const file = JSON.parse(readFileSync(`content/${pack.id}/lesson-areas.json`, 'utf8')) as { areas: { name: string; set: number; chips: { step: string; name: string }[] }[] };
const chips = file.areas.flatMap((a) => a.chips);
const sets = [...new Set(file.areas.map((a) => a.set))].sort((a, b) => a - b);
check(sets.every((n, i) => n === i + 1), `sets numbered 1, 2, 3…: ${sets.join(', ')}`);
for (const n of sets) {
  const areas = file.areas.filter((a) => a.set === n).length;
  check(areas === 2 || areas === 4, `set ${n} has two or four areas, not ${areas}`);
}
for (const s of steps) check(chips.filter((c) => c.step === s).length === 1, `lesson ${s} needs exactly one chip`);
for (const c of chips) check(steps.includes(c.step), `chip "${c.name}" names ${c.step}, which isn't a lesson`);
check(new Set(chips.map((c) => c.name)).size === chips.length, 'chip names are all different');
check(lessonAreas().flatMap((a) => a.chips).length === steps.length, 'served chips cover every lesson');

// Every lesson has Magda and three people to practise with (5 of Mexico's went
// straight to the review: their examples were all the newcomer's own lines)
for (const s of steps) {
  const plan = lessonPlan(s, 'seed-learner');
  check(!!plan && plan.practice.length === 3, `lesson ${s} has ${plan?.practice.length ?? 'no'} practice scenes, not 3`);
}

// The set shown: the first not all done; from set 2 at Intermediate, where a country has one
const setSteps = (n: number) => file.areas.filter((a) => a.set === n).flatMap((a) => a.chips.map((c) => c.step));
check(currentLessonSet(new Set(), 'beginner') === 1, 'a new Beginner sees set 1');
check(currentLessonSet(new Set(), null) === 1, 'no level yet: set 1');
check(currentLessonSet(new Set(setSteps(1).slice(1)), 'beginner') === 1, 'set 1 stays until every chip is green');
if (sets.length > 1) {
  check(currentLessonSet(new Set(setSteps(1)), 'beginner') === 2, 'set 1 all done: set 2');
  check(currentLessonSet(new Set(), 'intermediate') === 2, 'placed at Intermediate: set 2');
} else {
  check(currentLessonSet(new Set(), 'intermediate') === 1, 'one set only: Intermediate sees it too');
}
check(currentLessonSet(new Set(sets.flatMap(setSteps)), 'beginner') === sets[sets.length - 1], 'everything done: the last set');

check(lessonVersion('review', 'a1-01-1').endsWith('-review:a1-01-1'), `review version names its step: ${lessonVersion('review', 'a1-01-1')}`);
check(!lessonVersion('practice', 'a1-01-1').includes(':'), 'practice versions name no step');

// The learner's own example lines (role "newcomer" in lessons written before 2026-11-12, "learner" after) are shown to
// Magda as "you", never "newcomer" (CLAUDE.md's learner rule; Magda's brief listed "- newcomer: …" in every lesson)
check(isLearnerRole('newcomer') && isLearnerRole('Learner') && !isLearnerRole('café waiter'), 'both learner roles are the learner\'s own lines');
check(exampleLine({ role: 'newcomer', said: 'Un café, por favor.', en: 'A coffee, please.' }) === '- you: Un café, por favor. (A coffee, please.)' && exampleLine({ role: 'barista', said: 'Ecco.', en: 'Here.' }) === '- barista: Ecco. (Here.)', 'Magda sees the learner\'s lines as "you"');
for (const u of lessonUnits()) for (const st of u.steps ?? []) for (const e of st.examples ?? []) check(!/newcomer/i.test(exampleLine(e)), `no example reaches Magda as a newcomer (${e.said})`);

if (problems.length) {
  console.error(`[${pack.id}] FAILED\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`[${pack.id}] OK: ${steps.length} lessons, one chip each and three practice scenes, in ${sets.length} set(s) of ${file.areas.length} areas; the set shown moves on; the review names its step`);
