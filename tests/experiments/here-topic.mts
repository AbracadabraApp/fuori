// Test T1 (docs/prompt-trials.md): does naming a topic in a here line make
// the character bring it up on almost every visit?
// Variable: Ximena's here line (Café Amapola, Mexico City) with or without
// "You love talking about café de olla…"; everything else the same.
// Result: visits where one of her lines mentions café de olla (counted in
// code: "olla" in her line), out of SETS × 3.
// Each set: three visits on different days, memory carried as the game does
// (lib/remember.ts), Beginner stage 2, four learner turns a visit. The
// learner never mentions drinks or the menu, so any café de olla is hers.
//   COUNTRY=es-mx VARIANT=A|B npx tsx --env-file=.env.local tests/experiments/here-topic.mts [sets]
// Other characters (T3 on, docs/prompt-testing.md): TEST, CITY, PLACE, CUT (the sentence, with its leading space or comma), MATCH (a regex
// counted in the character's lines), SCENE (where the learner is) and AVOID (what the learner never brings up); T1's values are the defaults.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, pool, OUT } from './common.mjs';

const SETS = Number(process.argv[2] ?? 5);
const VARIANT = process.env.VARIANT ?? 'A';
const TEST = process.env.TEST ?? 'T1';
const city = cities.find((c) => c.id === (process.env.CITY ?? 'ciudad-de-mexico'))!;
const place = city.places.find((p) => p.id === (process.env.PLACE ?? 'cafe-amapola'))!;
const base = characterForPlace(city, place)!;
const A = base.appearance.setting;
const cut = process.env.CUT ?? ' You love talking about café de olla, the traditional Mexican coffee with cinnamon and piloncillo, and about how you take your own coffee.';
if (!A.includes(cut)) throw new Error('the sentence to cut is not in the here line as written');
const character: CharacterSheet = { ...base, appearance: { ...base.appearance, setting: VARIANT === 'B' ? A.replace(cut, '') : A } };
const MATCH = new RegExp(process.env.MATCH ?? 'olla', 'i');
const mentions = (t: string) => MATCH.test(t);
const show = (t: Turn[]) => t.map((x) => `${x.who === 'npc' ? character.name : 'Learner'}: ${x.transcript}`).join('\n');

async function set() {
  let notes: string[] = [];
  const visits: { mentioned: boolean; lines: string[]; transcript: string }[] = [];
  for (let v = 0; v < 3; v++) {
    const now = new Date(Date.now() - 86_400_000 * 3 * (2 - v));
    const memory = v ? { visits: v, lastVisit: new Date(now.getTime() - 3 * 86_400_000), notes } : undefined;
    const turn = (transcript: Turn[], learnerSaid?: string) => runBeginnerTurn({ character, transcript, learnerSaid, memory, now, stageText: stageText(STAGES.S2, character.role), maxAnswers: STAGES.S2.answers, withDone: true });
    const t: Turn[] = [];
    const open = await turn([]);
    t.push({ who: 'npc', transcript: open.line, translation: open.en });
    for (let i = 0; i < 4; i++) {
      const said = await ask(`Conversation so far:\n${show(t)}\n\nWhat do you say next?`, {
        system: `You are role-playing a beginner learner of Spanish who has just moved to Mexico City, in a test. You're ${process.env.SCENE ?? 'in a café in Condesa'} talking with ${character.name}. ${v ? `You've met before (visit ${v + 1}).` : 'You have never met.'} Answer what she asks, simply, the way a beginner would, mixing in English when stuck. Never bring up ${process.env.AVOID ?? 'drinks, coffee or the menu'} yourself; if they offer something, answer briefly and talk about yourself, your week or the neighbourhood. Write ONLY what you say, one short sentence.`,
        max: 1500,
      });
      t.push({ who: 'learner', transcript: said });
      const r = await turn(t.slice(0, -1), said);
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
      if (r.done) break;
    }
    const lines = t.filter((x) => x.who === 'npc').map((x) => x.transcript);
    visits.push({ mentioned: lines.some(mentions), lines, transcript: show(t) });
    notes = (await summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes, turns: t.map((x) => ({ who: x.who, text: x.transcript })) })).notes;
  }
  return visits;
}

const sets = await pool(Array.from({ length: SETS }, () => set), 5);
const all = sets.flat();
console.log(`${TEST} variant ${VARIANT}: ${MATCH.source} mentioned in ${all.filter((x) => x.mentioned).length}/${all.length} visits; by visit: ${[0, 1, 2].map((v) => `${sets.filter((s) => s[v].mentioned).length}/${SETS}`).join(' · ')}`);
sets.forEach((s, i) => s.forEach((x, v) => console.log(`  set ${i + 1} visit ${v + 1} ${x.mentioned ? 'YES ' : '-   '} ${x.lines[0].slice(0, 150)}`)));
// Every line kept: the whole transcript of every visit, for reading (Josh: "just read her answers")
const file = join(OUT, `here-topic-${TEST}-${VARIANT}-${Date.now()}.md`);
writeFileSync(file, sets.map((s, i) => s.map((x, v) => `## set ${i + 1}, visit ${v + 1}${x.mentioned ? ` (${MATCH.source})` : ''}\n\n${x.transcript}\n`).join('\n')).join('\n'));
console.log(file);
