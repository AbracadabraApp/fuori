#!/usr/bin/env node
/**
 * Fix duplicate character display names by giving them unique Italian names.
 *
 * After fixing duplicate IDs, some characters still have identical display names
 * (e.g., two "Suor Teresa" nuns). This gives them distinct names.
 *
 * Usage:
 *   node scripts/fix-duplicate-names.mjs        # dry run
 *   node scripts/fix-duplicate-names.mjs --write # apply
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const WRITE = process.argv.includes('--write');

const country = process.env.COUNTRY || 'it';
const citiesDir = join(process.cwd(), `content/${country}/cities`);
const cityFiles = readdirSync(citiesDir)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

// Parse character names from city files
const charactersByName = new Map(); // name -> [{cityId, charId, fullData}]

cityFiles.forEach(filename => {
  const cityId = filename.replace('.ts', '');
  const filepath = join(citiesDir, filename);
  const content = readFileSync(filepath, 'utf8');

  const charSection = content.match(/characters: \[([\s\S]*?)\n  \],/);
  if (!charSection) return;

  // Parse each character block
  const chars = charSection[1].split(/\n\s*\},\s*\{/).map(block => {
    const idMatch = block.match(/id: '([^']+)'/);
    const nameMatch = block.match(/name: '([^']+)'/);
    const genderMatch = block.match(/gender: '([^']+)'/);
    const roleMatch = block.match(/role: '([^']+)'/);

    if (!idMatch || !nameMatch) return null;

    return {
      id: idMatch[1],
      name: nameMatch[1],
      gender: genderMatch?.[1],
      role: roleMatch?.[1],
      cityId
    };
  }).filter(Boolean);

  chars.forEach(char => {
    if (!charactersByName.has(char.name)) {
      charactersByName.set(char.name, []);
    }
    charactersByName.get(char.name).push(char);
  });
});

// Find duplicates
const duplicates = Array.from(charactersByName.entries())
  .filter(([_, chars]) => chars.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Found ${duplicates.length} duplicate character names\n`);

if (duplicates.length === 0) {
  console.log('✓ No duplicate names found!');
  process.exit(0);
}

// Italian name alternatives by role
const alternatives = {
  'Suor Teresa': ['Suor Anna', 'Suor Lucia', 'Suor Maria'],
  'Suor Margherita': ['Suor Rosa', 'Suor Chiara', 'Suor Beatrice'],
  'Padre Giovanni': ['Padre Marco', 'Padre Antonio'],
  'Padre Leonardo': ['Padre Francesco', 'Padre Domenico'],
  'Dottoressa Martini': ['Dottoressa Ricci', 'Dottoressa Colombo'],
  'Suor Maria': ['Suor Francesca', 'Suor Caterina'],
  'Elena Marchetti': ['Elena Moretti', 'Elena Conti'],
  'Andrea Colombo': ['Andrea Bellini', 'Andrea Ferrara'],
  'Beatrice Libri': ['Beatrice Rossi', 'Beatrice Marino'],
  'Don Giuseppe': ['Don Carlo', 'Don Stefano'],
  'Dottoressa Carla': ['Dottoressa Carla Bianchi', 'Dottoressa Carla Gentile'],
  'Matteo Galli': ['Matteo Serra', 'Matteo Vitale'],
  'Antonio Greco': ['Antonio Romano', 'Antonio Esposito'],
  'Carla Montanari': ['Carla Benedetti', 'Carla Lombardi'],
  'Chiara Fontana': ['Chiara Rossetti', 'Chiara Mancini'],
  'Francesca Vitale': ['Francesca Caruso', 'Francesca Russo'],
  'Salvatore Greco': ['Salvatore Messina', 'Salvatore Lombardo'],
  'Rosa Battaglia': ['Rosa Marino', 'Rosa Ferraro'],
};

// Build rename map
const renameMap = {}; // cityId -> { oldName: newName }

duplicates.forEach(([name, chars]) => {
  console.log(`${name} (${chars.length} uses):`);

  // Keep first use, rename the rest
  chars.forEach((char, i) => {
    if (i === 0) {
      console.log(`  ✓ ${char.cityId}/${char.id} - KEEP "${name}"`);
    } else {
      const newName = alternatives[name]?.[i - 1] || `${name} ${i + 1}`;
      console.log(`  → ${char.cityId}/${char.id} - RENAME to "${newName}"`);

      if (!renameMap[char.cityId]) renameMap[char.cityId] = {};
      renameMap[char.cityId][name] = newName;
    }
  });
  console.log('');
});

const totalRenames = Object.values(renameMap).reduce(
  (sum, m) => sum + Object.keys(m).length,
  0
);

console.log(`Total: ${totalRenames} renames across ${Object.keys(renameMap).length} cities\n`);

if (!WRITE) {
  console.log('Dry run complete. Use --write to apply renames.');
  process.exit(0);
}

console.log('=== Applying Renames ===\n');

let filesChanged = 0;

Object.entries(renameMap).forEach(([cityId, renames]) => {
  const cityFile = join(citiesDir, `${cityId}.ts`);
  let content = readFileSync(cityFile, 'utf8');
  const original = content;

  Object.entries(renames).forEach(([oldName, newName]) => {
    // Only rename in the name: field, not in comments or descriptions
    content = content.replace(
      new RegExp(`(name: ')${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(')`, 'g'),
      `$1${newName}$2`
    );
  });

  if (content !== original) {
    writeFileSync(cityFile, content);
    filesChanged++;
    console.log(`✓ ${cityId}.ts`);
  }
});

console.log(`\n✓ Updated ${filesChanged} city files`);
console.log('\nNext: Review the changes and commit if they look good.');
