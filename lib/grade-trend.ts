/**
 * The overall view of progress (Josh, 2026-11-10: "the overall grade should
 * allow an overall view of progress"): the one 1–10 grade (lib/grade.ts) of
 * every scored conversation, by week and by prompt version, with the four
 * variables beside the mean. Computed on read from the saved scores, so a
 * changed weight regrades the history. No database or Claude calls here.
 */

import type { ConversationScore } from './quality';
import { gradeConversation, VARIABLES, GRADE_VERSION, type VariableKey } from './grade';

export interface GradedItem { at: Date; promptVersion: string; score: ConversationScore | null }

const mean = (xs: number[]) => (xs.length ? Math.round((10 * xs.reduce((a, b) => a + b, 0)) / xs.length) / 10 : null);

/** The Monday of the week (UTC), as YYYY-MM-DD */
export function weekOf(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
}

function block(title: string, items: GradedItem[]): string {
  const graded = items.filter((i) => i.score).map((i) => gradeConversation(i.score as ConversationScore));
  const vars = VARIABLES.map((v) => {
    const xs = graded.map((g) => g.variables[v.key as VariableKey]).filter((x): x is number => x !== null);
    return `${v.label.toLowerCase()} ${mean(xs) ?? '–'}`;
  }).join(' · ');
  const capped = graded.filter((g) => g.capped.length).length;
  return `${title} · ${graded.length} graded of ${items.length} · mean ${mean(graded.map((g) => g.total)) ?? '–'}/10 · ${vars}${capped ? ` · ${capped} capped` : ''}`;
}

export function gradeTrendAsText(items: GradedItem[]): string {
  if (!items.some((i) => i.score)) return 'No scored conversations yet.';
  const group = (key: (i: GradedItem) => string) => {
    const m = new Map<string, GradedItem[]>();
    for (const i of items) m.set(key(i), [...(m.get(key(i)) ?? []), i]);
    return [...m.entries()];
  };
  const weeks = group((i) => weekOf(i.at)).sort((a, b) => a[0].localeCompare(b[0]));
  const versions = group((i) => i.promptVersion).sort((a, b) => a[0].localeCompare(b[0]));
  return [
    `Grade rule ${GRADE_VERSION}. Scores saved before a variable existed leave it out.`,
    '',
    'By week (Monday):',
    ...weeks.map(([k, v]) => '  ' + block(k, v)),
    '',
    'By prompt version:',
    ...versions.map(([k, v]) => '  ' + block(k, v)),
  ].join('\n');
}
