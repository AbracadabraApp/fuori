// Level up (lib/level-up.ts): the rule, the words, the rewrite prompt, the route and the stored step reaching the turn.
// Run in both countries: npm run test:level-up
import { readFileSync, existsSync } from 'node:fs';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { isDue, countFrom, rewritePrompt, stepLevelText, LEVEL_UP_AFTER, MAX_STEP } from '@/lib/level-up';
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
check(stepLevelText(1) !== stepLevelText(2) && stepLevelText(MAX_STEP + 5) === stepLevelText(MAX_STEP), 'each step has its level text; past the top it is the top');

// The header alone, or nothing (then the stored step decides); clusterFrom keeps its default for callers that want one
check(clusterHeaderFrom(new Headers({ 'x-fuori-cluster': '3' })) === CLUSTERS[2] && clusterHeaderFrom(new Headers()) === undefined && clusterFrom(new Headers()) === CLUSTER_1, 'the cluster header alone, undefined without it');
const tt = readFileSync('lib/conversation/take-turn.ts', 'utf8');
check(/cluster = await storedCluster\(learnerId\)/.test(tt) && /pickSetup\(\{[^}]*\}, cluster\)/.test(tt) && /beginner2Version\(cluster\)/.test(tt), 'the turn uses the stored step when the app sends no cluster');
check(/beginnerCluster: clusterHeaderFrom\(request\.headers\)/.test(readFileSync('app/v1/turn/route.ts', 'utf8')), '/v1/turn passes the header alone');
check(existsSync('app/v1/level-up/route.ts') && /export async function GET/.test(readFileSync('app/v1/level-up/route.ts', 'utf8')) && /export async function POST/.test(readFileSync('app/v1/level-up/route.ts', 'utf8')), '/v1/level-up has GET and POST');
check(/ADD COLUMN IF NOT EXISTS step int/.test(readFileSync('scripts/db-migrate.mjs', 'utf8')), 'the step columns are in the migration');

if (problems.length) {
  console.error(`check-level-up: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-level-up: ok');
