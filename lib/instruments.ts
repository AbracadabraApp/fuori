/**
 * The instrument readings beside a conversation's grade (Josh, 2026-11-10:
 * "instrument readings should just be accurate", "heard is just a report").
 * They are counts and measurements, reported as they are: never scored 1–10,
 * never added into the grade, never a cap. What matters for each is whether it
 * is accurate. Read from the saved score (lib/quality.ts); no database or
 * Claude calls here.
 */

import type { ConversationScore } from './quality';
import { median } from './dialogue-stats';

export interface Instruments {
  learnerLines: number;
  characterReplies: number;
  minutes: number | null;
  /** Counted from the setups the code played, not judged */
  closing: { goodbyeAtLearnerTurn: number | null; goodbyeReplies: number } | null;
  /** The judge's counts; unverified until checked against a hand count */
  heard: { garbled: number; missed: number; pronunciationComments: number };
  /** Share of lines a beginner knows (sampled, null without a level score) and the lost lines pulled back on */
  followable: { beginnerKnows: number | null; lost: number; pulledBack: number };
  replyWordsMedian: number;
  replySecondsMedian: number | null;
  repeatsFromEarlierVisits: number;
  englishUnasked: number;
  learnerShareOfWords: number | null;
}

export function instrumentsOf(s: ConversationScore): Instruments {
  const known = s.level?.beginnerKnows ?? [];
  return {
    learnerLines: s.learnerLines,
    characterReplies: s.stats.replies,
    minutes: s.closing?.minutes ?? null,
    closing: s.closing ? { goodbyeAtLearnerTurn: s.closing.goodbyeAtLearnerTurn, goodbyeReplies: s.closing.goodbyeReplies } : null,
    heard: { garbled: s.judge.garbled, missed: Math.min(s.judge.garbledMissed, s.judge.garbled), pronunciationComments: s.judge.pronunciationCorrections },
    followable: { beginnerKnows: known.length ? known.filter((k) => k >= 0.9).length / known.length : null, lost: s.lost.length, pulledBack: s.lost.filter((l) => l.pulledBack && l.shorter).length },
    replyWordsMedian: s.stats.wordsMedian,
    // A reply time of 0 means the turn carried none (older real play), not an instant reply
    replySecondsMedian: s.replyMs?.length && median(s.replyMs) > 0 ? Math.round(median(s.replyMs) / 100) / 10 : null,
    repeatsFromEarlierVisits: s.repeats?.length ?? 0,
    englishUnasked: s.judge.englishUnasked,
    learnerShareOfWords: s.learner ? s.learner.share : null,
  };
}

/** One line for the admin text, next to the GRADE line */
export function instrumentLine(i: Instruments): string {
  const parts = [
    `${i.learnerLines} learner lines`,
    i.minutes === null ? null : `${i.minutes} min`,
    i.closing ? (i.closing.goodbyeAtLearnerTurn === null ? 'goodbye setup never played' : `goodbye from learner turn ${i.closing.goodbyeAtLearnerTurn}, ${i.closing.goodbyeReplies} goodbye repl${i.closing.goodbyeReplies === 1 ? 'y' : 'ies'}`) : null,
    `heard: ${i.heard.garbled} garbled, ${i.heard.missed} missed, ${i.heard.pronunciationComments} pronunciation`,
    `followable: ${i.followable.beginnerKnows === null ? '–' : Math.round(i.followable.beginnerKnows * 100) + '%'} lines known, ${i.followable.pulledBack}/${i.followable.lost} lost lines pulled back`,
    `reply ${i.replyWordsMedian} words${i.replySecondsMedian === null ? '' : `, ${i.replySecondsMedian} s`}`,
    `${i.repeatsFromEarlierVisits} repeats`,
    `${i.englishUnasked} unasked English`,
  ].filter(Boolean);
  return `READINGS: ${parts.join(' · ')}`;
}
