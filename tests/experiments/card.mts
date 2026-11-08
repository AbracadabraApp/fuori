// The card's lock (Josh, 2026-11-08: Claude "makes incremental ad hoc changes"). A card's design lines are hashed
// when the test designer's review is recorded; startTest refuses a card whose design lines changed since, and the
// check (npm run test:cards) fails a card whose lines changed after its run. The hash covers what the test is
// (question, variable, measure, hypothesis, size), not what came out of it (Run, Decision) or who approved it.
import { createHash } from 'node:crypto';

export const DESIGN_KEYS = ['Serves', 'Type', 'Unit', 'Variable', 'Held constant', 'Place', 'Moments', 'Measure', 'Fact or judgment', 'Hypothesis', 'Other outcomes', 'Size', 'Time', 'Guards'];

/** The card's section of the log, from its heading text up to the next heading */
export function cardSection(log: string, title: string): string | undefined {
  return log.split('\n### ').find((s) => s.startsWith(title));
}

/** The design lines, in a fixed order, whitespace collapsed and "Josh: yes" left out (his yes comes after the review) */
export function designText(section: string): string {
  return DESIGN_KEYS.map((k) => {
    const m = section.match(new RegExp(`^- ${k}: (.*)$`, 'm'));
    return m ? `${k}: ${m[1].replace(/[;,]?\s*Josh: yes[^;.]*[;.]?/gi, '').replace(/\s+/g, ' ').trim()}` : null;
  }).filter(Boolean).join('\n');
}

export function cardHash(section: string): string {
  return createHash('sha1').update(designText(section)).digest('hex').slice(0, 8);
}

/** The hash recorded on the Reviewed line ("… · card 1a2b3c4d"), or null */
export function reviewedHash(section: string): string | null {
  return section.match(/^-? ?Reviewed:.*\bcard ([0-9a-f]{8})\b/m)?.[1] ?? null;
}

/** A card with a run recorded (Run or Result line) */
export function hasRun(section: string): boolean {
  return /^-? ?(Run|Result)\b/m.test(section);
}

/** The test designer's read of the result against the card as written, recorded after the run */
export function hasAfterCheck(section: string): boolean {
  return /^-? ?Checked after:.*test designer/im.test(section);
}

/** The log with this card's Reviewed line stamped with the card's current hash (replacing an older stamp) */
export function stampReviewed(log: string, title: string): string {
  const parts = log.split('\n### ');
  const i = parts.findIndex((s) => s.startsWith(title));
  if (i < 0) throw new Error(`no card "${title}"`);
  const section = parts[i];
  if (!/^-? ?Reviewed: *\S/m.test(section)) throw new Error('card has no Reviewed line');
  if (/^-? ?Reviewed: *pending/im.test(section)) throw new Error('card not reviewed yet (Reviewed: pending)');
  const hash = cardHash(section);
  parts[i] = section.replace(/^(-? ?Reviewed:.*?)( · card [0-9a-f]{8})?$/m, `$1 · card ${hash}`);
  return parts.join('\n### ');
}

/** What is wrong with a stamped card; nothing for a card with no stamp (older cards are left alone) */
export function cardProblems(section: string): string[] {
  const stamped = reviewedHash(section);
  if (!stamped) return [];
  const out: string[] = [];
  if (stamped !== cardHash(section)) out.push(`design lines changed since the review (stamped ${stamped}, now ${cardHash(section)}): re-review and re-stamp`);
  if (hasRun(section) && !hasAfterCheck(section)) out.push('run recorded without a "Checked after: test designer" line');
  return out;
}

/** Why a test may not start on this card, or null when it may (startTest's gate; docs/prompt-testing.md → The card) */
export function cardRefusal(log: string, title: string): string | null {
  const at = cardSection(log, title);
  if (!at) return 'no card in docs/prompt-trials.md';
  const missing = ['Serves', 'Type', 'Unit', 'Variable', 'Held constant', 'Measure', 'Fact or judgment', 'Hypothesis', 'Other outcomes', 'Size', 'Time', 'Reviewed']
    .filter((k) => !new RegExp(`^-? ?${k}: *\\S`, 'm').test(at));
  if (missing.length) return `card missing ${missing.join(', ')}`;
  if (/^-? ?Reviewed: *pending/im.test(at)) return 'card not reviewed yet (Reviewed: pending)';
  // The review is locked to the card: a card changed after its review needs a new one
  const stamped = reviewedHash(at);
  if (!stamped) return 'review not recorded on the card: after the test designer reviews it, run npm run card:review -- "<title>"';
  if (stamped !== cardHash(at)) return `the card changed since its review (stamped ${stamped}, now ${cardHash(at)}): review it again, then npm run card:review`;
  const minutes = Number(at.match(/^-? ?Time:\D*(\d+)/m)?.[1] ?? 0);
  if (minutes > 5 && !/Josh: yes/.test(at)) return `${minutes} min needs Josh: yes on the card`;
  return null;
}
