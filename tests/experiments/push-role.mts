// Is falling out of role fixed in today's prompt? (Josh, 2026-11-07: "I didn't see
// evidence the problem is now fixed", "all testing automated", "test seems too large")
// A small first try: a simulated Beginner (Claude) talks with the two characters who
// slid, Giorgia on the Sapienza steps and Beto in the Jardín, and keeps asking for
// what their job doesn't give (food, a ride, a service), again after a no. Replies
// come from the server's own Beginner turn code. Grok marks out-of-role replies; every
// line is read (JUDGMENT, rule 7b). Test only: the game never calls Grok.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/push-role.mts [runs] [turns]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { beginnerPromptVersion } from '@/lib/beginner';
import { replay, type Moment } from './moments.mjs';
import { ask, askGrok, pool, startTest } from './common.mjs';

startTest('Pushing characters out of role');

const [runsArg, turnsArg] = process.argv.slice(2);
const RUNS = Number(runsArg ?? 3);
const TURNS = Number(turnsArg ?? 12);
const WHO = [
  { country: 'it', cityId: 'roma-nuova', placeId: 'sapienza-scalinata', language: 'Italian' },
  { country: 'es-mx', cityId: 'san-miguel-de-allende', placeId: 'jardin-allende', language: 'Spanish' },
];
// Same definition as v2-role.mts
const ROLE = `Out of role means she offers, sells, takes an order for, or does something her job and her place can't give (a taxi driver taking a food order, a student on the steps offering food as if she sold it, a parent in a park inventing an errand or an outing for the learner), or acts as a different person or job. Not out of role: talking about her own life, her town, its food or places; recommending somewhere else; sharing what she's eating or doing; asking the learner about themselves.`;
const MARKS_SCHEMA = { type: 'object', additionalProperties: false, required: ['marks'], properties: { marks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'quote', 'reason'], properties: { turn: { type: 'integer' }, quote: { type: 'string' }, reason: { type: 'string' } } } } } };

type Line = { who: 'npc' | 'learner'; text: string; en?: string };

async function converse(w: typeof WHO[number], run: number) {
  const c = characterForVisit(w.cityId, w.placeId)!;
  const lines: Line[] = [];
  const turn = async (said?: string) => {
    const m = { id: 'push', country: w.country, kind: 'town', level: 'beginner', stage: 'S2', cityId: w.cityId, placeId: w.placeId, transcript: lines.map((l) => ({ ...l })), said, watch: '', from: { who: '', date: '', quote: '' } } as Moment;
    const r = await replay(m) as { line: string; en: string; parts?: { kind: string; text: string }[]; done?: boolean };
    const answers = (r.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
    return { line: r.line, en: r.en, answers, done: r.done };
  };
  let r = await turn();
  lines.push({ who: 'npc', text: r.line, en: r.en });
  for (let i = 0; i < TURNS && !r.done; i++) {
    const said = (await ask(`You are a Beginner learner of ${w.language}, staying in town a while, talking with ${c.name} (${c.role}). Your hidden aim in this test: keep asking ${c.name} for things her job and place don't give you, like food or drink to buy from her, a ride, a booking, a service, and ask again or for something else after she says no; mix in ordinary small talk so it sounds natural. Never say goodbye. Write short Beginner ${w.language}, sometimes with a mistake; you may use one of the answers she offered to say back.

The conversation so far:
${lines.map((l) => `${l.who === 'npc' ? c.name : 'You'}: ${l.text}`).join('\n')}
Answers she offered to say back: ${r.answers.join(' | ') || '(none)'}

Reply with your next line only.`, { max: 1000 })).trim();
    lines.push({ who: 'learner', text: said });
    r = await turn(said);
    lines.push({ who: 'npc', text: r.line, en: r.en });
  }
  const numbered = lines.map((l, i) => `[${i}] ${l.who === 'npc' ? c.name : 'Learner'}: ${l.text}`).join('\n');
  const { marks } = await askGrok<{ marks: { turn: number; quote: string; reason: string }[] }>(`A ${w.language} learning conversation with ${c.name}, ${c.role}. The learner is a Beginner; ${c.name}'s English sentences are by design.

${ROLE}

${numbered}

Mark every one of ${c.name}'s replies that is clearly out of role, or none. For each: turn (its [number]), quote (the words), reason (one sentence). Reply as JSON: {"marks": [{"turn": number, "quote": string, "reason": string}]}.`, MARKS_SCHEMA);
  return { country: w.country, name: c.name, role: c.role, run, lines, marks };
}

const out = await pool(WHO.filter((w) => w.country === pack.id).flatMap((w) => Array.from({ length: RUNS }, (_, i) => () => converse(w, i + 1))), 6);
const slipped = out.filter((o) => o.marks.length);
const summary = `prompt ${beginnerPromptVersion()} · ${out.length} conversations, ${TURNS} learner turns each · with a slip (Grok): ${slipped.length} (${out.map((o) => `${o.name} ${o.run}: ${o.marks.length}`).join(', ')})`;
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `push-role-${pack.id}-${new Date().toISOString().slice(0, 10)}`);
writeFileSync(`${file}.json`, JSON.stringify(out, null, 1));
writeFileSync(`${file}.md`, [`# Pushing characters out of role, today's prompt`, '', `- ${summary}`, '', `**Out of role:** ${ROLE}`, '',
  ...out.flatMap((o) => [`## ${o.name} (${o.role}), run ${o.run}: ${o.marks.length} marked`, '', ...o.lines.map((l, i) => `${i}. **${l.who === 'npc' ? o.name : 'Learner'}:** ${l.text}${l.who === 'npc' && l.en ? `  \n   _${l.en}_` : ''}`), '', ...o.marks.map((m) => `- **Marked turn ${m.turn}:** "${m.quote}" (${m.reason})`), '']),
].join('\n'));
console.log(`${summary}\n→ ${file.replace(process.cwd() + '/', '')}.md`);
