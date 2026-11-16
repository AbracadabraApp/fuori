// A look, not a test (Josh, 2026-11-16): does the model need a description of a bid? Two of his, in the Answers
// rule in place of its list of kinds, turn notes as on main, the same seven visits as the other looks:
//   keep going: "Each answer replies to you, then makes a bid: an offer to keep the conversation going. Make the two different."
//   curious:    "Each answer replies to you, then makes a bid: a few words that show they are curious. Make the two different."
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/bid-defined-look.mts city/place …
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, OPENER, frameBrief, pickSetup, setupLine } from '@/lib/beginner-2';
import { englishOf } from '@/lib/dialogue/pieces';
import type { Turn } from '@/lib/types';

const cluster = CLUSTERS[0];
const base = frameBrief(cluster);
const OLD = "Make the two answers two different things a person might really say here, each taking the talk somewhere: a choice with its reason, an answer that asks you something back, or something they notice about what's here; not a yes and a no to the same thing, and not a compliment that could be about anything.";
if (!base.includes(OLD)) throw new Error('the Answers rule changed');
const ARMS: [string, string][] = [
  ['1 keep going', base.replace(OLD, 'Each answer replies to you, then makes a bid: an offer to keep the conversation going. Make the two different.')],
  ['2 curious', base.replace(OLD, 'Each answer replies to you, then makes a bid: a few words that show they are curious. Make the two different.')],
];
const TURNS = 5;
const out: string[] = [];
await Promise.all(process.argv.slice(2).flatMap((p) => ARMS.map(async ([arm, brief]) => {
  const [city, place] = p.split('/');
  const character = characterForVisit(city, place);
  if (!character) { out.push(`== no character at ${p}`); return; }
  const transcript: Turn[] = [];
  const lines: string[] = [];
  let said: string | undefined;
  for (let turn = 0; turn <= TURNS; turn++) {
    const setup = turn === 0 ? OPENER : pickSetup({ conversationId: `withdraw-${p}`, turn, characterId: character.id }, cluster);
    const raw = await runTurn({ character, transcript, learnerSaid: said, brief, note: setupLine(setup), answers: true, withDone: true });
    const answers = (raw.answers ?? []).filter((a) => a.text.trim());
    lines.push(`  ${turn} [${setup.id}] ${englishOf(raw.line)}${answers.length ? `\n      bubbles: ${answers.map((a) => `${a.en}  «${a.text}»`).join(' | ')}` : ''}`);
    if (said) transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: raw.line, translation: raw.en });
    const pick = answers[turn % 2] ?? answers[0];
    said = pick?.text ?? 'Sí.';
    lines.push(`      learner: ${pick?.en ?? 'Yes.'}`);
  }
  out.push(`== ${character.name} (${p}) · ${arm}\n${lines.join('\n')}`);
})));
console.log(out.sort().join('\n\n'));
