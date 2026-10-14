/**
 * Magda's system prompt and first turn, from content/<country>/prompts/magda-teaching.md:
 * the school and city she's in, how many lessons she's taught the learner, her
 * study file on them (her memory: lib/study-file.ts), and how many replies
 * they've made this lesson (the one fact she gets each turn for pacing).
 *
 * Server-side only (reads the template from disk).
 */

import { readPromptFile, fill } from './template';
import { language } from '@/content';
import { howLongAgo, type RememberedLearner } from './build-turn-prompt';
import type { CharacterSheet, Turn } from '../types';

export function tutorPromptVersion(): string {
  return readPromptFile('magda-teaching.md').version;
}

/** Replies the learner has made this lesson, counting the one being answered now. */
export function repliesSoFar(transcript: Turn[], learnerSaid?: string): number {
  return transcript.filter((t) => t.who === 'learner').length + (learnerSaid ? 1 : 0);
}

export function buildTutorPrompt(params: {
  character: CharacterSheet;
  /** Magda's memory: notes = the study file, visits = lessons taught */
  memory?: RememberedLearner;
  replies: number;
  now?: Date;
}): { system: string; firstTurn: string; version: string } {
  const { character, memory, replies, now = new Date() } = params;
  const f = readPromptFile('magda-teaching.md');
  const [school] = (character.appearance?.setting ?? '').split(',');
  const lessons = memory?.visits ?? 0;

  const system = fill(f.block('System prompt'), {
    language: language.name,
    school: school?.trim() || 'the language school',
    city: character.city,
    lessons:
      lessons < 1
        ? f.block('First lesson')
        : fill(f.block('Later lessons'), {
            count: lessons === 1 ? 'once' : lessons === 2 ? 'twice' : `${lessons} times`,
            lastSeen: memory?.lastVisit ? howLongAgo(new Date(memory.lastVisit), now) : 'some time ago',
          }),
    studyFile: memory?.notes.length ? memory.notes.join('\n') : f.block('No notes yet'),
    reply: String(replies),
  });
  return { system, firstTurn: f.block('First turn').trim(), version: f.version };
}
