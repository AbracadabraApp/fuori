/**
 * Grade and recommend: simulated conversations with a sample of existing characters.
 *
 *   npm run test:conversations                 # default sample
 *   npm run test:conversations -- --count=10   # characters in the sample
 *   npm run test:conversations -- --turns=8    # learner turns per conversation
 *   npm run test:conversations -- --dry        # show the sample and prompts, no API calls
 *   npm run test:conversations -- --seed=7     # same sample every time: use for before-and-after
 *   npm run test:conversations -- --level="Beginner: shape"   # experimental level block (content/<country>/prompts/levels.md)
 *
 * Reports reply length as numbers (opener words, median and longest reply, share
 * of long replies, questions per reply) next to the grades, and saves a .json
 * summary beside each .md report so runs can be compared.
 *
 * Character replies go through lib/turn.ts, the same code /api/turn uses.
 * Nothing is edited automatically: the report recommends, you decide.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { runTurn } from '@/lib/turn';
import { buildTurnPrompt, promptVersion } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities, language, country } from '@/content';
import type { CharacterSheet, Place, Turn } from '@/lib/types';
import { learners, type Learner } from './learners';
import { turnStats, summarize, LONG_TURN_WORDS, TYPICAL_TURN_WORDS, type TurnStats } from '@/lib/dialogue-stats';

const arg = (name: string, fallback: number) =>
  Number(process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback);
const COUNT = arg('count', 6);
const TURNS = arg('turns', 6);
const DRY = process.argv.includes('--dry');
const SEED = process.argv.find((a) => a.startsWith('--seed='))?.split('=')[1];
const LEVEL = process.argv.find((a) => a.startsWith('--level='))?.split('=').slice(1).join('=');

// Seeded random numbers, so --seed gives the same sample on every run
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const random = SEED !== undefined ? seeded(Number(SEED) || 0) : Math.random;

function buildCriteria() {
  const langName = language.name;
  const base = {
    language: `Speaks ${langName}. Uses English only when the learner asks for it, and only as much as the character's English allows, then returns to ${langName}.`,
    understands: 'Understands imperfect speech. Reads garbled speech-to-text and learner errors as what they meant, without commenting on them.',
    adapts: `Adapts when the learner is lost. Talking fast or in complex ${langName} is fine (real people do); what matters is that when the learner signals confusion the character slows down and rephrases, and when they ask to repeat, repeats.`,
    alive: 'Feels like a real person in that place. Distinct personality, reacts to what was said, recasts mistakes naturally instead of teaching.',
  };

  // Mexico-specific: check for Spain Spanish instead of Mexican Spanish
  if (country === 'es-mx') {
    return {
      ...base,
      regional: 'Uses Mexican Spanish. Avoids Spain Spanish markers like vosotros, vale, coger (for "take"), ordenador, zumo. Uses Mexican vocabulary and expressions.',
    };
  }

  return base;
}

const CRITERIA = buildCriteria();
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
  stats?: TurnStats;
  error?: string;
}

// ---------- Sample ----------

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
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
  // At most one character per city, so the sample spreads across the country
  const seen = new Set<string>();
  const others = shuffle(all).filter((x) => {
    if (seen.has(x.city.id)) return false;
    seen.add(x.city.id);
    return true;
  });
  const picked = others.slice(0, COUNT);
  return picked.map((x, i) => ({
    character: x.character,
    place: x.place,
    cityName: x.city.name,
    learner: learners[i % learners.length],
  }));
}

// ---------- Claude helpers ----------

// Limits leave room for the model's thinking, which counts toward them
async function ask(system: string, user: string, maxTokens = 2000): Promise<string> {
  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return replyText(res).trim();
}

async function askJson<T>(system: string, user: string, schema: Record<string, unknown>, maxTokens = 4000): Promise<T> {
  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { format: { type: 'json_schema', schema } },
  });
  return JSON.parse(replyText(res)) as T;
}

const show = (t: Turn[], c: CharacterSheet) =>
  t.map((x) => `${x.who === 'npc' ? c.name : 'Learner'}: ${x.transcript}`).join('\n');

// ---------- Simulate ----------

async function learnerLine(c: Case, transcript: Turn[]): Promise<string> {
  const langLearner = country === 'es-mx'
    ? `a ${language.name} learner`
    : 'an Italian learner';
  const helpPhrases = country === 'es-mx'
    ? '"Perdón, no entiendo", "¿Cómo?", "Más despacio, por favor", "¿Repite?", or in English'
    : '"Scusi, non capisco", "Come?", "Più piano, per favore", "Ripeti?", or in English';

  return ask(
    `You are role-playing ${langLearner} in a test. ${c.learner.description}
You are at ${c.place.name} in ${c.cityName}, talking to ${c.character.name} (${c.character.role}).
Be honest about comprehension: understand only what someone at your level really would. If the character's last line was too fast, long or complex for you, say so the way a real learner would (${helpPhrases}). Don't pretend to follow.
Write ONLY what the learner says next, as speech-to-text would capture it. One or two short sentences. No quotes, no stage directions.`,
    `Conversation so far:\n${show(transcript, c.character)}\n\nWhat do you say next?`,
    2000 // was 150: the model's thinking used it up and the line came back empty
  );
}

async function simulate(c: Case): Promise<Turn[]> {
  const transcript: Turn[] = [];
  const opening = await runTurn({ character: c.character, transcript: [], level: LEVEL });
  transcript.push({ who: 'npc', transcript: opening.line, translation: opening.en });

  for (let i = 0; i < TURNS; i++) {
    const said = await learnerLine(c, transcript);
    const reply = await runTurn({ character: c.character, transcript, learnerSaid: said, level: LEVEL });
    transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: reply.line, translation: reply.en });
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
  const appDesc = country === 'es-mx'
    ? `an app where learners practise ${language.name} by talking with characters in Mexico`
    : `an app where learners practise Italian by talking with characters in Italy`;

  const result = await askJson<Record<string, unknown>>(
    `You grade conversations from Fuori, ${appDesc}. The goal is natural conversation, not teaching. Be honest and specific; 10 means a native speaker would find it entirely natural.`,
    `Character: ${c.character.name}, ${c.character.role} at ${c.place.name}, ${c.cityName}. ${english}
Learner type: ${c.learner.description}

Grade the CHARACTER (not the learner) from 1 to 10 on the criteria below. Don't penalize the character for speaking naturally complex ${language.name}; judge how it responds when the learner shows confusion.
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
        `${Object.entries(r.scores).map(([k, v]) => `${k} ${v}`).join(', ')}. ` +
        (r.stats ? `Length: opener ${r.stats.openerWords} words, median reply ${r.stats.wordsMedian}, longest ${r.stats.wordsMax}, ${Math.round(r.stats.longShare * 100)}% over ${LONG_TURN_WORDS}. ` : '') +
        `Problem: ${r.problem}${r.quote ? ` Quote: "${r.quote}"` : ''}`
    )
    .join('\n');
  const appDesc = country === 'es-mx'
    ? `a voice-first ${language.name} conversation app for learning in Mexico`
    : `a voice-first Italian conversation app`;
  const promptPath = `content/${country}/prompts/character.md`;

  return ask(
    `You advise the builder of Fuori, ${appDesc}. The character prompt (${promptPath}) is deliberately minimal: it describes the situation, not how to talk, and sets no length rules. The product direction is natural conversation, not rules. For reference, real conversational turns run about ${TYPICAL_TURN_WORDS} words or fewer; replies far longer than that leave the learner no room to answer. Characters may speak as fast and complex as native speakers; don't recommend simplifying by default or beginner constraints, only better responses when the learner shows they're lost. Recommend small, high-leverage changes in that spirit. Plain language, no preamble.`,
    `Graded test conversations:\n${summary}\n\nWrite markdown with exactly two sections:
## Top problems
Up to 3, most common first. One line each, with a short real quote from above.
## Recommendations
Up to 3 specific changes (to the character prompt in ${promptPath}, to how turns are sent in lib/prompts/build-turn-prompt.ts, or to character data). Say what to change and why, one or two lines each. If things look good, say so and recommend fewer.`,
    4096 // Increased from 900 for Sonnet 5.5 with thinking
  );
}

// ---------- Report ----------

function lengthSection(ok: Graded[]): string[] {
  const sum = summarize(ok.flatMap((r) => (r.stats ? [r.stats] : [])));
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  return [
    `## Length`,
    ``,
    `| Measure | Value |`,
    `|---|---|`,
    `| Opener (median words) | ${sum.openerWords} |`,
    `| Reply (median words) | ${sum.wordsMedian} |`,
    `| Reply (average words) | ${sum.wordsAvg} |`,
    `| Longest reply (words) | ${sum.wordsMax} |`,
    `| Replies over ${LONG_TURN_WORDS} words | ${pct(sum.longShare)} |`,
    `| Questions per reply | ${sum.questionsAvg} |`,
    `| Replies asking 2+ questions | ${pct(sum.multiQuestionShare)} |`,
    ``,
    `_Yardstick: a typical conversational turn is about 5–${TYPICAL_TURN_WORDS} words._`,
  ];
}

function report(results: Graded[], recs: string): string {
  const ok = results.filter((r) => !r.error);
  const avg = (f: (r: Graded) => number) => (ok.length ? ok.reduce((a, r) => a + f(r), 0) / ok.length : 0);
  const crit = Object.keys(CRITERIA) as Criterion[];
  const lines = [
    `# Conversation test`,
    ``,
    `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · model ${CLAUDE_MODEL} · prompt ${promptVersion()}${LEVEL ? ` + level "${LEVEL}"` : ''} · ${ok.length} conversations · ${TURNS} learner turns each`,
    ``,
    `## Grade: ${avg((r) => r.overall).toFixed(1)} / 10`,
    ``,
    `| Criterion | Average |`,
    `|---|---|`,
    ...crit.map((k) => `| ${k} | ${avg((r) => r.scores[k]).toFixed(1)} |`),
    ``,
    ...lengthSection(ok),
    ``,
    recs,
    ``,
    `## By character (weakest first)`,
    ``,
    `| Character | Place | Learner | ${crit.join(' | ')} | Overall | Opener words | Median reply |`,
    `|---|---|---|${crit.map(() => '---').join('|')}|---|---|---|`,
    ...[...ok]
      .sort((a, b) => a.overall - b.overall)
      .map(
        (r) =>
          `| ${r.character.name} (${r.character.role}) | ${r.place.name}, ${r.cityName} | ${r.learner.id} | ${crit.map((k) => r.scores[k]).join(' | ')} | ${r.overall.toFixed(1)} | ${r.stats?.openerWords ?? ''} | ${r.stats?.wordsMedian ?? ''} |`
      ),
    ``,
    ...results.filter((r) => r.error).map((r) => `- **Failed:** ${r.character.name}: ${r.error}`),
    ``,
    `## How this test works`,
    ``,
    `1. **Sample.** Random characters from the city files (one per city), each at their own place.`,
    `2. **Simulate.** Claude plays a learner for ${TURNS} turn${TURNS === 1 ? "" : "s"}. The character's replies come from \`lib/turn.ts\`, the same code the app uses, so this is the real prompt.`,
    `3. **Grade.** A separate Claude call reads each transcript and scores the character 1–10 (10 = a native speaker would find it entirely natural):`,
    ...crit.map((k) => `   - **${k}**: ${CRITERIA[k]}`),
    `4. **Measure length.** Counted, not graded: words in the opener, median and longest reply, share of replies over ${LONG_TURN_WORDS} words, questions per reply, and share asking more than one question (several threads at once). Yardstick: real conversational turns run about 1–2 seconds, roughly 5–${TYPICAL_TURN_WORDS} words (Heldner & Edlund 2015; Stivers et al. 2009). These are measurements only; nothing is sent to the characters.`,
    `5. **Recommend.** One more call reads all the grades and lengths and suggests up to 3 changes. Nothing is changed automatically.`,
    ``,
    `**Learner types**`,
    ``,
    ...learners.map((l) => `- **${l.id}**: ${l.description}`),
    `- All learners are told to be honest: when a line is too fast or complex for their level, they say so instead of pretending to follow.`,
    ``,
    `**Reading the results**`,
    ``,
    `- The sample is small and the conversations are random, so expect grades to move by about half a point between runs with no changes. Look for problems that repeat, not single scores.`,
    `- The learner is simulated. It catches clear failures (switching to English, correcting speech-to-text noise, never recovering when the learner is lost) but is no substitute for talking to the characters yourself.`,
    `- To compare before and after a change, run both with the same \`--seed\` (same characters and learners) and compare the grades and length numbers. The learner's lines still vary between runs, so look at clear differences, not small ones.`,
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
  console.log(`Prompt version: ${promptVersion()}${LEVEL ? ` + level "${LEVEL}"` : ''} (content/${country}/prompts/character.md)${SEED !== undefined ? ` · seed ${SEED}` : ''}`);
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
        const stats = turnStats(transcript.filter((t) => t.who === 'npc').map((t) => t.transcript));
        results.push({ ...c, transcript, ...g, stats });
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
  // Seconds and the level in the name, so runs started together don't overwrite each other
  const file = join(dir, `${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}${LEVEL ? `-${LEVEL.replace(/\W+/g, '-').toLowerCase()}` : ''}.md`);
  writeFileSync(file, report(results, recs));
  // Machine-readable summary, for comparing runs before and after a change
  const okRuns = results.filter((r) => !r.error);
  writeFileSync(
    file.replace(/\.md$/, '.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        model: CLAUDE_MODEL,
        promptVersion: promptVersion(),
        level: LEVEL ?? null,
        seed: SEED ?? null,
        turns: TURNS,
        conversations: okRuns.length,
        grades: Object.fromEntries(
          (Object.keys(CRITERIA) as Criterion[]).map((k) => [k, okRuns.reduce((a, r) => a + r.scores[k], 0) / (okRuns.length || 1)])
        ),
        length: summarize(okRuns.flatMap((r) => (r.stats ? [r.stats] : []))),
        byCharacter: okRuns.map((r) => ({ id: r.character.id, learner: r.learner.id, overall: r.overall, stats: r.stats })),
      },
      null,
      2
    )
  );

  const ok = results.filter((r) => !r.error);
  const avg = ok.reduce((a, r) => a + r.overall, 0) / (ok.length || 1);
  const len = summarize(ok.flatMap((r) => (r.stats ? [r.stats] : [])));
  console.log(`\nGrade: ${avg.toFixed(1)}/10 · opener ${len.openerWords} words · median reply ${len.wordsMedian} · ${Math.round(len.longShare * 100)}% over ${LONG_TURN_WORDS} words`);
  console.log(`Report: ${file.replace(process.cwd() + '/', '')} (+ .json)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
