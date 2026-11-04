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

export function lessonUnits(): LessonUnit[] {
  if (cached) return cached;
  const path = join(process.cwd(), 'content', pack.id, 'lessons.json');
  if (!existsSync(path)) return (cached = []);
  const file = JSON.parse(readFileSync(path, 'utf8')) as { units: Record<string, { title: string; steps: (LessonStep & { mission?: unknown })[] }> };
  cached = Object.entries(file.units).map(([id, u]) => ({
    id,
    title: u.title,
    steps: u.steps.map(({ mission: _mission, ...step }) => step),
  }));
  return cached;
}

/** A chip on the Learn page: a lesson, named for what it lets you do */
export interface LessonChip { step: string; name: string }
export interface LessonArea { name: string; chips: LessonChip[] }

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
    .map((a) => ({ name: a.name, chips: a.chips.filter((c) => steps.has(c.step)).map((c) => ({ step: c.step, name: c.name })) }))
    .filter((a) => a.chips.length);
  return areasCached;
}
