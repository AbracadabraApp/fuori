/**
 * Grade and recommend: simulated conversations with a sample of existing characters.
 *
 *   npm run test:conversations                 # default sample
 *   npm run test:conversations -- --count=10   # characters in the sample (Giulia and Rita always included)
 *   npm run test:conversations -- --turns=8    # learner turns per conversation
 *   npm run test:conversations -- --dry        # show the sample and prompts, no API calls
 *
 * Character replies go through lib/turn.ts, the same code /api/turn uses.
 * Nothing is edited automatically: the report recommends, you decide.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { anthropic, CLAUDE_MODEL } from '@/lib/claude';
import { runTurn } from '@/lib/turn';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content/it/cities';
import type { CharacterSheet, Place, Turn } from '@/lib/types';
import { learners, type Learner } from './learners';

const arg = (name: string, fallback: number) =>
  Number(process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback);
const COUNT = arg('count', 6);
const TURNS = arg('turns', 6);
const DRY = process.argv.includes('--dry');

const CRITERIA = {
  italian: 'Speaks Italian. Uses English only when the learner asks for it, and only as much as the character\'s English allows, then returns to Italian.',
  understands: 'Understands imperfect speech. Reads garbled speech-to-text ("bone journal" = buongiorno) and learner errors as what they meant, without commenting on them.',
  level: 'Matches the learner. Simplifies when they struggle or ask (ripeti, più lentamente); follows their lead when they use richer Italian.',
  alive: 'Feels like a real person in that place. Distinct personality, reacts to what was said, recasts mistakes naturally instead of teaching.',
} as const;
type Criterion = keyof typeof CRITERIA;

interface Case {
  character: CharacterSheet;
  place: Place;
  cityName: string;
  learner: Learner;
}

interface Graded extends Case {
  transcript: Turn[];
  scores: Record<Criterion, number>;
  overall: number;
  problem: string;
  quote: string;
  error?: string;
}

// ---------- Sample ----------

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickSample(): Case[] {
  const all = cities.flatMap((city) =>
    city.places
      .map((place) => ({ place, city, character: characterForPlace(city, place) }))
      .filter((x): x is { place: Place; city: typeof city; character: CharacterSheet } => !!x.character)
  );
  const anchors = all.filter((x) => x.character.origin === 'anchor');
  // At most one character per city, so the sample spreads across Italy
  const seen = new Set<string>();
  const others = shuffle(all.filter((x) => x.character.origin !== 'anchor')).filter((x) => {
    if (seen.has(x.city.id)) return false;
    seen.add(x.city.id);
    return true;
  });
  const picked = [...anchors, ...others].slice(0, Math.max(COUNT, anchors.length));
  return picked.map((x, i) => ({
    character: x.character,
    place: x.place,
    cityName: x.city.name,
    learner: learners[i % learners.length],
  }));
}

// ---------- Claude helpers ----------

async function ask(system: string, user: string, maxTokens = 400): Promise<string> {
  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const block = res.content[0];
  return block.type === 'text' ? block.text.trim() : '';
}

async function askJson<T>(system: string, user: string, schema: Record<string, unknown>, maxTokens = 1500): Promise<T> {
  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { format: { type: 'json_schema', schema } },
  });
  const block = res.content[0];
  if (block.type !== 'text') throw new Error('No text in response');
  return JSON.parse(block.text) as T;
}

const show = (t: Turn[], c: CharacterSheet) =>
  t.map((x) => `${x.who === 'npc' ? c.name : 'Learner'}: ${x.transcript}`).join('\n');

// ---------- Simulate ----------

async function learnerLine(c: Case, transcript: Turn[]): Promise<string> {
  return ask(
    `You are role-playing an Italian learner in a test. ${c.learner.description}
You are at ${c.place.name} in ${c.cityName}, talking to ${c.character.name} (${c.character.role}).
Write ONLY what the learner says next, as speech-to-text would capture it. One or two short sentences. No quotes, no stage directions.`,
    `Conversation so far:\n${show(transcript, c.character)}\n\nWhat do you say next?`,
    150
  );
}

async function simulate(c: Case): Promise<Turn[]> {
  const transcript: Turn[] = [];
  const opening = await runTurn({ character: c.character, transcript: [] });
  transcript.push({ who: 'npc', transcript: opening.it, translation: opening.en });

  for (let i = 0; i < TURNS; i++) {
    const said = await learnerLine(c, transcript);
    const reply = await runTurn({ character: c.character, transcript, learnerSaid: said });
    transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: reply.it, translation: reply.en });
  }
  return transcript;
}

// ---------- Grade ----------

const gradeSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ...Object.fromEntries(Object.keys(CRITERIA).map((k) => [k, { type: 'integer', description: '1-10' }])),
    problem: { type: 'string', description: 'The single biggest problem, one sentence. "None" if none.' },
    quote: { type: 'string', description: 'The character line that best shows the problem, verbatim. Empty if none.' },
  },
  required: [...Object.keys(CRITERIA), 'problem', 'quote'],
};

async function grade(c: Case, transcript: Turn[]): Promise<Omit<Graded, keyof Case | 'transcript'>> {
  const english =
    c.character.englishAbility ? `The character's English: ${c.character.englishAbility}.` : 'The character\'s English ability is unspecified.';
  const result = await askJson<Record<string, unknown>>(
    `You grade conversations from Fuori, an app where learners practise Italian by talking with characters in Italy. The goal is natural conversation, not teaching. Be honest and specific; 10 means a native speaker would find it entirely natural.`,
    `Character: ${c.character.name}, ${c.character.role} at ${c.place.name}, ${c.cityName}. ${english}
Learner type: ${c.learner.description}

Grade the CHARACTER (not the learner) from 1 to 10 on:
${Object.entries(CRITERIA).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Transcript:
${show(transcript, c.character)}`,
    gradeSchema
  );
  const scores = Object.fromEntries(
    Object.keys(CRITERIA).map((k) => [k, Math.max(1, Math.min(10, Number(result[k]) || 1))])
  ) as Record<Criterion, number>;
  const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  return { scores, overall, problem: String(result.problem ?? ''), quote: String(result.quote ?? '') };
}

// ---------- Recommend ----------

async function recommend(results: Graded[]): Promise<string> {
  const summary = results
    .filter((r) => !r.error)
    .map(
      (r) =>
        `${r.character.name} (${r.character.role}, ${r.cityName}) with ${r.learner.id}: ` +
        `${Object.entries(r.scores).map(([k, v]) => `${k} ${v}`).join(', ')}. Problem: ${r.problem}${r.quote ? ` Quote: "${r.quote}"` : ''}`
    )
    .join('\n');
  return ask(
    `You advise the builder of Fuori, a voice-first Italian conversation app. The character prompt is deliberately minimal ("match their level, simplify naturally, stay in character, speak Italian"); the product direction is natural conversation, not rules. Recommend small, high-leverage changes in that spirit. Plain language, no preamble.`,
    `Graded test conversations:\n${summary}\n\nWrite markdown with exactly two sections:
## Top problems
Up to 3, most common first. One line each, with a short real quote from above.
## Recommendations
Up to 3 specific changes (to the character prompt in lib/prompts/build-turn-prompt.ts, or to character data). Say what to change and why, one or two lines each. If things look good, say so and recommend fewer.`,
    900
  );
}

// ---------- Report ----------

function report(results: Graded[], recs: string): string {
  const ok = results.filter((r) => !r.error);
  const avg = (f: (r: Graded) => number) => (ok.length ? ok.reduce((a, r) => a + f(r), 0) / ok.length : 0);
  const crit = Object.keys(CRITERIA) as Criterion[];
  const lines = [
    `# Conversation test`,
    ``,
    `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · model ${CLAUDE_MODEL} · ${ok.length} conversations · ${TURNS} learner turns each`,
    ``,
    `## Grade: ${avg((r) => r.overall).toFixed(1)} / 10`,
    ``,
    `| Criterion | Average |`,
    `|---|---|`,
    ...crit.map((k) => `| ${k} | ${avg((r) => r.scores[k]).toFixed(1)} |`),
    ``,
    recs,
    ``,
    `## By character (weakest first)`,
    ``,
    `| Character | Place | Learner | ${crit.join(' | ')} | Overall |`,
    `|---|---|---|${crit.map(() => '---').join('|')}|---|`,
    ...[...ok]
      .sort((a, b) => a.overall - b.overall)
      .map(
        (r) =>
          `| ${r.character.name} (${r.character.role}) | ${r.place.name}, ${r.cityName} | ${r.learner.id} | ${crit.map((k) => r.scores[k]).join(' | ')} | ${r.overall.toFixed(1)} |`
      ),
    ``,
    ...results.filter((r) => r.error).map((r) => `- **Failed:** ${r.character.name}: ${r.error}`),
    ``,
    `## Transcripts`,
    ``,
    ...results.flatMap((r) => [
      `### ${r.character.name}, ${r.place.name} (${r.cityName}) · ${r.learner.id}${r.error ? '' : ` · ${r.overall.toFixed(1)}`}`,
      r.problem && r.problem !== 'None' ? `\n_Problem: ${r.problem}_\n` : '',
      '```',
      show(r.transcript, r.character),
      '```',
      '',
    ]),
  ];
  return lines.join('\n');
}

// ---------- Main ----------

async function main() {
  const sample = pickSample();
  console.log(`Sample (${sample.length}):`);
  sample.forEach((c) =>
    console.log(`  ${c.character.name} — ${c.character.role}, ${c.place.name}, ${c.cityName} · learner: ${c.learner.id}`)
  );

  if (DRY) {
    const first = sample[sample.length - 1];
    console.log(`\nSystem prompt for ${first.character.name}:\n`);
    console.log(buildTurnPrompt({ character: first.character, transcript: [] }).system);
    console.log(`\nDry run: no API calls. About ${sample.length * (TURNS * 2 + 2) + 1} calls in a real run.`);
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set (put it in .env.local).');
    process.exit(1);
  }

  // Run conversations in parallel, a few at a time
  const results: Graded[] = [];
  const queue = [...sample];
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      try {
        const transcript = await simulate(c);
        const g = await grade(c, transcript);
        results.push({ ...c, transcript, ...g });
        console.log(`  ✓ ${c.character.name} (${c.cityName}): ${g.overall.toFixed(1)}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ ...c, transcript: [], scores: {} as Graded['scores'], overall: 0, problem: '', quote: '', error: msg });
        console.log(`  ✗ ${c.character.name}: ${msg}`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  const recs = results.some((r) => !r.error) ? await recommend(results) : '_No conversations completed._';
  const dir = join(process.cwd(), 'tests', 'conversations', 'reports');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.md`);
  writeFileSync(file, report(results, recs));

  const ok = results.filter((r) => !r.error);
  const avg = ok.reduce((a, r) => a + r.overall, 0) / (ok.length || 1);
  console.log(`\nGrade: ${avg.toFixed(1)}/10 · report: ${file.replace(process.cwd() + '/', '')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
