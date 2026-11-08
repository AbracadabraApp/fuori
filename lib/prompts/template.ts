/**
 * Prompt templates live as markdown in content/<lang>/prompts/ (each with a
 * version line and a changelog). This reads one: the version plus the fenced
 * block under each "## Heading". Server-side only (reads from disk).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { pack } from '@/content';

export interface PromptFile {
  version: string;
  block: (heading: string) => string;
  /** A block's named parts ("## <heading> › <name>"), in file order; empty when it's one block */
  parts: (heading: string) => { name: string; text: string }[];
}

const cache = new Map<string, PromptFile>();

/**
 * Parts switched off, for experiments only (leave-one-out, docs/prompt-testing.md
 * → A1): "beginner.md" → part names to leave out of its blocks. Empty in the
 * game; nothing in lib or app sets it.
 */
const partsOff = new Map<string, Set<string>>();
export function setPartsOff(file: string, names: string[]): void {
  if (names.length) partsOff.set(file, new Set(names));
  else partsOff.delete(file);
}

/**
 * A prompt file's text replaced, for experiments only (a variant tested against
 * today's, docs/prompt-testing.md): "beginner.md" → a function from the file's
 * text to the variant's. Nothing in lib or app sets it; null puts it back.
 */
const overrides = new Map<string, (md: string) => string>();
export function setPromptOverride(file: string, edit: ((md: string) => string) | null): void {
  if (edit) overrides.set(file, edit);
  else overrides.delete(file);
  cache.delete(file);
}

export function readPromptFile(name: string): PromptFile {
  const hit = cache.get(name);
  if (hit) return hit;
  const raw = readFileSync(join(process.cwd(), 'content', pack.id, 'prompts', name), 'utf8');
  const md = overrides.get(name)?.(raw) ?? raw;
  const version = md.match(/^version:\s*(\S+)/m)?.[1];
  if (!version) throw new Error(`${name}: missing "version:" line`);
  // A block can be written as named parts, "## <heading> › <part>", one fenced
  // block each; the block is the parts joined in file order, so a prompt's text
  // is the same whether it's one block or many (Josh, 2026-11-07: every part
  // has a name, so a test can name the part it changes)
  const named = [...md.matchAll(/^## (.+?)\s*\n+```\n([\s\S]*?)\n```/gm)].map((m) => ({ heading: m[1], text: m[2] }));
  const parts = (heading: string) =>
    named.filter((b) => b.heading.startsWith(`${heading} › `)).map((b) => ({ name: b.heading.slice(heading.length + 3), text: b.text }));
  const block = (heading: string) => {
    const re = new RegExp(`^## ${heading}\\s*\\n+\`\`\`\\n([\\s\\S]*?)\\n\`\`\``, 'm');
    const m = md.match(re);
    if (m) return m[1];
    const p = parts(heading);
    if (!p.length) throw new Error(`${name}: missing "## ${heading}" block`);
    const off = partsOff.get(name);
    return p.filter((x) => !off?.has(x.name)).map((x) => x.text).join('\n');
  };
  const file = { version, block, parts };
  cache.set(name, file);
  return file;
}

/** Replace {placeholders}; drop lines whose placeholders were all empty; tidy blank lines. */
export function fill(template: string, values: Record<string, string>): string {
  const lines = template.split('\n').flatMap((line) => {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k in values);
    if (keys.length && keys.every((k) => !values[k])) return []; // optional line with nothing to say
    return [line.replace(/\{(\w+)\}/g, (whole, k) => (k in values ? values[k] : whole))];
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
