// Specific facts or a topic with one example in a `here` line? (Josh,
// 2026-11-04: "are people going to tell the same story everytime - would it
// just be better to prompt re the colloseum or renaissance art or italian
// folklore"; "claude with example will beat too much specificity - but we can
// test".) Three Rome characters (Ettore, open; Serena, cultural; Gina, open),
// three visits each by the same curious A2 learner, memory carried between
// visits the way the game does (lib/remember.ts → summarizeWithClaude), in two
// versions of their here line. A judge reads each character's three visits
// together: stories told again, how particular to Italy the culture was, and
// doubtful factual claims in what they actually said. Real turn code
// (runTurn, Intermediate path); nothing is written to content.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/here-topic-vs-specific.mts [out dir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { summarizeWithClaude } from '@/lib/remember';
import type { CharacterSheet, Turn } from '@/lib/types';
import { learners } from '../conversations/learners';
import { ask, OUT, pool } from './common.mjs';

const TURNS = 5;
const VISITS = 3;
const out = process.argv[2] ?? OUT;
const city = cities.find((c) => c.id === 'roma-nuova')!;
const base = learners.find((l) => l.id === 'improving')!;
const LEARNER = `${base.description} You're curious about the place and the city, and sometimes ask about them.`;

// Topic with one example (Claude's drafts from Josh's direction); the specific
// version is what's in content/it/cities/roma-nuova.ts today
const TOPIC: Record<string, string> = {
  'villa-borghese-nuova': "You've sat on the same bench by the lake in Villa Borghese every morning since you retired. You're a lifelong reader of Rome's history and legends, from the ancient city to the papal one, the kind of thing Romans tell each other (the talking statue of Pasquino, where Romans pinned anonymous satire against the popes, is a favourite of yours). When someone sits down on your bench, you get talking about it.",
  colosseo: "You're an archaeologist with the Parco archeologico del Colosseo and eat your lunch on a wall on the Colle Oppio, looking at the arches. You love the history of ancient Rome and what's still being found under the modern city (every new Metro line turns up something). When someone stops by your wall, you get talking about it.",
  'piazza-santa-maria-trastevere': "You were born in Trastevere and sit on the fountain steps most afternoons. You love the folklore and religious traditions of Trastevere and of Rome, and the Roman words that go with them (the Festa de' Noantri in July, when the Madonna del Carmine is carried through these streets, is the one you wait for all year). When someone sits beside you on the steps, you get talking about them.",
};
const WHY: Record<string, string> = {
  'villa-borghese-nuova': 'you sit on a bench in the park for a while',
  colosseo: 'you walk past the Colosseo and stop for a minute',
  'piazza-santa-maria-trastevere': 'you sit on the fountain steps in the piazza',
};

function sheet(placeId: string, version: 'specific' | 'topic'): CharacterSheet {
  const place = city.places.find((p) => p.id === placeId)!;
  const c = characterForPlace(city, place)!;
  if (version === 'specific') return c;
  const where = `${place.name} (${place.kind.replace(/-/g, ' ')}), ${place.neighbourhood}`;
  return { ...c, appearance: { ...c.appearance, setting: `${where}. ${TOPIC[placeId]}` } };
}

const show = (t: Turn[], name: string) => t.map((x) => `${x.who === 'npc' ? name : 'Learner'}: ${x.transcript}`).join('\n');

async function visits(placeId: string, version: 'specific' | 'topic') {
  const character = sheet(placeId, version);
  const place = city.places.find((p) => p.id === placeId)!;
  let notes: string[] = [];
  const all: Turn[][] = [];
  for (let v = 0; v < VISITS; v++) {
    const memory = v ? { visits: v, lastVisit: new Date(Date.now() - 86_400_000), notes } : undefined;
    const transcript: Turn[] = [];
    const open = await runTurn({ character, transcript: [], memory });
    transcript.push({ who: 'npc', transcript: open.line, translation: open.en });
    for (let i = 0; i < TURNS; i++) {
      const said = await ask(`Conversation so far:\n${show(transcript, character.name)}\n\nWhat do you say next?`, {
        system: `You are role-playing an Italian learner in a test. ${LEARNER}
You are at ${place.name} in Rome with ${character.name}. ${v ? `You've met before (this is visit ${v + 1}).` : 'You have never met.'} Why you're here: ${WHY[placeId]}. Talk the way a real person would.
Be honest about comprehension. Write ONLY what you say next, as speech-to-text would capture it. One or two short sentences. When the talk has ended, say goodbye.`,
        max: 2000,
      });
      transcript.push({ who: 'learner', transcript: said });
      const r = await runTurn({ character, transcript: transcript.slice(0, -1), learnerSaid: said, memory });
      transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    }
    all.push(transcript);
    const m = await summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: character.city }, notes, turns: transcript.map((t) => ({ who: t.who, text: t.transcript })) });
    notes = m.notes;
  }
  return { placeId, version, name: character.name, visits: all };
}

const JUDGE = `You read three visits, on different days, by the same learner to the same character in a language-learning game set in Rome. Judge the character's cultural content across the three visits together:
- stories: list each cultural story, fact or topic the character brought up (a few words each), with the visit numbers it came up in;
- repeated: how many of them the character told again in a later visit as if new (picking up a thread the learner asked about doesn't count);
- particular: how particular to Italy and Rome the culture was, 1 (generic, could be anywhere) to 5 (folklore, religious traditions, food, history or art a Roman would talk about);
- doubtful: factual claims the character made that are wrong or that you can't confirm, word for word.`;
const judgeSchema = { type: 'object', additionalProperties: false, required: ['stories', 'repeated', 'particular', 'doubtful'], properties: { stories: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['story', 'visits'], properties: { story: { type: 'string' }, visits: { type: 'array', items: { type: 'integer' } } } } }, repeated: { type: 'integer' }, particular: { type: 'integer' }, doubtful: { type: 'array', items: { type: 'string' } } } };

const jobs = Object.keys(TOPIC).flatMap((placeId) => (['specific', 'topic'] as const).map((version) => () => visits(placeId, version)));
const runs = await pool(jobs, 6);
const judged = await pool(runs.map((r) => async () => ({
  ...r,
  ...(JSON.parse(await ask(r.visits.map((t, i) => `Visit ${i + 1}:\n${show(t, r.name)}`).join('\n\n'), { system: JUDGE, schema: judgeSchema, max: 3000 })) as { stories: { story: string; visits: number[] }[]; repeated: number; particular: number; doubtful: string[] }),
})), 6);

let md = `# Here lines: specific facts or a topic with an example, ${new Date().toISOString().slice(0, 10)}\n\nRome: Ettore (open), Serena (cultural), Gina (open); ${VISITS} visits each by a curious A2 learner, memory carried between visits, ${TURNS} learner turns a visit. Intermediate path (runTurn).\n\n| Character | Version | stories | told again | particular (1–5) | doubtful claims |\n|---|---|---|---|---|---|\n`;
for (const r of judged) md += `| ${r.name} | ${r.version} | ${r.stories.length} | ${r.repeated} | ${r.particular} | ${r.doubtful.length} |\n`;
md += `\n## Stories and doubts\n\n${judged.map((r) => `### ${r.name} · ${r.version}\n${r.stories.map((s) => `- ${s.story} (visit ${s.visits.join(', ')})`).join('\n')}${r.doubtful.length ? `\n\nDoubtful: ${r.doubtful.join('; ')}` : ''}`).join('\n\n')}\n\n## Conversations\n\n`;
for (const r of judged) md += r.visits.map((t, i) => `### ${r.name} · ${r.version} · visit ${i + 1}\n\n\`\`\`\n${show(t, r.name)}\n\`\`\``).join('\n\n') + '\n\n';
mkdirSync(out, { recursive: true });
const file = join(out, `here-topic-vs-specific-${Date.now()}.md`);
writeFileSync(file, md);
console.log(md.split('\n## Conversations')[0]);
console.log(file);
