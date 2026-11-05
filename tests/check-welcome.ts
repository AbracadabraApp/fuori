// The welcome (lib/welcome.ts, welcome.md; Josh, 2026-11-05): three steps
// counted in code, English only, masculine or feminine from two buttons, and
// everyone at Beginner S1. No API calls.
import { welcomeBrief, welcomeContent, welcomeStep, welcomeTurnFlags, addressAnswers, addressFrom, ADDRESS_BUTTONS } from '@/lib/welcome';
import { pack } from '@/content';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

check('this country has a welcome character', !!welcomeContent());
for (const step of ['opening', 'questions', 'answers'] as const) {
  check(`${step}: the brief fills every placeholder`, !/\{[a-zA-Z]+\}/.test(welcomeBrief(step, false)), welcomeBrief(step, false).match(/\{[a-zA-Z]+\}/g));
}
check('steps by the learner lines so far', welcomeStep(0) === 'opening' && welcomeStep(1) === 'questions' && welcomeStep(2) === 'answers' && welcomeStep(5) === 'answers');
check('the opening ends on the two buttons', addressAnswers().map((p) => `${p.kind}:${p.text}`).join('|') === `answer:${ADDRESS_BUTTONS.m}|answer:${ADDRESS_BUTTONS.f}`);
check('the opening is a tap; after it the end button shows beside the mic', welcomeTurnFlags('opening').tapAnswers === true && !welcomeTurnFlags('opening').canEnd && welcomeTurnFlags('questions').canEnd === true && welcomeTurnFlags('answers').canEnd === true);
check('mic off: said after the tap, not in the opening', welcomeBrief('questions', true).length > welcomeBrief('questions', false).length && welcomeBrief('opening', true) === welcomeBrief('opening', false));
check('the tap sets masculine or feminine', addressFrom(ADDRESS_BUTTONS.m) === 'm' && addressFrom(ADDRESS_BUTTONS.f) === 'f');
check('said, not tapped (an older app): heard close still counts', addressFrom('masculine.') === 'm');
check('anything else, or nothing, is the feminine (Josh, 2026-11-02)', addressFrom('either is fine') === 'f' && addressFrom(undefined) === 'f');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: welcome for ${pack.id}: three steps, the two buttons, the end button beside the mic, masculine or feminine from the tap`);
