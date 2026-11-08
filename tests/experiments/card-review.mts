// Records that the test designer reviewed a card as it now stands: stamps its Reviewed line with the card's hash.
// Run it after the review, and again after any change to the card's design lines.
//   npm run card:review -- "C12 (2026-11-09)"
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stampReviewed, cardSection, cardHash } from './card.mjs';

const title = process.argv[2];
if (!title) { console.error('usage: npm run card:review -- "<card title>"'); process.exit(1); }
const path = join(process.cwd(), 'docs', 'prompt-trials.md');
const log = readFileSync(path, 'utf8');
try {
  writeFileSync(path, stampReviewed(log, title));
  console.log(`stamped "${title}" with card ${cardHash(cardSection(log, title)!)}`);
} catch (e) {
  console.error(`Not stamped: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
}
