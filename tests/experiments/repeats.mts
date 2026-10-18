// Round 15b: does a longer history window stop characters repeating themselves?
// Replays the long real scripts (8+ learner lines); a judge counts character lines
// that repeat what the character already said or ask what was already answered.
// Needs the replay set (npm run test:replay -- --refresh).
//   TURN_RECENT_TURNS=<n> npx tsx --env-file=.env.local tests/experiments/repeats.mts tests/experiments/out/repeats.json [runs]
import { readFileSync, writeFileSync } from 'node:fs';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { runTurn } from '@/lib/turn';
import { RECENT_TURNS } from '@/lib/prompts/build-turn-prompt';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
const [out, runsArg] = process.argv.slice(2);
const RUNS = Number(runsArg) || 3;
const byId = new Map(cities.flatMap((c) => c.places.map((p) => characterForPlace(c, p)).filter(Boolean).map((ch: any) => [ch.id, ch])));
const scripts = JSON.parse(readFileSync('tests/conversations/replay-set.json', 'utf8')).scripts.filter((s: any) => s.lines.length >= 8 && byId.has(s.characterId));
const schema = { type: 'object', additionalProperties: false, required: ['repeats', 'lines'], properties: { repeats: { type: 'integer' }, lines: { type: 'array', items: { type: 'string' } } } };
async function judge(name: string, t: any[]) {
  const text = t.map((x) => `${x.who === 'npc' ? name : 'Person'}: ${x.transcript}`).join('\n');
  const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 4000, messages: [{ role: 'user', content: `In this conversation, count ${name}'s lines that repeat something ${name} already said earlier (introducing themselves again, the same pitch or greeting again, greeting the person as if they'd just arrived) or ask something the person already answered or ${name} already asked. A question asked again because the person didn't answer it doesn't count.\n\n${text}\n\nReply with JSON: repeats (the count), lines (each repeated line, verbatim).` }], output_config: { format: { type: 'json_schema', schema } } } as any);
  return JSON.parse(replyText(r)) as { repeats: number; lines: string[] };
}
const res: any[] = [];
await Promise.all(scripts.flatMap((s: any) => Array.from({ length: RUNS }, async (_, run) => {
  const ch: any = byId.get(s.characterId);
  const t: any[] = [];
  try {
    const o = await runTurn({ character: ch, transcript: [] });
    t.push({ who: 'npc', transcript: o.line, translation: o.en });
    for (const said of s.lines.slice(0, 14)) {
      const r = await runTurn({ character: ch, transcript: t, learnerSaid: said });
      t.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: r.line, translation: r.en });
    }
    res.push({ character: ch.name, run, learnerLines: s.lines.length, ...(await judge(ch.name, t)), transcript: t });
  } catch (e) { res.push({ character: ch.name, run, error: String(e) }); }
})));
writeFileSync(out, JSON.stringify(res, null, 1));
const ok = res.filter((r) => !r.error);
const npc = ok.reduce((a, r) => a + r.transcript.filter((x: any) => x.who === 'npc').length, 0);
const rep = ok.reduce((a, r) => a + r.repeats, 0);
console.log(`window ${RECENT_TURNS} · ${scripts.length} scripts × ${RUNS} · ${ok.length} ok · repeats ${rep} of ${npc} character lines (${(100 * rep / npc).toFixed(1)}%) · ${(rep / ok.length).toFixed(2)} per conversation · conversations with any ${ok.filter((r) => r.repeats).length} · failed ${res.length - ok.length}`);
