// A look, not a test: does one standing line ("you have a whole life…") thicken a thin character?
// Short visits (opener + 5 turns) with a stand-in learner who alternates the two offered answers, played three ways:
//   as-is; +life (the line added after the level text); +life-stories (the line, and "no stories or explanations" taken out).
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/life-line-look.mts city/place …
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, OPENER, frameBrief, pickSetup, setupLine } from '@/lib/beginner-2';
import { englishOf } from '@/lib/dialogue/pieces';
import type { Turn } from '@/lib/types';

const LIFE = 'You have a whole life of your own: family, a past, tastes, opinions, something on today. Draw on it when it fits. What you say about the real place and its history stays to what you know.';
const cluster = CLUSTERS[1];
const base = frameBrief(cluster);
const ARMS: [string, string][] = [
  ['as-is', base],
  ['+life', `${base}\n\n${LIFE}`],
  ['+life-stories', `${base.replace(': no stories or explanations.', '.')}\n\n${LIFE}`],
];
if (!base.includes(': no stories or explanations.')) throw new Error('level text changed: "no stories or explanations" not found');
const TURNS = 5;
const out: string[] = [];
await Promise.all(process.argv.slice(2).flatMap((p) => ARMS.map(async ([arm, brief]) => {
  const [city, place] = p.split('/');
  const character = characterForVisit(city, place)!;
  const transcript: Turn[] = [];
  const lines: string[] = [];
  let said: string | undefined;
  for (let turn = 0; turn <= TURNS; turn++) {
    const setup = turn === 0 ? OPENER : pickSetup({ conversationId: `look-${p}`, turn, characterId: character.id }, cluster);
    const raw = await runTurn({ character, transcript, learnerSaid: said, brief, note: setupLine(setup), answers: true, withDone: true });
    const answers = (raw.answers ?? []).filter((a) => a.text.trim());
    lines.push(`  ${turn} [${setup.id}] ${englishOf(raw.line)}${answers.length ? `\n      bubbles: ${answers.map((a) => a.en).join(' | ')}` : ''}`);
    if (said) transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: raw.line, translation: raw.en });
    const pick = answers[turn % 2] ?? answers[0];
    said = pick?.text ?? 'Sí. ¿Y usted?';
    lines.push(`      learner: ${pick?.en ?? 'Yes. And you?'}`);
  }
  out.push(`== ${character.name} (${p}) · ${arm}\n${lines.join('\n')}`);
})));
console.log(out.sort().join('\n\n'));
