// Round 16: how many output tokens does a character reply really use? The same
// call as lib/turn.ts (model, temperature, schema, prompt) but max_tokens 1500, so
// replies that would hit today's 800 cap finish and get counted.
//   npx tsx --env-file=.env.local tests/experiments/reply-tokens.mts tests/experiments/out/reply-tokens.json [runs]   (COUNTRY as needed)
// Matches lib/turn.ts: no thinking before the reply since prompt 2026-10-18b (TURN_THINKING=on brings
// it back, as round 16 ran it).
// Italy: the real replay scripts. Mexico (no replay set): simulated learners.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities, language, pack } from '@/content';
const [out, runsArg] = process.argv.slice(2);
const RUNS = Number(runsArg) || 2, CAP = 1500;
const chars = cities.flatMap((c) => c.places.map((p) => characterForPlace(c, p)).filter(Boolean)) as any[];
const byId = new Map(chars.map((c) => [c.id, c]));
const turns: any[] = [];
async function turn(character: any, transcript: any[], learnerSaid?: string) {
  const prompt = buildTurnPrompt({ character, transcript, learnerSaid });
  const t0 = performance.now();
  const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: CAP, temperature: 1.0, ...(process.env.TURN_THINKING === 'on' ? {} : { thinking: { type: 'between_tools' } }), system: prompt.system, messages: prompt.messages, output_config: { format: { type: 'json_schema', schema: turnOutputJsonSchema } } } as any);
  const ms = Math.round(performance.now() - t0);
  const thought = r.content.some((b: any) => b.type === 'thinking' || b.type === 'redacted_thinking');
  const rec = { character: character.name, n: transcript.length, out: r.usage.output_tokens, stop: r.stop_reason, thought, ms, line: '' };
  turns.push(rec);
  if (r.stop_reason === 'max_tokens') throw new Error('hit 1500');
  rec.line = JSON.parse(replyText(r)).line;
  return rec.line;
}
const learner = async (who: string, convo: string) => {
  const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: 2000, system: `You are role-playing ${who} learning ${language.name} in a test. Write ONLY what they say next, as speech-to-text would capture it. One or two short sentences.`, messages: [{ role: 'user', content: convo }] } as any);
  return replyText(r).trim();
};
const jobs: (() => Promise<void>)[] = [];
const setFile = 'tests/conversations/replay-set.json';
if (pack.id === 'it' && existsSync(setFile)) {
  for (const s of JSON.parse(readFileSync(setFile, 'utf8')).scripts.filter((s: any) => byId.has(s.characterId))) for (let r = 0; r < RUNS; r++) jobs.push(async () => {
    const ch = byId.get(s.characterId); const t: any[] = [];
    t.push({ who: 'npc', transcript: await turn(ch, []) });
    for (const said of s.lines.slice(0, 14)) { const l = await turn(ch, t, said); t.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: l }); }
  });
} else {
  const who = ['a beginner (A1), short sentences with mistakes', 'an intermediate learner (B1), chatty, asks the character about themselves', 'an advanced speaker (C1), fluent, curious, tells stories'];
  for (let i = 0; i < 12 * RUNS; i++) jobs.push(async () => {
    const ch = chars[Math.floor(Math.random() * chars.length)]; const t: any[] = []; const lines: string[] = [];
    const o = await turn(ch, []); t.push({ who: 'npc', transcript: o }); lines.push(`${ch.name}: ${o}`);
    for (let k = 0; k < 8; k++) {
      const said = await learner(who[i % 3], `You're talking to ${ch.name} (${ch.role}).\n${lines.join('\n')}\n\nWhat do you say next?`);
      const l = await turn(ch, t, said); t.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: l }); lines.push(`Learner: ${said}`, `${ch.name}: ${l}`);
    }
  });
}
const errors: string[] = [];
const queue = [...jobs];
await Promise.all(Array.from({ length: 6 }, async () => { for (let j = queue.shift(); j; j = queue.shift()) await j().catch((e) => errors.push(String(e).slice(0, 100))); }));
writeFileSync(out, JSON.stringify({ turns, errors }, null, 1));
const o = turns.map((t) => t.out).sort((a, b) => a - b);
const q = (p: number) => o[Math.min(o.length - 1, Math.floor(p * o.length))];
const over = (n: number) => turns.filter((t) => t.out > n).length;
console.log(`${pack.id} · ${turns.length} turns · output tokens median ${q(0.5)} · p95 ${q(0.95)} · p99 ${q(0.99)} · max ${o[o.length - 1]} · over 800 (fails today): ${over(800)} (${(100 * over(800) / turns.length).toFixed(1)}%) · over 1200: ${over(1200)} · hit 1500: ${turns.filter((t) => t.stop === 'max_tokens').length} · thought ${turns.filter((t) => t.thought).length} · other errors ${errors.filter((e) => !e.includes('1500')).length}`);
for (const t of turns.filter((t) => t.out > 800)) console.log(`  ${t.out} tokens · ${t.ms} ms · ${t.character}: ${t.line.slice(0, 90)}`);
