/**
 * Idioms in play (docs/dialogue-plan.md D13; docs/mix.md → Idioms). The store is content/<country>/idioms.json (120 a
 * language: the saying, its picture in English, its meaning, how common, a level, when it fits). Code picks one and
 * when; the character gets only that one, never a list to copy. At Beginner (Josh, 2026-11-14): the character says it
 * where it fits, its picture in English right after it, then asks what they think it means ("Dando y dando, pajarito
 * volando, giving and giving, little bird flying. ¿Qué cree que quiere decir? What do you think it means?"); the two
 * answers are guesses, one right, and the next turn says what it means. Printed: the question only, as on every
 * Beginner turn. Rarely (Josh: "1 / visit could be a lot"): about one visit in three, on one turn.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { language, pack } from '@/content';
import { fill, readPromptFile } from '@/lib/prompts/template';
import { SCAFFOLDING_FILE } from '@/lib/beginner';
import { query } from '@/lib/db';
import { seedOf } from '@/lib/beginner-2';

export interface Idiom { text: string; picture: string; meaning: string; common?: string; level?: string; fits?: string }

let cached: Idiom[] | undefined;
export function idioms(): Idiom[] {
  if (cached) return cached;
  const path = join(process.cwd(), 'content', pack.id, 'idioms.json');
  const d = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as { idioms?: Idiom[] }) : {};
  cached = (d.idioms ?? []).filter((i) => i.text && i.picture && i.meaning);
  return cached;
}

/** The character turn of the visit an idiom can go on (the 4th: after the opener and a couple of exchanges) */
export const IDIOM_TURN = 3;
/** About one visit in N gets one */
export const IDIOM_EVERY = 3;

/** Whether this visit gets an idiom, on this turn: seeded by the conversation, so a retried turn decides the same */
export function idiomTurn(conversationId: string | null | undefined, npcTurns: number): boolean {
  return !!conversationId && npcTurns === IDIOM_TURN && seedOf(`${conversationId}|idiom`) % IDIOM_EVERY === 0;
}

/** How likely each idiom is at Beginner: the most common and the easiest first; B2 and above not at all */
export function beginnerWeight(i: Idiom): number {
  const common = i.common === 'very common' ? 3 : i.common === 'common' ? 2 : 1;
  const level = /^A/.test(i.level ?? '') ? 2 : i.level === 'B1' ? 1 : 0;
  return common * level;
}

/** The idiom for this visit: by weight, leaving out the ones this learner met lately; null when none is left */
export function pickIdiom(conversationId: string, recent: Set<string>, all: Idiom[] = idioms()): Idiom | null {
  const pool = all.filter((i) => !recent.has(i.text) && beginnerWeight(i) > 0);
  const total = pool.reduce((n, i) => n + beginnerWeight(i), 0);
  if (!total) return null;
  let x = seedOf(`${conversationId}|which-idiom`) % total;
  for (const i of pool) if ((x -= beginnerWeight(i)) < 0) return i;
  return pool[0];
}

/** The idioms this learner met in their last visits (saved on the character's turn as idiom) */
export async function recentIdioms(learnerId: string, visits = 30): Promise<Set<string>> {
  const r = await query<{ turns: { idiom?: string }[] }>('SELECT turns FROM conversations WHERE learner_id = $1 ORDER BY started_at DESC LIMIT $2', [learnerId, visits]);
  return new Set(r.rows.flatMap((row) => (row.turns ?? []).map((t) => t.idiom).filter((x): x is string => !!x)));
}

/** Whether the character's line used the idiom (its first words), so it's saved as met only when said */
export function usedIdiom(line: string, idiom: Idiom): boolean {
  const bare = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const head = bare(idiom.text.replace(/\(.*?\)/g, '')).split(' ').slice(0, 3).join(' ');
  return !!head && bare(line).includes(head);
}

/** The note on the turn after an idiom: whether they got it, and what it means; undefined when it isn't in the store */
export function idiomSaidNote(text: string): string | undefined {
  const i = idioms().find((x) => x.text === text);
  if (!i) return undefined;
  return fill(readPromptFile(SCAFFOLDING_FILE).block('Setup: idiom said'), { language: language.name, idiom: i.text, meaning: i.meaning }).trim();
}
