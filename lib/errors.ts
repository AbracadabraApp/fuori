/**
 * Client-side error handling: short codes, retries, plain-language messages,
 * and reporting to the server log so errors on the phone are visible in Railway.
 *
 * Each request carries an x-fuori-id header. If it fails, the same id is the
 * code shown to the learner (e.g. E-7K2F) and appears in the server log line,
 * so `railway logs | grep E-7K2F` finds both sides.
 */

import { language } from '@/content/it/language';

export type ErrorKind = 'mic' | 'network' | 'server';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function newErrorId(): string {
  let id = '';
  for (let i = 0; i < 4; i++) id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `E-${id}`;
}

/** An error that knows its code, kind and where it happened. */
export class FuoriError extends Error {
  constructor(
    message: string,
    public id: string,
    public kind: ErrorKind,
    public step: string,
    public status?: number
  ) {
    super(message);
  }
}

const RETRY_STATUS = new Set([429, 500, 502, 503, 504, 529]);

/**
 * fetch with one retry for temporary failures (network blip, overloaded API).
 * Throws FuoriError with the request's id on final failure.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  step: string,
  id: string = newErrorId()
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('x-fuori-id', id);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers });
      if (res.ok) return res;
      if (attempt === 0 && RETRY_STATUS.has(res.status)) {
        await wait(700);
        continue;
      }
      throw new FuoriError(await describeResponse(res), id, 'server', step, res.status);
    } catch (err) {
      if (err instanceof FuoriError) throw err;
      // fetch itself failed: offline or connection dropped
      if (attempt === 0) {
        await wait(700);
        continue;
      }
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      throw new FuoriError(
        `${step}: ${err instanceof Error ? err.message : String(err)}${offline ? ' (offline)' : ''}`,
        id,
        'network',
        step
      );
    }
  }
  throw new FuoriError(`${step}: retry loop ended`, id, 'server', step);
}

async function describeResponse(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body.details ?? body.error;
    return `${res.status}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  } catch {
    return `${res.status}`;
  }
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Microphone errors from getUserMedia. */
export function micError(err: unknown): FuoriError {
  const name = err instanceof Error ? err.name : '';
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  const id = newErrorId();
  return new FuoriError(message, id, name === 'NotAllowedError' || name === 'NotFoundError' || name === 'SecurityError' ? 'mic' : 'server', 'microphone');
}

/** Wrap anything thrown into a FuoriError. */
export function toFuoriError(err: unknown, step: string): FuoriError {
  if (err instanceof FuoriError) return err;
  return new FuoriError(err instanceof Error ? err.message : String(err), newErrorId(), 'server', step);
}

/** What the learner sees: what failed, plainly, with a code. Never raw technical text. */
export function userMessage(err: FuoriError, characterName = 'They'): string {
  switch (err.kind) {
    case 'mic':
      return 'Fuori needs the microphone. On iPhone: Settings → Safari → Microphone → Allow, then try again.';
    case 'network':
      return `No connection. Check your signal and try again. (${err.id})`;
  }
  switch (err.step) {
    case 'transcribe':
      return `Speech recognition failed, so your words didn't get through. Not your ${language.name}: try again. (${err.id})`;
    case 'reply':
      return `${characterName} couldn't reply. Try again. (${err.id})`;
    case 'opening line':
      return `${characterName} couldn't start the conversation. Tap Start to try again. (${err.id})`;
    default:
      return `Something went wrong. Try again. (${err.id})`;
  }
}

/**
 * Short note shown when the character falls back to the phone's own voice.
 * The conversation keeps going, so this is a note, not an error box, but it
 * says what happened instead of switching voices silently.
 */
export function voiceNote(err: FuoriError | null, matchesGender: boolean, gender?: 'f' | 'm'): string | null {
  const parts: string[] = [];
  if (err) {
    const quota = /quota/i.test(err.message);
    parts.push(quota ? `Voice service quota used up, so using the phone's voice. (${err.id})` : `Voice service failed, so using the phone's voice. (${err.id})`);
  }
  if (!matchesGender && gender) {
    parts.push(`No ${gender === 'm' ? 'male' : 'female'} ${language.name} voice on this phone (Settings → Accessibility → Spoken Content → Voices → ${language.name}).`);
  }
  return parts.length ? parts.join(' ') : null;
}

/** Send the error to the server log. Never throws. */
export function reportError(err: FuoriError, context: Record<string, unknown> = {}): void {
  console.error(`[${err.id}] ${err.step}: ${err.message}`, context);
  try {
    const body = JSON.stringify({
      id: err.id,
      kind: err.kind,
      step: err.step,
      status: err.status,
      message: err.message.slice(0, 2000),
      context,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      at: new Date().toISOString(),
    });
    // keepalive lets the report finish even if the page is closing
    fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    // reporting must never break the app
  }
}
