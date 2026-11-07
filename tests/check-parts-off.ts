// The leave-one-out switch (lib/prompts/template.ts → setPartsOff): a part
// switched off is left out of its block, the rest stay in order, and switching
// back gives the full prompt. No API calls.
import { readPromptFile, setPartsOff } from '@/lib/prompts/template';

const problems: string[] = [];
const f = readPromptFile('beginner.md');
const full = f.block('System prompt');
const parts = f.parts('System prompt');
const one = parts[3].name;
setPartsOff('beginner.md', [one]);
const without = f.block('System prompt');
if (without.includes(parts[3].text) || without !== parts.filter((p) => p.name !== one).map((p) => p.text).join('\n')) problems.push(`"${one}" switched off isn't left out cleanly`);
setPartsOff('beginner.md', []);
if (f.block('System prompt') !== full) problems.push('switching back does not give the full prompt');
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: a part ("${one}") can be switched off and back`);
