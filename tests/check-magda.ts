// Magda and her study file (redesigned 2026-10-14, docs/02-game-design.md →
// The study file). The prompt part always runs; the database part runs against
// a local DATABASE_URL with stand-ins for Claude.
import { randomUUID } from 'crypto';
import { cities, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildTutorPrompt, repliesSoFar } from '@/lib/prompts/build-tutor-prompt';
import { buildStudyFilePrompt, learningNotesAsLines, type StudyFileWriter, type StudyFileInput } from '@/lib/study-file';
import type { Summarizer, MemoryOutput } from '@/lib/remember';
import type { Judge } from '@/lib/quality';
import type { CharacterSheet, Turn } from '@/lib/types';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const unfilled = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k !== 'line' && k !== 'en');

// --- Every school has the same Magda, placed in that school's city ---
let schools = 0;
for (const city of cities) {
  for (const place of city.places.filter((p) => p.characterId === tutor.id)) {
    schools++;
    const c = characterForPlace(city, place);
    check(c?.id === tutor.id, `${city.name}, ${place.name}: no Magda, or her id changed (her memory would split)`);
    check(c?.city === city.name && !!c?.appearance.setting.includes(place.name), `${place.name}: Magda isn't placed in this school and city`);
  }
}
check(schools > 0, 'no schools point to Magda');

const school = cities.flatMap((c) => c.places.filter((p) => p.characterId === tutor.id).map((p) => ({ c, p })))[0];
const magda = characterForPlace(school.c, school.p)!;

// --- Her prompt: study file, lesson count, reply count ---
const studyFile = ['Level: A2, unsure', 'Recurring: third person with io ("io vuole")', 'Next: vorrei for ordering'];
const p = buildTutorPrompt({ character: magda, memory: { visits: 2, lastVisit: new Date(), notes: studyFile }, replies: 7 });
check(unfilled(p.system).length === 0, `Magda's prompt has unfilled placeholders: ${unfilled(p.system).join(', ')}`);
check(p.system.includes(school.c.name) && p.system.includes(school.p.name), "Magda's prompt doesn't say which school and city");
check(studyFile.every((l) => p.system.includes(l)), "Magda's prompt is missing her study file");
check(p.system.includes('twice') && p.system.includes('7 replies'), "Magda's prompt is missing the lesson count or reply count");
const first = buildTutorPrompt({ character: magda, replies: 0 }).system;
check(unfilled(first).length === 0 && first.includes('first lesson') && first.includes('0 replies'), 'first lesson: wrong lines');
const t: Turn[] = [{ who: 'npc', transcript: 'Ciao' }, { who: 'learner', transcript: 'Ciao' }, { who: 'npc', transcript: 'Come stai?' }];
check(repliesSoFar(t, 'Bene') === 2 && repliesSoFar([], undefined) === 0, 'reply count wrong');

// --- The study file prompt, after a conversation and after a lesson ---
const notes = { items: [{ phrase: 'vorrei', en: 'I would like', why: 'polite' }], mistakes: [{ said: 'io vuole', better: 'io voglio', why: 'first person' }], missed: [{ phrase: 'subito', en: 'right away' }], english: ['what do you sell?'] };
const lines = learningNotesAsLines(notes);
check(['io vuole', 'subito', 'what do you sell?', 'vorrei'].every((x) => lines.includes(x)), 'learning notes lose a field on the way to the study file');
const person = cities.flatMap((c) => c.places.map((pl) => characterForPlace(c, pl))).find((c) => c?.origin === 'generated')!;
const afterConv = buildStudyFilePrompt({ after: 'conversation', studyFile, character: person, learningNotes: notes });
check(unfilled(afterConv.system + afterConv.user).length === 0 && afterConv.user.includes('io vuole') && afterConv.user.includes(person.name), 'study file prompt after a conversation is wrong');
const afterLesson = buildStudyFilePrompt({ after: 'lesson', studyFile: [], character: magda, turns: [{ who: 'npc', text: 'Ciao!', at: '' }, { who: 'learner', text: 'Vorrei un caffè', at: '' }] });
check(unfilled(afterLesson.system + afterLesson.user).length === 0 && afterLesson.user.includes('Student: Vorrei un caffè') && afterLesson.user.includes('Empty'), 'study file prompt after a lesson is wrong');

// --- Database: study file written after conversations and lessons, memory untouched ---
async function dbChecks() {
  const { query, closePool } = await import('@/lib/db');
  const { recordTurn } = await import('@/lib/recording');
  const { rememberConversation } = await import('@/lib/remember');
  const { loadCharacterMemory } = await import('@/lib/memory');
  const me = randomUUID();
  await query('INSERT INTO learners (id) VALUES ($1)', [me]);
  try {
    const city = cities.find((c) => c.places.some((pl) => pl.characterId && pl.characterId !== tutor.id && characterForPlace(c, pl)?.origin === 'generated'))!;
    const place = city.places.find((pl) => pl.characterId && pl.characterId !== tutor.id && characterForPlace(city, pl)?.origin === 'generated')!;
    const who = characterForPlace(city, place)!;
    const talk = async (character: CharacterSheet, cityId: string) => {
      const b = { learnerId: me, character, cityId, promptVersion: 'test' };
      const id = (await recordTurn({ ...b, conversationId: null, reply: { line: 'Buongiorno!', en: '' } }))!;
      await recordTurn({ ...b, conversationId: id, learnerSaid: 'io vuole un caffè', reply: { line: 'Subito!', en: '' } });
      await recordTurn({ ...b, conversationId: id, learnerSaid: 'grazie', reply: { line: 'Prego', en: '' } });
      return id;
    };
    const memOut: MemoryOutput = { notes: ['Ordered a coffee'], review: notes };
    const summarized: string[] = [];
    const summarize: Summarizer = async (input) => { summarized.push(input.character.name); return structuredClone(memOut); };
    const judged: string[] = [];
    const judge: Judge = async (c) => { judged.push(c.name); return { pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, note: '' }; };
    const writes: StudyFileInput[] = [];
    const write: StudyFileWriter = async (input) => { writes.push(input); return [...input.studyFile, `entry ${writes.length} after ${input.after}`]; };

    // A conversation in town: memory and learning notes saved, study file started
    const c1 = await talk(who, city.id);
    check((await rememberConversation(c1, me, summarize, judge, write)) === 'saved', 'conversation not remembered');
    check((await loadCharacterMemory(me, who.id)).notes[0] === 'Ordered a coffee', "the character's own memory wasn't saved");
    const [row] = (await query<{ review: { missed?: unknown[]; english?: unknown[] } }>('SELECT review FROM conversations WHERE id = $1', [c1])).rows;
    check(row.review?.missed?.length === 1 && row.review?.english?.length === 1, 'learning notes not stored with missed and english');
    check(writes[0]?.after === 'conversation' && writes[0]?.studyFile.length === 0, 'study file not updated after the conversation');
    let m = await loadCharacterMemory(me, tutor.id);
    check(m.notes.length === 1 && m.visits === 0, `study file after one conversation: ${JSON.stringify(m)} (a conversation in town is not a lesson)`);

    // A second conversation builds on the study file
    await rememberConversation(await talk(who, city.id), me, summarize, judge, write);
    check(writes[1]?.studyFile.length === 1, 'study file update did not start from the existing file');

    // A lesson: the study file is updated from the lesson, it counts as a lesson, no memory call or scoring
    const before = { summarized: summarized.length, judged: judged.length };
    const lessonCity = cities.find((c) => c.places.some((pl) => pl.characterId === tutor.id))!;
    const lessonSchool = lessonCity.places.find((pl) => pl.characterId === tutor.id)!;
    const lesson = await talk(characterForPlace(lessonCity, lessonSchool)!, lessonCity.id);
    check((await rememberConversation(lesson, me, summarize, judge, write)) === 'saved', 'lesson not remembered');
    check(writes.at(-1)?.after === 'lesson' && writes.at(-1)?.studyFile.length === 2, 'study file not updated from the lesson');
    check(summarized.length === before.summarized && judged.length === before.judged, 'a lesson went through the character memory call or the scorecard');
    m = await loadCharacterMemory(me, tutor.id);
    check(m.visits === 1 && m.notes.length === 3, `after the lesson: ${JSON.stringify(m)}`);

    // A failing study file update never loses the conversation's memory
    const failing: StudyFileWriter = async () => { throw new Error('Claude down'); };
    const c3 = await talk(who, city.id);
    check((await rememberConversation(c3, me, summarize, judge, failing)) === 'saved', 'a study file failure lost the memory');
    check((await loadCharacterMemory(me, tutor.id)).notes.length === 3, 'a failed update changed the study file');

    // Visits for the stamps: counted once the learner has spoken
    const visits = (await query<{ place_id: string; visits: string }>(
      `SELECT place_id, COUNT(*) AS visits FROM conversations
       WHERE learner_id = $1 AND city_id = $2
         AND EXISTS (SELECT 1 FROM jsonb_array_elements(turns) t WHERE t->>'who' = 'learner')
       GROUP BY place_id`, [me, city.id])).rows;
    check(visits.some((v) => v.place_id === place.id && v.visits === '3'), `visit counts wrong: ${JSON.stringify(visits)}`);
  } finally {
    await query('DELETE FROM learners WHERE id = $1', [me]);
    await closePool();
  }
}

async function main() {
  if (!process.env.DATABASE_URL) console.log('(database part SKIPPED: set DATABASE_URL to a local test database)');
  else if (/railway/.test(process.env.DATABASE_URL)) problems.push('Refusing to write test data to Railway. Use a local database.');
  else await dbChecks();
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log(`OK: Magda is at all ${schools} schools with one id; her prompt has the study file, lesson and reply counts; the study file is updated after conversations and lessons without touching memory`);
  });
