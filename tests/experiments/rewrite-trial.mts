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

type T = { setup?: string; line: string; en: string; raw?: string; answers: number; done: boolean; error?: string };
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
  const STEPS = [1, 4];
  const LEAVE_AFTER = 4; // the learner says goodbye after the character's 4th turn
  const MAX_TURNS = 10; // the close is due on the 8th; past 10 is a failure to end
  const goodbye = pack.id === 'it' ? 'Bene, devo andare. Grazie, arrivederci.' : 'Bueno, me tengo que ir. Gracias, adiós.';

  // Four characters from four cities: the first shown place with someone at it
  const spots = cities.filter((c) => !c.hidden).slice(0, 4).map((c) => {
    const pl = c.places.find((p) => !p.hidden && characterForPlace(c, p))!;
    return { city: c.id, place: pl.id };
  });
  const jobs: Visit[] = STEPS.flatMap((step) => spots.flatMap((s) => (['leave', 'long'] as const).map((kind) => ({ step, ...s, kind, turns: [] }))));

  async function play(v: Visit) {
    const character = characterForVisit(v.city, v.place)!;
    const transcript: { who: 'npc' | 'learner'; transcript: string; translation?: string }[] = [];
    let said: string | undefined;
    let raw = '';
    let conversationId: string | undefined;
    for (let t = 0; t < MAX_TURNS; t++) {
      try {
        const r = await takeTurn({
          learnerId, character, cityId: v.city, transcript: transcript as never, learnerSaid: said,
          conversationId, onSoftError: () => {},
          beginnerCluster: CLUSTERS[v.step - 1], onText: (s) => { raw = s; },
        });
        conversationId = r.conversationId ?? conversationId;
        const answers = (r.reply.parts ?? []).filter((p) => p.kind === 'answer');
        v.turns.push({ setup: r.debug?.setup, line: r.reply.line, en: r.reply.en, raw, answers: answers.length, done: !!r.reply.done });
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
  await query('DELETE FROM learners WHERE id = $1', [learnerId]);
  console.log(`\n${jobs.length} visits → ${out}`);
}

function summary(vs: Visit[]) {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const rows: Record<string, string> = {};
  for (const step of [...new Set(vs.map((v) => v.step))]) {
    const at = vs.filter((v) => v.step === step);
    const shares = at.map((v) => languageShare(v.turns.filter((t) => t.line).map((t) => ({ line: t.line, en: t.en }))) ?? 0);
    const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
    const sd = Math.sqrt(shares.reduce((a, b) => a + (b - mean) ** 2, 0) / shares.length);
    rows[`step ${step} · language share, mean (spread)`] = `${Math.round(mean)}% (±${Math.round(sd)}, ${Math.min(...shares)}–${Math.max(...shares)})`;
    const ts = at.flatMap((v) => v.turns).filter((t) => t.line);
    rows[`step ${step} · words a turn`] = String(Math.round(ts.reduce((n, t) => n + words(t.line), 0) / ts.length));
    rows[`step ${step} · turns with 2+ questions (English)`] = `${ts.filter((t) => (t.en.match(/\?/g) ?? []).length > 1).length}/${ts.length}`;
    const asks = ts.filter((t) => !['comment', 'close', 'goodbye'].includes(t.setup ?? ''));
    rows[`step ${step} · question last (turns meant to ask)`] = `${asks.filter((t) => /\?["'»”)]*\s*$/.test(t.en.trim())).length}/${asks.length}`;
  }
  const leave = vs.filter((v) => v.kind === 'leave');
  rows['endings · goodbye ends the visit at once'] = `${leave.filter((v) => v.turns.length === 5 && v.turns[4].done).length}/${leave.length}`;
  rows['endings · the goodbye back asks nothing'] = `${leave.filter((v) => v.turns[4] && !/\?/.test(v.turns[4].en)).length}/${leave.length}`;
  const long = vs.filter((v) => v.kind === 'long');
  rows['endings · long visit closes by the 8th turn'] = `${long.filter((v) => v.turns.some((t, i) => t.done && i < 8)).length}/${long.length} (turns: ${long.map((v) => v.turns.length).join(' ')})`;
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
