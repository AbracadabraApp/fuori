/**
 * A committed set of test conversations, played by simulated learners (Josh,
 * 2026-10-19: real transcripts stay off git, since the admin export holds
 * every learner's lines). Same shape as the admin export, so the experiments
 * read it in place of tests/experiments/out/admin.json.
 *
 * Each learner covers what recent tests needed: beginners, asking for help in
 * English and in the language, verb and gender mistakes, speech-to-text noise,
 * and taking leave (goodbye, paying and thanking). The characters' lines come
 * from lib/turn.ts with the production prompt, so the set records the prompt
 * version it was made with; regenerate it when the prompt changes much.
 *
 *   npx tsx --env-file=.env.local tests/conversations/synthetic-set.ts [conversations] [seed]   (COUNTRY as needed)
 *   → tests/conversations/synthetic-set/<country>.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import type { CharacterSheet, Turn } from '@/lib/types';
import { learners as baseLearners } from './learners';

const [nArg, seedArg] = process.argv.slice(2);
const N = Number(nArg ?? 24);
const MAX_TURNS = 10;
let t = Number(seedArg ?? 7) >>> 0;
const random = () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };

// The three learners test:conversations uses, plus four for the recent tests
const L = language.name;
const learners = [
  ...baseLearners,
  { id: 'asks-meaning', description: `A beginner (A1-A2) who often doesn't understand a word and asks what it means, sometimes in English ("sorry, what does X mean?") and sometimes in ${L}. Also asks how to say a thing or two.` },
  { id: 'verb-mistakes', description: `An A2 learner who talks readily but gets verb forms wrong (wrong person, wrong tense) and now and then a noun's gender or number. Doesn't notice the mistakes.` },
  { id: 'errand-and-leave', description: `An A1-A2 learner on an errand: buys or orders something, asks the price, pays, thanks the character and says goodbye.` },
  { id: 'chatty-leaver', description: `An A2-B1 learner who chats for a while, then takes their leave politely (a goodbye, a see you soon).` },
];

const people = cities.filter((c) => !c.hidden).flatMap((city) => city.places.filter((p) => !p.hidden && p.characterId).map((place) => ({ city, place, character: characterForPlace(city, place) })))
  .filter((x): x is typeof x & { character: CharacterSheet } => !!x.character && x.place.characterId !== 'magda');
const shuffled = [...people].sort(() => random() - 0.5);

const schema = { type: 'object', additionalProperties: false, required: ['say', 'leave'], properties: { say: { type: 'string' }, leave: { type: 'boolean' } } };
async function learnerTurn(desc: string, c: CharacterSheet, where: string, transcript: Turn[]): Promise<{ say: string; leave: boolean }> {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({
        model: CLAUDE_MODEL, max_tokens: 2000,
        system: `You are role-playing a ${L} learner in a test. ${desc}\nYou are at ${where}, talking to ${c.name} (${c.role}). Understand only what someone at your level really would, and say so when you don't. Write what the learner says next as speech-to-text would capture it (one or two short sentences, some noise is fine). leave: true only if, after saying this, you would walk away (the conversation is over for you); a learner who just left without a word says nothing (empty say, leave true).`,
        messages: [{ role: 'user', content: `Conversation so far:\n${transcript.map((x) => `${x.who === 'npc' ? c.name : 'Learner'}: ${x.transcript}`).join('\n')}\n\nReply with JSON: say, leave.` }],
        output_config: { format: { type: 'json_schema', schema } },
      } as Parameters<typeof anthropic.messages.create>[0]);
      return JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { say: string; leave: boolean };
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }
  }
}

type Row = { id: string; synthetic: true; learner: string; character_id: string; place_id: string; city_id: string; prompt_version: string; started_at: string; ended_at: string; turns: { at: string; who: 'npc' | 'learner'; text: string; en?: string }[] };
const start = Date.parse('2026-10-19T09:00:00Z');
async function play(i: number): Promise<Row> {
  const { city, place, character } = shuffled[i % shuffled.length];
  const learner = learners[i % learners.length];
  const transcript: Turn[] = [];
  const opening = await runTurn({ character, transcript });
  transcript.push({ who: 'npc', transcript: opening.line, translation: opening.en });
  for (let k = 0; k < MAX_TURNS; k++) {
    const l = await learnerTurn(learner.description, character, `${place.name} in ${city.name}`, transcript);
    if (!l.say.trim()) break;
    const reply = await runTurn({ character, transcript, learnerSaid: l.say });
    transcript.push({ who: 'learner', transcript: l.say });
    transcript.push({ who: 'npc', transcript: reply.line, translation: reply.en });
    if (l.leave) break;
  }
  // Timestamps are made up (20 s a turn), so the shape matches the admin export
  const at = (n: number) => new Date(start + i * 3_600_000 + n * 20_000).toISOString();
  return {
    id: `synthetic-${pack.id}-${String(i + 1).padStart(2, '0')}`, synthetic: true, learner: learner.id,
    character_id: place.characterId!, place_id: place.id, city_id: city.id, prompt_version: promptVersion(),
    started_at: at(0), ended_at: at(transcript.length),
    turns: transcript.map((x, n) => ({ at: at(n), who: x.who, text: x.transcript, ...(x.who === 'npc' ? { en: x.translation } : {}) })),
  };
}

async function main() {
  const rows: Row[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: 4 }, async () => { while (next < N) { const i = next++; rows[i] = await play(i); console.log(`${rows[i].id} ${rows[i].learner} ${rows[i].character_id}: ${rows[i].turns.length} turns`); } }));
  const dir = join(process.cwd(), 'tests', 'conversations', 'synthetic-set');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${pack.id}.json`), JSON.stringify(rows, null, 2) + '\n');
  console.log(`→ tests/conversations/synthetic-set/${pack.id}.json (${rows.length} conversations, prompt ${promptVersion()})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
