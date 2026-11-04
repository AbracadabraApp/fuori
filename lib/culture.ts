/**
 * Cultural lessons (docs/culture.md → Cultural lessons; Josh, 2026-11-03):
 * one particular thing about a city, told by the shown person whose pride it
 * is, mostly listening, with a personal question at the end of the teller's
 * first turns. Items are made ahead (scripts/make-culture.mts →
 * content/<country>/culture.json, fact-judged); the Learn page shows the
 * country's set as chips outside the lesson sets. Played on the conversation
 * screen as a lesson with one part, "story" (lib/lesson.ts): Beginners in the
 * Beginner format (the story in the English parts, the words as word parts),
 * everyone else in the language with the character prompt. Nothing about
 * culture reaches ordinary visits: in the test of ordinary visits a pride line
 * was mostly ignored and took a little from the errand (docs/culture.md →
 * Tests; Josh: "the errand leads").
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cities, language, pack } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';

export interface CultureItem {
  id: string;
  cityId: string;
  placeId: string;
  /** The teller: a shown person in that city */
  teller: string;
  /** At most four English words, naming only this thing */
  chip: string;
  topic: 'food' | 'history' | 'traditions' | 'art' | 'rivalry';
  /** The checked facts the teller keeps to, in English */
  facts: string;
  /** One or two words worth keeping, in the language */
  words: { said: string; en: string }[];
}

/** Learner turns in a cultural lesson: the teller's third turn is the last */
export const STORY_TURNS = 2;

let cached: { set: string[]; items: CultureItem[] } | null = null;

function file() {
  if (cached) return cached;
  const path = join(process.cwd(), 'content', pack.id, 'culture.json');
  cached = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as { set: string[]; items: CultureItem[] }) : { set: [], items: [] };
  return cached;
}

export const cultureItem = (id: string): CultureItem | undefined => file().items.find((it) => it.id === id);

/** The set the Learn page shows, in order: only items whose teller is still shown in their place */
export function cultureSet(): CultureItem[] {
  return file().set.flatMap((id) => {
    const it = cultureItem(id);
    const place = it && cities.find((c) => c.id === it.cityId && !c.hidden)?.places.find((p) => p.id === it.placeId && !p.hidden);
    return it && place?.characterId === it.teller ? [it] : [];
  });
}

/** One turn's brief: n is the learner's turns so far */
export function storyBrief(item: CultureItem, n: number, beginner: boolean): { brief: string; last: boolean } {
  const f = readPromptFile('culture.md');
  const last = n >= STORY_TURNS;
  const words = item.words.map((w) => `${w.said} (${w.en})`).join(', ');
  const brief = fill(f.block('Story'), {
    chip: item.chip,
    facts: item.facts,
    turn: String(Math.min(n + 1, STORY_TURNS + 1)),
    of: String(STORY_TURNS + 1),
    last: last ? f.block('Story: last turn') : '',
    level: fill(f.block(beginner ? 'Story: Beginner' : 'Story: speaking'), { words, language: language.name }),
  });
  return { brief, last };
}

export const cultureVersion = () => readPromptFile('culture.md').version;
