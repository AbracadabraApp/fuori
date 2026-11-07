// Test T6 (docs/prompt-trials.md; card shown to Josh first): what stops a character
// retelling what they told last visit? Head to head, one fixed first visit (a real T3
// visit: Efrén at Monte Albán told Sam about the Gran Plaza and the Danzantes), then
// T4's two fixed return moments, for each version of the memory:
//   A  as now: memory.md's notes (run twice, to see the noise)
//   B  one clause in memory.md's notes rule: "what they told them about (a story, a fact,
//      a thing to see), as 'Already told them about …'" (changed here only, not in the file)
//   C  A's notes plus the character's own lines from the first visit, "Last time you said: …"
//      (built here only; real code in lib/ only if C wins)
// Measures (code): summaries whose notes have a told line naming the Danzantes (B, and A
// for comparison), out of RUNS; return replies naming the Danzantes again, out of 2 × RUNS.
// Guards: notes keep the learner's name; at most 10 notes; words per reply.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/memory-variants.mts [runs]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';
import { buildMemoryPrompt } from '@/lib/prompts/build-memory-prompt';
import { memoryOutputJsonSchema } from '@/lib/prompts/memory-output-schema';
import type { Turn } from '@/lib/types';
import { pool, OUT } from './common.mjs';

const RUNS = Number(process.argv[2] ?? 5);
const city = cities.find((c) => c.id === 'oaxaca')!;
const character = characterForPlace(city, city.places.find((p) => p.id === 'monte-alban')!)!;
const REPEAT = /danzante/i;

// The fixed first visit: set 1, visit 1 of T3's A run
const src = readdirSync(OUT).find((f) => f.startsWith('here-topic-T3-A-'))!;
const block = readFileSync(join(OUT, src), 'utf8').split('## set 1, visit 2')[0].split('\n').filter((l) => /^(Efrén Martínez|Learner): /.test(l));
const first = block.map((l) => ({ who: l.startsWith('Learner') ? 'learner' as const : 'npc' as const, text: l.replace(/^[^:]+: /, '') }));
const hisLines = first.filter((t) => t.who === 'npc').map((t) => t.text);

const anchor = 'something personal they shared.';
async function summarize(clause: boolean): Promise<string[]> {
  const p = buildMemoryPrompt({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes: [], turns: first });
  if (!p.system.includes(anchor)) throw new Error('memory.md notes rule changed: anchor not found');
  const system = clause ? p.system.replace(anchor, `something personal they shared, what ${character.name} told them about (a story, a fact, a thing to see), as "Already told them about …".`) : p.system;
  const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 8000, system, messages: [{ role: 'user', content: p.user }], output_config: { format: { type: 'json_schema', schema: memoryOutputJsonSchema } } } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { notes: string[] }).notes.map((n) => n.trim()).filter(Boolean).slice(0, 10);
}

const now = new Date();
const opener: Turn = { who: 'npc', transcript: 'Hola, Sam. Bienvenido otra vez. Hoy hace sol en la plaza. ¿Cómo está hoy?', translation: 'Hi, Sam. Welcome back. It is sunny in the plaza today. How are you today?' };
const said = 'Bien, gracias. Estudio mucho español esta semana.';
const reply = (notes: string[], m: 'M1' | 'M2') => runBeginnerTurn({
  character, transcript: m === 'M1' ? [] : [opener], learnerSaid: m === 'M1' ? undefined : said,
  memory: { visits: 1, lastVisit: new Date(now.getTime() - 3 * 86_400_000), notes }, now,
  stageText: stageText(STAGES.S2, character.role), maxAnswers: STAGES.S2.answers, withDone: true,
});

const VERSIONS = ['A1', 'A2', 'B', 'C'] as const;
const runs = await pool(VERSIONS.flatMap((v) => Array.from({ length: RUNS }, () => async () => {
  const base = await summarize(v === 'B');
  const notes = v === 'C' ? [...base, `Last time you said: ${hisLines.map((l) => `“${l}”`).join(' ')}`] : base;
  const [m1, m2] = await Promise.all([reply(notes, 'M1'), reply(notes, 'M2')]);
  return { v, notes, told: base.some((n) => /told/i.test(n) && REPEAT.test(n)), name: base.some((n) => /sam/i.test(n)), replies: [m1.line, m2.line] };
})), 6);

for (const v of VERSIONS) {
  const x = runs.filter((r) => r.v === v);
  const lines = x.flatMap((r) => r.replies);
  console.log(`T6 ${v}: told line ${x.filter((r) => r.told).length}/${x.length} · repeat ${lines.filter((l) => REPEAT.test(l)).length}/${lines.length} · name kept ${x.filter((r) => r.name).length}/${x.length} · notes ${Math.round(x.reduce((n, r) => n + r.notes.length, 0) / x.length)} · words ${Math.round(lines.reduce((n, l) => n + l.split(/\s+/).length, 0) / lines.length)}`);
}
const file = join(OUT, `memory-variants-T6-${Date.now()}.md`);
writeFileSync(file, runs.map((r) => `## ${r.v}${r.told ? ' (told line)' : ''}\nNotes:\n${r.notes.map((n) => `- ${n}`).join('\n')}\nM1${REPEAT.test(r.replies[0]) ? ' REPEAT' : ''}: ${r.replies[0]}\nM2${REPEAT.test(r.replies[1]) ? ' REPEAT' : ''}: ${r.replies[1]}\n`).join('\n'));
console.log(file);
