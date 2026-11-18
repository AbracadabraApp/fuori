/**
 * When an ordinary visit ends, at every level: the wind-down, then the close (Josh, 2026-11-17: the same language and
 * code for Beginner and Intermediate). Counted in the character's lines so far, which is the learner's replies: the
 * wind-down answers their 7th reply at Beginner, their 9th at Intermediate and Advanced, and the close their next one
 * (Josh, 2026-11-13: "lets keep 8 for begginer"; 2026-11-17: "Change Intermediate to 10"). The words are dialogue.md's
 * Wind down and Close (lib/dialogue/rules.ts); the learner's own goodbye ends a visit at any turn, through the reply's
 * done flag. The welcome, lessons and Magda end their own way.
 */
export const ENDING_AT = {
  beginner: { windDown: 7, close: 8 },
  intermediate: { windDown: 9, close: 10 },
} as const;

export type EndingTurn = 'wind-down' | 'close';

/** Which ending turn this is, if any: `replies` is the number of character lines so far */
export function endingTurn(replies: number, beginner: boolean): EndingTurn | null {
  const at = beginner ? ENDING_AT.beginner : ENDING_AT.intermediate;
  if (replies >= at.close) return 'close';
  if (replies === at.windDown) return 'wind-down';
  return null;
}
