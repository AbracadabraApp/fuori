// The welcome (lib/welcome.ts) played end to end without the app or the
// database: the character from welcome.md, step by step as /v1/turn counts
// them, and a simulated newcomer per persona who taps a button, then asks
// questions or says they're ready. Checks: English only (no part in the
// language), the opening ends on the two buttons, done comes once and only
// once they're ready, and the masculine or feminine is read from the tap.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/archive/welcome-trial.mts [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn, type Part } from '@/lib/beginner';
import { welcomeContent, welcomeStep, welcomeBrief, learnerLines, addressAnswers, addressFrom, ADDRESS_BUTTONS } from '@/lib/welcome';
import type { Turn } from '@/lib/types';

const out = process.argv[2];
const w = welcomeContent();
if (!w) throw new Error('No welcome in this country');
const city = cities.find((c) => c.id === w.cityId)!;
const character = characterForPlace(city, city.places.find((p) => p.id === w.placeId)!)!;

interface Persona { id: string; tap: 'm' | 'f'; who: string; micOff?: boolean; asksForWord?: boolean }
const PERSONAS: Persona[] = [
  { id: 'ready-at-once', tap: 'm', who: 'You have no questions: say you are ready to go.' },
  { id: 'two-questions', tap: 'f', who: `Ask two short questions, one per turn, in English: first whether you need to speak any ${language.name} already, then what one of the cities she mentioned is like. After her second answer, say you're ready.` },
  { id: 'question-in-language', tap: 'f', asksForWord: true, who: `Ask one short question in simple ${language.name} with a small mistake (how do you say "thank you"?). Then say, in English, that you're ready.` },
  { id: 'mic-off', tap: 'm', micOff: true, who: 'You have one question, in English: how do you change your level? Then say you are ready.' },
];

const learnerSchema = { type: 'object', additionalProperties: false, required: ['said'], properties: { said: { type: 'string' } } };

async function play(p: Persona) {
  const transcript: Turn[] = [];
  const log: string[] = [];
  let said: string | undefined;
  let doneAt = -1;
  let languageParts = 0;
  let openingButtons = false;
  for (let turn = 0; turn < 8; turn++) {
    const step = welcomeStep(learnerLines(transcript, said).length);
    const r = await runBeginnerTurn({ character, transcript, learnerSaid: said, stageText: welcomeBrief(step, !!p.micOff && turn === 1), withDone: step === 'answers', maxAnswers: 0 });
    const parts: Part[] = step === 'opening' ? [...r.parts, ...addressAnswers()] : r.parts;
    if (step === 'opening') openingButtons = parts.filter((x) => x.kind === 'answer').map((x) => x.text).join('|') === `${ADDRESS_BUTTONS.m}|${ADDRESS_BUTTONS.f}`;
    languageParts += r.parts.filter((x) => x.kind !== 'english').length;
    if (said) { transcript.push({ who: 'learner', transcript: said }); log.push(`Learner: ${said}`); }
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    log.push(`${character.name} [${step}]: ${r.parts.map((x) => (x.kind === 'english' ? x.text : `«${x.text}» (${x.kind})`)).join(' ')}${step === 'opening' ? `\n   buttons: ${ADDRESS_BUTTONS.m} | ${ADDRESS_BUTTONS.f}` : ''}`);
    if (step === 'answers' && r.done) { doneAt = turn; break; }
    if (step === 'opening') { said = ADDRESS_BUTTONS[p.tap]; continue; }
    const conv = log.join('\n');
    const lr = await anthropic.messages.create({
      model: TURN_MODEL, max_tokens: 300, thinking: { type: 'between_tools' },
      system: `You role-play a newcomer in a test of a ${language.name} learning game, in their welcome conversation. ${p.who} Reply with JSON: said (only what you say, one short line).`,
      messages: [{ role: 'user', content: `${conv}\n\nWhat do you say?` }],
      output_config: { format: { type: 'json_schema', schema: learnerSchema } },
    } as Parameters<typeof anthropic.messages.create>[0]);
    said = (JSON.parse(replyText(lr as Parameters<typeof replyText>[0])) as { said: string }).said;
  }
  const checks = {
    openingButtons,
    // Unless they asked how to say something: then she tells them
    englishOnly: p.asksForWord || languageParts === 0,
    ended: doneAt > 0,
    address: addressFrom(transcript.find((t) => t.who === 'learner')?.transcript) === p.tap,
  };
  return { persona: p.id, checks, turns: transcript.length, log: log.join('\n') };
}

const results = await Promise.all(PERSONAS.map(play));
const lines = results.map((r) => `${r.persona}: ${Object.entries(r.checks).map(([k, v]) => `${k} ${v ? 'ok' : 'FAIL'}`).join(', ')} · ${r.turns} lines`);
console.log(`[${pack.id}] ${character.name}\n${lines.join('\n')}\n\n${results.map((r) => `## ${r.persona}\n${r.log}`).join('\n\n')}`);
if (out) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `welcome-${pack.id}.md`), `# Welcome trial, ${pack.id} (${character.name})\n\n${lines.map((l) => `- ${l}`).join('\n')}\n\n${results.map((r) => `## ${r.persona}\n\n\`\`\`\n${r.log}\n\`\`\``).join('\n\n')}\n`);
}
