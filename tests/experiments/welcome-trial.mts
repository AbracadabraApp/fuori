// The welcome (lib/welcome.ts) played end to end without the app or the
// database: the character from welcome.md's brief, a simulated newcomer per
// persona, until her last turn sets done; then the answers read from the whole
// conversation and the placement. Checks the steps come in order, done comes
// once and only at the end, and what's read matches what the persona said.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/welcome-trial.mts [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { readWelcome, welcomeBrief, welcomeContent, type StoredTurn } from '@/lib/welcome';
import type { Turn } from '@/lib/types';

const out = process.argv[2];
const w = welcomeContent();
if (!w) throw new Error('No welcome in this country');
const city = cities.find((c) => c.id === w.cityId)!;
const character = characterForPlace(city, city.places.find((p) => p.id === w.placeId)!)!;

interface Persona { id: string; who: string; expect: { name: string; address: 'm' | 'f'; firstTime: boolean; level: string; startStep: number }; micOff?: boolean }
const PERSONAS: Persona[] = [
  { id: 'says-back', who: `Your name is Josh, a man. It's your first time here. You speak no ${language.name}: every time, you read back one of the answers shown to you, exactly (fill a blank … with your own fact), nothing else. You choose the masculine welcome, and "not yet" for speaking ${language.name}.`, expect: { name: 'Josh', address: 'm', firstTime: true, level: 'beginner', startStep: 1 } },
  { id: 'own-words', who: `Your name is Sophia, a woman. You've been here once before, on holiday. You know a little ${language.name} and answer in your own short ${language.name} sentences, with small mistakes, never reading the shown answers word for word: for the feminine welcome you say it your way, and asked if you speak ${language.name} you say, in your own words, that you don't yet but you're learning a little.`, expect: { name: 'Sophia', address: 'f', firstTime: false, level: 'beginner', startStep: 3 } },
  { id: 'correction-either', who: `Your name is Jenn. Speech-to-text misheard you the first time: your first answer comes out as "Mi chiamo Gen" or similar. When she uses the wrong name, correct her, in English ("No, it's Jenn"). Asked masculine or feminine, say "either is fine". It's your first time here. Asked if you speak ${language.name}, you say yes, fairly well (read back that answer).`, expect: { name: 'Jenn', address: 'f', firstTime: true, level: 'intermediate', startStep: 5 } },
  { id: 'mic-off', micOff: true, who: `Your name is Tom, a man. You can't use the microphone, so you tap the answers: every turn you pick one of the shown answers exactly (fill a blank … with your own fact). First time here; masculine; not yet.`, expect: { name: 'Tom', address: 'm', firstTime: true, level: 'beginner', startStep: 1 } },
];

const learnerSchema = { type: 'object', additionalProperties: false, required: ['said'], properties: { said: { type: 'string' } } };

async function play(p: Persona) {
  const transcript: Turn[] = [];
  const stored: StoredTurn[] = [];
  const doneAt: number[] = [];
  let said: string | undefined;
  for (let turn = 0; turn < 12; turn++) {
    const r = await runBeginnerTurn({ character, transcript, learnerSaid: said, stageText: welcomeBrief(!!p.micOff && turn === 0), withDone: true });
    if (said) { transcript.push({ who: 'learner', transcript: said }); stored.push({ who: 'learner', text: said }); }
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    stored.push({ who: 'npc', text: r.line, parts: r.parts.map((x) => ({ kind: x.kind, text: x.text })) });
    if (r.done) { doneAt.push(turn); break; }
    const answers = r.parts.filter((x) => x.kind === 'answer').map((x) => x.text);
    const conv = stored.map((t) => `${t.who === 'npc' ? character.name : 'You'}: ${t.text}`).join('\n');
    const lr = await anthropic.messages.create({
      model: TURN_MODEL, max_tokens: 300, temperature: 1, thinking: { type: 'between_tools' },
      system: `You role-play a newcomer in a test of a ${language.name} learning game. ${p.who} Reply with JSON: said (only what you say, one short line, as speech-to-text hears it).`,
      messages: [{ role: 'user', content: `${conv}\n\nAnswers shown to you: ${answers.join(' | ') || '(none)'}\n\nWhat do you say?` }],
      output_config: { format: { type: 'json_schema', schema: learnerSchema } },
    } as Parameters<typeof anthropic.messages.create>[0]);
    said = (JSON.parse(replyText(lr as Parameters<typeof replyText>[0])) as { said: string }).said;
  }
  const { read, ownWords, placed } = await readWelcome(stored, character.id);
  const e = p.expect;
  const checks = {
    ended: doneAt.length === 1,
    name: (read.name ?? '').toLowerCase() === e.name.toLowerCase(),
    address: (read.address ?? 'f') === e.address,
    firstTime: read.firstTime === e.firstTime,
    level: placed.level === e.level,
    startStep: placed.startStep === e.startStep,
  };
  return { persona: p.id, turns: stored.length, read, ownWords, placed, checks, transcript: stored.map((t) => `${t.who === 'npc' ? character.name : 'Learner'}: ${t.text}${t.parts?.some((x) => x.kind === 'answer') ? `\n   answers: ${t.parts.filter((x) => x.kind === 'answer').map((x) => x.text).join(' | ')}` : ''}`).join('\n') };
}

const results = await Promise.all(PERSONAS.map(play));
const lines = results.map((r) => `${r.persona}: ${Object.entries(r.checks).map(([k, v]) => `${k} ${v ? 'ok' : 'FAIL'}`).join(', ')} · read ${JSON.stringify(r.read)} · own words ${r.ownWords} · ${r.placed.level} step ${r.placed.startStep} · ${r.turns} lines`);
console.log(`[${pack.id}] ${character.name}\n${lines.join('\n')}`);
if (out) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `welcome-${pack.id}.md`), `# Welcome trial, ${pack.id} (${character.name})\n\n${lines.map((l) => `- ${l}`).join('\n')}\n\n${results.map((r) => `## ${r.persona}\n\n\`\`\`\n${r.transcript}\n\`\`\``).join('\n\n')}\n`);
}
