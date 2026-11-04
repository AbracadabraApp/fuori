// A whole lesson (lib/lesson.ts) played without the app or the database:
// Magda teaches, three practice dialogues with the planned partners, her
// review; a simulated Beginner who reads back the offered answers, with an
// occasional slip. Checks each part ends where it should (teaching in 2-4
// learner turns with done, practice at 3, review at 1) and writes the
// transcripts to read.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/lesson-trial.mts <stepId> [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { lessonBrief, lessonPlan, PRACTICE_TURNS, TEACH_MAX_TURNS, SPEAKING_PRACTICE_TURNS, SPEAKING_TEACH_TURNS, type LessonTurn } from '@/lib/lesson';
import type { CharacterSheet, Turn } from '@/lib/types';

const [stepId, out] = process.argv.slice(2);
const seed = 'trial-learner';
const plan = lessonPlan(stepId, seed);
if (!plan) throw new Error(`No lesson ${stepId}`);
const sheet = (cityId: string, placeId: string) => { const c = cities.find((x) => x.id === cityId)!; return characterForPlace(c, c.places.find((p) => p.id === placeId)!)! as CharacterSheet; };

async function learner(conv: string, answers: string[], slip: boolean): Promise<string> {
  const who = plan!.speaking
    ? `an intermediate learner of ${language.name} in a test, called Sam. Answer in your own words in ${language.name}, one or two sentences, trying to use what the lesson is about${slip ? ', with one mistake an intermediate learner makes (a wrong ending, the wrong mood or tense)' : ''}`
    : `a beginner in ${language.name} in a test, called Sam. You read back one of the answers shown to you${slip ? ', but with one small mistake a beginner makes (a wrong ending or a missing word)' : ', exactly'}; if none is shown, say a few words of ${language.name} that fit, or ask in English`;
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 300, temperature: 1, thinking: { type: 'between_tools' },
    system: `You role-play ${who}. Reply with JSON: said.`,
    messages: [{ role: 'user', content: `${conv}\n\nAnswers shown to you: ${answers.join(' | ') || '(none)'}\n\nWhat do you say?` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['said'], properties: { said: { type: 'string' } } } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { said: string }).said;
}

async function part(character: CharacterSheet, l: LessonTurn, practiceLines?: string[]) {
  const transcript: Turn[] = [];
  const lines: string[] = [];
  let said: string | undefined;
  let turns = 0;
  for (let i = 0; i < 8; i++) {
    const b = await lessonBrief(l, seed, transcript, said, practiceLines);
    // The same choice as lib/conversation/take-turn.ts: the speaking mode is the character prompt with the brief
    const r = b.speaking
      ? { ...(await runTurn({ character, transcript, learnerSaid: said, brief: b.brief })), parts: [] as { kind: string; text: string }[], done: false }
      : await runBeginnerTurn({ character, transcript, learnerSaid: said, stageText: b.brief, withDone: b.askDone });
    if (said) { transcript.push({ who: 'learner', transcript: said }); lines.push(`Learner: ${said}`); }
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
    const answers = r.parts.filter((x) => x.kind === 'answer').map((x) => x.text);
    lines.push(`${character.name}: ${r.line}${answers.length ? `\n   answers: ${answers.join(' | ')}` : ''}`);
    if (b.forcedDone || r.done) break;
    said = await learner(lines.join('\n'), answers, i === 1);
    turns++;
  }
  return { turns, lines, learnerLines: transcript.filter((t) => t.who === 'learner').map((t) => t.transcript) };
}

const magda = sheet(plan.magda.city.id, plan.magda.place.id);
if (magda.id !== tutor?.id) throw new Error('Magda not found');
const teach = await part(magda, { stepId, part: 'teach' });
const practice = [];
for (let k = 0; k < plan.practice.length; k++) practice.push(await part(sheet(plan.practice[k].city.id, plan.practice[k].place.id), { stepId, part: 'practice', scene: k }));
const review = await part(magda, { stepId, part: 'review' }, practice.flatMap((p, k) => p.learnerLines.map((l) => `Scene ${k + 1}: ${l}`)));

const checks = {
  teach: plan.speaking ? teach.turns === SPEAKING_TEACH_TURNS : teach.turns >= 1 && teach.turns <= TEACH_MAX_TURNS,
  practice: practice.every((p) => p.turns === (plan.speaking ? SPEAKING_PRACTICE_TURNS : PRACTICE_TURNS)),
  scenes: practice.length === 3,
  review: review.turns === 1,
};
const summary = `[${pack.id}] ${stepId}: teach ${teach.turns} turns, practice ${practice.map((p) => p.turns).join('/')} with ${plan.practice.map((p) => `${sheet(p.city.id, p.place.id).name} (${sheet(p.city.id, p.place.id).role}, ${p.city.id})`).join(', ')}, review ${review.turns} · ${Object.entries(checks).map(([k, v]) => `${k} ${v ? 'ok' : 'FAIL'}`).join(', ')}`;
console.log(summary);
if (out) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `lesson-${pack.id}-${stepId}.md`), `# ${summary}\n\n## Teach\n\`\`\`\n${teach.lines.join('\n')}\n\`\`\`\n\n${practice.map((p, k) => `## Practice ${k + 1}\n\`\`\`\n${p.lines.join('\n')}\n\`\`\``).join('\n\n')}\n\n## Review\n\`\`\`\n${review.lines.join('\n')}\n\`\`\`\n`);
}
