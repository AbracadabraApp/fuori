// Automated replies (docs/automated-replies.md, build steps 1 and 1b): whole Beginner 2 visits played
// through the game's own Beginner 2 turn (lib/beginner-2.ts, as lib/conversation/take-turn.ts composes
// it), with the learner's side picked by code at a persona's rates. Said-back lines and edits are made
// in code; own words, a question and English are one small call each, of that kind only. Every turn is
// saved; the counts are about the character's side. A tool, not a test of a change (docs/prompt-testing.md).
// No database. A place's visits are played in order and, after each, the game's own end-of-conversation
// memory writer (lib/remember.ts summarizeWithClaude) writes the character's notes, kept here and passed
// as `memory` into the next visit, as take-turn.ts does (build step 2). Repeats across visits are counted at the end.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/automated-replies.mts [--cluster=1] [--visits=2] [--turns=12] [--persona=josh] [--characters=4] [--label=name]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runBeginnerTurn, lineFromParts, SCAFFOLDING_FILE, type Part } from '@/lib/beginner';
import { TURN_MODEL } from '@/lib/claude';
import { CLUSTERS, levelText, setupLine, shapeParts, pickSetup } from '@/lib/beginner-2';
import { summarizeWithClaude } from '@/lib/remember';
import { repeatsFromEarlier } from '@/lib/dialogue-stats';
import type { CharacterMemory } from '@/lib/memory';
import { ask, pool, OUT } from './common.mjs';

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const clusterNo = Number(arg('cluster', '1'));
const cluster = CLUSTERS[clusterNo - 1];
const visits = Number(arg('visits', '2'));
const maxTurns = Number(arg('turns', '12'));
const persona = arg('persona', 'josh');
const howMany = Number(arg('characters', '4'));
const label = arg('label', `c${clusterNo}-${persona}`);

/** The learner's reply kinds and their rates (docs/automated-replies.md → persona mixes, from real play) */
type Kind = 'back' | 'edit' | 'own' | 'question' | 'english';
const PERSONAS: Record<string, Record<Kind, number>> = {
  josh: { back: 0.5, edit: 0.1, own: 0.25, question: 0.05, english: 0.1 },
  jennifer: { back: 0.8, edit: 0.05, own: 0, question: 0, english: 0.15 },
};
const rates = PERSONAS[persona] ?? PERSONAS.josh;

/** A seeded random, so a run replays */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2 ** 32;
}
function pickKind(r: () => number, hasAnswers: boolean): Kind {
  const allowed = (Object.keys(rates) as Kind[]).filter((k) => hasAnswers || (k !== 'back' && k !== 'edit'));
  const total = allowed.reduce((n, k) => n + rates[k], 0);
  let x = r() * total;
  for (const k of allowed) if ((x -= rates[k]) <= 0) return k;
  return allowed[allowed.length - 1];
}

/** Edits to an offered answer, made in code, so what was done is known: a vowel-final word's ending flipped, or garbled like speech-to-text, or the last word dropped */
function edit(answer: string, r: () => number): { said: string; how: string } {
  const words = answer.split(' ');
  const which = r();
  if (which < 0.4) {
    const i = words.findIndex((w, k) => k > 0 && /[aeiou][.,!?]?$/i.test(w) && w.length > 3);
    if (i > 0) { words[i] = words[i].replace(/([aeiou])([.,!?]?)$/i, (_, v, p) => ({ a: 'o', o: 'a', e: 'a', i: 'e', u: 'o' } as Record<string, string>)[v.toLowerCase()] + p); return { said: words.join(' '), how: 'ending flipped' }; }
  }
  if (which < 0.75) return { said: answer.toLowerCase().replace(/[¿¡.,!?]/g, '').replace(/(\w)(\w)\s(\w)/, '$1$2$3'), how: 'garbled' };
  return { said: words.slice(0, Math.max(1, words.length - 1)).join(' '), how: 'last word dropped' };
}

/** One small call for the kinds that need writing, of that kind only, answering the character's last line */
async function write(kind: 'own' | 'question' | 'english', lastLine: string): Promise<string> {
  const task = {
    own: `a short reply in very simple ${language.name} (at most 6 words), the way a beginner would say it, maybe with one small mistake`,
    question: `a short question in simple ${language.name} (at most 6 words) a beginner might ask about what was just said`,
    english: `a short reply in English (at most 10 words), answering what was just said`,
  }[kind];
  return (await ask(`You are a beginner learner of ${language.name}, talking with someone in ${language.card.country}. They just said:\n"${lastLine}"\n\nWrite only ${task}. Don't bring up a topic of your own. Reply with the line only, no quotes.`, { max: 100 })).replace(/^"|"$/g, '');
}

// The characters: the first places with a person, spread across cities
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);

interface TurnRow { character: string; visit: number; turn: number; setup: string; fixes?: string[]; kind?: Kind | 'goodbye'; how?: string; said?: string; ms: number; ok: boolean; error?: string; parts?: Part[]; line?: string; answers?: string[]; done?: boolean }
const rows: TurnRow[] = [];

const t0 = Date.now();
const memoryNotes: Record<string, string[][]> = {}; // character → the notes after each visit
const lines: Record<string, string[][]> = {}; // character → her lines in each visit
await pool(chosen.map(({ city, place }) => async () => {
  const character = characterForVisit(city.id, place.id);
  if (!character) return;
  let memory: CharacterMemory | undefined;
  memoryNotes[character.id] = [];
  lines[character.id] = [];
  for (let v = 0; v < visits; v++) {
  const r = rng(`${label}|${character.id}|${v}`);
  const conversationId = `auto-${label}-${character.id}-${v}`;
  const transcript: { who: 'npc' | 'learner'; transcript: string; offered?: string[] }[] = [];
  let said: string | undefined;
  let kind: TurnRow['kind'];
  let how: string | undefined;
  for (let turn = 0; turn < maxTurns; turn++) {
    const setup = pickSetup({ conversationId: turn === 0 ? null : conversationId, turn, learnerId: `auto-${v}`, characterId: character.id, learnerSaid: said }, cluster);
    const started = performance.now();
    try {
      const reply = await runBeginnerTurn({ character, transcript: transcript as never, learnerSaid: said, memory, promptFile: SCAFFOLDING_FILE, stageText: levelText(cluster), turnNote: setupLine(setup), maxAnswers: setup.maxAnswers, withDone: true });
      const { parts, fixes } = shapeParts(reply.parts, setup, cluster);
      const { line } = lineFromParts(parts);
      const answers = parts.filter((p) => p.kind === 'answer').map((p) => p.text);
      rows.push({ character: character.name, visit: v, turn: turn + 1, setup: setup.id, fixes, kind, how, said, ms: Math.round(performance.now() - started), ok: true, parts, line, answers, done: reply.done });
      if (said) transcript.push({ who: 'learner', transcript: said });
      transcript.push({ who: 'npc', transcript: line, offered: answers });
      if (reply.done) break;
      // The learner's next line
      if (setup.id === 'goodbye' && answers.length) { kind = 'goodbye'; how = undefined; said = answers[0]; continue; }
      const k = pickKind(r, answers.length > 0);
      kind = k; how = undefined;
      if (k === 'back') said = answers[Math.floor(r() * answers.length)];
      else if (k === 'edit') { const e = edit(answers[Math.floor(r() * answers.length)], r); said = e.said; how = e.how; }
      else said = await write(k, line);
    } catch (e) {
      rows.push({ character: character.name, visit: v, turn: turn + 1, setup: setup.id, kind, said, ms: Math.round(performance.now() - started), ok: false, error: String(e).slice(0, 160) });
      break;
    }
  }
  lines[character.id].push(transcript.filter((t) => t.who === 'npc').map((t) => t.transcript));
  // The game's own memory writing, as when a conversation ends (it remembers a visit of 2+ learner lines)
  const learnerLines = transcript.filter((t) => t.who === 'learner').length;
  if (learnerLines >= 2) {
    try {
      const out = await summarizeWithClaude({ character, notes: memory?.notes ?? [], turns: transcript.map((t) => ({ who: t.who, text: t.transcript })) });
      memory = { visits: v + 1, lastVisit: new Date(), notes: out.notes };
    } catch (e) { console.log(`memory failed ${character.name} visit ${v}: ${String(e).slice(0, 120)}`); }
  }
  memoryNotes[character.id].push(memory?.notes ?? []);
  }
}), 6);
const secs = Math.round((Date.now() - t0) / 1000);

mkdirSync(OUT, { recursive: true });
const file = join(OUT, `automated-${label}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
writeFileSync(file, JSON.stringify({ label, cluster: clusterNo, persona, model: TURN_MODEL, secs, rows, memoryNotes, lines }, null, 1));

// The counts (the character's side; facts from the parts and the spoken line)
const ok = rows.filter((x) => x.ok);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const en = (x: TurnRow) => (x.parts ?? []).filter((p) => p.kind === 'english').reduce((n, p) => n + words(p.text), 0);
// English the learner reads: the English parts plus the glosses under her phrases (cluster 1 glosses every phrase in code)
const gl = (x: TurnRow) => (x.parts ?? []).filter((p) => p.kind === 'word' || p.kind === 'question').reduce((n, p) => n + words(p.gloss ?? ''), 0);
const sp = (x: TurnRow) => (x.parts ?? []).filter((p) => p.kind === 'word' || p.kind === 'question').reduce((n, p) => n + words(p.text), 0);
const followed = (x: TurnRow) => {
  if (x.done) return true; // her last goodbye offers nothing to say back, by design
  const a = x.answers?.length ?? 0;
  if (x.setup === 'two-en' || x.setup === 'goodbye' || x.setup === 'opener') return a >= 2;
  if (x.setup === 'ask-en') return a >= 2 && (x.answers ?? []).some((s) => /\?/.test(s));
  return a === 0;
};
const hasQuestion = (x: TurnRow) => (x.parts ?? []).some((p) => p.kind === 'question');
const qEnglish = (x: TurnRow) => { const ps = x.parts ?? []; const i = ps.findIndex((p) => p.kind === 'question'); return i < 0 || ps[i + 1]?.kind === 'english' || !!ps[i].gloss || ps[i - 1]?.kind === 'english'; };
const inviteElsewhere = ok.filter((x) => x.setup !== 'invite-en' && /in English or|answer (me )?in English/i.test(x.line ?? '')).length;
const announce = ok.filter((x) => /here are two|you could ask me|you can say one of|let me ask/i.test(x.line ?? '')).length;
const visitsDone = new Set(ok.filter((x) => x.done).map((x) => `${x.character}|${x.visit}`)).size;
const visitCount = new Set(rows.map((x) => `${x.character}|${x.visit}`)).size;
const ms = ok.map((x) => x.ms).sort((a, b) => a - b);
console.log(`automated replies · ${label} · cluster ${clusterNo} · ${persona} · ${TURN_MODEL} · ${visitCount} visits, ${rows.length} turns in ${secs}s`);
console.log(`  broken ${rows.length - ok.length} · setup followed ${ok.filter(followed).length}/${ok.length} · English beside every question ${ok.filter((x) => hasQuestion(x) && qEnglish(x)).length}/${ok.filter(hasQuestion).length} turns with one`);
console.log(`  per turn: English ${(ok.reduce((n, x) => n + en(x) + gl(x), 0) / ok.length).toFixed(1)} words (${(ok.reduce((n, x) => n + en(x), 0) / ok.length).toFixed(1)} English parts + ${(ok.reduce((n, x) => n + gl(x), 0) / ok.length).toFixed(1)} glosses), ${language.name} ${(ok.reduce((n, x) => n + sp(x), 0) / ok.length).toFixed(1)} words · reply median ${ms[Math.floor(ms.length / 2)]} ms`);
console.log(`  the English invitation on other turns ${inviteElsewhere} · announcing ${announce} · visits ended on a goodbye ${visitsDone}/${visitCount}`);
const goodbyeTurns = [...new Set(ok.map((x) => `${x.character}|${x.visit}`))].map((k) => ok.filter((x) => `${x.character}|${x.visit}` === k && x.setup === 'goodbye').length);
console.log(`  goodbye turns a visit: ${goodbyeTurns.join(', ')} (a goodbye that drags on shows as more than 2)`);
console.log(`  learner kinds: ${Object.entries(rows.reduce((m, x) => ({ ...m, [x.kind ?? 'opening']: (m[x.kind ?? 'opening'] ?? 0) + 1 }), {} as Record<string, number>)).map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`  saved ${file}`);
// Which code fixes changed Claude's parts, and how often (lib/beginner-2.ts → shapeParts)
const fixCounts = new Map<string, number>();
for (const x of ok) for (const f of x.fixes ?? []) fixCounts.set(f, (fixCounts.get(f) ?? 0) + 1);
console.log(`  code fixes over ${ok.length} turns: ${[...fixCounts].sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f} ${n}`).join(' · ') || 'none'}`);

// ---- Repeats across visits (build step 2) ----
// Exact: the game's own count (8+ word sentences, 70% word overlap) and a shorter one (4+ words), since
// Beginner sentences are short. Content words: words of 5+ letters in this visit's lines that also occur in
// an earlier visit's, against the same share with another place's visits (what any two visits share anyway).
// Retold as new: one judge call per pair of following visits.
if (visits > 1) {
  const { sentenceOverlap } = await import('@/lib/dialogue-stats');
  const sentences = (ls: string[], min: number) => ls.flatMap((l) => l.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter((x) => x.split(/\s+/).length >= min));
  const content = (ls: string[]) => new Set((ls.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-zñ]{5,}/g) ?? []));
  const ids = Object.keys(lines).filter((id) => lines[id].length > 1);
  const out: { character: string; visit: number; exact8: number; exact4: number; shared: number; baseline: number; sharedWords: string[]; judged?: { asNew: { later: string; earlier: string; kind: string }[]; pickedUp: number } }[] = [];
  const judgeSchema = { type: 'object', additionalProperties: false, required: ['asNew', 'pickedUp'], properties: { asNew: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['later', 'earlier', 'kind'], properties: { later: { type: 'string' }, earlier: { type: 'string' }, kind: { type: 'string', enum: ['story', 'fact', 'question'] } } } }, pickedUp: { type: 'integer' } } };
  await pool(ids.flatMap((id) => lines[id].slice(1).map((_, k) => async () => {
    const v = k + 1;
    const earlierAll = lines[id].slice(0, v).flat();
    const others = ids.filter((o) => o !== id).flatMap((o) => lines[o].slice(0, v).flat());
    const cm = content(lines[id][v]);
    const share = (pool: string[]) => { const c = content(pool); return cm.size ? [...cm].filter((w) => c.has(w)).length / cm.size : 0; };
    const exact8 = repeatsFromEarlier(earlierAll, lines[id][v]).length;
    const earlier4 = sentences(earlierAll, 4);
    const exact4 = sentences(lines[id][v], 4).filter((x) => earlier4.some((e) => sentenceOverlap(x, e) >= 0.7)).length;
    const ec = content(earlierAll);
    let judged;
    try {
      judged = JSON.parse(await ask(`Two visits by the same learner to the same ${language.name}-speaking character. Below is what the character said in the EARLIER visit, then in the LATER visit. List what the character, in the LATER visit, tells or asks again as if it were new: a story, a fact about themselves or the place, or a question they already asked or told in the earlier visit. Do not list greetings, farewells or ordinary routine of the trade, and do not list something the character openly picks up as already discussed ("as I told you", "last time"); count those in pickedUp. Quote the later line and the earlier one it repeats.\n\nEARLIER:\n${lines[id][v - 1].join('\n')}\n\nLATER:\n${lines[id][v].join('\n')}`, { schema: judgeSchema, max: 3000 }));
    } catch (e) { judged = undefined; }
    out.push({ character: id, visit: v + 1, exact8, exact4, shared: [...cm].filter((w) => ec.has(w)).length / (cm.size || 1), baseline: share(others), sharedWords: [...cm].filter((w) => ec.has(w)).slice(0, 15), judged });
  })), 6);
  out.sort((a, b) => a.character.localeCompare(b.character) || a.visit - b.visit);
  writeFileSync(file, JSON.stringify({ label, cluster: clusterNo, persona, model: TURN_MODEL, secs, rows, memoryNotes, lines, repeats: out }, null, 1));
  const m = (f: (x: (typeof out)[number]) => number) => (out.reduce((n, x) => n + f(x), 0) / (out.length || 1));
  console.log(`  repeats across visits (${out.length} later visits): exact 8+ words ${m((x) => x.exact8).toFixed(2)} a visit · exact 4+ words ${m((x) => x.exact4).toFixed(2)} · content words shared with earlier visits ${(100 * m((x) => x.shared)).toFixed(0)}% (other places' visits ${(100 * m((x) => x.baseline)).toFixed(0)}%)`);
  const judgedOk = out.filter((x) => x.judged);
  console.log(`  judge: ${judgedOk.reduce((n, x) => n + x.judged!.asNew.length, 0)} retold as new in ${judgedOk.filter((x) => x.judged!.asNew.length).length}/${judgedOk.length} visits · picked up as a thread ${judgedOk.reduce((n, x) => n + x.judged!.pickedUp, 0)}`);
  for (const x of judgedOk) for (const t of x.judged!.asNew) console.log(`    [${x.character} v${x.visit}, ${t.kind}] later: ${t.later} | earlier: ${t.earlier}`);
}
