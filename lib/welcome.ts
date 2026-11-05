/**
 * The welcome: the newcomer's first conversation (docs/onboarding-design.md →
 * The welcome, redone; Josh, 2026-11-05). A character from the city files
 * (content/<country>/onboarding.ts → welcome) plays it in English when the
 * app opens it as the welcome (/v1/turn welcome: true), on the normal
 * conversation screen, as a normal recorded conversation: so she remembers
 * the player afterwards like anyone they've met.
 *
 * Its steps are counted here, not left to her (welcome.md):
 * 1. **Opening:** a little about the country and its places, then masculine
 *    or feminine, explained as part of the language; the learner taps one of
 *    two buttons (`tapAnswers`: no speech-to-text to mishear).
 * 2. **Questions:** "do you have any questions, or are you ready to go?", the
 *    mic open and the done button already showing (`canEnd`).
 * 3. **Answers:** she answers in English and asks again, the button still
 *    there; when they say they're ready she says goodbye and sets `done`.
 * The button calls finishWelcome: the masculine or feminine from the tap, and
 * Beginner S1 for everyone (docs/dialogue-model.md → Everyone starts at Beginner).
 *
 * Everyone goes through it once, players who already play included: it's
 * done when learners.onboarding has `welcomed`, which only the button sets
 * (leave partway and it starts again). Settings → start over clears it
 * (lib/onboarding.ts → resetOnboarding). Its prompt version starts with
 * "onboarding", so it gets no record (lib/conversation-record.ts).
 */
import { cities, language, onboarding } from '@/content';
import { query } from '@/lib/db';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { finishOnboarding } from '@/lib/onboarding';
import { chooseAddressedAs, learnerAddressOn } from '@/lib/learner-address';
import { readHeard } from '@/lib/dialogue/heard';
import type { Part } from '@/lib/beginner';
import type { Turn } from '@/lib/types';

/** Who plays the welcome in this country, where, and the last button's words; null if this country has none */
export function welcomeContent(): { characterId: string; cityId: string; placeId: string; go: { line: string; en: string } } | null {
  const w = onboarding.welcome;
  const city = cities.find((c) => c.places.some((p) => p.characterId === w.characterId));
  const place = city?.places.find((p) => p.characterId === w.characterId);
  return city && place ? { characterId: w.characterId, cityId: city.id, placeId: place.id, go: w.go } : null;
}

export const welcomeVersion = () => `onboarding-welcome-${readPromptFile('welcome.md').version}`;

/** Whether the learner has finished the welcome (the last button) */
export async function welcomed(learnerId: string): Promise<boolean> {
  const r = await query<{ welcomed: boolean }>("SELECT COALESCE((onboarding->>'welcomed')::boolean, false) AS welcomed FROM learners WHERE id = $1", [learnerId]);
  return r.rows[0]?.welcomed ?? false;
}

/** The two buttons (Josh, 2026-11-05: "say masculine or feminine"): interface words, English in every country */
export const ADDRESS_BUTTONS: Record<'m' | 'f', string> = { m: 'Masculine', f: 'Feminine' };

export type WelcomeStep = 'opening' | 'questions' | 'answers';

/** The step, from how many times the learner has answered (the tap is the first) */
export function welcomeStep(learnerLines: number): WelcomeStep {
  return learnerLines === 0 ? 'opening' : learnerLines === 1 ? 'questions' : 'answers';
}

/** The brief added to beginner.md's system prompt for this step of the welcome */
export function welcomeBrief(step: WelcomeStep, micOff: boolean): string {
  const f = readPromptFile('welcome.md');
  const block = { opening: 'Opening', questions: 'Questions', answers: 'Answers' }[step];
  const vars = {
    appName: language.appName,
    language: language.name,
    country: language.card.country,
    // The cities the learner can visit (hidden ones left out)
    cities: cities.filter((c) => !c.hidden).map((c) => c.name).join(', '),
    masculine: ADDRESS_BUTTONS.m,
    feminine: ADDRESS_BUTTONS.f,
  };
  const brief = `${fill(f.block('Brief'), vars)}\n\n${fill(f.block(block), vars)}`;
  return micOff && step !== 'opening' ? `${brief}\n\n${f.block('Mic off')}` : brief;
}

/** The opening's two buttons, as answer parts the app shows to tap */
export const addressAnswers = (): Part[] => (['m', 'f'] as const).map((g) => ({ kind: 'answer', text: ADDRESS_BUTTONS[g], en: '' }));

/** What the app is told about the learner's next turn at this step */
export function welcomeTurnFlags(step: WelcomeStep): { tapAnswers?: true; canEnd?: true } {
  return step === 'opening' ? { tapAnswers: true } : { canEnd: true };
}

/** The masculine or feminine from their first line (the tap); anything else is the feminine (Josh, 2026-11-02) */
export function addressFrom(firstLine: string | undefined): 'm' | 'f' {
  if (!firstLine) return 'f';
  return readHeard(firstLine, [ADDRESS_BUTTONS.m]) === 'said-back' && readHeard(firstLine, [ADDRESS_BUTTONS.f]) !== 'said-back' ? 'm' : 'f';
}

/** The learner's lines so far in this welcome, the one just said included */
export const learnerLines = (transcript: Turn[], learnerSaid?: string): string[] => [
  ...transcript.filter((t) => t.who === 'learner').map((t) => t.transcript),
  ...(learnerSaid ? [learnerSaid] : []),
];

/**
 * The button: the masculine or feminine they tapped, Beginner S1, and the
 * welcome marked done.
 */
export async function finishWelcome(learnerId: string, conversationId: string): Promise<{ level: 'beginner'; startStep: number; name: null }> {
  const r = await query<{ turns: { who: 'npc' | 'learner'; text: string }[] }>('SELECT turns FROM conversations WHERE id = $1 AND learner_id = $2', [conversationId, learnerId]);
  const row = r.rows[0];
  if (!row) throw new Error('No such conversation for this learner');
  const address = addressFrom(row.turns.find((t) => t.who === 'learner')?.text);
  const startStep = 1;
  await finishOnboarding(learnerId, 'beginner', {
    path: 'welcome',
    welcomed: true,
    conversationId,
    startStep,
    // The path starts again from here, whatever was recorded before (lib/conversation-record.ts → pathState)
    placedAt: new Date().toISOString(),
    promptVersion: welcomeVersion(),
  });
  if (learnerAddressOn()) await chooseAddressedAs(learnerId, address);
  console.log(JSON.stringify({ level: 'info', event: 'welcomed', conversationId, placed: 'beginner', startStep, address }));
  return { level: 'beginner', startStep, name: null };
}
