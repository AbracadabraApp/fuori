// Test T4 (docs/prompt-trials.md; card shown to Josh first): does telling the
// character what they already told the learner stop the repeat, and keep the culture?
// Efrén Martínez at Monte Albán, his here line as written (with "you like explaining
// the Gran Plaza, the ball court and the Danzantes"), on a return visit (visit 2).
// Variable: one memory note, "Already told them about the Danzantes and the ball
// court" (A: without it, B: with it). Everything else fixed: the other notes, the
// date, Beginner stage 2, and the learner's line.
// Two fixed moments (docs/prompt-testing.md, rule 5), from T3's real visits:
//   M1 the opener of the return visit;
//   M2 his reply after a fixed opener and a fixed learner line that doesn't touch the ruins.
// Measures, in code: replies naming the Danzantes or the ball court (the repeat), and
// replies naming anything from CULTURE, a list fixed before the run that leaves out
// every word already in his here line (Zapotec, village, valley, Oaxaca, mountaintop).
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/memory-told.mts [runs]
// T5: TEST=T5 keeps the told-already note in both versions and makes the variable the here line:
// A as written, B with two more fact-checked facts about Monte Albán (Tomb 7, Building J); NEW counts them.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';
import type { Turn } from '@/lib/types';
import { pool, OUT } from './common.mjs';

const RUNS = Number(process.argv[2] ?? 5);
const city = cities.find((c) => c.id === 'oaxaca')!;
const TEST = process.env.TEST ?? 'T4';
const base = characterForPlace(city, city.places.find((p) => p.id === 'monte-alban')!)!;
const MORE = ' Tomb 7, opened in 1932, held one of the richest treasures ever found in Mexico, Mixtec gold and jewels now in the museum at Santo Domingo in Oaxaca. Building J is shaped like an arrowhead and set at an angle to all the other buildings, and is thought to have been used for watching the stars.';
const NEW = /tumba|tomb|tesoro|treasure|\boro\b|\bgold|joya|jewel|edificio j|building j|observatorio|observatory|flecha|arrow|estrellas|stars/i;
const sheet = (b: boolean) => TEST === 'T5' && b ? { ...base, appearance: { ...base.appearance, setting: base.appearance.setting + MORE } } : base;
const REPEAT = /danzante|juego de pelota|ball ?court/i;
const CULTURE = /\bmole\b|tlayuda|mezcal|chocolate|guelaguetza|alebrije|pan de yema|mercado|market|tejate|barro negro|textil|telar|cochinilla|monte alb[aá]n de noche|d[ií]a de muertos|calenda|huipil/i;
const notes = ['Their name is Sam.', 'Lives in Mexico City, in Roma, and has been in Mexico about two weeks.', 'From Canada; studying Spanish.', 'First visit to Monte Albán last time; liked the view of the valley.'];
const told = 'Already told them about the Danzantes and the ball court.';
const now = new Date();
const memory = (b: boolean) => ({ visits: 1, lastVisit: new Date(now.getTime() - 3 * 86_400_000), notes: b || TEST === 'T5' ? [...notes, told] : notes });
const opener: Turn = { who: 'npc', transcript: 'Hola, Sam. Bienvenido otra vez. Hoy hace sol en la plaza. ¿Cómo está hoy?', translation: 'Hi, Sam. Welcome back. It is sunny in the plaza today. How are you today?' };
const said = 'Bien, gracias. Estudio mucho español esta semana.';

const turn = (b: boolean, transcript: Turn[], learnerSaid?: string) =>
  runBeginnerTurn({ character: sheet(b), transcript, learnerSaid, memory: memory(b), now, stageText: stageText(STAGES.S2, base.role), maxAnswers: STAGES.S2.answers, withDone: true });

const jobs = (['A', 'B'] as const).flatMap((v) => (['M1', 'M2'] as const).flatMap((m) => Array.from({ length: RUNS }, () => async () => {
  const r = m === 'M1' ? await turn(v === 'B', []) : await turn(v === 'B', [opener], said);
  return { v, m, line: r.line, repeat: REPEAT.test(r.line), culture: r.line.match(CULTURE)?.[0] ?? '', fresh: r.line.match(NEW)?.[0] ?? '' };
})));
const rs = await pool(jobs, 6);
for (const v of ['A', 'B']) {
  const x = rs.filter((r) => r.v === v);
  console.log(`${TEST} ${v}: new facts ${x.filter((r) => r.fresh).length}/${x.length} · repeat ${x.filter((r) => r.repeat).length}/${x.length} (M1 ${x.filter((r) => r.m === 'M1' && r.repeat).length}/${RUNS}, M2 ${x.filter((r) => r.m === 'M2' && r.repeat).length}/${RUNS}) · culture ${x.filter((r) => r.culture).length}/${x.length} · words ${Math.round(x.reduce((n, r) => n + r.line.split(/\s+/).length, 0) / x.length)}`);
}
const file = join(OUT, `memory-told-${TEST}-${Date.now()}.md`);
writeFileSync(file, rs.map((r) => `- ${r.v} ${r.m}${r.repeat ? ' REPEAT' : ''}${r.culture ? ` CULTURE(${r.culture})` : ''}${r.fresh ? ` NEW(${r.fresh})` : ''}: ${r.line}`).join('\n') + '\n');
console.log(file);
