#!/usr/bin/env node
/**
 * Check production database for records with old (pre-rename) IDs
 */

import pg from 'pg';

// Map of old_id → cities where it was renamed
const renamedPlaces = {
  'farmacia-centrale': ['taormina', 'lecce', 'milano', 'siena', 'napoli', 'verona', 'assisi', 'palermo', 'bergamo', 'torino', 'orvieto'],
  'mercato-coperto': ['assisi', 'orvieto', 'mantova'],
  'mercato-contadino': ['lecce', 'orvieto'],
  'stazione-centrale': ['bologna', 'palermo'],
  'basilica-santa-croce': ['lecce'],
  'caffe-duomo': ['assisi'],
  'villa-comunale': ['lecce'],
  'giardini-pubblici': ['orvieto'],
  'enoteca-italiana': ['bologna'],
  'mercato-erbe': ['mantova'],
  'bar-centrale': ['orvieto'],
  'enoteca-bacco': ['siracusa'],
  'orto-botanico': ['lucca'],
  'palazzo-ducale': ['mantova'],
  'bar-duomo': ['orvieto'],
};

const renamedCharacters = {
  'padre-giovanni': ['venezia', 'assisi'],
  'suor-teresa': ['milano', 'palermo'],
  'suor-margherita': ['genova', 'lucca'],
  'dottoressa-martini': ['assisi', 'orvieto'],
  'padre-leonardo': ['palermo'],
  'andrea-colombo': ['genova'],
  'beatrice-libri': ['siracusa'],
  'don-giuseppe': ['mantova'],
  'suor-maria': ['mantova'],
  'elena-marchetti': ['lucca'],
  'dottoressa-carla': ['genova'],
};

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function check() {
  await client.connect();

  let totalAffected = 0;

  console.log('=== Checking for affected database records ===\n');

  // Check places
  console.log('Places:');
  for (const [oldId, cities] of Object.entries(renamedPlaces)) {
    for (const city of cities) {
      const result = await client.query(
        'SELECT COUNT(*) FROM conversations WHERE city_id = $1 AND place_id = $2',
        [city, oldId]
      );
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`  ${oldId} in ${city}: ${count} conversations (should be ${oldId}-${city})`);
        totalAffected += count;
      }
    }
  }

  // Check characters
  console.log('\nCharacters:');
  for (const [oldId, cities] of Object.entries(renamedCharacters)) {
    for (const city of cities) {
      const convs = await client.query(
        'SELECT COUNT(*) FROM conversations WHERE city_id = $1 AND character_id = $2',
        [city, oldId]
      );
      const mems = await client.query(
        'SELECT COUNT(*) FROM character_memories WHERE character_id = $2 AND learner_id IN (SELECT DISTINCT learner_id FROM conversations WHERE city_id = $1 AND character_id = $2)',
        [city, oldId]
      );
      const convCount = parseInt(convs.rows[0].count);
      const memCount = parseInt(mems.rows[0].count);

      if (convCount > 0 || memCount > 0) {
        console.log(`  ${oldId} in ${city}: ${convCount} conversations, ${memCount} memories (should be ${oldId}-${city})`);
        totalAffected += convCount + memCount;
      }
    }
  }

  await client.end();

  console.log(`\n=== Total affected records: ${totalAffected} ===`);

  if (totalAffected === 0) {
    console.log('\n✓ No database records need fixing!');
  } else {
    console.log('\n⚠ Database fix needed.');
  }
}

check().catch(console.error);
