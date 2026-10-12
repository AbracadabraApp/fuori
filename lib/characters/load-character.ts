/**
 * Character loader: anchor characters (hand-written) from the active country
 * pack (content/index.ts). Generated characters (M2+) will come from storage.
 *
 * @example
 * ```typescript
 * import { loadCharacter, getAnchorCharacters } from '@/lib/characters';
 * const giulia = await loadCharacter('giulia');
 * const anchors = getAnchorCharacters(); // ['giulia', 'rita'] for Italy
 * ```
 */

import type { CharacterSheet } from '@/lib/types';
import { anchors } from '@/content';

/**
 * Load a character sheet by id. Anchors come from the active pack; generated
 * characters are not implemented yet (M2+).
 */
export async function loadCharacter(characterId: string): Promise<CharacterSheet> {
  const anchor = anchors[characterId];
  if (anchor) return anchor;
  // TODO (M2+): generated characters from database/storage
  throw new Error(`Character generation not yet implemented. Character '${characterId}' not found in anchor characters.`);
}

/** Ids of the active pack's anchor characters. */
export function getAnchorCharacters(): string[] {
  return Object.keys(anchors);
}

/** Same as getAnchorCharacters, kept for callers that await it. */
export async function getAnchorCharactersAsync(): Promise<string[]> {
  return getAnchorCharacters();
}
