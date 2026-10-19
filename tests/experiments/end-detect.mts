// How should the game notice a conversation is over? (round 20; Josh,
// 2026-10-19: test it now, don't build). Two ways, on the same real
// conversations, scored against round 19's judge (conversation-ends.mts,
// run it first: this reads out/conversation-ends-<country>.json):
//   flag:  the character's reply carries `over` (a trial schema; production
//          stays { line, en }). The reply is regenerated at each character
//          turn from the real transcript before it, and its words are
//          compared with the same reply without the flag, to see whether
//          asking for it changes the line
//   judge: a separate call after each real character line ("is it over
//          now?"), timed, since it would run while the voice plays
//   npx tsx --env-file=.env.local tests/experiments/end-detect.mts tests/experiments/out/admin.json   (COUNTRY as needed)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { findCharacter } from '@/lib/remember';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import type { CharacterSheet, Turn } from '@/lib/types';
import { OUT, mean, pct, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; turns: { who: string; text: string; en?: string }[] };
type Ref = { id: string; overAt: number | null };
const [input] = process.argv.slice(2);
const refs = new Map((JSON.parse(readFileSync(join(OUT, `conversation-ends-${pack.id}.json`), 'utf8')) as Ref[]).map((r) => [r.id, r.overAt]));
const here = new Set(cities.map((c) => c.id));
// Magda's lessons end by her own prompt; left out
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[]).filter((r) => here.has(r.city_id) && refs.has(r.id) && r.character_id !== 'magda' && findCharacter(r.city_id, r.character_id));

const OVER = 'true when the conversation is now over: you have both said goodbye, or the errand is done and closed and nothing is left to say. false otherwise';
const flagSchema = { ...turnOutputJsonSchema, properties: { ...turnOutputJsonSchema.properties, over: { type: 'boolean', description: OVER } }, required: ['line', 'en', 'over'] };

async function call(body: object): Promise<{ text: string; ms: number }> {
  for (let attempt = 0; ; attempt++) {
    try {
      const t = performance.now();
      const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: 1200, temperature: 1.0, thinking: { type: 'between_tools' }, ...body } as Parameters<typeof anthropic.messages.create>[0]);
      return { text: replyText(r as Parameters<typeof replyText>[0]), ms: performance.now() - t };
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
}
const turnsOf = (r: Row, upTo: number): Turn[] => r.turns.slice(0, upTo).map((t) => ({ who: t.who === 'learner' ? 'learner' : 'npc', transcript: t.text, translation: t.en }));
const reply = async (c: CharacterSheet, r: Row, i: number, schema: object) => {
  // Character turn i (0-based) answers the learner line at i-1
  const p = buildTurnPrompt({ character: c, transcript: turnsOf(r, i - 1), learnerSaid: r.turns[i - 1].text });
  return JSON.parse((await call({ system: p.system, messages: p.messages, output_config: { format: { type: 'json_schema', schema } } })).text) as { line: string; over?: boolean };
};
const judgeSchema = { type: 'object', additionalProperties: false, required: ['over'], properties: { over: { type: 'boolean' } } };
const judge = async (c: CharacterSheet, r: Row, i: number) => {
  const t = r.turns.slice(0, i + 1).map((x) => `${x.who === 'learner' ? 'Learner' : c.name}: ${x.text}`).join('\n');
  const { text, ms } = await call({ max_tokens: 200, messages: [{ role: 'user', content: `A ${language.name} conversation with ${c.name} (${c.role}):\n\n${t}\n\nIs the conversation now over (${OVER.replace('you have', 'they have')})? Reply with JSON: over.` }], output_config: { format: { type: 'json_schema', schema: judgeSchema } } });
  return { over: (JSON.parse(text) as { over: boolean }).over, ms };
};

type Point = { id: string; name: string; i: number; truth: boolean; flag: boolean; judge: boolean; judgeMs: number; wordsFlag: number; wordsPlain: number; line: string };
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const jobs = rows.flatMap((r) => {
  const c = findCharacter(r.city_id, r.character_id)!;
  const overAt = refs.get(r.id) ?? null;
  return r.turns.map((t, i) => ({ t, i })).filter(({ t, i }) => t.who !== 'learner' && i > 0 && r.turns[i - 1].who === 'learner').map(({ i }) => async (): Promise<Point> => {
    const [f, plain, j] = await Promise.all([reply(c, r, i, flagSchema), reply(c, r, i, turnOutputJsonSchema), judge(c, r, i)]);
    return { id: r.id, name: c.name, i: i + 1, truth: overAt != null && i + 1 >= overAt, flag: !!f.over, judge: j.over, judgeMs: j.ms, wordsFlag: words(f.line), wordsPlain: words(plain.line), line: f.line };
  });
});
const points = await pool(jobs, 6);

const score = (pick: (p: Point) => boolean) => {
  const early = points.filter((p) => !p.truth && pick(p)).length / Math.max(1, points.filter((p) => !p.truth).length);
  const ended = rows.filter((r) => refs.get(r.id) != null && points.some((p) => p.id === r.id && p.truth));
  const caught = ended.filter((r) => points.some((p) => p.id === r.id && p.truth && pick(p))).length / Math.max(1, ended.length);
  return { early, caught, ended: ended.length };
};
const f = score((p) => p.flag), j = score((p) => p.judge);
const ms = points.map((p) => p.judgeMs).sort((a, b) => a - b);
const lines = [
  `# End detection, ${pack.id} (round 20)`, '',
  `${rows.length} real conversations, ${points.length} character turns. Truth: round 19's judge (over from its overAt on). Bar: ends early on 2% of turns or fewer; catches 90% of ended conversations.`, '',
  '| Way | Ends early (turns that weren\'t over) | Catches the end (conversations) | Extra cost | Words per line |', '|---|---|---|---|---|',
  `| Flag on the reply | ${pct(f.early)} | ${pct(f.caught)} of ${f.ended} | none | ${mean(points.map((p) => p.wordsFlag)).toFixed(1)} (without the flag ${mean(points.map((p) => p.wordsPlain)).toFixed(1)}) |`,
  `| Separate judge | ${pct(j.early)} | ${pct(j.caught)} of ${j.ended} | one call per turn, median ${(ms[Math.floor(ms.length / 2)] / 1000).toFixed(1)} s | unchanged |`, '',
];
console.log(lines.join('\n'));
const miss = points.filter((p) => p.truth !== p.flag || p.truth !== p.judge);
writeFileSync(join(OUT, `end-detect-${pack.id}.md`), [...lines, '## Disagreements with round 19', '', ...miss.map((p) => `- ${p.name} turn ${p.i}: truth ${p.truth}, flag ${p.flag}, judge ${p.judge}. Regenerated line: ${p.line}`)].join('\n'));
console.log(`→ tests/experiments/out/end-detect-${pack.id}.md`);
