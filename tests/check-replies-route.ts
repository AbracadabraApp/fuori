// POST /v1/replies (reply buttons, beginner levels 1–3): the parts that need
// no network or database. Replies are only offered once the character has
// spoken last, the route accepts the same ids as /v1/turn, and both countries
// have a replies prompt with a version.
import { readFileSync, existsSync } from 'fs';
import { cities, tutor } from '@/content';
import { cannotOfferReplies } from '@/lib/replies';
import { parseTurnRequest } from '@/lib/turn-request';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

// Only after the character has spoken
check(cannotOfferReplies([]) !== null, 'no replies before anyone has spoken');
check(cannotOfferReplies([{ who: 'npc', transcript: 'Buongiorno! Cosa prendi?' }]) === null, 'replies once the character has spoken');
check(
  cannotOfferReplies([{ who: 'npc', transcript: 'Cosa prendi?' }, { who: 'learner', transcript: 'Un caffè' }]) !== null,
  'no replies while the character has not answered the learner'
);

// The same ids as /v1/turn find the character
const city = cities.find((c) => c.places.some((p) => p.characterId && p.characterId !== tutor.id))!;
const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id)!;
const found = parseTurnRequest({ cityId: city.id, placeId: place.id });
check(found.ok, `${city.id}/${place.id} should find a character for replies`);
check(!parseTurnRequest({ cityId: city.id, placeId: 'nowhere' }).ok, 'an unknown place finds nobody');

// The route exists, reads the transcript from the database, and never takes one from the app
const route = readFileSync('app/v1/replies/route.ts', 'utf8');
check(route.includes('loadConversationTurns'), 'the route reads the conversation from the database');
check(!/transcript:\s*z\./.test(route), 'the route must not accept a transcript from the app');
check(route.includes('withLearner'), 'the route needs the learner token');

// Both countries have a versioned replies prompt
for (const country of ['it', 'es-mx']) {
  const path = `content/${country}/prompts/replies.md`;
  check(existsSync(path) && /version/i.test(readFileSync(path, 'utf8')), `${path} should exist with a version`);
}

if (problems.length) {
  console.error(`check-replies-route: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-replies-route: ok');
