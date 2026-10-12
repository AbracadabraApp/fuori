/**
 * Prompt templates live as markdown in content/<lang>/prompts/ (each with a
 * version line and a changelog). This reads one: the version plus the fenced
 * block under each "## Heading". Server-side only (reads from disk).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface PromptFile {
  version: string;
  block: (heading: string) => string;
}

const cache = new Map<string, PromptFile>();

export function readPromptFile(name: string): PromptFile {
  const hit = cache.get(name);
  if (hit) return hit;
  const md = readFileSync(join(process.cwd(), 'content', 'it', 'prompts', name), 'utf8');
  const version = md.match(/^version:\s*(\S+)/m)?.[1];
  if (!version) throw new Error(`${name}: missing "version:" line`);
  const block = (heading: string) => {
    const re = new RegExp(`^## ${heading}\\s*\\n+\`\`\`\\n([\\s\\S]*?)\\n\`\`\``, 'm');
    const m = md.match(re);
    if (!m) throw new Error(`${name}: missing "## ${heading}" block`);
    return m[1];
  };
  const file = { version, block };
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
