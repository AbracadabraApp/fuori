/**
 * The record of each conversation (Josh, 2026-11-02: yes to the table; N6
 * item 2): numbers only, no words or audio. Written once when a conversation
 * ends (lib/remember.ts, after the answer), for every learner and every
 * character but Magda:
 *
 * - words spoken, in the language, in their own words (Josh: words spoken is
 *   the main engagement signal; the shares show progress over weeks)
 * - turns in their own words, said back (one of the answers the game
 *   offered), in English, help asks about one word, help asks for the whole
 *   line
 * - for a learner on the path (lib/path.ts): the step and stage it played,
 *   how it felt (easy, hard, neither) and why, and the path's state after it
 *
 * Which language each line was in and what kind of help it asked for comes
 * from one call (content/<country>/prompts/record.md); said back is compared
 * with the answers shown, in code, in any language. Silence isn't known to
 * the server (the mic closes on the phone), so it's not counted.
 *
 * Shared by every country's server (one database). The table is created the
 * first time it's written. Read at /api/admin/conversations?format=records.
 */
import { z } from 'zod';
import { anthropic, TURN_MODEL, replyText, WAITING } from '@/lib/claude';
import { cities, country, language, tutor } from '@/content';
import { query } from '@/lib/db';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { setLevel, type Level } from '@/lib/onboarding';
import { decide, INTERMEDIATE_STEP, RULES, startAt, type Felt, type PathState } from '@/lib/path';

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(`CREATE TABLE IF NOT EXISTS conversation_records (
    conversation_id uuid PRIMARY KEY,
    learner_id      uuid NOT NULL,
    country         text NOT NULL,
    at              timestamptz NOT NULL DEFAULT now(),
    character_id    text NOT NULL,
    prompt_version  text,
    learner_turns   int NOT NULL,
    words           int NOT NULL,
    words_language  int NOT NULL,
    words_own       int NOT NULL,
    own_turns       int NOT NULL,
    said_back       int NOT NULL,
    english         int NOT NULL,
    help_word       int NOT NULL,
    help_whole      int NOT NULL,
    step            int,
    stage           text,
    felt            text,
    felt_why        text,
    moved           boolean,
    state           jsonb
  )`);
  await query('CREATE INDEX IF NOT EXISTS idx_conversation_records_learner ON conversation_records(learner_id, at DESC)');
  tableReady = true;
}

// ---------- Said back: compared with what the app showed, any language, no phrase list ----------

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}\s…]/gu, ' ').replace(/\s+/g, ' ').trim();

function wordDistance(a: string[], b: string[]): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/**
 * Did they say back one of the offered answers? Word overlap with what the app
 * showed. An answer with a blank (…) matches on the words around the blank,
 * whatever they filled in.
 */
export function isSaidBack(said: string, offered: string[]): boolean {
  const heard = norm(said).split(' ').filter(Boolean);
  if (!heard.length) return false;
  return offered.some((answer) => {
    const parts = norm(answer).split('…').map((p) => p.trim().split(' ').filter(Boolean));
    const fixed = parts.flat();
    if (!fixed.length) return false;
    if (parts.length > 1) {
      let at = 0;
      for (const w of fixed) {
        const i = heard.indexOf(w, at);
        if (i < 0) return false;
        at = i + 1;
      }
      return heard.length - fixed.length <= 4;
    }
    return wordDistance(heard, fixed) / Math.max(heard.length, fixed.length) <= 0.25;
  });
}

// ---------- The record ----------

export interface LabelledLine {
  said: string;
  lang: 'language' | 'english' | 'mixed';
  help: 'word' | 'whole' | 'none';
  /** The answers shown before it (the character's last reply) */
  offered: string[];
}

export interface Counts {
  learnerTurns: number;
  words: number;
  wordsLanguage: number;
  wordsOwn: number;
  ownTurns: number;
  saidBack: number;
  english: number;
  helpWord: number;
  helpWhole: number;
}

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

export function countsOf(lines: LabelledLine[]): Counts {
  const c: Counts = { learnerTurns: lines.length, words: 0, wordsLanguage: 0, wordsOwn: 0, ownTurns: 0, saidBack: 0, english: 0, helpWord: 0, helpWhole: 0 };
  for (const l of lines) {
    const n = wordCount(l.said);
    c.words += n;
    if (l.lang !== 'english') c.wordsLanguage += l.lang === 'mixed' ? Math.round(n / 2) : n;
    if (l.help === 'word') c.helpWord++;
    else if (l.help === 'whole') c.helpWhole++;
    else if (l.lang === 'english') c.english++;
    else if (isSaidBack(l.said, l.offered)) c.saidBack++;
    else { c.ownTurns++; c.wordsOwn += n; }
  }
  return c;
}

/**
 * Easy, hard or neither, and which signal decided it. Hard means lost:
 * English instead of an answer, or asking for the whole line again; a help ask
 * about one word is learning, not struggle.
 */
export function feltOf(c: Counts): { felt: Felt; why: string; counted: boolean } {
  const n = c.learnerTurns || 1;
  const lost = c.english + c.helpWhole;
  const counted = c.ownTurns >= RULES.countedOwnTurns;
  const lostWhy = `lost ${lost}/${n} (English ${c.english}, whole-line help ${c.helpWhole})`;
  if (lost / n >= RULES.hard.minLostShare) return { felt: 'hard', why: lostWhy, counted };
  const e = RULES.easy;
  const misses = [
    !counted && `own ${c.ownTurns} < ${RULES.countedOwnTurns} (not counted)`,
    lost > e.maxLost && lostWhy,
    c.helpWord > e.maxWordHelps && `word help ${c.helpWord} > ${e.maxWordHelps}`,
    c.ownTurns / n < e.minOwnShare && `own ${c.ownTurns}/${n} < ${Math.round(e.minOwnShare * 100)}%`,
  ].filter(Boolean);
  if (!misses.length) return { felt: 'easy', why: `own ${c.ownTurns}/${n}, lost ${lost}, word help ${c.helpWord}`, counted };
  return { felt: 'neither', why: misses.join('; '), counted };
}

// ---------- The labelling call ----------

const Labels = z.object({ lines: z.array(z.object({ n: z.number(), lang: z.enum(['language', 'english', 'mixed']), help: z.enum(['word', 'whole', 'none']) })) });
const labelsJsonSchema = {
  type: 'object', additionalProperties: false, required: ['lines'],
  properties: { lines: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['n', 'lang', 'help'], properties: { n: { type: 'integer' }, lang: { type: 'string', enum: ['language', 'english', 'mixed'] }, help: { type: 'string', enum: ['word', 'whole', 'none'] } } } } },
};

type StoredTurn = { who: 'npc' | 'learner'; text: string; parts?: { kind: string; text: string }[] };

/** The learner's lines with the answers shown before each, labelled by one call */
export async function labelLines(turns: StoredTurn[], name: string): Promise<LabelledLine[]> {
  let k = 0;
  const conversation = turns.map((t) => (t.who === 'learner' ? `Learner ${++k}: ${t.text}` : `${name}: ${t.text}`)).join('\n');
  const user = fill(readPromptFile('record.md').block('Labels'), { language: language.name, conversation });
  const response = await anthropic.messages.create(
    {
      model: TURN_MODEL,
      max_tokens: 2000,
      thinking: { type: 'between_tools' },
      messages: [{ role: 'user', content: user }],
      output_config: { format: { type: 'json_schema', schema: labelsJsonSchema } },
    } as Parameters<typeof anthropic.messages.create>[0],
    WAITING
  );
  const labels = Labels.parse(JSON.parse(replyText(response as Parameters<typeof replyText>[0]))).lines;
  const out: LabelledLine[] = [];
  let offered: string[] = [];
  let n = 0;
  for (const t of turns) {
    if (t.who === 'npc') { offered = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text); continue; }
    n++;
    const l = labels.find((x) => x.n === n);
    out.push({ said: t.text, lang: l?.lang ?? 'language', help: l?.help ?? 'none', offered });
  }
  return out;
}

// ---------- The path's state ----------

/** The stage tag in a prompt version ("beginner-2026-10-29+S2+back"), lib/path.ts → stageTag */
export function stageInVersion(version: string | null): { stage: string; supportBack: boolean } | null {
  const m = /\+(S\d)(\+back)?/.exec(version ?? '');
  return m ? { stage: m[1], supportBack: !!m[2] } : null;
}

/**
 * Where a learner is on the path: the state after their last recorded
 * conversation on it, or the first step. A learner who chose Beginner again
 * after reaching Intermediate starts at the first step.
 */
export async function pathState(learnerId: string): Promise<PathState> {
  await ensureTable();
  const r = await query<{ state: PathState }>(
    'SELECT state FROM conversation_records WHERE learner_id = $1 AND state IS NOT NULL ORDER BY at DESC LIMIT 1',
    [learnerId]
  );
  const s = r.rows[0]?.state;
  if (s) return s.step < INTERMEDIATE_STEP ? s : startAt(1);
  // Nothing recorded on the path yet: where onboarding placed them (lib/path.ts → placement)
  const placed = await query<{ step: number | null }>("SELECT (onboarding->>'startStep')::int AS step FROM learners WHERE id = $1", [learnerId]);
  const step = placed.rows[0]?.step;
  return startAt(step && step >= 1 && step < INTERMEDIATE_STEP ? step : 1);
}

/** An Intermediate learner's run of hard conversations, from their last record */
async function intermediateState(learnerId: string): Promise<PathState> {
  const r = await query<{ state: PathState }>(
    'SELECT state FROM conversation_records WHERE learner_id = $1 AND state IS NOT NULL ORDER BY at DESC LIMIT 1',
    [learnerId]
  );
  const s = r.rows[0]?.state;
  return s && s.step === INTERMEDIATE_STEP ? s : startAt(INTERMEDIATE_STEP);
}

/**
 * Write the record of an ended conversation, once (a conversation ended
 * again keeps its first record, so the path moves once per conversation).
 * Magda's lessons and the onboarding conversation have none; one left
 * without a word has a record of zeros.
 */
export async function recordConversation(conversationId: string, learnerId: string): Promise<'saved' | 'none'> {
  await ensureTable();
  const r = await query<{ character_id: string; prompt_version: string | null; turns: StoredTurn[]; level: Level | null; has: boolean }>(
    `SELECT c.character_id, c.prompt_version, c.turns, l.level,
       EXISTS (SELECT 1 FROM conversation_records r WHERE r.conversation_id = c.id) AS has
     FROM conversations c JOIN learners l ON l.id = c.learner_id WHERE c.id = $1 AND c.learner_id = $2`,
    [conversationId, learnerId]
  );
  const row = r.rows[0];
  // Magda's lessons and the onboarding conversation aren't play: no record
  if (!row || row.has || row.character_id === tutor?.id || row.prompt_version?.startsWith('onboarding')) return 'none';

  const name = cities.flatMap((c) => c.characters ?? []).find((c) => c.id === row.character_id)?.name ?? 'Them';
  // Left without a word: a record of zeros, no call (for an Intermediate learner it counts as hard)
  const silent = !row.turns.some((t) => t.who === 'learner');
  const counts = silent ? countsOf([]) : countsOf(await labelLines(row.turns, name));

  // On the path: a Beginner, or no level yet, whose conversation played a stage
  const played = stageInVersion(row.prompt_version);
  const onPath = played && (row.level === 'beginner' || row.level === null);
  let path: { step: number; felt: Felt; why: string; moved: boolean; state: PathState } | null = null;
  if (onPath && !silent) {
    const before = await pathState(learnerId);
    const { felt, why, counted } = feltOf(counts);
    const { next, moved } = decide(before, felt, counted);
    path = { step: before.step, felt, why, moved, state: next };
  } else if (row.level === 'intermediate' && !played) {
    // Intermediate: back to the path's last step after RULES.backFromIntermediate hard conversations in a row
    const before = await intermediateState(learnerId);
    const { felt, why } = silent ? { felt: 'hard' as const, why: 'left without a word' } : feltOf(counts);
    const hardRun = felt === 'hard' ? before.hardRun + 1 : 0;
    const back = hardRun >= RULES.backFromIntermediate;
    path = { step: INTERMEDIATE_STEP, felt, why, moved: back, state: back ? startAt(INTERMEDIATE_STEP - 1) : { ...before, hardRun } };
  }

  const inserted = await query(
    `INSERT INTO conversation_records (conversation_id, learner_id, country, character_id, prompt_version, learner_turns, words, words_language, words_own, own_turns, said_back, english, help_word, help_whole, step, stage, felt, felt_why, moved, state)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
     ON CONFLICT (conversation_id) DO NOTHING`,
    [conversationId, learnerId, country, row.character_id, row.prompt_version, counts.learnerTurns, counts.words, counts.wordsLanguage, counts.wordsOwn, counts.ownTurns, counts.saidBack, counts.english, counts.helpWord, counts.helpWhole,
      path?.step ?? null, played ? `${played.stage}${played.supportBack ? '+back' : ''}` : null, path?.felt ?? null, path?.why ?? null, path?.moved ?? null, path ? JSON.stringify(path.state) : null]
  );
  // Past the last step: Intermediate, the character prompt as it is; back from it: Beginner, on the path's last step
  if (inserted.rowCount && path?.moved && path.state.step === INTERMEDIATE_STEP) await setLevel(learnerId, 'intermediate');
  if (inserted.rowCount && path?.moved && path.step === INTERMEDIATE_STEP) await setLevel(learnerId, 'beginner');
  console.log(JSON.stringify({ level: 'info', event: 'record', conversationId, words: counts.words, wordsLanguage: counts.wordsLanguage, wordsOwn: counts.wordsOwn, ...(path ? { step: path.step, felt: path.felt, why: path.why, moved: path.moved, stepAfter: path.state.step } : {}) }));
  return 'saved';
}

// ---------- For Josh: words spoken per player per week ----------

/**
 * One line per learner, country and week, newest first: conversations, words
 * spoken per conversation, the share in the language and in their own words,
 * and for the path the steps reached and how the conversations felt (Josh,
 * 2026-11-02: words spoken is the main signal; this shows whether the model
 * is working without asking). /api/admin/conversations?format=records
 */
export async function recordsByWeek(weeks = 8): Promise<string> {
  await ensureTable();
  const rows = (
    await query<{ learner_id: string; country: string; week: Date; n: number; words: number; lang: number; own: number; steps: number[] | null; easy: number; hard: number; moved: number }>(
      `SELECT learner_id, country, date_trunc('week', at) AS week, count(*)::int AS n,
         sum(words)::int AS words, sum(words_language)::int AS lang, sum(words_own)::int AS own,
         array_remove(array_agg(DISTINCT step), NULL) AS steps,
         count(*) FILTER (WHERE felt = 'easy')::int AS easy, count(*) FILTER (WHERE felt = 'hard')::int AS hard,
         count(*) FILTER (WHERE moved)::int AS moved
       FROM conversation_records r
       -- Only learners who still exist: the live tests' learners are deleted when they finish
       WHERE at > now() - make_interval(weeks => $1) AND EXISTS (SELECT 1 FROM learners l WHERE l.id = r.learner_id)
       GROUP BY learner_id, country, week ORDER BY week DESC, words DESC`,
      [weeks]
    )
  ).rows;
  const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : '–');
  return rows
    .map((r) => {
      const path = r.steps?.length ? ` · step ${r.steps.sort().join(', ')}, easy ${r.easy}, hard ${r.hard}${r.moved ? `, moved up ${r.moved}` : ''}` : '';
      return `${new Date(r.week).toISOString().slice(0, 10)} · ${r.country} · ${r.learner_id.slice(0, 8)} · ${r.n} conversations · ${Math.round(r.words / r.n)} words each · ${pct(r.lang, r.words)} in the language · ${pct(r.own, r.words)} own${path}`;
    })
    .join('\n');
}
