/**
 * End of a conversation: one Claude call reads the transcript and writes the
 * character's notes about the learner (back in the prompt next visit) and the
 * review-log entry (debug only in M1). Prompt: content/it/prompts/memory.md.
 *
 * Called from /api/conversation/end, which the phone sends when the learner
 * leaves the screen or the app goes to the background. Like recording, this
 * never throws: problems are logged and the conversation is simply not
 * remembered this time (the next end signal tries again).
 *
 * Server-side only.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { buildMemoryPrompt, memoryPromptVersion, type MemoryPromptInput } from './prompts/build-memory-prompt';
import { memoryOutputJsonSchema } from './prompts/memory-output-schema';
import { claimForMemory, releaseMemoryClaim, saveConversationMemory, loadCharacterMemory } from './memory';
import { recordingEnabled } from './recording';
import { characterForPlace } from './characters/for-place';
import { cities } from '@/content';
import type { CharacterSheet } from './types';
import { scoreConversation, saveConversationScore, judgeWithClaude, type Judge } from './quality';

/** "A few exchanges": shorter conversations aren't worth remembering */
export const MIN_LEARNER_LINES = 2;

const MemoryOutputSchema = z.object({
  notes: z.array(z.string()),
  review: z.object({
    items: z.array(z.object({ phrase: z.string(), en: z.string(), why: z.string() })),
    mistakes: z.array(z.object({ said: z.string(), better: z.string(), why: z.string() })),
  }),
});
export type MemoryOutput = z.infer<typeof MemoryOutputSchema>;

/** Writes notes and review from a transcript. Tests pass a fake. */
export type Summarizer = (input: MemoryPromptInput) => Promise<MemoryOutput>;

export const summarizeWithClaude: Summarizer = async (input) => {
  const prompt = buildMemoryPrompt(input);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: memoryOutputJsonSchema } },
  });
  const out = MemoryOutputSchema.parse(JSON.parse(replyText(response)));
  // The prompt asks for at most 10 short notes; hold to it so the character prompt stays short
  return { ...out, notes: out.notes.map((n) => n.trim()).filter(Boolean).slice(0, 10) };
};

/** The character sheet for a recorded conversation, from content. */
export function findCharacter(cityId: string, characterId: string): CharacterSheet | undefined {
  const city = cities.find((c) => c.id === cityId);
  const place = city?.places.find((p) => p.characterId === characterId);
  return city && place ? characterForPlace(city, place) : undefined;
}

function logError(where: string, err: unknown, conversationId: string) {
  console.error(JSON.stringify({ level: 'error', where, conversationId, message: err instanceof Error ? err.message : String(err) }));
}

export type RememberResult = 'saved' | 'nothing new' | 'failed';

export async function rememberConversation(
  conversationId: string,
  learnerId: string,
  summarize: Summarizer = summarizeWithClaude,
  judge: Judge = judgeWithClaude
): Promise<RememberResult> {
  if (!recordingEnabled()) return 'nothing new';
  let claim: Awaited<ReturnType<typeof claimForMemory>> = null;
  try {
    claim = await claimForMemory(conversationId, learnerId, MIN_LEARNER_LINES);
    if (!claim) return 'nothing new';

    const character = findCharacter(claim.cityId, claim.characterId);
    if (!character) throw new Error(`character ${claim.characterId} not found in ${claim.cityId || 'any city'}`);

    const known = await loadCharacterMemory(learnerId, claim.characterId);
    const out = await summarize({ character, notes: known.notes, turns: claim.turns });
    await saveConversationMemory({
      conversationId,
      learnerId,
      characterId: claim.characterId,
      notes: out.notes,
      review: { ...out.review, promptVersion: memoryPromptVersion() },
      firstTime: claim.firstTime,
    });
    console.log(JSON.stringify({ level: 'info', event: 'memory', conversationId, character: claim.characterId, notes: out.notes.length, firstTime: claim.firstTime }));

    // Score it for the dialogue scorecard (lib/quality.ts). Separate from memory:
    // a scoring problem is logged and memory stays saved.
    try {
      const score = await scoreConversation(character, claim.turns, judge);
      await saveConversationScore(conversationId, score);
      console.log(JSON.stringify({ level: 'info', event: 'quality', conversationId, character: claim.characterId, median: score.stats.wordsMedian, unprompted: score.judge.correctionsUnprompted, pronunciation: score.judge.pronunciationCorrections }));
    } catch (err) {
      logError('quality', err, conversationId);
    }
    return 'saved';
  } catch (err) {
    logError('memory', err, conversationId);
    if (claim) await releaseMemoryClaim(conversationId, claim.before, claim.claimed).catch((e) => logError('memory release', e, conversationId));
    return 'failed';
  }
}
