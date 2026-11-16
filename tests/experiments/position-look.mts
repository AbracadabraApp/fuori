// A look, not a test (Josh, 2026-11-16): his two ideas together, in the game's own prompt.
//   1 as-is:  the Answers rule and the turn notes as on main
//   2 bid:    the Answers rule's sentence of kinds and prohibitions becomes "Each answer replies to you, then makes a
//             bid: one more short thing of their own that gives you something to respond to. Make the two different."
//   3 bid + notes withdrawn: the same, and the notes lose their subject: no notice (its turn is two answers), two
//             answers is "End on a question, and give them two short answers…", the opener is "This is your first turn. End on a question, and give them…"
// Short visits (opener + 5 turns), a stand-in learner alternating the two bubbles, the same draw of notes.
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/position-look.mts city/place …
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, OPENER, frameBrief, pickSetup, setupLine, type Setup } from '@/lib/beginner-2';
import { englishOf } from '@/lib/dialogue/pieces';
import type { Turn } from '@/lib/types';

const cluster = CLUSTERS[0];
const base = frameBrief(cluster);
const OLD = "Make the two answers two different things a person might really say here, each taking the talk somewhere: a choice with its reason, an answer that asks you something back, or something they notice about what's here; not a yes and a no to the same thing, and not a compliment that could be about anything.";
if (!base.includes(OLD)) throw new Error('the Answers rule changed');
const bid = base.replace(OLD, 'Each answer replies to you, then makes a bid: one more short thing of their own that gives you something to respond to. Make the two different.');
const TWO = cluster.find((s) => s.id === 'two-en')!;
const TWO_SUBJECT = "This turn, ask about what's here or what you're doing, and give them";
const OPENER_SUBJECT = "This is your first turn: open with your place or what you're doing right now, and ask them about that, not about them. Give them";
if (!setupLine(TWO).includes(TWO_SUBJECT) || !setupLine(OPENER).includes(OPENER_SUBJECT)) throw new Error('a turn note changed');
const withdrawn = (s: Setup) =>
  s.id === 'opener' ? setupLine(OPENER).replace(OPENER_SUBJECT, 'This is your first turn. End on a question, and give them')
  : s.id === 'notice' || s.id === 'two-en' ? setupLine(TWO).replace(TWO_SUBJECT, 'End on a question, and give them')
  : setupLine(s);
const ARMS: [string, string, (s: Setup) => string][] = [['1 as-is', base, setupLine], ['2 bid', bid, setupLine], ['3 bid + notes withdrawn', bid, withdrawn]];
const TURNS = 5;
const out: string[] = [];
await Promise.all(process.argv.slice(2).flatMap((p) => ARMS.map(async ([arm, brief, noteOf]) => {
  const [city, place] = p.split('/');
  const character = characterForVisit(city, place);
  if (!character) { out.push(`== no character at ${p}`); return; }
  const transcript: Turn[] = [];
  const lines: string[] = [];
  let said: string | undefined;
  for (let turn = 0; turn <= TURNS; turn++) {
    const setup = turn === 0 ? OPENER : pickSetup({ conversationId: `withdraw-${p}`, turn, characterId: character.id }, cluster);
    const raw = await runTurn({ character, transcript, learnerSaid: said, brief, note: noteOf(setup), answers: true, withDone: true });
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
