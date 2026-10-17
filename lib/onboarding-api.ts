/**
 * Shared bits of the /v1/onboarding/* routes: the answer shape and Claude
 * failures turned into the API's error codes (same mapping as /v1/turn).
 */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { apiError } from '@/lib/api';
import { MAX_SAID_CHARS } from '@/lib/turn-request';
import { logServerError } from '@/lib/server-log';

/** One answer as the app heard it: the transcript and the language Whisper detected */
export const Answer = z.object({
  text: z.string().trim().min(1).max(MAX_SAID_CHARS),
  language: z.string().max(40).optional(),
});

export function claudeFailed(request: Request, where: string, err: unknown): Response {
  logServerError(request, where, err);
  if (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500)) {
    return apiError('upstream_unavailable', 'Claude is busy or unavailable', 2000);
  }
  const id = request.headers.get('x-fuori-id');
  return apiError('server_error', `Something went wrong on the server${id ? ` (${id})` : ''}`);
}

export function badRequest(error: z.ZodError): Response {
  return apiError('bad_request', error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; '));
}
