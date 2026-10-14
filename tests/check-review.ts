// Review and Magda (2026-10-13). M2 had both written but not connected: the
// Review route was never reached, would have overwritten the memory review log,
// and schools said "nobody to talk to". The prompt part always runs; the
// database part runs against a local DATABASE_URL with a fake Claude.
import { randomUUID } from 'crypto';
import { cities, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildTutorPrompt } from '@/lib/prompts/build-tutor-prompt';
import type { Review } from '@/lib/review-schema';
import type { ReviewWriter } from '@/lib/review';
import { unwrapSections } from '@/lib/review';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const review = {
  level: 'A2',
  levelEvidence: { errorRate: 2.1, complexityUsed: ['present tense'], confidence: 'medium' },
  patterns: [{ type: 'missing_articles', description: 'Drops articles before nouns', examples: [{ incorrect: 'vado mercato', correct: 'vado al mercato', context: '' }], frequency: 'high', impact: 'medium' }],
  missingStructures: [{ structure: 'past tense', expectedAtLevel: 'A2', why: 'Talks about yesterday in the present', examples: [] }],
  breakdowns: [],
  vocabulary: { words: [], tenseUsage: { present: { count: 9, percentage: 90 } }, suggested: [{ word: 'vorrei', why: 'polite', priority: 'high' }] },
  suggestions: [{ focus: 'Articles with places', why: 'most frequent error', priority: 'high', method: 'drill' }],
  strengths: ['Keeps the conversation going'],
  metadata: { analyzedConversations: 1, conversationId: '', dateRange: '', totalTurns: 0, learnerTurns: 0 },
} as unknown as Review;

// --- Every school has Magda, placed in that school's city ---
let schools = 0;
for (const city of cities) {
  for (const place of city.places.filter((p) => p.characterId === tutor.id)) {
    schools++;
    const c = characterForPlace(city, place);
    check(!!c, `${city.name}, ${place.name}: nobody to talk to`);
    check(c?.id === tutor.id, `${place.name}: Magda's id changed (her memory would split)`);
    check(c?.city === city.name, `${place.name}: Magda is in "${c?.city}", not ${city.name}`);
    check(!!c?.appearance.setting.includes(place.name), `${place.name}: Magda's setting doesn't name the school`);
  }
}
check(schools > 0, 'no schools point to Magda');

// --- Her prompt: placed, remembers, teaches from the Review ---
const someSchool = cities.flatMap((c) => c.places.filter((p) => p.characterId === tutor.id).map((p) => ({ c, p })))[0];
const magdaHere = characterForPlace(someSchool.c, someSchool.p)!;
const withReview = buildTutorPrompt({ character: magdaHere, memory: { visits: 2, lastVisit: new Date(), notes: ['Their name is Josh'] }, review });
const left = [...withReview.system.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k !== 'line' && k !== 'en');
check(left.length === 0, `Magda's prompt has unfilled placeholders: ${left.join(', ')}`);
check(withReview.system.includes(someSchool.c.name) && withReview.system.includes(someSchool.p.name), "Magda's prompt doesn't say which school and city");
check(withReview.system.includes('Their name is Josh'), "Magda's prompt is missing her memory of the learner");
check(withReview.system.includes('Drops articles before nouns') && withReview.system.includes('Articles with places'), "Magda's prompt is missing the Review");
const noReview = buildTutorPrompt({ character: magdaHere, review: null }).system;
check(!noReview.includes('Error patterns') && noReview.length > 100, 'Without a Review, Magda should get the "no review yet" lines');

// --- Replies that wrap each section in a key of the same name are lifted back up ---
const wrapped = unwrapSections({ level: 'A1', patterns: { patterns: [{ type: 'syntax' }] }, strengths: ['ok'] }) as { patterns: unknown[]; strengths: unknown[] };
check(Array.isArray(wrapped.patterns) && Array.isArray(wrapped.strengths), 'nested Review sections not unwrapped (Magda would get no patterns)');

// --- Database: Review saved in its own column, memory log untouched, visits counted ---
async function dbChecks() {
  const { query, closePool } = await import('@/lib/db');
  const { recordTurn } = await import('@/lib/recording');
  const { reviewConversation, latestReview } = await import('@/lib/review');
  const me = randomUUID();
  await query('INSERT INTO learners (id) VALUES ($1)', [me]);
  try {
    const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id && c.characters?.some((x) => x.id === p.characterId)))!;
    const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id && city.characters?.some((x) => x.id === p.characterId))!;
    const person = characterForPlace(city, place)!;
    const base = { learnerId: me, character: person, cityId: city.id, promptVersion: 'test' };
    const id = (await recordTurn({ ...base, conversationId: null, reply: { line: 'Buongiorno!', en: 'Morning!' } }))!;
    await recordTurn({ ...base, conversationId: id, learnerSaid: 'vado mercato', reply: { line: 'Al mercato?', en: 'To the market?' } });
    const memoryLog = { items: [{ phrase: 'al mercato', en: 'to the market', why: 'x' }], mistakes: [] };
    await query('UPDATE conversations SET review = $1 WHERE id = $2', [JSON.stringify(memoryLog), id]);

    let calls = 0;
    const fake: ReviewWriter = async () => { calls++; return structuredClone(review); };
    check(await reviewConversation(id, me, fake), 'Review not saved');
    const [row] = (await query<{ review: { items?: unknown[] }; analysis: { level?: string } | null }>('SELECT review, analysis FROM conversations WHERE id = $1', [id])).rows;
    check(row.analysis?.level === 'A2', 'Review not stored in the analysis column');
    check(Array.isArray(row.review?.items), 'the memory review log was overwritten by the Review');
    check((await latestReview(me))?.level === 'A2', 'latest Review not found for Magda');
    check(!(await reviewConversation(id, randomUUID(), fake)) && calls === 1, "another learner could review this learner's conversation");

    // Magda's own lessons aren't reviewed
    const school = cities.flatMap((c) => c.places.filter((p) => p.characterId === tutor.id).map((p) => ({ c, p })))[0];
    const lesson = (await recordTurn({ learnerId: me, character: characterForPlace(school.c, school.p)!, cityId: school.c.id, promptVersion: 'test', conversationId: null, reply: { line: 'Ciao!', en: 'Hi!' } }))!;
    check(!(await reviewConversation(lesson, me, fake)) && calls === 1, "Magda's lesson was reviewed");

    // Visits for the stamps: counted once the learner has said something
    const visits = (await query<{ place_id: string; visits: string }>(
      `SELECT place_id, COUNT(*) AS visits FROM conversations
       WHERE learner_id = $1 AND city_id = $2
         AND EXISTS (SELECT 1 FROM jsonb_array_elements(turns) t WHERE t->>'who' = 'learner')
       GROUP BY place_id`, [me, city.id])).rows;
    check(visits.length === 1 && visits[0].place_id === place.id && visits[0].visits === '1', `visit counts wrong: ${JSON.stringify(visits)}`);
  } finally {
    await query('DELETE FROM learners WHERE id = $1', [me]);
    await closePool();
  }
}

async function main() {
  if (!process.env.DATABASE_URL) console.log('(database part SKIPPED: set DATABASE_URL to a local test database)');
  else if (/railway/.test(process.env.DATABASE_URL)) problems.push('Refusing to write test data to Railway. Use a local database.');
  else await dbChecks();
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log(`OK: Magda is at all ${schools} schools with one id, teaches from the latest Review, which is stored without touching the memory log; visits counted`);
  });
