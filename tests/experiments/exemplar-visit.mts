// Card X1 (docs/prompt-trials.md, 2026-11-11; the queue row X1 in docs/prompt-testing.md): does one whole good
// visit, shown to the character, change how it talks? The model visit is Nunzio's (tests/experiments/exemplars/
// nunzio-palermo.json), given as one block at the end of the system prompt under one sentence. Josh judges by ear.
//   Arm A: today's prompt. Arm B: today's prompt plus the block. Nothing in lib/ or content/ changes.
// Three visits of six character turns (the opening and five replies), each arm played `takes` times, through the
// calls the game makes for an ordinary Intermediate visit (lib/conversation/take-turn.ts): runIntro for a fresh
// opening, then runTurn with the intro's beats as the brief, the shape note when a signal fires, and the done flag.
// Visit 1 replays Josh's own lines; in visits 2 and 3 a small call speaks the learner's side (the persona rates of
// automated-replies.mts with no answers offered), the same first line and the same seed of kinds in both arms.
//   npx tsx --env-file=.env.local tests/experiments/exemplar-visit.mts [--visits=3] [--takes=2] [--audio=1] [--label=x1]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runIntro } from '@/lib/intro';
import { runTurn } from '@/lib/turn';
import { pickShapes, noteOf, shapeIds, beatsBrief } from '@/lib/shapes';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { Laps } from '@/lib/timing';
import { getVoiceProvider } from '@/lib/voice/providers';
import { voiceForCharacter, DEFAULT_APP_SPEED } from '@/lib/voice/early-voice';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, pool, OUT, startTest } from './common.mjs';

startTest("X1 (2026-11-11): one whole good visit shown to the character (Nunzio's), against today's prompt, heard as pairs");

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const howManyVisits = Number(arg('visits', '3'));
const takes = Number(arg('takes', '2'));
const audio = arg('audio', '1') === '1';
const label = arg('label', 'x1');
/** Character turns kept: the opening and five replies */
const REPLIES = 5;
/** The learner's voice in the clips (ElevenLabs, the Italian "you" voice of the earlier listening pages) */
const LEARNER_VOICE = 'GcAgjAjkhWsmUd4GlPiv';

// The model visit, as the block: one sentence, then every line in Italian, marked by who spoke
const exemplar = JSON.parse(readFileSync(join(process.cwd(), 'tests', 'experiments', 'exemplars', 'nunzio-palermo.json'), 'utf8')) as { turns: { who: 'character' | 'learner'; text: string }[] };
const BLOCK = `A visit that went well, between Nunzio, a gardener in Palermo, and someone who stopped by:\n\n${exemplar.turns.map((t) => `${t.who === 'character' ? 'Nunzio' : 'Them'}: ${t.text}`).join('\n')}`;

interface VisitSpec { id: string; cityId: string; placeId: string; /** Josh's real visit: the archive conversation whose opening and first lines are replayed */ replay?: string }
const VISITS: VisitSpec[] = [
  { id: 'siena-pasticceria (Josh\'s visit, replayed)', cityId: 'siena', placeId: 'pasticceria-bini', replay: '5ac72bea' },
  { id: 'napoli-bar-nilo (fresh, something bought)', cityId: 'napoli', placeId: 'bar-nilo' },
  { id: 'matera-sassi-belvedere (fresh, another city)', cityId: 'matera', placeId: 'sassi-belvedere' },
].slice(0, howManyVisits);
/** The visit whose A is played a third time, for the noise pair (two takes of today's prompt) */
const NOISE_VISIT = VISITS[1] ?? VISITS[0];

/** A seeded random, so the learner's kinds replay (as automated-replies.mts) */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2 ** 32;
}
/** The auto responder's kinds with no answers offered (automated-replies.mts → PERSONAS.josh without back and edit) */
type Kind = 'own' | 'question' | 'english';
const RATES: Record<Kind, number> = { own: 0.25, question: 0.05, english: 0.1 };
function pickKind(r: () => number): Kind {
  const total = Object.values(RATES).reduce((a, b) => a + b, 0);
  let x = r() * total;
  for (const k of Object.keys(RATES) as Kind[]) if ((x -= RATES[k]) <= 0) return k;
  return 'own';
}
/** One small call for the learner's line, of that kind only, answering the character's last line; an Intermediate learner */
async function write(kind: Kind, lastLine: string): Promise<string> {
  const task = {
    own: `a short reply in ${language.name} (at most 12 words), the way an intermediate learner would say it, maybe with one small mistake`,
    question: `a short question in ${language.name} (at most 12 words) an intermediate learner might ask about what was just said`,
    english: `a short reply in English (at most 10 words), answering what was just said`,
  }[kind];
  return (await ask(`You are an intermediate learner of ${language.name}, talking with someone in ${language.card.country}. They just said:\n"${lastLine}"\n\nWrite only ${task}. Don't bring up a topic of your own. Reply with the line only, no quotes.`, { max: 600 })).replace(/^"|"$/g, '');
}

interface Row { visit: string; character: string; characterId: string; arm: 'A' | 'B'; take: number; turn: number; learnerSaid: string; kind: string; line: string; en: string; done?: boolean; shape?: string; ms: number; inputTokens?: number; error?: string }
interface Opening { line: string; en: string; beats?: string[]; from: 'intro' | 'recorded' }
const rows: Row[] = [];
const openings: Record<string, Opening> = {};
const firstLines: Record<string, string> = {};
const characters: Record<string, CharacterSheet> = {};
const t0 = Date.now();

await pool(VISITS.map((v) => async () => {
  const character = characterForVisit(v.cityId, v.placeId);
  if (!character) throw new Error(`nobody at ${v.cityId}/${v.placeId}`);
  characters[v.id] = character;
  // The opening, once, for both arms: the recorded one for Josh's visit, the game's intro for a fresh one
  let fixed: string[] | undefined;
  let opening: Opening;
  if (v.replay) {
    const archive = JSON.parse(readFileSync(join(homedir(), 'fuori-archive', 'conversations-2026-11-10.json'), 'utf8')) as { id: string; turns: { who: string; text: string; en?: string }[] }[];
    const c = archive.find((x) => x.id.startsWith(v.replay!));
    if (!c) throw new Error(`archive has no conversation ${v.replay}`);
    opening = { line: c.turns[0].text, en: c.turns[0].en ?? '', from: 'recorded' };
    fixed = c.turns.filter((t) => t.who === 'learner').slice(0, REPLIES).map((t) => t.text);
  } else {
    const intro = await runIntro({ character, answers: false });
    opening = { line: intro.line, en: intro.en, beats: intro.beats, from: 'intro' };
  }
  openings[v.id] = opening;
  // The kinds of the learner's lines, the same in both arms and both takes; the first line is written once
  const r = rng(`${label}|${v.id}`);
  const kinds = Array.from({ length: REPLIES }, () => pickKind(r));
  const first = fixed ? fixed[0] : await write(kinds[0], opening.line);
  firstLines[v.id] = first;
  const brief = (arm: 'A' | 'B') => [beatsBrief(opening.beats), arm === 'B' ? BLOCK : ''].filter(Boolean).join('\n\n') || undefined;

  // The noise visit gets one more take of A, so the noise pair shares no clip with a real pair
  const takesOf = (arm: 'A' | 'B') => takes + (arm === 'A' && takes >= 2 && v.id === NOISE_VISIT.id ? 1 : 0);
  await pool((['A', 'B'] as const).flatMap((arm) => Array.from({ length: takesOf(arm) }, (_, k) => async () => {
    const transcript: Turn[] = [{ who: 'npc', transcript: opening.line, translation: opening.en, ...(opening.beats ? { beats: opening.beats } : {}) }];
    let lastLine = opening.line;
    for (let i = 0; i < REPLIES; i++) {
      const learnerSaid = fixed ? fixed[i] : i === 0 ? first : await write(kinds[i], lastLine);
      const npcTurns = transcript.filter((t) => t.who === 'npc').length;
      const shapes = pickShapes({ learnerSaid, beats: opening.beats, turnAfterIntro: npcTurns, beginner2: false });
      const row: Row = { visit: v.id, character: character.name, characterId: character.id, arm, take: k + 1, turn: i + 1, learnerSaid, kind: fixed ? 'josh' : kinds[i], line: '', en: '', shape: shapeIds(shapes), ms: 0 };
      rows.push(row);
      const laps = new Laps();
      const started = performance.now();
      try {
        const reply = await runTurn({ character, transcript, learnerSaid, brief: brief(arm), note: noteOf(shapes), withDone: true, laps });
        row.ms = Math.round(performance.now() - started);
        row.inputTokens = Number(laps.facts.inputTokens) || undefined;
        row.line = reply.line.trim();
        row.en = reply.en.trim();
        row.done = reply.done === true;
      } catch (e) {
        row.error = String(e).slice(0, 200);
        console.log(`turn failed: ${character.name} ${arm}${k + 1} t${i + 1}: ${row.error}`);
        return;
      }
      transcript.push({ who: 'learner', transcript: learnerSaid }, { who: 'npc', transcript: row.line, translation: row.en });
      lastLine = row.line;
      // The game would close the visit here; the run goes on in both arms and the turn is marked (the card's guard)
    }
  })), 5);
}), 3);

// ---- Counts (guards; they never decide the question)
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.trim().split(/(?<=[.!?…]["'»”’)]*)\s+/).map((x) => x.trim()).filter(Boolean);
const isQuestion = (s: string) => /\?["'»”’)]*$/.test(s.trim());
const THINGS = ['fico', 'fichi', 'radici', 'Australia', 'Ottocento', 'Steri', 'Inquisizione', 'Vucciria', 'milza', 'meusa', 'strutto', 'sesamo', 'giardiniere', 'vecchietti', 'panchine', 'nonno', 'San Francisco', 'Palermo', 'Nunzio', 'Joshua'];
const PHRASES = ['Ma guarda', 'buon orecchio', 'lo dico sempre', 'parla benissimo', 'Non si scusi', 'Certo che lo conosco', 'ne sono sicuro', 'Mi dica una cosa'];
const has = (text: string, item: string) => new RegExp(`(^| )${norm(item)}( |$)`).test(norm(text));
/** The list words already in a visit's own material (the character's prompt, the opening, the learner's lines): left out for that visit (rule 9) */
const excluded: Record<string, string[]> = {};
for (const v of VISITS) {
  const character = characters[v.id];
  const own = [buildTurnPrompt({ character, transcript: [] }).system, openings[v.id].line, ...rows.filter((r) => r.visit === v.id).map((r) => r.learnerSaid)].join(' ');
  excluded[v.id] = THINGS.filter((x) => has(own, x));
}
const ok = rows.filter((r) => !r.error && r.line);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
const thingsIn = (r: Row) => THINGS.filter((x) => !excluded[r.visit].includes(x) && has(r.line, x));
const phrasesIn = (r: Row) => PHRASES.filter((x) => has(r.line, x));
const afterQuestion = (line: string) => { const s = sentences(line); const i = s.findIndex(isQuestion); return i >= 0 && i < s.length - 1; };
const summary = (arm: 'A' | 'B', only: (r: Row) => boolean = () => true) => {
  const xs = ok.filter((r) => r.arm === arm && only(r));
  const withThings = xs.filter((r) => thingsIn(r).length);
  const withPhrases = xs.filter((r) => phrasesIn(r).length);
  return {
    turns: xs.length,
    nunzioThings: `${withThings.length} turns${withThings.length ? ` (${[...new Set(withThings.flatMap(thingsIn))].join(', ')})` : ''}`,
    nunzioPhrases: `${withPhrases.length} turns${withPhrases.length ? ` (${[...new Set(withPhrases.flatMap(phrasesIn))].join(', ')})` : ''}`,
    endOnStatement: xs.filter((r) => !isQuestion(sentences(r.line).at(-1) ?? '')).length,
    wordsAfterQuestion: xs.filter((r) => afterQuestion(r.line)).length,
    twoQuestions: xs.filter((r) => sentences(r.line).filter(isQuestion).length >= 2).length,
    wordsATurn: mean(xs.map((r) => words(r.line))).toFixed(1),
    medianMs: median(xs.map((r) => r.ms)),
    inputTokens: Math.round(mean(xs.map((r) => r.inputTokens ?? 0))),
    doneEarly: xs.filter((r) => r.done && r.turn < REPLIES).length,
  };
};
const replayed = (r: Row) => VISITS.find((v) => v.id === r.visit)?.replay !== undefined;
const counts = {
  A: summary('A'), B: summary('B'),
  'A, visit 1 (replayed, no beats)': summary('A', replayed), 'B, visit 1 (replayed, no beats)': summary('B', replayed),
  'A, visits 2-3': summary('A', (r) => !replayed(r)), 'B, visits 2-3': summary('B', (r) => !replayed(r)),
  'A take 1': summary('A', (r) => r.take === 1), 'A take 2': summary('A', (r) => r.take === 2),
};
console.log(`X1 · ${label} · ${language.name} · ${ok.length}/${rows.length} turns in ${Math.round((Date.now() - t0) / 1000)} s · the block is ${words(BLOCK)} words`);
for (const [name, c] of Object.entries(counts)) console.log(`  ${name}: ${JSON.stringify(c)}`);
for (const v of VISITS) console.log(`  ${v.id}: opening from the ${openings[v.id].from}${openings[v.id].beats ? `, beats: ${openings[v.id].beats!.join('; ')}` : ''}; list words left out: ${excluded[v.id].join(', ') || 'none'}`);

// ---- The clips for Josh: per visit the opening once, then take 1 of A and of B as a pair, sides shuffled; one noise pair (A take 1, A take 2)
const dir = join(OUT, `exemplar-visit-${label}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`);
mkdirSync(dir, { recursive: true });
let seed = 41;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const run = (visit: string, arm: 'A' | 'B', take: number) => ok.filter((r) => r.visit === visit && r.arm === arm && r.take === take).sort((a, b) => a.turn - b.turn);
interface Pair { visit: string; first: Row[]; second: Row[]; firstIs: string; secondIs: string }
const pairs: Pair[] = [];
for (const v of VISITS) {
  const a = run(v.id, 'A', 1);
  const b = run(v.id, 'B', 1);
  if (!a.length || !b.length) continue;
  const flip = rnd() < 0.5;
  pairs.push({ visit: v.id, first: flip ? b : a, second: flip ? a : b, firstIs: flip ? 'B (visit shown)' : 'A (today)', secondIs: flip ? 'A (today)' : 'B (visit shown)' });
}
// The noise pair: takes 2 and 3 of today's prompt on the noise visit; neither is in a real pair
if (run(NOISE_VISIT.id, 'A', 2).length && run(NOISE_VISIT.id, 'A', 3).length) pairs.push({ visit: NOISE_VISIT.id, first: run(NOISE_VISIT.id, 'A', 2), second: run(NOISE_VISIT.id, 'A', 3), firstIs: 'A (today), take 2 (noise pair)', secondIs: 'A (today), take 3 (noise pair)' });
for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }

const key: { clip: string; what: string; visit: string }[] = [];
let listen = `# Listen, don't read\n\n${pairs.length} pairs. For each: play the opening, then the first clip, then the second. Each clip is the next five exchanges of the same visit.\n\nFor each pair:\n1. Do the two sound different in how the character talks: yes, a little, no?\n2. Which would you rather have had: first, second, same?\n3. Anything that sounded out of place or borrowed?\n\n`;
let text = `# The text of the clips (for Claude's read; Josh listens first)\n\n`;
const jobs: { file: string; segments: { text: string; voice?: string; characterId?: string }[] }[] = [];
const openingFile = (visit: string) => `opening-${VISITS.findIndex((v) => v.id === visit) + 1}.mp3`;
for (const v of VISITS) jobs.push({ file: openingFile(v.id), segments: [{ text: openings[v.id].line, voice: voiceForCharacter(characters[v.id].id), characterId: characters[v.id].id }] });
pairs.forEach((p, i) => {
  const n = i + 1;
  const character = characters[p.visit];
  const segs = (xs: Row[]) => xs.flatMap((r) => [{ text: r.learnerSaid, voice: LEARNER_VOICE }, { text: r.line, voice: voiceForCharacter(character.id), characterId: character.id }]);
  jobs.push({ file: `pair-${n}-first.mp3`, segments: segs(p.first) }, { file: `pair-${n}-second.mp3`, segments: segs(p.second) });
  key.push({ clip: `pair-${n}-first`, what: p.firstIs, visit: p.visit }, { clip: `pair-${n}-second`, what: p.secondIs, visit: p.visit });
  listen += `- Pair ${n} (${character.name}): ${openingFile(p.visit)}, then pair-${n}-first.mp3, then pair-${n}-second.mp3\n`;
  const lines = (xs: Row[]) => xs.map((r) => `- *${r.learnerSaid}*\n- **${character.name}:** ${r.line}${r.done ? ' (done)' : ''}`).join('\n');
  text += `## Pair ${n}: ${p.visit}\n\nOpening: ${openings[p.visit].line}\n\n**First (${p.firstIs})**\n${lines(p.first)}\n\n**Second (${p.secondIs})**\n${lines(p.second)}\n\n`;
});
writeFileSync(join(dir, 'listen.md'), listen);
writeFileSync(join(dir, 'text.md'), text);
writeFileSync(join(dir, 'key.json'), JSON.stringify(key, null, 1));
writeFileSync(join(dir, 'rows.json'), JSON.stringify({ label, block: BLOCK, visits: VISITS, openings, firstLines, excluded, counts, rows }, null, 1));
console.log(`  ${pairs.length} pairs listed in ${dir}/listen.md (text.md and key.json are held back: Josh gets listen.md and the mp3s only)`);

if (audio) {
  const provider = getVoiceProvider();
  const parts = join(dir, 'parts');
  mkdirSync(parts, { recursive: true });
  const gap = join(parts, 'gap.mp3');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '0.7', '-c:a', 'libmp3lame', '-b:a', '96k', gap]);
  let made = 0;
  await pool(jobs.map((job, j) => async () => {
    try {
      const files: string[] = [];
      for (const [k, s] of job.segments.entries()) {
        if (!s.text.trim()) continue;
        const out = await provider.synthesize({ text: s.text, language: language.code, voice: s.voice, ...(s.characterId ? { characterId: s.characterId } : {}), speed: DEFAULT_APP_SPEED });
        if (!out.audio) throw new Error('no audio');
        const f = join(parts, `${j}-${String(k).padStart(2, '0')}.mp3`);
        writeFileSync(f, out.audio);
        files.push(f);
      }
      const list = join(parts, `${j}.txt`);
      writeFileSync(list, files.map((f) => `file '${f}'\nfile '${gap}'\n`).join(''));
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c:a', 'libmp3lame', '-b:a', '96k', join(dir, job.file)]);
      made++;
    } catch (e) { console.log(`audio failed ${job.file}: ${String(e).slice(0, 120)}`); }
  }), 3);
  console.log(`  audio: ${made} of ${jobs.length} clips in ${dir}`);
}
