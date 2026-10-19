// Diario cards from real conversations (round 17, docs/diario.md): are the
// phrases worth reviewing? Two arms on the same conversations:
//   today: the review phrases the memory step already stored (review.items,
//          mistakes, missed), judged on whether each could be a card at all
//   cards: a card maker (draft prompt below) writes up to 6 cards per
//          conversation; each card judged in 9 checks, and the level judge
//          (lib/level.ts) on its character line and replies
//   npx tsx --env-file=.env.local tests/experiments/diario-cards.mts tests/experiments/out/admin.json [max]   (COUNTRY as needed)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { cities, language, pack } from '@/content';
import { findCharacter } from '@/lib/remember';
import { beginnerKnows } from '@/lib/level';
import { BEGINNER_FOLLOWS } from '@/lib/scorecard';
import { OUT, ask, mean, pct, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; turns: { who: string; text: string }[]; review?: { items?: { phrase: string; en: string }[]; mistakes?: { said: string; better: string }[]; missed?: { phrase: string; en: string }[] } };
const [input, maxArg] = process.argv.slice(2);
const MAX = Number(maxArg ?? 30);
const here = new Set(cities.map((c) => c.id));
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[])
  .filter((r) => here.has(r.city_id) && r.turns.filter((t) => t.who === 'learner').length >= 2 && findCharacter(r.city_id, r.character_id))
  .slice(0, MAX);

const L = language.name;
const transcriptOf = (r: Row, name: string) => r.turns.map((t) => `${t.who === 'learner' ? 'Learner' : name}: ${t.text}`).join('\n');

// ---------- Arm "today": could each stored phrase be a card? ----------
const phraseSchema = { type: 'object', additionalProperties: false, required: ['sayable', 'frame', 'note'], properties: { sayable: { type: 'boolean' }, frame: { type: 'boolean' }, note: { type: 'string' } } };
const phrasePrompt = (p: string, en: string) => `A ${L} learning game makes review cards on which a beginner practises saying a reply. Could this phrase be one?\n\n"${p}" (${en})\n\n- sayable: it's something the learner would say themselves to a person (not only something said to them)\n- frame: it's a whole sentence, or starts one, built on a reusable sentence start a newcomer needs again and again (like "I'd like…", "Do you have…?", "Where is…?"), not a lone word or a one-off\n- note: one short line\nReply with JSON.`;

// ---------- Arm "cards": the card maker (draft prompt) ----------
const cardSchema = {
  type: 'object', additionalProperties: false, required: ['cards'],
  properties: { cards: { type: 'array', items: {
    type: 'object', additionalProperties: false,
    required: ['frame', 'frameEn', 'source', 'why', 'characterLine', 'characterLineEn', 'replies'],
    properties: {
      frame: { type: 'string' }, frameEn: { type: 'string' },
      source: { type: 'string', enum: ['mistake', 'english', 'recast', 'missed'] }, why: { type: 'string' },
      characterLine: { type: 'string' }, characterLineEn: { type: 'string' },
      replies: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['line', 'en', 'answer', 'answerEn'], properties: { line: { type: 'string' }, en: { type: 'string' }, answer: { type: 'string' }, answerEn: { type: 'string' } } } },
    },
  } } },
};
const cardSystem = (name: string, role: string, city: string) => `You make review cards for someone just starting ${L}, from a conversation they just had in a game with ${name}, ${role} in ${city}.
A card practises one frame: the start of a sentence a newcomer says again and again (like "I'd like…", "Do you have…?", "My name is…", "Where is…?"), always inside a whole reply, never a lone word.
Pick up to 6 frames this person needed in this conversation: one they used with a mistake, one they reached for and said in English instead, one ${name} offered or recast for them, or one that would have answered something they couldn't. Skip frames they already said correctly and easily. Fewer cards is fine when the conversation had little to learn from.
For each card:
- frame, and its English
- source (mistake, english, recast or missed) and why, in one short English line
- characterLine: a short, plain line ${name} would say in a scene like this one that the frame answers. It must not contain the frame itself. With its English.
- replies: two whole sentences on the frame, genuinely different choices, in plain words a beginner knows, each with its English, and ${name}'s short answer to it, with its English.
Everything in ${L} is natural, correct and plain enough for a beginner to follow.`;

const CHECKS = ['usefulFrame', 'grounded', 'lineNatural', 'lineInvites', 'repliesSensible', 'sameFrame', 'distinct', 'answersFit', 'correct'] as const;
const judgeSchema = { type: 'object', additionalProperties: false, required: [...CHECKS, 'note'], properties: { ...Object.fromEntries(CHECKS.map((k) => [k, { type: 'boolean' }])), note: { type: 'string' } } };
type Card = { frame: string; frameEn: string; source: string; why: string; characterLine: string; characterLineEn: string; replies: { line: string; en: string; answer: string; answerEn: string }[] };
const judgePrompt = (conv: string, name: string, c: Card) => `A ${L} learning game turns a learner's conversation into review cards. The conversation (Learner is someone just starting ${L}):\n\n${conv}\n\nOne card:\nFrame: ${c.frame} (${c.frameEn})\n${name}: ${c.characterLine} (${c.characterLineEn})\nReply 1: ${c.replies[0]?.line} (${c.replies[0]?.en}) → ${name}: ${c.replies[0]?.answer}\nReply 2: ${c.replies[1]?.line} (${c.replies[1]?.en}) → ${name}: ${c.replies[1]?.answer}\nWhy this card: ${c.source}, ${c.why}\n\nJudge it:\n- usefulFrame: the frame is a sentence start a newcomer needs again and again, worth practising\n- grounded: the reason is true of this conversation (they really made that mistake, used English, were recast, or missed it)\n- lineNatural: ${name}'s line is something they'd really say in a scene like this\n- lineInvites: the line calls for an answer on the frame, and doesn't contain the frame itself\n- repliesSensible: both replies are things a person would really say next\n- sameFrame: both replies are whole sentences on the frame\n- distinct: the two replies are genuinely different choices\n- answersFit: each answer follows from its reply\n- correct: all the ${L} is correct and natural, and the English faithful\n- note: the biggest problem in one sentence, or "none"\nReply with JSON.`;

const results = await pool(rows.map((r) => async () => {
  const ch = findCharacter(r.city_id, r.character_id)!;
  const city = cities.find((c) => c.id === r.city_id)!.name;
  const conv = transcriptOf(r, ch.name);

  const stored = [
    ...(r.review?.items ?? []).map((i) => ({ kind: 'item', phrase: i.phrase, en: i.en })),
    ...(r.review?.mistakes ?? []).map((m) => ({ kind: 'mistake', phrase: m.better, en: '' })),
    ...(r.review?.missed ?? []).map((m) => ({ kind: 'missed', phrase: m.phrase, en: m.en })),
  ];
  const today = await Promise.all(stored.map(async (s) => ({ ...s, ...(JSON.parse(await ask(phrasePrompt(s.phrase, s.en), { schema: phraseSchema })) as { sayable: boolean; frame: boolean; note: string }) })));

  const made = JSON.parse(await ask(`The conversation:\n\n${conv}\n\nReply with JSON: cards.`, { system: cardSystem(ch.name, ch.role, city), schema: cardSchema, max: 8000 })) as { cards: Card[] };
  const cards = await Promise.all(made.cards.slice(0, 6).filter((c) => c.replies.length === 2).map(async (c) => {
    const [j, ...known] = await Promise.all([
      ask(judgePrompt(conv, ch.name, c), { schema: judgeSchema }).then((x) => JSON.parse(x) as Record<(typeof CHECKS)[number], boolean> & { note: string }),
      beginnerKnows(c.characterLine), beginnerKnows(c.replies[0].line), beginnerKnows(c.replies[1].line),
    ]);
    return { ...c, j, lineFollows: known[0] >= BEGINNER_FOLLOWS, repliesFollow: known[1] >= BEGINNER_FOLLOWS && known[2] >= BEGINNER_FOLLOWS };
  }));
  return { id: r.id, name: ch.name, city, conv, today, cards };
}), 4);

const today = results.flatMap((r) => r.today);
const cards = results.flatMap((r) => r.cards);
const share = <T,>(xs: T[], f: (x: T) => boolean) => pct(xs.filter(f).length / Math.max(1, xs.length));
const allOk = (c: (typeof cards)[number]) => CHECKS.every((k) => c.j[k]) && c.lineFollows && c.repliesFollow;
const lines = [
  `# Diario cards, ${pack.id} (round 17)`, '',
  `${results.length} real conversations.`, '',
  `**Today's stored phrases:** ${today.length} (${mean(results.map((r) => r.today.length)).toFixed(1)} per conversation) · sayable by the learner ${share(today, (t) => t.sayable)} · on a reusable frame ${share(today, (t) => t.frame)} · both ${share(today, (t) => t.sayable && t.frame)}`,
  `By kind: ${['item', 'mistake', 'missed'].map((k) => { const xs = today.filter((t) => t.kind === k); return `${k} ${xs.length}, both ${share(xs, (t) => t.sayable && t.frame)}`; }).join(' · ')}`, '',
  `**Card maker:** ${cards.length} cards (${mean(results.map((r) => r.cards.length)).toFixed(1)} per conversation) · every check ${share(cards, allOk)}`,
  CHECKS.map((k) => `${k} ${share(cards, (c) => c.j[k])}`).join(' · ') + ` · beginner follows the line ${share(cards, (c) => c.lineFollows)} · and the replies ${share(cards, (c) => c.repliesFollow)}`,
  `Sources: ${['mistake', 'english', 'recast', 'missed'].map((s) => `${s} ${cards.filter((c) => c.source === s).length}`).join(' · ')}`, '',
];
const summary = lines.join('\n');
console.log(summary);
writeFileSync(join(OUT, `diario-cards-${pack.id}.json`), JSON.stringify(results, null, 1));
writeFileSync(join(OUT, `diario-cards-${pack.id}.md`), [summary, ...results.flatMap((r) => [
  `## ${r.name} (${r.city})`, '', '```', r.conv, '```', '',
  `Today's phrases: ${r.today.map((t) => `${t.phrase}${t.sayable && t.frame ? ' ✓' : ''}`).join(' · ') || '(none)'}`, '',
  ...r.cards.flatMap((c) => [
    `**${c.frame}** (${c.frameEn}) · ${c.source}: ${c.why}${allOk(c) ? ' ✓' : ''}`,
    `> ${r.name}: ${c.characterLine} _(${c.characterLineEn})_`,
    ...c.replies.map((x) => `> → ${x.line} _(${x.en})_ · ${r.name}: ${x.answer}`),
    `Judge: ${CHECKS.filter((k) => !c.j[k]).join(', ') || 'all pass'}${c.lineFollows ? '' : ' · line too hard'}${c.repliesFollow ? '' : ' · replies too hard'} · ${c.j.note}`, '',
  ]),
])].join('\n'));
console.log(`→ tests/experiments/out/diario-cards-${pack.id}.md`);
