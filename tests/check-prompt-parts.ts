// Prompts written as named parts ("## System prompt › English: brief";
// lib/prompts/template.ts): every part has a name, names don't repeat, no part
// is empty, and the block a caller gets is the parts joined in order.
// No API calls.
import { readPromptFile } from '@/lib/prompts/template';
import { pack } from '@/content';

const problems: string[] = [];
for (const file of ['beginner.md', 'character.md']) {
  const f = readPromptFile(file);
  const parts = f.parts('System prompt');
  if (parts.length < 2) problems.push(`${file}: the system prompt isn't split into named parts`);
  const names = parts.map((p) => p.name);
  for (const n of names) if (names.indexOf(n) !== names.lastIndexOf(n)) problems.push(`${file}: part "${n}" appears twice`);
  for (const p of parts) if (!p.name.trim() || !p.text.trim()) problems.push(`${file}: an empty part or name ("${p.name}")`);
  if (f.block('System prompt') !== parts.map((p) => p.text).join('\n')) problems.push(`${file}: the system prompt isn't its parts in order`);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: ${pack.id} beginner.md and character.md are named parts, joined in order`);
