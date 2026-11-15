// D20 (docs/bugs.md B10): a character's notes once said "Her name is Joshua; she…" and "Ofelia calls her güerita and
// mi reina" (written 2026-10-24, before the address existed), and every later note copied them, so Ofelia kept calling
// Josh güerita whatever his address. The memory prompt now writes "they" and drops what the character calls them;
// this keeps that rule in both countries' prompt (measured: tests/experiments/memory-gender.mts).
import { readPromptFile } from '@/lib/prompts/template';
const s = readPromptFile('memory.md').block('System prompt');
const ok = /Call them "they", never "he" or "she"/.test(s) && /Drop any note about what \{name\} calls them/.test(s) && /rewrite any other note that says whether they're a man or a woman/.test(s);
if (!ok) { console.error('check-memory-gender: the memory prompt lost the rule that notes never say whether the learner is a man or a woman'); process.exit(1); }
console.log('OK: memory notes call the learner "they" and keep nothing that says man or woman');
