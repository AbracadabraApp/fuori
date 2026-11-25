// Level up (lib/level-up.ts): the rule, the words, the rewrite prompt, the route and the stored step reaching the turn.
// Run in both countries: npm run test:level-up
import { readFileSync, existsSync } from 'node:fs';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { SETTINGS } from '@/lib/dialogue/pieces';
import { previewAtSetting, isDue, countFrom, rewritePrompt, stepLevelText, levelUpAsker, levelUpBar, LEVEL_UP_AFTER, MAX_STEP } from '@/lib/level-up';
import { onboarding } from '@/content';
import { CLUSTERS, clusterHeaderFrom, clusterFrom, CLUSTER_1 } from '@/lib/beginner-2';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

// The rule: after N counted conversations, never at the top
check(!isDue({ step: 1, counted: LEVEL_UP_AFTER - 1 }) && isDue({ step: 1, counted: LEVEL_UP_AFTER }) && isDue({ step: 3, counted: 10 }), `due after ${LEVEL_UP_AFTER} conversations at the step`);
check(!isDue({ step: MAX_STEP, counted: 100 }) && MAX_STEP === CLUSTERS.length, 'never due at the top step (the last cluster)');
// Counting starts at the later of the step's start and the last "not yet"
const a = new Date('2026-11-01'), b = new Date('2026-11-10');
check(countFrom({ step: 1, since: null, askedAt: null }) === null && countFrom({ step: 2, since: a, askedAt: null }) === a && countFrom({ step: 2, since: a, askedAt: b }) === b && countFrom({ step: 2, since: b, askedAt: a }) === b, 'the count starts at the later of the step and the last not-yet');

// The words, both countries, in the language for the yes
const w = language.ui.levelUp;
check(!!w && ['awning', 'pennants'].includes(w.theme) && /\{name\}/.test(w.kicker) && /\{name\}/.test(w.how) && !!w.yes && !!w.yesLabel && !!w.notYet && !!w.headline && !!w.answers, 'the level-up words are in the language pack');

// The rewrite prompt: her line, the next step's level text, no placeholder left; the level text comes from scaffolding.md
const city = cities[0];
const place = city.places.find((pl) => characterForPlace(city, pl))!;
const c = characterForPlace(city, place)!;
const prompt = rewritePrompt({ character: { name: c.name, role: c.role, city: c.city }, line: 'Buongiorno, un caffè?', nextStep: 2 });
check(prompt.includes(c.name) && prompt.includes('Buongiorno, un caffè?') && prompt.includes(stepLevelText(2)) && !/\{\w+\}/.test(prompt) && /"line"/.test(prompt), `the rewrite prompt is filled (got ${[...prompt.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).join(', ') || 'no placeholders'})`);
check(stepLevelText(1) === stepLevelText(MAX_STEP) && SETTINGS.length === MAX_STEP && stepLevelText(MAX_STEP + 5) === stepLevelText(MAX_STEP), 'every step shares the level text and has a setting in code (2026-11-15a); past the top it is the top');
// The preview of a step that is a setting is put together as that step's turns are
{
  const written = { line: '{Ese es *el comal*. | That is *the griddle*.} {¿Le pongo *salsa*? | Do you want *salsa*?}', en: 'x' };
  const at3 = previewAtSetting(written, SETTINGS[1], 0.3);
  check(at3.line === 'Ese es el comal. That is the griddle. ¿Le pongo salsa? Do you want salsa?' && at3.en === 'That is the griddle. Do you want salsa?', `the preview at step 2 echoes each sentence (got ${at3.line})`);
  check(previewAtSetting({ line: 'Tutto in italiano.', en: 'All in Italian.' }, undefined, 0).line === 'Tutto in italiano.', 'a step with no setting: the line as rewritten');
}

// The header alone, or nothing (then the stored step decides); clusterFrom keeps its default for callers that want one
check(clusterHeaderFrom(new Headers({ 'x-fuori-cluster': '3' })) === CLUSTERS[2] && clusterHeaderFrom(new Headers()) === undefined && clusterFrom(new Headers()) === CLUSTER_1, 'the cluster header alone, undefined without it');
const tt = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/cluster = await storedCluster\(learnerId\)/.test(tt) && /pickSetup\(\{[^}]*\}, cluster\)/.test(tt) && /beginner2Version\(cluster\)/.test(tt), 'the turn uses the stored step when the app sends no cluster');
check(/beginnerCluster: clusterHeaderFrom\(request\.headers\)/.test(readFileSync('app/v1/turn/route.ts', 'utf8')), '/v1/turn passes the header alone');
check(existsSync('app/v1/level-up/route.ts') && /export async function GET/.test(readFileSync('app/v1/level-up/route.ts', 'utf8')) && /export async function POST/.test(readFileSync('app/v1/level-up/route.ts', 'utf8')), '/v1/level-up has GET and POST');
check(/ADD COLUMN IF NOT EXISTS step int/.test(readFileSync('scripts/db-migrate.mjs', 'utf8')), 'the step columns are in the migration');

// The page from 2026-11-16 (docs/bugs.md B42): the welcome's character asks, the bar of steps, the page's own words
{
  const asker = levelUpAsker();
  const inCities = cities.flatMap((c) => c.characters ?? []).find((c) => c.id === onboarding.welcome?.characterId);
  check(!!asker && !!inCities && asker.id === inCities.id && asker.name === inCities.name, `the asker is the welcome's character (got ${JSON.stringify(asker)})`);
  const b1 = levelUpBar(1, { to: 'step', step: 2 }), bTop = levelUpBar(MAX_STEP, { to: 'intermediate' }), bAdv = levelUpBar(MAX_STEP, { to: 'advanced' });
  check(b1.total === MAX_STEP && b1.now === 1 && b1.next === 2, 'a step move: the bar is the steps, now and next');
  check(bTop.total === MAX_STEP + 2 && bTop.now === MAX_STEP && bTop.next === MAX_STEP + 1 && bAdv.now === MAX_STEP + 1 && bAdv.next === MAX_STEP + 2 && bAdv.next <= bAdv.total, 'a level move: the bar runs on past the steps');
  const page = ['band', 'line', 'question', 'barFrom', 'barTo', 'barNow', 'barNext', 'barLabel', 'stay', 'go'] as const;
  check(page.every((k) => typeof w[k] === 'string' && w[k].length > 0), 'the page has its words (band, line, question, the bar, stay, go)');
  check(w.question.includes(language.name) && w.barTo.includes(language.name) && ['{now}', '{total}', '{next}'].every((p) => w.barLabel.includes(p)), 'the question and the bar name the language; the bar\'s reading has its three places');
  check(/asker: levelUpAsker\(\)/.test(readFileSync('lib/level-up.ts', 'utf8')) && /bar: levelUpBar\(s\.step, move\)/.test(readFileSync('lib/level-up.ts', 'utf8')), 'the offer carries the asker and the bar');
}

// B63: the app (build 17 and later) asks for `lite`, and a lite offer makes no Claude call: the page is static
{
  const lu = readFileSync('lib/level-up.ts', 'utf8');
  const route = readFileSync('app/v1/level-up/route.ts', 'utf8');
  const api = readFileSync('ios/FuoriKit/Sources/FuoriNetworking/APIClient.swift', 'utf8');
  check(/opts\.lite\s*\?\s*\{[^}]*\}\s*:\s*await rewriteAtStep\(/.test(lu), 'a lite offer skips the rewrite (B63)');
  check(/searchParams\.get\('lite'\) === '1'/.test(route) && /levelUpOffer\(learnerId, conversationId, \{ lite: true \}\)/.test(route), 'the route passes lite on (B63)');
  check(/URLQueryItem\(name: "lite", value: "1"\)/.test(api), 'the app asks for lite (B63)');
  const model = readFileSync('ios/FuoriKit/Sources/FuoriFeatures/AppModel.swift', 'utf8');
  const save = model.slice(model.indexOf('public func save(conversationId'), model.indexOf('private func retryPendingSaves'));
  check(save.indexOf('api.levelUp(') > -1 && save.indexOf('api.levelUp(') < save.indexOf('api.endConversation('), 'the app asks for the offer before it waits on the end call (B63)');
  const person = readFileSync('ios/FuoriKit/Sources/FuoriFeatures/Person/PersonView.swift', 'utf8');
  check(!/Task\.sleep\(for: \.seconds\(1\.5\)\)\s*\n\s*if let ready/.test(person) && /showingLevelUp = true/.test(person), 'the goodbye shows the card or the level up as soon as one is ready, with no fixed wait (B63)');
}

if (problems.length) {
  console.error(`check-level-up: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-level-up: ok');
