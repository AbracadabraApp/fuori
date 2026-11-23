// A direction run, not a test (Josh, 2026-11-16: "just a trial run for direction -- not a scientific test"): the
// shared prompts as they are (arm A, run from a checkout of main) against the rewrite (arm B, run from a checkout with
// character.md, dialogue.md and scaffolding.md rewritten: fewer words, said as what to do). The same visits on each,
// through the game's own turn (takeTurn, no database), the learner saying the first offered answer.
// Josh's measures: the level stays consistent (the language's share at a step, across characters), turn shape,
// endings, plumbing, and a culture count.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/rewrite-trial.mts --out=/tmp/trial/es-mx-a.json
//   npx tsx tests/experiments/rewrite-trial.mts --compare /tmp/trial/es-mx-a.json /tmp/trial/es-mx-b.json
import { readFileSync, writeFileSync } from 'fs';
import { summary, type T, type Visit } from './trial-measures.mjs';

const args = process.argv.slice(2);
if (args[0] === '--compare') compare(args[1], args[2]);
else await run();

async function run() {
  const { cities, pack } = await import('@/content');
  const { characterForVisit } = await import('@/lib/characters/for-visit');
  const { characterForPlace } = await import('@/lib/characters/for-place');
  const { takeTurn } = await import('@/lib/conversation/take-turn');
  const { CLUSTERS } = await import('@/lib/beginner-2');
  const { cultureCount } = await import('../conversations/measure');
  const out = args.find((a) => a.startsWith('--out='))!.slice(6);
  // A Beginner is decided from the learner's record, so a throwaway Beginner in the local test database
  if (!/localhost/.test(process.env.DATABASE_URL ?? '')) throw new Error('Set DATABASE_URL to the local test database');
  const { query } = await import('@/lib/db');
  const { randomUUID } = await import('crypto');
  const learnerId = randomUUID();
  await query("INSERT INTO learners (id, level) VALUES ($1, 'beginner')", [learnerId]);
  // Intermediate (Josh, 2026-11-16: yes): the rewrite changes character.md and dialogue.md, which every level reads
  const intermediateId = randomUUID();
  await query("INSERT INTO learners (id, level, onboarded_at) VALUES ($1, 'intermediate', now())", [intermediateId]);
  // TRIAL_STEPS=1,4 and TRIAL_KINDS=long and TRIAL_REPEAT=n narrow or widen a run (the ending, 2026-11-17)
  const STEPS = process.env.TRIAL_STEPS ? process.env.TRIAL_STEPS.split(',').map(Number) : [1, 4, 0];
  const KINDS = (process.env.TRIAL_KINDS?.split(',') ?? ['leave', 'long']) as ('leave' | 'long')[];
  const REPEAT = Number(process.env.TRIAL_REPEAT ?? 1);
  const LEAVE_AFTER = 4; // the learner says goodbye after the character's 4th turn
  const MAX_TURNS = Number(process.env.TRIAL_MAX_TURNS ?? 10); // the close is due on the 8th (Intermediate: the 10th reply, so 12); past it is a failure to end
  // TRIAL_LEAVE=go: they say only that they have to go, no goodbye word (the shared rule lost "or that they have to go", 2026-11-17)
  const goodbye = process.env.TRIAL_LEAVE === 'go'
    ? (pack.id === 'it' ? 'Scusi, devo andare.' : 'Perdón, me tengo que ir.')
    : pack.id === 'it' ? 'Bene, devo andare. Grazie, arrivederci.' : 'Bueno, me tengo que ir. Gracias, adiós.';

  // Four characters a country Josh knows, one of each kind of visit: food, a sight, a person in a public place, work
  // or a ride (Josh, 2026-11-16: yes to naming them; the same four every run, so runs compare)
  const SPOTS: Record<string, { city: string; place: string }[]> = {
    'es-mx': [
      { city: 'oaxaca', place: 'tlayudas-mercado-20-de-noviembre' },
      { city: 'ciudad-de-mexico', place: 'murales-palacio-nacional' },
      { city: 'ciudad-de-mexico', place: 'alameda-central' },
      { city: 'guanajuato', place: 'calle-subterranea-hidalgo' },
    ],
    it: [
      { city: 'palermo', place: 'bar-alba' },
      { city: 'palermo', place: 'cappella-palatina' },
      { city: 'palermo', place: 'giardino-garibaldi' },
      { city: 'palermo', place: 'teatro-massimo' },
    ],
  };
  // TRIAL_NO_HERE=1: the header only, no `here` line (arm B of the production-against-header trials, 2026-11-17).
  // It is a switch, not a branch, so both arms run from one checkout
  const NO_HERE = process.env.TRIAL_NO_HERE === '1';
  // TRIAL_SPOTS=city/place,city/place plays other people than the usual four (2026-11-17: bare `here` lines against
  // lines with a life in them, read side by side)
  const wanted = process.env.TRIAL_SPOTS
    ? process.env.TRIAL_SPOTS.split(',').map((x) => { const [city, place] = x.split('/'); return { city, place }; })
    : SPOTS[pack.id];
  const spots = wanted.filter((s) => { const c = cities.find((x) => x.id === s.city); const p = c?.places.find((x) => x.id === s.place); return c && p && characterForPlace(c, p); });
  if (spots.length !== wanted.length) throw new Error(`a named character is missing in ${pack.id}`);
  const jobs: Visit[] = Array.from({ length: REPEAT }).flatMap(() => STEPS.flatMap((step) => spots.flatMap((s) => KINDS.map((kind) => ({ step, ...s, kind, turns: [] as T[] })))));

  async function play(v: Visit) {
    let character = characterForVisit(v.city, v.place)!;
    if (NO_HERE) {
      const city = cities.find((c) => c.id === v.city)!;
      const person = city.characters?.find((c) => c.id === city.places.find((p) => p.id === v.place)?.characterId);
      const setting = character.appearance?.setting ?? '';
      const bare = person?.here ? setting.replace(`. ${person.here}`, '') : setting;
      if (person?.here && setting.includes(person.here) && bare === setting) throw new Error(`TRIAL_NO_HERE could not remove the here line for ${person.name}`);
      character = { ...character, appearance: { ...character.appearance, setting: bare } } as typeof character;
    }
    v.person = character.name;
    v.arm = NO_HERE ? 'header' : 'production';
    const transcript: { who: 'npc' | 'learner'; transcript: string; translation?: string }[] = [];
    let said: string | undefined;
    let raw = '';
    let conversationId: string | undefined;
    for (let t = 0; t < MAX_TURNS; t++) {
      try {
        const r = await takeTurn({
          learnerId: v.step === 0 ? intermediateId : learnerId, character, cityId: v.city, transcript: transcript as never, learnerSaid: said,
          conversationId, onSoftError: () => {},
          ...(v.step === 0 ? {} : { beginnerCluster: CLUSTERS[v.step - 1] }), onText: (s) => { raw = s; },
        });
        conversationId = r.conversationId ?? conversationId;
        const answers = (r.reply.parts ?? []).filter((p) => p.kind === 'answer');
        v.turns.push({ setup: r.debug?.setup, line: r.reply.line, en: r.reply.en, raw, answers: answers.length, answerTexts: answers.map((a) => a.text), done: !!r.reply.done });
        if (said) transcript.push({ who: 'learner', transcript: said });
        transcript.push({ who: 'npc', transcript: r.reply.line, translation: r.reply.en });
        if (r.reply.done) break;
        said = v.kind === 'leave' && t + 1 === LEAVE_AFTER ? goodbye : answers[0]?.text ?? 'Sí.';
      } catch (err) {
        v.turns.push({ line: '', en: '', answers: 0, done: false, error: String(err).slice(0, 200) });
        break;
      }
    }
    if (v.kind === 'long') {
      try { v.culture = await cultureCount([v.turns.map((t) => ({ who: 'npc' as const, text: t.line }))], character.name); } catch { v.culture = undefined; }
    }
    process.stderr.write('.');
  }
  if (process.env.TRIAL_ONE) jobs.splice(1);
  for (let i = 0; i < jobs.length; i += 4) await Promise.all(jobs.slice(i, i + 4).map(play));
  writeFileSync(out, JSON.stringify(jobs, null, 1));
  await query('DELETE FROM conversations WHERE learner_id = $1', [learnerId]);
  await query('DELETE FROM conversations WHERE learner_id = $1', [intermediateId]);
  await query('DELETE FROM learners WHERE id = ANY($1)', [[learnerId, intermediateId]]);
  console.log(`\n${jobs.length} visits → ${out}`);
}

function compare(a: string, b: string) {
  const A = summary(JSON.parse(readFileSync(a, 'utf8'))), B = summary(JSON.parse(readFileSync(b, 'utf8')));
  const w = Math.max(...Object.keys(A).map((k) => k.length));
  console.log(`${''.padEnd(w)}  today  |  rewrite`);
  for (const k of Object.keys(A)) console.log(`${k.padEnd(w)}  ${A[k]}  |  ${B[k]}`);
}
