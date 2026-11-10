// Card B2-E5 (docs/prompt-trials.md, 2026-11-10; docs/summary-and-mixed.md): two ways to get away from English
// after every sentence, each made to be HEARD by Josh (Josh: "Reading is probably 20% the fidelity of hearing").
//   Arm S (summary): the Intermediate turn exactly as it is ({ line, en }, one string). Code ends a stretch of her
//     talk past 20 words or at 2 sentences (Josh's guess), and a separate, test-only prompt writes one English
//     remark per stretch. Each turn becomes two clips with the same Spanish: English after every sentence
//     (today's shape, from her `en`) and the summaries. A closing question keeps its full English in both.
//   Arm M (mixed): the Intermediate turn plus one level block describing her English as a thought of her own
//     inside her line (Josh's two good examples). One clip a turn, as she wrote it.
// Nothing in lib/ or content/ changes. Not run when written (cloud session, no keys): not verified.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/summary-mixed.mts [--characters=4] [--audio=1] [--label=name]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { getVoiceProvider } from '@/lib/voice/providers';
import { voiceForCharacter, DEFAULT_APP_SPEED } from '@/lib/voice/early-voice';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask, pool, OUT, startTest } from './common.mjs';

startTest('B2-E5 (2026-11-10): a summary after a stretch of her talk, and an English thought inside her line, each heard against today');
const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const howMany = Number(arg('characters', '4'));
const audio = arg('audio', '1') === '1';
const label = arg('label', 'b2e5');

/** Josh's guess (2026-11-10): more than 20 words needs a summary; no more than 2 sentences */
const MAX_WORDS = 20;
const MAX_SENTENCES = 2;
/** How fast she talks, to set the summary call's time against the stretch it follows (an estimate, not the clip's length) */
const WORDS_A_SECOND = 2.3;

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
/** Sentences by their closing punctuation, any language */
const sentences = (s: string) => s.trim().split(/(?<=[.!?…]["'»”’)]*)\s+/).map((x) => x.trim()).filter(Boolean);
const isQuestion = (s: string) => /\?["'»”’)]*$/.test(s.trim());

/** Her line as statements and a closing question, with the question's English when her `en` ends on one too */
function shape(line: string, en: string) {
  const l = sentences(line);
  const e = sentences(en);
  const question = l.length && isQuestion(l[l.length - 1]) ? l[l.length - 1] : '';
  const questionEn = question && e.length && isQuestion(e[e.length - 1]) ? e[e.length - 1] : '';
  const statements = question ? l.slice(0, -1) : l;
  const statementsEn = questionEn ? e.slice(0, -1) : e;
  return { statements, statementsEn, question, questionEn, aligned: statements.length === statementsEn.length };
}

/** Stretches of her statements: one ends past MAX_WORDS or at MAX_SENTENCES, whichever comes first */
function stretches(statements: string[]): { text: string; closedBy: 'words' | 'sentences' | 'end' }[] {
  const out: { text: string; closedBy: 'words' | 'sentences' | 'end' }[] = [];
  let cur: string[] = [];
  for (const s of statements) {
    cur.push(s);
    const over = words(cur.join(' ')) > MAX_WORDS;
    if (over || cur.length === MAX_SENTENCES) { out.push({ text: cur.join(' '), closedBy: over ? 'words' : 'sentences' }); cur = []; }
  }
  if (cur.length) out.push({ text: cur.join(' '), closedBy: 'end' });
  return out;
}

// Josh's wording (2026-11-10): "Summarize in one sentence with the fewest words". Kept bare on purpose: a correcting
// phrase in a prompt tends to become the behaviour (Josh: "Correcting words can lead to inclusion"), so nothing is
// allowed or forbidden here until the clips show a fault
const SUMMARY = `A local has just said this in ${language.name} to someone who is starting to learn it. Summarize each numbered stretch in one sentence of English with the fewest words.

Reply with JSON: { "summaries": ["...", ...] }, one for each stretch, in order.`;
const summarySchema = { type: 'object', additionalProperties: false, required: ['summaries'], properties: { summaries: { type: 'array', items: { type: 'string' } } } };

async function summarize(character: CharacterSheet, parts: string[], english: string): Promise<{ summaries: string[]; ms: number }> {
  const t = performance.now();
  const content = `She is ${character.name}, ${character.role} in ${character.city}.\n\nWhat she said, in stretches:\n${parts.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nIts literal English, for you only:\n${english}`;
  const r = JSON.parse(await ask(content, { system: SUMMARY, schema: summarySchema, max: 600 })) as { summaries: string[] };
  return { summaries: r.summaries.map((s) => s.trim()), ms: Math.round(performance.now() - t) };
}

/** Arm M's level block: her English as a thought of her own inside her line (Josh, 2026-11-10: a thought, not a label) */
const examples = language.card.country === 'Mexico'
  ? ['"Mi abuelo, he was a stubborn man, boleaba aquí."', '"El Andador es el corazón de la ciudad, the heart of the city."']
  : ['"Mio nonno, he was a stubborn man, lavorava qui."', '"Il Corso è il cuore della città, the heart of the city."'];
const MIXED = `The person in front of you is at the very start of ${language.name}. You know some English, and with them it comes out now and then inside what you say: a thought of your own in English in the middle of a ${language.name} sentence, and then you carry on in ${language.name}. Like ${examples[0]} or ${examples[1]} The English says something; it is never just the English name of a thing you mentioned.`;

/** The learner's reply: one small call, a beginner's own short words (as tests/experiments/automated-replies.mts → write) */
async function learnerReply(lastLine: string): Promise<string> {
  return (await ask(`You are a beginner learner of ${language.name}, talking with someone in ${language.card.country}. They just said:\n"${lastLine}"\n\nWrite only a short reply in very simple ${language.name} (at most 6 words), the way a beginner would say it. Don't bring up a topic of your own. Reply with the line only, no quotes.`, { max: 100 })).replace(/^"|"$/g, '');
}

interface Row {
  arm: 'S' | 'M';
  character: string;
  characterId: string;
  turn: number;
  learnerSaid?: string;
  line: string;
  en: string;
  /** Arm S: what is spoken in each clip */
  literal?: string;
  summary?: string;
  stretches?: { text: string; closedBy: string; summary: string }[];
  aligned?: boolean;
  ms?: number;
  /** Arm M: her line, and her question's English when there is one */
  spoken?: string;
  error?: string;
}
const rows: Row[] = [];

// The characters: the first places with a person, spread across cities (as automated-replies.mts)
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);

// Two at a time, so the summary call's time isn't the queue's (B2-E4's p90 of 28 s came with 6 at once)
await pool(chosen.flatMap(({ city, place }) => (['S', 'M'] as const).map((arm) => async () => {
  const character = characterForVisit(city.id, place.id);
  if (!character) return;
  const transcript: Turn[] = [];
  let learnerSaid: string | undefined;
  for (let turn = 0; turn < 2; turn++) {
    const row: Row = { arm, character: character.name, characterId: character.id, turn, learnerSaid, line: '', en: '' };
    rows.push(row);
    try {
      const reply = await runTurn({ character, transcript, learnerSaid, ...(arm === 'M' ? { level: MIXED } : {}) });
      row.line = reply.line.trim();
      row.en = reply.en.trim();
      const sh = shape(row.line, row.en);
      const tail = [sh.question, sh.questionEn].filter(Boolean).join(' ');
      if (arm === 'M') {
        // As she wrote it; a closing question keeps its full English (Josh: "If the final phrase is a question I'd translate the whole thing")
        row.spoken = [sh.statements.join(' '), tail].filter(Boolean).join(' ');
      } else {
        row.aligned = sh.aligned;
        const st = stretches(sh.statements);
        if (st.length) {
          const s = await summarize(character, st.map((x) => x.text), sh.statementsEn.join(' '));
          row.ms = s.ms;
          row.stretches = st.map((x, i) => ({ ...x, summary: s.summaries[i] ?? '' }));
          row.summary = [...row.stretches.map((x) => `${x.text} ${x.summary}`), tail].filter(Boolean).join(' ');
        } else {
          row.stretches = [];
          row.summary = tail;
        }
        // Today's shape: each sentence, then its English. Only when her `en` has a sentence for each of hers
        if (sh.aligned) row.literal = [...sh.statements.map((x, i) => `${x} ${sh.statementsEn[i]}`), tail].filter(Boolean).join(' ');
      }
      if (learnerSaid) transcript.push({ who: 'learner', transcript: learnerSaid });
      transcript.push({ who: 'npc', transcript: row.line, translation: row.en });
      if (turn === 0) learnerSaid = await learnerReply(row.line);
    } catch (e) {
      row.error = String(e).slice(0, 200);
      console.log(`turn failed: ${character.name} ${arm} t${turn}: ${row.error}`);
      return;
    }
  }
})), 2);

const ok = rows.filter((r) => !r.error && r.line);
const S = ok.filter((r) => r.arm === 'S');
const M = ok.filter((r) => r.arm === 'M');
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const allStretches = S.flatMap((r) => r.stretches ?? []);
const spanish = allStretches.reduce((n, x) => n + words(x.text), 0);
const english = allStretches.reduce((n, x) => n + words(x.summary), 0);
const closed = (by: string) => allStretches.filter((x) => x.closedBy === by).length;
/** Her words kept in a summary: its words that are in the stretch (4 letters or more, so not "a", "de", "no") */
const keptWords = (x: { text: string; summary: string }) => { const hers = new Set(norm(x.text).split(' ').filter((w) => w.length >= 4)); return norm(x.summary).split(' ').filter((w) => hers.has(w)).length; };
const timed = S.filter((r) => r.ms && r.stretches?.length);
const inTime = timed.filter((r) => r.ms! / 1000 <= words(r.stretches![0].text) / WORDS_A_SECOND).length;
const ms = timed.map((r) => r.ms!).sort((a, b) => a - b);

console.log(`summary and mixed · ${label} · ${language.name} · ${ok.length}/${rows.length} turns`);
console.log(`Arm S (summary), ${S.length} turns:`);
console.log(`  stretches: ${allStretches.length} (${(allStretches.length / (S.length || 1)).toFixed(1)} a turn); closed by more than ${MAX_WORDS} words ${closed('words')}, by ${MAX_SENTENCES} sentences ${closed('sentences')}, by the end of her talk ${closed('end')}`);
console.log(`  English against ${language.name} on her statements (ratio of totals): ${spanish ? (english / spanish).toFixed(2) : 'n/a'} (${english} over ${spanish} words; Josh's guess 0.5–0.7, under 0.3 is too little)`);
console.log(`  stretches with a summary longer than the stretch: ${allStretches.filter((x) => words(x.summary) > words(x.text)).length} of ${allStretches.length}`);
console.log(`  summary length: ${mean(allStretches.map((x) => words(x.summary))).toFixed(1)} words a stretch; of one or two words ${allStretches.filter((x) => words(x.summary) <= 2).length} of ${allStretches.length}`);
console.log(`  her words kept in the summary: ${mean(allStretches.map(keptWords)).toFixed(1)} a stretch; stretches with none ${allStretches.filter((x) => keptWords(x) === 0).length} of ${allStretches.length}`);
console.log(`  summary call (the game's model, 2 at once): median ${ms[Math.floor(ms.length / 2)] ?? 'n/a'} ms, slowest ${ms[ms.length - 1] ?? 'n/a'} ms; ready before she finishes her first stretch (at ${WORDS_A_SECOND} words a second): ${inTime} of ${timed.length}`);
console.log(`  turns where her English didn't line up sentence for sentence (no literal clip, pair left out): ${S.filter((r) => !r.aligned).length} of ${S.length}`);
console.log(`  words a line: ${mean(S.map((r) => words(r.line))).toFixed(1)}`);
console.log(`Arm M (mixed), ${M.length} turns:`);
console.log(`  words a line: ${mean(M.map((r) => words(r.line))).toFixed(1)} (Arm S ${mean(S.map((r) => words(r.line))).toFixed(1)})`);
console.log(`  copy guard (one of the two example lines): ${M.filter((r) => /stubborn man|heart of the city/i.test(r.line)).length} of ${M.length}`);

// The clips for Josh: Arm S as pairs (the same Spanish, sides shuffled, the key held back), Arm M one each
const dir = join(OUT, `summary-mixed-${label}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`);
mkdirSync(dir, { recursive: true });
let seed = 29;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pairs = S.filter((r) => r.literal && r.summary && r.stretches?.length).map((r) => ({ r, flip: rnd() < 0.5 }));
const clips: { file: string; text: string; characterId: string }[] = [];
const key: { clip: string; what: string; character: string; turn: number }[] = [];
let listen = `# Listen, don't read\n\n${language.name} only by ear: play each clip without looking at any text.\n\n## Summary: ${pairs.length} pairs\n\nThe ${language.name} is the same in both clips of a pair. For each pair: could you follow clip 1? Clip 2? Which would you rather hear?\n\n`;
let text = `# The text of the clips (for Claude's read; Josh listens first)\n\n`;
pairs.forEach((p, i) => {
  const n = String(i + 1).padStart(2, '0');
  const one = p.flip ? p.r.summary! : p.r.literal!;
  const two = p.flip ? p.r.literal! : p.r.summary!;
  clips.push({ file: `s-${n}-1.mp3`, text: one, characterId: p.r.characterId }, { file: `s-${n}-2.mp3`, text: two, characterId: p.r.characterId });
  key.push({ clip: `s-${n}-1`, what: p.flip ? 'summary' : 'literal', character: p.r.character, turn: p.r.turn }, { clip: `s-${n}-2`, what: p.flip ? 'literal' : 'summary', character: p.r.character, turn: p.r.turn });
  listen += `- Pair ${i + 1}: s-${n}-1.mp3, then s-${n}-2.mp3\n`;
  text += `## Pair ${i + 1} (${p.r.character}, turn ${p.r.turn}${p.r.learnerSaid ? `, after "${p.r.learnerSaid}"` : ''})\n**1.** ${one}\n\n**2.** ${two}\n\n`;
});
listen += `\n## Mixed: ${M.length} clips\n\nFor each: is there a thought of hers in English, or only the English name of a thing? Does the switch inside the sentence sound like a person?\n\n`;
M.forEach((r, i) => {
  const n = String(i + 1).padStart(2, '0');
  clips.push({ file: `m-${n}.mp3`, text: r.spoken!, characterId: r.characterId });
  key.push({ clip: `m-${n}`, what: 'mixed', character: r.character, turn: r.turn });
  listen += `- m-${n}.mp3\n`;
  text += `## Mixed ${i + 1} (${r.character}, turn ${r.turn}${r.learnerSaid ? `, after "${r.learnerSaid}"` : ''})\n${r.spoken}\n\n`;
});
writeFileSync(join(dir, 'listen.md'), listen);
writeFileSync(join(dir, 'text.md'), text);
writeFileSync(join(dir, 'key.json'), JSON.stringify(key, null, 1));
writeFileSync(join(dir, 'rows.json'), JSON.stringify({ label, summaryPrompt: SUMMARY, mixedBlock: MIXED, maxWords: MAX_WORDS, maxSentences: MAX_SENTENCES, rows }, null, 1));
console.log(`  ${pairs.length} summary pairs and ${M.length} mixed clips listed in ${dir}/listen.md (text and key held back)`);

if (audio) {
  const provider = getVoiceProvider();
  let made = 0;
  for (const c of clips) {
    try {
      const out = await provider.synthesize({ text: c.text, language: language.code, characterId: c.characterId, voice: voiceForCharacter(c.characterId), speed: DEFAULT_APP_SPEED });
      if (out.audio) { writeFileSync(join(dir, c.file), out.audio); made++; }
    } catch (e) { console.log(`audio failed ${c.file}: ${String(e).slice(0, 100)}`); }
  }
  console.log(`  audio: ${made} of ${clips.length} clips in ${dir}`);
}
