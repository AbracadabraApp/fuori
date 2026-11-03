// The welcome's brief (lib/welcome.ts, welcome.md; Josh, 2026-11-02 and 11-03):
// three goals, the language in three moments, and the guard that asks a
// missing goal once more. Only the paths that make no API call: the check
// waits until they've answered once per goal, and never runs twice.
import { welcomeBrief, welcomeBriefFor, askAgainBrief, welcomeContent, WELCOME_GOALS, type StoredTurn } from '@/lib/welcome';
import { language, onboarding, pack } from '@/content';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

const w = welcomeContent();
check('this country has a welcome character', !!w);
const brief = welcomeBrief(false);
check('the brief fills every placeholder', !/\{[a-zA-Z]+\}/.test(brief.replace(/\{their name\}/g, '')), brief.match(/\{[a-zA-Z]+\}/g));
check('the brief has the three goals, numbered', /^1\. /m.test(brief) && /^2\. /m.test(brief) && /^3\. /m.test(brief) && !/^4\. /m.test(brief));
check('no "first time in the country" goal (Josh, 2026-11-03)', !/first time/i.test(onboarding.welcome.script));
check('English carries it', brief.includes(`except three moments in ${language.name}`));
check('mic off adds its line', welcomeBrief(true).length > brief.length);
check('ask again names what is missing', askAgainBrief('their name').includes('their name'));

const npc = (text: string): StoredTurn => ({ who: 'npc', text });
const learner = (text: string): StoredTurn => ({ who: 'learner', text });
const run = async () => {
  const early = [npc('Ciao!'), learner('Mi chiamo Josh'), npc('…'), learner('Benvenuto')];
  check(`the check waits for ${WELCOME_GOALS} learner lines`, early.filter((t) => t.who === 'learner').length < WELCOME_GOALS);
  const a = await welcomeBriefFor({ turns: early, askedBefore: false, characterId: w!.characterId, micOff: false });
  check('before then: the plain brief, no asking again', a.brief === brief && !a.askedAgain, a.askedAgain);
  const full = [...early, npc('…'), learner('Look at that!')];
  const b = await welcomeBriefFor({ turns: full, askedBefore: true, characterId: w!.characterId, micOff: false });
  check('once she has asked again (stored), never again', b.brief === brief && !b.askedAgain);
  const c = await welcomeBriefFor({ turns: [...full.slice(0, 2), { ...npc('…'), askedAgain: true }, ...full.slice(2)], askedBefore: false, characterId: w!.characterId, micOff: false });
  check('a turn marked askedAgain counts too', c.brief === brief && !c.askedAgain);
};

run().then(() => {
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`OK: welcome brief for ${pack.id}: three goals, three moments in ${language.name}, ask again once`);
});
