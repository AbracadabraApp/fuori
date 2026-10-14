/**
 * Study export, version 1: one learner's conversations as a single Markdown
 * file to drop into Gemini Notebook, which makes flashcards, quizzes and Audio
 * Overviews from it. Transcripts only; the learning notes are version 2, only
 * if this falls short. Plan: docs/study-export-demo.md.
 *
 * Lessons with Magda are left out (practice, not conversations in town), and
 * so are conversations in another country's cities (one database, two sites).
 *
 * Server-side only.
 */

import { query } from './db';
import { cities, language, tutor } from '@/content';
import { characterForPlace } from './characters/for-place';
import type { RecordedConversation } from './recording';

/** A conversation with the names a reader needs, resolved from content. */
export interface StudyConversation {
  who: string;
  role: string;
  place: string;
  neighbourhood: string;
  city: string;
  startedAt: Date;
  turns: RecordedConversation['turns'];
}

export interface StudyExport {
  learnerId: string;
  from: Date;
  to: Date;
  /** The CEFR level on the Level line of Magda's study file, when she has judged one */
  level?: string;
  conversations: StudyConversation[];
}

/** The learner's conversations in this country's cities, oldest first. */
export async function loadStudyExport(learnerId: string, from: Date, to: Date): Promise<StudyExport> {
  const rows = (
    await query<Pick<RecordedConversation, 'character_id' | 'place_id' | 'city_id' | 'started_at' | 'turns'>>(
      `SELECT character_id, place_id, city_id, started_at, turns FROM conversations
       WHERE learner_id = $1 AND started_at >= $2 AND started_at < $3 AND character_id <> $4
       ORDER BY started_at`,
      [learnerId, from, to, tutor.id]
    )
  ).rows;
  const memory = (
    await query<{ notes: string[] }>('SELECT notes FROM character_memories WHERE learner_id = $1 AND character_id = $2', [learnerId, tutor.id])
  ).rows[0];
  // The Level line is a level with evidence, or "unsure"; keep only a CEFR level
  const level = memory?.notes.find((n) => /^level\b/i.test(n))?.match(/\b[ABC][12]\+?/)?.[0];

  const conversations: StudyConversation[] = [];
  for (const r of rows) {
    const city = cities.find((c) => c.id === r.city_id);
    if (!city || !r.turns.some((t) => t.who === 'learner')) continue;
    const place = city.places.find((p) => p.id === r.place_id);
    const character = place && characterForPlace(city, place);
    conversations.push({
      who: character?.name ?? r.character_id,
      role: character?.role ?? '',
      place: place?.name ?? r.place_id,
      neighbourhood: place?.neighbourhood ?? '',
      city: city.name,
      startedAt: new Date(r.started_at),
      turns: r.turns,
    });
  }
  return { learnerId, from, to, level, conversations };
}

/** Learners with conversations, most active first, to find whose export to make. */
export async function learnersWithConversations(): Promise<string> {
  const rows = (
    await query<{ learner_id: string; n: number; first: Date; last: Date; cities: string[] }>(
      `SELECT learner_id, count(*)::int AS n, min(started_at) AS first, max(started_at) AS last, array_agg(DISTINCT city_id) AS cities
       FROM conversations GROUP BY learner_id ORDER BY n DESC LIMIT 50`
    )
  ).rows;
  return rows.map((r) => `${r.learner_id} · ${r.n} conversations · ${day(new Date(r.first))} to ${day(new Date(r.last))} · ${r.cities.join(', ')}`).join('\n');
}

const day = (d: Date) => d.toISOString().slice(0, 10);

/** The Markdown file. Pure, so the test can check it without a database. */
export function studyExportMarkdown(e: StudyExport): string {
  const cityNames = [...new Set(e.conversations.map((c) => c.city))];
  const level = e.level ? ` at about ${e.level}` : '';
  const out = [
    `# ${language.appName}: conversations in ${language.name}, ${day(e.from)} to ${day(e.to)}`,
    '',
    `These are a learner's real conversations in ${language.name}${level}, with the people they met while living in ${cityNames.join(', ') || 'the country'}. ` +
      'Make study material from the words, phrases and corrections in them, using the people and places as context. ' +
      "The learner's lines are speech-to-text and may contain transcription errors; ignore spelling.",
    '',
    `- Dates: ${day(e.from)} to ${day(e.to)}`,
    `- Cities: ${cityNames.join(', ') || 'none'}`,
    `- Conversations: ${e.conversations.length}`,
  ];
  for (const c of e.conversations) {
    const where = [c.place, c.neighbourhood, c.city].filter(Boolean).join(', ');
    out.push('', `## ${c.who}${c.role ? `, ${c.role}` : ''}`, '', `${where} · ${day(c.startedAt)}`, '');
    for (const t of c.turns) {
      const speaker = t.who === 'npc' ? c.who : 'Learner';
      out.push(`**${speaker}:** ${t.text}${t.en ? `  \n*${t.en}*` : ''}`, '');
    }
  }
  return out.join('\n').trimEnd() + '\n';
}
