// One simulated learner through a run of conversations under one design: the
// character speaks at the step's stage (beginner.md in parts with the stage's
// talk and support blocks, or character.md with the levels.md B1 block), the
// learner answers, the record is counted, and the controller picks the next
// step. Design C checks each line before it "plays" and regenerates a clear
// miss once. Character calls mirror lib/turn.ts and lib/beginner.ts (same
// prompt builders, model, temperature, thinking off, schemas), so what's
// measured is the app's prompt plus the step.
import { cities, language, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildBeginnerPrompt, partsJsonSchema, tidyParts, lineFromParts, type Part } from '@/lib/beginner';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { readPromptFile, fill } from '@/lib/prompts/template';
import type { CharacterSheet, Turn } from '@/lib/types';
import { emptyMeters, type Brain, type Meters } from './brain';
import { decide, nextConversation, startAt, type Decision, type Design, type LadderState } from './controllers';
import { RULES, type SpeakingVerdict, type Stage, type Supports } from './ladder';
import { intentFor, learnerAt, learnerPrompt, learnerSchema, seeded, type Intent, type Persona } from './learners';
import { recordOf, type ConversationRecord, type LearnerTurn } from './record';

export interface NpcLine {
  /** What she says (the voice) */
  line: string;
  en: string;
  /** The part in the language, for scoring (beginner: phrases and question; character path: the whole line) */
  languageText: string;
  /** Beginner: every phrase and question had its English echo said after it */
  echoed: boolean;
  /** Beginner: the phrases and questions said with their English echo (their words count as known when scoring) */
  glossed: string[];
  answers: string[];
  bubbles: string[];
  /** Design C */
  check?: string;
  retried?: boolean;
  firstTry?: string;
  ms: number;
  addedMs: number;
}

export interface ConversationRun {
  i: number;
  step: number;
  stage: Stage['id'];
  path: Stage['path'];
  listener: number;
  supports: Supports;
  supportBack: boolean;
  character: { name: string; role: string; city: string; age: number };
  turns: ({ who: 'npc'; npc: NpcLine } | { who: 'learner'; learner: LearnerTurn; intent: Intent })[];
  record: ConversationRecord;
  verdict?: { level: SpeakingVerdict; reason: string; ms: number };
  decision: Omit<Decision, 'next'> & { stepAfter: number };
  error?: string;
}

export interface LearnerRun {
  design: Design;
  persona: Persona['id'];
  startStep: number;
  conversations: ConversationRun[];
  meters: Meters;
}

/** People the game shows (as tests/conversations/run.ts samples them) */
export function cast(): { character: CharacterSheet; city: string }[] {
  return cities
    .filter((c) => !c.hidden)
    .flatMap((city) => city.places.filter((p) => !p.hidden).map((p) => ({ character: characterForPlace(city, p), city: city.name })))
    .filter((x): x is { character: CharacterSheet; city: string } => !!x.character && x.character.id !== tutor.id);
}

const leveling = () => readPromptFile('leveling.md');

/** The step's talk and supports as text, added to beginner.md's system prompt */
function beginnerStageText(stage: Stage, supports: Supports, supportBack: boolean, role: string): string {
  const f = leveling();
  const blocks = [stage.talk, ...(stage.extra ?? [])];
  if (supportBack) blocks.push('Talk: support back');
  if (supports.answers === 2) blocks.push('Answers: two');
  else if (supports.answers === 1) blocks.push('Answers: one');
  else if (supports.answers === 'frame') blocks.push('Answers: frame');
  if (supports.echo === 'new') blocks.push('Echo: new words');
  if (supports.echo === 'off') blocks.push('Echo: off');
  return blocks.map((b) => fill(f.block(b), { language: language.name, role })).join('\n');
}

/** How this learner needs to be spoken to, for design C's check */
function talkText(stage: Stage, supports: Supports, supportBack: boolean, character: CharacterSheet): string {
  if (stage.path === 'beginner') return beginnerStageText(stage, supports, supportBack, character.role);
  return fill(readPromptFile('levels.md').block(supportBack && stage.talkSupportBack ? stage.talkSupportBack : stage.talk), {
    language: language.name,
    role: character.role,
    formality: language.formality[character.speech.formality],
  });
}

function enforceSupports(parts: Part[], s: Supports): Part[] {
  const keep = s.answers === 2 ? 2 : s.answers === 0 ? 0 : 1;
  let answers = 0;
  return parts
    .filter((p) => p.kind !== 'answer' || ++answers <= keep)
    .map((p) => (s.echo === 'off' ? { ...p, gloss: '' } : p));
}

export interface Ctx {
  brain: Brain;
  meters: Meters;
  design: Design;
  stage: Stage;
  supports: Supports;
  supportBack: boolean;
  character: CharacterSheet;
  turn: number;
}

async function characterOnce(ctx: Ctx, transcript: Turn[], said: string | undefined, missed?: string): Promise<Omit<NpcLine, 'ms' | 'addedMs'> & { ms: number }> {
  const { brain, meters, stage, supports, character } = ctx;
  const retry = missed ? `\n\n${fill(leveling().block('Say it again'), { line: missed, role: character.role })}` : '';
  const meta = { path: stage.path, demand: stage.demand, turn: ctx.turn };
  if (stage.path === 'beginner') {
    const p = buildBeginnerPrompt({ character, transcript, learnerSaid: said });
    const system = `${p.system}\n\n${beginnerStageText(stage, supports, ctx.supportBack, character.role)}${retry}`;
    const r = await brain.call({ kind: missed ? 'retry' : 'character', system, messages: p.messages, schema: partsJsonSchema, meta }, meters);
    const parts = enforceSupports(tidyParts((JSON.parse(r.text) as { parts: Part[] }).parts.map((x) => ({ ...x, gloss: x.gloss ?? '' }))), supports);
    if (!parts.length) throw new Error('Beginner turn came back with no parts');
    const { line, en } = lineFromParts(parts);
    const phrases = parts.filter((x) => x.kind === 'word' || x.kind === 'question');
    return {
      line,
      en,
      languageText: phrases.map((x) => x.text).join(' '),
      echoed: phrases.length > 0 && phrases.every((x) => !!x.gloss),
      glossed: phrases.filter((x) => !!x.gloss).map((x) => x.text),
      answers: parts.filter((x) => x.kind === 'answer').map((x) => x.text),
      bubbles: supports.bubbles ? phrases.map((x) => x.text) : [],
      ms: r.ms,
    };
  }
  const p = buildTurnPrompt({ character, transcript, learnerSaid: said ?? '', level: ctx.supportBack && stage.talkSupportBack ? stage.talkSupportBack : stage.talk });
  const r = await brain.call({ kind: missed ? 'retry' : 'character', system: p.system + retry, messages: p.messages, schema: turnOutputJsonSchema, meta }, meters);
  const { line, en } = JSON.parse(r.text) as { line: string; en: string };
  return { line, en, languageText: line, echoed: false, glossed: [], answers: [], bubbles: [], ms: r.ms };
}

/** One character turn; design C checks it first and regenerates a clear miss once */
export async function characterTurn(ctx: Ctx, transcript: Turn[], said?: string): Promise<NpcLine> {
  const first = await characterOnce(ctx, transcript, said);
  if (ctx.design !== 'C') return { ...first, addedMs: 0 };
  const talk = talkText(ctx.stage, ctx.supports, ctx.supportBack, ctx.character);
  const user = fill(leveling().block('Line check'), { language: language.name, talk, line: first.line });
  const checked = await ctx.brain.call(
    {
      kind: 'check',
      messages: [{ role: 'user', content: user }],
      schema: { type: 'object', additionalProperties: false, required: ['verdict', 'reason'], properties: { verdict: { type: 'string', enum: ['fits', 'clear miss', 'unsure'] }, reason: { type: 'string' } } },
      meta: { line: first.languageText || first.line, listener: ctx.stage.listener },
    },
    ctx.meters
  );
  const verdict = (JSON.parse(checked.text) as { verdict: string }).verdict;
  if (verdict !== 'clear miss') return { ...first, check: verdict, addedMs: checked.ms };
  const again = await characterOnce(ctx, transcript, said, first.line);
  return { ...again, check: verdict, retried: true, firstTry: first.line, addedMs: checked.ms + again.ms };
}

/** What the learner hears and sees, as the simulator's context */
function heard(turns: ConversationRun['turns'], name: string): string {
  return turns
    .map((t) => {
      if (t.who === 'learner') return `You: ${t.learner.said || '(you said nothing)'}`;
      const extra = [
        t.npc.bubbles.length ? `  (shown on screen: ${t.npc.bubbles.join(' | ')})` : '',
        t.npc.answers.length ? `  (answers shown for you to say back: ${t.npc.answers.join(' | ')})` : '',
      ].filter(Boolean);
      return [`${name}: ${t.npc.line}`, ...extra].join('\n');
    })
    .join('\n');
}

export async function learnerTurn(brain: Brain, meters: Meters, intent: Intent, ability: number, demand: number, ctx: { name: string; role: string; city: string }, turns: ConversationRun['turns'], offered: string[], roll: number): Promise<LearnerTurn> {
  if (intent === 'silent') return { said: '', lang: 'none', help: false, offered };
  if (intent === 'say back') {
    const answer = offered[Math.floor(roll * offered.length)];
    return { said: answer.replace(/…/g, 'Sam'), lang: 'target', help: false, offered };
  }
  const where = `you're talking to ${ctx.name} (${ctx.role}) in ${ctx.city}.`;
  const r = await brain.call(
    {
      kind: 'learner',
      system: learnerPrompt(intent, ability, where),
      messages: [{ role: 'user', content: `The conversation so far:\n${heard(turns, ctx.name)}\n\nWhat do you say next?` }],
      schema: learnerSchema,
      meta: { intent, ability, demand },
    },
    meters
  );
  const j = JSON.parse(r.text) as { said: string; lang: 'target' | 'english'; help: boolean; helpKind: 'word' | 'whole' | 'none' };
  return { said: j.said.trim(), lang: j.said.trim() ? j.lang : 'none', help: j.help, ...(j.help ? { helpKind: j.helpKind === 'word' ? 'word' : 'whole' } : {}), offered };
}

const SPEAKING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['level', 'reason'],
  properties: { level: { type: 'string', enum: ['pre-A1', 'A1', 'A2', 'B1', 'not enough to tell'] }, reason: { type: 'string' } },
};

type Judged = Omit<ConversationRun, 'verdict' | 'decision'>;

/** One conversation as the judge reads it: the learner's lines marked by kind */
function judgeText(run: Judged, n: number): string {
  let k = 0;
  const lines = run.turns.map((t) => (t.who === 'npc' ? `${run.character.name}: ${t.npc.line}` : `Learner${(() => { const kind = run.record.kinds[k++]; return kind === 'own' ? '' : ` [${kind}]`; })()}: ${t.learner.said}`));
  return [`### Conversation ${n} (${run.character.name}, ${run.character.role})`, ...lines].join('\n');
}

/**
 * Design B and C: one judge of the learner's speaking when a conversation
 * ends, reading it together with the ones before it (RULES.speakingPool).
 */
async function speakingJudge(brain: Brain, meters: Meters, pooled: Judged[], ability: number): Promise<ConversationRun['verdict']> {
  const sum = (f: (r: ConversationRecord) => number) => pooled.reduce((n, c) => n + f(c.record), 0);
  const own = sum((r) => r.ownWords);
  const ownLen = own ? sum((r) => r.ownWordsLength * r.ownWords) / own : 0;
  const record = `${pooled.length} conversations, ${sum((r) => r.learnerTurns)} turns: ${own} in their own words (about ${ownLen.toFixed(1)} words each), ${sum((r) => r.saidBack)} said back, ${sum((r) => r.english)} in English, ${sum((r) => r.helpAsks)} asking for help, ${sum((r) => r.silent)} silent.`;
  const conversation = pooled.map((c, i) => judgeText(c, i + 1)).join('\n\n');
  const examples = leveling().block('Speaking examples');
  const user = fill(leveling().block('Speaking judge'), { language: language.name, record, conversation, examples, n: String(pooled.length), minOwn: String(RULES.speakingMinOwn) });
  const res = await brain.call({ kind: 'speaking', messages: [{ role: 'user', content: user }], schema: SPEAKING_SCHEMA, meta: { ownWords: own, minOwn: RULES.speakingMinOwn, ability } }, meters);
  const j = JSON.parse(res.text) as { level: SpeakingVerdict; reason: string };
  return { ...j, ms: res.ms };
}

export async function runLearner(brain: Brain, design: Design, p: Persona, conversations: number, turnsEach: number, log: (s: string) => void): Promise<LearnerRun> {
  const meters = emptyMeters();
  const people = cast();
  let state: LadderState = startAt(p.startStep);
  const out: ConversationRun[] = [];
  for (let i = 0; i < conversations; i++) {
    const { stage, supports, supportBack } = nextConversation(state);
    // Same person and same draws for every design: seeded by learner and conversation
    const rng = seeded(p.id, i);
    const { character, city } = people[Math.floor(rng() * people.length)];
    const { ability, rates } = learnerAt(p, i, conversations, stage.demand);
    const who = { name: character.name, role: character.role, city, age: character.age };
    const turns: ConversationRun['turns'] = [];
    const transcript: Turn[] = [];
    const learnerTurns: LearnerTurn[] = [];
    let error: string | undefined;
    try {
      const ctx: Ctx = { brain, meters, design, stage, supports, supportBack, character, turn: 0 };
      let npc = await characterTurn(ctx, transcript);
      turns.push({ who: 'npc', npc });
      transcript.push({ who: 'npc', transcript: npc.line, translation: npc.en });
      for (let t = 0; t < turnsEach; t++) {
        const roll = rng();
        const intent = intentFor(rates, roll, npc.answers.length > 0);
        const lt = await learnerTurn(brain, meters, intent, ability, stage.demand, { ...who }, turns, npc.answers, rng());
        learnerTurns.push(lt);
        turns.push({ who: 'learner', learner: lt, intent });
        // Silence: the mic closes and it's still their turn; nothing is sent
        if (lt.lang === 'none') continue;
        npc = await characterTurn({ ...ctx, turn: t + 1 }, transcript, lt.said);
        transcript.push({ who: 'learner', transcript: lt.said }, { who: 'npc', transcript: npc.line, translation: npc.en });
        turns.push({ who: 'npc', npc });
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    const record = recordOf(learnerTurns);
    const base = { i, step: state.step, stage: stage.id, path: stage.path, listener: stage.listener, supports, supportBack, character: who, turns, record, error };
    const pooled = [...out.filter((c) => !c.error), base].slice(-RULES.speakingPool);
    const verdict = design !== 'A' && !error ? await speakingJudge(brain, meters, pooled, ability).catch((e) => ({ level: 'not enough to tell' as const, reason: `judge failed: ${e instanceof Error ? e.message : e}`, ms: 0 })) : undefined;
    // A failed conversation doesn't move the ladder
    const d = error ? null : decide(design, state, record, verdict?.level);
    const { next, ...decision } = d ?? { next: state, felt: 'neither' as const, feltWhy: 'error', easyInWindow: '', moved: false };
    out.push({ ...base, verdict, decision: { ...decision, stepAfter: next.step } });
    log(`${design} ${p.id} #${i + 1}: step ${state.step} stage ${stage.id}${supportBack ? '+' : ''} · words ${record.words} (${record.wordsTarget} ${language.name}, ${record.wordsOwn} own) · own ${record.ownWords} back ${record.saidBack} en ${record.english} help ${record.helpAsks} silent ${record.silent} → ${decision.felt} (${decision.feltWhy})${verdict ? ` · judge ${verdict.level}` : ''}${decision.moved ? ` · UP to ${next.step}` : ''}${decision.heldBy ? ` · held (${decision.heldBy})` : ''}${error ? ` · ERROR ${error}` : ''}`);
    state = next;
  }
  return { design, persona: p.id, startStep: p.startStep, conversations: out, meters };
}

