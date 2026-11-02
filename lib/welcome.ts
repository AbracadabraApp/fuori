/**
 * The welcome: the newcomer's first conversation (docs/onboarding-giulia.md,
 * docs/onboarding-chela.md; Josh, 2026-11-02; N6 item 3b). A character from
 * the city files (content/<country>/onboarding.ts → welcome) plays it in the
 * Beginner format from her agreed steps (welcome.md → Brief) when the app
 * opens it as the welcome (/v1/turn welcome: true), on the normal
 * conversation screen, as a normal recorded conversation: so she remembers
 * the player afterwards like anyone they've met. Its last turn sets `done`
 * and the app shows a button in place of the mic; the button calls
 * finishWelcome, which reads the answers from the whole conversation
 * (welcome.md → Read) and places the learner (lib/path.ts → placement).
 *
 * Everyone goes through it once, players who already play included: it's
 * done when learners.onboarding has `welcomed`, which only the last button
 * sets (leave partway and it starts again). Settings → start over clears it
 * (lib/onboarding.ts → resetOnboarding). Its prompt version starts with
 * "onboarding", so it gets no record (lib/conversation-record.ts).
 */
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText, WAITING } from '@/lib/claude';
import { cities, language, onboarding } from '@/content';
import { query } from '@/lib/db';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { finishOnboarding } from '@/lib/onboarding';
import { chooseAddressedAs, learnerAddressOn } from '@/lib/learner-address';
import { isSaidBack } from '@/lib/conversation-record';
import { placement } from '@/lib/path';

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

/** The brief added to beginner.md's system prompt for a welcome turn */
export function welcomeBrief(micOff: boolean): string {
  const f = readPromptFile('welcome.md');
  // The script's "{their name}" is the learner's, for her to fill from what they said
  const brief = fill(f.block('Brief'), { appName: language.appName, language: language.name, script: onboarding.welcome.script });
  return micOff ? `${brief}\n\n${f.block('Mic off')}` : brief;
}

const Read = z.object({
  name: z.string().nullable(),
  address: z.enum(['m', 'f', 'unclear']).transform((a) => (a === 'unclear' ? null : a)),
  firstTime: z.boolean().nullable(),
  speaks: z.boolean().nullable(),
  levelLine: z.number().nullable(),
});
const readJsonSchema = {
  type: 'object', additionalProperties: false, required: ['name', 'address', 'firstTime', 'speaks', 'levelLine'],
  properties: {
    name: { type: ['string', 'null'] },
    address: { type: 'string', enum: ['m', 'f', 'unclear'] },
    firstTime: { type: ['boolean', 'null'] },
    speaks: { type: ['boolean', 'null'] },
    levelLine: { type: ['integer', 'null'] },
  },
};

export type StoredTurn = { who: 'npc' | 'learner'; text: string; parts?: { kind: string; text: string }[] };

/**
 * The last button: read the answers, place the learner, mark the welcome
 * done. Placement: "fairly well" → Intermediate; "not yet" said back → the
 * path's step 1, in their own words → step 3; no answer → step 1 (when in
 * doubt, Beginner: onboarding-chela.md). "Either", unclear or no answer to
 * masculine or feminine → feminine (Josh, 2026-11-02).
 */
export async function finishWelcome(learnerId: string, conversationId: string): Promise<{ level: 'beginner' | 'intermediate'; startStep: number; name: string | null }> {
  const r = await query<{ turns: StoredTurn[]; character_id: string }>('SELECT turns, character_id FROM conversations WHERE id = $1 AND learner_id = $2', [conversationId, learnerId]);
  const row = r.rows[0];
  if (!row) throw new Error('No such conversation for this learner');
  const { read, ownWords, placed } = await readWelcome(row.turns, row.character_id);
  await finishOnboarding(learnerId, placed.level, {
    path: 'welcome',
    welcomed: true,
    conversationId,
    name: read.name,
    firstTime: read.firstTime,
    speaks: read.speaks,
    ownWords,
    startStep: placed.startStep,
    // The path starts again from here, whatever was recorded before (lib/conversation-record.ts → pathState)
    placedAt: new Date().toISOString(),
    promptVersion: welcomeVersion(),
  });
  if (learnerAddressOn()) await chooseAddressedAs(learnerId, read.address ?? 'f', read.name ?? undefined);
  console.log(JSON.stringify({ level: 'info', event: 'welcomed', conversationId, placed: placed.level, startStep: placed.startStep, ownWords, address: read.address ?? 'f' }));
  return { ...placed, name: read.name };
}

/** What they answered, read from the whole conversation, and where that places them (no database: tests/experiments/welcome-trial.mts uses it too) */
export async function readWelcome(turns: StoredTurn[], characterId: string): Promise<{ read: z.infer<typeof Read>; ownWords: boolean; placed: ReturnType<typeof placement> }> {
  const row = { turns };
  const characterName = cities.flatMap((c) => c.characters ?? []).find((c) => c.id === characterId)?.name ?? 'She';
  let k = 0;
  const conversation = row.turns.map((t) => (t.who === 'learner' ? `Learner ${++k}: ${t.text}` : `${characterName}: ${t.text}`)).join('\n');
  const user = fill(readPromptFile('welcome.md').block('Read'), { language: language.name, country: language.card.country, name: characterName, conversation });
  const response = await anthropic.messages.create(
    { model: CLAUDE_MODEL, max_tokens: 3000, messages: [{ role: 'user', content: user }], output_config: { format: { type: 'json_schema', schema: readJsonSchema } } } as Parameters<typeof anthropic.messages.create>[0],
    WAITING
  );
  const read = Read.parse(JSON.parse(replyText(response as Parameters<typeof replyText>[0])));

  // Said back or own words: the line that answered, against the answers shown before it
  let ownWords = false;
  if (read.levelLine) {
    let n = 0;
    let offered: string[] = [];
    for (const t of row.turns) {
      if (t.who === 'npc') { offered = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text); continue; }
      if (++n === read.levelLine) { ownWords = !isSaidBack(t.text, offered); break; }
    }
  }
  return { read, ownWords, placed: placement({ speaks: read.speaks === true, ownWords }) };
}
