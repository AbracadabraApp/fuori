// A prompt file's text with its changelog put back (the changelogs live in
// content/<country>/prompts/changelog/<name>.md since 2026-11-08, so the live
// files hold only what Claude can be sent). The checks that look for the newest
// changelog entry read through this, whichever way a file is laid out.
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export function readPromptWithChangelog(path: string): string {
  const md = readFileSync(path, 'utf8');
  const log = join(dirname(path), 'changelog', basename(path));
  return existsSync(log) ? `${md}\n## Changelog\n${readFileSync(log, 'utf8')}` : md;
}
