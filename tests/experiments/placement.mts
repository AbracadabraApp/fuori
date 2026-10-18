// Round 14 (Josh, 2026-10-18, option 2): onboarding's level is a first guess;
// the first conversations confirm or move it. Simulated learners at a known
// level go through the real onboarding (writeFollowUp, writeSendOff), then 3
// conversations with real characters (runTurn, today's prompt). After each
// conversation a level judge reads everything they said so far.
//   npx tsx --env-file=.env.local tests/experiments/placement.mts tests/experiments/out/placement.json [reps]
//   (COUNTRY as needed; ONLY=friend,shy runs some learners only)
import { writeFileSync } from 'node:fs';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { runTurn } from '@/lib/turn';
import { writeFollowUp, writeSendOff } from '@/lib/onboarding';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities, language, onboarding } from '@/content';

const [out, repsArg] = process.argv.slice(2);
const REPS = Number(repsArg) || 2;
const CONVS = 3, TURNS = 5;
const L = language.name;

type Persona = { id: string; truth: 'beginner' | 'intermediate' | 'advanced'; who: string; onboarding?: 'english' | 'friend' };
const PERSONAS: Persona[] = [
  { id: 'total', truth: 'beginner', who: `A total beginner in ${L} (knows hello, thank you, a handful of words). Mostly speaks English, tries a word or two of ${L}.` },
  { id: 'phrases', truth: 'beginner', who: `A beginner (A1) who learned set phrases from an app: can say "I like the food", "yes", "a coffee please" in ${L}, but can't build sentences of their own and often doesn't follow.` },
  { id: 'friend', truth: 'beginner', onboarding: 'friend', who: `A total beginner in ${L} (knows hello, thank you, a handful of words). Mostly speaks English, tries a word or two of ${L}.` },
  { id: 'intermediate', truth: 'intermediate', who: `An intermediate learner (A2-B1): makes their own simple sentences in ${L} with mistakes, follows slow everyday speech, gets lost when it's fast or idiomatic.` },
  { id: 'shy', truth: 'intermediate', onboarding: 'english', who: `An intermediate learner (A2-B1): makes their own simple sentences in ${L} with mistakes, follows slow everyday speech, gets lost when it's fast or idiomatic.` },
  { id: 'advanced', truth: 'advanced', who: `An advanced speaker (C1): speaks ${L} easily, varied words, rare mistakes, follows everything.` },
];

async function ask(system: string, user: string, max = 2000, schema?: object): Promise<string> {
  for (let a = 0; ; a++) {
    try {
      const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: max, system, messages: [{ role: 'user', content: user }], ...(schema ? { output_config: { format: { type: 'json_schema', schema } } } : {}) } as any);
      if (r.stop_reason === 'max_tokens') throw new Error('max_tokens');
      return replyText(r).trim();
    } catch (e) { if (a >= 3) throw e; await new Promise((r) => setTimeout(r, 3000 * (a + 1))); }
  }
}

const speak = (p: Persona, context: string, extra = '') => ask(
  `You are role-playing a person in a test. ${p.who} Be honest: say only what someone at that level really could, and understand only what they really would; if lost, say so as such a person would (in English if that's all they have). ${extra}Write ONLY what they say, as speech-to-text would capture it. One or two short sentences. No quotes, no stage directions.`,
  context);

const judgeSchema = { type: 'object', additionalProperties: false, properties: { level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] }, reason: { type: 'string' } }, required: ['level', 'reason'] };
// The level judge: the same three levels as onboarding, judged from what they said and how they followed
const judge = (onb: string, convs: string[]) => ask(
  `You place a learner of ${L} at a level, from what they actually said in a game where they talk with people in ${L}. Their lines came through speech-to-text, so words can be misheard. Judge only from how they speak and how well they follow, not from what they say about themselves.
- beginner: mostly English, or their ${L} is a few words or set phrases; often doesn't follow.
- intermediate: they make their own sentences in ${L}, simple or with mistakes; follows simple everyday speech.
- advanced: they speak ${L} easily, with varied words and few mistakes; follows natural speech.
Weigh all of it: a single good line doesn't make a level, and the conversations show more than the two onboarding answers. If in doubt, choose the lower level.`,
  `Onboarding answers:\n${onb}\n\n${convs.map((c, i) => `Conversation ${i + 1}:\n${c}`).join('\n\n')}\n\nReply with JSON: level, reason (one short line).`, 3000, judgeSchema).then((s) => JSON.parse(s) as { level: string; reason: string });

const city = cities[0];
const pool = city.places.map((p) => ({ place: p, character: characterForPlace(city, p) })).filter((x) => x.character) as any[];
const pick = () => pool[Math.floor(Math.random() * pool.length)];

async function one(p: Persona, rep: number) {
  // Onboarding: the fixed speaker question, her follow-up, her placement
  const q = onboarding.lines.question.line;
  const a1 = p.onboarding === 'english' || p.onboarding === 'friend'
    ? await speak(p, `A local woman asks you (in ${L}): "${q}"`, "You're too shy to try ${L} with a stranger yet: answer in English only, no ${L} words. ")
    : await speak(p, `A local woman asks you (in ${L}): "${q}"`);
  const fu = await writeFollowUp({ text: a1 });
  const a2 = p.onboarding === 'friend'
    ? await ask(`You are a fluent native speaker of ${L}, answering for your friend. Write ONLY one natural sentence in ${L} answering the question, as speech-to-text would capture it.`, `"${fu.line}"`)
    : await speak(p, `A local woman said to you (in ${L}): "${q}"\nYou answered: "${a1}"\nShe replied: "${fu.line}"\nWhat do you say?`, p.onboarding === 'english' ? `You're too shy to try ${L} with a stranger yet: answer in English only, no ${L} words. ` : '');
  const so = await writeSendOff([{ text: a1 }, { text: a2 }]);
  const onb = `1. ${a1}\n2. ${a2}`;
  const stages: { after: number; level: string; reason: string }[] = [{ after: 0, level: so.level, reason: so.reason }];
  const convs: string[] = [];
  for (let k = 0; k < CONVS; k++) {
    const { place, character } = pick();
    const lines: string[] = [];
    let t: any[] = [];
    const open = await runTurn({ character, transcript: [] });
    t.push({ who: 'npc', transcript: open.line }); lines.push(`${character.name}: ${open.line}`);
    for (let i = 0; i < TURNS; i++) {
      const said = await speak(p, `You are at ${place.name} in ${city.name}, talking to ${character.name} (${character.role}).\nConversation so far:\n${lines.join('\n')}\n\nWhat do you say next?`);
      const r = await runTurn({ character, transcript: t, learnerSaid: said });
      t = [...t, { who: 'learner', transcript: said }, { who: 'npc', transcript: r.line }];
      lines.push(`Learner: ${said}`, `${character.name}: ${r.line}`);
    }
    convs.push(lines.join('\n'));
    stages.push({ after: k + 1, ...(await judge(onb, convs)) });
  }
  process.stdout.write('.');
  return { persona: p.id, truth: p.truth, rep, onboarding: onb, followUp: fu.line, stages, convs };
}

const ONLY = process.env.ONLY?.split(',');
const runs = await Promise.all(PERSONAS.filter((p) => !ONLY || ONLY.includes(p.id)).flatMap((p) => Array.from({ length: REPS }, (_, r) => one(p, r).catch((e) => ({ persona: p.id, truth: p.truth, rep: r, error: String(e) }) as any))));
console.log();
writeFileSync(out, JSON.stringify(runs, null, 1));
const ok = runs.filter((r) => !r.error);
for (let s = 0; s <= CONVS; s++) {
  const right = ok.filter((r) => r.stages[s].level === r.truth).length;
  console.log(`${s === 0 ? 'onboarding only   ' : `after conversation ${s}`} · right ${right}/${ok.length} (${Math.round(100 * right / ok.length)}%)`);
}
for (const p of PERSONAS) console.log(`${p.id.padEnd(13)} truth ${p.truth.padEnd(12)} ${ok.filter((r) => r.persona === p.id).map((r) => r.stages.map((s: any) => s.level[0]).join('→')).join('  ')}`);
console.log(`failed runs ${runs.length - ok.length}`);
