// The walk: an automatic check of the live game, run after a release (and any night), with nobody playing.
// (Josh, 2026-11-15: "we shoould automate tresting as muuch as possible - before or after deploy".)
//
// A throwaway learner plays every Beginner step on the live server as the app does: three visits a step, the
// level-up offer, a yes, on to Intermediate. Each check below is a bug that reached players because nobody had
// walked this path (docs/bugs.md B33, B34; the step that couldn't open, 4d34814b):
//   - every step opens a visit and every turn comes back
//   - the offer is not due after visits 1 and 2, is due after visit 3, and never answers an error
//   - the app's old address for the offer (the "?" encoded, builds up to 16) still reaches it
//   - a yes moves the step, and at the top step the level
//   - the preview's next line differs from the line as said
//   - the language's share of the character's words doesn't fall from one step to the next
//   - every reply carries the debug panel's facts with the right step, and a turn can be rated (/v1/rate)
// It also prints, per step, the share of the language, the words a turn and how many turns offered answers.
// The share is rough on purpose (words of the line that aren't in its English): automatic, the same every run.
//
//   node scripts/walk-live.mjs            Italy
//   COUNTRY=es-mx node scripts/walk-live.mjs
//   WALK_OUT=<dir>   also saves every turn there (private: the folder must not be in git) and adds a line to walks.jsonl
import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const mexico = process.env.COUNTRY === 'es-mx';
const base = process.env.WALK_BASE ?? (mexico ? 'https://afuera-production.up.railway.app' : 'https://fuori-production.up.railway.app');
const cityId = mexico ? 'guanajuato' : 'bologna';
const places = mexico
  ? ['jardin-de-la-union', 'teatro-juarez', 'monumento-al-pipila', 'alhondiga-de-granaditas', 'escalinata-universidad-guanajuato', 'templo-de-san-cayetano', 'casa-diego-rivera', 'enchiladas-baratillo', 'calle-subterranea-hidalgo']
  : ['caffe-terzi', 'forno-brisa', 'mercato-mezzo', 'santo-stefano', 'pasticceria-regina', 'mercato-erbe', 'due-torri', 'panificio-atti', 'piazza-maggiore', 'san-petronio', 'osteria-bottega', 'giardini-margherita'];
const STEPS = 6;
const VISITS = 3;
const REPLIES = 3;
const fallback = mexico ? 'Sí, me gusta mucho. ¿Y a usted?' : 'Sì, mi piace molto. E Lei?';

const problems = [];
const fail = (what) => { problems.push(what); console.log(`  FAIL ${what}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const reg = await (await fetch(`${base}/v1/auth/device`, { method: 'POST' })).json();
const stream = { Authorization: `Bearer ${reg.token}`, 'Content-Type': 'application/json', 'x-fuori-beginner': '2', Accept: 'application/x-ndjson' };
const json = { ...stream, Accept: 'application/json' };

/** One turn as the app sends it; waits out the rate limit */
async function turn(body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const text = await (await fetch(`${base}/v1/turn`, { method: 'POST', headers: stream, body: JSON.stringify(body) })).text();
    const events = text.trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return { error: { code: 'unreadable', message: l.slice(0, 160) } }; } });
    const err = events.find((e) => e.error)?.error;
    if (err?.code === 'rate_limited') { await sleep((err.retryAfterMs ?? 60000) + 2000); continue; }
    return { reply: events.find((e) => e.reply)?.reply, error: err };
  }
  return { error: { code: 'rate_limited', message: 'still limited after four tries' } };
}

const words = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').match(/[a-z']+/g) ?? [];
// The throwaway learner's id is kept with the run, so its test conversations can be found and deleted afterwards
const log = { country: mexico ? 'es-mx' : 'it', base, at: new Date().toISOString(), learnerId: reg.learnerId ?? reg.learner?.id ?? reg.id ?? null, steps: [] };
let p = 0;

for (let step = 1; step <= STEPS + 1; step++) {
  const name = step <= STEPS ? `step ${step}` : 'Intermediate';
  const rec = { step: name, visits: [], offer: null };
  log.steps.push(rec);
  let last;
  for (let v = 1; v <= VISITS; v++) {
    const placeId = places[p++ % places.length];
    const visit = { placeId, turns: [] };
    rec.visits.push(visit);
    let r = await turn({ cityId, placeId });
    if (!r.reply) { fail(`${name}: the visit at ${placeId} didn't open (${r.error?.code ?? 'no reply'}: ${r.error?.message ?? ''})`); continue; }
    const conv = r.reply.conversationId;
    visit.conversationId = conv;
    visit.turns.push({ who: 'npc', ...r.reply });
    for (let i = 0; i < REPLIES && r.reply; i++) {
      const say = (r.reply.parts ?? []).find((x) => x.kind === 'answer')?.text ?? fallback;
      visit.turns.push({ who: 'learner', text: say });
      r = await turn({ cityId, placeId, conversationId: conv, learnerSaid: say });
      if (r.reply) visit.turns.push({ who: 'npc', ...r.reply });
      else fail(`${name}: a turn at ${placeId} didn't come back (${r.error?.code ?? 'no reply'}: ${r.error?.message ?? ''})`);
    }
    // The debug panel's facts ride on every reply, and a turn can be rated (first visit of each step)
    if (v === 1) {
      const d = visit.turns.find((t) => t.who === 'npc')?.debug;
      if (!d) fail(`${name}: the reply carries no debug facts`);
      else if (step <= STEPS && d.step !== step) fail(`${name}: the debug facts say step ${d.step}`);
      const rated = await fetch(`${base}/v1/rate`, { method: 'POST', headers: json, body: JSON.stringify({ conversationId: conv, turn: 1, rating: 'good', note: 'walk', context: { walk: 'yes' } }) });
      if (rated.status !== 200) fail(`${name}: rating a turn answered ${rated.status}`);
    }
    await fetch(`${base}/v1/conversations/${conv}/end`, { method: 'POST', headers: json, body: '{}' });
    const res = await fetch(`${base}/v1/level-up?conversationId=${conv}`, { headers: json });
    const body = await res.json().catch(() => ({}));
    if (res.status !== 200) fail(`${name}: the offer answered ${res.status} after visit ${v}`);
    else if (v < VISITS && body.due) fail(`${name}: the offer came after visit ${v}, before ${VISITS}`);
    else if (v === VISITS && !body.due && step <= STEPS + 1) fail(`${name}: no offer after visit ${VISITS}`);
    if (v === VISITS) {
      last = body;
      // Builds up to 16 ask with the "?" encoded into the path (B33); the server rewrites it
      const old = await fetch(`${base}/v1/level-up%3FconversationId=${conv}`, { headers: json });
      if (old.status !== 200) fail(`${name}: the app's old address for the offer answered ${old.status}`);
    }
  }
  const npc = rec.visits.flatMap((x) => x.turns.filter((t) => t.who === 'npc' && t.line));
  const all = npc.reduce((n, t) => n + words(t.line).length, 0);
  const inLanguage = npc.reduce((n, t) => { const en = new Set(words(t.en)); return n + words(t.line).filter((w) => !en.has(w)).length; }, 0);
  rec.share = all ? inLanguage / all : 0;
  rec.wordsPerTurn = npc.length ? Math.round(all / npc.length) : 0;
  rec.withAnswers = npc.filter((t) => (t.parts ?? []).some((x) => x.kind === 'answer')).length;
  rec.turns = npc.length;
  console.log(`${name}: ${Math.round(100 * rec.share)}% in the language · ${rec.wordsPerTurn} words a turn · answers on ${rec.withAnswers} of ${rec.turns} turns`);
  if (!last?.due) break;
  rec.offer = last.offer;
  if (last.offer.now.line.trim() === last.offer.next.line.trim()) fail(`${name}: the offer's next line is the same as the line as said`);
  const ans = await (await fetch(`${base}/v1/level-up`, { method: 'POST', headers: json, body: JSON.stringify({ answer: 'yes' }) })).json();
  const want = step < STEPS ? { step: step + 1 } : step === STEPS ? { level: 'intermediate' } : { level: 'advanced' };
  if ((want.step && ans.step !== want.step) || (want.level && ans.level !== want.level)) fail(`${name}: a yes gave ${JSON.stringify(ans)}, expected ${JSON.stringify(want)}`);
  if (step === STEPS + 1) break;
}

// The language's share shouldn't fall from one step to the next (5 points of slack: the count is rough)
for (let i = 1; i < log.steps.length; i++) {
  const [a, b] = [log.steps[i - 1], log.steps[i]];
  if (a.turns && b.turns && b.share < a.share - 0.05) fail(`${b.step} has less of the language than ${a.step} (${Math.round(100 * b.share)}% after ${Math.round(100 * a.share)}%)`);
}

const out = process.env.WALK_OUT;
if (out) {
  mkdirSync(out, { recursive: true });
  const stamp = log.at.slice(0, 16).replace(':', '');
  writeFileSync(join(out, `walk-${log.country}-${stamp}.json`), JSON.stringify(log, null, 1));
  appendFileSync(join(out, 'walks.jsonl'), JSON.stringify({ at: log.at, country: log.country, learnerId: log.learnerId, problems, steps: log.steps.map((s) => ({ step: s.step, share: Math.round(100 * (s.share ?? 0)), words: s.wordsPerTurn, withAnswers: s.withAnswers, turns: s.turns })) }) + '\n');
}
console.log(problems.length ? `walk ${log.country}: ${problems.length} problem(s)` : `walk ${log.country}: ok`);
process.exit(problems.length ? 1 : 0);
