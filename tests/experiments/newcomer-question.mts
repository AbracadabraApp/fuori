// How often does a character still ask the learner where they're from, whether they're new, or how
// long they're here? (Josh, 2026-11-09: "this makes the app look broken"; fixed in 0b7cbfa.) A count,
// not a test of a change: plays Intermediate visits (up to --turns character lines, a learner reply written for each) for
// characters spread over every city, and reads Beginner 2 visits saved by automated-replies.mts.
// A judge reads every character line; no phrase list, so it works in any language.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/newcomer-question.mts [--characters=48] [--turns=10] [--label=name] [b2-file.json ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { ask, pool, OUT } from './common.mjs';

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const howMany = Number(arg('characters', '48'));
const turns = Number(arg('turns', '10'));
const label = arg('label', 'newcomer');
const b2Files = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const JUDGE = `You read one line a character in a ${language.name}-learning game said to the learner.
Does it ask the learner where they're from, whether they're new here or visiting, whether they live here, or how long they've been here or are staying?
Questions about their order, their tastes, their day or what they think of something don't count. A character saying where they themselves are from doesn't count.
Reply as JSON: asks (true or false) and quote (the question, or "").`;
const SCHEMA = { type: 'object', properties: { asks: { type: 'boolean' }, quote: { type: 'string' } }, required: ['asks', 'quote'], additionalProperties: false };
const judge = async (line: string) => JSON.parse(await ask(`${JUDGE}\n\nLine: ${line}`, { max: 300, schema: SCHEMA })) as { asks: boolean; quote: string };

type Seen = { who: string; kind: string; line: string; asks: boolean; quote: string };
const seen: Seen[] = [];

// Intermediate: whole visits, a learner line written for each turn
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c.id, place: p.id })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);
await pool(chosen.map(({ city, place }) => async () => {
  const ch = characterForVisit(city, place);
  if (!ch) return;
  const transcript: { who: string; transcript: string; translation?: string }[] = [];
  let said: string | undefined;
  for (let turn = 0; turn < turns; turn++) {
    const r = await runTurn({ character: ch, transcript, ...(said ? { learnerSaid: said } : {}), withDone: true } as never);
    seen.push({ who: `${ch.name} (${city})`, kind: 'intermediate', line: r.line, ...(await judge(r.line)) });
    if (said) transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    if (r.done) break;
    said = await ask(`You're learning ${language.name} and talking with someone. They just said: "${r.line}". Reply as a learner might: one or two short, simple ${language.name} sentences, sometimes a question back. Only what you say.`, { max: 150 });
  }
}), 6);

// Beginner 2: every character line of the saved visits
for (const f of b2Files) {
  const rows = (JSON.parse(readFileSync(f, 'utf8')).rows as { ok: boolean; character: string; visit: number; line: string }[]).filter((r) => r.ok && r.line);
  await pool(rows.map((r) => async () => { seen.push({ who: `${r.character} visit ${r.visit} (${f.split('/').pop()})`, kind: 'beginner-2', line: r.line, ...(await judge(r.line)) }); }), 8);
}

const file = join(OUT, `newcomer-${label}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
writeFileSync(file, JSON.stringify(seen, null, 1));
for (const kind of ['intermediate', 'beginner-2']) {
  const mine = seen.filter((s) => s.kind === kind);
  if (!mine.length) continue;
  const conv = new Map<string, boolean>();
  for (const s of mine) conv.set(s.who, (conv.get(s.who) ?? false) || s.asks);
  const asking = [...conv.values()].filter(Boolean).length;
  console.log(`${label} ${kind}: ${asking} of ${conv.size} conversations ask (${mine.filter((s) => s.asks).length} of ${mine.length} lines)`);
  for (const s of mine.filter((x) => x.asks)) console.log(`  ${s.who}: ${s.quote}`);
}
console.log(file);
