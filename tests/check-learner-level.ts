// The level check after the first conversations (lib/learner-level.ts).
// Without a database: the setting, which conversations are read, the prompt.
// With ANTHROPIC_API_KEY: the judge on two cases onboarding gets wrong (round 14).
// With a local DATABASE_URL: the whole check with a stand-in judge, through
// rememberConversation's path. Run per country (COUNTRY=es-mx).
//   DATABASE_URL=postgres://localhost/fuori_test node scripts/db-migrate.mjs, then
//   DATABASE_URL=postgres://localhost/fuori_test npm run test:learner-level
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { pack, tutor } from '@/content';
import {
  LEVEL_CHECKS, buildLearnerLevelPrompt, checkLearnerLevel, conversationsToCheck, judgeLearnerLevel,
  learnerLevelPromptVersion, levelCheckEnabled, type CheckedConversation, type LevelCheck, type LevelJudge,
} from '@/lib/learner-level';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

// The setting: off unless set; "all" or listed ids
check(!levelCheckEnabled('a', {}), 'unset: off');
check(!levelCheckEnabled('a', { LEVEL_CHECK: ' ' }), 'blank: off');
check(levelCheckEnabled('a', { LEVEL_CHECK: 'all' }), '"all": on for everyone');
check(levelCheckEnabled('b', { LEVEL_CHECK: 'a, b' }) && !levelCheckEnabled('c', { LEVEL_CHECK: 'a, b' }), 'a list: on only for those ids');

// Which conversations: long enough, up to and including this one, the latest LEVEL_CHECKS
const conv = (id: string, lines: number) => ({ id, turns: Array.from({ length: lines * 2 }, (_, i) => ({ who: i % 2 ? 'learner' : 'npc' })) });
const all = [conv('a', 3), conv('short', 1), conv('b', 2), conv('c', 5), conv('d', 2), conv('e', 4)];
check(conversationsToCheck(all, 'b').map((c) => c.id).join() === 'a,b', 'the first ones: all of them up to this one');
check(conversationsToCheck(all, 'e').map((c) => c.id).join() === 'c,d,e', `later: the latest ${LEVEL_CHECKS}, short ones skipped`);
check(conversationsToCheck(all, 'short').length === 0, 'a conversation too short to say anything: none');

// The prompt: version and changelog, placeholders filled, lines labelled
const md = readFileSync(`content/${pack.id}/prompts/learner-level.md`, 'utf8');
const newest = (md.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
check(newest === learnerLevelPromptVersion(), `learner-level.md: version ${learnerLevelPromptVersion()} but newest changelog entry ${newest}`);
const convs: CheckedConversation[] = [{ name: 'Rita', turns: [{ who: 'npc', text: 'Ciao!' }, { who: 'learner', text: 'Hi' }] }];
const p = buildLearnerLevelPrompt([], convs);
check(!/\{\w+\}/.test(p.system + p.user), 'prompt: unfilled placeholder');
check(p.user.includes('(none)') && p.user.includes('Conversation 1:\nRita: Ciao!\nLearner: Hi'), 'prompt: no onboarding says "(none)"; lines labelled by name and "Learner"');

async function live() {
  // Round 14's two misplacements: a friend answered onboarding in the language; a shy intermediate answered in English
  const es = pack.id === 'es-mx';
  const friend = await judgeLearnerLevel(
    ["Oh, um, thank you! I only know a little, sorry. I like the food very much!", es ? 'Mi platillo favorito son los chilaquiles verdes, y los mejores que he probado fueron en una fondita del mercado de Coyoacán.' : "La mia preferita è la margherita con la bufala, e la migliore che abbia mai mangiato è stata a Napoli, vicino a via dei Tribunali."],
    [{ name: 'Rita', turns: [
      { who: 'npc', text: es ? '¡Buenos días! ¿Qué te sirvo?' : 'Buongiorno! Cosa ti preparo?' }, { who: 'learner', text: es ? 'Eh... un café. Sorry, I don\'t speak much.' : 'Eh... un caffè. Sorry, I don\'t speak much.' },
      { who: 'npc', text: es ? '¡Claro! ¿Con leche o solo?' : 'Certo! Lo vuoi macchiato o normale?' }, { who: 'learner', text: 'Sorry, what? Normal... normal, grazie.' },
    ] }]
  );
  const shy = await judgeLearnerLevel(
    ['I love the food and how friendly everyone is, sorry, I\'m shy to speak.', 'My favourite is pizza, I eat it with friends on Fridays.'],
    [{ name: 'Rita', turns: [
      { who: 'npc', text: es ? '¡Buenos días! ¿Qué te sirvo?' : 'Buongiorno! Cosa ti preparo?' }, { who: 'learner', text: es ? 'Un café con leche, por favor. Ayer vine con mi hermana pero estaba cerrado.' : 'Un cappuccino, per favore. Ieri sono venuto con mia sorella ma era chiuso.' },
      { who: 'npc', text: es ? '¡Ah, ayer cerramos temprano! ¿Y de dónde son?' : 'Ah, ieri abbiamo chiuso presto! E di dove siete?' }, { who: 'learner', text: es ? 'Somos de Seattle, pero ahora vivo aquí por unos meses.' : 'Siamo di Seattle, ma adesso abito qui per qualche mese.' },
    ] }]
  );
  console.log(`  friend answered onboarding: ${friend.level} (${friend.reason})\n  shy, answered in English: ${shy.level} (${shy.reason})`);
  check(friend.level === 'beginner', `a beginner whose friend answered onboarding should be beginner (got ${friend.level})`);
  check(shy.level === 'intermediate', `a shy intermediate who answered onboarding in English should be intermediate (got ${shy.level})`);
}

async function database() {
  const { query, closePool } = await import('@/lib/db');
  const me = randomUUID();
  const judged: number[] = [];
  const fake: LevelJudge = async (_answers, cs) => { judged.push(cs.length); return { level: 'beginner', reason: 'test' }; };
  try {
    await query('INSERT INTO learners (id, level, onboarding) VALUES ($1, $2, $3)', [me, 'intermediate', JSON.stringify({ path: 'speaker', answers: [{ text: 'a' }, { text: 'b' }] })]);
    const ids: string[] = [];
    for (let i = 0; i < LEVEL_CHECKS + 1; i++) {
      const id = randomUUID(); ids.push(id);
      const turns = [{ who: 'npc', text: 'Ciao' }, { who: 'learner', text: 'ciao' }, { who: 'npc', text: 'Come stai?' }, { who: 'learner', text: 'bene' }];
      await query('INSERT INTO conversations (id, learner_id, character_id, city_id, started_at, turns) VALUES ($1, $2, $3, $4, $5, $6)', [id, me, `someone-${i}`, 'roma', new Date(Date.now() + i * 1000), JSON.stringify(turns)]);
    }
    const magda = randomUUID();
    await query('INSERT INTO conversations (id, learner_id, character_id, city_id, started_at, turns) VALUES ($1, $2, $3, $4, now(), $5)', [magda, me, tutor.id, 'roma', JSON.stringify([{ who: 'npc', text: 'Ciao' }, { who: 'learner', text: 'a' }, { who: 'npc', text: 'b' }, { who: 'learner', text: 'c' }])]);

    const off = await checkLearnerLevel(ids[0], me, fake);
    check(off === 'off' && judged.length === 0, `setting off: nothing judged (got ${off})`);

    process.env.LEVEL_CHECK = me;
    const r1 = await checkLearnerLevel(ids[0], me, fake);
    const row = (await query<{ level: string; level_checks: LevelCheck[] }>('SELECT level, level_checks FROM learners WHERE id = $1', [me])).rows[0];
    check(r1 === 'changed' && row.level === 'beginner', `first check moves intermediate to beginner (got ${r1}, ${row.level})`);
    check(row.level_checks.length === 1 && row.level_checks[0].before === 'intermediate' && row.level_checks[0].reason === 'test', 'the check is kept with what it was before and why');
    check((await checkLearnerLevel(ids[0], me, fake)) === 'done', 'the same conversation ending again is not checked twice');
    check((await checkLearnerLevel(ids[1], me, fake)) === 'kept' && judged[judged.length - 1] === 2, 'second check reads both conversations');
    await checkLearnerLevel(ids[2], me, fake);
    check((await checkLearnerLevel(ids[3], me, fake)) === 'done', `after ${LEVEL_CHECKS} checks it stops`);
    check(judged.every((n) => n <= LEVEL_CHECKS), 'Magda\'s lessons are never read');
  } finally {
    delete process.env.LEVEL_CHECK;
    await query('DELETE FROM learners WHERE id = $1', [me]).catch(() => {});
    await closePool();
  }
}

(async () => {
  if (process.env.ANTHROPIC_API_KEY) await live();
  else console.log('(no ANTHROPIC_API_KEY: judge not run)');
  if (!process.env.DATABASE_URL) console.log('(database part SKIPPED: set DATABASE_URL to a local test database)');
  else if (/railway/.test(process.env.DATABASE_URL)) problems.push('Refusing to write test data to Railway. Use a local database.');
  else await database();
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  console.log(`OK: level check ${learnerLevelPromptVersion()}: off by default, reads the right conversations, stops after ${LEVEL_CHECKS} (${pack.id})`);
})();
