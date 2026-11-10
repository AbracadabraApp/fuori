/**
 * One grade, 1–10, for every conversation (Josh, 2026-11-10: "a scorecard that
 * scores every conversation on several variables and one total score, not the
 * average of variables but a total grade"; "all variables are important but
 * not equal"; "the overall grade should allow an overall view of progress").
 *
 * The grade is conversation quality about the character and the conversation,
 * never the learner: "if the system is a 10 a bad learner shouldn't tank the
 * grade". Four variables, each 1–10 and each a rate over the character's
 * replies, not a count, so a long or short visit compares:
 *  - responsive: handled what was said (replies that don't follow, questions
 *    left unanswered, assumptions about who they are, a lost learner left lost)
 *  - content: real facts about the place, the country and the language
 *  - character: comes across as a real local; judged from his lines alone
 *    (a separate call that never sees the learner; scores saved before it
 *    existed use the main judge's "alive")
 *  - ending: closes when the talk is done: no cut-off over a question, no
 *    conversation that won't end
 * The total is a weighted mean of the variables a score can measure, capped
 * when the conversation has a serious failure, so a good conversation with a
 * bad ending can't average its way to a good grade.
 *
 * Instrument readings (heard, followable, the closing counts, lengths, repeats)
 * are reported beside the grade (lib/instruments.ts), never graded and never
 * capping: a reading is judged on its accuracy only.
 *
 * Computed from the saved score on read, never stored: changing a weight or a
 * cap regrades the whole history, and GRADE_VERSION says which rule a number
 * came from. Weights and caps are Claude's proposal from "what the learner
 * learns" (CLAUDE.md), for Josh to change. No database or Claude calls here.
 */

import type { ConversationScore } from './quality';

export const GRADE_VERSION = '2026-11-10b';

export type VariableKey = 'responsive' | 'content' | 'character' | 'ending';

export const VARIABLES: { key: VariableKey; label: string; weight: number; what: string }[] = [
  { key: 'responsive', label: 'Responsive', weight: 30, what: 'handled what was said: nothing that doesn\'t follow, nothing left unanswered, no assumptions, pulled back when they were lost' },
  { key: 'content', label: 'Content', weight: 30, what: 'real facts about the place, the country and the language, per reply' },
  { key: 'character', label: 'Character', weight: 20, what: 'comes across as a real local, judged from his lines alone' },
  { key: 'ending', label: 'Ending', weight: 20, what: 'closes when the talk is done: no cut-off over a question, no conversation that won\'t end' },
];

/** A failure of quality that caps the total whatever the variables say */
export const CAPS: { key: string; cap: number; label: string; applies: (s: ConversationScore) => boolean }[] = [
  { key: 'wontEnd', cap: 5, label: 'a conversation that won\'t end', applies: (s) => s.judge.keepsClosing === true },
  { key: 'cutOff', cap: 6, label: 'closed over a question the learner had just asked', applies: (s) => s.judge.cutOffByGoodbye === true },
  { key: 'incoherent', cap: 5, label: 'three or more replies that don\'t follow', applies: (s) => (s.judge.incoherent ?? 0) >= 3 },
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

export function variablesOf(s: ConversationScore): Record<VariableKey, number | null> {
  const j = s.judge;
  const replies = Math.max(1, s.stats.replies);

  // Responsive: each reply that doesn't follow, question left unanswered or assumption about who they are costs
  // 40 points of rate (one in 18 replies is about 2.2 points); a lost learner who got no easier reply costs up to 3
  const lostShare = s.lost.length ? s.lost.filter((l) => l.pulledBack && l.shorter).length / s.lost.length : 1;
  const responsive = j.incoherent === undefined ? null : clamp(10 - (40 * (j.incoherent + (j.unanswered ?? 0) + 0.6 * (j.newcomerAssumed ?? 0))) / replies - 3 * (1 - lostShare));

  // Content: facts per reply; one every two replies is 10
  const content = j.placeFacts === undefined ? null : clamp(1 + (18 * j.placeFacts) / replies);

  // Character: the one-sided call; an older score's "alive". Each repeat from an earlier visit costs 1, up to 3
  const base = s.character?.character ?? j.alive;
  const character = base === undefined ? null : clamp(base - Math.min(3, s.repeats?.length ?? 0));

  // Ending: a close over a question costs 3, a conversation that won't end 5
  const ending = j.cutOffByGoodbye === undefined && j.keepsClosing === undefined ? null : clamp(10 - (j.cutOffByGoodbye ? 3 : 0) - (j.keepsClosing ? 5 : 0));

  return { responsive, content, character, ending };
}

export function gradeConversation(s: ConversationScore): Grade {
  const variables = variablesOf(s);
  const measured = VARIABLES.filter((v) => variables[v.key] !== null);
  const weight = measured.reduce((n, v) => n + v.weight, 0);
  const weighted = weight ? measured.reduce((n, v) => n + v.weight * (variables[v.key] as number), 0) / weight : 5;
  const capped = CAPS.filter((c) => c.applies(s));
  const total = Math.min(weighted, ...capped.map((c) => c.cap));
  return {
    version: GRADE_VERSION,
    total: round1(clamp(total)),
    weighted: round1(clamp(weighted)),
    variables: Object.fromEntries(Object.entries(variables).map(([k, v]) => [k, v === null ? null : round1(v)])) as Grade['variables'],
    capped: capped.map((c) => c.label),
  };
}

/** One line for the admin text and the replay report */
export function gradeLine(g: Grade): string {
  const vars = VARIABLES.map((v) => `${v.label.toLowerCase()} ${g.variables[v.key] ?? '–'}`).join(' · ');
  return `GRADE: ${g.total}/10 (${vars})${g.capped.length ? ` · capped: ${g.capped.join('; ')}` : ''}`;
}
