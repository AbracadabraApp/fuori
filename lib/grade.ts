/**
 * One grade, 1–10, for every conversation (Josh, 2026-11-10: "a scorecard that
 * scores every conversation on several variables and one total score, not the
 * average of variables but a total grade"; "all variables are important but
 * not equal"; "the overall grade should allow an overall view of progress").
 *
 * Six variables, each 1–10, come from the conversation's score
 * (lib/quality.ts). The total is a weighted mean of the variables that could
 * be measured (a conversation scored before a variable existed leaves it out
 * and the weights are shared out again), then capped when the conversation
 * has a serious failure, so a good conversation with a bad ending can't
 * average its way to a good grade. Computed from the saved score on read,
 * never stored: changing a weight or cap regrades the whole history, and
 * GRADE_VERSION says which rule a number came from.
 *
 * Weights and caps are Claude's proposal from "what the learner learns"
 * (CLAUDE.md), set to be changed by Josh. No database or Claude calls here.
 */

import type { ConversationScore } from './quality';

export const GRADE_VERSION = '2026-11-10a';

export type VariableKey = 'followable' | 'heard' | 'responsive' | 'content' | 'ending' | 'inRole';

export const VARIABLES: { key: VariableKey; label: string; weight: number; what: string }[] = [
  { key: 'content', label: 'Content', weight: 25, what: 'real facts about the place, the country and the language were said' },
  { key: 'responsive', label: 'Responsive', weight: 20, what: 'answers what the learner said or asked, leaves nothing hanging' },
  { key: 'followable', label: 'Followable', weight: 20, what: 'a beginner could follow the lines; pulls back when lost' },
  { key: 'ending', label: 'Ending', weight: 15, what: 'closes when the talk is done: no cut-off question, no goodbye loop' },
  { key: 'heard', label: 'Heard', weight: 10, what: 'garbled speech understood; no pronunciation comments' },
  { key: 'inRole', label: 'In role', weight: 10, what: 'a distinct local: no repeats, no unasked English, no assumptions about who they are' },
];

/** A failure that caps the total whatever the variables say */
export const CAPS: { key: string; cap: number; label: string; applies: (s: ConversationScore) => boolean }[] = [
  { key: 'goodbyeLoop', cap: 5, label: 'goodbye loop: three or more goodbyes after the first', applies: (s) => (s.judge.extraGoodbyes ?? 0) >= 3 },
  { key: 'cutOff', cap: 6, label: 'closed over a question the learner had just asked', applies: (s) => s.judge.cutOffByGoodbye === true },
  { key: 'incoherent', cap: 5, label: 'three or more replies that don\'t follow', applies: (s) => (s.judge.incoherent ?? 0) >= 3 },
  { key: 'ignoredLost', cap: 6, label: 'the learner was lost and the character did not pull back', applies: (s) => s.lost.length > 0 && s.lost.every((l) => !l.pulledBack) },
];

export interface Grade {
  version: string;
  /** 1–10, one decimal */
  total: number;
  /** Before the caps */
  weighted: number;
  /** Each variable 1–10, or null when this score can't measure it */
  variables: Record<VariableKey, number | null>;
  /** The caps that applied */
  capped: string[];
}

const clamp = (n: number) => Math.max(1, Math.min(10, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

export function variablesOf(s: ConversationScore): Record<VariableKey, number | null> {
  const j = s.judge;

  // Followable: the share of lines a beginner knows (90%+ of the words), and pulling back when lost
  const known = s.level?.beginnerKnows ?? [];
  const knownShare = known.length ? known.filter((k) => k >= 0.9).length / known.length : null;
  const pulled = s.lost.length ? s.lost.filter((l) => l.pulledBack && l.shorter).length / s.lost.length : null;
  const followable = mean([knownShare, pulled].filter((x): x is number => x !== null).map((x) => 1 + 9 * x));

  // Heard: how much of the garbled speech was understood, less 2 for each pronunciation comment
  const understood = j.garbled ? 1 - Math.min(j.garbledMissed, j.garbled) / j.garbled : 1;
  const heard = clamp(1 + 9 * understood - 2 * j.pronunciationCorrections);

  // Responsive: replies that don't follow and learner questions left unanswered
  const responsive = j.incoherent === undefined ? null : clamp(10 - 2.5 * j.incoherent - 2 * (j.unanswered ?? 0));

  // Content: distinct real facts about the place, the country or the language
  const content = j.placeFacts === undefined ? null : clamp([2, 4, 6, 8, 10][Math.min(j.placeFacts, 4)]);

  // Ending: a close over a question costs 3, and each goodbye after the first 1.5
  const ending = j.extraGoodbyes === undefined && j.cutOffByGoodbye === undefined ? null : clamp(10 - (j.cutOffByGoodbye ? 3 : 0) - 1.5 * (j.extraGoodbyes ?? 0));

  // In role: "alive" (1–10), less 1 for each repeat, each stretch of unasked English and 1.5 for each assumption about who they are
  const inRole = j.alive === undefined ? null : clamp(j.alive - (s.repeats?.length ?? 0) - j.englishUnasked - 1.5 * (j.newcomerAssumed ?? 0));

  return { followable: followable === null ? null : clamp(followable), heard, responsive, content, ending, inRole };
}

export function gradeConversation(s: ConversationScore): Grade {
  const variables = variablesOf(s);
  const measured = VARIABLES.filter((v) => variables[v.key] !== null);
  const weight = measured.reduce((n, v) => n + v.weight, 0);
  const weighted = weight ? measured.reduce((n, v) => n + v.weight * (variables[v.key] as number), 0) / weight : 5;
  const capped = CAPS.filter((c) => c.applies(s));
  const total = Math.min(weighted, ...capped.map((c) => c.cap));
  return { version: GRADE_VERSION, total: round1(clamp(total)), weighted: round1(clamp(weighted)), variables: Object.fromEntries(Object.entries(variables).map(([k, v]) => [k, v === null ? null : round1(v)])) as Grade['variables'], capped: capped.map((c) => c.label) };
}

/** One line for the admin text and the replay report */
export function gradeLine(g: Grade): string {
  const vars = VARIABLES.map((v) => `${v.label.toLowerCase()} ${g.variables[v.key] ?? '–'}`).join(' · ');
  return `GRADE: ${g.total}/10 (${vars})${g.capped.length ? ` · capped: ${g.capped.join('; ')}` : ''}`;
}
