// Fails if a Claude model ID is hard-coded outside lib/claude.ts.
// Catches the bug where a retired model ID made /api/turn return 404 and Giulia went silent.
import { execSync } from 'node:child_process';

const out = execSync(
  "git grep -nE \"model: *'claude-\" -- '*.ts' '*.tsx' '*.mjs' ':!lib/claude.ts' || true",
  { encoding: 'utf8' }
).trim();

if (out) {
  console.error('Hard-coded Claude model IDs found. Import CLAUDE_MODEL from lib/claude.ts instead:\n' + out);
  process.exit(1);
}
console.log('OK: no hard-coded Claude model IDs outside lib/claude.ts');
