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

interface BuildTurnPromptParams {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
  /** Absent or 0 visits: they haven't met */
  memory?: RememberedLearner;
  /** For "last time was yesterday"; defaults to now (tests pass a fixed date) */
  now?: Date;
}

interface TurnPrompt {
  system: string;
  user: string;
  version: string;
}

interface Template {
  version: string;
  system: string;
  firstTurn: string;
  laterTurns: string;
  firstMeeting: string;
  metBefore: string;
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

  return { system, user, version: t.version };
}
