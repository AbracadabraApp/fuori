/**
 * Builds the prompt for one conversation turn from the template in
 * content/it/prompts/character.md (the source of truth, with its own version
 * and changelog). This file only fills in the placeholders.
 *
 * Server-side only (reads the template from disk).
 */

import { readPromptFile, fill } from './template';
import { language } from '@/content';
import type { CharacterSheet, Gender, Turn } from '../types';

/** What the character remembers about this learner (from character_memories) */
export interface RememberedLearner {
  visits: number;
  lastVisit: Date | null;
  notes: string[];
}

/**
 * How the conversation so far reaches Claude: real back-and-forth messages,
 * only the last RECENT_TURNS turns word for word; the learner's earlier lines
 * ride along in one short line (recentMessages below). The only way since
 * 2026-10-16 (Josh): the old "document" mode sent the conversation as one
 * block, but prompt 2026-10-12h took the conversation out of that block, so it
 * sent only the last line, while production had run this mode (TURN_HISTORY=
 * recent) since 2026-10-13.
 */
export const RECENT_TURNS = Number(process.env.TURN_RECENT_TURNS) || 40;
// Was 6 until 2026-10-18: past the window the character's own earlier lines
// were dropped, so it introduced itself and asked the same things again
// (round 15: repeats 4.4% → 2.4% of its lines with 40). 40 is in practice the
// whole conversation; TURN_RECENT_TURNS overrides it in tests.

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BuildTurnPromptParams {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
  /** Absent or 0 visits: they haven't met */
  memory?: RememberedLearner;
  /** Whether the learner is a woman or a man (learners.addressed_as), so the
   *  character's agreement is right; absent when unknown */
  addressedAs?: Gender;
  /** For "last time was yesterday"; defaults to now (tests pass a fixed date) */
  now?: Date;
  /** Replaces the character system prompt and first turn (Magda: build-tutor-prompt.ts) */
  system?: string;
  firstTurn?: string;
  /** Experimental: a block from content/<country>/prompts/levels.md (e.g.
   *  "Beginner: shape"), added at the end of the character prompt. The tests
   *  pass one, and so does a level trial for listed learners
   *  (lib/conversation/level-trial.ts); without it the prompt is today's. */
  level?: string;
  /** Where the level block goes: the end of the system prompt (default) or
   *  the start of the newest message, closest to the reply (tests only) */
  levelAt?: 'system' | 'last';
}

interface TurnPrompt {
  system: string;
  /** What to send as `messages`: the opening situation, then the back-and-forth */
  messages: PromptMessage[];
  version: string;
}

export interface Template {
  version: string;
  system: string;
  firstTurn: string;
  firstMeeting: string;
  metBefore: string;
  earlier: string;
}

export function loadTemplate(): Template {
  // CHARACTER_PROMPT names a trial file next to character.md (tests only; production doesn't set it)
  const f = readPromptFile(process.env.CHARACTER_PROMPT || 'character.md');
  return {
    version: f.version,
    system: f.block('System prompt'),
    firstTurn: f.block('First turn'),
    firstMeeting: f.block('Relationship: first meeting'),
    metBefore: f.block('Relationship: met before'),
    earlier: f.block('Later turns: earlier in the conversation'),
  };
}

/** Version of the character prompt in use (from character.md), with the level block if one is added */
export function promptVersion(level?: string): string {
  const v = loadTemplate().version;
  return level ? `${v}+${level}` : v;
}

function timesMet(visits: number): string {
  return visits === 1 ? 'once' : visits === 2 ? 'twice' : `${visits} times`;
}

/** "earlier today", "yesterday", "5 days ago", "about 3 weeks ago" */
export function howLongAgo(then: Date, now: Date): string {
  const day = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  const days = day(now) - day(then);
  if (days <= 0) return 'earlier today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `about ${Math.round(days / 7)} weeks ago`;
  return `about ${Math.round(days / 30)} months ago`;
}

/** The {relationship} line: what this character knows about the person. */
export function relationshipLine(t: Template, memory: RememberedLearner | undefined, now: Date): string {
  if (!memory || memory.visits < 1) return fill(t.firstMeeting, {});
  return fill(t.metBefore, {
    visits: timesMet(memory.visits),
    lastSeen: memory.lastVisit ? howLongAgo(new Date(memory.lastVisit), now) : '',
    notes: memory.notes.join('; '),
  });
}

/** The {person} line: what the character can see. Empty (line left out) when unknown. */
export function personLine(addressedAs: Gender | undefined): string {
  return addressedAs ? `The person in front of you is ${addressedAs === 'f' ? 'a woman' : 'a man'}.` : '';
}

export function buildTurnPrompt(params: BuildTurnPromptParams): TurnPrompt {
  const { character, transcript, learnerSaid, memory, now = new Date() } = params;
  const base = loadTemplate();
  const t = params.firstTurn ? { ...base, firstTurn: params.firstTurn } : base;

  const english =
    character.englishAbility === 'fluent'
      ? 'You speak fluent English.'
      : character.englishAbility === 'basic'
        ? 'You speak basic English.'
        : '';

  const system = params.system ?? fill(t.system, {
    name: character.name,
    age: String(character.age),
    role: character.role,
    city: character.city,
    language: language.name,
    setting: character.appearance?.setting ?? '',
    traits: character.personality.traits.join(', '),
    formality: `${language.formality[character.speech.formality]} (${character.speech.formality})`,
    english,
    person: personLine(params.addressedAs),
    relationship: relationshipLine(t, memory, now),
  });
  const levelBlock = params.level && !params.system
    ? fill(readPromptFile('levels.md').block(params.level), {
        language: language.name,
        role: character.role,
        formality: language.formality[character.speech.formality],
      })
    : '';
  const levelled = levelBlock && params.levelAt !== 'last' ? `${system}\n\n${levelBlock}` : system;

  const messages: PromptMessage[] =
    transcript.length > 0 ? recentMessages(t, transcript, learnerSaid ?? '') : [{ role: 'user', content: t.firstTurn.trim() }];

  if (levelBlock && params.levelAt === 'last') {
    const last = messages[messages.length - 1];
    messages[messages.length - 1] = { ...last, content: `(${levelBlock})\n\n${last.content}` };
  }

  return { system: levelled, messages, version: params.level ? `${t.version}+${params.level}` : t.version };
}

/**
 * The conversation as alternating messages: the opening situation, then the
 * character's lines as assistant turns (in the same JSON shape it answers in)
 * and the learner's as user turns, ending with what they just said. Only the
 * last RECENT_TURNS turns are kept word for word; the learner's earlier lines
 * go in one "Earlier in this conversation they said" line at the start of the
 * oldest kept message, so their name and requests aren't lost.
 */
export function recentMessages(t: Template, transcript: Turn[], learnerSaid: string): PromptMessage[] {
  const all: PromptMessage[] = [
    { role: 'user', content: t.firstTurn.trim() },
    ...transcript.map((turn): PromptMessage =>
      turn.who === 'npc'
        ? { role: 'assistant', content: JSON.stringify({ line: turn.transcript, en: turn.translation ?? '' }) }
        : { role: 'user', content: turn.transcript }
    ),
    { role: 'user', content: learnerSaid },
  ];

  // Keep the last RECENT_TURNS turns plus the new line; the kept part must start with a user message
  let start = Math.max(0, all.length - 1 - RECENT_TURNS);
  while (start > 0 && all[start].role !== 'user') start--;
  const dropped = all.slice(1, start).filter((m) => m.role === 'user').map((m) => `"${m.content}"`);
  // Two lines in a row from the same side (a lost reply, a double tap) become one message
  const kept: PromptMessage[] = [];
  for (const m of all.slice(start)) {
    const last = kept[kept.length - 1];
    if (last && last.role === m.role) last.content += `\n${m.content}`;
    else kept.push({ ...m });
  }
  if (dropped.length) {
    kept[0].content = `${fill(t.earlier, { earlier: dropped.join(' · ') })}\n\n${kept[0].content}`;
  }
  return kept;
}
