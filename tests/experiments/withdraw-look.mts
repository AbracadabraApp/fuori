// A look, not a test (Josh, 2026-11-16: "usually if we withdraw rules problems go away"; yes to this look): the turn
// notes keep their form and lose their subject. Short visits (opener + 5 turns) with a stand-in learner who alternates
// the two offered answers, played two ways with the same draw of notes:
//   live: the notes as released (notice in its original wording; two answers "ask about what's here or what you're doing")
//   withdrawn: no notice (its turns become two answers); two answers is "End on a question, and give them two short answers…"
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/withdraw-look.mts city/place …
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, OPENER, frameBrief, pickSetup, setupLine } from '@/lib/beginner-2';
import { englishOf } from '@/lib/dialogue/pieces';
import type { Turn } from '@/lib/types';

const cluster = CLUSTERS[0];
const brief = frameBrief(cluster);
const TWO = cluster.find((s) => s.id === 'two-en')!;
const NOTICE = cluster.find((s) => s.id === 'notice')!;
const TWO_LIVE = "ask about what's here or what you're doing, and give them";
const NOTICE_LIVE = "This turn, point them at something they can see right now that you haven't shown them yet, and ask them something about it: what they make of it, which they like, what they think it's for. Give them two short answers they could say back.";
if (!setupLine(TWO).includes(`This turn, ${TWO_LIVE}`)) throw new Error('the two-answers note changed');
const firstSentences = (s: string) => s.slice(0, s.indexOf('Give them two short answers they could say back.') + 'Give them two short answers they could say back.'.length);
const NOTES: Record<string, (s: typeof TWO) => string> = {
  live: (s) => (s.id === 'notice' ? setupLine(NOTICE).replace(firstSentences(setupLine(NOTICE)), NOTICE_LIVE) : setupLine(s)),
  withdrawn: (s) => (s.id === 'notice' || s.id === 'two-en' ? setupLine(TWO).replace(`This turn, ${TWO_LIVE}`, 'End on a question, and give them') : setupLine(s)),
};
const TURNS = 5;
const out: string[] = [];
await Promise.all(process.argv.slice(2).flatMap((p) => Object.entries(NOTES).map(async ([arm, noteOf]) => {
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
    lines.push(`  ${turn} [${setup.id}] ${englishOf(raw.line)}${answers.length ? `\n      bubbles: ${answers.map((a) => a.en).join(' | ')}` : ''}`);
    if (said) transcript.push({ who: 'learner', transcript: said });
    transcript.push({ who: 'npc', transcript: raw.line, translation: raw.en });
    const pick = answers[turn % 2] ?? answers[0];
    said = pick?.text ?? 'Sí.';
    lines.push(`      learner: ${pick?.en ?? 'Yes.'}`);
  }
  out.push(`== ${character.name} (${p}) · ${arm}\n${lines.join('\n')}`);
})));
console.log(out.sort().join('\n\n'));
