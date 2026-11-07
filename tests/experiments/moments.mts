// The fixed moments (moments.json; docs/prompt-testing.md, rules 5 and 20),
// replayed through the server's own turn code: a Beginner moment with its
// stage's settings (lib/path.ts), an Intermediate one with the character
// prompt, a lesson moment with its brief and Magda. A test imports these and
// changes only the one thing it's testing (a prompt file swapped by the shell,
// a setting passed in).
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/moments.mts [moment-id] [runs]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { STAGES, stageText, type StageId } from '@/lib/path';
import { lessonBrief, type LessonTurn } from '@/lib/lesson';
import { tutorSheet } from '@/lib/tutor';
import type { Turn } from '@/lib/types';

export interface Moment {
  id: string;
  country: string;
  kind: 'town' | 'lesson' | 'welcome' | 'culture';
  level: 'beginner' | 'intermediate' | 'advanced';
  stage?: StageId;
  cityId?: string;
  placeId?: string;
  lesson?: { stepId: string; part: LessonTurn['part'] };
  transcript: { who: 'npc' | 'learner'; text: string; en?: string; offered?: string[] }[];
  said?: string;
  memory?: { visits: number; daysAgo: number; notes: string[] };
  watch: string;
  from: { who: string; date: string; quote: string };
  was?: string;
}

export function loadMoments(country = pack.id): Moment[] {
  const doc = JSON.parse(readFileSync(join(process.cwd(), 'tests', 'experiments', 'moments.json'), 'utf8')) as { moments: Moment[] };
  return doc.moments.filter((m) => m.country === country);
}

export const asTurns = (m: Moment): Turn[] => m.transcript.map((t) => ({ who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}), ...(t.offered ? { offered: t.offered } : {}) }));

/** The character's reply at this moment, made fresh: what the voice would say (line), and the parts for Beginners */
export async function replay(m: Moment, now = new Date()) {
  const transcript = asTurns(m);
  const memory = m.memory ? { visits: m.memory.visits, lastVisit: new Date(now.getTime() - m.memory.daysAgo * 86_400_000).toISOString(), notes: m.memory.notes } : undefined;
  if (m.kind === 'lesson' && m.lesson) {
    const b = await lessonBrief(m.lesson as LessonTurn, 'moment', transcript, m.said);
    return runBeginnerTurn({ character: tutorSheet(), transcript, learnerSaid: m.said, stageText: b.brief, withDone: b.askDone });
  }
  const character = characterForVisit(m.cityId!, m.placeId!);
  if (!character) throw new Error(`${m.id}: nobody at ${m.cityId}/${m.placeId}`);
  if (m.level === 'beginner') {
    const stage = STAGES[m.stage ?? 'S2'];
    return runBeginnerTurn({ character, transcript, learnerSaid: m.said, memory: memory as never, now, stageText: stageText(stage, character.role), maxAnswers: stage.answers, withDone: true });
  }
  return runTurn({ character, transcript, learnerSaid: m.said, memory: memory as never });
}

// Run directly: replay one moment (or all for the country) a few times and print the lines
if (process.argv[1]?.endsWith('moments.mts')) {
  const [only, runsArg] = process.argv.slice(2);
  const runs = Number(runsArg ?? 3);
  for (const m of loadMoments().filter((x) => !only || x.id === only)) {
    const lines = await Promise.all(Array.from({ length: runs }, async () => (await replay(m)).line));
    console.log(`${m.id} (watch: ${m.watch})\n  ${lines.join('\n  ')}`);
  }
}
