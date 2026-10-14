/**
 * Magda's system prompt and first turn, from content/<country>/prompts/magda-teaching.md:
 * the school and city she's in, what she remembers about the learner (same
 * {relationship} lines as every character), and their latest Review.
 *
 * Server-side only (reads the template from disk).
 */

import { readPromptFile, fill } from './template';
import { language } from '@/content';
import { loadTemplate, relationshipLine, type RememberedLearner } from './build-turn-prompt';
import type { CharacterSheet } from '../types';
import type { Review } from '../review-schema';

export function tutorPromptVersion(): string {
  return readPromptFile('magda-teaching.md').version;
}

export function buildTutorPrompt(params: {
  character: CharacterSheet;
  memory?: RememberedLearner;
  review: Review | null;
  now?: Date;
}): { system: string; firstTurn: string; version: string } {
  const { character, memory, review, now = new Date() } = params;
  const f = readPromptFile('magda-teaching.md');
  const [school] = (character.appearance?.setting ?? '').split(',');

  const system = fill(f.block('System prompt'), {
    school: school?.trim() || 'the language school',
    language: language.name,
    city: character.city,
    relationship: relationshipLine(loadTemplate(), memory, now),
    review: review ? fill(f.block('Review'), reviewValues(review)) : f.block('No review yet'),
  });
  return { system, firstTurn: f.block('First turn').trim(), version: f.version };
}

/** The Review, summarised into the short lines Magda's prompt shows. */
function reviewValues(r: Review): Record<string, string> {
  const ev = r.levelEvidence;
  const tenses = Object.entries(r.vocabulary?.tenseUsage ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k} ${v!.percentage}%`)
    .join(', ');
  return {
    level: r.level ?? 'unknown',
    levelEvidence: ev ? `${ev.errorRate} errors per 100 words; ${ev.complexityUsed?.join(', ')}; ${ev.confidence} confidence` : '',
    patterns: (r.patterns ?? [])
      .slice(0, 4)
      .map((p) => `${p.description}${p.examples?.[0] ? ` (they said "${p.examples[0].incorrect}", should be "${p.examples[0].correct}")` : ''}`)
      .join('; ') || 'none noticed',
    missingStructures: (r.missingStructures ?? []).map((s) => `${s.structure}: ${s.why}`).join('; ') || 'none noticed',
    vocabulary: [
      tenses && `tenses used: ${tenses}`,
      r.vocabulary?.suggested?.length && `worth learning: ${r.vocabulary.suggested.map((s) => s.word).join(', ')}`,
    ].filter(Boolean).join('; ') || 'not enough yet',
    suggestions: (r.suggestions ?? []).slice(0, 3).map((s) => `${s.focus} (${s.why}; ${s.method})`).join('; ') || 'none yet',
    strengths: (r.strengths ?? []).join('; ') || 'not enough yet',
  };
}
