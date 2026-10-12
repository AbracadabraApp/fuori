/**
 * Stop everything a conversation might be doing out loud: the character's
 * voice (hosted audio or the phone's own voice) and the microphone.
 *
 * Called when the learner leaves the conversation screen or switches away from
 * the app. Before this, characters kept talking after you went back to the
 * places list or opened another app (2026-10-11).
 *
 * Parts are passed in (not read from globals) so this can be tested without a
 * browser: see tests/check-silence.ts.
 */

export interface Silenceable {
  audio?: { pause(): void } | null;
  synth?: { cancel(): void } | null;
  recorder?: { state: string; stop(): void } | null;
  stream?: { getTracks(): { stop(): void }[] } | null;
  meter?: { stop(): void } | null;
}

export function silenceAll(parts: Silenceable): void {
  // Each step on its own: one failing must not leave the others running
  try { parts.audio?.pause(); } catch {}
  try { parts.synth?.cancel(); } catch {}
  try { if (parts.recorder && parts.recorder.state !== 'inactive') parts.recorder.stop(); } catch {}
  try { parts.stream?.getTracks().forEach((t) => t.stop()); } catch {}
  try { parts.meter?.stop(); } catch {}
}
