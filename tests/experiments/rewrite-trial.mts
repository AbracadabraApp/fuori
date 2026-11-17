// A direction run, not a test (Josh, 2026-11-16: "just a trial run for direction -- not a scientific test"): the
// shared prompts as they are (arm A, run from a checkout of main) against the rewrite (arm B, run from a checkout with
// character.md, dialogue.md and scaffolding.md rewritten: fewer words, said as what to do). The same visits on each,
// through the game's own turn (takeTurn, no database), the learner saying the first offered answer.
// Josh's measures: the level stays consistent (the language's share at a step, across characters), turn shape,
// endings, plumbing, and a culture count.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/rewrite-trial.mts --out=/tmp/trial/es-mx-a.json
//   npx tsx tests/experiments/rewrite-trial.mts --compare /tmp/trial/es-mx-a.json /tmp/trial/es-mx-b.json
import { readFileSync, writeFileSync } from 'fs';
import { languageShare } from '@/lib/dialogue/share';

type T = { setup?: string; line: string; en: string; raw?: string; answers: number; answerTexts?: string[]; done: boolean; error?: string };
// step 0 is Intermediate (no Beginner step: character.md and dialogue.md as every Intermediate visit reads them)
type Visit = { step: number; city: string; place: string; kind: 'leave' | 'long'; turns: T[]; culture?: string[] };

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
  const MAX_TURNS = 10; // the close is due on the 8th; past 10 is a failure to end
  const goodbye = pack.id === 'it' ? 'Bene, devo andare. Grazie, arrivederci.' : 'Bueno, me tengo que ir. Gracias, adiós.';

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
  const spots = SPOTS[pack.id].filter((s) => { const c = cities.find((x) => x.id === s.city); const p = c?.places.find((x) => x.id === s.place); return c && p && characterForPlace(c, p); });
  if (spots.length !== 4) throw new Error(`a named character is missing in ${pack.id}`);
  const jobs: Visit[] = Array.from({ length: REPEAT }).flatMap(() => STEPS.flatMap((step) => spots.flatMap((s) => KINDS.map((kind) => ({ step, ...s, kind, turns: [] as T[] })))));

  async function play(v: Visit) {
    const character = characterForVisit(v.city, v.place)!;
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

function summary(vs: Visit[]) {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const rows: Record<string, string> = {};
  const label = (step: number) => (step === 0 ? 'intermediate' : `step ${step}`);
  for (const step of [...new Set(vs.map((v) => v.step))]) {
    const at = vs.filter((v) => v.step === step);
    const shares = at.map((v) => languageShare(v.turns.filter((t) => t.line).map((t) => ({ line: t.line, en: t.en }))) ?? 0);
    const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
    const sd = Math.sqrt(shares.reduce((a, b) => a + (b - mean) ** 2, 0) / shares.length);
    rows[`${label(step)} · language share, mean (spread)`] = `${Math.round(mean)}% (±${Math.round(sd)}, ${Math.min(...shares)}–${Math.max(...shares)})`;
    const ts = at.flatMap((v) => v.turns).filter((t) => t.line);
    rows[`${label(step)} · words a turn`] = String(Math.round(ts.reduce((n, t) => n + words(t.line), 0) / ts.length));
    rows[`${label(step)} · turns with 2+ questions (English)`] = `${ts.filter((t) => (t.en.match(/\?/g) ?? []).length > 1).length}/${ts.length}`;
    const asks = ts.filter((t) => !['comment', 'close', 'goodbye'].includes(t.setup ?? ''));
    rows[`${label(step)} · question last (turns meant to ask)`] = `${asks.filter((t) => /\?["'»”)]*\s*$/.test(t.en.trim())).length}/${asks.length}`;
    // Each answer a reply and then something that keeps the talk going: two sentences (Josh's bubble rule, 2026-11-16)
    const answers = ts.flatMap((t) => t.answerTexts ?? []);
    if (answers.length) rows[`${label(step)} · answers in two parts`] = `${answers.filter((a) => (a.match(/[.!?…]+(\s|$)/g) ?? []).length >= 2).length}/${answers.length}`;
  }
  const leave = vs.filter((v) => v.kind === 'leave');
  rows['endings · goodbye ends the visit at once'] = `${leave.filter((v) => v.turns.length === 5 && v.turns[4].done).length}/${leave.length}`;
  rows['endings · the goodbye back asks nothing'] = `${leave.filter((v) => v.turns[4] && !/\?/.test(v.turns[4].en)).length}/${leave.length}`;
  const long = vs.filter((v) => v.kind === 'long');
  // The close is the 9th character turn (the learner's 8th), as designed; counted off by one before 2026-11-16
  rows['endings · long visit closes by the learner\'s 8th turn'] = `${long.filter((v) => v.turns.some((t, i) => t.done && i <= 8)).length}/${long.length} (turns: ${long.map((v) => v.turns.length).join(' ')})`;
  const all = vs.flatMap((v) => v.turns);
  rows['plumbing · turns that failed'] = `${all.filter((t) => t.error).length}/${all.length}`;
  const written = all.filter((t) => t.raw);
  const outside = (raw: string) => raw.replace(/^[\s\S]*?"line"\s*:\s*"/, '').replace(/"\s*,\s*"en"[\s\S]*$/, '').replace(/\{[^{}]*\}/g, '').replace(/[\s.,!?…\\n]/g, '');
  rows['plumbing · format kept (all in braces)'] = `${written.filter((t) => /\{[^{}]*\|[^{}]*\}/.test(t.raw!) && !outside(t.raw!)).length}/${written.length}`;
  const wantAnswers = all.filter((t) => !t.error && !['close', 'free'].includes(t.setup ?? '') && !t.done);
  rows['plumbing · two answers where the turn offers them'] = `${wantAnswers.filter((t) => t.answers === 2).length}/${wantAnswers.length}`;
  const cult = long.filter((v) => v.culture);
  rows['culture · things taught a long visit (judge)'] = cult.length ? (cult.reduce((n, v) => n + v.culture!.length, 0) / cult.length).toFixed(1) : 'n/a';
  return rows;
}

function compare(a: string, b: string) {
  const A = summary(JSON.parse(readFileSync(a, 'utf8'))), B = summary(JSON.parse(readFileSync(b, 'utf8')));
  const w = Math.max(...Object.keys(A).map((k) => k.length));
  console.log(`${''.padEnd(w)}  today  |  rewrite`);
  for (const k of Object.keys(A)) console.log(`${k.padEnd(w)}  ${A[k]}  |  ${B[k]}`);
}
