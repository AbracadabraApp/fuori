// Cards B2-S and B2-P (docs/prompt-trials.md, 2026-11-09): Beginner 2's prompt
// (content/<country>/prompts/beginner-2.md, docs/beginner-2.md → The prompt)
// against today's Beginner at S1, on the stored moments, through the same
// runBeginnerTurn; and whether Beginner 2 follows each reply setup line.
// Everything counted here is a fact from the parts; the role watch and two
// setups are read from the saved turns (every turn written to out/).
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/b2-prompt.mts pilot
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/b2-prompt.mts run
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startTest, pool, OUT } from './common.mjs';
import { loadMoments, asTurns, type Moment } from './moments.mjs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runBeginnerTurn, buildBeginnerPrompt, type Part } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';

const CARD_P = "B2-P (2026-11-09): Beginner 2's prompt (one prompt, the level and reply setup filled in) against today's Beginner, on stored moments";
const CARD_S = "B2-S (2026-11-09): does Beginner 2's character follow each reply setup line? (runs with B2-P)";
startTest(CARD_P);
startTest(CARD_S);

const mode = process.argv[2] === 'run' ? 'run' : 'pilot';
const B_FILE = 'beginner-2.md';
// The reply setup lines (docs/beginner-2.md → The prompt, item 1)
const SETUP = {
  two: { line: 'This turn, give them two short answers they could say back.', max: 2 },
  inside: { line: 'This turn, say the answer they could give inside what you say, and give no separate answers.', max: 0 },
  gloss: { line: "This turn, give the English for the words that matter as you ask, and give no answers: they'll make their own.", max: 0 },
  invite: { line: 'This turn, ask what they think, and invite them to answer in English.', max: 0 },
  none: { line: 'This turn, give no answers.', max: 0 },
} as const;
type SetupId = keyof typeof SETUP;

const moments = loadMoments().filter((m) => m.level === 'beginner' && m.kind === 'town');
const use = mode === 'pilot' ? moments.slice(0, 2) : moments;
const runsP = mode === 'pilot' ? 2 : 5;
const runsS = mode === 'pilot' ? 1 : 3;

type Arm = 'A1' | 'A2' | 'B' | `S-${SetupId}`;
interface Row { arm: Arm; moment: string; run: number; ok: boolean; error?: string; parts: Part[]; line: string; ms: number }

async function turn(m: Moment, arm: Arm, run: number): Promise<Row> {
  const character = characterForVisit(m.cityId!, m.placeId!);
  if (!character) throw new Error(`${m.id}: nobody at ${m.cityId}/${m.placeId}`);
  const now = new Date();
  const memory = m.memory ? { visits: m.memory.visits, lastVisit: new Date(now.getTime() - m.memory.daysAgo * 86_400_000).toISOString(), notes: m.memory.notes } : undefined;
  const base = { character, transcript: asTurns(m), learnerSaid: m.said, memory: memory as never, now, withDone: true };
  const started = performance.now();
  try {
    const r = arm === 'A1' || arm === 'A2'
      // A: today's S1 (beginner.md + the S1 blocks, 2 answers); the S2 moments run at S1 too (card)
      ? await runBeginnerTurn({ ...base, stageText: stageText(STAGES.S1, character.role), maxAnswers: STAGES.S1.answers })
      : await (() => {
          const id: SetupId = arm === 'B' ? 'two' : (arm.slice(2) as SetupId);
          return runBeginnerTurn({ ...base, promptFile: B_FILE, stageText: SETUP[id].line, maxAnswers: SETUP[id].max });
        })();
    return { arm, moment: m.id, run, ok: true, parts: r.parts, line: r.line, ms: Math.round(performance.now() - started) };
  } catch (e) {
    return { arm, moment: m.id, run, ok: false, error: String(e).slice(0, 200), parts: [], line: '', ms: Math.round(performance.now() - started) };
  }
}

// ---- counts (facts) ----
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
const words = (s: string) => norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
function dist(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const near = (w: string, pool: string[]) => pool.some((t) => dist(w, t) <= 1);
const lang = (p: Part) => p.kind === 'word' || p.kind === 'question';

/** (1) a part's gloss (or its en when the part is short) that only repeats its own text by spelling */
function echoes(parts: Part[]): string[] {
  const hits: string[] = [];
  for (const p of parts.filter(lang)) {
    const g = p.gloss?.trim() || (p.text.split(/\s+/).length <= 3 ? p.en : '');
    const gw = words(g).filter((w) => w.length >= 4);
    if (gw.length && gw.every((w) => near(w, words(p.text)))) hits.push(`${p.text} {${g}}`);
  }
  return hits;
}
/** (2) both forms: two 4+ letter vowel-final words differing only in the last letter, side by side (comma, slash, "o") or a "/a" "/o" token */
function bothForms(parts: Part[], already: Set<string>): string[] {
  const hits: string[] = [];
  for (const p of parts.filter(lang)) {
    const t = norm(p.text);
    for (const m of t.matchAll(/\b(\p{L}{3,})[oa]\/[oa]\b/gu)) hits.push(m[0]);
    const toks = t.split(/\s+/);
    for (let i = 0; i < toks.length; i++) for (let j = i + 1; j <= Math.min(i + 3, toks.length - 1); j++) {
      const a = toks[i].replace(/[^\p{L}]/gu, ''), b = toks[j].replace(/[^\p{L}]/gu, '');
      const between = toks.slice(i + 1, j).map((x) => x.replace(/[^\p{L}]/gu, '')).filter(Boolean);
      if (a.length >= 4 && b.length >= 4 && a !== b && a.slice(0, -1) === b.slice(0, -1) && /[aeiou]$/.test(a) && /[aeiou]$/.test(b) && between.every((x) => x === 'o' || x === 'or') && !(already.has(a) && already.has(b))) hits.push(`${a} ${b}`);
    }
  }
  return hits;
}
/** (10) the question repeats her English: 2+ of its 4+ letter words, and half or more, already in her earlier English this turn */
function questionRepeats(parts: Part[]): string[] {
  const hits: string[] = [];
  const english: string[] = [];
  for (const p of parts.filter((x) => x.kind !== 'answer')) {
    if (p.kind === 'question') {
      const qw = words(p.text).filter((w) => w.length >= 4);
      const matched = qw.filter((w) => near(w, english)).length;
      if (matched >= 2 && matched / qw.length >= 0.5) hits.push(p.text);
    }
    english.push(...words(p.kind === 'english' ? p.text : p.en).filter((w) => w.length >= 4));
  }
  return hits;
}
const questions = (parts: Part[]) => parts.filter(lang).reduce((n, p) => n + (p.text.match(/\?/g) ?? []).length, 0);
const langWords = (parts: Part[]) => parts.filter(lang).reduce((n, p) => n + p.text.split(/\s+/).filter(Boolean).length, 0);
const englishSentences = (parts: Part[]) => parts.filter((p) => p.kind === 'english').reduce((n, p) => n + p.text.split(/(?<=[.!?])\s+/).filter(Boolean).length, 0);
const answers = (parts: Part[]) => parts.filter((p) => p.kind === 'answer').length;
const glossed = (parts: Part[]) => parts.some((p) => lang(p) && !!p.gloss?.trim());
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const meanOf = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const jobs: (() => Promise<Row>)[] = [];
for (const m of use) {
  for (let r = 0; r < runsP; r++) for (const arm of ['A1', 'A2', 'B'] as Arm[]) jobs.push(() => turn(m, arm, r));
  for (let r = 0; r < runsS; r++) for (const s of ['inside', 'gloss', 'invite', 'none'] as SetupId[]) jobs.push(() => turn(m, `S-${s}`, r));
}
const t0 = Date.now();
const rows = await pool(jobs, 6);
const secs = Math.round((Date.now() - t0) / 1000);

mkdirSync(OUT, { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const file = join(OUT, `b2-prompt-${mode}-${stamp}.json`);
writeFileSync(file, JSON.stringify({ mode, secs, moments: use.map((m) => m.id), rows }, null, 1));

// Prompt sizes (S1)
const ch = characterForVisit(use[0].cityId!, use[0].placeId!)!;
const sizeA = buildBeginnerPrompt({ character: ch, transcript: [], stageText: stageText(STAGES.S1, ch.role) }).system.split(/\s+/).length;
const sizeB = buildBeginnerPrompt({ character: ch, transcript: [], promptFile: B_FILE, stageText: SETUP.two.line }).system.split(/\s+/).length;

const momentById = new Map(use.map((m) => [m.id, m]));
console.log(`${mode}: ${rows.length} turns in ${secs}s · prompt words A ${sizeA}, B ${sizeB} · saved ${file}\n`);
console.log('B2-P (per arm)');
for (const arm of ['A1', 'A2', 'B'] as Arm[]) {
  const xs = rows.filter((r) => r.arm === arm);
  const okx = xs.filter((r) => r.ok);
  const already = (r: Row) => new Set(words([...(momentById.get(r.moment)?.transcript ?? []).map((t) => t.text), momentById.get(r.moment)?.said ?? ''].join(' ')));
  console.log(`  ${arm}: turns ${xs.length}, invalid ${xs.length - okx.length} · echoes ${okx.reduce((n, r) => n + echoes(r.parts).length, 0)} · both forms ${okx.reduce((n, r) => n + bothForms(r.parts, already(r)).length, 0)} · question repeats ${okx.filter((r) => questionRepeats(r.parts).length).length} · 2+ questions ${okx.filter((r) => questions(r.parts) >= 2).length} · exactly 2 answers ${okx.filter((r) => answers(r.parts) === 2).length} · words in the language mean ${meanOf(okx.map((r) => langWords(r.parts))).toFixed(1)} · English sentences mean ${meanOf(okx.map((r) => englishSentences(r.parts))).toFixed(1)} · reply ms median ${median(okx.map((r) => r.ms))}`);
}
console.log('\nB2-S (per setup; "two" is B2-P\'s B)');
const at2 = rows.filter((r) => r.arm === 'B' && r.ok && r.run < runsS);
console.log(`  two: at least 2 answers ${at2.filter((r) => answers(r.parts) >= 2).length} of ${at2.length}`);
for (const s of ['inside', 'gloss', 'invite', 'none'] as SetupId[]) {
  const xs = rows.filter((r) => r.arm === `S-${s}`);
  const okx = xs.filter((r) => r.ok);
  console.log(`  ${s}: turns ${xs.length}, invalid ${xs.length - okx.length} · glossed (gloss count) ${okx.filter((r) => glossed(r.parts)).length} · words in the language mean ${meanOf(okx.map((r) => langWords(r.parts))).toFixed(1)} · English sentences mean ${meanOf(okx.map((r) => englishSentences(r.parts))).toFixed(1)}`);
}
console.log('\nHits to read:');
for (const r of rows.filter((x) => x.ok)) {
  const e = echoes(r.parts), q = questionRepeats(r.parts);
  if (e.length || q.length) console.log(`  ${r.arm} ${r.moment}#${r.run}: ${[...e.map((x) => `echo: ${x}`), ...q.map((x) => `question repeats: ${x}`)].join(' · ')}`);
}
for (const r of rows.filter((x) => !x.ok)) console.log(`  INVALID ${r.arm} ${r.moment}#${r.run}: ${r.error}`);
