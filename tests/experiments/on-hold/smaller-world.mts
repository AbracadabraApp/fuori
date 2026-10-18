// A scripted beginner world (Josh, 2026-10-17): fixed scripts per character,
// the same for every learner, for one neighbourhood. For each character:
// visit 1, then visit 2 (with visit 1 as context). Each script is checked by
// a second call (every answer honours the reply tapped; every line correct,
// natural and regional; a beginner could follow it); a failing script is
// rewritten with the checker's problems, up to twice.
// ON HOLD (Josh, 2026-10-18): the smaller world waits for a spec (docs/06-roadmap.md). Kept as
// rounds 12-13 ran it (V2=1 for round 13); its scripts are in design/beginner-scripts/.
//   npx tsx --env-file=.env.local tests/experiments/on-hold/smaller-world.mts tests/experiments/out/world [neighbourhood]   (COUNTRY as needed)
import { writeFileSync } from 'node:fs';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities, language } from '@/content';

const [out, neighbourhood] = process.argv.slice(2);
const LEVEL = 'Beginner: still you, sometimes ask';
const BEATS = 6;
const city = cities[0];
const picks = city.places
  .filter((p) => !neighbourhood || p.neighbourhood === neighbourhood)
  .map((place) => ({ place, character: characterForPlace(city, place) }))
  .filter((x) => x.character) as { place: any; character: any }[];

const L = { type: 'object', additionalProperties: false, properties: { line: { type: 'string' }, en: { type: 'string' } }, required: ['line', 'en'] };
const scriptSchema = { type: 'object', additionalProperties: false, properties: { beats: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
  line: L, replies: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { reply: L, answer: L }, required: ['reply', 'answer'] } } }, required: ['line', 'replies'] } } }, required: ['beats'] };
const checkSchema = { type: 'object', additionalProperties: false, properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'problems'] };

type Script = { beats: { line: { line: string; en: string }; replies: { reply: { line: string; en: string }; answer: { line: string; en: string } }[] }[] };

const writeAsk = (visit: number, previous: Script | null, problems: string[], draft: Script | null) => `This time, write the whole conversation ahead of time, as a script. The person can't speak yet: after each of your lines they tap one of two replies. ${visit === 1 ? 'It is the first time they come here.' : `It is their second visit; you remember them from the first one, which went like this:\n${render(previous!, 0)}`}

Write ${BEATS} beats. Each beat: your line; two replies the person could tap (short, whole sentences in plain beginner ${language.name}, different choices, built on the same everyday sentence frame where it fits; for a yes-or-no question, a yes and a polite no); and your answer to each reply. Your next line follows on from either answer, so both paths join again. Your next line has to be true after either reply: if a reply would change what happens next (a no, a different choice), your answer to it brings the conversation back, in a way that makes sense for the person, and never ignores what they chose. Your first line opens the conversation; your last answers close it naturally.${process.env.V2 ? ' Where both paths join, make the two replies a pick between two things that both carry the conversation forward (this or that), so neither path ignores an answer. Offer a yes or no only where your answer can really go both ways, and after a no the conversation follows the no. Do what a real ' + 'person in your role does here (a pharmacist asks what it is for); never hand over or charge for something the person has not chosen. Say goodbye only once the person is done.' : ''}

Give the English for every line.${draft ? `\n\nA reviewer found these problems in your draft. Write it again without them:\n- ${problems.join('\n- ')}\n\nThe draft:\n${render(draft, 0)}\n\n${render(draft, 1)}` : ''}`;

const checkAsk = (name: string, role: string, s: Script) => `This is a script for a ${language.name} conversation game set in ${city.name}. ${name}, a ${role}, talks with a person who is just starting to learn ${language.name}; after each of ${name}'s lines the person taps one of two replies, and ${name} answers. Both answers lead into ${name}'s next line, so that line must make sense after either reply.

Here are both paths through it:

${render(s, 0)}

${render(s, 1)}

Check it. It passes only if all of these hold:
- Every line ${name} says makes sense after the reply just tapped: it never ignores or contradicts what the person chose, on either path.
- Every line is correct, natural ${language.name} as spoken here, in ${name}'s register.
- Someone a few weeks into ${language.name} could follow every line of ${name}'s (short, plain, about what's happening here).
- Both replies in each beat are sensible things to say and different choices.
- ${name} sounds like a real ${role} here, not a teacher.${process.env.V2 ? `
- Read path 2, then path 1, line by line: after each reply, would a real person say exactly that next line to someone who had just said it? It fails if any line carries on as if the other reply had been chosen, if ${name} hands over or charges for something not chosen, if ${name} skips what a real ${role} would do, or if the ending is abrupt.` : ''}

Reply with JSON: pass, and problems (each a short sentence naming the line; empty if it passes).`;

function render(s: Script, path: number): string {
  const lines: string[] = [];
  let carry = '';
  for (const b of s.beats) {
    lines.push(`Character: ${(carry + ' ' + b.line.line).trim()}`);
    const r = b.replies[Math.min(path, b.replies.length - 1)];
    lines.push(`Person: ${r.reply.line}`);
    carry = r.answer.line;
  }
  if (carry) lines.push(`Character: ${carry}`);
  return `Path ${path + 1}:\n${lines.join('\n')}`;
}

async function call(system: string | undefined, content: string, schema: object, max: number) {
  const res = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: max, ...(system ? { system } : {}), messages: [{ role: 'user', content }], output_config: { format: { type: 'json_schema', schema } } } as any);
  if (res.stop_reason === 'max_tokens') throw new Error('max_tokens');
  return JSON.parse(replyText(res));
}

const results: any[] = [];
await Promise.all(picks.map(async ({ place, character }) => {
  const system = buildTurnPrompt({ character, transcript: [], level: LEVEL }).system;
  let previous: Script | null = null;
  for (const visit of [1, 2]) {
    let draft: Script | null = null, problems: string[] = [], attempts = 0, pass = false, history: string[][] = [];
    while (attempts < 3) {
      attempts++;
      const s: Script = await call(system, writeAsk(visit, previous, problems, draft), scriptSchema, 16000);
      const c = await call(undefined, checkAsk(character.name, character.role, s), checkSchema, 6000);
      draft = s; problems = c.problems; pass = c.pass; history.push(c.problems);
      if (pass) break;
    }
    results.push({ name: character.name, role: character.role, place: place.name, visit, attempts, pass, problems: history, script: draft });
    previous = draft;
    process.stdout.write(pass ? '.' : 'x');
  }
}));
console.log();
writeFileSync(`${out}.json`, JSON.stringify(results, null, 1));
const md = [`# Scripted beginner world: ${city.name}${neighbourhood ? `, ${neighbourhood}` : ''}\n\n${new Date().toISOString().slice(0, 16)} · ${CLAUDE_MODEL} · level "${LEVEL}" · ${BEATS} beats, 2 visits per character, checked and rewritten up to twice\n\n## Conversations\n`];
for (const r of results.sort((a, b) => a.name.localeCompare(b.name) || a.visit - b.visit)) for (const path of [0, 1]) {
  md.push(`### ${r.name} (${r.role}), ${r.place} · visit ${r.visit} · path ${path + 1} · ${r.pass ? `passed on attempt ${r.attempts}` : 'failed 3 times'}\n\n\`\`\`\n${render(r.script, path).split('\n').slice(1).map((l) => l.replace(/^Character:/, `${r.name}:`).replace(/^Person:/, 'Learner:')).join('\n')}\n\`\`\`\n`);
}
writeFileSync(`${out}.md`, md.join('\n'));
const first = results.filter((r) => r.pass && r.attempts === 1).length, any = results.filter((r) => r.pass).length;
console.log(`${results.length} scripts · passed first time ${first} (${Math.round(100 * first / results.length)}%) · passed within 3 ${any} (${Math.round(100 * any / results.length)}%)`);
