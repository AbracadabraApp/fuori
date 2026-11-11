// The connection test for Level 1 on the Intermediate reply (scaffolding.md "Level: 1" 2026-11-10s, answers 2026-11-11a): the exact call
// take-turn makes for Beginner 2 cluster 1 (runTurn with the cluster-1 brief, the setup line and the answers), two turns each, printed.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/b2-frame-line-live.mts [--characters=4]
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, cluster1Brief, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import type { Turn } from '@/lib/types';
import { ask } from './common.mjs';
const howMany = Number(process.argv.find((a) => a.startsWith('--characters='))?.split('=')[1] ?? '4');
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const spansSchema = { type: 'object', additionalProperties: false, required: ['spans'], properties: { spans: { type: 'array', items: { type: 'string' } } } };
let total = 0, inLang = 0, runs = 0, single = 0, turns = 0, echoed = 0, withAnswers = 0;
for (const { city, place } of chosen) {
  const character = characterForVisit(city.id, place.id)!;
  const transcript: Turn[] = [];
  let learnerSaid: string | undefined;
  for (let turn = 0; turn < 2; turn++) {
    const t0 = performance.now();
    const setup = pickSetup({ conversationId: `${character.id}-live`, turn, learnerId: null, characterId: character.id, learnerSaid }, CLUSTER_1);
    const r0 = await runTurn({ character, transcript, learnerSaid, brief: cluster1Brief(), note: setupLine(setup), answers: setup.maxAnswers > 0, withDone: true });
    const r = lineWithAnswers(r0, setup);
    withAnswers += r.parts.length === 2 ? 1 : 0;
    const spans = (JSON.parse(await ask(`Copy out every run of ${language.name} words in this line, one string per run, exactly as written (English runs left out):\n${r.line}`, { schema: spansSchema, max: 1200 })) as { spans: string[] }).spans;
    total += words(r.line); inLang += spans.reduce((n, s) => n + words(s), 0); runs += spans.length; single += spans.filter((s) => words(s) === 1).length; turns++;
    const sentences = r.line.split(/(?<=[.!?…])\s+/);
    if (sentences.length >= 2 && /\?$/.test(sentences.at(-1)!) && /\?["'»”’)]*$/.test(sentences.at(-2)!)) echoed++;
    console.log(`\n## ${character.name} t${turn} (${setup.id}) ${Math.round(performance.now() - t0)} ms\n${r.line}\n${language.name}: ${spans.join(' · ')}\nanswers: ${r.parts.map((a) => `${a.text} (${a.en})`).join(' | ') || 'none'}`);
    if (learnerSaid) transcript.push({ who: 'learner', transcript: learnerSaid });
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    learnerSaid = turn === 0 ? (await ask(`You are a beginner learner of ${language.name}, in ${language.card.country}. They just said:\n"${r.line}"\n\nWrite only a short reply in very simple ${language.name} (at most 6 words), the way a beginner would. Reply with the line only, no quotes.`, { max: 100 })).replace(/^"|"$/g, '') : learnerSaid;
  }
}
console.log(`\n${language.name} ${(100 * inLang / total).toFixed(0)}% of words; ${(runs / turns).toFixed(1)} runs a turn, ${single} of ${runs} a single word; question followed by an English question: ${echoed} of ${turns}; two answers to say back: ${withAnswers} of ${turns}`);
