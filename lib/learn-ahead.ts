/**
 * The Learn page written ahead, while the learner talks (Josh, 2026-10-22:
 * opening Learn took 7–9 s; "both": no thinking step, and write it ahead).
 * After each of the learner's turns from the 4th on (when the app shows the
 * Learn link: ConversationModel.hasSomethingToLearn), /v1/turn starts the
 * page for the conversation as it now stands; /v1/learn takes it when the
 * conversation hasn't moved on since, or waits for it if it's still being
 * written, and otherwise writes one as before.
 *
 * Keyed on the conversation and its number of turns, so a page is only ever
 * used for exactly the conversation it was written from. One server process
 * per country (Railway), so a map in memory is enough; pages are dropped
 * after 30 minutes.
 */
import { learnAvailable, writeLearnPage, type LearnPageOut } from '@/lib/learn';
import type { CharacterSheet, Turn } from '@/lib/types';

/** The app shows the Learn link after this many learner lines */
export const LEARN_AFTER_LINES = 4;
const KEEP_MS = 30 * 60 * 1000;

const ahead = new Map<string, { turns: number; page: Promise<LearnPageOut | null>; at: number }>();

function sweep(now: number) {
  for (const [k, v] of ahead) if (now - v.at > KEEP_MS) ahead.delete(k);
}

/**
 * Start writing the page for this conversation as it now stands, once the
 * learner has said enough for the Learn link. A failure is reported through
 * onError and /v1/learn then writes the page itself.
 */
export function writeLearnAhead(p: {
  conversationId: string;
  character: CharacterSheet;
  city: string;
  transcript: Turn[];
  onError: (err: unknown) => void;
  /** For tests: the page writer */
  write?: typeof writeLearnPage;
}): boolean {
  if (!learnAvailable()) return false;
  if (p.transcript.filter((t) => t.who === 'learner').length < LEARN_AFTER_LINES) return false;
  const now = Date.now();
  sweep(now);
  const page = (p.write ?? writeLearnPage)(p.character, p.city, p.transcript).catch((err) => {
    p.onError(err);
    return null;
  });
  ahead.set(p.conversationId, { turns: p.transcript.length, page, at: now });
  return true;
}

/**
 * The page written ahead for exactly this conversation (same number of
 * turns), waiting for it if it's still being written; null when there's none
 * or it failed. Kept, so opening Learn again at the same point is instant too.
 */
export async function learnPageAhead(conversationId: string, turns: number): Promise<LearnPageOut | null> {
  const found = ahead.get(conversationId);
  if (!found || found.turns !== turns || Date.now() - found.at > KEEP_MS) return null;
  return found.page;
}
