// The character's core behaviours (CLAUDE.md) on today's prompt, which no longer
// spells them out (2026-10-18b): help in English when asked, in English or in
// the language; understand speech-to-text noise; recast a real mistake in role;
// no English nobody asked for. Each probe: the character opens (a real first
// turn), the learner says one line, the character answers; a judge reads it.
// Arms: thinking off (production) and on (TURN_THINKING=on).
//   npx tsx --env-file=.env.local tests/experiments/core-behaviours.mts [characters] [runs]   (COUNTRY as needed)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import type { CharacterSheet, Turn } from '@/lib/types';
import { OUT, ask, pct, pool } from './common.mjs';

const [nArg, runsArg] = process.argv.slice(2);
const N = Number(nArg ?? 8);
const RUNS = Number(runsArg ?? 2);
const ONLY = process.env.PROBES?.split(',');
const es = pack.id === 'es-mx';

// Test data: one learner line per probe, per country
const PROBES = {
  'help in English': {
    said: "Sorry, I don't understand what you said. Can you say it in English?",
    expect: 'They asked, in English, what the character just said. Pass if the character makes it clear in English (in what they say, not only in the translation shown under it), then carries on in the language, in role.',
  },
  'how do I say': {
    said: "How do I say 'I would like to try something'?",
    expect: 'They asked, in English, how to say something. Pass if the character gives the phrase in the language and carries on in role. (The game shows the English translation under every line.)',
  },
  'help in the language': {
    said: es ? '¿Cómo se dice "receipt"?' : 'Come si dice "receipt"?',
    expect: 'They asked, in the language, for a word. Pass if the character gives the word (English is fine to make it clear) and carries on, in role.',
  },
  'garbled speech': {
    said: es ? 'buenas quisiera eh uno de esto por fa vor cuanto cuesta' : 'buongiorno vorrei eh uno di quest per fa vore quanto costa',
    expect: 'This came through speech-to-text with noise: they want one of something and ask the price. Pass if the character understands the likely meaning and answers it naturally, without remarking on how it was said or asking them to repeat.',
  },
  'mistake': {
    said: es ? 'Yo quiere dos de esto, por favor. Yo es nuevo aquí.' : 'Io vuole due di questi, per favore. Io è nuovo qui.',
    expect: 'They made real grammar mistakes (wrong verb forms: "io vuole", "io è"). Pass if the character, staying in role, echoes what they meant back in correct forms, the way a person naturally recasts: addressing them ("Ne vuoi due?", "Ah, sei nuovo qui?", or formal "vuole", "è nuovo" for Lei, which are correct), or repeating the phrase right. Fail if no reply word recasts either mistake, or if it turns into a lesson or a list of corrections.',
  },
  'no unasked English': {
    said: es ? 'Hola. Soy nuevo en la ciudad. Me gusta mucho este lugar.' : 'Ciao. Sono nuovo in città. Mi piace molto questo posto.',
    expect: 'A simple line in the language; nobody asked for English. Pass if the character answers only in the language, with no English words or translations in what they say.',
  },
} as const;
type Probe = keyof typeof PROBES;

const people = cities.filter((c) => !c.hidden).flatMap((city) => city.places.filter((p) => !p.hidden).map((p) => characterForPlace(city, p)).filter((x): x is CharacterSheet => !!x));
const step = Math.max(1, Math.floor(people.length / N));
const cast = people.filter((_, i) => i % step === 0).slice(0, N);

const schema = { type: 'object', additionalProperties: false, required: ['pass', 'note'], properties: { pass: { type: 'boolean' }, note: { type: 'string' } } };
const judge = (c: CharacterSheet, opening: string, said: string, reply: string, en: string, expect: string) =>
  `In a ${language.name} conversation game, ${c.name} (${c.role}) talks with someone learning ${language.name}. The game shows each of the character's lines, then its English translation once they finish speaking.\n\n${c.name}: ${opening}\nLearner: ${said}\n${c.name}: ${reply}\n(Translation shown: ${en})\n\n${expect}\nReply with JSON: pass, note (one short line).`;

type Result = { arm: string; probe: Probe; name: string; opening: string; said: string; reply: string; pass: boolean; note: string };
const results: Result[] = [];
for (const arm of ['thinking off', 'thinking on']) {
  if (arm === 'thinking on') process.env.TURN_THINKING = 'on'; else delete process.env.TURN_THINKING;
  const jobs = cast.flatMap((c) => (Object.keys(PROBES) as Probe[]).filter((p) => !ONLY || ONLY.includes(p)).flatMap((probe) => Array.from({ length: RUNS }, () => async () => {
    const open = await runTurn({ character: c, transcript: [] });
    const said = PROBES[probe].said;
    const transcript: Turn[] = [{ who: 'npc', transcript: open.line, translation: open.en }];
    const reply = await runTurn({ character: c, transcript, learnerSaid: said });
    const j = JSON.parse(await ask(judge(c, open.line, said, reply.line, reply.en, PROBES[probe].expect), { schema })) as { pass: boolean; note: string };
    results.push({ arm, probe, name: c.name, opening: open.line, said, reply: reply.line, ...j });
  })));
  await pool(jobs, 6);
}

const lines = [`# Core behaviours, ${pack.id}, prompt ${promptVersion()}`, '', `${cast.length} characters × ${RUNS} runs per probe.`, '',
  `| Probe | ${['thinking off', 'thinking on'].join(' | ')} |`, '|---|---|---|',
  ...(Object.keys(PROBES) as Probe[]).filter((p) => !ONLY || ONLY.includes(p)).map((p) => `| ${p} | ${['thinking off', 'thinking on'].map((a) => { const xs = results.filter((r) => r.arm === a && r.probe === p); return `${pct(xs.filter((r) => r.pass).length / xs.length)} (${xs.length})`; }).join(' | ')} |`), ''];
console.log(lines.join('\n'));
writeFileSync(join(OUT, `core-behaviours-${pack.id}.md`), [...lines, '## Failures', '', ...results.filter((r) => !r.pass).flatMap((r) => [
  `**${r.probe}** · ${r.arm} · ${r.name}: ${r.note}`, `> ${r.name}: ${r.opening}`, `> Learner: ${r.said}`, `> ${r.name}: ${r.reply}`, '',
])].join('\n'));
console.log(`→ tests/experiments/out/core-behaviours-${pack.id}.md`);
