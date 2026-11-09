/**
 * Replies written ahead for a Beginner's offered answers, end to end against a
 * running server with a database (/v1/turn, lib/draft-turns.ts). Needs a
 * server that has this code: a local one (`npm run dev:sim`, port 3100, the
 * test database) or the live one after a release. Makes a new learner there.
 *   npx tsx scripts/check-draft-turn.ts [--url=http://localhost:3100] [--rounds=3]   (COUNTRY=es-mx for Mexico)
 * Each round: her line offers answers; wait while she'd be speaking; say one
 * back (lower case, no punctuation, as speech-to-text might give it) and time
 * the reply; then answer off script and time that. Checks: answers said back
 * come back fast; each turn is stored once, with the learner's own words; the
 * replies written for answers not said are nowhere in the conversation.
 */
import { Client } from 'pg';
import { cities, tutor } from '@/content';

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const base = (arg('url') ?? 'http://localhost:3100').replace(/\/$/, '');
const rounds = Number(arg('rounds') ?? 3);
const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id))!;
const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id)!;
let failed = 0;
const check = (ok: boolean, msg: string) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) failed++; };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const spoken = (s: string) => s.toLowerCase().replace(/[.,!?¿¡]/g, '').trim();
type Reply = { line?: string; conversationId?: string; parts?: { kind: string; text: string }[] };
const answersOf = (r: Reply) => (r.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);

async function main() {
  const dev = (await (await fetch(`${base}/v1/auth/device`, { method: 'POST' })).json()) as { token: string };
  const headers = { authorization: `Bearer ${dev.token}`, 'content-type': 'application/json' };
  const post = async (body: object): Promise<{ ms: number; ok: boolean; reply: Reply }> => {
    const t0 = Date.now();
    const r = await fetch(`${base}/v1/turn`, { method: 'POST', headers, body: JSON.stringify({ cityId: city.id, placeId: place.id, ...body }) });
    const reply = (await r.json()) as Reply;
    return { ms: Date.now() - t0, ok: r.ok, reply };
  };
  // The server's own database (the local test one by default)
  const db = new Client({ connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost/fuori_test' });
  await db.connect();
  const storedTurns = async (id: string) =>
    ((await db.query<{ turns: { who: string; text: string }[] }>('SELECT turns FROM conversations WHERE id = $1', [id])).rows[0]?.turns ?? []);

  let last = (await post({})).reply;
  const id = last.conversationId!;
  check(!!id && answersOf(last).length > 0, `the opening offers answers (${answersOf(last).length})`);
  const fast: number[] = [];
  const plain: number[] = [];
  let expectLines = 1;
  const saidLines: string[] = [];
  for (let k = 0; k < rounds; k++) {
    const answers = answersOf(last);
    if (!answers.length) { console.log('no answers offered; stopping'); break; }
    await wait(8000); // she's speaking; they answer
    const whole = answers.filter((a) => !a.includes('…'));
    if (!whole.length) { console.log(`only an answer with a blank (${answers[0]}): not written ahead; stopping`); break; }
    const said = spoken(whole[0]);
    const back = await post({ conversationId: id, learnerSaid: said });
    check(back.ok && !!back.reply.line, `said back "${said}": ${back.ms} ms`);
    fast.push(back.ms);
    saidLines.push(said);
    expectLines += 2;
    last = back.reply;
    if (!answersOf(last).length) break;
    await wait(8000);
    const off = await post({ conversationId: id, learnerSaid: 'Non lo so, mi piace molto questa città' });
    check(off.ok && !!off.reply.line, `off script: ${off.ms} ms`);
    plain.push(off.ms);
    saidLines.push('Non lo so, mi piace molto questa città');
    expectLines += 2;
    last = off.reply;
  }
  await wait(3000);
  const turns = await storedTurns(id);
  check(turns.length === expectLines, `stored once each: ${turns.length} lines, expected ${expectLines} (no reply for an unsaid answer)`);
  const learner = turns.filter((t) => t.who === 'learner').map((t) => t.text);
  check(learner.length === saidLines.length && learner.every((t, i) => t === saidLines[i]), `stored with the learner's own words: ${JSON.stringify(learner)}`);
  await db.end();
  const med = (a: number[]) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : NaN);
  console.log(`said back: median ${med(fast)} ms ${JSON.stringify(fast)}; off script: median ${med(plain)} ms ${JSON.stringify(plain)}`);
  check(med(fast) < med(plain) / 2, 'answers said back come back in under half the time');
  console.log(failed ? `${failed} failed` : 'all ok');
  process.exit(failed ? 1 : 0);
}
main();
