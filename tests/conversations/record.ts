/**
 * Every run keeps everything (Josh, 2026-11-08: "always capture measurements
 * ... and preserving transcripts"): each conversation saved whole with what
 * produced it, and one line per conversation added to a running log, so a run
 * can be re-measured later and numbers compared across prompt versions.
 *
 *   tests/conversations/runs/<stamp>-<label>/<n>-<character>-<version>.json
 *   tests/conversations/runs/log.jsonl
 *
 * Real play's numbers are the scorecard's (lib/scorecard.ts, saved with each
 * conversation on the server); nothing from real play is written here.
 */
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLAUDE_MODEL } from '@/lib/claude';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { memoryPromptVersion } from '@/lib/prompts/build-memory-prompt';
import { dialogueVersion } from '@/lib/dialogue/rules';
import { country } from '@/content';
import type { Key, VisitScore, Visits } from './measure';

export const RUNS = join(process.cwd(), 'tests', 'conversations', 'runs');

/** What produced a conversation, saved with it */
export function versions() {
  return { country, model: CLAUDE_MODEL, character: promptVersion(), memory: memoryPromptVersion(), dialogue: dialogueVersion() };
}

export interface Recorded {
  run: string;
  at: string;
  label: string;
  card?: string;
  versions: ReturnType<typeof versions>;
  /** "A", "B", or "A2" for the second copy of A in an A-against-A pair */
  version: string;
  character: { id: string; name: string; role: string; city: string; place?: string };
  learner: { type: string; model: string };
  /** What B changed, as text, when version is B */
  change?: string;
  visits: Visits;
  /** Each visit's counted score, as real play's scorecard keeps it */
  scores: VisitScore[];
  /** The scorecard's counted rows over this conversation's visits */
  values: Record<Key, number | null>;
  /** The test's own culture count (one reader's list), when run */
  culture?: string[];
  /** C12's place vocabulary: each word with where it came from (the here line or her own) and the sentence it was said in */
  vocab?: import('./measure').VocabWord[];
  /** The same judge's second list for the same conversation, to measure the judge's own noise apart from the conversations' */
  vocab2?: import('./measure').VocabWord[];
}

export function startRun(label: string): { id: string; dir: string } {
  const id = `${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const dir = join(RUNS, id);
  mkdirSync(dir, { recursive: true });
  return { id, dir };
}

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\W+/g, '-').toLowerCase();

/** Save one conversation whole, and add its numbers to the running log */
export function record(dir: string, n: number, r: Recorded): string {
  const file = join(dir, `${String(n).padStart(2, '0')}-${slug(r.character.name)}-${r.version}.json`);
  writeFileSync(file, JSON.stringify(r, null, 1));
  logLine({ run: r.run, at: r.at, label: r.label, card: r.card, versions: r.versions, version: r.version, character: r.character.id, learner: r.learner, visits: r.visits.length, values: r.values, culture: r.culture?.length });
  return file;
}

export function logLine(entry: Record<string, unknown>, file = 'log.jsonl') {
  mkdirSync(RUNS, { recursive: true });
  appendFileSync(join(RUNS, file), JSON.stringify(entry) + '\n');
}
