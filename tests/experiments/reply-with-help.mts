// Help that rides along with the reply (Josh, 2026-10-23, after "say it in
// English" misrouted his Italian): every turn goes to the character, and
//   A: she answers as today; a hint line (how they could have said it) shows
//      in a bubble, unsaid
//   B: she answers with the correction worked into her reply (a recast, in role)
//   both: B's reply and A's hint
// Run on Josh's real turns from 2026-10-23 (Luisa, Mohamed; Italy), in their
// real context, plus English turns. Trial prompts below; nothing shipped.
//   npx tsx --env-file=.env.local tests/experiments/reply-with-help.mts > tests/experiments/out/reply-with-help.md
import { anthropic, TURN_MODEL, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { characterForVisit } from '@/lib/characters/for-visit';
import { language } from '@/content';
import type { Turn } from '@/lib/types';

const L = language.name;

// Trial: added to the character prompt for B
const RECAST = `If the person's last line had a mistake that matters (a wrong word or form that changes or muddles the meaning), or was said in English, work the right ${L} for it into your reply the way a local would: say it back naturally, in role, as part of answering them (a recast). Don't explain it, don't make it a lesson, don't point out small slips.`;

// Trial: the hint line for A
const HINT = `A person at the beginner level is learning ${L} by talking with someone in a game. Given the conversation and the person's last line (heard by speech-to-text, so ignore missing accents and punctuation), write the line they could have said: what they meant, in natural, correct ${L}, the simplest way a beginner could say it, one short sentence. If their line is already natural and correct ${L}, or it's too unclear to tell what they meant, return an empty line. Never make up what they meant.`;
const hintSchema = { type: 'object', additionalProperties: false, properties: { line: { type: 'string' } }, required: ['line'] };

type Case = { who: string; context: Turn[]; said: string; note: string };
const npc = (t: string): Turn => ({ who: 'npc', transcript: t });
const me = (t: string): Turn => ({ who: 'learner', transcript: t });
const luisa = [npc('Buongiorno! Dica pure, cosa le preparo?'), me('Vorrei un cappuccino e il cornetto. Grazie.'), npc('Subito! Il cornetto lo vuole vuoto o con la crema?')];
const luisa2 = [...luisa, me('Oh, con la cramma.'), npc('Perfetto, con la crema. Si accomodi, glielo porto subito.')];
const luisa3 = [...luisa2, me('Quanto costa il cappuccino e il cornetto?'), npc('Sono tre euro e cinquanta in tutto. Paga ora o dopo?'), me('adesso'), npc('Va bene, allora sono tre e cinquanta. Contanti o carta?'), me('Carta di credito. Grazie.'), npc('Prego, appoggi pure la carta qui sul lettore. Ecco fatto, grazie a lei!')];
const luisa4 = [...luisa3, me('è una bar vecchio'), npc("Sì, è un bar storico del quartiere, aperto da più di cinquant'anni! Le piace?")];
const mohamed = [npc('Buonasera, signore! Benvenuto da Nino. Un tavolo per uno?')];
const mohamed2 = [...mohamed, me('perché questo fare molto sbarri è più difficile per giocare questo'), npc('Scusi, non ho capito bene. Parla di un gioco? Io sono solo il cameriere, signore. Vuole sedersi a mangiare qualcosa?')];

const CASES: Case[] = [
  { who: 'luisa-cocco-nuova', context: luisa, said: 'Oh, con la cramma.', note: 'Italian, small slip' },
  { who: 'luisa-cocco-nuova', context: luisa2, said: 'Quanto costa il cappuccino e il cornetto?', note: 'Italian, costa → costano' },
  { who: 'luisa-cocco-nuova', context: luisa3, said: 'è una bar vecchio', note: 'Italian, gender' },
  { who: 'luisa-cocco-nuova', context: luisa4, said: 'si mi piace molto è bellissimo come la barista', note: 'Italian, fine' },
  { who: 'mohamed-hassan', context: mohamed, said: 'Si, Solomé.', note: 'Italian "sì, solo me", misheard' },
  { who: 'mohamed-hassan', context: mohamed, said: 'Excuse me, can you excuse me?', note: 'English' },
  { who: 'mohamed-hassan', context: mohamed, said: 'I would like a table for one, please.', note: 'English' },
  { who: 'mohamed-hassan', context: mohamed2, said: 'Si, ho domandato un tavolo tre volte e tu non pensi niente.', note: 'Italian, word choice and tu/Lei (Whisper called it English)' },
  { who: 'mohamed-hassan', context: mohamed2, said: 'Allora, non mi responde.', note: 'Italian, one letter (Whisper called it English)' },
];

const places: Record<string, [string, string]> = { 'luisa-cocco-nuova': ['roma-nuova', 'bar-mattina-nuova'], 'mohamed-hassan': ['roma-nuova', 'trattoria-garbatella'] };

async function reply(c: Case, extra?: string): Promise<string> {
  const [city, place] = places[c.who];
  const character = characterForVisit(city, place)!;
  const p = buildTurnPrompt({ character, transcript: c.context, learnerSaid: c.said });
  const r = await anthropic.messages.create({ model: TURN_MODEL, max_tokens: 1200, temperature: 1.0, thinking: { type: 'between_tools' }, system: extra ? `${p.system}\n\n${extra}` : p.system, messages: p.messages, output_config: { format: { type: 'json_schema', schema: turnOutputJsonSchema } } } as any);
  return JSON.parse(replyText(r)).line;
}

async function hint(c: Case): Promise<string> {
  const so = [...c.context, me(c.said)].map((t) => `${t.who === 'npc' ? 'Them' : 'Person'}: ${t.transcript}`).join('\n');
  const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 1000, thinking: { type: 'between_tools' }, system: HINT, messages: [{ role: 'user', content: `${so}\n\nThe person's last line: ${c.said}` }], output_config: { format: { type: 'json_schema', schema: hintSchema } } } as any);
  return JSON.parse(replyText(r)).line.trim();
}

console.log(`# Help with the reply: A (hint, unsaid), B (recast in her reply), both\n\nJosh's turns from 2026-10-23, real context. Trial prompts in the script.\n`);
for (const c of CASES) {
  const [a, b, h] = await Promise.all([reply(c), reply(c, RECAST), hint(c)]);
  console.log(`## "${c.said}"  _(${c.note})_\n\nShe said before: *${c.context.at(-1)!.transcript}*\n\n- **A**: ${a}\n  - hint bubble: ${h ? `**${h}**` : '_(none)_'}\n- **B**: ${b}\n- **Both**: B's reply + ${h ? `**${h}**` : 'no hint'}\n`);
}
