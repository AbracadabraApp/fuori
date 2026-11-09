// Prompt caching on the Beginner turn call (Josh, 2026-11-08: ship only if the
// median first token drops 150 ms or more). Same prompt, same conversations,
// cache off against on, interleaved turn by turn so network drift hits both.
// On = a breakpoint on the system prompt and one on the last earlier message.
//   npx tsx --env-file=.env.local tests/experiments/cache-timing.mts [conversations=4] [turns=5]
import { anthropic, TURN_MODEL } from '@/lib/claude';
import { buildBeginnerPrompt, partsJsonSchema } from '@/lib/beginner';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const nConv = Number(process.argv[2]) || 4, nTurns = Number(process.argv[3]) || 5;
const lines = ['Buongiorno, mi chiamo Josh.', 'Sì, vorrei un caffè, per favore.', 'Grazie, è molto buono.', 'Abito qui da una settimana.', 'Mi piace molto questo posto.', 'Arrivederci, a domani!'];
const run = Math.random().toString(36).slice(2, 8);
const places = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ c, p }))).slice(0, nConv);

type Row = { arm: 'off' | 'on'; first: number; total: number; input: number; read: number; write: number };
const rows: Row[] = [];

async function call(arm: 'off' | 'on', system: string, messages: { role: 'user' | 'assistant'; content: string }[]) {
  const msgs = messages.map((m, i) => (arm === 'on' && i === messages.length - 2 ? { role: m.role, content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }] } : m));
  const sys = arm === 'on' ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] : system;
  const t0 = performance.now();
  let first = 0;
  const stream = anthropic.messages.stream({ model: TURN_MODEL, max_tokens: 1500, temperature: 1, thinking: { type: 'between_tools' }, system: sys, messages: msgs, output_config: { format: { type: 'json_schema', schema: partsJsonSchema } } } as never);
  stream.once('text', () => { first = performance.now() - t0; });
  const r = await stream.finalMessage();
  const u = r.usage as { input_tokens: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null };
  rows.push({ arm, first, total: performance.now() - t0, input: u.input_tokens, read: u.cache_read_input_tokens ?? 0, write: u.cache_creation_input_tokens ?? 0 });
  const text = (r.content.find((b) => b.type === 'text') as { text: string }).text;
  return (JSON.parse(text).parts as { text: string }[]).map((x) => x.text).join(' ');
}

for (const { c, p } of places) {
  const character = characterForPlace(c, p)!;
  // One conversation per arm, turn by turn alternating
  const hist = { off: [] as { who: 'npc' | 'learner'; transcript: string }[], on: [] as { who: 'npc' | 'learner'; transcript: string }[] };
  for (let i = 0; i < nTurns; i++) {
    for (const arm of (i % 2 ? ['on', 'off'] : ['off', 'on']) as ('off' | 'on')[]) {
      const learnerSaid = i === 0 ? undefined : lines[i - 1];
      const b = buildBeginnerPrompt({ character, transcript: hist[arm] as never, learnerSaid });
      const system = `${b.system}\n\n(run ${run} ${c.id}/${p.id})`;
      const reply = await call(arm, system, b.messages);
      if (learnerSaid) hist[arm].push({ who: 'learner', transcript: learnerSaid });
      hist[arm].push({ who: 'npc', transcript: reply });
    }
  }
}

const med = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const p90 = (a: number[]) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * 0.9))];
for (const arm of ['off', 'on'] as const) {
  const r = rows.filter((x) => x.arm === arm);
  console.log(`${arm}: n=${r.length} first token median ${Math.round(med(r.map((x) => x.first)))} ms, p90 ${Math.round(p90(r.map((x) => x.first)))}; total median ${Math.round(med(r.map((x) => x.total)))} ms, p90 ${Math.round(p90(r.map((x) => x.total)))}; input ${med(r.map((x) => x.input))} uncached tokens median; cache_read ${r.reduce((n, x) => n + x.read, 0)}, cache_write ${r.reduce((n, x) => n + x.write, 0)}`);
}
console.log(JSON.stringify(rows.map((r) => ({ ...r, first: Math.round(r.first), total: Math.round(r.total) }))));
