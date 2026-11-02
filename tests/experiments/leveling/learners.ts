// Simulated learners who change over a run of conversations (05-designs.md →
// How the prototypes compare them). Built on the existing simulators: the
// honest learner of tests/conversations/run.ts (says so when lost, doesn't
// pretend to follow) and placement.mts (speaks only as well as their level),
// plus what those lacked: English, help asks, silence and saying back an
// offered answer at rates that fall as the learner improves, and rise when the
// talk is above them.
//
// The rates pick what kind of turn comes next (seeded, so every design sees
// the same draws); Claude writes the words for own-words, English and help
// turns. Silence and saying back need no call. Simulated learners are too
// competent and too even (02): the numbers compare designs, they don't
// predict real learners.
import { language } from '@/content';

export interface Rates {
  /** Says nothing (the mic closes after 5 s) */
  silence: number;
  /** Answers in English */
  english: number;
  /** Asks for help: to repeat, slower, what a word means, say it in English */
  help: number;
  /** Says back one of the offered answers, when there are any */
  sayBack: number;
}

export interface Persona {
  id: string;
  summary: string;
  /** Ladder step they start at (1 = first Beginner stage) */
  startStep: number;
  /** 0 = knows a few words, 1 = early B1; from first to last conversation */
  ability: [number, number];
  rates: [Rates, Rates];
}

export const PERSONAS: Persona[] = [
  {
    id: 'improving-first',
    summary: 'Starts with a few words at the first Beginner stage; improves steadily',
    startStep: 1,
    ability: [0.02, 0.7],
    rates: [{ silence: 0.15, english: 0.35, help: 0.22, sayBack: 0.6 }, { silence: 0.03, english: 0.06, help: 0.06, sayBack: 0.15 }],
  },
  {
    id: 'improving-mid',
    summary: 'Starts mid-Beginner (A1, set phrases and a few sentences); improves steadily',
    startStep: 2,
    ability: [0.3, 0.9],
    rates: [{ silence: 0.08, english: 0.2, help: 0.15, sayBack: 0.4 }, { silence: 0.02, english: 0.04, help: 0.04, sayBack: 0.08 }],
  },
  {
    id: 'early-b1',
    summary: 'Early B1 placed at the last Beginner step; improves a little',
    startStep: 3,
    ability: [0.82, 1],
    rates: [{ silence: 0.03, english: 0.06, help: 0.07, sayBack: 0.12 }, { silence: 0.01, english: 0.02, help: 0.03, sayBack: 0.04 }],
  },
  {
    id: 'flat',
    summary: "A1 at the first Beginner stage who doesn't improve",
    startStep: 1,
    ability: [0.12, 0.12],
    rates: [{ silence: 0.12, english: 0.3, help: 0.2, sayBack: 0.5 }, { silence: 0.12, english: 0.3, help: 0.2, sayBack: 0.5 }],
  },
];

export function persona(id: string): Persona {
  const p = PERSONAS.find((x) => x.id === id);
  if (!p) throw new Error(`No simulated learner "${id}" (known: ${PERSONAS.map((x) => x.id).join(', ')})`);
  return p;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ability and rates for conversation i of n, given how demanding the talk is */
export function learnerAt(p: Persona, i: number, n: number, demand: number): { ability: number; rates: Rates } {
  const t = n > 1 ? i / (n - 1) : 0;
  const ability = lerp(p.ability[0], p.ability[1], t);
  // Talk above them makes every kind of struggle more likely; talk well below changes little
  const over = Math.max(0, demand - ability);
  const k = 1 + 2.5 * over;
  const r = (key: keyof Rates) => Math.min(0.9, lerp(p.rates[0][key], p.rates[1][key], t) * (key === 'sayBack' ? 1 + over : k));
  return { ability, rates: { silence: r('silence'), english: r('english'), help: r('help'), sayBack: r('sayBack') } };
}

export type Intent = 'silent' | 'english' | 'help' | 'say back' | 'own';

/** What kind of turn comes next; `roll` is a seeded number in [0, 1) */
export function intentFor(rates: Rates, roll: number, answersOffered: boolean): Intent {
  let x = roll;
  if ((x -= rates.silence) < 0) return 'silent';
  if ((x -= rates.english) < 0) return 'english';
  if ((x -= rates.help) < 0) return 'help';
  const rest = 1 - rates.silence - rates.english - rates.help;
  if (answersOffered && x < rest * rates.sayBack) return 'say back';
  return 'own';
}

/** The learner's level in plain words, for the simulator's prompt */
export function abilityText(a: number): string {
  const L = language.name;
  if (a < 0.15) return `A total beginner in ${L}: knows hello, thank you, yes, no, numbers and a handful of words. Can't build a sentence; follows only very slow, short ${L} with English help.`;
  if (a < 0.35) return `A beginner (A1) in ${L}: set phrases ("a coffee please", "I like it"), names, numbers. Short tries of their own with mistakes; follows slow, short sentences about what's happening right here.`;
  if (a < 0.6) return `A1–A2 in ${L}: makes short sentences of their own about themselves and everyday things, with mistakes; present tense mostly; follows slow, clear speech about familiar things and asks for repetition sometimes.`;
  if (a < 0.85) return `A2 in ${L}: handles everyday errands and small talk in simple sentences, some past tense, with errors; follows clear speech on familiar topics, sometimes needs a rephrase.`;
  return `Early B1 in ${L}: links sentences into longer turns about plans, experiences and opinions, with some errors; follows clear standard speech at a normal pace; asks for repetition now and then.`;
}

/** The system prompt for one learner turn of the given kind */
export function learnerPrompt(intent: Exclude<Intent, 'silent' | 'say back'>, ability: number, where: string): string {
  const L = language.name;
  const what =
    intent === 'english'
      ? `This turn, you answer in English: either what you'd like to say but can't in ${L}, or (if you didn't follow) a question about what was said.`
      : intent === 'help'
        ? `This turn, you ask for help, the way such a learner really would: to repeat, to go slower, what a word means, or how to say something; in ${L} if you can, in English if you can't.`
        : `This turn, you answer in your own ${L}, only as well as your level allows (mistakes welcome; don't read back a sentence you were shown). Be honest about comprehension: if the last line was too long, fast or complex for you, ask for help instead (in ${L} or English) and say so in the JSON.`;
  return `You are role-playing a learner of ${L} in a test. ${abilityText(ability)} They've come to live here; ${where}
${what}
You speak to the person directly ("you"), never about them ("is she asking…").
Reply with JSON: said (ONLY what they say, as speech-to-text would hear it: one or two short sentences, no quotes or stage directions), lang ("target" if it's mostly ${L}, "english" if mostly English), help (true if it asks for help), helpKind ("word" if the help asked is about one word or how to say one thing; "whole" if it asks to repeat, to go slower, or says they didn't understand; "none" if no help).`;
}

export const learnerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['said', 'lang', 'help', 'helpKind'],
  properties: { said: { type: 'string' }, lang: { type: 'string', enum: ['target', 'english'] }, help: { type: 'boolean' }, helpKind: { type: 'string', enum: ['word', 'whole', 'none'] } },
};

/** Seeded random numbers (tests/conversations/run.ts's mulberry32), so every design sees the same draws */
export function seeded(...keys: (string | number)[]): () => number {
  let t = 0;
  for (const ch of keys.join('|')) t = (Math.imul(t ^ ch.charCodeAt(0), 0x5bd1e995) + 0x6d2b79f5) >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
