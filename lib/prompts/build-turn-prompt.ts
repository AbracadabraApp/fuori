/**
 * Builds the prompt for one conversation turn from the template in
 * content/it/prompts/character.md (the source of truth, with its own version
 * and changelog). This file only fills in the placeholders.
 *
 * Server-side only (reads the template from disk).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { CharacterSheet, Turn } from '../types';

interface BuildTurnPromptParams {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
}

interface TurnPrompt {
  system: string;
  user: string;
  version: string;
}

interface Template {
  version: string;
  system: string;
  firstTurn: string;
  laterTurns: string;
}

const TEMPLATE_PATH = join(process.cwd(), 'content', 'it', 'prompts', 'character.md');

let cached: Template | null = null;

/** Parse the markdown template: version line plus the fenced block under each heading. */
export function loadTemplate(): Template {
  if (cached) return cached;
  const md = readFileSync(TEMPLATE_PATH, 'utf8');
  const version = md.match(/^version:\s*(\S+)/m)?.[1];
  const block = (heading: string) => {
    const re = new RegExp(`^## ${heading}\\s*\\n+\`\`\`\\n([\\s\\S]*?)\\n\`\`\``, 'm');
    const m = md.match(re);
    if (!m) throw new Error(`character.md: missing "## ${heading}" block`);
    return m[1];
  };
  if (!version) throw new Error('character.md: missing "version:" line');
  cached = { version, system: block('System prompt'), firstTurn: block('First turn'), laterTurns: block('Later turns') };
  return cached;
}

/** Replace {placeholders}; drop lines whose placeholders were all empty; tidy blank lines. */
function fill(template: string, values: Record<string, string>): string {
  const lines = template.split('\n').flatMap((line) => {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k in values);
    if (keys.length && keys.every((k) => !values[k])) return []; // optional line with nothing to say
    return [line.replace(/\{(\w+)\}/g, (whole, k) => (k in values ? values[k] : whole))];
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Version of the character prompt in use (from character.md). */
export function promptVersion(): string {
  return loadTemplate().version;
}

export function buildTurnPrompt(params: BuildTurnPromptParams): TurnPrompt {
  const { character, transcript, learnerSaid } = params;
  const t = loadTemplate();

  const english =
    character.englishAbility === 'fluent'
      ? 'You speak fluent English.'
      : character.englishAbility === 'basic'
        ? 'You speak basic English.'
        : '';

  const system = fill(t.system, {
    name: character.name,
    age: String(character.age),
    role: character.role,
    city: character.city,
    setting: character.appearance?.setting ?? '',
    traits: character.personality.traits.join(', '),
    formality: character.speech.formality === 'Lei' ? 'Lei (formal)' : 'tu (informal)',
    english,
    // Filled by character memory once it exists (see character.md)
    relationship: "You haven't met them before.",
  });

  const user =
    transcript.length === 0
      ? t.firstTurn.trim()
      : fill(t.laterTurns, {
          transcript: transcript.map((turn) => `${turn.who === 'npc' ? 'You' : 'Them'}: ${turn.transcript}`).join('\n'),
          learnerSaid: learnerSaid ?? '',
        });

  return { system, user, version: t.version };
}
