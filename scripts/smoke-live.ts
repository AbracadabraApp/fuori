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
 * the learner; Magda at the school has the study file; a short lesson updates it;
 * then the app's API, including onboarding. About 6 Claude replies
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

// Two onboarding answers (the speaker path): English first, as people often start
const ONBOARDING_ANSWERS: Record<string, string[]> = {
  it: ['I love the food and the little towns', 'Sì, è la mia terza volta in Italia, mi piace molto'],
  es: ['I love the food and the markets', 'Sí, es mi tercera vez en México, me gusta mucho'],
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

// Ids, not the sheet: the server works out the character (lib/characters/for-visit.ts)
async function turn(placeId: string, cityId: string, transcript: Turn[], learnerSaid?: string, conversationId?: string | null) {
  const res = await post('/api/turn', { cityId, placeId, transcript, learnerSaid, conversationId });
  if (!res.ok) throw new Error(`/api/turn → ${res.status} ${(await res.text()).slice(0, 200)}`);
  const reply = (await res.json()) as { line: string };
  return { line: reply.line, res };
}

function cleanup(learnerId: string) {
  if (keep || !learnerId) return console.log(`Test learner kept: ${learnerId}`);
  if (!/^[0-9a-f-]{36}$/.test(learnerId)) return;
  try {
    const js = `const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:/railway\\.internal/.test(process.env.DATABASE_URL)?false:{rejectUnauthorized:false}});p.query("DELETE FROM learners WHERE id='${learnerId}'").then(r=>{console.log(r.rowCount);return p.end()})`;
    // railway ssh passes arguments as they are, with no shell in between: the
    // script goes as-is (JSON-quoting it made node evaluate a string and do nothing)
    const out = execFileSync('railway', ['ssh', '--service', country === 'it' ? 'Fuori' : 'Afuera', '--', 'node', '-e', js], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const rows = out.trim().split('\n').pop();
    if (rows !== '1') throw new Error(`deleted ${rows} rows`);
    console.log(`Test learner deleted (${learnerId})`);
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
  const open = await turn(place.id, city.id, []);
  const id = open.res.headers.get('x-conversation-id');
  id ? pass('conversation recorded') : fail('conversation recorded', 'no x-conversation-id (DATABASE_URL on the server?)');
  open.res.headers.get('x-memory')?.startsWith('0 visits') ? pass('new learner is a stranger') : fail('new learner is a stranger', `x-memory "${open.res.headers.get('x-memory')}"`);
  const transcript: Turn[] = [{ who: 'npc', transcript: open.line }];
  for (const said of lines) {
    const r = await turn(place.id, city.id, transcript, said, id);
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
  const again = await turn(place.id, city.id, []);
  const mem = again.res.headers.get('x-memory') ?? '';
  /^1 visits, [1-9]/.test(mem) ? pass(`character remembers (${mem})`) : fail('character remembers', `x-memory "${mem}"`);

  // 6. Magda at the school, with the study file the conversation just fed
  const lesson = await turn(school.id, city.id, []);
  const v = lesson.res.headers.get('x-prompt-version') ?? '';
  v.startsWith('magda-') ? pass(`Magda found at ${school.name} (${v})`) : fail('Magda found at the school', `prompt version "${v}"`);
  const sf = lesson.res.headers.get('x-study-file') ?? '';
  /^[1-9]\d* lines, 0 lessons$/.test(sf) ? pass(`study file ready for the first lesson (${sf})`) : fail('study file ready for the first lesson', `x-study-file "${sf}"`);
  console.log(`Magda: ${lesson.line}\n`);

  // 7. A short lesson, then leaving: the study file is updated and counts one lesson
  const lessonId = lesson.res.headers.get('x-conversation-id');
  const lt: Turn[] = [{ who: 'npc', transcript: lesson.line }];
  for (const said of LESSON_LINES[language.code]) {
    const r = await turn(school.id, city.id, lt, said, lessonId);
    lt.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: r.line });
  }
  await post('/api/conversation/end', { conversationId: lessonId });
  const next = await turn(school.id, city.id, []);
  const sf2 = next.res.headers.get('x-study-file') ?? '';
  /^[1-9]\d* lines, 1 lessons$/.test(sf2) ? pass(`study file updated after the lesson (${sf2})`) : fail('study file updated after the lesson', `x-study-file "${sf2}"`);

  await appApi(city.id, place.id, person.id, lines);
}

// The iPhone app's API (/v1, docs/12-native-app.md): sign in with a device
// token, the content and its images, a conversation by ids with the
// transcript kept on the server, the end call, the stamp, a return visit,
// the voice and speech to text.
let appLearner = '';
let onboardingLearner = '';
async function appApi(cityId: string, placeId: string, characterId: string, said: string[]) {
  const health = await fetch(`${base}/healthz`);
  const h = (await health.json().catch(() => ({}))) as { ok?: boolean; commit?: string; promptVersion?: string };
  h.ok ? pass(`healthz (commit ${h.commit}, prompt ${h.promptVersion})`) : fail('healthz', `status ${health.status}`);

  const content = (await (await fetch(`${base}/v1/content`)).json()) as { version: string; cities: { id: string; image: string; places: { id: string }[] }[] };
  const shown = cities.filter((c) => !c.hidden).length;
  const img = await fetch(content.cities?.[0]?.image ?? '', { method: 'HEAD' }).catch(() => null);
  content.cities?.length === shown && img?.ok && img.headers.get('content-type') === 'image/webp'
    ? pass(`v1 content (${content.cities.length} cities, version ${content.version}, images on R2)`)
    : fail('v1 content', `${content.cities?.length} cities (expected ${shown}), image ${img?.status}`);

  const anon = await fetch(`${base}/v1/me`);
  anon.status === 401 ? pass('v1 refuses calls without a token') : fail('v1 refuses calls without a token', `status ${anon.status}`);

  const reg = (await (await fetch(`${base}/v1/auth/device`, { method: 'POST' })).json()) as { learnerId: string; token: string };
  appLearner = reg.learnerId ?? '';
  const auth = { Authorization: `Bearer ${reg.token}` };
  const v1 = (path: string, body: unknown) =>
    fetch(base + path, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  reg.token ? pass('v1 device signed in') : fail('v1 device signed in', JSON.stringify(reg));

  const open = await v1('/v1/turn', { cityId, placeId });
  const o = (await open.json()) as { line: string; conversationId: string; replies?: unknown };
  // Whether the next turn is a tap on the reply buttons (lib/scaffold.ts); this
  // learner has no level yet, so it's the mic
  o.replies === true ? pass('v1 turn says mic or buttons (buttons: no level yet counts as new)') : fail('v1 turn replies flag', JSON.stringify(o.replies));
  // Two learner lines: memory is only written after at least two (lib/remember.ts)
  let reply = open;
  let r: { line?: string; conversationId?: string } = {};
  for (const line of said) {
    reply = await v1('/v1/turn', { cityId, placeId, conversationId: o.conversationId, learnerSaid: line });
    r = (await reply.json()) as typeof r;
  }
  open.ok && reply.ok && r.conversationId === o.conversationId
    ? pass('v1 conversation by ids (transcript kept on the server)')
    : fail('v1 conversation by ids', `${open.status}/${reply.status} ${JSON.stringify(r).slice(0, 200)}`);

  // The reply buttons for beginner levels 1–3 (docs/beginner-scaffolding.md): two
  // whole-line replies to the character's last line, read from the database
  const rep = await v1('/v1/replies', { cityId, placeId, conversationId: o.conversationId });
  const rp = (await rep.json()) as { frame?: string; replies?: { line?: string; en?: string }[] };
  rep.ok && rp.replies?.length === 2 && rp.replies.every((x) => x.line?.trim() && x.en?.trim())
    ? pass(`v1 replies ("${rp.replies[0].line?.slice(0, 30)}" / "${rp.replies[1].line?.slice(0, 30)}")`)
    : fail('v1 replies', `${rep.status} ${JSON.stringify(rp).slice(0, 200)}`);

  const end = await v1(`/v1/conversations/${o.conversationId}/end`, {});
  const e = (await end.json()) as { remembered?: string };
  e.remembered === 'saved' ? pass('v1 conversation end saved memory') : fail('v1 conversation end', `${end.status} ${JSON.stringify(e)}`);

  const me = (await (await fetch(`${base}/v1/me`, { headers: auth })).json()) as { visits?: Record<string, number> };
  me.visits?.[placeId] === 1 ? pass('v1 me counts the visit') : fail('v1 me counts the visit', JSON.stringify(me));

  const again = await v1('/v1/turn', { cityId, placeId });
  const mem = again.headers.get('x-memory') ?? '';
  /^1 visits, [1-9]/.test(mem) ? pass(`v1 character remembers (${mem})`) : fail('v1 character remembers', `x-memory "${mem}"`);

  const speak = await v1('/v1/speak', { text: o.line.split(/(?<=[.!?])\s/)[0], characterId });
  const audio = speak.ok ? await speak.blob() : null;
  speak.ok && speak.headers.get('content-type') === 'audio/mpeg' ? pass(`v1 speak (${audio?.size} bytes)`) : fail('v1 speak', `${speak.status} ${await speak.text()}`);

  if (audio) {
    const form = new FormData();
    form.append('audio', new File([audio], 'speech.mp3', { type: 'audio/mpeg' }));
    const tr = await fetch(`${base}/v1/transcribe`, { method: 'POST', headers: auth, body: form });
    const t = (await tr.json()) as { text?: string };
    tr.ok && t.text?.trim() ? pass(`v1 transcribe ("${t.text.trim().slice(0, 40)}")`) : fail('v1 transcribe', `${tr.status} ${JSON.stringify(t)}`);
    // Onboarding answers can be in English: no language set, Whisper says which it heard
    const anyForm = new FormData();
    anyForm.append('audio', new File([audio], 'speech.mp3', { type: 'audio/mpeg' }));
    anyForm.append('mode', 'any');
    const ta = (await (await fetch(`${base}/v1/transcribe`, { method: 'POST', headers: auth, body: anyForm })).json()) as { text?: string; language?: string };
    ta.text?.trim() && ta.language ? pass(`v1 transcribe, any language (heard ${ta.language})`) : fail('v1 transcribe, any language', JSON.stringify(ta));
  }

  // This learner has talked to someone: counted as onboarded without the greeter (Josh, 2026-10-17)
  const played = (await (await fetch(`${base}/v1/me`, { headers: auth })).json()) as { onboarded?: boolean };
  played.onboarded === true ? pass('v1 me: a learner who has already played is onboarded') : fail('v1 me: a learner who has already played is onboarded', JSON.stringify(played));

  // Onboarding itself on a fresh device, as a new learner meets it
  const fresh = (await (await fetch(`${base}/v1/auth/device`, { method: 'POST' })).json()) as { learnerId: string; token: string };
  onboardingLearner = fresh.learnerId ?? '';
  const freshAuth = { Authorization: `Bearer ${fresh.token}` };
  await onboardingApi(freshAuth, (path, body) =>
    fetch(base + path, { method: 'POST', headers: { ...freshAuth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  );

  // Restart onboarding brings the greeter back even for someone who has played
  const restart = await v1('/v1/onboarding/reset', {});
  const restarted = (await (await fetch(`${base}/v1/me`, { headers: auth })).json()) as { onboarded?: boolean };
  restart.status === 204 && restarted.onboarded === false ? pass('v1 onboarding reset works for a learner who has played') : fail('v1 onboarding reset for a learner who has played', `${restart.status} ${JSON.stringify(restarted)}`);
}

// The greeter (docs/onboarding-design.md): a new learner isn't onboarded; her
// content, voice, follow-up and send-off; the level is stored; Restart
// onboarding clears it; the beginner path stores beginner.
async function onboardingApi(auth: Record<string, string>, v1: (path: string, body: unknown) => Promise<Response>) {
  const me = async () => (await (await fetch(`${base}/v1/me`, { headers: auth })).json()) as { level?: string | null; onboarded?: boolean };
  const first = await me();
  first.onboarded === false && first.level === null ? pass('v1 me: a new learner is not onboarded') : fail('v1 me: a new learner is not onboarded', JSON.stringify(first));

  const content = (await (await fetch(`${base}/v1/content`)).json()) as { onboarding?: { guide: { id: string; poses: Record<string, string | null> }; lines: Record<string, { line: string; en: string }> } };
  const ob = content.onboarding;
  const poses = Object.values(ob?.guide.poses ?? {});
  poses.length === 4 && poses.every(Boolean) && ob?.lines.welcome?.line ? pass('v1 content: her lines and four poses') : fail('v1 content: onboarding', JSON.stringify(ob).slice(0, 200));
  if (!ob) return;

  const speak = await v1('/v1/speak', { text: ob.lines.welcome.line, characterId: ob.guide.id });
  speak.ok && speak.headers.get('content-type') === 'audio/mpeg' ? pass('v1 speak in her voice') : fail('v1 speak in her voice', `${speak.status} ${await speak.text()}`);

  const answers = ONBOARDING_ANSWERS[language.code];
  const fu = await v1('/v1/onboarding/follow-up', { answer: { text: answers[0], language: 'english' } });
  const f = (await fu.json()) as { line?: string; en?: string };
  fu.ok && f.line?.trim().endsWith('?') && f.en ? pass(`v1 onboarding follow-up ("${f.line.slice(0, 50)}…")`) : fail('v1 onboarding follow-up', `${fu.status} ${JSON.stringify(f)}`);

  const so = await v1('/v1/onboarding/send-off', { answers: answers.map((text) => ({ text })) });
  const sf = (await so.json()) as { line?: string; level?: string };
  const after = await me();
  so.ok && sf.line?.endsWith(ob.lines.help.line) && after.onboarded && after.level === sf.level
    ? pass(`v1 onboarding send-off placed and stored ${sf.level}`)
    : fail('v1 onboarding send-off', `${so.status} ${JSON.stringify(sf)} me ${JSON.stringify(after)}`);

  // Name and address (docs/onboarding-design.md): saved for every character, changed in Settings; off until migrated
  const addr = await v1('/v1/onboarding/address', { addressedAs: 'f', name: 'Teresa' });
  if (addr.status === 404) pass('v1 onboarding address: off on this server (LEARNER_ADDRESS not on)');
  else {
    const chose = (await me()) as { addressedAs?: string };
    const changed = await v1('/v1/me/address', { addressedAs: 'm' });
    const now = (await me()) as { addressedAs?: string };
    addr.status === 204 && chose.addressedAs === 'f' && changed.status === 204 && now.addressedAs === 'm'
      ? pass('v1 onboarding address saved, and changed in Settings')
      : fail('v1 address', `${addr.status} ${JSON.stringify(chose)} then ${changed.status} ${JSON.stringify(now)}`);
  }

  const reset = await v1('/v1/onboarding/reset', {});
  const cleared = await me();
  reset.status === 204 && cleared.onboarded === false && cleared.level === null ? pass('v1 onboarding reset (Restart onboarding)') : fail('v1 onboarding reset', `${reset.status} ${JSON.stringify(cleared)}`);

  const done = await v1('/v1/onboarding/done', { path: 'beginner' });
  const beginner = await me();
  done.ok && beginner.onboarded && beginner.level === 'beginner' ? pass('v1 onboarding done: beginner path') : fail('v1 onboarding done', `${done.status} ${JSON.stringify(beginner)}`);
}

main()
  .catch((e) => fail('run', e instanceof Error ? e.message : String(e)))
  .finally(() => {
    console.log(results.join('\n') + '\n');
    cleanup(cookie.split('=')[1] ?? '');
    cleanup(appLearner);
    cleanup(onboardingLearner);
    console.log(failed ? '\nFAILED' : '\nOK: the live site works end to end');
    process.exit(failed ? 1 : 0);
  });
