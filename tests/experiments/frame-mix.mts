// A list to look at, not a card and not game play (Josh, 2026-11-10: "Lets just look at a list"): the mixed idea
// redone from the code-switching research (Poplack's equivalence constraint: switch at clause and phrase edges;
// Myers-Scotton's matrix language: the frame language carries comprehension; Butzkamm's sandwich: L2, L1, L2).
//   F1: English frame, Spanish slotted in as whole phrases and one short clause said twice (cluster-1 idea)
//   F2: half and half, Spanish clause then English clause at the boundary, a tag in Spanish (middle-cluster idea)
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/frame-mix.mts [--characters=4]
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import type { Turn } from '@/lib/types';
import { ask } from './common.mjs';

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const howMany = Number(arg('characters', '4'));
const L = language.name;

const BRIEFS = {
  // The sandwich (say it, give its English, say it again) was in the first run and fired on 4 of 8 turns; Josh: "seems weird". Out
  F1: `The person in front of you has no ${L} yet. You are a bilingual local, so with them you talk mostly in English, the way you would to a visitor, and you put the ${L} in where it fits: the names of things, set phrases, and the short ${L} sentence that matters, with its English beside it. Like: "Mire, that's el comal, the griddle, that's where I put them. ¿Quiere una? Want one?" You are still yourself, here, doing what you do. One question at the end, in ${L}, with its English.`,
  F2: `The person in front of you is at the start of ${L}. You are a bilingual local, and with them you switch languages the way bilinguals do: a whole clause in ${L}, then a whole clause in English, never a lone English word dropped into a ${L} sentence. The switch comes where a clause ends, often on a word like "so", "pero", "and", and you keep the warm words and tags in ${L} ("¿sabe?", "mire", "¿verdad?"). Like: "Mi abuelo boleaba aquí, so he taught me everything, ¿sabe?" About half of what you say is English. One question at the end, in ${L}.`,
};

async function learnerReply(lastLine: string): Promise<string> {
  return (await ask(`You are a beginner learner of ${L}, in ${language.card.country}. They just said:\n"${lastLine}"\n\nWrite only a short reply in very simple ${L} (at most 6 words), the way a beginner would. Reply with the line only, no quotes.`, { max: 100 })).replace(/^"|"$/g, '');
}

// Spanish share, by a cheap tell: words with ñ, accents, or ¿¡, plus words in the literal `en` that don't appear... too clever;
// instead ask one small judge call per line to mark the Spanish spans, and count from that
const spansSchema = { type: 'object', additionalProperties: false, required: ['spans'], properties: { spans: { type: 'array', items: { type: 'string' } } } };
async function spanishSpans(line: string): Promise<string[]> {
  const r = JSON.parse(await ask(`Copy out every run of ${L} words in this line, one string per run, exactly as written (English runs left out):\n${line}`, { schema: spansSchema, max: 400 })) as { spans: string[] };
  return r.spans;
}
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);

const only = arg('only', '');
for (const key of (['F1', 'F2'] as const).filter((k) => !only || k === only)) {
  console.log(`\n# ${key}\n`);
  let total = 0, spanish = 0, single = 0, runs = 0;
  for (const { city, place } of chosen) {
    const character = characterForVisit(city.id, place.id)!;
    const transcript: Turn[] = [];
    let learnerSaid: string | undefined;
    for (let turn = 0; turn < 2; turn++) {
      const r = await runTurn({ character, transcript, learnerSaid, brief: BRIEFS[key] });
      const spans = await spanishSpans(r.line);
      total += words(r.line); spanish += spans.reduce((n, s) => n + words(s), 0); runs += spans.length; single += spans.filter((s) => words(s) === 1).length;
      console.log(`**${character.name}**${learnerSaid ? ` (after "${learnerSaid}")` : ''}: ${r.line}\n`);
      if (learnerSaid) transcript.push({ who: 'learner', transcript: learnerSaid });
      transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
      if (turn === 0) learnerSaid = await learnerReply(r.line);
    }
  }
  console.log(`_${key}: ${L} ${(100 * spanish / total).toFixed(0)}% of words; ${runs} ${L} runs, ${single} of them a single word_`);
}
