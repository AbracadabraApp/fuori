// Character memory (2026-10-12): notes and review log written when a conversation
// ends, notes back in the prompt next visit. The prompt part always runs. The
// database part runs against DATABASE_URL with a fake Claude, and skips without it.
// Locally: createdb fuori_test && DATABASE_URL=postgres://localhost/fuori_test node scripts/db-migrate.mjs
// then DATABASE_URL=postgres://localhost/fuori_test npm run test:memory
import { randomUUID } from 'crypto';
import { buildTurnPrompt, howLongAgo } from '@/lib/prompts/build-turn-prompt';
import { buildMemoryPrompt } from '@/lib/prompts/build-memory-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content/it/cities';
import type { CharacterSheet } from '@/lib/types';
import type { MemoryOutput, Summarizer } from '@/lib/remember';
import type { Judge } from '@/lib/quality';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

// A real city character, so the end-of-conversation call can find their sheet
const city = cities.find((c) => c.places.some((p) => p.characterId && c.characters?.some((x) => x.id === p.characterId)))!;
const place = city.places.find((p) => p.characterId && city.characters?.some((x) => x.id === p.characterId))!;
const person = characterForPlace(city, place) as CharacterSheet;

// --- Prompt: the {relationship} line ---
const now = new Date('2026-10-12T10:00:00');
const fresh = buildTurnPrompt({ character: person, transcript: [], now }).system;
check(fresh.includes("You haven't met them before."), 'no memory: prompt should say they haven\'t met');
check(!fresh.includes('You remember'), 'no memory: prompt should not mention remembering');

const met = buildTurnPrompt({
  character: person, transcript: [], now,
  memory: { visits: 2, lastVisit: new Date('2026-10-11T18:00:00'), notes: ['Their name is Josh', 'Orders a cappuccino'] },
}).system;
check(met.includes("You've met them twice. The last time was yesterday."), `met before: wrong relationship line in:\n${met}`);
check(met.includes('You remember: Their name is Josh; Orders a cappuccino'), 'met before: notes missing');
check(!met.includes("haven't met"), 'met before: still says they haven\'t met');

const noNotes = buildTurnPrompt({ character: person, transcript: [], now, memory: { visits: 1, lastVisit: now, notes: [] } }).system;
check(noNotes.includes("You've met them once. The last time was earlier today.") && !noNotes.includes('You remember'), 'met once, no notes: wrong lines');
check(buildTurnPrompt({ character: person, transcript: [], now, memory: { visits: 0, lastVisit: null, notes: [] } }).system.includes("haven't met"), '0 visits should count as not met');

check(howLongAgo(new Date('2026-10-07T09:00:00'), now) === '5 days ago', 'howLongAgo 5 days');
check(howLongAgo(new Date('2026-09-20T09:00:00'), now) === 'about 3 weeks ago', 'howLongAgo 3 weeks');

// --- Prompt: the memory call ---
const mp = buildMemoryPrompt({ character: person, notes: ['Their name is Josh'], turns: [{ who: 'npc', text: 'Buongiorno!' }, { who: 'learner', text: 'Mi chiamo Josh' }] });
const unfilled = [...(mp.system + mp.user).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
check(unfilled.length === 0, `memory prompt: unfilled ${unfilled.join(', ')}`);
check(mp.user.includes(`${person.name}: Buongiorno!`) && mp.user.includes('Person: Mi chiamo Josh'), 'memory prompt: transcript lines missing');
check(mp.user.includes('Their name is Josh'), 'memory prompt: existing notes missing');
check(mp.system.includes('Italian'), 'memory prompt: language name missing');
check(buildMemoryPrompt({ character: person, notes: [], turns: [] }).user.includes("hadn't met"), 'memory prompt: no-notes wording missing');

// --- Database: claim once, save, count the visit once, release on failure ---
async function dbChecks() {
  const { query, closePool } = await import('@/lib/db');
  const { recordTurn } = await import('@/lib/recording');
  const { loadCharacterMemory, loadMemoryAtStart } = await import('@/lib/memory');
  const { rememberConversation } = await import('@/lib/remember');

  const me = randomUUID();
  await query('INSERT INTO learners (id) VALUES ($1)', [me]);
  try {
    const base = { learnerId: me, character: person, cityId: city.id, promptVersion: 'test' };
    const calls: Parameters<Summarizer>[0][] = [];
    const out: MemoryOutput = { notes: ['Their name is Josh', 'Lives in Trastevere'], review: { items: [{ it: 'magari', en: 'if only', why: 'used twice' }], mistakes: [] } };
    const fake: Summarizer = async (input) => { calls.push(input); await new Promise((r) => setTimeout(r, 50)); return out; };
    // Scoring runs after memory (lib/quality.ts); a fake so this test never calls Claude
    const judged: string[] = [];
    const fakeJudge: Judge = async () => { judged.push('x'); return { pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 1, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, note: 'None' }; };

    const id = (await recordTurn({ ...base, conversationId: null, reply: { it: 'Buongiorno!', en: 'Morning!' }, memory: { visits: 0, lastVisit: null, notes: [] } }))!;
    await recordTurn({ ...base, conversationId: id, learnerSaid: 'Mi chiamo Josh', reply: { it: 'Piacere!', en: 'Nice to meet you!' } });
    check((await rememberConversation(id, me, fake, fakeJudge)) === 'nothing new' && calls.length === 0, 'one learner line should not be remembered yet');

    await recordTurn({ ...base, conversationId: id, learnerSaid: 'Abito a Trastevere', reply: { it: 'Che bello!', en: 'Lovely!' } });
    // Leaving sends two signals at once (background + close): only one writes
    const both = await Promise.all([rememberConversation(id, me, fake, fakeJudge), rememberConversation(id, me, fake, fakeJudge)]);
    check(both.sort().join(',') === 'nothing new,saved', `two end signals at once: ${both.join(', ')}`);
    check(calls.length === 1, `memory call ran ${calls.length} times for one ending`);
    check(calls[0]?.turns.length === 5 && calls[0]?.notes.length === 0, 'memory call got the wrong transcript or notes');

    let mem = await loadCharacterMemory(me, person.id);
    check(mem.visits === 1 && mem.notes.join('|') === out.notes.join('|'), `after first ending: ${JSON.stringify(mem)}`);
    const [row] = (await query<{ review: { items: unknown[]; promptVersion?: string } }>('SELECT review FROM conversations WHERE id = $1', [id])).rows;
    check(row.review?.items.length === 1 && !!row.review.promptVersion, 'review log not saved with its prompt version');

    check((await rememberConversation(id, me, fake, fakeJudge)) === 'nothing new' && calls.length === 1, 'ending again with no new turns rewrote memory');

    // The rest of this conversation still sees what they knew when it started
    const atStart = await loadMemoryAtStart(id, me);
    check(atStart?.visits === 0, `mid-conversation memory should be the start snapshot, got ${JSON.stringify(atStart)}`);
    check((await loadMemoryAtStart(id, randomUUID())) === null, "another learner read this conversation's memory");

    // Coming back from the background reopens it; a failed call leaves it to retry
    await recordTurn({ ...base, conversationId: id, learnerSaid: 'Ci vediamo domani', reply: { it: 'A domani!', en: 'See you tomorrow!' } });
    const failing: Summarizer = async () => { throw new Error('Claude down'); };
    check((await rememberConversation(id, me, failing, fakeJudge)) === 'failed', 'failing call should report failed');
    check((await rememberConversation(id, me, fake, fakeJudge)) === 'saved', 'after a failure the next ending should retry');
    check(calls.at(-1)?.turns.length === 7 && calls.at(-1)?.notes.length === 2, 'rewrite should get the full transcript and the existing notes');
    mem = await loadCharacterMemory(me, person.id);
    check(mem.visits === 1, `one conversation counted as ${mem.visits} visits`);

    // A new conversation is a second visit
    const id2 = (await recordTurn({ ...base, conversationId: null, reply: { it: 'Ciao Josh!', en: 'Hi Josh!' }, memory: mem }))!;
    await recordTurn({ ...base, conversationId: id2, learnerSaid: 'Un caffè', reply: { it: 'Subito', en: 'Right away' } });
    await recordTurn({ ...base, conversationId: id2, learnerSaid: 'Grazie', reply: { it: 'Prego', en: 'Welcome' } });
    await rememberConversation(id2, me, fake, fakeJudge);
    check((await loadCharacterMemory(me, person.id)).visits === 2, 'second conversation did not count as a second visit');
    check((await loadMemoryAtStart(id2, me))?.visits === 1, 'second conversation should start knowing one visit');
  } finally {
    await query('DELETE FROM learners WHERE id = $1', [me]);
    await closePool();
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('(database part SKIPPED: set DATABASE_URL to a local test database)');
  } else if (/railway/.test(process.env.DATABASE_URL)) {
    problems.push('Refusing to write test data to Railway. Use a local database.');
  } else {
    await dbChecks();
  }
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log('OK: memory fills the prompt, is written once per ending, counts each conversation as one visit, and retries after a failure');
  });
