/**
 * The reply prepared during the silence, end to end against a running server
 * with a database (docs/12-native-app.md item 5). Needs a server that has this
 * code: a local one (`npm run dev:sim`, port 3100, the test database) or the
 * live one after a release. Makes a new learner on that server.
 *   npx tsx scripts/check-draft-turn.ts [--url=http://localhost:3100]   (COUNTRY=es-mx for Mexico)
 * Checks: a draft stores nothing; the same turn sent after it stores one
 * exchange (and answers fast); a draft spoken over (another line sent instead)
 * never appears in the conversation; the turn after still works.
 */
import { cities, tutor, country } from '@/content';

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const base = (arg('url') ?? 'http://localhost:3100').replace(/\/$/, '');
const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id))!;
const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id)!;
const lines = country === 'es-mx' ? ['Quiero un café, por favor.', 'Y también un vaso de agua.', 'Gracias, hasta luego.'] : ['Vorrei un caffè, per favore.', 'E anche un bicchiere d’acqua.', 'Grazie, a dopo.'];
let failed = 0;
const check = (ok: boolean, msg: string) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) failed++; };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const dev = (await (await fetch(`${base}/v1/auth/device`, { method: 'POST' })).json()) as { token: string };
  const headers = { authorization: `Bearer ${dev.token}`, 'content-type': 'application/json' };
  const post = (body: object) => fetch(`${base}/v1/turn`, { method: 'POST', headers, body: JSON.stringify({ cityId: city.id, placeId: place.id, ...body }) });
  const linesIn = async (id: string) => {
    const r = (await (await fetch(`${base}/v1/me/conversations`, { headers })).json()) as { conversations?: { id: string; lines: number }[] };
    return r.conversations?.find((c) => c.id === id)?.lines ?? 0;
  };

  const opening = (await (await post({})).json()) as { conversationId: string };
  const id = opening.conversationId;
  await wait(1500);
  const start = await linesIn(id);

  // A draft stores nothing
  const d = await post({ conversationId: id, learnerSaid: lines[0], draft: true });
  check(d.ok && ((await d.json()) as { draft?: string }).draft === 'started', 'the draft is accepted');
  await wait(7000);
  check((await linesIn(id)) === start, 'a written draft stores no turn');

  // The same turn, sent for real: answered from the draft, stored once
  const t0 = Date.now();
  const r = await post({ conversationId: id, learnerSaid: lines[0] });
  const reply = (await r.json()) as { line?: string };
  const ms = Date.now() - t0;
  check(r.ok && !!reply.line, `the confirmed turn is answered (${ms} ms; a plain turn takes 2000 ms or more)`);
  check(ms < 1500, 'the draft made it quick');
  await wait(2000);
  check((await linesIn(id)) === start + 2, 'the confirmed turn is stored once (their line and her reply)');

  // Spoken over: a draft for one line, then another line is sent instead
  await post({ conversationId: id, learnerSaid: lines[1], draft: true });
  await wait(2000);
  const other = await post({ conversationId: id, learnerSaid: lines[2] });
  check(other.ok, 'a different turn after a draft is answered normally');
  await wait(7000);
  check((await linesIn(id)) === start + 4, 'the spoken-over draft is nowhere in the conversation');

  // Drafts are refused for an opening
  const bad = await post({ draft: true });
  check(bad.status === 400, 'a draft without a turn is refused');
  console.log(failed ? `${failed} failed` : 'all ok');
  process.exit(failed ? 1 : 0);
}
main();
