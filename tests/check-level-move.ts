// D34, D35 (docs/dialogue-plan.md → Promotion): the level up past the steps. At the top of Beginner the same offer
// moves the learner to Intermediate; at Intermediate it moves them to Advanced (Josh, 2026-11-14: "we can put a step
// in but not focus on the advanced exxperience yet"); Advanced gets none. Same count, learner's choice, not yet asks
// again. Without a test database: the pure rules, the words and preview prompt, and the wiring by source (the yes
// sets learners.level as Settings does, which the turn reads). Run in both countries: npm run test:level-move
import { readFileSync } from 'node:fs';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { moveFrom, offerDue, ordinaryVisit, moveLevelText, offerWords, rewritePrompt, stepLevelText, LEVEL_UP_AFTER, MAX_STEP } from '@/lib/level-up';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// The rule for the yes: steps at Beginner, then the levels, nothing at the top
check(same(moveFrom({ level: 'beginner', step: 1 }), { to: 'step', step: 2 }) && same(moveFrom({ level: null, step: MAX_STEP - 1 }), { to: 'step', step: MAX_STEP }), 'Beginner (or no level yet) below the top step: the next step');
check(same(moveFrom({ level: 'beginner', step: MAX_STEP }), { to: 'intermediate' }) && same(moveFrom({ level: null, step: MAX_STEP }), { to: 'intermediate' }), 'D34: at the top step of Beginner a yes moves to Intermediate');
check(same(moveFrom({ level: 'intermediate', step: 1 }), { to: 'advanced' }) && same(moveFrom({ level: 'intermediate', step: MAX_STEP }), { to: 'advanced' }), 'D35: at Intermediate a yes moves to Advanced, whatever the stored step');
check(moveFrom({ level: 'advanced', step: MAX_STEP }) === null, 'Advanced is the top: no move');

// The offer: the same count everywhere
check(offerDue({ level: 'beginner', step: MAX_STEP, counted: LEVEL_UP_AFTER - 1 }) === null && same(offerDue({ level: 'beginner', step: MAX_STEP, counted: LEVEL_UP_AFTER }), { to: 'intermediate' }), `D34: offered at step ${MAX_STEP} after ${LEVEL_UP_AFTER} counted conversations, not before`);
check(offerDue({ level: 'intermediate', step: 1, counted: LEVEL_UP_AFTER - 1 }) === null && same(offerDue({ level: 'intermediate', step: 1, counted: LEVEL_UP_AFTER }), { to: 'advanced' }), `D35: an Intermediate learner is offered Advanced after ${LEVEL_UP_AFTER} counted conversations`);
check(offerDue({ level: 'advanced', step: 1, counted: 100 }) === null, 'Advanced gets no offer');
check(same(offerDue({ level: 'beginner', step: 2, counted: LEVEL_UP_AFTER }), { to: 'step', step: 3 }), 'the step offer is unchanged below the top');

// Which conversation the offer may follow: an ordinary visit at the learner's level
check(ordinaryVisit('beginner', 'beginner-2-2026-11-14a/2026-11-13b+C6') && !ordinaryVisit('beginner', '2026-11-13b') && !ordinaryVisit(null, 'lesson-x-story'), 'Beginner: only after a Beginner 2 visit');
check(ordinaryVisit('intermediate', '2026-11-13b') && ordinaryVisit('advanced', '2026-11-13b'), 'Intermediate and Advanced: after a visit on the character prompt');
check(!['beginner-2-x/y+C1', 'beginner-2026', 'lesson-a-story', 'magda-1', 'onboarding-welcome-1', ''].some((v) => ordinaryVisit('intermediate', v)) && !ordinaryVisit('intermediate', null), 'not after a Beginner visit, a lesson, Magda, the welcome or onboarding');

// The preview: her line rewritten for the next level, from the character prompt's level lines
const toInt = moveLevelText({ to: 'intermediate' }), toAdv = moveLevelText({ to: 'advanced' });
check(toInt.length > 10 && toAdv.length > 10 && toInt !== toAdv && !/\{\w+\}/.test(toInt + toAdv) && toInt.includes(language.name) && toAdv.includes(language.name), 'each level move has its level text (character.md → Learner: Intermediate / Advanced), filled');
check(moveLevelText({ to: 'step', step: 3 }) === stepLevelText(3), 'a step move keeps the step level text');
const city = cities[0];
const place = city.places.find((pl) => characterForPlace(city, pl))!;
const c = characterForPlace(city, place)!;
const prompt = rewritePrompt({ character: { name: c.name, role: c.role, city: c.city }, line: 'Buongiorno!', nextStep: MAX_STEP, level: toInt });
check(prompt.includes(toInt) && !prompt.includes(stepLevelText(MAX_STEP)) && !/\{\w+\}/.test(prompt), 'the rewrite prompt is written for the next level, not the step');

// The words: a level move labels its card and says what changes; a step offer keeps today's words
const w = language.ui.levelUp;
const base = offerWords('step');
check(!('to' in base) && base.next === w.next && base.answers === w.answers, 'a step offer sends today\'s words, without the level-move words');
for (const to of ['intermediate', 'advanced'] as const) {
  const lw = offerWords(to);
  check(!('to' in lw) && lw.next === w.to[to].next && lw.answers === w.to[to].answers && lw.yes === w.yes && lw.notYet === w.notYet && lw.answers !== w.answers, `the ${to} offer has its own label and line, the rest as today`);
}

// The wiring: the route, the yes setting learners.level as Settings does, the turn reading it, the app following it
const route = readFileSync('app/v1/level-up/route.ts', 'utf8');
check(/levelUpOffer\(learnerId, conversationId, beginnerVersionFrom\(request\.headers\)\)/.test(route) && /words: offerWords\(offer\.to\)/.test(route), '/v1/level-up passes the app\'s Beginner switch (Beginner only) and sends the offer\'s words');
check(!/if \(beginnerVersionFrom\(request\.headers\) !== 2\) return/.test(route), 'the Beginner switch no longer hides the Intermediate offer');
check(/level: s\.level/.test(route), 'the yes answers with the level after it');
const lu = readFileSync('lib/level-up.ts', 'utf8');
check(/else if \(move\) await changeLevel\(learnerId, move\.to\)/.test(lu) && /await setLevel\(learnerId, level\)/.test(lu), 'a yes to a level move goes through changeLevel → setLevel');
check(/ordinaryVisit\(level, conv\.prompt_version\)/.test(lu) && /offerDue\(\{ level, step: s\.step, counted \}\)/.test(lu), 'the offer uses the level-aware rules');
check(/UPDATE learners SET level = \$2 WHERE id = \$1/.test(readFileSync('lib/onboarding.ts', 'utf8')), 'setLevel writes learners.level');
check(/learnerLevel = \(await onboardingState\(learnerId\)\)\.level/.test(readFileSync('lib/conversation/take-turn.ts', 'utf8')), 'the turn reads learners.level');
check(/await changeLevel\(learnerId, body\.data\.level\)/.test(readFileSync('app/v1/me/level/route.ts', 'utf8')), 'Settings changes the level the same way (the count starts over)');
const app = readFileSync('ios/FuoriKit/Sources/FuoriFeatures/AppModel.swift', 'utf8');
check(/func answerLevelUp\(yes: Bool\)/.test(app) && /level = after\s+SettingsKey\.applyDefaults\(forLevel: after\)/.test(app), 'the app takes the new level and its defaults after a yes');
check(/await model\.answerLevelUp\(yes: yes\)/.test(readFileSync('ios/FuoriKit/Sources/FuoriFeatures/RootView.swift', 'utf8')), 'the level-up sheet answers through the app model');

if (problems.length) {
  console.error(`check-level-move: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-level-move: ok (top of Beginner offers Intermediate, Intermediate offers Advanced, Advanced none; the yes sets the level)');
