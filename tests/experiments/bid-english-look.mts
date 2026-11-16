// A look, not a test (Josh, 2026-11-16): one prompt writes Character, Learner, Character; a second writes
// Character, Learner + bid, Character. All in English, the model writes every line, the bid included, and the two
// prompts differ only in the learner's line. Read side by side against the goal: the learner leaves knowing one real
// thing about this place and able to say something about it.
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/bid-english-look.mts city/place …
import { characterForVisit } from '@/lib/characters/for-visit';
import { CLAUDE_MODEL, anthropic, replyText } from '@/lib/claude';

const LEARNER = {
  plain: 'LEARNER: answers the question in one short sentence.',
  bid: 'LEARNER: answers the question in one short sentence, then makes a bid: one more short sentence of their own that gives the character something to respond to.',
};
const prompt = (who: string, learner: string) => `${who}

A beginner learning the language has stopped to talk with this character. Write three lines of their talk, in English, each short and simple enough for a beginner:

CHARACTER: says a little and asks the learner one simple question.
${learner}
CHARACTER: replies.

Write only the three lines, each starting with its label.`;

const out = await Promise.all(process.argv.slice(2).map(async (p) => {
  const [city, place] = p.split('/');
  const c = characterForVisit(city, place);
  if (!c) return `== no character at ${p}`;
  const who = `${c.name}, ${c.age}, ${c.role}, ${c.city}. ${c.personality.traits.join(', ')}. ${c.appearance.setting}`;
  const [plain, bid] = await Promise.all((['plain', 'bid'] as const).map(async (k) =>
    replyText(await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 600, messages: [{ role: 'user', content: prompt(who, LEARNER[k]) }] })).trim()));
  return `== ${c.name} (${c.role})\n-- plain\n${plain}\n-- with a bid\n${bid}`;
}));
console.log(out.join('\n\n'));
