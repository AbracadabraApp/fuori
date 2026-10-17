/**
 * Builds the greeter's prompts from content/<country>/prompts/onboarding.md.
 * Server-side only (reads the template from disk).
 */
import { readPromptFile, fill } from './template';
import { language } from '@/content';

/** One answer as heard: the text and the language Whisper detected, if any */
export interface HeardAnswer {
  text: string;
  language?: string;
}

export function onboardingPromptVersion(): string {
  return readPromptFile('onboarding.md').version;
}

function heard(label: string, a: HeardAnswer): string {
  return `${label}: "${a.text}"${a.language ? ` (speech-to-text heard ${a.language})` : ''}`;
}

export function buildOnboardingPrompt(
  step: 'follow-up' | 'send-off',
  answers: HeardAnswer[]
): { system: string; user: string; version: string } {
  const f = readPromptFile('onboarding.md');
  const values = { language: language.name, country: language.card.country, informal: language.formality.informal };
  const system = fill(f.block(step === 'follow-up' ? 'Follow-up' : 'Send-off'), values);
  const user = fill(f.block('User message'), {
    answers: answers.map((a, i) => heard(answers.length > 1 ? `Answer ${i + 1}` : 'Their answer', a)).join('\n'),
  });
  return { system, user, version: f.version };
}
