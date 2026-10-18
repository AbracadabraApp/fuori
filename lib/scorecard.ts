/**
 * The dialogue scorecard (docs/10-testing.md → "Dialogue quality"): conversation
 * scores (lib/quality.ts) added up into a few numbers with targets, and the
 * gate a prompt change must pass before it ships.
 *
 * Used by the admin scorecard (real play, grouped by prompt version) and by the
 * replay test (before and after a change). No database or Claude calls here.
 */

import { median, summarize } from './dialogue-stats';
import type { ConversationScore } from './quality';

type Direction = 'lower' | 'higher';

interface Measure {
  key: string;
  label: string;
  /** Which way is better */
  better: Direction;
  /** Target, inclusive */
  target: number;
  /** How the value is shown */
  format: 'words' | 'percent' | 'perConversation' | 'seconds' | 'rating';
  /** A change this small is noise, not a regression (same units as the value) */
  tolerance: number;
  value: (scores: ConversationScore[]) => number | null;
}

/** Share of a line's words a beginner must know for the line to count as one they can follow (lib/level.ts) */
export const BEGINNER_FOLLOWS = 0.9;

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Average over the scores that have the value (older scores may not) */
const avgOf = (s: ConversationScore[], f: (x: ConversationScore) => number | undefined) =>
  avg(s.map(f).filter((v): v is number => typeof v === 'number'));

export const MEASURES: Measure[] = [
  {
    key: 'replySeconds', label: 'Reply time (median seconds)', better: 'lower', target: 2, format: 'seconds', tolerance: 0.3,
    value: (s) => {
      const ms = s.flatMap((x) => x.replyMs ?? []);
      return ms.length ? median(ms) / 1000 : null;
    },
  },
  {
    key: 'replyWords', label: 'Reply length (median words)', better: 'lower', target: 20, format: 'words', tolerance: 2,
    value: (s) => (s.length ? median(s.map((x) => x.stats.wordsMedian)) : null),
  },
  {
    key: 'openerWords', label: 'Opener length (words)', better: 'lower', target: 25, format: 'words', tolerance: 3,
    value: (s) => (s.length ? median(s.map((x) => x.stats.openerWords)) : null),
  },
  {
    // The "on level" goal (docs/06-roadmap.md → 2): lines where a beginner knows 90%+ of the words
    key: 'beginnerFollows', label: 'Lines a beginner can follow', better: 'higher', target: 0.9, format: 'percent', tolerance: 0.05,
    value: (s) => {
      const known = s.flatMap((x) => x.level?.beginnerKnows ?? []);
      return known.length ? known.filter((k) => k >= BEGINNER_FOLLOWS).length / known.length : null;
    },
  },
  {
    key: 'multiQuestion', label: 'Replies with 2+ questions', better: 'lower', target: 0.1, format: 'percent', tolerance: 0.05,
    value: (s) => (s.length ? summarize(s.map((x) => x.stats)).multiQuestionShare : null),
  },
  {
    key: 'pullsBack', label: 'Pulls back when you\'re lost', better: 'higher', target: 0.8, format: 'percent', tolerance: 0.1,
    value: (s) => {
      const lost = s.flatMap((x) => x.lost);
      return lost.length ? lost.filter((l) => l.pulledBack && l.shorter).length / lost.length : null;
    },
  },
  {
    key: 'pronunciation', label: 'Pronunciation corrections', better: 'lower', target: 0, format: 'perConversation', tolerance: 0.1,
    value: (s) => avg(s.map((x) => x.judge.pronunciationCorrections)),
  },
  {
    key: 'unprompted', label: 'Unprompted corrections', better: 'lower', target: 2, format: 'perConversation', tolerance: 0.5,
    value: (s) => avg(s.map((x) => x.judge.correctionsUnprompted)),
  },
  {
    key: 'garbledUnderstood', label: 'Understands garbled speech', better: 'higher', target: 0.9, format: 'percent', tolerance: 0.1,
    value: (s) => {
      const g = s.reduce((a, x) => a + x.judge.garbled, 0);
      return g ? 1 - s.reduce((a, x) => a + Math.min(x.judge.garbledMissed, x.judge.garbled), 0) / g : null;
    },
  },
  {
    key: 'incoherent', label: 'Replies that don\'t follow', better: 'lower', target: 0, format: 'perConversation', tolerance: 0.3,
    value: (s) => avgOf(s, (x) => x.judge.incoherent),
  },
  {
    key: 'alive', label: 'Feels alive (1–10)', better: 'higher', target: 7, format: 'rating', tolerance: 0.5,
    value: (s) => avgOf(s, (x) => x.judge.alive),
  },
  {
    key: 'englishUnasked', label: 'English nobody asked for', better: 'lower', target: 0, format: 'perConversation', tolerance: 0.1,
    value: (s) => avg(s.map((x) => x.judge.englishUnasked)),
  },
];

export interface ScorecardRow {
  key: string;
  label: string;
  value: number | null;
  target: number;
  better: Direction;
  /** Null when there's nothing to measure (no "lost" lines, no garbled lines) */
  ok: boolean | null;
}

export interface Scorecard {
  conversations: number;
  /** Conversations that broke (a reply that wasn't valid JSON, an API error); any one fails the gate */
  broken?: number;
  rows: ScorecardRow[];
}

const meets = (m: Measure, v: number) => (m.better === 'lower' ? v <= m.target : v >= m.target);

export function scorecard(scores: ConversationScore[], broken = 0): Scorecard {
  return {
    conversations: scores.length,
    broken,
    rows: MEASURES.map((m) => {
      const v = m.value(scores);
      return { key: m.key, label: m.label, value: v, target: m.target, better: m.better, ok: v === null ? null : meets(m, v) };
    }),
  };
}

export function formatValue(key: string, v: number | null): string {
  if (v === null) return '–';
  const m = MEASURES.find((x) => x.key === key)!;
  if (m.format === 'percent') return `${Math.round(v * 100)}%`;
  if (m.format === 'perConversation') return `${Math.round(v * 10) / 10} per conversation`;
  if (m.format === 'seconds') return `${Math.round(v * 10) / 10} s`;
  return String(Math.round(v * 10) / 10);
}

export function formatTarget(key: string): string {
  const m = MEASURES.find((x) => x.key === key)!;
  const sign = m.better === 'lower' ? '≤' : '≥';
  return m.target === 0 && m.better === 'lower' ? '0' : `${sign} ${formatValue(key, m.target).replace(' per conversation', '')}`;
}

export interface GateResult {
  pass: boolean;
  /** The measure the change was meant to move */
  target: string;
  improved: boolean;
  /** Other measures that got worse by more than their tolerance */
  regressions: string[];
  lines: string[];
}

/**
 * The gate a prompt change must pass (docs/10-testing.md): the measure it was
 * meant to move improves beyond its tolerance, no other measure gets worse
 * beyond its tolerance, and no conversation broke (Josh, 2026-10-15: broken
 * replies used to be dropped from the scores, so a change that broke 2 of 7
 * conversations could still look fine). Measures with nothing to measure on
 * either side are skipped.
 */
export function gate(before: Scorecard, after: Scorecard, targetKey: string): GateResult {
  const lines: string[] = [];
  const regressions: string[] = [];
  let improved = false;
  for (const m of MEASURES) {
    const b = before.rows.find((r) => r.key === m.key)?.value ?? null;
    const a = after.rows.find((r) => r.key === m.key)?.value ?? null;
    if (a === null || b === null) {
      lines.push(`${m.label}: ${formatValue(m.key, b)} → ${formatValue(m.key, a)} (not compared)`);
      continue;
    }
    const gain = m.better === 'lower' ? b - a : a - b; // positive = better
    const verdict = gain > m.tolerance ? 'better' : gain < -m.tolerance ? 'WORSE' : 'same';
    if (m.key === targetKey) improved = verdict === 'better';
    else if (verdict === 'WORSE') regressions.push(m.label);
    lines.push(`${m.key === targetKey ? '▶ ' : ''}${m.label}: ${formatValue(m.key, b)} → ${formatValue(m.key, a)} (${verdict})`);
  }
  const broken = after.broken ?? 0;
  lines.push(`Broken conversations: ${before.broken ?? 0} → ${broken}${broken ? ' (FAILS)' : ''}`);
  if (broken) regressions.push(`${broken} broken conversation${broken === 1 ? '' : 's'}`);
  return { pass: improved && regressions.length === 0, target: targetKey, improved, regressions, lines };
}

/** Plain-text scorecard, one block per group (e.g. per prompt version). */
export function scorecardAsText(title: string, card: Scorecard): string {
  const rows = card.rows.map((r) => `  ${r.ok === null ? '·' : r.ok ? '✓' : '✗'} ${r.label}: ${formatValue(r.key, r.value)} (target ${formatTarget(r.key)})`);
  const broken = card.broken ? ` · ${card.broken} broken` : '';
  return [`${title} · ${card.conversations} conversation${card.conversations === 1 ? '' : 's'}${broken}`, ...rows].join('\n');
}
