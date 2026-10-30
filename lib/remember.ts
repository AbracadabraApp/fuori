/**
 * End of a conversation: one Claude call reads the transcript and writes the
 * character's notes about the learner (back in the prompt next visit) and the
 * learning notes (the review log). Prompt: content/<country>/prompts/memory.md.
 * Then those learning notes are folded into Magda's study file (lib/study-file.ts).
 * A lesson with Magda instead updates the study file from the lesson itself.
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
import { cities, tutor } from '@/content';
import { writeStudyFileWithClaude, saveStudyFile, type StudyFileWriter } from './study-file';
import type { CharacterSheet } from './types';
import { scoreConversation, saveConversationScore, judgeWithClaude, type Judge } from './quality';
import { checkLearnerLevel } from './learner-level';

/** "A few exchanges": shorter conversations aren't worth remembering */
export const MIN_LEARNER_LINES = 2;

const MemoryOutputSchema = z.object({
  notes: z.array(z.string()),
  review: z.object({
    items: z.array(z.object({ phrase: z.string(), en: z.string(), why: z.string() })),
    mistakes: z.array(z.object({ said: z.string(), better: z.string(), why: z.string() })),
    missed: z.array(z.object({ phrase: z.string(), en: z.string() })).default([]),
    english: z.array(z.string()).default([]),
  }),
});
export type MemoryOutput = z.infer<typeof MemoryOutputSchema>;

/** Writes notes and review from a transcript. Tests pass a fake. */
export type Summarizer = (input: MemoryPromptInput) => Promise<MemoryOutput>;

export const summarizeWithClaude: Summarizer = async (input) => {
  const prompt = buildMemoryPrompt(input);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // The model thinks before answering and the thinking counts toward this
    // limit: at 2048 a long conversation's notes came back cut off ("Unterminated
    // string in JSON", Josh's Mexico conversation, 2026-10-29, build 8), so the
    // character remembered nothing and the app said "send again". As the
    // quality judge (4000) and the Learn page (8000)
    max_tokens: 8000,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: memoryOutputJsonSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Memory call hit max_tokens (${response.usage.output_tokens} tokens)`);
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
  judge: Judge = judgeWithClaude,
  writeStudyFile: StudyFileWriter = writeStudyFileWithClaude,
  /** Runs the follow-ups (study file, quality score, level check) after the
   *  caller has answered, e.g. Next's after(): the app waited for all four
   *  calls in a row, a minute or more (whole-app scan, 2026-10-29). Without
   *  it they run before returning, as the tests expect */
  later?: (work: () => Promise<void>) => void
): Promise<RememberResult> {
  if (!recordingEnabled()) return 'nothing new';
  let claim: Awaited<ReturnType<typeof claimForMemory>> = null;
  try {
    claim = await claimForMemory(conversationId, learnerId, MIN_LEARNER_LINES);
    if (!claim) return 'nothing new';

    const character = findCharacter(claim.cityId, claim.characterId);
    if (!character) throw new Error(`character ${claim.characterId} not found in ${claim.cityId || 'any city'}`);

    const known = await loadCharacterMemory(learnerId, claim.characterId);

    // A lesson with Magda: her memory is the study file, updated from the lesson.
    // Not scored for the dialogue scorecard (correcting is her job).
    if (claim.characterId === tutor.id) {
      const studyFile = await writeStudyFile({ after: 'lesson', studyFile: known.notes, character, turns: claim.turns });
      await saveConversationMemory({
        conversationId,
        learnerId,
        characterId: tutor.id,
        notes: studyFile,
        review: { items: [], mistakes: [] },
        firstTime: claim.firstTime,
      });
      console.log(JSON.stringify({ level: 'info', event: 'study file', after: 'lesson', conversationId, lines: studyFile.length }));
      return 'saved';
    }

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

    // The follow-ups: each logs its own problem; memory is already saved
    const done = claim;
    const followUps = async () => {
      const claim = done;
      // Fold the learning notes into Magda's study file, so it's ready when the
      // learner walks into the school. A problem here is logged; memory stays saved.
      try {
        const current = await loadCharacterMemory(learnerId, tutor.id);
        const studyFile = await writeStudyFile({ after: 'conversation', studyFile: current.notes, character, learningNotes: out.review });
        await saveStudyFile(learnerId, studyFile);
        console.log(JSON.stringify({ level: 'info', event: 'study file', after: 'conversation', conversationId, lines: studyFile.length }));
      } catch (err) {
        logError('study file', err, conversationId);
      }

      // Score it for the dialogue scorecard (lib/quality.ts). Separate from memory:
      // a scoring problem is logged and memory stays saved.
      try {
        // Beginner dialogue (lib/beginner.ts) speaks English by design; its turns carry a beginner- prompt version
        const score = await scoreConversation(character, claim.turns, judge, { beginner: !!claim.promptVersion?.startsWith('beginner-') });
        await saveConversationScore(conversationId, score);
        console.log(JSON.stringify({ level: 'info', event: 'quality', conversationId, character: claim.characterId, median: score.stats.wordsMedian, unprompted: score.judge.correctionsUnprompted, pronunciation: score.judge.pronunciationCorrections, words: score.judge.words }));
      } catch (err) {
        logError('quality', err, conversationId);
      }

      // The level check (lib/learner-level.ts): only when LEVEL_CHECK is on, for
      // the first few conversations. A problem is logged; memory stays saved.
      try {
        await checkLearnerLevel(conversationId, learnerId);
      } catch (err) {
        logError('level check', err, conversationId);
      }
    };
    if (later) later(followUps);
    else await followUps();
    return 'saved';
  } catch (err) {
    logError('memory', err, conversationId);
    if (claim) await releaseMemoryClaim(conversationId, claim.before, claim.claimed).catch((e) => logError('memory release', e, conversationId));
    return 'failed';
  }
}
