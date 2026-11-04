/**
 * The syllabus lessons, made ahead (scripts/make-lessons.mts →
 * content/<country>/lessons.json; docs/teach-plan.md, docs/learn.md), served
 * to the app in /v1/content for the Lessons card in Learn (Josh, 2026-10-29:
 * "link lessons to the Learn home page"). Missions are out of lessons for now
 * (Josh, 2026-10-28), so a step's mission isn't served. A country without
 * lessons yet serves none.
 *
 * Server-side only.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { pack } from '@/content';

/** `said` is the line in the language being learned */
type Line = { said: string; en: string };
export interface LessonStep {
  id: string;
  title: string;
  how_to: string;
  intro: string;
  examples: { role: string; place: string; said: string; en: string }[];
  notice: string;
  context: string;
  practice: { ask: Line; answer: Line }[];
}
export interface LessonUnit { id: string; title: string; steps: LessonStep[] }

let cached: LessonUnit[] | null = null;

/**
 * Every served lesson: lessons.json, then lessons-b1.json where a country has
 * it (the Intermediate lessons, served as the Learn page's sets 2 and 3:
 * Josh, 2026-11-03). The lesson flow finds any of them by step id.
 */
export function lessonUnits(): LessonUnit[] {
  if (cached) return cached;
  cached = ['lessons.json', 'lessons-b1.json'].flatMap((name) => {
    const path = join(process.cwd(), 'content', pack.id, name);
    if (!existsSync(path)) return [];
    const file = JSON.parse(readFileSync(path, 'utf8')) as { units: Record<string, { title: string; steps: (LessonStep & { mission?: unknown })[] }> };
    return Object.entries(file.units).map(([id, u]) => ({
      id,
      title: u.title,
      steps: u.steps.map(({ mission: _mission, ...step }) => step),
    }));
  });
  return cached;
}

/** A chip on the Learn page: a lesson, named for what it lets you do */
export interface LessonChip { step: string; name: string }
/** `set`: the Learn page shows one set at a time, the next once every chip in it is green (Josh, 2026-11-03) */
export interface LessonArea { name: string; set: number; chips: LessonChip[] }

let areasCached: LessonArea[] | null = null;

/**
 * The Learn page's lessons as chips in their areas (Josh, 2026-11-03;
 * docs/learn.md → Lesson chips): content/<country>/lesson-areas.json, only
 * chips whose lesson exists. Empty where a country has none.
 */
export function lessonAreas(): LessonArea[] {
  if (areasCached) return areasCached;
  const path = join(process.cwd(), 'content', pack.id, 'lesson-areas.json');
  if (!existsSync(path)) return (areasCached = []);
  const steps = new Set(lessonUnits().flatMap((u) => u.steps.map((s) => s.id)));
  const file = JSON.parse(readFileSync(path, 'utf8')) as { areas: LessonArea[] };
  areasCached = file.areas
    .map((a) => ({ name: a.name, set: a.set ?? 1, chips: a.chips.filter((c) => steps.has(c.step)).map((c) => ({ step: c.step, name: c.name })) }))
    .filter((a) => a.chips.length);
  return areasCached;
}

/**
 * The set the Learn page shows (docs/learn.md → Lessons come in sets): the
 * first set not yet all done, from set 2 for a learner at Intermediate or
 * above (the welcome placed them there; the earlier sets stay reachable);
 * the last set once every set is done.
 */
export function currentLessonSet(done: Set<string>, level: string | null): number {
  const sets = [...new Set(lessonAreas().map((a) => a.set))].sort((a, b) => a - b);
  if (!sets.length) return 1;
  const from = level === 'intermediate' || level === 'advanced' ? 2 : 1;
  // A country with no set that high (Mexico has one) shows what it has
  const pool = sets.some((n) => n >= from) ? sets.filter((n) => n >= from) : sets;
  const open = (n: number) => lessonAreas().some((a) => a.set === n && a.chips.some((c) => !done.has(c.step)));
  return pool.find(open) ?? pool[pool.length - 1];
}
