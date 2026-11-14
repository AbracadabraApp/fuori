// D12 (docs/dialogue-plan.md; bugs.md B13): after the learner asks for help,
// does the character keep it easier later in the visit? Replays Josh's
// return visit to Nunzio (67edfe03, 2026-11-13, Intermediate) up to his
// ginkgo/Seattle line, four turns after "io non posso capire tutto. Forse un
// più facile parole", where Nunzio brought in quercia and corteccia with no
// English. Each run makes Nunzio's next reply; a judge counts new words given
// without their English. HELP=1 passes dialogue.md's Help asked note, as the
// turn code does once a reply has been saved with hard (D12). FLAG=1 instead
// replays his help request itself (turn 19) and counts replies marked hard.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/help-lasts.mts <archive.json> [runs]
import { readFileSync } from 'node:fs';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { findCharacter } from '@/lib/remember';
import { runTurn } from '@/lib/turn';
import { helpNote } from '@/lib/dialogue/rules';
import type { Turn } from '@/lib/types';

const [file, n = '6'] = process.argv.slice(2);
const conv = (JSON.parse(readFileSync(file, 'utf8')) as { id: string; city_id: string; character_id: string; turns: { who: string; text: string; en?: string }[] }[]).find((c) => c.id.startsWith('67edfe03'))!;
const nunzio = findCharacter(conv.city_id, conv.character_id)!;
const upTo = 23; // Josh's ginkgo/Seattle line
const transcript: Turn[] = conv.turns.slice(0, upTo).map((t) => (t.who === 'learner' ? { who: 'learner', transcript: t.text } : { who: 'npc', transcript: t.text, translation: t.en ?? '' }));
const learnerSaid = conv.turns[upTo].text;

async function judge(line: string): Promise<{ newWords: number; unglossed: number; words: string }> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 400, thinking: { type: 'between_tools' },
    system: 'You judge one line of Italian dialogue said to an English-speaking learner who has just said the talk is hard for them. Reply with JSON.',
    messages: [{ role: 'user', content: `The line:\n${line}\n\nnewWords: how many words in it a learner at a low intermediate level probably doesn't know (not names, not cognates like "giardino"/"garden"). unglossed: how many of those come with no English given right after them. words: the unglossed ones, comma-separated.` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['newWords', 'unglossed', 'words'], properties: { newWords: { type: 'integer' }, unglossed: { type: 'integer' }, words: { type: 'string' } } } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return JSON.parse(replyText(r as Parameters<typeof replyText>[0]));
}

if (process.env.FLAG) {
  const ask = 19; // "Mi piace parlare con lei… ma io non posso capire tutto. Forse un più facile parole"
  const t2: Turn[] = conv.turns.slice(0, ask).map((t) => (t.who === 'learner' ? { who: 'learner', transcript: t.text } : { who: 'npc', transcript: t.text, translation: t.en ?? '' }));
  const later = conv.turns.slice(0, 17).map((t) => (t.who === 'learner' ? { who: 'learner' as const, transcript: t.text } : { who: 'npc' as const, transcript: t.text, translation: t.en ?? '' }));
  const [onAsk, onPlain] = await Promise.all([
    Promise.all(Array.from({ length: Number(n) }, () => runTurn({ character: nunzio, transcript: t2, learnerSaid: conv.turns[ask].text, withDone: true }))),
    Promise.all(Array.from({ length: Number(n) }, () => runTurn({ character: nunzio, transcript: later, learnerSaid: conv.turns[17].text, withDone: true }))),
  ]);
  console.log(`hard on his help request: ${onAsk.filter((r) => r.hard).length}/${onAsk.length} · hard on an ordinary line (turn 17): ${onPlain.filter((r) => r.hard).length}/${onPlain.length}`);
  process.exit(0);
}
const runs = await Promise.all(Array.from({ length: Number(n) }, async () => {
  const r = await runTurn({ character: nunzio, transcript, learnerSaid, withDone: true, ...(process.env.HELP ? { help: helpNote() } : {}) });
  return { line: r.line, ...(await judge(r.line)) };
}));
const words = runs.map((r) => r.line.split(/\s+/).length);
console.log(`replies ${runs.length} · median words ${words.sort((a, b) => a - b)[Math.floor(words.length / 2)]} · new words ${runs.reduce((a, r) => a + r.newWords, 0)} · unglossed ${runs.reduce((a, r) => a + r.unglossed, 0)} · replies with any unglossed ${runs.filter((r) => r.unglossed > 0).length}/${runs.length}`);
for (const r of runs) console.log(`- [${r.unglossed}/${r.newWords}${r.words ? `: ${r.words}` : ''}] ${r.line}`);
