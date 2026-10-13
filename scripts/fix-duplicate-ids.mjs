#!/usr/bin/env node
/**
 * Fix duplicate place and character IDs across cities in the active pack.
 *
 * Problem: 26 IDs are used 70 times, causing image/memory/voice collisions.
 * Solution: Keep first use, rename later uses to `<id>-<city>`.
 *
 * Usage:
 *   node scripts/fix-duplicate-ids.mjs              # dry run, shows what would change
 *   node scripts/fix-duplicate-ids.mjs --write      # apply renames to city files
 *   railway run node scripts/fix-duplicate-ids.mjs --db  # fix database (after --write)
 *
 * See docs/duplicate-ids-fix.md for the full plan.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const WRITE = process.argv.includes('--write');
const DB = process.argv.includes('--db');

// Read city files from the active pack
const country = process.env.COUNTRY || 'it';
const citiesDir = join(process.cwd(), `content/${country}/cities`);
const cityFiles = readdirSync(citiesDir)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

console.log(`Checking ${cityFiles.length} cities in ${country} pack...\n`);

// Parse each city file to extract place and character IDs
const placeIds = new Map(); // id -> [city, city, ...]
const characterIds = new Map();

cityFiles.forEach(filename => {
  const cityId = filename.replace('.ts', '');
  const filepath = join(citiesDir, filename);
  const content = readFileSync(filepath, 'utf8');

  // Extract all id: 'value' pairs
  // Places are in the places array, characters are in the characters array
  const placeSection = content.match(/places: \[([\s\S]*?)\n  \],/);
  const charSection = content.match(/characters: \[([\s\S]*?)\n  \],/);

  if (placeSection) {
    const idMatches = placeSection[1].matchAll(/\bid: '([^']+)'/g);
    for (const match of idMatches) {
      const id = match[1];
      if (!placeIds.has(id)) placeIds.set(id, []);
      placeIds.get(id).push(cityId);
    }
  }

  if (charSection) {
    const idMatches = charSection[1].matchAll(/\bid: '([^']+)'/g);
    for (const match of idMatches) {
      const id = match[1];
      if (!characterIds.has(id)) characterIds.set(id, []);
      characterIds.get(id).push(cityId);
    }
  }
});

// Filter to only duplicates
const duplicatePlaces = Array.from(placeIds.entries())
  .filter(([_, cities]) => cities.length > 1)
  .sort((a, b) => b[1].length - a[1].length); // most duplicated first

const duplicateCharacters = Array.from(characterIds.entries())
  .filter(([_, cities]) => cities.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Found ${duplicatePlaces.length} duplicate place IDs (${duplicatePlaces.reduce((sum, [_, c]) => sum + c.length, 0)} total uses)`);
console.log(`Found ${duplicateCharacters.length} duplicate character IDs (${duplicateCharacters.reduce((sum, [_, c]) => sum + c.length, 0)} total uses)\n`);

if (duplicatePlaces.length === 0 && duplicateCharacters.length === 0) {
  console.log('✓ No duplicates found! Pack is clean.');
  process.exit(0);
}

// Build rename map: { cityId: { places: { oldId: newId }, characters: { oldId: newId } } }
const renameMap = {};

duplicatePlaces.forEach(([placeId, cityList]) => {
  // Keep first city, rename the rest
  cityList.slice(1).forEach(cityId => {
    if (!renameMap[cityId]) renameMap[cityId] = { places: {}, characters: {} };
    renameMap[cityId].places[placeId] = `${placeId}-${cityId}`;
  });
});

duplicateCharacters.forEach(([charId, cityList]) => {
  cityList.slice(1).forEach(cityId => {
    if (!renameMap[cityId]) renameMap[cityId] = { places: {}, characters: {} };
    renameMap[cityId].characters[charId] = `${charId}-${cityId}`;
  });
});

// Print rename map
console.log('=== Rename Map ===\n');
Object.entries(renameMap).forEach(([cityId, renames]) => {
  console.log(`${cityId}:`);
  Object.entries(renames.places).forEach(([old, newId]) => {
    console.log(`  place: ${old} → ${newId}`);
  });
  Object.entries(renames.characters).forEach(([old, newId]) => {
    console.log(`  character: ${old} → ${newId}`);
  });
  console.log('');
});

const totalRenames = Object.values(renameMap).reduce(
  (sum, r) => sum + Object.keys(r.places).length + Object.keys(r.characters).length,
  0
);

console.log(`Total: ${totalRenames} renames across ${Object.keys(renameMap).length} cities\n`);

if (!WRITE && !DB) {
  console.log('Dry run complete. Use --write to apply renames to city files.');
  process.exit(0);
}

if (WRITE) {
  console.log('=== Applying Renames ===\n');

  let filesChanged = 0;

  Object.entries(renameMap).forEach(([cityId, renames]) => {
    const cityFile = join(citiesDir, `${cityId}.ts`);
    let content = readFileSync(cityFile, 'utf8');
    const original = content;

    // Rename place IDs and characterId references
    Object.entries(renames.places).forEach(([oldId, newId]) => {
      // In places array: id: 'old-id'
      content = content.replace(
        new RegExp(`(\\bid: ')${oldId}(')`,'g'),
        `$1${newId}$2`
      );
      // characterId references in places: characterId: 'old-id'
      content = content.replace(
        new RegExp(`(characterId: ')${oldId}(')`,'g'),
        `$1${newId}$2`
      );
    });

    // Rename character IDs and placeId references
    Object.entries(renames.characters).forEach(([oldId, newId]) => {
      // In characters array: id: 'old-id'
      content = content.replace(
        new RegExp(`(\\bid: ')${oldId}(')`,'g'),
        `$1${newId}$2`
      );
      // placeId references in characters: placeId: 'old-id'
      content = content.replace(
        new RegExp(`(placeId: ')${oldId}(')`,'g'),
        `$1${newId}$2`
      );
    });

    if (content !== original) {
      writeFileSync(cityFile, content);
      filesChanged++;
      console.log(`✓ ${cityId}.ts`);
    }
  });

  console.log(`\n✓ Updated ${filesChanged} city files`);
  console.log('\nNext steps:');
  console.log('1. Run: npm run test:pack (should now pass with no duplicates)');
  console.log('2. Generate missing images for renamed places/characters');
  console.log('3. Run: npm run test:images (should pass with no missing images)');
  console.log('4. Fix database: railway run node scripts/fix-duplicate-ids.mjs --db');
}

if (DB) {
  console.log('\n=== Fixing Database ===\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Run this with: railway run node scripts/fix-duplicate-ids.mjs --db');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  let conversationsFixed = 0;
  let memoriesFixed = 0;

  // Fix conversations table
  for (const [cityId, renames] of Object.entries(renameMap)) {
    // Fix place_id
    for (const [oldId, newId] of Object.entries(renames.places)) {
      const result = await client.query(
        'UPDATE conversations SET place_id = $1 WHERE city_id = $2 AND place_id = $3',
        [newId, cityId, oldId]
      );
      if (result.rowCount > 0) {
        console.log(`✓ Updated ${result.rowCount} conversations: ${oldId} → ${newId} in ${cityId}`);
        conversationsFixed += result.rowCount;
      }
    }

    // Fix character_id
    for (const [oldId, newId] of Object.entries(renames.characters)) {
      const result = await client.query(
        'UPDATE conversations SET character_id = $1 WHERE city_id = $2 AND character_id = $3',
        [newId, cityId, oldId]
      );
      if (result.rowCount > 0) {
        console.log(`✓ Updated ${result.rowCount} conversations: ${oldId} → ${newId} in ${cityId}`);
        conversationsFixed += result.rowCount;
      }
    }
  }

  // Fix character_memories: only move memory when conversations with this learner were in the renamed city
  for (const [cityId, renames] of Object.entries(renameMap)) {
    for (const [oldId, newId] of Object.entries(renames.characters)) {
      // Find learners who talked to this character in this specific city
      const learnersResult = await client.query(
        'SELECT DISTINCT learner_id FROM conversations WHERE city_id = $1 AND character_id = $2',
        [cityId, oldId]
      );

      for (const row of learnersResult.rows) {
        const learnerId = row.learner_id;

        // Check if memory exists with old ID
        const memoryCheck = await client.query(
          'SELECT * FROM character_memories WHERE learner_id = $1 AND character_id = $2',
          [learnerId, oldId]
        );

        if (memoryCheck.rowCount > 0) {
          // Memory exists - need to move it to new ID
          const memory = memoryCheck.rows[0];

          // Insert with new ID
          await client.query(
            `INSERT INTO character_memories (learner_id, character_id, visits, last_seen, notes, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (learner_id, character_id) DO UPDATE SET
               visits = EXCLUDED.visits,
               last_seen = EXCLUDED.last_seen,
               notes = EXCLUDED.notes,
               updated_at = EXCLUDED.updated_at`,
            [learnerId, newId, memory.visits, memory.last_seen, memory.notes, memory.updated_at]
          );

          // Delete old memory
          await client.query(
            'DELETE FROM character_memories WHERE learner_id = $1 AND character_id = $2',
            [learnerId, oldId]
          );

          console.log(`✓ Moved memory for learner ${learnerId.slice(0, 8)}...: ${oldId} → ${newId}`);
          memoriesFixed++;
        }
      }
    }
  }

  await client.end();

  console.log(`\n✓ Fixed ${conversationsFixed} conversation records`);
  console.log(`✓ Moved ${memoriesFixed} character memories`);
  console.log('\nDatabase update complete!');
}
