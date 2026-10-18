// The reply buttons (lib/replies.ts, replies.md) written for every character line
// in a report, and a second model judging each pair (round 7). Also times them
// against how long the line takes to say at beginner speed.
//   npx tsx --env-file=.env.local tests/experiments/reply-buttons.mts <label>=<report.md> ...   (COUNTRY as needed)
import { readFileSync } from 'node:fs';
import { language, cities } from '@/content';
import { writeReplies, repliesPromptVersion } from '@/lib/replies';
import { characterForPlace } from '@/lib/characters/for-place';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, labelled, pct, pool, reportConversations } from './common.mjs';

const WORDS_PER_SECOND = 2.3; // a character speaking slowly to a beginner
const byName = new Map(cities.flatMap((c) => c.places.map((p) => characterForPlace(c, p)).filter((x): x is CharacterSheet => !!x)).map((c) => [c.name, c]));
const CHECKS = ['sensible', 'sameFrame', 'wholeLine', 'beginner', 'distinct', 'englishRight', 'correct', 'polite'] as const;
const schema = { type: 'object', additionalProperties: false, required: [...CHECKS, 'note'], properties: { ...Object.fromEntries(CHECKS.map((k) => [k, { type: 'boolean' }])), note: { type: 'string' } } };
const judgePrompt = (name: string, history: string, r: { frame?: string; replies: { line: string; en: string }[] }) => `In a ${language.name} conversation game, a person just starting to learn ${language.name} is talking with ${name}. The conversation so far:\n\n${history}\n\nThe game offers two replies to tap:\n1. ${r.replies[0].line} (${r.replies[0].en})\n2. ${r.replies[1].line} (${r.replies[1].en})\nFrame: ${r.frame ?? ''}\n\nJudge the pair:\n- sensible: both are things a person would really say next, answering what ${name} last said\n- sameFrame: both start from the same sentence frame (a yes and a no to the same question count)\n- wholeLine: each is a full sentence, not a lone word\n- beginner: someone a few weeks into ${language.name} could read both\n- distinct: genuinely different choices\n- englishRight: each English line is a faithful translation\n- correct: both are correct, natural ${language.name} for this register\n- polite: neither would sound rude or sour the moment\n- note: the biggest problem in one sentence, or "none"\nReply with JSON.`;

console.log(`replies.md ${repliesPromptVersion()}`);
for (const { label, path } of labelled(process.argv.slice(2))) {
  const items = reportConversations(readFileSync(path, 'utf8')).flatMap((c) => {
    const character = byName.get(c.name);
    if (!character) return [];
    return c.turns.flatMap((t, i) => (t.who === 'npc' ? [{ character, line: t.text, transcript: c.turns.slice(0, i + 1).map((x): Turn => ({ who: x.who, transcript: x.text })) }] : []));
  });
  const res = await pool(items.map((it) => async () => {
    const t0 = performance.now();
    const r = await writeReplies(it.character, it.transcript).catch(() => null);
    const ms = performance.now() - t0;
    if (!r) return null;
    const history = it.transcript.map((x) => `${x.who === 'npc' ? it.character.name : 'Person'}: ${x.transcript}`).join('\n');
    const j = JSON.parse(await ask(judgePrompt(it.character.name, history, r), { schema })) as Record<(typeof CHECKS)[number], boolean> & { note: string };
    return { ms, ready: ms <= (1000 * it.line.split(/\s+/).length) / WORDS_PER_SECOND, j };
  }));
  const ok = res.filter((r): r is NonNullable<typeof r> => !!r);
  const p = (f: (r: (typeof ok)[number]) => boolean) => pct(ok.filter(f).length / ok.length);
  const ms = ok.map((r) => r.ms).sort((a, b) => a - b);
  console.log(`${label.padEnd(14)} ${ok.length}/${items.length} pairs · all checks ${p((r) => CHECKS.every((k) => r.j[k]))} · ${CHECKS.map((k) => `${k} ${p((r) => r.j[k])}`).join(' · ')} · median ${(ms[ms.length >> 1] / 1000).toFixed(1)} s · ready before the line ends ${p((r) => r.ready)}`);
}
