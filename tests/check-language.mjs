// Fails if language-specific text is hard-coded in app/ or lib/ instead of coming
// from content/<lang>/language.ts, or if a prompt template names the language
// instead of using {language}. Same idea as test:models for model IDs.
// Rule: CLAUDE.md and docs/05-architecture.md → "Keeping other languages possible".
// Prompted by the Whisper hint ("Trascrizione in italiano…") that slipped into
// /api/transcribe and was echoed into learners' lines (2026-10-12).
//
// It only looks for the language's own markers, never for phrases learners or
// characters might say: language names, the bare code 'it', locale codes like
// it-IT. Comments are ignored, and so are the reply's { it, en } field names.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const LANGUAGE_NAMES = /\b(Italian|Italiano|Italiana|Italiani|Italiane|Italia|Italy)\b/i;
const BARE_CODE = /(['"`])it\1/;
const LOCALE = /\bit[-_]IT\b/;
// The reply's field names: ['it', 'en'], { 'it': …, 'en': … }
const FIELD_NAMES = /(['"])it\1\s*,\s*(['"])en\2|(['"])it\3\s*:/g;

/** Code with comments blanked out (line numbers kept). Good enough for our files. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[\s;,(){}])\/\/.*$/gm, '$1')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '));
}

const files = execSync("git ls-files -- 'app/*.ts' 'app/*.tsx' 'lib/*.ts' 'lib/*.tsx' 'lib/*.mjs'", { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const problems = [];
for (const file of files) {
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((raw, i) => {
    const line = raw.replace(FIELD_NAMES, '');
    for (const [what, re] of [['language name', LANGUAGE_NAMES], ["language code 'it'", BARE_CODE], ['locale code', LOCALE]]) {
      const m = line.match(re);
      if (m) problems.push(`${file}:${i + 1}: ${what} "${m[0]}": ${raw.trim().slice(0, 100)}`);
    }
  });
}

// Prompt templates: the fenced blocks are what Claude gets; they say {language}
const prompts = execSync("git ls-files -- 'content/*/prompts/*.md'", { encoding: 'utf8' }).split('\n').filter(Boolean);
for (const file of prompts) {
  const blocks = [...readFileSync(file, 'utf8').matchAll(/^```\n([\s\S]*?)\n```/gm)].map((m) => m[1]).join('\n');
  const m = blocks.match(LANGUAGE_NAMES);
  if (m) problems.push(`${file}: a prompt block names the language ("${m[0]}"); use {language}`);
}

if (problems.length) {
  console.error(
    'Language-specific text outside content/ (move it to content/<lang>/language.ts and read it from there):\n' + problems.join('\n')
  );
  process.exit(1);
}
console.log(`OK: no language names or codes hard-coded in app/ or lib/ (${files.length} files), and prompt templates say {language}`);
