// The replay set (docs/dialogue-ideas.md → The examples become a replay set):
// real moments from play, replayed with the code as it stands, so a change to
// dialogue is measured on the same cases before it ships. Each case runs the
// turn N times; a judge reads what the voice says (lineFromParts) and counts
// turns that say the same thing more than once (English, then the language,
// then the English again) or run on with no sentence breaks.
//   COUNTRY=it    npx tsx --env-file=.env.local tests/experiments/replay-set.mts [n]
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/replay-set.mts [n]
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { lessonBrief } from '@/lib/lesson';
import { STAGES, stageText } from '@/lib/path';
import type { CharacterSheet, Turn } from '@/lib/types';

const N = Number(process.argv[2] ?? 4);
const sheet = (cityId: string, placeId: string) => { const c = cities.find((x) => x.id === cityId)!; return characterForPlace(c, c.places.find((p) => p.id === placeId)!)! as CharacterSheet; };

const judgeSchema = { type: 'object', additionalProperties: false, required: ['repeats', 'runOn'], properties: { repeats: { type: 'boolean' }, runOn: { type: 'boolean' } } };
async function judge(spoken: string): Promise<{ repeats: boolean; runOn: boolean }> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 300, thinking: { type: 'between_tools' },
    system: `You check one turn of a game for English speakers learning ${language.name}. The text is exactly what the character's voice says, English and ${language.name} mixed. repeats: does it say the same thing more than once, across the two languages (an English sentence that says what the ${language.name} then says, or an English echo of ${language.name} the listener could already follow, e.g. "caffè" then "coffee")? A short English echo of a ${language.name} phrase a beginner couldn't follow is fine, once. runOn: does a phrase run into the next with no sentence break, so a voice would read it as one breathless sentence (e.g. "per favore. first, the cashier Vuole…")? Reply with JSON.`,
    messages: [{ role: 'user', content: spoken }],
    output_config: { format: { type: 'json_schema', schema: judgeSchema } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return JSON.parse(replyText(r as never));
}

type Case = { name: string; run: () => Promise<string> };
const cases: Case[] = [];
const s1 = STAGES.S1;
if (pack.id === 'it') {
  // Josh, 2026-11-05 (simulator): "totally incoherent, repetitive with no pauses"; "cafe, coffee, cafe"
  cases.push({ name: 'Luisa, opening (S1)', run: async () => { const c = sheet('roma-nuova', 'bar-mattina-nuova'); return (await runBeginnerTurn({ character: c, transcript: [], stageText: stageText(s1, c.role), maxAnswers: s1.answers })).line; } });
} else {
  // Josh, 2026-11-05 (simulator): "incoherent dialogue"
  cases.push({ name: 'Doña Chela, opening (S1)', run: async () => { const c = sheet('oaxaca', 'puesto-chapulines-mercado-benito-juarez'); return (await runBeginnerTurn({ character: c, transcript: [], stageText: stageText(s1, c.role), maxAnswers: s1.answers })).line; } });
  // Jennifer, 2026-11-04: Magda's lesson, "Joven, ¿me ayuda?" said then glossed
  const transcript: Turn[] = [
    { who: 'npc', transcript: "You'll be able to speak to people the way Mexicans do, with a title instead of a name. Let's start with how you ask a young man for help.", offered: ['Joven, ¿me ayuda?'] },
    { who: 'learner', transcript: '¿Cómo me ayuda?' },
  ];
  cases.push({ name: 'Magda, joven (Jennifer)', run: async () => {
    const b = await lessonBrief({ part: 'teach', stepId: 'a1-04-4' } as never, 'replay', transcript, '¿Cómo me ayuda?');
    return (await runBeginnerTurn({ character: tutor as unknown as CharacterSheet, transcript, learnerSaid: '¿Cómo me ayuda?', stageText: b.brief, withDone: b.askDone })).line;
  } });
}
// Every country: two more S1 openings at shown places, so the change isn't fitted to one character
const shown = cities.filter((c) => !c.hidden).flatMap((c) => c.places.filter((p) => !p.hidden && characterForPlace(c, p)).map((p) => ({ c, p })));
for (const k of [0.3, 0.7]) {
  const { c, p } = shown[Math.floor(k * shown.length)];
  const ch = characterForPlace(c, p)!;
  cases.push({ name: `${ch.name}, opening (S1)`, run: async () => (await runBeginnerTurn({ character: ch, transcript: [], stageText: stageText(s1, ch.role), maxAnswers: s1.answers })).line });
}

const out: string[] = [];
let rep = 0, run = 0, total = 0;
for (const c of cases) {
  const lines = await Promise.all(Array.from({ length: N }, async () => { const spoken = await c.run(); return { spoken, j: await judge(spoken) }; }));
  for (const { j } of lines) { total++; if (j.repeats) rep++; if (j.runOn) run++; }
  out.push(`${c.name}: repeats ${lines.filter((l) => l.j.repeats).length}/${N}, run-on ${lines.filter((l) => l.j.runOn).length}/${N}\n  ${lines.map((l) => l.spoken).join('\n  ')}`);
}
console.log(`[${pack.id}] repeats ${rep}/${total}, run-on ${run}/${total}\n${out.join('\n')}`);
