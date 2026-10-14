/**
 * Leaving a conversation, by any exit (the back link, or boarding at the
 * station): silence everything, then tell the server the conversation ended,
 * which is when the character writes their notes and the learning notes are
 * saved (/api/conversation/end, lib/remember.ts). Every exit must go through
 * here, or the clerk forgets you and your notes are never written, unseen
 * (Josh, 2026-10-14). The server accepts the end more than once.
 */
export type Beacon = (url: string, body: string) => boolean;

/** Tell the server the conversation ended. A beacon survives navigation. */
export function sendConversationEnd(conversationId: string | null, beacon: Beacon | undefined): boolean {
  if (!conversationId || !beacon) return false;
  return beacon('/api/conversation/end', JSON.stringify({ conversationId }));
}

/** Silence, save, then go wherever the exit leads. */
export function leaveConversation(opts: {
  silence: () => void;
  conversationId: string | null;
  beacon: Beacon | undefined;
  then: () => void;
}): void {
  try {
    opts.silence();
  } catch {
    // A voice or mic that won't stop must not stop the save or the exit
  }
  sendConversationEnd(opts.conversationId, opts.beacon);
  opts.then();
}
