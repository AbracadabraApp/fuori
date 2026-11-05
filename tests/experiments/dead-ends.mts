// Lines that leave the learner nothing to say (Josh, 2026-11-04, playing the
// trattoria in Florence: "so many waits with no reason to say anything"; the
// waiter kept saying "torno subito" and the mic opened on nothing). Rome's
// shops, bars and two open places, two simulated learners, the real turn code
// (runTurn, Intermediate path) with the character prompt named by
// CHARACTER_PROMPT (character.md when unset). Counted in code: lines with no
// question mark, lines with two or more, words a line, reply time. A judge
// reads each conversation for dead ends (nothing natural to answer) and
// forced questions (tacked on, or interrogating). Run once per prompt:
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/dead-ends.mts [out dir]
//   COUNTRY=it CHARACTER_PROMPT=character-trial-answer.md npx tsx --env-file=.env.local tests/experiments/dead-ends.mts [out dir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import type { Turn } from '@/lib/types';
import { learners } from '../conversations/learners';
import { ask, OUT, pool } from './common.mjs';

const TURNS = 6;
const out = process.argv[2] ?? OUT;
const promptFile = process.env.CHARACTER_PROMPT || 'character.md';
const city = cities.find((c) => c.id === 'roma-nuova')!;
const PLACES = ['trattoria-garbatella', 'bar-mattina-nuova', 'bar-monti-corner', 'forno-trastevere', 'tabaccheria-pigneto', 'farmacia-prati', 'volpetti-testaccio', 'grattachecca-lungotevere', 'villa-borghese-nuova', 'piazza-santa-maria-trastevere'];
const LEARNERS = ['hesitant', 'improving'];

const show = (t: Turn[], name: string) => t.map((x) => `${x.who === 'npc' ? name : 'Learner'}: ${x.transcript}`).join('\n');
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const questions = (s: string) => (s.match(/\?/g) ?? []).length;

async function conversation(placeId: string, learnerId: string) {
  const place = city.places.find((p) => p.id === placeId)!;
  const character = characterForPlace(city, place)!;
  const learner = learners.find((l) => l.id === learnerId)!;
  const transcript: Turn[] = [];
  const times: number[] = [];
  let t0 = performance.now();
  const open = await runTurn({ character, transcript: [] });
  times.push(performance.now() - t0);
  transcript.push({ who: 'npc', transcript: open.line, translation: open.en });
  for (let i = 0; i < TURNS; i++) {
    const said = await ask(`Conversation so far:\n${show(transcript, character.name)}\n\nWhat do you say next?`, {
      system: `You are role-playing an Italian learner in a test. ${learner.description}
You are at ${place.name} in Rome with ${character.name}, there for the ordinary reason people go there. Talk the way a real person would.
Be honest about comprehension. Write ONLY what you say next, as speech-to-text would capture it. One or two short sentences. When the talk has ended, say goodbye.`,
      max: 2000,
    });
    transcript.push({ who: 'learner', transcript: said });
    t0 = performance.now();
    const r = await runTurn({ character, transcript: transcript.slice(0, -1), learnerSaid: said });
    times.push(performance.now() - t0);
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
  }
  return { placeId, learnerId, name: character.name, transcript, times };
}

const JUDGE = `You read a conversation in a language-learning game: a learner speaking Italian with a character in Rome. After each character line the learner's microphone opens and they're expected to speak. Count, over the character's lines (all of them except the very last):
- dead: lines that leave the learner nothing natural to say back (no question, no invitation, nothing to react to beyond "grazie" or "ok"), word for word;
- forced: lines whose question feels tacked on, off the moment, or like an interrogation, word for word.`;
const judgeSchema = { type: 'object', additionalProperties: false, required: ['dead', 'forced'], properties: { dead: { type: 'array', items: { type: 'string' } }, forced: { type: 'array', items: { type: 'string' } } } };

const runs = await pool(PLACES.flatMap((p) => LEARNERS.map((l) => () => conversation(p, l))), 6);
const judged = await pool(runs.map((r) => async () => ({
  ...r,
  ...(JSON.parse(await ask(show(r.transcript, r.name), { system: JUDGE, schema: judgeSchema, max: 2000 })) as { dead: string[]; forced: string[] }),
})), 6);

const lines = judged.flatMap((r) => r.transcript.filter((t) => t.who === 'npc').map((t) => t.transcript));
const times = judged.flatMap((r) => r.times).sort((a, b) => a - b);
const pct = (n: number) => `${Math.round((n * 100) / lines.length)}%`;
const summary = {
  prompt: promptFile,
  conversations: judged.length,
  lines: lines.length,
  noQuestion: pct(lines.filter((l) => questions(l) === 0).length),
  twoPlusQuestions: pct(lines.filter((l) => questions(l) >= 2).length),
  wordsPerLine: (lines.reduce((n, l) => n + words(l), 0) / lines.length).toFixed(1),
  medianReplySeconds: (times[Math.floor(times.length / 2)] / 1000).toFixed(2),
  deadEnds: judged.reduce((n, r) => n + r.dead.length, 0),
  forced: judged.reduce((n, r) => n + r.forced.length, 0),
};

let md = `# Dead ends, ${promptFile}, ${new Date().toISOString().slice(0, 10)}\n\nRome, ${PLACES.length} places × ${LEARNERS.join(' and ')}, ${TURNS} learner turns each. Intermediate path (runTurn).\n\n\`\`\`\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\n## Judged lines\n\n`;
md += judged.map((r) => `### ${r.name} · ${r.learnerId}\n${r.dead.map((d) => `- dead: ${d}`).join('\n')}${r.forced.length ? '\n' + r.forced.map((d) => `- forced: ${d}`).join('\n') : ''}`).join('\n\n');
md += '\n\n## Conversations\n\n' + judged.map((r) => `### ${r.name} · ${r.learnerId}\n\n\`\`\`\n${show(r.transcript, r.name)}\n\`\`\``).join('\n\n') + '\n';
mkdirSync(out, { recursive: true });
const file = join(out, `dead-ends-${promptFile.replace('.md', '')}-${Date.now()}.md`);
writeFileSync(file, md);
console.log(JSON.stringify(summary));
console.log(file);
