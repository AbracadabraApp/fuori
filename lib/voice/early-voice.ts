/**
 * The character's voice, started before the app asks for it (roadmap N4,
 * speed; 2026-10-22). /v1/turn starts the voice as soon as Claude has written
 * the line, while the English is still being written and the reply is on its
 * way to the phone; the app's /v1/speak for the same learner, character,
 * speed and text takes the result instead of starting again.
 *
 * One server process per country (Railway), so a map in memory is enough.
 * Unclaimed voices (the learner left, or the app asked at another speed) are
 * dropped after two minutes. A failed early voice is logged by the caller and
 * /v1/speak simply makes the voice itself.
 */
import { elevenLabsVoiceFor, language, onboarding } from '@/content';
import { characterGender } from '@/lib/characters/by-id';
import { getVoiceProvider } from '@/lib/voice/providers';
import type { SynthesisResult } from '@/lib/voice/providers/types';

const KEEP_MS = 2 * 60 * 1000;

const early = new Map<string, { result: Promise<SynthesisResult | null>; at: number }>();

/** The speed the app asks for when the learner hasn't said (English off: 0.9) */
export const DEFAULT_APP_SPEED = 0.9;

/** Which ElevenLabs voice says a character's lines: the greeter has her own, characters one by gender */
export function voiceForCharacter(characterId: string): string | undefined {
  return characterId === onboarding.guide.id ? onboarding.guide.voice : elevenLabsVoiceFor(characterId, characterGender(characterId));
}

/** How the voice is delivered: the greeter's own settings (livelier), characters the defaults */
export function deliveryForCharacter(characterId: string): { stability?: number; style?: number } {
  if (characterId !== onboarding.guide.id) return {};
  const g = onboarding.guide as { stability?: number; style?: number };
  return { stability: g.stability, style: g.style };
}

function key(learnerId: string, characterId: string, speed: number, text: string): string {
  return `${learnerId}\u0000${characterId}\u0000${speed}\u0000${text}`;
}

function sweep(now: number) {
  for (const [k, v] of early) if (now - v.at > KEEP_MS) early.delete(k);
}

/**
 * Start making the voice for a line. Does nothing unless the hosted voice is
 * configured. `onError` reports a failure; the result is then null and
 * /v1/speak makes the voice itself.
 */
export function startEarlyVoice(p: { learnerId: string; characterId: string; text: string; speed: number; previousText?: string; onError: (err: unknown) => void }): void {
  const provider = getVoiceProvider();
  if (provider.name !== 'elevenlabs') return;
  const now = Date.now();
  sweep(now);
  const result = provider
    .synthesize({ text: p.text, language: language.code, characterId: p.characterId, voice: voiceForCharacter(p.characterId), ...deliveryForCharacter(p.characterId), speed: p.speed, previousText: p.previousText })
    .catch((err) => {
      p.onError(err);
      return null;
    });
  early.set(key(p.learnerId, p.characterId, p.speed, p.text), { result, at: now });
}

/** The early voice for exactly this line, if one was started; taken once */
export function takeEarlyVoice(learnerId: string, characterId: string, speed: number, text: string): Promise<SynthesisResult | null> | undefined {
  const k = key(learnerId, characterId, speed, text);
  const found = early.get(k);
  if (!found) return undefined;
  early.delete(k);
  if (Date.now() - found.at > KEEP_MS) return undefined;
  return found.result;
}

/**
 * The line so far from a streamed `{ "line": "...", "en": "..." }` reply,
 * once its string has closed; undefined until then. Works on any prefix of the
 * JSON, so it can run on every streamed chunk.
 */
export function lineWhenWritten(partialJson: string): string | undefined {
  const p = partialLine(partialJson);
  return p?.closed && p.text.trim() ? p.text : undefined;
}

/**
 * As much of the line as has been written, decoded, and whether its string
 * has closed. undefined before the line starts.
 */
export function partialLine(partialJson: string): { text: string; closed: boolean } | undefined {
  const m = /"line"\s*:\s*"((?:[^"\\]|\\.)*)(")?/.exec(partialJson);
  if (!m) return undefined;
  // Drop an escape cut off at the end of the chunk (\ or \u00e) before decoding
  const body = m[2] ? m[1] : m[1].replace(/\\(u[0-9a-fA-F]{0,3})?$/, '');
  try {
    return { text: JSON.parse(`"${body}"`), closed: !!m[2] };
  } catch {
    return undefined;
  }
}

/** A first sentence shorter than this many words isn't split off: the gap isn't worth it */
const MIN_FIRST_WORDS = 3;

/**
 * The first sentence of a line still being written, once something follows
 * it: the line up to and including the end mark and the space after it, so
 * the line starts with it exactly. Punctuation only (. ! ? …, then any
 * closing quote or bracket, then a space), so it works in any language.
 */
export function firstSentence(written: string): string | undefined {
  const end = /[.!?…]+["'»”’)\]]*\s+(?=\S)/g;
  for (let m = end.exec(written); m; m = end.exec(written)) {
    const head = written.slice(0, m.index + m[0].length);
    if (head.trim().split(/\s+/).length >= MIN_FIRST_WORDS) return head;
  }
  return undefined;
}

/**
 * Watches a streamed reply. With `split`, calls onFirst with the first
 * sentence as soon as more of the line follows it; then, when the line is
 * written, onLine with the whole line and the first sentence if one was
 * sent. Without `split` (apps that don't stream), only onLine.
 */
export class LineWatcher {
  private first?: string;
  private done = false;

  constructor(private o: { split: boolean; onFirst?: (first: string) => void; onLine: (line: string, first?: string) => void }) {}

  feed(snapshot: string): void {
    if (this.done) return;
    const p = partialLine(snapshot);
    if (!p) return;
    if (this.o.split && !this.first && !p.closed) {
      const first = firstSentence(p.text);
      if (first) {
        this.first = first;
        this.o.onFirst?.(first);
      }
    }
    if (p.closed && p.text.trim()) {
      this.done = true;
      this.o.onLine(p.text, this.first);
    }
  }
}
