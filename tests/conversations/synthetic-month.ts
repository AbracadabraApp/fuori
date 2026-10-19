/**
 * A month in Rome, modelled (Josh, 2026-10-19: "pick 30 places, they can
 * repeat, and model the conversation; save the character dialogue"). One
 * simulated learner, arriving at A1, makes 30 visits of 15 replies each to
 * Roma's places, returning to the regulars. Characters remember them the way
 * the game does: after each conversation the real memory call (lib/remember.ts)
 * writes the character's notes, which go back in the prompt next visit. The
 * learner keeps a notebook of what they've picked up, so later conversations
 * can show progress. Same row shape as the admin export.
 *
 *   npx tsx --env-file=.env.local tests/conversations/synthetic-month.ts   (CHARACTER_PROMPT as needed)
 *   → tests/conversations/synthetic-month/it.json and it.md
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { summarizeWithClaude } from '@/lib/remember';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import type { CharacterSheet, Turn } from '@/lib/types';

const REPLIES = 15;
const L = language.name;
const roma = cities.find((c) => c.id === 'roma')!;
// 30 visits: the corner bar most mornings, the market and bakery weekly, the rest now and then; the station near the end
const PLAN = [
  'bar-monti-corner', 'forno-trastevere', 'mercato-san-cosimato', 'bar-monti-corner', 'piazza-santa-maria-trastevere',
  'farmacia-trastevere', 'bar-monti-corner', 'trattoria-trastevere', 'forno-trastevere', 'libreria-trastevere',
  'mercato-san-cosimato', 'bar-testaccio-morning', 'bar-monti-corner', 'villa-borghese', 'enoteca-trastevere',
  'forno-trastevere', 'piazza-santa-maria-trastevere', 'mercato-san-cosimato', 'bar-testaccio-morning', 'bar-monti-corner',
  'libreria-trastevere', 'trattoria-trastevere', 'farmacia-trastevere', 'forno-trastevere', 'enoteca-trastevere',
  'piazza-santa-maria-trastevere', 'mercato-san-cosimato', 'stazione-termini', 'bar-testaccio-morning', 'bar-monti-corner',
];

const LEARNER = `An American in their fifties who loves Italy and has just come to live in Rome for a while, not a tourist. They arrived knowing only a few words (ciao, grazie, un caffè) and some phrases from a beginner course: an A1 learner. They speak by voice, so what they say comes through speech-to-text (some noise is fine). They understand only what someone at their level really would and say so when they don't, sometimes in English, sometimes in ${L}. They make real beginner mistakes (verb forms, gender, missing articles, English word order), fewer as they learn. They talk the way real learners in this game do: most replies are a few words (half of real learners' replies are 4 to 12 words, the median 7), often a fragment or one short sentence; longer only once their notebook gives them the words.`;

const schema = { type: 'object', additionalProperties: false, required: ['say'], properties: { say: { type: 'string' } } };
const notebookSchema = { type: 'object', additionalProperties: false, required: ['notebook'], properties: { notebook: { type: 'array', items: { type: 'string' } } } };

async function ask(system: string, content: string, s: object): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({
        model: CLAUDE_MODEL, max_tokens: 3000, system,
        messages: [{ role: 'user', content }],
        output_config: { format: { type: 'json_schema', schema: s } },
      } as Parameters<typeof anthropic.messages.create>[0]);
      return replyText(r as Parameters<typeof replyText>[0]);
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }
  }
}

const show = (c: CharacterSheet, t: Turn[]) => t.map((x) => `${x.who === 'npc' ? c.name : 'Learner'}: ${x.transcript}`).join('\n');

type Row = { id: string; synthetic: true; day: number; character_id: string; place_id: string; city_id: string; prompt_version: string; started_at: string; ended_at: string; notebook: string[]; memory: string[]; turns: { at: string; who: 'npc' | 'learner'; text: string; en?: string }[] };

async function main() {
  const memories = new Map<string, { visits: number; lastVisit: Date | null; notes: string[] }>();
  let notebook: string[] = [];
  const rows: Row[] = [];
  const dir = join(process.cwd(), 'tests', 'conversations', 'synthetic-month');
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < PLAN.length; i++) {
    const day = i + 1;
    const place = roma.places.find((p) => p.id === PLAN[i])!;
    const character = characterForPlace(roma, place)!;
    const today = new Date(Date.parse('2026-11-01T09:00:00Z') + i * 86_400_000);
    const mem = memories.get(place.characterId!);
    const memory = mem ? { ...mem } : undefined;
    const transcript: Turn[] = [];
    const opening = await runTurn({ character, transcript, memory });
    transcript.push({ who: 'npc', transcript: opening.line, translation: opening.en });
    const system = `You are role-playing a ${L} learner in a test. ${LEARNER}\nIt's day ${day} of their stay. They're at ${place.name}, talking to ${character.name} (${character.role}).${mem ? ` They've been here ${mem.visits} time${mem.visits > 1 ? 's' : ''} before.` : ' First time here.'}\nWhat they've picked up so far, from their own notebook (they use these, not much beyond):\n${notebook.length ? notebook.map((n) => `- ${n}`).join('\n') : '- nothing yet beyond the few words they arrived with'}\nWrite what the learner says next: one or two short sentences, the way they'd really say it.`;
    for (let k = 0; k < REPLIES; k++) {
      const left = REPLIES - k;
      const say = (JSON.parse(await ask(system, `Conversation so far:\n${show(character, transcript)}\n\nThis conversation lasts ${REPLIES} of the learner's replies; ${left === 1 ? 'this is the last one: take your leave' : `${left} left, including this one`}. Reply with JSON: say.`, schema)) as { say: string }).say;
      const reply = await runTurn({ character, transcript, learnerSaid: say, memory });
      transcript.push({ who: 'learner', transcript: say });
      transcript.push({ who: 'npc', transcript: reply.line, translation: reply.en });
    }
    // The character remembers them, as in the game
    const turns = transcript.map((x) => ({ who: x.who, text: x.transcript }));
    const out = await summarizeWithClaude({ character: { name: character.name, age: character.age, role: character.role, city: roma.name }, notes: mem?.notes ?? [], turns });
    memories.set(place.characterId!, { visits: (mem?.visits ?? 0) + 1, lastVisit: today, notes: out.notes });
    // The learner writes down what they'll keep
    notebook = (JSON.parse(await ask(`You are the learner described here, keeping a notebook of ${L} you can now use. ${LEARNER}`, `Your notebook so far:\n${notebook.map((n) => `- ${n}`).join('\n') || '(empty)'}\n\nToday's conversation:\n${show(character, transcript)}\n\nUpdate the notebook: keep what's there, add the 2-4 words or phrases from today you'd really remember and use (with their English), and note a mistake you now avoid if one stuck. At most 60 entries; merge or drop the least useful. Reply with JSON: notebook.`, notebookSchema)) as { notebook: string[] }).notebook;
    const at = (n: number) => new Date(today.getTime() + n * 20_000).toISOString();
    rows.push({
      id: `month-${pack.id}-day-${String(day).padStart(2, '0')}`, synthetic: true, day,
      character_id: place.characterId!, place_id: place.id, city_id: roma.id, prompt_version: promptVersion(),
      started_at: at(0), ended_at: at(transcript.length), notebook, memory: out.notes,
      turns: transcript.map((x, n) => ({ at: at(n), who: x.who, text: x.transcript, ...(x.who === 'npc' ? { en: x.translation } : {}) })),
    });
    console.log(`day ${day} ${character.name} (${place.name}), visit ${(mem?.visits ?? 0) + 1}: ${transcript.length} turns; notebook ${notebook.length}`);
    // Saved every day, so a stopped run keeps what it has
    writeFileSync(join(dir, `${pack.id}.json`), JSON.stringify(rows, null, 2) + '\n');
    writeFileSync(join(dir, `${pack.id}.md`), [
      `# A month in ${roma.name}, modelled`, '',
      `${rows.length} conversations, ${REPLIES} learner replies each. One simulated learner arriving at A1; characters remember them through the real memory call. Prompt ${promptVersion()}. Made by tests/conversations/synthetic-month.ts.`, '',
      ...rows.flatMap((r) => {
        const c = characterForPlace(roma, roma.places.find((p) => p.id === r.place_id)!)!;
        return [`## Day ${r.day}: ${c.name}, ${c.role} (${roma.places.find((p) => p.id === r.place_id)!.name})`, '',
          ...r.turns.map((t) => t.who === 'npc' ? `**${c.name}:** ${t.text}  \n*${t.en ?? ''}*` : `**Learner:** ${t.text}`).flatMap((x) => [x, '']),
          `*${c.name} remembers:* ${r.memory.join('; ') || '—'}`, ''];
      }),
    ].join('\n'));
  }
  console.log(`→ tests/conversations/synthetic-month/${pack.id}.json and .md`);
}

main().catch((e) => { console.error(e); process.exit(1); });
