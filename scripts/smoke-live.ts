/**
 * Smoke test against the live site: plays a fresh learner the way a person
 * would and checks every connection that M2 shipped without (docs/11-lessons-learned.md).
 * "Done" means this passes (CLAUDE.md, Definition of done).
 *
 *   npm run smoke:live                      # Italy, fuori-production
 *   COUNTRY=es-mx npm run smoke:live        # Mexico, afuera-production
 *   npm run smoke:live -- --url=http://localhost:3000 --keep
 *
 * Steps: the site loads; a conversation is recorded; leaving writes memory and
 * the study file; the visit is counted for the stamp; a second visit remembers
 * the learner; Magda at the school has the study file; a short lesson updates it. About 6 Claude replies
 * plus memory and the study file (a few minutes, a few cents). Deletes the test
 * learner afterwards through `railway ssh` (skip with --keep).
 */
import { execFileSync } from 'child_process';
import { cities, tutor, language, country } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import type { CharacterSheet, Turn } from '@/lib/types';

const LIVE: Record<string, string> = {
  it: 'https://fuori-production.up.railway.app',
  'es-mx': 'https://afuera-production.up.railway.app',
};
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const base = (arg('url') ?? LIVE[country]).replace(/\/$/, '');
const keep = process.argv.includes('--keep');

// Two learner lines with a mistake each, so the learning notes have something to find
const LINES: Record<string, string[]> = {
  it: ['Io vuole un caffè, per favore', 'Ieri io vado al mercato con mio amico'],
  es: ['Yo quiere un café, por favor', 'Ayer yo voy al mercado con mi amigo'],
};
// Two answers in a lesson with Magda
const LESSON_LINES: Record<string, string[]> = {
  it: ['Sì, va bene. Io voglio un caffè', 'Vorrei un caffè, per favore'],
  es: ['Sí, está bien. Yo quiero un café', 'Quisiera un café, por favor'],
};

let cookie = '';
const results: string[] = [];
let failed = false;
const pass = (step: string) => results.push(`  ok   ${step}`);
const fail = (step: string, why: string) => { results.push(`  FAIL ${step}: ${why}`); failed = true; };

async function post(path: string, body: unknown) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
  const set = res.headers.get('set-cookie')?.match(/fuori_learner_id=[^;]+/)?.[0];
  if (set) cookie = set;
  return res;
}

async function turn(character: CharacterSheet, cityId: string, transcript: Turn[], learnerSaid?: string, conversationId?: string | null) {
  const res = await post('/api/turn', { character, cityId, transcript, learnerSaid, conversationId });
  if (!res.ok) throw new Error(`/api/turn → ${res.status} ${(await res.text()).slice(0, 200)}`);
  const reply = (await res.json()) as { line: string };
  return { line: reply.line, res };
}

function cleanup(learnerId: string) {
  if (keep || !learnerId) return console.log(`Test learner kept: ${learnerId}`);
  if (!/^[0-9a-f-]{36}$/.test(learnerId)) return;
  try {
    const js = `const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:/railway\\.internal/.test(process.env.DATABASE_URL)?false:{rejectUnauthorized:false}});p.query("DELETE FROM learners WHERE id='${learnerId}'").then(r=>{console.log(r.rowCount);return p.end()})`;
    const out = execFileSync('railway', ['ssh', '--', 'node', '-e', JSON.stringify(js)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    console.log(`Test learner deleted (${out.trim().split('\n').pop()} row)`);
  } catch {
    console.log(`Could not delete the test learner automatically; delete ${learnerId} from learners (rows cascade).`);
  }
}

async function main() {
  const lines = LINES[language.code];
  if (!lines) throw new Error(`no test lines for language ${language.code}; add them to LINES`);

  // A city with a school, and an ordinary character there
  const city = cities.find((c) => !c.hidden && c.places.some((p) => p.characterId === tutor.id)) ?? cities.find((c) => c.places.some((p) => p.characterId === tutor.id))!;
  const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id && characterForPlace(city, p)?.origin === 'generated')!;
  const person = characterForPlace(city, place)!;
  const school = city.places.find((p) => p.characterId === tutor.id)!;
  const magda = characterForPlace(city, school)!;
  console.log(`${base} · ${country} · ${person.name} (${place.name}) and Magda (${school.name}), ${city.name}\n`);

  // 1. The site loads and serves this country
  const home = await fetch(base);
  const html = await home.text();
  home.ok && html.includes(cities[0].name) ? pass('site loads this country') : fail('site loads this country', `${home.status}, "${cities[0].name}" not on the page`);

  // 2. A conversation is recorded
  const open = await turn(person, city.id, []);
  const id = open.res.headers.get('x-conversation-id');
  id ? pass('conversation recorded') : fail('conversation recorded', 'no x-conversation-id (DATABASE_URL on the server?)');
  open.res.headers.get('x-memory')?.startsWith('0 visits') ? pass('new learner is a stranger') : fail('new learner is a stranger', `x-memory "${open.res.headers.get('x-memory')}"`);
  const transcript: Turn[] = [{ who: 'npc', transcript: open.line }];
  for (const said of lines) {
    const r = await turn(person, city.id, transcript, said, id);
    transcript.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: r.line });
  }

  // 3. Leaving writes memory, learning notes and the study file (the server finishes before answering)
  const t0 = Date.now();
  const end = await post('/api/conversation/end', { conversationId: id });
  end.status === 204 ? pass(`conversation ended (memory and study file took ${Math.round((Date.now() - t0) / 1000)}s)`) : fail('conversation ended', `status ${end.status}`);

  // 4. The visit is counted for the stamp
  const visits = (await (await fetch(`${base}/api/visits?city=${encodeURIComponent(city.id)}`, { headers: { Cookie: cookie } })).json()) as Record<string, number>;
  visits[place.id] === 1 ? pass('visit counted for the stamp') : fail('visit counted for the stamp', JSON.stringify(visits));

  // 5. A second visit: the character remembers
  const again = await turn(person, city.id, []);
  const mem = again.res.headers.get('x-memory') ?? '';
  /^1 visits, [1-9]/.test(mem) ? pass(`character remembers (${mem})`) : fail('character remembers', `x-memory "${mem}"`);

  // 6. Magda at the school, with the study file the conversation just fed
  const lesson = await turn(magda, city.id, []);
  const v = lesson.res.headers.get('x-prompt-version') ?? '';
  v.startsWith('magda-') ? pass(`Magda found at ${school.name} (${v})`) : fail('Magda found at the school', `prompt version "${v}"`);
  const sf = lesson.res.headers.get('x-study-file') ?? '';
  /^[1-9]\d* lines, 0 lessons$/.test(sf) ? pass(`study file ready for the first lesson (${sf})`) : fail('study file ready for the first lesson', `x-study-file "${sf}"`);
  console.log(`Magda: ${lesson.line}\n`);

  // 7. A short lesson, then leaving: the study file is updated and counts one lesson
  const lessonId = lesson.res.headers.get('x-conversation-id');
  const lt: Turn[] = [{ who: 'npc', transcript: lesson.line }];
  for (const said of LESSON_LINES[language.code]) {
    const r = await turn(magda, city.id, lt, said, lessonId);
    lt.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: r.line });
  }
  await post('/api/conversation/end', { conversationId: lessonId });
  const next = await turn(magda, city.id, []);
  const sf2 = next.res.headers.get('x-study-file') ?? '';
  /^[1-9]\d* lines, 1 lessons$/.test(sf2) ? pass(`study file updated after the lesson (${sf2})`) : fail('study file updated after the lesson', `x-study-file "${sf2}"`);
}

main()
  .catch((e) => fail('run', e instanceof Error ? e.message : String(e)))
  .finally(() => {
    console.log(results.join('\n') + '\n');
    cleanup(cookie.split('=')[1] ?? '');
    console.log(failed ? '\nFAILED' : '\nOK: the live site works end to end');
    process.exit(failed ? 1 : 0);
  });
