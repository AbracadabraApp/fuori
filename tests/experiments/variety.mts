// Is every shop the same conversation? (Josh, 2026-11-06: "The game is
// basically broken for all the places that have commerce as their focus";
// "It's just not interesting to go to a pharmacy in every town and have the
// same conversation with every pharmacist"; "the whole thing falls down into
// a transaction. How much you pay, credit card or cash? Thank you, bye";
// "the cappuccino line is also a warning about how these planted lines echo".
// Plan: docs/conversation-variety.md.) The baseline and the measure for each
// step. Shops of the same kind in different cities, three visits each on
// different days by the same learner, memory carried between visits the way
// the game does (lib/remember.ts), as a Beginner (stage 2) and as
// Intermediate, through the server's own turn code. Judges:
//   per visit: share of the character's lines that are the purchase; national
//     clichés told (cappuccino hours, pay first…); whether something true and
//     particular to this town was said; which ideas of the `here` line came up (echo)
//   per character: ideas told again on a later visit as if new
//   per kind: first visits at two cities side by side, could one have happened at the other?
// Nothing is written to content.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/variety.mts [label]
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/variety.mts [label]
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { readPromptFile } from '@/lib/prompts/template';
import { join } from 'node:path';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { learners } from '../conversations/learners';
import { ask, OUT, pool } from './common.mjs';

const label = process.argv[2] ?? 'baseline';
// What this run measured: the prompt versions and the commit (content has no version of its own)
const versions = ['beginner.md', 'dialogue.md', 'character.md'].map((f) => `${f} ${readPromptFile(f).version}`).join(', ');
const commit = execSync('git rev-parse --short HEAD').toString().trim() + (execSync('git status --porcelain content lib').toString().trim() ? ' + uncommitted changes in content/ or lib/' : '');
const TURNS = 5;
const VISITS = 3;

// Shown places, by kind, in different cities
const PLACES: Record<string, [string, string, string][]> = {
  it: [
    ['bar', 'firenze', 'ditta-artigianale-nuova'], ['bar', 'milano', 'bar-rita'], ['bar', 'napoli', 'bar-nilo'],
    ['pharmacy', 'firenze', ''], ['pharmacy', 'verona', ''],
    ['market', 'siena', ''], ['market', 'palermo', ''],
    ['osteria', 'roma-nuova', 'trattoria-garbatella'],
  ],
  'es-mx': [
    ['café', 'ciudad-de-mexico', ''], ['café', 'oaxaca', ''], ['café', 'puebla', ''],
    ['market stall', 'guadalajara', ''], ['market stall', 'san-miguel-de-allende', ''],
    ['fonda', 'oaxaca', ''], ['fonda', 'puebla', ''],
  ],
};
const picks = PLACES[pack.id].map(([kind, cityId, placeId]) => {
  const city = cities.find((c) => c.id === cityId)!;
  const place = placeId ? city.places.find((p) => p.id === placeId)! : city.places.find((p) => !p.hidden && p.kind.toLowerCase() === kind)!;
  if (!place) throw new Error(`no shown ${kind} in ${cityId}`);
  return { kind, city, place, character: characterForPlace(city, place)! };
});

const LEVELS = [
  { level: 'Beginner', learner: learners.find((l) => l.id === 'english-beginner')! },
  { level: 'Intermediate', learner: learners.find((l) => l.id === 'improving')! },
];

const show = (t: Turn[], name: string) => t.map((x) => `${x.who === 'npc' ? name : 'Learner'}: ${x.transcript}`).join('\n');

async function visits(p: typeof picks[number], lv: typeof LEVELS[number]) {
  const character: CharacterSheet = p.character;
  const beginner = lv.level === 'Beginner';
  const ms: number[] = [];
  const turn = async (transcript: Turn[], learnerSaid: string | undefined, memory: Parameters<typeof runTurn>[0]['memory']) => {
    const t0 = Date.now();
    const r = await (beginner
      ? runBeginnerTurn({ character, transcript, learnerSaid, memory, stageText: stageText(STAGES.S2, character.role), maxAnswers: STAGES.S2.answers, withDone: true })
      : runTurn({ character, transcript, learnerSaid, memory, withDone: true }));
    ms.push(Date.now() - t0);
    return r;
  };
  let notes: string[] = [];
  const all: Turn[][] = [];
  for (let v = 0; v < VISITS; v++) {
    const memory = v ? { visits: v, lastVisit: new Date(Date.now() - 86_400_000 * (VISITS - v)), notes } : undefined;
    const transcript: Turn[] = [];
    const open = await turn([], undefined, memory);
    transcript.push({ who: 'npc', transcript: open.line, translation: open.en });
    for (let i = 0; i < TURNS && !open.done; i++) {
      const said = await ask(`Conversation so far:\n${show(transcript, character.name)}\n\nWhat do you say next?`, {
        system: `You are role-playing a ${pack.id === 'it' ? 'Italian' : 'Spanish'} learner in a test. ${lv.learner.description} You've come to live in ${p.city.name} for a while.
You are at ${p.place.name} (${p.place.kind}) with ${character.name}. ${v ? `You've met before (this is visit ${v + 1}).` : 'You have never met.'} Go along with what they start, the way a real customer would: buy something if they offer, chat if they chat.
Be honest about comprehension. Write ONLY what you say next, as speech-to-text would capture it. One or two short sentences. When the talk has ended, say goodbye.`,
        max: 2000,
      });
      transcript.push({ who: 'learner', transcript: said });
      const r = await turn(transcript.slice(0, -1), said, memory);
      transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
      if (r.done) break;
    }
    all.push(transcript);
    const m = await summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes, turns: transcript.map((t) => ({ who: t.who, text: t.transcript })) });
    notes = m.notes;
  }
  return { ...p, level: lv.level, name: character.name, here: character.appearance?.setting ?? '', visits: all, ms };
}

const VISIT_JUDGE = `You read one visit in a language-learning game: a learner talking to a person at a shop or bar. Judge the CHARACTER's lines (numbered):
- purchase: the numbers of the lines that are mainly the purchase (what they'd like, choosing, how it's served, how much, paying, card or cash, the receipt, thanks for buying);
- cliches: national customs the character tells that a newcomer hears at nearly every place of this kind in the country (what people drink at what hour, paying first, standing versus sitting, tipping), a few words each;
- particular: true if the character says something true and particular to this town or this place (its history, its food, its people, its festivals), not something that could be said anywhere in the country;
- planted: which ideas of the character's description (given) the character brought up, a few words each.`;
const visitSchema = { type: 'object', additionalProperties: false, required: ['purchase', 'cliches', 'particular', 'planted'], properties: { purchase: { type: 'array', items: { type: 'integer' } }, cliches: { type: 'array', items: { type: 'string' } }, particular: { type: 'boolean' }, planted: { type: 'array', items: { type: 'string' } } } };

const REPEAT_JUDGE = `You read three visits, on different days, by the same learner to the same character. List the things the character brought up (a story, a fact, a topic, a joke, an offer), with the visit numbers each came up in, and count how many the character told again on a later visit as if new (picking up a thread the learner asked about doesn't count; the purchase itself doesn't count).`;
const repeatSchema = { type: 'object', additionalProperties: false, required: ['things', 'repeated'], properties: { things: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['thing', 'visits'], properties: { thing: { type: 'string' }, visits: { type: 'array', items: { type: 'integer' } } } } }, repeated: { type: 'integer' } } };

const SWAP_JUDGE = `You read two first visits at the same kind of place in two different towns. Ignore the names of people, places and towns, and the local products named. Compare the beats: what each line of the character does (greeting, asking what they'd like, a choice, how it's served, the price, card or cash, the receipt, goodbye; or talk about something, and what). swappable is true if the two visits go through the same beats in much the same order, and whatever else was talked about could have been said at either place. Then why, one sentence.`;
const swapSchema = { type: 'object', additionalProperties: false, required: ['swappable', 'why'], properties: { swappable: { type: 'boolean' }, why: { type: 'string' } } };

const runs = await pool(picks.flatMap((p) => LEVELS.map((lv) => () => visits(p, lv))), 6);

const judged = await pool(runs.map((r) => async () => {
  const perVisit = await Promise.all(r.visits.map(async (t) => {
    const npc = t.filter((x) => x.who === 'npc');
    const j = JSON.parse(await ask(`The character's description: ${r.here}\n\n${show(t, r.name)}\n\nThe character's lines, numbered:\n${npc.map((x, i) => `${i + 1}. ${x.transcript}`).join('\n')}`, { system: VISIT_JUDGE, schema: visitSchema, max: 2000 })) as { purchase: number[]; cliches: string[]; particular: boolean; planted: string[] };
    return { ...j, lines: npc.length };
  }));
  const rep = JSON.parse(await ask(r.visits.map((t, i) => `Visit ${i + 1}:\n${show(t, r.name)}`).join('\n\n'), { system: REPEAT_JUDGE, schema: repeatSchema, max: 3000 })) as { things: { thing: string; visits: number[] }[]; repeated: number };
  return { ...r, perVisit, rep };
}), 6);

const pairs = LEVELS.flatMap((lv) => {
  const rs = judged.filter((r) => r.level === lv.level);
  return rs.flatMap((a, i) => rs.slice(i + 1).filter((b) => b.kind === a.kind).map((b) => ({ a, b, level: lv.level })));
});
const swaps = await pool(pairs.map((pr) => async () => ({ ...pr, ...(JSON.parse(await ask(`Place A: ${pr.a.place.name}, ${pr.a.city.name}\n${show(pr.a.visits[0], pr.a.name)}\n\nPlace B: ${pr.b.place.name}, ${pr.b.city.name}\n${show(pr.b.visits[0], pr.b.name)}`, { system: SWAP_JUDGE, schema: swapSchema, max: 1000 })) as { swappable: boolean; why: string }) })), 6);

const pct = (a: number, b: number) => `${b ? Math.round((100 * a) / b) : 0}%`;
let md = `# Conversation variety, ${label}, ${pack.id}, ${new Date().toISOString().slice(0, 10)}\n\n${picks.length} places × ${VISITS} visits × 2 levels, up to ${TURNS} learner turns a visit, memory carried between visits. Reply time is the turn call alone, with 6 conversations at once per run (compare runs made the same way, not with the app).\n\nPrompts: ${versions}. Commit: ${commit}.\n\n`;
const q = (xs: number[], f: number) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(f * a.length))] : 0; };
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
md += `| Level | Reply time, median / 90th | Words a line | Purchase lines | Clichés (visits with one) | Something particular to the town | Planted idea, visit 1 / visit 3 | Told again on a later visit (per character) | Swappable pairs |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const lv of LEVELS) {
  const rs = judged.filter((r) => r.level === lv.level);
  const vs = rs.flatMap((r) => r.perVisit);
  const sw = swaps.filter((s) => s.level === lv.level);
  const ms = rs.flatMap((r) => r.ms);
  const npcLines = rs.flatMap((r) => r.visits.flatMap((t) => t.filter((x) => x.who === 'npc')));
  md += `| ${lv.level} | ${(q(ms, 0.5) / 1000).toFixed(1)} / ${(q(ms, 0.9) / 1000).toFixed(1)} s | ${Math.round(npcLines.reduce((n, x) => n + words(x.transcript), 0) / npcLines.length)} | ${pct(vs.reduce((n, v) => n + v.purchase.length, 0), vs.reduce((n, v) => n + v.lines, 0))} | ${vs.filter((v) => v.cliches.length).length}/${vs.length} | ${vs.filter((v) => v.particular).length}/${vs.length} | ${rs.filter((r) => r.perVisit[0]?.planted.length).length}/${rs.length} / ${rs.filter((r) => r.perVisit[2]?.planted.length).length}/${rs.length} | ${(rs.reduce((n, r) => n + r.rep.repeated, 0) / rs.length).toFixed(1)} | ${sw.filter((s) => s.swappable).length}/${sw.length} |\n`;
}
md += `\n## Per character\n\n| Level | Place | Purchase lines | Clichés | Planted ideas by visit | Told again |\n|---|---|---|---|---|---|\n`;
for (const r of judged) md += `| ${r.level} | ${r.place.name}, ${r.city.name} | ${r.perVisit.map((v) => pct(v.purchase.length, v.lines)).join(' · ')} | ${r.perVisit.flatMap((v) => v.cliches).join('; ') || '—'} | ${r.perVisit.map((v) => v.planted.join(', ') || '—').join(' · ')} | ${r.rep.repeated}: ${r.rep.things.filter((t) => t.visits.length > 1).map((t) => `${t.thing} (${t.visits.join(',')})`).join('; ')} |\n`;
md += `\n## Swappable?\n\n${swaps.map((s) => `- ${s.level} · ${s.a.place.name} / ${s.b.place.name}: ${s.swappable ? '**swappable**' : 'distinct'}. ${s.why}`).join('\n')}\n\n## Conversations\n\n`;
for (const r of judged) md += r.visits.map((t, i) => `### ${r.name} · ${r.place.name}, ${r.city.name} · ${r.level} · visit ${i + 1}\n\n\`\`\`\n${show(t, r.name)}\n\`\`\``).join('\n\n') + '\n\n';
const file = join(OUT, `variety-${pack.id}-${label}-${Date.now()}.md`);
writeFileSync(file, md);
console.log(md.split('\n## Swappable?')[0]);
console.log(file);
