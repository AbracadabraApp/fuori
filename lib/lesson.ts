/**
 * A lesson on the conversation screen (docs/learn.md → A lesson; N6 item 4,
 * pass 1; Josh, 2026-11-02): Magda teaches one step of a syllabus unit
 * (lib/lessons.ts), three short practice dialogues follow with characters
 * whose role fits the step's examples (any city: examples, not visits), then
 * her review of what the learner said. Every part is the Beginner format
 * (beginner.md) with a brief from content/<country>/prompts/lesson-flow.md,
 * for every level (Josh: the lessons are A1). Each part ends on a button in
 * place of the mic, as the welcome does: teaching when she says so (at most
 * four turns), practice after three learner turns, the review after one.
 * Leaving partway starts the lesson over next time (Josh), so nothing about
 * a lesson's progress is stored; its conversations are recorded as usual,
 * with a prompt version starting "lesson-", which keeps them out of the visit
 * stamps and the path (lib/visits.ts, lib/conversation-record.ts).
 */
import { cities, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { imageUrl, isStation } from '@/lib/content-api';
import { lessonUnits, type LessonStep } from '@/lib/lessons';
import { language } from '@/content';
import { query } from '@/lib/db';
import type { Turn } from '@/lib/types';

/** Learner turns in each practice dialogue */
export const PRACTICE_TURNS = 3;
/** Practice dialogues in a lesson */
export const SCENES = 3;
/** The teaching part ends here at the latest, whatever she says */
export const TEACH_MAX_TURNS = 4;
/** The review: her feedback, they say it once more, her goodbye */
export const REVIEW_TURNS = 1;

export type LessonPart = 'teach' | 'practice' | 'review';
/** What /v1/turn is told about a lesson turn (the app sends it with every turn of a lesson) */
export interface LessonTurn {
  stepId: string;
  part: LessonPart;
  /** practice: which scene, 0-based */
  scene?: number;
  /** review: the practice dialogues' conversation ids */
  practiceIds?: string[];
}

/**
 * The prompt version a lesson's conversations are saved with. The review's
 * names its step ("lesson-2026-11-02b-review:a1-01-1"): reaching the review
 * is what makes a lesson done (Josh, 2026-11-03), so the Learn page reads
 * finished lessons from the conversations, with no table of its own
 * (lessonsDone).
 */
export const lessonVersion = (part: LessonPart, stepId?: string) => `lesson-${readPromptFile('lesson-flow.md').version}-${part}${part === 'review' && stepId ? `:${stepId}` : ''}`;

/** The lessons this learner has finished: those whose review they reached */
export async function lessonsDone(learnerId: string): Promise<string[]> {
  const r = await query<{ step: string }>(
    `SELECT DISTINCT split_part(prompt_version, ':', 2) AS step
       FROM conversations
      WHERE learner_id = $1 AND prompt_version LIKE 'lesson-%-review:%'`,
    [learnerId]
  );
  return r.rows.map((x) => x.step).filter(Boolean);
}

export function findStep(stepId: string): LessonStep | undefined {
  return lessonUnits().flatMap((u) => u.steps).find((s) => s.id === stepId);
}

/** The city and place as /v1/content shows them (the city with just this place), so the app can open the conversation screen there, Magda's hidden school included */
function sceneJson(cityId: string, placeId: string) {
  const city = cities.find((c) => c.id === cityId)!;
  const p = city.places.find((x) => x.id === placeId)!;
  const place = { id: p.id, name: p.name, kind: p.kind, neighbourhood: p.neighbourhood, station: isStation(p.id), characterId: p.characterId, image: imageUrl(`places/${p.id}`) };
  return { city: { id: city.id, name: city.name, ...(city.region ? { region: city.region } : {}), more: false, image: imageUrl(`cities/${city.id}`), places: [place] }, place, characterId: p.characterId! };
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim();

/**
 * The examples to practise from, one per place, in order: those said by
 * someone other than the learner; where every example is the newcomer's own
 * line (asking someone to repeat, the key questions), those, and the partner
 * is someone at that kind of place. Before, those lessons found nobody and
 * went from teaching straight to the review (5 of Mexico's 25, 2026-11-03).
 */
function practiceExamples(step: LessonStep) {
  const byPlace = (list: LessonStep['examples']) => {
    const seen = new Set<string>();
    return list.filter((e) => !seen.has(norm(e.place)) && seen.add(norm(e.place)));
  };
  const others = byPlace(step.examples.filter((e) => norm(e.role) !== 'newcomer'));
  return others.length ? others : byPlace(step.examples);
}

/**
 * Who the learner practises with: for each example, someone in a shown city
 * whose role fits (the role named, else the kind of place), each a different
 * person; seeded by the learner so the same lesson isn't always the same
 * people. Fewer fitting examples than SCENES: the first ones again, with
 * other people. Nobody fits at all: anyone in a shown city.
 */
export function practicePartners(step: LessonStep, seed: string) {
  const shown = cities.filter((c) => !c.hidden).flatMap((city) =>
    city.places.filter((p) => !p.hidden && p.characterId && p.characterId !== tutor?.id).map((place) => ({ city, place, person: characterForPlace(city, place) }))
  ).filter((x) => x.person);
  const examples = practiceExamples(step);
  const used = new Set<string>();
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const scenes: { cityId: string; placeId: string; characterId: string; example: { said: string; en: string } }[] = [];
  for (let k = 0; scenes.length < SCENES && k < SCENES * 3 && examples.length; k++) {
    const e = examples[k % examples.length];
    const fits = (x: (typeof shown)[number]) => !used.has(x.person!.id) && norm(x.person!.role).includes(norm(e.role));
    const byKind = (x: (typeof shown)[number]) => !used.has(x.person!.id) && norm(x.place.kind ?? '').includes(norm(e.place));
    // No one in the world has the role or the kind of place (the Intermediate
    // lessons' clerks, offices and homes): anyone, still a different person a scene
    const pool = shown.filter(fits).length ? shown.filter(fits) : shown.filter(byKind).length ? shown.filter(byKind) : shown.filter((x) => !used.has(x.person!.id));
    if (!pool.length) continue;
    const pick = pool[(h + k * 7) % pool.length];
    used.add(pick.person!.id);
    scenes.push({ cityId: pick.city.id, placeId: pick.place.id, characterId: pick.person!.id, example: { said: e.said, en: e.en } });
  }
  return scenes;
}

/** The lesson's plan for the app: where Magda is, and the practice scenes */
export function lessonPlan(stepId: string, seed: string) {
  const step = findStep(stepId);
  if (!step) return null;
  const tutorCity = cities.find((c) => c.places.some((p) => p.characterId === tutor?.id));
  const tutorPlace = tutorCity?.places.find((p) => p.characterId === tutor?.id);
  if (!tutorCity || !tutorPlace) return null;
  const scenes = practicePartners(step, seed);
  return {
    stepId,
    title: step.title,
    magda: sceneJson(tutorCity.id, tutorPlace.id),
    practice: scenes.map((s) => sceneJson(s.cityId, s.placeId)),
  };
}

const learnerTurns = (transcript: Turn[], learnerSaid?: string) => transcript.filter((t) => t.who === 'learner').length + (learnerSaid ? 1 : 0);

/**
 * The brief for one turn of a lesson, added to beginner.md, and whether this
 * turn ends the part (practice and review by count; teaching by her done, or
 * the cap). `forcedDone`: the turn ends the part whatever the model says.
 */
export async function lessonBrief(l: LessonTurn, learnerId: string, transcript: Turn[], learnerSaid?: string, practiceLines?: string[]): Promise<{ brief: string; forcedDone: boolean; askDone: boolean }> {
  const step = findStep(l.stepId);
  if (!step) throw new Error(`No lesson step ${l.stepId}`);
  const f = readPromptFile('lesson-flow.md');
  const n = learnerTurns(transcript, learnerSaid);
  const base = { language: language.name, how_to: step.how_to };
  if (l.part === 'teach') {
    const places = practicePartners(step, learnerId).map((s) => cities.find((c) => c.id === s.cityId)?.places.find((p) => p.id === s.placeId)?.kind ?? '').filter(Boolean);
    const brief = fill(f.block('Teach'), {
      ...base,
      intro: step.intro,
      examples: step.examples.map((e) => `- ${e.role}: ${e.said} (${e.en})`).join('\n'),
      notice: step.notice,
      places: [...new Set(places)].join(', ') || 'town',
    });
    return { brief, forcedDone: n >= TEACH_MAX_TURNS, askDone: true };
  }
  if (l.part === 'practice') {
    const scene = practicePartners(step, learnerId)[l.scene ?? 0];
    const last = n >= PRACTICE_TURNS;
    const brief = fill(f.block('Practice'), {
      ...base,
      example: scene ? `${scene.example.said} (${scene.example.en})` : step.examples[0] ? `${step.examples[0].said} (${step.examples[0].en})` : '',
      turn: String(Math.min(n + 1, PRACTICE_TURNS)),
      of: String(PRACTICE_TURNS),
      last: last ? f.block('Practice: last turn') : '',
    });
    return { brief, forcedDone: last, askDone: false };
  }
  // The review: the learner's lines from the practice dialogues, read from their own conversations
  // (or given, by tests/experiments/lesson-trial.mts)
  const ids = (l.practiceIds ?? []).filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, SCENES);
  let lines = practiceLines;
  if (!lines) {
    const r = ids.length
      ? await query<{ id: string; turns: { who: string; text: string }[] }>('SELECT id, turns FROM conversations WHERE learner_id = $1 AND id = ANY($2::uuid[])', [learnerId, ids])
      : { rows: [] };
    lines = ids.flatMap((id, k) => {
      const row = r.rows.find((x) => x.id === id);
      return (row?.turns ?? []).filter((t) => t.who === 'learner').map((t) => `Scene ${k + 1}: ${t.text}`);
    });
  }
  const brief = fill(f.block('Review'), { ...base, scenes: String(ids.length || SCENES), lines: lines.join('\n') || '(nothing recorded)' });
  return { brief, forcedDone: n >= REVIEW_TURNS, askDone: false };
}
