// Fails if language-specific text is hard-coded in app/ or lib/ instead of coming
// from content/<lang>/language.ts, or if a prompt template names the language
// instead of using {language}. Same idea as test:models for model IDs.
// Rule: CLAUDE.md and docs/05-architecture.md → "Keeping other languages possible".
// Prompted by the Whisper hint ("Trascrizione in italiano…") that slipped into
// /api/transcribe and was echoed into learners' lines (2026-10-12).
//
// It only looks for the languages' own markers, never for phrases learners or
// characters might say: language and country names, bare codes like 'it' and
// 'es', locale codes like it-IT and es-MX. Comments are ignored. It also fails
// when app/ or lib/ imports a country folder (content/it/…) instead of the
// active pack (@/content), which is what lets one codebase serve each country.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const LANGUAGE_NAMES = /\b(Italian|Italiano|Italiana|Italiani|Italiane|Italia|Italy|Spanish|Espa\u00f1ol|Espa\u00f1ola|M\u00e9xico|Mexico|Mexican|Mexicano|Mexicana)\b/i;
const BARE_CODE = /(['"`])(it|es|es-mx)\1/;
const LOCALE = /\b(it|es)[-_](IT|MX|ES)\b/i;
// A country folder imported directly instead of the active pack
const PACK_IMPORT = /from\s+['"]@\/content\/[^'"]+['"]|import\(\s*[`'"]@\/content\//;

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
    const line = raw;
    for (const [what, re] of [['language or country name', LANGUAGE_NAMES], ['language code', BARE_CODE], ['locale code', LOCALE], ['country folder import (use @/content)', PACK_IMPORT]]) {
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
