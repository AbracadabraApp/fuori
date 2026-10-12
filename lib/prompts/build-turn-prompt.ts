/**
 * Builds the prompt for one conversation turn from the template in
 * content/it/prompts/character.md (the source of truth, with its own version
 * and changelog). This file only fills in the placeholders.
 *
 * Server-side only (reads the template from disk).
 */

import { readPromptFile, fill } from './template';
import type { CharacterSheet, Turn } from '../types';

/** What the character remembers about this learner (from character_memories) */
export interface RememberedLearner {
  visits: number;
  lastVisit: Date | null;
  notes: string[];
}

/**
 * How the conversation so far reaches Claude.
 * - `document` (default): the whole conversation as one "Previous conversation" block.
 * - `recent`: real back-and-forth messages, only the last RECENT_TURNS turns word for
 *   word; the learner's earlier lines ride along in one short line. A candidate for
 *   shorter replies (roadmap Now), tried with the replay test before it ships.
 * Set with the TURN_HISTORY environment variable, or per call (the replay test).
 */
export type HistoryMode = 'document' | 'recent';
export const RECENT_TURNS = 6;

export function historyModeFromEnv(): HistoryMode {
  return process.env.TURN_HISTORY === 'recent' ? 'recent' : 'document';
}

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
  /** For "last time was yesterday"; defaults to now (tests pass a fixed date) */
  now?: Date;
  /** Defaults to TURN_HISTORY (document unless set to recent) */
  history?: HistoryMode;
}

interface TurnPrompt {
  system: string;
  /** The single user message in `document` mode (kept for tests and reports) */
  user: string;
  /** What to send as `messages`: one user message, or the back-and-forth in `recent` mode */
  messages: PromptMessage[];
  version: string;
  history: HistoryMode;
}

export interface Template {
  version: string;
  system: string;
  firstTurn: string;
  laterTurns: string;
  firstMeeting: string;
  metBefore: string;
  earlier: string;
}

export function loadTemplate(): Template {
  const f = readPromptFile('character.md');
  return {
    version: f.version,
    system: f.block('System prompt'),
    firstTurn: f.block('First turn'),
    laterTurns: f.block('Later turns'),
    firstMeeting: f.block('Relationship: first meeting'),
    metBefore: f.block('Relationship: met before'),
    earlier: f.block('Later turns: earlier in the conversation'),
  };
}

/** Version of the character prompt in use (from character.md). */
export function promptVersion(): string {
  return loadTemplate().version;
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

export function buildTurnPrompt(params: BuildTurnPromptParams): TurnPrompt {
  const { character, transcript, learnerSaid, memory, now = new Date() } = params;
  const history = params.history ?? historyModeFromEnv();
  const t = loadTemplate();

  const english =
    character.englishAbility === 'fluent'
      ? 'You speak fluent English.'
      : character.englishAbility === 'basic'
        ? 'You speak basic English.'
        : '';

  const system = fill(t.system, {
    name: character.name,
    age: String(character.age),
    role: character.role,
    city: character.city,
    setting: character.appearance?.setting ?? '',
    traits: character.personality.traits.join(', '),
    formality: character.speech.formality === 'Lei' ? 'Lei (formal)' : 'tu (informal)',
    english,
    relationship: relationshipLine(t, memory, now),
  });

  const user =
    transcript.length === 0
      ? t.firstTurn.trim()
      : fill(t.laterTurns, {
          transcript: transcript.map((turn) => `${turn.who === 'npc' ? 'You' : 'Them'}: ${turn.transcript}`).join('\n'),
          learnerSaid: learnerSaid ?? '',
        });

  const messages: PromptMessage[] =
    history === 'recent' && transcript.length > 0
      ? recentMessages(t, transcript, learnerSaid ?? '')
      : [{ role: 'user', content: user }];

  return { system, user, messages, version: t.version, history };
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
        ? { role: 'assistant', content: JSON.stringify({ it: turn.transcript, en: turn.translation ?? '' }) }
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
