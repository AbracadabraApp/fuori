// The image script reads the city files with a regex, not by importing them.
// Its portrait pattern stopped at the first apostrophe, so a double-quoted prompt
// like "a waiter's jacket" went to the image model cut short ("…in a waiter"):
// Sergio at Caesar's came out a grey studio portrait four times (2026-11-14), and
// 29 portraits in both countries had been drawn from cut prompts.
// This runs the script's --dry and checks every portrait prompt arrives whole.
// COUNTRY=es-mx npm run test:image-prompts for Mexico.
import { execFileSync } from 'child_process';
import { cities, country } from '@/content';

const out = execFileSync('node', ['scripts/generate-images.mjs', '--type', 'portrait', '--force', '--dry'], {
  env: { ...process.env, COUNTRY: country },
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

// Each prompt is printed as "[city/id]" then the prompt on the next line
const sent = new Map<string, string>();
const lines = out.split('\n');
lines.forEach((line, i) => {
  const key = line.match(/^\[([^\]]+)\]$/)?.[1];
  if (key) sent.set(key, lines[i + 1] ?? '');
});

const failures: string[] = [];
let checked = 0;
for (const city of cities) {
  for (const person of city.characters ?? []) {
    if (!person.portraitPrompt) continue;
    checked++;
    const prompt = sent.get(`${city.id}/${person.id}`);
    if (prompt === undefined) failures.push(`${city.id}/${person.id}: no prompt sent`);
    else if (!prompt.startsWith(person.portraitPrompt)) {
      failures.push(`${city.id}/${person.id}: sent ${prompt.length} characters, the prompt has ${person.portraitPrompt.length}`);
    }
  }
}

if (failures.length) {
  console.error(`✗ ${failures.length} portrait prompt(s) not sent whole (${country}):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${checked} portrait prompts sent whole (${country})`);
