// Learn 2.0's card (docs/learn-sheet-2-plan.md → Verification), code only: the bank's cards keep the rules,
// the shortlist keeps to the learner's levels and puts the visit's place first, filling in stands by itself,
// the writer's answer becomes a card only when it keeps the rules, and nothing starts before the wind-down.
import { pack } from '@/content';
import { cardProblems } from '@/lib/learn-card';
import { backfill, bank, CARD_LEVELS_FOR, cardFrom, shortlist, startLearnCard, visitKeys } from '@/lib/learn-card-writer';
import { ENDING_AT } from '@/lib/dialogue/ending';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const cards = bank();
check(cards.length > 100, `[${pack.id}] the bank has ${cards.length} cards`);
const ids = new Set<string>();
for (const c of cards) {
  const p = cardProblems(c);
  check(p.length === 0, `[${pack.id}] ${c.id}: ${p.join(', ')}`);
  check(!ids.has(c.id), `[${pack.id}] ${c.id} twice`);
  ids.add(c.id);
  check(!!c.source.from && !!c.source.ref, `[${pack.id}] ${c.id}: no source`);
}

// The shortlist: only the learner's levels, the visit's place first
const withPlace = cards.find((c) => c.keys.some((k) => k.startsWith('place:')) && CARD_LEVELS_FOR.beginner.includes(c.level));
if (withPlace) {
  const place = withPlace.keys.find((k) => k.startsWith('place:'))!;
  const [cityId, placeId] = place.slice('place:'.length).split('/');
  const keys = visitKeys(cityId, placeId, []);
  const list = shortlist(cards, CARD_LEVELS_FOR.beginner, keys);
  check(list.length > 0 && list.length <= 30, 'shortlist size');
  check(list.every((c) => CARD_LEVELS_FOR.beginner.includes(c.level)), 'shortlist keeps to the levels');
  check(list[0].keys.includes(place), 'shortlist puts the visit\'s place first');
  const filler = backfill(cards, CARD_LEVELS_FOR.beginner, keys, 1);
  check(!!filler && filler.keys.includes(place), 'backfill takes a card about the place first');
}

// The writer's answer
const options = cards.slice(0, 3);
check(cardFrom({ choice: 'pick', pick: options[0].id, kind: '', headline: '', term: '', rows: [], note: '' }, options, '00000000-0000-0000-0000-000000000000', ['A1'])?.how === 'pick', 'a pick from the list is taken');
check(cardFrom({ choice: 'pick', pick: 'not-there', kind: '', headline: '', term: '', rows: [], note: '' }, options, '00000000-0000-0000-0000-000000000000', ['A1']) === null, 'a pick not in the list is refused');
check(cardFrom({ choice: 'none', pick: '', kind: '', headline: '', term: '', rows: [], note: '' }, options, '00000000-0000-0000-0000-000000000000', ['A1']) === null, 'none is no card');
const made = cardFrom({ choice: 'make', pick: '', kind: 'when-you', headline: 'When you order', term: '', rows: [{ text: 'x', en: 'y' }], note: '' }, options, '00000000-0000-0000-0000-000000000000', ['A1']);
check(made?.how === 'make' && made.card.source.from === 'visit', 'a made card is a visit card');
check(cardFrom({ choice: 'make', pick: '', kind: 'when-you', headline: 'H', term: '', rows: [{ text: 'a ___ b', en: 'y' }], note: '' }, options, '00000000-0000-0000-0000-000000000000', ['A1']) === null, 'a made card with a blank is refused');

// Nothing starts before the wind-down
const early = Array.from({ length: ENDING_AT.beginner.windDown - 1 }, (_, i) => [{ who: 'learner' as const, transcript: `l${i}` }, { who: 'npc' as const, transcript: `n${i}` }]).flat();
check(!startLearnCard({ conversationId: '00000000-0000-0000-0000-000000000001', learnerId: 'x', character: {} as never, cityId: 'x', placeId: 'y', transcript: early, onError: () => {} }), 'no card before the wind-down turn');

if (problems.length) { console.error(problems.slice(0, 30).join('\n') + (problems.length > 30 ? `\n…and ${problems.length - 30} more` : '')); process.exit(1); }
console.log(`[${pack.id}] learn card: ${cards.length} bank cards keep the rules; shortlist, backfill, writer answers and the wind-down check pass`);
