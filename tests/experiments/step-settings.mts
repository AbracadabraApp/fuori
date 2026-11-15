// Card S1 (docs/prompt-trials.md): Beginner steps 1 to 3 as settings in code. Plays short visits from the opener at
// each step as take-turn does (the shared level text, the setup drawn for the turn, the line put together by the
// step's setting), the learner saying the first offered answer. Prints, per step: the language's share (the rough
// count of lib/dialogue/share.ts, as the walk), words a turn, how many turns kept the format (every sentence in
// braces, nothing outside, a phrase marked), and a few turns to read.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/step-settings.mts <city> <place>... [--turns=5]
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, frameBrief, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import { SETTINGS, saySentences, englishOf, seedOf } from '@/lib/dialogue/pieces';
import { languageShare } from '@/lib/dialogue/share';
import type { Turn } from '@/lib/types';

const args = process.argv.slice(2);
const turns = Number(args.find((a) => a.startsWith('--turns='))?.slice(8) ?? 5);
const [city, ...places] = args.filter((a) => !a.startsWith('--'));
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

type Row = { step: number; place: string; raw: string; line: string; en: string; setup: string; answers: number };
const rows: Row[] = [];
await Promise.all([1, 2, 3].flatMap((step) => places.map(async (place) => {
  const cluster = CLUSTERS[step - 1];
  const setting = SETTINGS[step - 1]!;
  const character = characterForVisit(city, place)!;
  const transcript: Turn[] = [];
  let said: string | undefined;
  for (let t = 0; t < turns; t++) {
    const conversationId = `s1-${step}-${place}`;
    const setup = pickSetup({ conversationId, turn: t, learnerId: 'card-s1', characterId: character.id, learnerSaid: said }, cluster);
    const raw = await runTurn({ character, transcript, learnerSaid: said, brief: frameBrief(cluster), note: setupLine(setup), answers: setup.maxAnswers > 0, withDone: true });
    const braced = /\{[^{}]*\|[^{}]*\}/.test(raw.line);
    const r = lineWithAnswers({ ...raw, line: saySentences(raw.line, setting, seedOf(`${conversationId}:${t}`)), ...(braced ? { en: englishOf(raw.line) } : {}) }, setup, cluster);
    rows.push({ step, place, raw: raw.line, line: r.line, en: r.en, setup: setup.id, answers: r.parts.length });
    if (said) transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    said = r.parts[0]?.text ?? '…';
  }
})));

for (const step of [1, 2, 3]) {
  const rs = rows.filter((r) => r.step === step);
  const outside = (raw: string) => raw.replace(/\{[^{}]*\}/g, '').replace(/[\s.,!?…]/g, '');
  const kept = rs.filter((r) => /\{[^{}]*\|[^{}]*\}/.test(r.raw) && !outside(r.raw)).length;
  const marked = rs.filter((r) => /\*[^*]+\*/.test(r.raw)).length;
  console.log(`\nstep ${step}: ${languageShare(rs.map((r) => ({ line: r.line, en: r.en })))}% in the language · ${Math.round(rs.reduce((n, r) => n + words(r.line), 0) / rs.length)} words a turn · format kept ${kept}/${rs.length} · a phrase marked ${marked}/${rs.length}`);
  for (const r of rs.filter((r) => r.place === places[0]).slice(...(process.env.S1_LAST ? [-3] : [0, 4]))) console.log(`  [${r.setup}] ${r.line}\n      raw: ${r.raw}`);
}
