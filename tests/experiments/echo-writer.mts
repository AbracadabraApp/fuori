// Card B2-E4 (docs/prompt-trials.md, 2026-11-10): a separate, test-only prompt that writes the spoken English
// echo of a Beginner 2 turn, against the code echo (lineFromParts), on the SAME turns, so only the echo differs.
// Reads the turns of a saved automated-replies run (B2-E's A run), rewrites each turn's spoken line with the
// English woven in (Josh's four styles; briefer and more characteristic; two short sentences combined),
// and counts: Spanish kept, English words, runs, copy guard, the call's time; then a masked comprehension
// screen on the spoken line, and the 10 pairs for Josh (text, and audio). Nothing in lib/ or content/ changes.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/echo-writer.mts [--limit=40] [--comp=1] [--audio=1] [--label=name] [--src=prefix]
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { getVoiceProvider } from '@/lib/voice/providers';
import { voiceForCharacter, DEFAULT_APP_SPEED } from '@/lib/voice/early-voice';
import type { Part } from '@/lib/beginner';
import { ask, pool, OUT, startTest } from './common.mjs';

startTest('B2-E4 (2026-11-10): a separate prompt that writes the spoken English echo, against the code echo, on the same turns');
const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const limit = Number(arg('limit', '40'));
const comp = arg('comp', '1') === '1';
const audio = arg('audio', '0') === '1';
const label = arg('label', 'b2e4');
const src = arg('src', 'automated-b2e-real-A-');
const srcFile = readdirSync(OUT).filter((f) => f.startsWith(src)).sort().pop()!;
const turns = (JSON.parse(readFileSync(join(OUT, srcFile), 'utf8')).rows as { character: string; turn: number; ok: boolean; parts?: Part[]; line?: string }[])
  .filter((r) => r.ok && r.parts && r.line).slice(0, limit);

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const spanishParts = (parts: Part[]) => parts.filter((p) => p.kind === 'word' || p.kind === 'question').map((p) => p.text.trim());

const SYSTEM = `You write what a bilingual local says out loud to someone at the very start of ${language.name}. You are given one turn: her ${language.name} phrases in order, each with its literal English. Rewrite the spoken line so the ${language.name} stays exactly as written and the English is woven in the way a person who knows some English talks to a newcomer.

Rules:
- Every ${language.name} phrase stays word for word and in the same order. Do not add, drop or reword any of it.
- The English is briefer than the literal translations, and more characteristic: in her voice, not a subtitle.
- Every fact in the turn stays: the thing she names, what she does, what she offers. Woven, not mirrored, so that someone with no Spanish still gets all of it from the English. Add nothing the literal English does not say.
- One English piece for a sentence, or one for two short sentences next to each other; never a translation after every sentence.
- Use Josh's four ways, as models, each only where it fits: (1) the key phrase echoed, in the same breath: "El Andador es el corazón de la ciudad, the heart of the city…"; (2) an aside in her own voice, the warm words kept in ${language.name}: "¿Le gustan? You like them? My abuela made them this way."; (3) a check that ends on a short tag in ${language.name}: "La Parroquia, the big pink church, ¿la ve?"; (4) English as her own explanation: "Hoy hay mole. It's a sauce, very dark, chocolate and chiles; you must try."
- A greeting or thanks needs no English.
- Every question gets its English right after it.
- Reply with JSON: { "line": "..." }, the whole spoken line.`;
const lineSchema = { type: 'object', additionalProperties: false, required: ['line'], properties: { line: { type: 'string' } } };
const input = (parts: Part[]) => parts.filter((p) => p.kind === 'word' || p.kind === 'question').map((p, i) => `${i + 1}. ${p.text}  =  ${p.en || p.gloss || ''}`).join('\n');
async function write(parts: Part[]): Promise<{ line: string; ms: number }> {
  const t = performance.now();
  const r = JSON.parse(await ask(input(parts), { system: SYSTEM, schema: lineSchema, max: 800 })) as { line: string };
  return { line: r.line.trim(), ms: Math.round(performance.now() - t) };
}

interface Row { character: string; turn: number; parts: Part[]; a: string; e?: string; e2?: string; ms?: number; ms2?: number; kept?: boolean; kept2?: boolean; comp?: Record<string, { asked: number; right: number }> }
const rows: Row[] = turns.map((t) => ({ character: t.character, turn: t.turn, parts: t.parts!, a: t.line! }));
await pool(rows.map((r) => async () => {
  try { const w = await write(r.parts); r.e = w.line; r.ms = w.ms; } catch (e) { console.log('write failed', String(e).slice(0, 100)); }
  try { const w = await write(r.parts); r.e2 = w.line; r.ms2 = w.ms; } catch { /* left out */ }
}), 6);

// Counted: Spanish kept (every phrase, word for word, in order), English words and runs, the copy guard
const keeps = (line: string, parts: Part[]) => { let at = 0; const n = norm(line); for (const p of spanishParts(parts)) { const i = n.indexOf(norm(p), at); if (i < 0) return false; at = i + norm(p).length; } return true; };
const english = (line: string, parts: Part[]) => { let rest = line; for (const p of spanishParts(parts)) rest = rest.replace(p, '\u0001'); return rest; };
const engWords = (line: string, parts: Part[]) => words(english(line, parts).replace(/\u0001/g, ' ').replace(/\s+/g, ' '));
const engRuns = (line: string, parts: Part[]) => english(line, parts).split('\u0001').filter((s) => /[\p{L}]{2}/u.test(s)).length;
const done = rows.filter((r) => r.e);
for (const r of done) { r.kept = keeps(r.e!, r.parts); r.kept2 = r.e2 ? keeps(r.e2, r.parts) : undefined; }
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const copies = (k: 'a' | 'e') => done.filter((r) => /Andador|Parroquia|abuela made them|Hoy hay mole/.test(r[k]!)).length;
const ms = done.map((r) => r.ms!).sort((a, b) => a - b);
console.log(`echo writer · ${label} · ${done.length}/${rows.length} turns from ${srcFile}`);
console.log(`  Spanish kept word for word, in order: E ${done.filter((r) => r.kept).length}/${done.length} · E again ${done.filter((r) => r.kept2).length}/${done.filter((r) => r.e2).length}`);
console.log(`  English words a turn: A ${mean(done.map((r) => engWords(r.a, r.parts))).toFixed(1)} · E ${mean(done.map((r) => engWords(r.e!, r.parts))).toFixed(1)} · E again ${mean(done.filter((r) => r.e2).map((r) => engWords(r.e2!, r.parts))).toFixed(1)}`);
const spWords = (r: Row) => spanishParts(r.parts).reduce((n, p) => n + words(p), 0);
const ratio = (k: 'a' | 'e') => done.reduce((n, r) => n + engWords(r[k]!, r.parts), 0) / (done.reduce((n, r) => n + spWords(r), 0) || 1);
console.log(`  English words per Spanish word: A ${ratio('a').toFixed(2)} · E ${ratio('e').toFixed(2)} (E at most 0.8 of A = ${(0.8 * ratio('a')).toFixed(2)})`);
console.log(`  English runs a turn: A ${mean(done.map((r) => engRuns(r.a, r.parts))).toFixed(1)} · E ${mean(done.map((r) => engRuns(r.e!, r.parts))).toFixed(1)}`);
console.log(`  copy guard (an example string in the line): A ${copies('a')} · E ${copies('e')} of ${done.length}`);
console.log(`  echo call (the game's model): median ${ms[Math.floor(ms.length / 2)]} ms, p90 ${ms[Math.floor(ms.length * 0.9)]} ms (bar: p90 at most 2500 ms, else a win is moot)`);

// Comprehension by ear, a screen: the spoken line with her language masked; the same questions for A, E and E again (the Spanish is the same)
if (comp) {
  const qSchema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['q', 'a'], properties: { q: { type: 'string' }, a: { type: 'string' } } } } } };
  const gSchema = { type: 'object', additionalProperties: false, required: ['right'], properties: { right: { type: 'array', items: { type: 'boolean' } } } };
  const stmts = (parts: Part[]) => parts.filter((p) => p.kind === 'word');
  const full = (r: Row) => stmts(r.parts).map((p) => `${p.text} (${p.en || p.gloss || ''})`).join('\n');
  const mask = (line: string, parts: Part[]) => english(line, parts).replace(/\u0001/g, `[${language.name}]`);
  const allMasked = (r: Row) => stmts(r.parts).map(() => `[${language.name}]`).join(' ');
  const read = async (view: string, qs: { q: string; a: string }[]) => {
    const got = (JSON.parse(await ask(`You know NO ${language.name} at all. This is everything you can hear of what a character just said (${language.name} is hidden; only the English is heard):\n${view}\n\nAnswer each question only from what you heard. If you cannot tell, answer "unknown".\n${qs.map((q, i) => `${i + 1}. ${q.q}`).join('\n')}`, { schema: qSchema, max: 800 })) as { items: { a: string }[] }).items;
    const g = JSON.parse(await ask(`Questions with the right answers, and a reader's answers. For each, is the reader's answer right (the same meaning)? "unknown" is wrong.\n${qs.map((q, i) => `${i + 1}. ${q.q}\n   right: ${q.a}\n   reader: ${got[i]?.a ?? 'unknown'}`).join('\n')}`, { schema: gSchema, max: 400 })) as { right: boolean[] };
    return { asked: qs.length, right: qs.filter((_, i) => g.right[i]).length };
  };
  const ctl = new Set(done.map((_, i) => i).filter((i) => i % 2 === 0).slice(0, 20));
  await pool(done.map((r, i) => async () => {
    if (!r.kept) return; // the Spanish is not all there, so it cannot be masked reliably
    try {
      const qs = (JSON.parse(await ask(`A ${language.name}-speaking character said this to a learner (each phrase with its English in round brackets):\n${full(r)}\n\nWrite 3 short questions about what the character MEANT TO CONVEY in these statements: what she says about the thing she names, what she is doing, what she offers. Not details only the ${language.name} could carry (exact prices, times). Give the right answer to each in English.`, { schema: qSchema, max: 1200 })) as { items: { q: string; a: string }[] }).items.slice(0, 3);
      if (!qs.length) return;
      r.comp = { A: await read(mask(r.a, r.parts), qs), E: await read(mask(r.e!, r.parts), qs) };
      if (r.e2) r.comp.E2 = await read(mask(r.e2, r.parts), qs);
      if (ctl.has(i)) { r.comp.full = await read(full(r), qs); r.comp.none = await read(allMasked(r), qs); }
    } catch { /* left out */ }
  }), 6);
  const unmaskable = done.filter((r) => !r.kept).length;
  const sc = done.filter((r) => r.comp);
  const pc = (k: string) => { const s = sc.filter((r) => r.comp![k]); const ok = s.filter((r) => r.comp![k].right === r.comp![k].asked).length; return `${ok}/${s.length} (${s.length ? Math.round((100 * ok) / s.length) : 0}%)`; };
  const disc = (k: string) => ({ aOnly: sc.filter((r) => r.comp!.A && r.comp![k] && r.comp!.A.right === r.comp!.A.asked && r.comp![k].right < r.comp![k].asked).length, kOnly: sc.filter((r) => r.comp!.A && r.comp![k] && r.comp!.A.right < r.comp!.A.asked && r.comp![k].right === r.comp![k].asked).length });
  const ee = sc.filter((r) => r.comp!.E && r.comp!.E2); const eOnly = ee.filter((r) => r.comp!.E.right === r.comp!.E.asked && r.comp!.E2.right < r.comp!.E2.asked).length, e2Only = ee.filter((r) => r.comp!.E.right < r.comp!.E.asked && r.comp!.E2.right === r.comp!.E2.asked).length;
  console.log(`  paired turns (every question right): A right and E wrong ${disc('E').aOnly}, E right and A wrong ${disc('E').kOnly}; E against E again: ${eOnly} and ${e2Only} (E is worse if A-only exceeds E-only by 6 or more, and by more than the E–E again count); ${unmaskable} turns unmaskable`);
  console.log(`  comprehension by ear, a reader with ${language.name} masked, turns with every question right: A ${pc('A')} · E ${pc('E')} · E again ${pc('E2')}`);
  console.log(`  controls (same questions): sees everything ${pc('full')} · sees nothing ${pc('none')} (read E as E minus this floor)`);
}

mkdirSync(OUT, { recursive: true });
const file = join(OUT, `echo-writer-${label}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
writeFileSync(file, JSON.stringify({ label, src: srcFile, system: SYSTEM, rows }, null, 1));

// The pairs for Josh: 10 A–E (openers and first replies, different places) and 2 hidden E–E again, order and sides randomised, the key held back
const byChar = new Map<string, Row[]>();
for (const r of done) byChar.set(r.character, [...(byChar.get(r.character) ?? []), r]);
const chars = [...byChar.keys()];
const picks: Row[] = [...chars.map((c) => byChar.get(c)![0]), ...chars.map((c) => byChar.get(c)![1]), byChar.get(chars[0])![2], byChar.get(chars[2])![2]].filter(Boolean);
type Pair = { r: Row; x: string; y: string; lab: [string, string] };
const pairs: Pair[] = picks.map((r) => ({ r, x: r.a, y: r.e!, lab: ['A', 'E'] as [string, string] }));
for (const r of [byChar.get(chars[1])![0], byChar.get(chars[3])![0]]) if (r) pairs.push({ r, x: r.a, y: r.a, lab: ['A', 'A'] }); // controls: the same text, two takes
let seed = 13;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
pairs.sort(() => rnd() - 0.5);
const key: { pair: number; one: string; two: string; character: string; turn: number }[] = [];
let md = `# Which sounds more like a local helping?\n\nThe Spanish is the same in both. Say which you prefer (1 or 2) or "same", and whether you could follow it with no Spanish.\n\n`;
const sides: [string, string][] = [];
pairs.forEach((p, i) => { const flip = rnd() < 0.5; const a = flip ? p.y : p.x, b = flip ? p.x : p.y; sides.push([a, b]); md += `## Pair ${i + 1}\n**1.** ${a}\n\n**2.** ${b}\n\n`; key.push({ pair: i + 1, one: flip ? p.lab[1] : p.lab[0], two: flip ? p.lab[0] : p.lab[1], character: p.r.character, turn: p.r.turn }); });
const dir = join(OUT, `echo-writer-pairs-${label}`);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'pairs.md'), md);
writeFileSync(join(dir, 'key.json'), JSON.stringify(key, null, 1));
console.log(`  pairs: ${pairs.length} written to ${dir}/pairs.md (key held back)`);

if (audio) {
  const idByName = new Map<string, string>();
  for (const c of cities) for (const pl of c.places) { const ch = pl.characterId ? characterForVisit(c.id, pl.id) : undefined; if (ch) idByName.set(ch.name, ch.id); }
  const provider = getVoiceProvider();
  let made = 0;
  for (let i = 0; i < pairs.length; i++) for (const side of [0, 1]) {
    const id = idByName.get(pairs[i].r.character);
    try {
      const out = await provider.synthesize({ text: sides[i][side], language: language.code, characterId: id, voice: id ? voiceForCharacter(id) : undefined, speed: DEFAULT_APP_SPEED });
      if (out.audio) { writeFileSync(join(dir, `pair-${String(i + 1).padStart(2, '0')}-${side + 1}.mp3`), out.audio); made++; }
    } catch (e) { console.log(`audio failed pair ${i + 1}/${side + 1}: ${String(e).slice(0, 100)}`); }
  }
  console.log(`  audio: ${made} files in ${dir}`);
}
console.log(`  saved ${file}`);
