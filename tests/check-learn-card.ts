// Learn 2.0's card (docs/learn-sheet-2-design.md → The source, redesigned), code only: a written card becomes a card
// only when it keeps the rules, the kind is picked by code (not a recent kind, situations first), the writer starts the
// turn before each level's wind-down and not before, and the prompt and models it reads are there and filled.
import { pack, language } from '@/content';
import { cardFrom, KIND_ORDER, pickKind, placePlainLine, startAt, startLearnCard, type WrittenCard } from '@/lib/learn-card-writer';
import { ENDING_AT } from '@/lib/dialogue/ending';
import { fill, readPromptFile } from '@/lib/prompts/template';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const id = '00000000-0000-0000-0000-000000000000';
const w = (kind: WrittenCard['kind'], over: Partial<WrittenCard> = {}): WrittenCard => ({ kind, headline: 'When you order', term: '', rows: [{ text: 'Uno, per favore.', en: 'One, please.' }], note: '', ...over });

// A written card becomes a card only when it keeps the rules
const made = cardFrom(w('when-you'), id, 'beginner');
check(made?.source.from === 'visit' && made.id === `visit:${id}:when-you` && made.level === 'A1', 'a written card is a visit card, with an id per kind');
check(cardFrom(w('when-you', { rows: [{ text: 'a ___ b', en: 'y' }] }), id, 'beginner') === null, 'a card with a blank is refused');
check(cardFrom(w('learn-it', { headline: 'Learn it:', term: 'ahorita' }), id, 'beginner') === null, 'a headline ending in a colon is refused');
check(cardFrom(w('about-this-place', { headline: 'About this market', rows: [], note: 'A fact.' }), id, 'intermediate')?.level === 'B1', 'a note-only card is kept, labelled by level');
check(cardFrom(w('vocabulary', { rows: [] }), id, 'beginner') === null, 'an empty card is refused');

// The plain line in its place: first on Learn it, second on a saying
const L = (t: string) => ({ text: t, en: t }), Pl = { text: '', en: 'why' };
check(placePlainLine('learn-it', [L('a'), L('b'), Pl])[0] === Pl, 'a Learn it card opens on its why');
check(placePlainLine('a-saying', [L('saying'), L('sentence'), Pl])[1] === Pl, 'a saying gives its meaning second');
check(placePlainLine('vocabulary', [L('a'), Pl])[1] === Pl, 'other kinds are left as written');

// The kind: situations first, never a recent kind while another is there, else the first written
const all = KIND_ORDER.map((k) => ({ kind: k, headline: `H ${k}` }));
check(pickKind([...all].reverse(), [])?.kind === 'when-you', 'situations first');
check(pickKind(all, ['when-you', 'learn-it'])?.kind === 'a-saying', 'the last two kinds are skipped');
check(pickKind([{ kind: 'vocabulary', headline: 'Vocabulary' }], ['vocabulary'])?.kind === 'vocabulary', 'a recent kind still shows when it is the only one');
check(pickKind([{ kind: 'learn-it', headline: 'Learn it', term: 'Ahorita' }, { kind: 'vocabulary', headline: 'Vocabulary' }], [], ['ahorita'])?.kind === 'vocabulary', 'a card about a word shown recently is never shown again');
check(pickKind([{ kind: 'learn-it', headline: 'Learn it', term: 'ahorita' }], [], ['ahorita']) === null, 'not even when it is the only one');
check(pickKind([], []) === null, 'nothing written, no card');

// When it starts: the turn before each level's wind-down (B56: Intermediate never got one)
check(startAt('beginner') === ENDING_AT.beginner.windDown - 1, 'Beginner starts the turn before its wind-down');
check(startAt('intermediate') === ENDING_AT.intermediate.windDown - 1 && startAt('advanced') === startAt('intermediate'), 'Intermediate and Advanced start the turn before theirs');
const turns = (npc: number) => Array.from({ length: npc }, (_, i) => [{ who: 'npc' as const, transcript: `n${i}` }, { who: 'learner' as const, transcript: `l${i}` }]).flat().slice(0, -1);
// `before` is the character's lines before this reply; a transcript ending on the reply has before + 1
check(!startLearnCard({ conversationId: '00000000-0000-0000-0000-000000000001', learnerId: 'x', character: {} as never, cityId: 'x', placeId: 'y', transcript: turns(startAt('beginner')), onError: () => {} }), 'nothing starts before the earliest moment');

// The prompt and models are there, and fill
const f = readPromptFile('learn-card.md');
const models = fill(readPromptFile('learn-card-models.md').block('Models'), { language: language.name });
check(models.includes('Term:') && !models.includes('{language}'), 'the models fill, and A word from here carries a term');
const system = fill(f.block('System prompt'), { language: language.name, name: 'N', role: 'r', city: 'c', level: 'beginner', models });
check(!/\{[a-z]+\}/.test(system) && KIND_ORDER.every((k) => system.includes(k)), 'the prompt fills and names every kind');

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`[${pack.id}] learn card: written cards keep the rules, the kind is picked by code, the writer starts on time`);
