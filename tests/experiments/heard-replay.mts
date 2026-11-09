// Replays the moments from play where a character treated a speech-to-text
// mishearing as the learner's mistake (docs/dialogue-model.md → Four fixes),
// with the code as it stands, and counts how often the reply corrects or
// coaches it. Run it on main before a change and after, same N.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/heard-replay.mts [n]
//   COUNTRY=it    npx tsx --env-file=.env.local tests/experiments/heard-replay.mts [n]
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, pack, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { lessonBrief } from '@/lib/lesson';
import { writeSayIt } from '@/lib/say-it';
import type { CharacterSheet, Turn } from '@/lib/types';

const N = Number(process.argv[2] ?? 4);
const sheet = (cityId: string, placeId: string) => { const c = cities.find((x) => x.id === cityId)!; return characterForPlace(c, c.places.find((p) => p.id === placeId)!)! as CharacterSheet; };
const magda = () => tutor as unknown as CharacterSheet;

async function judge(said: string, reply: string, offered: string): Promise<boolean> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 300, thinking: { type: 'between_tools' },
    system: 'You check a language-learning game. The learner\'s line came through speech-to-text and was probably misheard. Does the character\'s reply correct it, point out a word, coach pronunciation, or ask them to say it again because it was wrong? A reply that accepts it and carries on is not a correction, even if it repeats the phrase back as a confirmation (\"Muy bien: joven, ¿me ayuda?\") or uses the right word naturally once. A correction signals it was wrong: \"almost\", \"the word is…\", \"say it like…\", asking for it again. Reply with JSON: corrects (boolean).',
    messages: [{ role: 'user', content: `What they were asked to say: ${offered || '(nothing offered)'}\nWhat speech-to-text heard: ${said}\nThe character's reply: ${reply}` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, properties: { corrects: { type: 'boolean' } }, required: ['corrects'] } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return JSON.parse(replyText(r as never)).corrects === true;
}

type Case = { name: string; run: () => Promise<{ said: string; reply: string; offered: string }> };
const cases: Case[] = [];

if (pack.id === 'es-mx') {
  // Jennifer, 2026-11-04: "Joven, ¿me ayuda?" heard as "¿Owen me ayuda?"
  const offered = 'Joven, ¿me ayuda?';
  const transcript: Turn[] = [
    { who: 'npc', transcript: "You'll be able to speak to people the way Mexicans do, with a title instead of a name. Let's start with how you ask a young man for help.", offered: [offered] },
    { who: 'learner', transcript: '¿Cómo me ayuda?' },
    { who: 'npc', transcript: "No worries, let me give you the whole sentence. You say it to a young man you don't know.", offered: [offered] },
    { who: 'learner', transcript: '¿Cómo te ayudas?' },
    { who: 'npc', transcript: 'Joven, ¿me ayuda? young man, can you help me?', offered: [offered] },
  ];
  cases.push({ name: 'Magda, joven (Jennifer)', run: async () => {
    const said = '¿Owen me ayuda?';
    const b = await lessonBrief({ part: 'teach', stepId: 'a1-04-4' } as never, 'replay', transcript, said);
    const r = await runBeginnerTurn({ character: magda(), transcript, learnerSaid: said, stageText: b.brief, withDone: b.askDone });
    return { said, reply: r.line, offered };
  } });
  // 2026-11-03: "Estoy un poco cansado" heard as "Estoy en el barco de canzart"
  const tired = 'Estoy un poco cansado.';
  const t2: Turn[] = [
    { who: 'npc', transcript: "You'll be able to answer when someone asks how you are. ¿Cómo está, señor? how are you?", offered: ['Estoy bien, gracias.'] },
    { who: 'learner', transcript: 'Estoy bien gracias.' },
    { who: 'npc', transcript: "Estoy bien, gracias. That's what you say to the café waiter. A neighbour might hear something different. Estoy un poco cansado. a bit tired", offered: [tired] },
  ];
  cases.push({ name: 'Magda, cansado', run: async () => {
    const said = 'Estoy en el barco de canzart.';
    const b = await lessonBrief({ part: 'teach', stepId: 'a1-01-2' } as never, 'replay', t2, said);
    const r = await runBeginnerTurn({ character: magda(), transcript: t2, learnerSaid: said, stageText: b.brief, withDone: b.askDone });
    return { said, reply: r.line, offered: tired };
  } });
} else {
  // Josh, Florence, 2026-11-05: "ribollita" heard as "ribaletta" (Intermediate, character prompt)
  const ardit = sheet('firenze', 'trattoria-mario-nuova');
  const t: Turn[] = [
    { who: 'npc', transcript: 'Buongiorno! Benvenuto da Mario. Siete in uno o aspettate qualcuno?' },
    { who: 'learner', transcript: 'Solo io, grazie.' },
    { who: 'npc', transcript: 'Benissimo, si accomodi pure qui. Oggi abbiamo la ribollita, la trippa e la bistecca. Cosa le porto da bere intanto?' },
    { who: 'learner', transcript: "Mi può spiegare cos'è la ribalita, per favore?" },
    { who: 'npc', transcript: 'Certo! La ribollita è una zuppa toscana di pane raffermo, fagioli, cavolo nero e verdure. Piatto povero, ma buonissimo. La assaggia?' },
  ];
  cases.push({ name: 'Ardit, ribollita', run: async () => {
    const said = 'Si, vorrei la ribaletta. Si, vorrei la ribaletta.';
    const r = await runTurn({ character: ardit, transcript: t, learnerSaid: said });
    return { said, reply: r.line, offered: '' };
  } });
}

// How do I say it, Lorenzo, 2026-11-05 (as a Beginner would get it): does the line answer his question for them?
const lorenzoQ: Turn[] = [{ who: 'npc', transcript: 'Ah, Seattle! Lontano, lontano. Piove sempre, no? Qui a Firenze almeno c\'è il sole. Ma è la prima volta in Italia?' }];
let sayItAnswers = 0;
let sayItRuns = 0;

const results: string[] = [];
for (const c of cases) {
  let n = 0;
  const replies: string[] = [];
  for (let i = 0; i < N; i++) {
    const { said, reply, offered } = await c.run();
    const corrects = await judge(said, reply, offered);
    if (corrects) n++;
    replies.push(`${corrects ? 'CORRECTS' : 'ok      '} ${reply.slice(0, 160)}`);
  }
  results.push(`${c.name}: corrects ${n} of ${N}\n  ${replies.join('\n  ')}`);
}
if (pack.id === 'it') {
  const lorenzo = sheet('firenze', 'santa-croce-piazza');
  for (let i = 0; i < N; i++) {
    const l = await writeSayIt(lorenzo, lorenzoQ, 'The city is a little bit like London. It rains a lot for a few months, but not for a year.', 'beginner', 'Piove come Londra, molto per qualche mese, ma non per un anno.');
    sayItRuns++;
    if (!l.sendAsSaid && /prima volta/i.test(l.line)) sayItAnswers++;
    results.push(`say it (Beginner), Lorenzo ${i + 1}: ${l.sendAsSaid ? 'sent as said' : l.line}`);
  }
  results.push(`say it answered "prima volta" for them: ${sayItAnswers} of ${sayItRuns}`);
}
console.log(`[${pack.id}]\n${results.join('\n')}`);
