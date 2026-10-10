/**
 * Character loader for Fuori.
 *
 * Loads anchor characters (hand-written) from content/it/characters/
 * and handles generated characters (M2+) from database/storage.
 *
 * @example
 * ```typescript
 * import { loadCharacter, getAnchorCharacters } from '@/lib/characters';
 *
 * // Load an anchor character
 * const giulia = await loadCharacter('giulia');
 * console.log(giulia.name); // "Giulia"
 * console.log(giulia.speech.formality); // "tu"
 *
 * // Get list of available anchor characters
 * const anchors = getAnchorCharacters();
 * console.log(anchors); // ['giulia', 'rita']
 * ```
 */

import { CharacterSheet } from '@/lib/types';
import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Load a character sheet by ID.
 *
 * For anchor characters (hand-written in content/it/characters/),
 * this loads and returns the character sheet directly.
 *
 * For generated characters (M2+), this will call Claude to generate
 * character sheets and save them to database/storage.
 *
 * @param characterId - The unique ID of the character to load
 * @returns Promise resolving to the character sheet
 * @throws Error if character file doesn't exist
 */
export async function loadCharacter(characterId: string): Promise<CharacterSheet> {
  // Try to load anchor character from content/it/characters/
  try {
    const anchorCharacter = await loadAnchorCharacter(characterId);
    if (anchorCharacter) {
      return anchorCharacter;
    }
  } catch (err) {
    // Not an anchor character, continue to generated character logic
  }

  // TODO (M2+): Handle generated characters
  // - Check database/storage for existing generated character
  // - If not found, call Claude to generate character sheet
  // - Save to database/storage
  // - Return character sheet
  throw new Error(
    `Character generation not yet implemented. Character '${characterId}' not found in anchor characters.`
  );
}

/**
 * Get list of all available anchor character IDs.
 * Anchor characters are hand-written character sheets in content/it/characters/.
 *
 * @returns Array of character IDs (e.g., ['giulia', 'rita'])
 */
export function getAnchorCharacters(): string[] {
  // For now, return hardcoded list based on known anchor characters
  // This avoids async file system operations for a simple getter
  return ['giulia', 'rita'];
}

/**
 * Get list of all available anchor character IDs (async version).
 * Reads the content/it/characters/ directory and returns all character IDs.
 *
 * @returns Promise resolving to array of character IDs
 */
export async function getAnchorCharactersAsync(): Promise<string[]> {
  const charactersDir = join(process.cwd(), 'content', 'it', 'characters');

  try {
    const files = await readdir(charactersDir);

    // Filter for .ts files and extract character IDs
    const characterIds = files
      .filter(file => file.endsWith('.ts') && file !== 'index.ts')
      .map(file => file.replace('.ts', ''));

    return characterIds;
  } catch (err) {
    console.error('Error reading anchor characters directory:', err);
    return [];
  }
}

/**
 * Load an anchor character from content/it/characters/.
 *
 * @param characterId - The ID of the anchor character
 * @returns Promise resolving to CharacterSheet or null if not found
 */
async function loadAnchorCharacter(characterId: string): Promise<CharacterSheet | null> {
  try {
    // Dynamic import of the character module
    const characterModule = await import(`@/content/it/characters/${characterId}`);

    // Character modules export a named export matching the character ID
    const character = characterModule[characterId] as CharacterSheet;

    if (!character) {
      throw new Error(`Character module '${characterId}' does not export character sheet`);
    }

    // Validate that this is an anchor character
    if (character.origin !== 'anchor') {
      throw new Error(
        `Character '${characterId}' is not an anchor character (origin: ${character.origin})`
      );
    }

    return character;
  } catch (err) {
    // Character file doesn't exist or failed to load
    return null;
  }
}
