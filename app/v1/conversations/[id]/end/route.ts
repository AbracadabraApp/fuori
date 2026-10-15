/**
 * POST /v1/conversations/{id}/end → { remembered: 'saved' | 'nothing new' | 'failed' }
 *
 * The learner left the conversation: mark it ended, then write the
 * character's notes, the learning notes and Magda's study file
 * (lib/remember.ts). Safe to send more than once: only rewritten when there
 * are new turns. Unlike the web's beacon, the app waits for the answer and
 * retries on its next launch if this fails, so failures are reported.
 */
import { apiError, apiJson, withLearner } from '@/lib/api';
import { markConversationEnded } from '@/lib/recording';
import { rememberConversation } from '@/lib/remember';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withLearner(request, 'v1 conversation end', async (learnerId) => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return apiError('bad_request', 'Not a conversation id');
    await markConversationEnded(id, learnerId);
    const remembered = await rememberConversation(id, learnerId);
    if (remembered === 'failed') return apiError('server_error', 'Saving what the character remembers failed; send again');
    return apiJson({ remembered });
  });
}
