/**
 * Smoke test for character memory against a running server (local or Railway),
 * so checking memory needs no debug mode in the app.
 *
 *   npm run smoke:memory -- --url=https://fuori-production.up.railway.app
 *
 * Holds a short typed conversation with Sandro (Bar Angolo, Roma) as a new
 * anonymous learner, ends it the way the phone does, then opens a second visit
 * and checks the character now remembers (x-memory header). Makes 4 character
 * replies and 1 memory call (real Claude). Prints the test learner's id so its
 * rows can be deleted afterwards (deleting the learner cascades).
 */
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content';
import type { Turn } from '@/lib/types';

const base = (process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'http://localhost:3000').replace(/\/$/, '');
const roma = cities.find((c) => c.id === 'roma')!;
const character = characterForPlace(roma, roma.places.find((p) => p.characterId === 'sandro-bar-angolo')!)!;
const learnerLines = ['Buongiorno, un cappuccino per favore', 'Mi chiamo Josh, abito a Trastevere da due settimane'];

let cookie = '';
async function post(path: string, body: unknown) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
  const set = res.headers.get('set-cookie')?.match(/fuori_learner_id=[^;]+/)?.[0];
  if (set) cookie = set;
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return res;
}

async function turn(transcript: Turn[], learnerSaid?: string, conversationId?: string | null) {
  const res = await post('/api/turn', { character, transcript, cityId: 'roma', learnerSaid, conversationId });
  const reply = (await res.json()) as { line: string };
  return { reply: reply.line, id: res.headers.get('x-conversation-id'), memory: res.headers.get('x-memory') };
}

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

async function main() {
  console.log(`Server: ${base}\nCharacter: ${character.name}, ${character.role}\n`);

  // First visit
  const first = await turn([]);
  if (!first.id) fail('opening line was not recorded (no x-conversation-id): is DATABASE_URL set on the server?');
  if (!first.memory?.startsWith('0 visits')) fail(`a new learner should be a stranger, got x-memory "${first.memory}"`);
  console.log(`THEM: ${first.reply}`);
  const transcript: Turn[] = [{ who: 'npc', transcript: first.reply }];
  for (const said of learnerLines) {
    const r = await turn(transcript, said, first.id);
    console.log(`YOU : ${said}\nTHEM: ${r.reply}`);
    transcript.push({ who: 'learner', transcript: said }, { who: 'npc', transcript: r.reply });
  }

  // Leaving: the server writes memory before answering the beacon
  const t = Date.now();
  await post('/api/conversation/end', { conversationId: first.id });
  console.log(`\nEnded (memory written in ${Date.now() - t} ms)\n`);

  // Second visit
  const second = await turn([]);
  console.log(`Second visit, x-memory: ${second.memory}\nTHEM: ${second.reply}\n`);
  const m = second.memory?.match(/^(\d+) visits, (\d+) notes$/);
  if (!m || m[1] !== '1' || m[2] === '0') fail(`expected "1 visits, N notes" on the second visit, got "${second.memory}"`);
  if (!/josh/i.test(second.reply)) console.log('(note: the greeting does not use the name; not a failure, just worth a look)');

  console.log(`OK: memory written at the end and loaded on the next visit`);
  console.log(`Test learner: ${cookie.split('=')[1]} (delete it to remove these rows)`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
