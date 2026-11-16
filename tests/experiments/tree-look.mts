// A look, not a test (Josh, 2026-11-16: "what if the prompt just got the goal, setting and the person and the
// assignment is to write 7 turns with 2 branches at each turn"): one call writes a whole visit as a tree, in English.
// 7 character turns, two learner answers after each of the first six: 1+2+4+8+16+32+64 = 127 character lines, 64 endings.
// (A seventh pair of answers would make 128 endings; the last turn here is the goodbye.)
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/tree-look.mts <out dir> city/place …
import { writeFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { CLAUDE_MODEL, anthropic, replyText } from '@/lib/claude';

const GOAL = 'The learner leaves this visit knowing one real thing about this place and able to say something about it.';
const prompt = (who: string) => `The goal: ${GOAL}

The person: ${who}

The learner is a beginner in the language who has stopped to talk with this person. Write their whole visit, in English, as a tree: seven turns by the person, and after each of the first six, two different short things the learner could say back (a and b). Each answer leads to its own next turn, so there are 1, 2, 4, 8, 16, 32 and 64 turns at the seven levels, 127 in all. The seventh turn says goodbye.

Keep every turn to one to three short sentences a beginner could follow.

Write one line per turn, in this form, where the path is the answers taken to get there ("-" for the first turn, then "a", "b", "aa", "ab" …):

path | what the person says | answer a | answer b

Seventh-level turns have no answers. Write all 127 lines and nothing else.`;

const [dir, ...places] = process.argv.slice(2);
await Promise.all(places.map(async (p) => {
  const [city, place] = p.split('/');
  const c = characterForVisit(city, place);
  if (!c) { console.log(`no character at ${p}`); return; }
  const who = `${c.name}, ${c.age}, ${c.role}, ${c.city}. ${c.personality.traits.join(', ')}. ${c.appearance.setting}`;
  const started = Date.now();
  const text = replyText(await anthropic.messages.stream({ model: CLAUDE_MODEL, max_tokens: 32000, messages: [{ role: 'user', content: prompt(who) }] }).finalMessage());
  writeFileSync(`${dir}/tree-${place}.txt`, text);
  const tree = new Map(text.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x.length >= 2).map((x) => [x[0] === '-' ? '' : x[0], x]));
  const walk = (name: string, pick: (i: number) => 'a' | 'b') => {
    const lines: string[] = [];
    let path = '';
    for (let i = 0; i < 7; i++) {
      const n = tree.get(path);
      if (!n) { lines.push(`  (no line at "${path}")`); break; }
      lines.push(`  ${c.name.split(' ').slice(0, 2).join(' ')}: ${n[1]}`);
      if (i === 6) break;
      const k = pick(i);
      lines.push(`      you: ${n[k === 'a' ? 2 : 3]}   [other bubble: ${n[k === 'a' ? 3 : 2]}]`);
      path += k;
    }
    return `-- path ${name}\n${lines.join('\n')}`;
  };
  console.log(`== ${c.name} (${c.role}) · ${tree.size} lines · ${Math.round((Date.now() - started) / 1000)}s\n${walk('a every time', () => 'a')}\n${walk('b every time', () => 'b')}\n${walk('a, b, a, b…', (i) => (i % 2 ? 'b' : 'a'))}\n`);
}));
